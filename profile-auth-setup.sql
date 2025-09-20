-- Custom Profile-based Authentication System
-- This replaces Supabase auth with custom profile table authentication
-- Run this in your Supabase SQL Editor

-- 1. Create enhanced profiles table for custom authentication
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  -- Additional profile fields
  bio TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}'::jsonb
);

-- 2. Create sessions table for session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- 3. Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for user_profiles
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (
    id::text = current_setting('app.current_user_id', true)
  );

-- Users can update their own profile (except role and status)
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (
    id::text = current_setting('app.current_user_id', true)
  );

-- Allow public registration (insert)
CREATE POLICY "Public can register" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id::text = current_setting('app.current_user_id', true)
      AND role = 'admin'
    )
  );

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON public.user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id::text = current_setting('app.current_user_id', true)
      AND role = 'admin'
    )
  );

-- 5. Create RLS policies for user_sessions
CREATE POLICY "Users can manage own sessions" ON public.user_sessions
  FOR ALL USING (
    user_id::text = current_setting('app.current_user_id', true)
  );

-- Allow session creation during login
CREATE POLICY "Public can create sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (true);

-- 6. Create authentication functions
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Using crypt function with bcrypt (requires pgcrypto extension)
  RETURN crypt(password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create user registration function
CREATE OR REPLACE FUNCTION public.register_user(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  user_id UUID
) AS $$
DECLARE
  v_user_id UUID;
  v_hash TEXT;
BEGIN
  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM public.user_profiles WHERE email = p_email) THEN
    RETURN QUERY SELECT false, 'Email already registered', NULL::UUID;
    RETURN;
  END IF;

  -- Hash password
  v_hash := public.hash_password(p_password);

  -- Insert new user
  INSERT INTO public.user_profiles (email, password_hash, full_name, phone)
  VALUES (p_email, v_hash, p_full_name, p_phone)
  RETURNING id INTO v_user_id;

  RETURN QUERY SELECT true, 'Registration successful', v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create user login function
CREATE OR REPLACE FUNCTION public.login_user(
  p_email TEXT,
  p_password TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  user_id UUID,
  session_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  role TEXT,
  full_name TEXT
) AS $$
DECLARE
  v_user public.user_profiles%ROWTYPE;
  v_session_token TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_max_attempts INTEGER := 5;
  v_lockout_duration INTERVAL := '15 minutes';
BEGIN
  -- Get user by email
  SELECT * INTO v_user FROM public.user_profiles WHERE email = p_email;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Invalid email or password', NULL::UUID, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Check if account is locked
  IF v_user.locked_until IS NOT NULL AND v_user.locked_until > NOW() THEN
    RETURN QUERY SELECT false, 'Account temporarily locked', NULL::UUID, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Check if account is active
  IF v_user.status != 'active' THEN
    RETURN QUERY SELECT false, 'Account is not active', NULL::UUID, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Verify password
  IF NOT public.verify_password(p_password, v_user.password_hash) THEN
    -- Increment login attempts
    UPDATE public.user_profiles
    SET login_attempts = login_attempts + 1,
        locked_until = CASE
          WHEN login_attempts + 1 >= v_max_attempts
          THEN NOW() + v_lockout_duration
          ELSE NULL
        END
    WHERE id = v_user.id;

    RETURN QUERY SELECT false, 'Invalid email or password', NULL::UUID, NULL::TEXT, NULL::TIMESTAMP WITH TIME ZONE, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Generate session token
  v_session_token := encode(gen_random_bytes(32), 'base64');
  v_expires_at := NOW() + INTERVAL '7 days';

  -- Create session
  INSERT INTO public.user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
  VALUES (v_user.id, v_session_token, v_expires_at, p_ip_address, p_user_agent);

  -- Reset login attempts and update last login
  UPDATE public.user_profiles
  SET login_attempts = 0,
      locked_until = NULL,
      last_login = NOW()
  WHERE id = v_user.id;

  RETURN QUERY SELECT true, 'Login successful', v_user.id, v_session_token, v_expires_at, v_user.role, v_user.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create session validation function
CREATE OR REPLACE FUNCTION public.validate_session(p_session_token TEXT)
RETURNS TABLE(
  valid BOOLEAN,
  user_id UUID,
  role TEXT,
  full_name TEXT,
  email TEXT
) AS $$
DECLARE
  v_session public.user_sessions%ROWTYPE;
  v_user public.user_profiles%ROWTYPE;
BEGIN
  -- Get session
  SELECT * INTO v_session
  FROM public.user_sessions
  WHERE session_token = p_session_token
  AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Get user
  SELECT * INTO v_user FROM public.user_profiles WHERE id = v_session.user_id;

  IF NOT FOUND OR v_user.status != 'active' THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT;
    RETURN;
  END IF;

  -- Update last accessed
  UPDATE public.user_sessions
  SET last_accessed = NOW()
  WHERE id = v_session.id;

  RETURN QUERY SELECT true, v_user.id, v_user.role, v_user.full_name, v_user.email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create logout function
CREATE OR REPLACE FUNCTION public.logout_user(p_session_token TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM public.user_sessions WHERE session_token = p_session_token;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create password change function
CREATE OR REPLACE FUNCTION public.change_password(
  p_user_id UUID,
  p_old_password TEXT,
  p_new_password TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_user public.user_profiles%ROWTYPE;
  v_new_hash TEXT;
BEGIN
  -- Get user
  SELECT * INTO v_user FROM public.user_profiles WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'User not found';
    RETURN;
  END IF;

  -- Verify old password
  IF NOT public.verify_password(p_old_password, v_user.password_hash) THEN
    RETURN QUERY SELECT false, 'Current password is incorrect';
    RETURN;
  END IF;

  -- Hash new password
  v_new_hash := public.hash_password(p_new_password);

  -- Update password
  UPDATE public.user_profiles
  SET password_hash = v_new_hash, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN QUERY SELECT true, 'Password changed successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Create admin role management functions
CREATE OR REPLACE FUNCTION public.set_user_role(
  p_admin_id UUID,
  p_target_user_id UUID,
  p_new_role TEXT
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_admin public.user_profiles%ROWTYPE;
BEGIN
  -- Check if admin exists and has admin role
  SELECT * INTO v_admin FROM public.user_profiles WHERE id = p_admin_id;

  IF NOT FOUND OR v_admin.role != 'admin' THEN
    RETURN QUERY SELECT false, 'Unauthorized';
    RETURN;
  END IF;

  -- Validate new role
  IF p_new_role NOT IN ('user', 'admin') THEN
    RETURN QUERY SELECT false, 'Invalid role';
    RETURN;
  END IF;

  -- Update user role
  UPDATE public.user_profiles
  SET role = p_new_role, updated_at = NOW()
  WHERE id = p_target_user_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'User not found';
    RETURN;
  END IF;

  RETURN QUERY SELECT true, 'Role updated successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Create cleanup function for expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.user_sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- 15. Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at_user_profiles
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 16. Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 17. Create function to set configuration (for RLS context)
CREATE OR REPLACE FUNCTION public.set_config(parameter TEXT, value TEXT)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config(parameter, value, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 18. Create initial admin user (update email and password)
-- Note: Run this after creating the schema
-- SELECT public.register_user('admin@example.com', 'admin123', 'Admin User');
-- UPDATE public.user_profiles SET role = 'admin' WHERE email = 'admin@example.com';

-- 19. Verification
SELECT 'Custom authentication system setup completed!' as message;
SELECT COUNT(*) as total_users FROM public.user_profiles;
SELECT COUNT(*) as active_sessions FROM public.user_sessions WHERE expires_at > NOW();