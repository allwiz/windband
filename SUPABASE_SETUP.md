# Supabase Database Setup Instructions

## Database Tables Setup

Since Supabase automatically handles user authentication and creates the `auth.users` table, you typically don't need to create additional tables for basic authentication. However, if you want to extend user profiles or add band-specific data, you can create additional tables.

## Optional: User Profiles Table

If you want to store additional user information beyond what Supabase auth provides, you can create a `profiles` table:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  instrument TEXT,
  experience_level TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create policy for users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

## Optional: Band Member Applications Table

For tracking audition applications:

```sql
-- Create applications table
CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instrument TEXT NOT NULL,
  experience_years INTEGER,
  previous_bands TEXT,
  audition_piece TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  audition_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own applications
CREATE POLICY "Users can view own applications" ON applications FOR SELECT USING (auth.uid() = user_id);

-- Policy for users to create applications
CREATE POLICY "Users can create applications" ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## How to Execute These SQL Commands

1. Go to your Supabase project dashboard: https://app.supabase.com/project/dcwofyezpqkkqvxyfiol
2. Navigate to the "SQL Editor" tab
3. Copy and paste the SQL commands above
4. Click "Run" to execute them

## Authentication Setup

The authentication is already configured in the React app. Users can:

- Sign up with email/password
- Sign in with email/password
- Access protected routes (like /dashboard)
- Sign out

## Environment Variables (Optional)

For production, consider moving the Supabase configuration to environment variables:

Create a `.env` file:
```
VITE_SUPABASE_URL=https://dcwofyezpqkkqvxyfiol.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjd29meWV6cHFra3F2eHlmaW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDQ1ODIsImV4cCI6MjA3MzcyMDU4Mn0.ZX_Vg1kFXytTLQ8vuGwMgz-2hjsTz56baqAjOKZOa_Q
```

Then update `src/lib/supabase.js`:
```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
```

## Testing the Authentication

1. Start the development server: `npm run dev`
2. Navigate to `/login` or click "Member Login" in the header
3. Create a new account via `/signup`
4. Check your email for verification (if email verification is enabled)
5. Sign in and access the `/dashboard` route
6. Test sign out functionality

The authentication system is now fully functional!