-- Fix delete_gallery_item function to handle UUID IDs

-- Step 1: Check the column type of ID
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'gallery_items' AND column_name = 'id';

-- Step 2: Drop the old function that expects BIGINT
DROP FUNCTION IF EXISTS delete_gallery_item(BIGINT);

-- Step 3: Create a new function that accepts UUID
CREATE OR REPLACE FUNCTION delete_gallery_item(p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM gallery_items WHERE id = p_id;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Grant permissions
GRANT EXECUTE ON FUNCTION delete_gallery_item(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_gallery_item(UUID) TO anon;

-- Step 5: Test the function (don't run this unless you have a test UUID)
-- SELECT delete_gallery_item('some-uuid-here');

-- Alternative: If your ID is actually TEXT or VARCHAR
-- DROP FUNCTION IF EXISTS delete_gallery_item(UUID);
-- CREATE OR REPLACE FUNCTION delete_gallery_item(p_id TEXT)
-- RETURNS BOOLEAN AS $$
-- BEGIN
--   DELETE FROM gallery_items WHERE id::TEXT = p_id;
--   RETURN FOUND;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;