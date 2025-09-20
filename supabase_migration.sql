-- Supabase migration to set up profiles table and admin user
-- Run this in Supabase Dashboard > SQL Editor

-- First, let's ensure the profiles table has the correct structure
-- (This may already exist, but we'll create it if not)

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'active',
  bio TEXT,
  joined_date TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Create a function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update existing user to admin if they exist
-- Replace 'allwiz@gmail.com' with the actual email if different
UPDATE public.profiles
SET role = 'admin', status = 'active'
WHERE email = 'allwiz@gmail.com';

-- If no profile exists yet, you can create one manually once the user signs up:
-- 1. Have the user sign up with allwiz@gmail.com through your app
-- 2. Then run this query:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'allwiz@gmail.com';

-- Create other necessary tables if they don't exist

-- Gallery items table
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  applicant_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  instrument TEXT,
  experience TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin activity log table
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access where appropriate
CREATE POLICY "Gallery items are viewable by everyone" ON public.gallery_items
  FOR SELECT USING (true);

CREATE POLICY "Events are viewable by everyone" ON public.events
  FOR SELECT USING (true);

-- Admin-only policies for applications and activity log
CREATE POLICY "Admins can view applications" ON public.applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can view activity log" ON public.admin_activity_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Admin-only policies for content management
CREATE POLICY "Admins can manage gallery" ON public.gallery_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Insert sample gallery item if none exists
INSERT INTO public.gallery_items (title, description, category)
SELECT 'Welcome to Global Mission Wind Band', 'Our first performance showcasing diverse musical traditions', 'performance'
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_items);

COMMENT ON TABLE public.profiles IS 'User profiles with role-based access control';
COMMENT ON TABLE public.gallery_items IS 'Gallery items for showcasing band activities';
COMMENT ON TABLE public.events IS 'Events and performances';
COMMENT ON TABLE public.applications IS 'Membership applications';
COMMENT ON TABLE public.admin_activity_log IS 'Admin activity tracking';