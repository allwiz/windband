-- Fix Gallery Image URLs Script
-- This ensures all gallery items have proper public URLs

-- First, check what we currently have
SELECT
  id,
  title,
  file_path,
  file_url,
  type
FROM gallery_items
WHERE file_path IS NOT NULL
LIMIT 5;

-- Update URLs to ensure they're in the correct format
-- Replace with your actual Supabase project URL
UPDATE gallery_items
SET file_url = CONCAT(
  'https://dcwofyezpqkkqvxyfiol.supabase.co/storage/v1/object/public/gmwb_public/',
  file_path
)
WHERE file_path IS NOT NULL
AND (
  file_url IS NULL
  OR file_url = ''
  OR file_url NOT LIKE 'http%'
);

-- Verify the updates
SELECT
  id,
  title,
  file_path,
  file_url,
  type
FROM gallery_items
WHERE file_path IS NOT NULL
LIMIT 5;

-- Show count of updated records
SELECT COUNT(*) as updated_count
FROM gallery_items
WHERE file_path IS NOT NULL
AND file_url LIKE 'https://dcwofyezpqkkqvxyfiol.supabase.co%';