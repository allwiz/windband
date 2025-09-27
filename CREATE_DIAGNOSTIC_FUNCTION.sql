-- ============================================================================
-- CREATE MISSING DATABASE DIAGNOSTIC FUNCTION
-- Fixes: PGRST202 - Could not find the function public.get_current_user
-- ============================================================================

-- Drop the function if it exists (to allow re-running this script)
DROP FUNCTION IF EXISTS public.get_current_user();

-- Create the get_current_user function
-- This function is used by the Database Diagnostics tool
CREATE OR REPLACE FUNCTION public.get_current_user()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id uuid;
    user_email text;
    user_role text;
    result json;
BEGIN
    -- Get the current user's ID
    user_id := auth.uid();

    -- If no user is authenticated, return null info
    IF user_id IS NULL THEN
        RETURN json_build_object(
            'authenticated', false,
            'user_id', null,
            'email', null,
            'role', 'anon',
            'message', 'No authenticated user'
        );
    END IF;

    -- Get user email from auth.users (only accessible with SECURITY DEFINER)
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = user_id;

    -- Get user role from JWT
    user_role := current_setting('request.jwt.claims', true)::json->>'role';

    -- Build the result JSON
    result := json_build_object(
        'authenticated', true,
        'user_id', user_id,
        'email', user_email,
        'role', COALESCE(user_role, 'authenticated'),
        'message', 'User authenticated successfully'
    );

    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- Return error information if something goes wrong
        RETURN json_build_object(
            'authenticated', false,
            'user_id', null,
            'email', null,
            'role', 'error',
            'message', 'Error retrieving user information',
            'error', SQLERRM
        );
END;
$$;

-- Grant execute permission to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.get_current_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user() TO anon;

-- Add a comment explaining the function's purpose
COMMENT ON FUNCTION public.get_current_user() IS
'Returns current user information for diagnostic purposes. Used by the Database Diagnostics tool.';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Test the function (will return different results based on authentication status)
SELECT public.get_current_user() as current_user_info;

-- Verify the function exists in the schema
SELECT
    'Function Status' as check_type,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ Function created successfully'
        ELSE '❌ Function not found'
    END as status
FROM pg_proc
WHERE proname = 'get_current_user'
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ============================================================================
-- NOTES:
-- 1. This function is used by the Database Diagnostics tool
-- 2. It returns JSON with user information when authenticated
-- 3. Returns anonymous info when not authenticated
-- 4. SECURITY DEFINER allows it to access auth.users table
-- ============================================================================