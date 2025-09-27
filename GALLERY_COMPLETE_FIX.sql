-- Gallery Complete Fix - Handles missing columns carefully

-- Step 1: First, let's see exactly what columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'gallery_items'
ORDER BY ordinal_position;

-- Step 2: Add ALL columns we need (including category)
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
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS display_order INTEGER,
ADD COLUMN IF NOT EXISTS uploaded_by UUID,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Step 3: Show table structure after adding columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'gallery_items'
ORDER BY ordinal_position;

-- Step 4: Copy data from alternative columns if they exist
DO $$
BEGIN
    -- Check if 'url' column exists and copy to file_url
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'gallery_items' AND column_name = 'url') THEN
        UPDATE gallery_items
        SET file_url = url
        WHERE file_url IS NULL AND url IS NOT NULL;
        RAISE NOTICE 'Copied url to file_url';
    END IF;

    -- Check if 'image_url' column exists and copy to file_url
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'gallery_items' AND column_name = 'image_url') THEN
        UPDATE gallery_items
        SET file_url = image_url
        WHERE file_url IS NULL AND image_url IS NOT NULL;
        RAISE NOTICE 'Copied image_url to file_url';
    END IF;

    -- Check if 'photo_url' column exists and copy to file_url
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_name = 'gallery_items' AND column_name = 'photo_url') THEN
        UPDATE gallery_items
        SET file_url = photo_url
        WHERE file_url IS NULL AND photo_url IS NOT NULL;
        RAISE NOTICE 'Copied photo_url to file_url';
    END IF;
END $$;

-- Step 5: Extract file_path from file_url
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
  AND file_url IS NOT NULL;

-- Step 6: Fix all file_urls to be complete URLs
UPDATE gallery_items
SET file_url =
  CASE
    WHEN file_path IS NOT NULL AND file_path != '' THEN
      'https://dcwofyezpqkkqvxyfiol.supabase.co/storage/v1/object/public/gmwb_public/' ||
      CASE
        WHEN file_path LIKE '/%' THEN SUBSTRING(file_path FROM 2)
        WHEN file_path LIKE 'gmwb_public/%' THEN SUBSTRING(file_path FROM 13)
        ELSE file_path
      END
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
WHERE (type IN ('photo', 'image') OR type IS NULL)
  AND (file_url NOT LIKE 'https://dcwofyezpqkkqvxyfiol.supabase.co%' OR file_url IS NULL);

-- Step 7: Drop existing functions with all possible signatures
DROP FUNCTION IF EXISTS create_gallery_item(TEXT, TEXT, VARCHAR(50), TEXT, TEXT, BIGINT, VARCHAR(100), TEXT, TEXT, INTEGER, INTEGER, INTEGER, VARCHAR(50), TEXT[], BOOLEAN);
DROP FUNCTION IF EXISTS create_gallery_item(TEXT, TEXT, VARCHAR(50), TEXT, TEXT, BIGINT, VARCHAR(100), TEXT, TEXT, INTEGER, INTEGER, INTEGER, VARCHAR(50), TEXT[]);
DROP FUNCTION IF EXISTS create_gallery_item(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_gallery_item(TEXT);

DROP FUNCTION IF EXISTS update_gallery_item(BIGINT, TEXT, TEXT, VARCHAR(50), TEXT[], BOOLEAN, BOOLEAN, INTEGER);
DROP FUNCTION IF EXISTS update_gallery_item(BIGINT, TEXT, TEXT, VARCHAR(50), TEXT[], BOOLEAN, BOOLEAN);
DROP FUNCTION IF EXISTS update_gallery_item(BIGINT, TEXT, TEXT);
DROP FUNCTION IF EXISTS update_gallery_item(BIGINT);

DROP FUNCTION IF EXISTS delete_gallery_item(BIGINT);
DROP FUNCTION IF EXISTS delete_gallery_item(INTEGER);

-- Step 8: Create the functions we need
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

-- Step 10: Show final results
SELECT
  id,
  title,
  type,
  category,
  LEFT(file_path, 50) as file_path_preview,
  LEFT(file_url, 80) as file_url_preview,
  is_featured,
  is_published
FROM gallery_items
ORDER BY created_at DESC
LIMIT 10;

-- Step 11: Count how many records we have
SELECT COUNT(*) as total_items,
       COUNT(file_url) as items_with_url,
       COUNT(file_path) as items_with_path,
       COUNT(CASE WHEN file_url LIKE 'https://%' THEN 1 END) as items_with_full_url
FROM gallery_items;