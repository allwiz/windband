-- Fix gallery URLs to ensure they have the full Supabase public URL format
-- This script will update any file_url that doesn't start with http to the correct format

-- First, let's see what we have
SELECT id, file_url, file_path FROM gallery_items LIMIT 10;

-- Update file_url to proper format if it's missing or incorrect
UPDATE gallery_items
SET file_url =
  CASE
    -- If file_url is null or empty but we have file_path, generate the URL
    WHEN (file_url IS NULL OR file_url = '') AND file_path IS NOT NULL THEN
      CONCAT(
        'https://dcwofyezpqkkqvxyfiol.supabase.co',
        '/storage/v1/object/public/gmwb_public/',
        file_path
      )
    -- If file_url doesn't start with http, it's probably just a path
    WHEN file_url NOT LIKE 'http%' AND file_url IS NOT NULL THEN
      CONCAT(
        (SELECT COALESCE(
          'https://wiqthgwnmuopmtyfetlv.supabase.co',
          ''
        )),
        '/storage/v1/object/public/gmwb_public/',
        CASE
          WHEN file_url LIKE '/%' THEN SUBSTRING(file_url FROM 2)
          ELSE file_url
        END
      )
    -- Otherwise keep the existing URL
    ELSE file_url
  END
WHERE file_path IS NOT NULL;

-- Verify the updates
SELECT id, file_url, file_path FROM gallery_items LIMIT 10;