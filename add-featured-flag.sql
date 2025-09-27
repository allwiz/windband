-- Add featured flag to gallery_items table
ALTER TABLE gallery_items
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Add index for faster featured image queries
CREATE INDEX IF NOT EXISTS idx_gallery_items_featured
ON gallery_items(is_featured, created_at DESC)
WHERE is_featured = TRUE;

-- Optional: Set one image as featured for testing
-- UPDATE gallery_items
-- SET is_featured = TRUE
-- WHERE category IN ('general', 'concert')
-- AND file_type LIKE 'image/%'
-- ORDER BY created_at DESC
-- LIMIT 1;