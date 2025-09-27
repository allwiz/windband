-- Safe Gallery Fix Script
-- This script checks what exists before making changes

-- Step 1: First, let's see what columns we actually have
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'gallery_items'
ORDER BY ordinal_position;

-- Step 2: Check a sample of existing data
SELECT *
FROM gallery_items
LIMIT 3;

-- Step 3: Add ALL missing columns that we need
ALTER TABLE gallery_items
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS file_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS external_url TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS width INTEGER,
ADD COLUMN IF NOT EXISTS height INTEGER,
ADD COLUMN IF NOT EXISTS duration INTEGER,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Step 4: Check if we have any image data stored differently (like in url or image_url column)
-- This query will show us all columns and sample data
SELECT *
FROM gallery_items
LIMIT 5;

-- Step 5: If there's an 'url' or 'image_url' column, copy it to file_url
DO $$
BEGIN
    -- Check if 'url' column exists and copy to file_url
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'gallery_items' AND column_name = 'url') THEN
        UPDATE gallery_items
        SET file_url = url
        WHERE file_url IS NULL AND url IS NOT NULL;
    END IF;

    -- Check if 'image_url' column exists and copy to file_url
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'gallery_items' AND column_name = 'image_url') THEN
        UPDATE gallery_items
        SET file_url = image_url
        WHERE file_url IS NULL AND image_url IS NOT NULL;
    END IF;

    -- Check if 'photo_url' column exists and copy to file_url
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'gallery_items' AND column_name = 'photo_url') THEN
        UPDATE gallery_items
        SET file_url = photo_url
        WHERE file_url IS NULL AND photo_url IS NOT NULL;
    END IF;
END $$;

-- Step 6: Extract file_path from file_url if needed
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
WHERE file_path IS NULL OR file_path = '';

-- Step 7: Fix all file_urls to be complete URLs
UPDATE gallery_items
SET file_url =
  CASE
    -- If we have a file_path, generate the correct URL
    WHEN file_path IS NOT NULL AND file_path != '' THEN
      'https://dcwofyezpqkkqvxyfiol.supabase.co/storage/v1/object/public/gmwb_public/' ||
      CASE
        WHEN file_path LIKE '/%' THEN SUBSTRING(file_path FROM 2)
        WHEN file_path LIKE 'gmwb_public/%' THEN SUBSTRING(file_path FROM 13)
        ELSE file_path
      END
    -- If file_url exists but isn't a full URL, fix it
    WHEN file_url IS NOT NULL AND file_url NOT LIKE 'http%' THEN
      'https://dcwofyezpqkkqvxyfiol.supabase.co/storage/v1/object/public/gmwb_public/' ||
      CASE
        WHEN file_url LIKE '/%' THEN SUBSTRING(file_url FROM 2)
        WHEN file_url LIKE 'gmwb_public/%' THEN SUBSTRING(file_url FROM 13)
        ELSE file_url
      END
    ELSE
      file_url
  END
WHERE type IN ('photo', 'image') OR type IS NULL;

-- Step 8: Create or replace the stored procedures
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
  -- Get the current user ID (if auth is enabled)
  BEGIN
    v_user_id := auth.uid();
  EXCEPTION
    WHEN OTHERS THEN
      v_user_id := NULL;
  END;

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

CREATE OR REPLACE FUNCTION delete_gallery_item(p_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM gallery_items WHERE id = p_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Grant permissions
GRANT EXECUTE ON FUNCTION create_gallery_item TO authenticated;
GRANT EXECUTE ON FUNCTION update_gallery_item TO authenticated;
GRANT EXECUTE ON FUNCTION delete_gallery_item TO authenticated;

-- Step 10: Final check - show what we have now
SELECT
  id,
  title,
  type,
  category,
  file_path,
  file_url,
  external_url,
  is_featured,
  is_published,
  created_at
FROM gallery_items
ORDER BY created_at DESC
LIMIT 10;

-- Step 11: Show column structure after changes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'gallery_items'
ORDER BY ordinal_position;