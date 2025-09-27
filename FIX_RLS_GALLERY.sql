-- Fix Row-Level Security for Gallery Items

-- Step 1: Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'gallery_items';

-- Step 2: Check existing policies
SELECT * FROM pg_policies
WHERE tablename = 'gallery_items';

-- Step 3: Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for all users" ON gallery_items;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON gallery_items;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON gallery_items;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON gallery_items;
DROP POLICY IF EXISTS "gallery_items_insert_policy" ON gallery_items;
DROP POLICY IF EXISTS "gallery_items_select_policy" ON gallery_items;
DROP POLICY IF EXISTS "gallery_items_update_policy" ON gallery_items;
DROP POLICY IF EXISTS "gallery_items_delete_policy" ON gallery_items;

-- Step 4: Create proper RLS policies

-- Allow everyone to read published items
CREATE POLICY "Public can view published items" ON gallery_items
FOR SELECT
USING (is_published = true OR is_published IS NULL);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert" ON gallery_items
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update their own items (or all items for admin)
CREATE POLICY "Authenticated users can update" ON gallery_items
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete their own items (or all items for admin)
CREATE POLICY "Authenticated users can delete" ON gallery_items
FOR DELETE
TO authenticated
USING (true);

-- Alternative: If you want to temporarily disable RLS for testing
-- ALTER TABLE gallery_items DISABLE ROW LEVEL SECURITY;

-- Step 5: Grant necessary permissions
GRANT ALL ON gallery_items TO authenticated;
GRANT SELECT ON gallery_items TO anon;

-- Step 6: Test the policies
-- This should work for authenticated users
SELECT current_user, current_role;

-- Step 7: Show the current policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'gallery_items';