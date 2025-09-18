-- Gallery Items Table Setup for Supabase
-- Execute this in your Supabase SQL Editor: https://app.supabase.com/project/dcwofyezpqkkqvxyfiol

-- Create gallery_items table
CREATE TABLE gallery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video')),
  url TEXT NOT NULL, -- For photos: image URL, For videos: YouTube video ID
  thumbnail TEXT, -- Optional: custom thumbnail URL for videos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (anyone can view gallery items)
CREATE POLICY "Gallery items are viewable by everyone" ON gallery_items FOR SELECT USING (true);

-- Policy for authenticated users to insert gallery items (admin only in practice)
CREATE POLICY "Only authenticated users can insert gallery items" ON gallery_items FOR INSERT TO authenticated WITH CHECK (true);

-- Policy for authenticated users to update gallery items (admin only in practice)
CREATE POLICY "Only authenticated users can update gallery items" ON gallery_items FOR UPDATE TO authenticated USING (true);

-- Policy for authenticated users to delete gallery items (admin only in practice)
CREATE POLICY "Only authenticated users can delete gallery items" ON gallery_items FOR DELETE TO authenticated USING (true);

-- Insert sample data
INSERT INTO gallery_items (title, description, type, url, thumbnail) VALUES
  (
    'Holiday Concert 2024',
    'Our annual holiday concert featuring classical and contemporary holiday favorites',
    'photo',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    NULL
  ),
  (
    'Concert Performance Highlights',
    'Highlights from our recent performance featuring Holst''s "First Suite in E-flat"',
    'video',
    'dQw4w9WgXcQ',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Rehearsal Behind the Scenes',
    'A glimpse into our weekly rehearsals at the community center',
    'photo',
    'https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    NULL
  ),
  (
    'Wind Ensemble Masterclass',
    'Recording of our masterclass session with renowned conductor Dr. Andrew Park',
    'video',
    'jNQXAC9IVRw',
    'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Spring Concert Series',
    'Beautiful moments captured during our spring concert series at the park pavilion',
    'photo',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    NULL
  ),
  (
    'New Member Auditions',
    'Welcoming new talented musicians to our ensemble family',
    'photo',
    'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    NULL
  );

-- Create updated_at trigger function (if not already exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_gallery_items_updated_at
  BEFORE UPDATE ON gallery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();