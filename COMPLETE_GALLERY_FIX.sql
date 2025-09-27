-- Complete Gallery Fix Script
-- This script will fix the gallery_items table structure and URLs

-- Step 1: Check current table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'gallery_items'
ORDER BY ordinal_position;

-- Step 2: Add missing columns if they don't exist
ALTER TABLE gallery_items
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS file_type VARCHAR(100);

-- Step 3: Update or create the stored procedure for creating gallery items
CREATE OR REPLACE FUNCTION create_gallery_item(
  p_title TEXT,
  p_description TEXT DEFAULT '',
  p_type VARCHAR(50) DEFAULT 'photo',
  p_file_url TEXT DEFAULT NULL,
  p_file_path TEXT DEFAULT NULL,
  p_file_size BIGINT DEFAULT NULL,
  p_file_type VARCHAR(100) DEFAULT NULL,
  p_external_url TEXT DEFAULT NULL,
  p_thumbnail_url TEXT DEFAULT NULL,
  p_width INTEGER DEFAULT NULL,
  p_height INTEGER DEFAULT NULL,
  p_duration INTEGER DEFAULT NULL,
  p_category VARCHAR(50) DEFAULT 'general',
  p_tags TEXT[] DEFAULT NULL,
  p_is_featured BOOLEAN DEFAULT FALSE
)
RETURNS BIGINT AS $$
DECLARE
  v_item_id BIGINT;
  v_user_id UUID;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();

  -- Insert the gallery item
  INSERT INTO gallery_items (
    title,
    description,
    type,
    file_url,
    file_path,
    file_size,
    file_type,
    external_url,
    thumbnail_url,
    width,
    height,
    duration,
    category,
    tags,
    is_featured,
    uploaded_by,
    created_at,
    is_published,
    published_at
  ) VALUES (
    p_title,
    p_description,
    p_type,
    p_file_url,
    p_file_path,
    p_file_size,
    p_file_type,
    p_external_url,
    p_thumbnail_url,
    p_width,
    p_height,
    p_duration,
    p_category,
    p_tags,
    p_is_featured,
    v_user_id,
    NOW(),
    TRUE,
    NOW()
  )
  RETURNING id INTO v_item_id;

  RETURN v_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Update stored procedure for updating gallery items
CREATE OR REPLACE FUNCTION update_gallery_item(
  p_id BIGINT,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_category VARCHAR(50) DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_is_published BOOLEAN DEFAULT NULL,
  p_is_featured BOOLEAN DEFAULT NULL,
  p_display_order INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE gallery_items
  SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    category = COALESCE(p_category, category),
    tags = COALESCE(p_tags, tags),
    is_published = COALESCE(p_is_published, is_published),
    is_featured = COALESCE(p_is_featured, is_featured),
    display_order = COALESCE(p_display_order, display_order),
    published_at = CASE
      WHEN p_is_published = TRUE AND published_at IS NULL THEN NOW()
      ELSE published_at
    END,
    updated_at = NOW()
  WHERE id = p_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create function for deleting gallery items
CREATE OR REPLACE FUNCTION delete_gallery_item(p_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM gallery_items WHERE id = p_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Fix existing URLs in the database
-- First, populate file_path from file_url if needed
UPDATE gallery_items
SET file_path =
  CASE
    WHEN file_url LIKE '%/gmwb_public/%' THEN
      SUBSTRING(file_url FROM POSITION('/gmwb_public/' IN file_url) + 13)
    WHEN file_url IS NOT NULL AND file_url NOT LIKE 'http%' THEN
      file_url
    ELSE
      file_path
  END
WHERE (file_path IS NULL OR file_path = '')
  AND file_url IS NOT NULL
  AND type IN ('photo', 'image');

-- Step 7: Ensure all file_urls are complete URLs
UPDATE gallery_items
SET file_url =
  CASE
    WHEN file_path IS NOT NULL AND file_path != '' THEN
      'https://dcwofyezpqkkqvxyfiol.supabase.co/storage/v1/object/public/gmwb_public/' ||
      CASE
        WHEN file_path LIKE '/%' THEN SUBSTRING(file_path FROM 2)
        ELSE file_path
      END
    WHEN file_url IS NOT NULL AND file_url NOT LIKE 'http%' THEN
      'https://dcwofyezpqkkqvxyfiol.supabase.co/storage/v1/object/public/gmwb_public/' ||
      CASE
        WHEN file_url LIKE '/%' THEN SUBSTRING(file_url FROM 2)
        ELSE file_url
      END
    ELSE
      file_url
  END
WHERE type IN ('photo', 'image')
  AND (file_url NOT LIKE 'http%' OR file_url IS NULL);

-- Step 8: Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_gallery_item TO authenticated;
GRANT EXECUTE ON FUNCTION update_gallery_item TO authenticated;
GRANT EXECUTE ON FUNCTION delete_gallery_item TO authenticated;

-- Step 9: Verify the results
SELECT
  id,
  title,
  type,
  file_path,
  file_url,
  is_featured,
  is_published
FROM gallery_items
ORDER BY created_at DESC
LIMIT 10;