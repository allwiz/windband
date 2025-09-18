-- Enhanced Supabase Setup for Admin Management System
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/dcwofyezpqkkqvxyfiol

-- 1. Update profiles table with admin roles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin', 'super_admin'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- 2. Create content management tables
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'image', 'html', 'json')),
  title TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page, section)
);

-- 3. Create announcements table
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create events/performances table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT DEFAULT 'concert' CHECK (event_type IN ('concert', 'rehearsal', 'audition', 'meeting', 'other')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  venue_details JSONB DEFAULT '{}',
  ticket_info JSONB DEFAULT '{}',
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed', 'postponed')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create member applications table (enhanced)
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS interview_scheduled TIMESTAMP WITH TIME ZONE;

-- 6. Create admin activity log
CREATE TABLE IF NOT EXISTS public.admin_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Set up Row Level Security for new tables
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for site_content
CREATE POLICY "Everyone can view published content" ON public.site_content
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage all content" ON public.site_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 9. Create RLS policies for announcements
CREATE POLICY "Everyone can view published announcements" ON public.announcements
  FOR SELECT USING (status = 'published' AND (scheduled_for IS NULL OR scheduled_for <= NOW()));

CREATE POLICY "Admins can manage all announcements" ON public.announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 10. Create RLS policies for events
CREATE POLICY "Everyone can view events" ON public.events
  FOR SELECT USING (status = 'scheduled');

CREATE POLICY "Admins can manage all events" ON public.events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 11. Create RLS policies for admin activity log
CREATE POLICY "Admins can view activity log" ON public.admin_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert activity log" ON public.admin_activity_log
  FOR INSERT WITH CHECK (true);

-- 12. Create RLS policies for profiles (admin access)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update member profiles" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 13. Create functions for admin operations
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'super_admin')
    FROM public.profiles
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Create function to log admin activity
CREATE OR REPLACE FUNCTION public.log_admin_activity(
  action TEXT,
  target_type TEXT,
  target_id UUID DEFAULT NULL,
  details JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.admin_activity_log (admin_id, action, target_type, target_id, details)
  VALUES (auth.uid(), action, target_type, target_id, details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 15. Update triggers for updated_at fields
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at_site_content
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_announcements
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_events
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 16. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_site_content_page_section ON public.site_content(page, section);
CREATE INDEX IF NOT EXISTS idx_announcements_status ON public.announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_scheduled ON public.announcements(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin_id ON public.admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON public.admin_activity_log(created_at);

-- 6. Create gallery items table
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  url TEXT NOT NULL,
  thumbnail TEXT, -- For video thumbnails
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security for gallery_items
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for gallery_items
CREATE POLICY "Everyone can view gallery items" ON public.gallery_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage all gallery items" ON public.gallery_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Create trigger for updated_at field
CREATE TRIGGER handle_updated_at_gallery_items
  BEFORE UPDATE ON public.gallery_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for gallery items
CREATE INDEX IF NOT EXISTS idx_gallery_items_type ON public.gallery_items(type);
CREATE INDEX IF NOT EXISTS idx_gallery_items_created_at ON public.gallery_items(created_at);

-- 17. Insert sample content (optional)
INSERT INTO public.site_content (page, section, content_type, title, content) VALUES
  ('home', 'hero_title', 'text', 'Hero Title', 'Global Mission Wind Band'),
  ('home', 'hero_subtitle', 'text', 'Hero Subtitle', 'Excellence in Musical Performance'),
  ('about', 'mission', 'html', 'Our Mission', '<p>To provide excellence in musical performance and foster community through wind ensemble music.</p>'),
  ('contact', 'email', 'text', 'Contact Email', 'info@gmwb.org'),
  ('contact', 'phone', 'text', 'Contact Phone', '(555) 123-4567')
ON CONFLICT (page, section) DO NOTHING;

-- Insert sample gallery items
INSERT INTO public.gallery_items (title, description, type, url, thumbnail) VALUES
  ('Holiday Concert 2024', 'Our annual holiday concert featuring classical and contemporary holiday favorites', 'photo', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', NULL),
  ('Concert Performance Highlights', 'Highlights from our recent performance featuring Holst''s "First Suite in E-flat"', 'video', 'dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'),
  ('Rehearsal Behind the Scenes', 'A glimpse into our weekly rehearsals at the community center', 'photo', 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', NULL),
  ('Wind Ensemble Masterclass', 'Recording of our masterclass session with renowned conductor Dr. Andrew Park', 'video', 'jNQXAC9IVRw', 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'),
  ('Spring Concert Series', 'Beautiful moments captured during our spring concert series at the park pavilion', 'photo', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', NULL),
  ('New Member Auditions', 'Welcoming new talented musicians to our ensemble family', 'photo', 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', NULL)
ON CONFLICT DO NOTHING;

-- 18. Create first admin user (replace with your email)
-- Note: This should be run after a user with this email has signed up
-- UPDATE public.profiles SET role = 'super_admin' WHERE email = 'your-admin-email@example.com';

-- Verification queries
SELECT 'Setup completed successfully!' as message;
SELECT COUNT(*) as total_profiles FROM public.profiles;
SELECT COUNT(*) as total_content FROM public.site_content;