-- Fix URL Constraint Issue

-- Step 1: Check current constraints on gallery_items
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'gallery_items'
AND column_name IN ('url', 'file_url', 'image_url')
ORDER BY ordinal_position;

-- Step 2: Remove NOT NULL constraint from url column if it exists
ALTER TABLE gallery_items
ALTER COLUMN url DROP NOT NULL;

-- Step 3: Check all columns and their constraints
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'gallery_items'
ORDER BY ordinal_position;

-- Step 4: Update the create_gallery_item function to handle the url column
DROP FUNCTION IF EXISTS create_gallery_item(TEXT, TEXT, VARCHAR(50), TEXT, TEXT, BIGINT, VARCHAR(100), TEXT, TEXT, INTEGER, INTEGER, INTEGER, VARCHAR(50), TEXT[], BOOLEAN) CASCADE;

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
  v_columns TEXT;
  v_values TEXT;
BEGIN
  -- Get current user if available
  BEGIN
    v_user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  -- Build dynamic insert based on existing columns
  v_columns := 'title, description, type, created_at, is_published, published_at';
  v_values := quote_literal(p_title) || ', ' ||
              quote_literal(p_description) || ', ' ||
              quote_literal(p_type) || ', NOW(), TRUE, NOW()';

  -- Add url column if it exists (copy from file_url)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_items' AND column_name = 'url') THEN
    v_columns := v_columns || ', url';
    v_values := v_values || ', ' || COALESCE(quote_literal(p_file_url), quote_literal(p_external_url), 'NULL');
  END IF;

  -- Add file_url if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_items' AND column_name = 'file_url') THEN
    v_columns := v_columns || ', file_url';
    v_values := v_values || ', ' || COALESCE(quote_literal(p_file_url), 'NULL');
  END IF;

  -- Add file_path if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_items' AND column_name = 'file_path') THEN
    v_columns := v_columns || ', file_path';
    v_values := v_values || ', ' || COALESCE(quote_literal(p_file_path), 'NULL');
  END IF;

  -- Add other columns if they exist
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_items' AND column_name = 'file_size') THEN
    v_columns := v_columns || ', file_size';
    v_values := v_values || ', ' || COALESCE(p_file_size::TEXT, 'NULL');
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_items' AND column_name = 'file_type') THEN
    v_columns := v_columns || ', file_type';
    v_values := v_values || ', ' || COALESCE(quote_literal(p_file_type), 'NULL');
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_items' AND column_name = 'external_url') THEN
    v_columns := v_columns || ', external_url';
    v_values := v_values || ', ' || COALESCE(quote_literal(p_external_url), 'NULL');
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_items' AND column_name = 'thumbnail_url') THEN
    v_columns := v_columns || ', thumbnail_url';
    v_values := v_values || ', ' || COALESCE(quote_literal(p_thumbnail_url), 'NULL');
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_items' AND column_name = 'width') THEN
    v_columns := v_columns || ', width';
    v_values := v_values || ', ' || COALESCE(p_width::TEXT, 'NULL');
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_items' AND column_name = 'height') THEN
    v_columns := v_columns || ', height';
    v_values := v_values || ', ' || COALESCE(p_height::TEXT, 'NULL');
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_items' AND column_name = 'duration') THEN
    v_columns := v_columns || ', duration';
    v_values := v_values || ', ' || COALESCE(p_duration::TEXT, 'NULL');
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_items' AND column_name = 'category') THEN
    v_columns := v_columns || ', category';
    v_values := v_values || ', ' || quote_literal(p_category);
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_items' AND column_name = 'tags') THEN
    v_columns := v_columns || ', tags';
    IF p_tags IS NOT NULL THEN
      v_values := v_values || ', ARRAY[' || array_to_string(ARRAY(SELECT quote_literal(tag) FROM unnest(p_tags) AS tag), ', ') || ']::TEXT[]';
    ELSE
      v_values := v_values || ', NULL';
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_items' AND column_name = 'is_featured') THEN
    v_columns := v_columns || ', is_featured';
    v_values := v_values || ', ' || p_is_featured;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery_items' AND column_name = 'uploaded_by') THEN
    v_columns := v_columns || ', uploaded_by';
    v_values := v_values || ', ' || COALESCE(quote_literal(v_user_id::TEXT), 'NULL');
  END IF;

  -- Execute dynamic insert
  EXECUTE 'INSERT INTO gallery_items (' || v_columns || ') VALUES (' || v_values || ') RETURNING id' INTO v_item_id;

  RETURN v_item_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Ensure the url column is populated for existing rows
UPDATE gallery_items
SET url = COALESCE(file_url, external_url,
  'https://dcwofyezpqkkqvxyfiol.supabase.co/storage/v1/object/public/gmwb_public/' ||
  COALESCE(file_path, 'placeholder.jpg'))
WHERE url IS NULL OR url = '';

-- Step 6: Grant permissions
GRANT EXECUTE ON FUNCTION create_gallery_item TO authenticated;
GRANT EXECUTE ON FUNCTION create_gallery_item TO anon;

-- Step 7: Test the function
SELECT create_gallery_item(
  'Test Image',
  'Test Description',
  'photo',
  'https://example.com/test.jpg',
  'test/test.jpg'
);

-- Step 8: Check the result
SELECT * FROM gallery_items ORDER BY created_at DESC LIMIT 1;

-- Step 9: Clean up test
DELETE FROM gallery_items WHERE title = 'Test Image';