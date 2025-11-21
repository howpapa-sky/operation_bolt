/*
  # Fix RLS policies for evaluation_items to allow anon access

  1. Changes
    - Drop existing SELECT policy for evaluation_items
    - Create new SELECT policy that allows both authenticated and anon users
    
  2. Security
    - Maintains read-only access for viewing evaluation items
    - Write operations still restricted to managers/admins
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Anyone can view evaluation items" ON evaluation_items;

-- Create new policy that allows anon users
CREATE POLICY "Anyone can view evaluation items"
  ON evaluation_items
  FOR SELECT
  TO authenticated, anon
  USING (true);
