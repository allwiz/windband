-- Check Gallery Table Structure and Fix URLs
-- First, let's see what columns we actually have

-- Step 1: Show the current table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'gallery_items'
ORDER BY ordinal_position;

-- Step 2: Check a few sample records to see what we have
SELECT *
FROM gallery_items
LIMIT 5;

-- Step 3: Add file_path column if it doesn't exist
ALTER TABLE gallery_items
ADD COLUMN IF NOT EXISTS file_path TEXT;

-- Step 4: If file_path is empty but we can extract it from file_url, do so
UPDATE gallery_items
SET file_path =
  CASE
    WHEN file_url LIKE '%/storage/v1/object/public/gmwb_public/%' THEN
      SUBSTRING(file_url FROM POSITION('/gmwb_public/' IN file_url) + 13)
    WHEN file_url LIKE '%gmwb_public/%' AND file_url NOT LIKE 'http%' THEN
      SUBSTRING(file_url FROM POSITION('gmwb_public/' IN file_url) + 12)
    ELSE
      file_path
  END
WHERE file_path IS NULL OR file_path = '';

-- Step 5: Now fix the file_url to ensure it's a complete URL
UPDATE gallery_items
SET file_url =
  CASE
    -- If we have a file_path, generate the correct URL
    WHEN file_path IS NOT NULL AND file_path != '' THEN
      CONCAT('https://dcwofyezpqkkqvxyfiol.supabase.co/storage/v1/object/public/gmwb_public/', file_path)
    -- If file_url exists but isn't a full URL, fix it
    WHEN file_url IS NOT NULL AND file_url NOT LIKE 'http%' THEN
      CONCAT('https://dcwofyezpqkkqvxyfiol.supabase.co/storage/v1/object/public/gmwb_public/', file_url)
    -- Keep existing URL if it's already valid
    ELSE
      file_url
  END
WHERE type = 'photo' OR type = 'image';

-- Step 6: Verify the results
SELECT
  id,
  title,
  type,
  file_path,
  file_url,
  external_url
FROM gallery_items
LIMIT 10;