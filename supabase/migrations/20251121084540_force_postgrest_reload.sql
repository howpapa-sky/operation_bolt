/*
  # Force PostgREST Schema Reload
  
  This migration forces PostgREST to reload its schema cache and
  explicitly grants permissions to ensure the evaluation_items table
  is accessible via the REST API.
*/

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';

-- Ensure evaluation_items table is in the public schema
-- and verify it's properly configured
DO $$
BEGIN
  -- Verify table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'evaluation_items'
  ) THEN
    RAISE EXCEPTION 'evaluation_items table does not exist in public schema';
  END IF;
  
  -- Ensure RLS is enabled
  ALTER TABLE evaluation_items ENABLE ROW LEVEL SECURITY;
  
  -- Grant explicit permissions
  GRANT USAGE ON SCHEMA public TO anon, authenticated;
  GRANT SELECT ON evaluation_items TO anon, authenticated;
  GRANT INSERT, UPDATE, DELETE ON evaluation_items TO authenticated;
  
  -- Verify policies exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'evaluation_items' 
    AND policyname = 'Anyone can view evaluation items'
  ) THEN
    RAISE NOTICE 'SELECT policy missing, but continuing...';
  END IF;
END $$;
