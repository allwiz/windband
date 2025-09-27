-- Drop and Fix Gallery - Removes ALL function versions then rebuilds

-- Step 1: Find ALL versions of the gallery functions
SELECT
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc
WHERE proname IN ('create_gallery_item', 'update_gallery_item', 'delete_gallery_item')
ORDER BY proname;

-- Step 2: Drop ALL versions using CASCADE (this will remove all overloads)
DO $$
DECLARE
    func_record RECORD;
BEGIN
    -- Drop all versions of create_gallery_item
    FOR func_record IN
        SELECT pg_get_function_identity_arguments(oid) as args
        FROM pg_proc
        WHERE proname = 'create_gallery_item'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS create_gallery_item(' || func_record.args || ') CASCADE';
        RAISE NOTICE 'Dropped create_gallery_item(%)', func_record.args;
    END LOOP;

    -- Drop all versions of update_gallery_item
    FOR func_record IN
        SELECT pg_get_function_identity_arguments(oid) as args
        FROM pg_proc
        WHERE proname = 'update_gallery_item'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS update_gallery_item(' || func_record.args || ') CASCADE';
        RAISE NOTICE 'Dropped update_gallery_item(%)', func_record.args;
    END LOOP;

    -- Drop all versions of delete_gallery_item
    FOR func_record IN
        SELECT pg_get_function_identity_arguments(oid) as args
        FROM pg_proc
        WHERE proname = 'delete_gallery_item'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS delete_gallery_item(' || func_record.args || ') CASCADE';
        RAISE NOTICE 'Dropped delete_gallery_item(%)', func_record.args;
    END LOOP;
END $$;

-- Step 3: Verify all functions are dropped
SELECT
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc
WHERE proname IN ('create_gallery_item', 'update_gallery_item', 'delete_gallery_item');

-- Step 4: Add missing columns to gallery_items
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

-- Step 5: Fix existing data
DO $$
BEGIN
    -- Copy from alternative columns if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_items' AND column_name = 'url') THEN
        UPDATE gallery_items SET file_url = url WHERE file_url IS NULL AND url IS NOT NULL;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_items' AND column_name = 'image_url') THEN
        UPDATE gallery_items SET file_url = image_url WHERE file_url IS NULL AND image_url IS NOT NULL;
    END IF;
END $$;

-- Extract file_path from file_url
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
WHERE (file_path IS NULL OR file_path = '') AND file_url IS NOT NULL;

-- Fix URLs to be complete
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

-- Step 6: Create ONE version of each function
CREATE FUNCTION create_gallery_item(
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
  BEGIN
    v_user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  INSERT INTO gallery_items (
    title, description, type, file_url, file_path, file_size, file_type,
    external_url, thumbnail_url, width, height, duration, category, tags,
    is_featured, uploaded_by, created_at, is_published, published_at
  ) VALUES (
    p_title, p_description, p_type, p_file_url, p_file_path, p_file_size, p_file_type,
    p_external_url, p_thumbnail_url, p_width, p_height, p_duration, p_category, p_tags,
    p_is_featured, v_user_id, NOW(), TRUE, NOW()
  )
  RETURNING id INTO v_item_id;

  RETURN v_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE FUNCTION update_gallery_item(
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
    published_at = CASE WHEN p_is_published = TRUE AND published_at IS NULL THEN NOW() ELSE published_at END,
    updated_at = NOW()
  WHERE id = p_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE FUNCTION delete_gallery_item(p_id BIGINT)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM gallery_items WHERE id = p_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Grant permissions
GRANT EXECUTE ON FUNCTION create_gallery_item TO authenticated;
GRANT EXECUTE ON FUNCTION update_gallery_item TO authenticated;
GRANT EXECUTE ON FUNCTION delete_gallery_item TO authenticated;

-- Step 8: Verify functions are created
SELECT
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc
WHERE proname IN ('create_gallery_item', 'update_gallery_item', 'delete_gallery_item');

-- Step 9: Show final data
SELECT
  id,
  title,
  type,
  category,
  LEFT(file_path, 40) as file_path_preview,
  LEFT(file_url, 60) as file_url_preview,
  is_featured,
  is_published
FROM gallery_items
ORDER BY created_at DESC
LIMIT 10;