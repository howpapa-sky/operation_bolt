/*
  # Update RLS Policies to Allow Anonymous Access

  1. Changes
    - Update projects table policies to allow anonymous users
    - Update tasks table policies to allow anonymous users
    - This enables testing without authentication

  2. Security Notes
    - This is for development/testing purposes
    - For production, consider requiring authentication
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view projects" ON projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON projects;
DROP POLICY IF EXISTS "Users can update projects" ON projects;
DROP POLICY IF EXISTS "Users can delete projects" ON projects;

-- Create new policies that allow both authenticated and anonymous users
CREATE POLICY "Anyone can view projects"
  ON projects
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create projects"
  ON projects
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update projects"
  ON projects
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete projects"
  ON projects
  FOR DELETE
  TO public
  USING (true);

-- Update tasks policies as well
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON tasks;
DROP POLICY IF EXISTS "Authenticated users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON tasks;
DROP POLICY IF EXISTS "Users can delete tasks" ON tasks;

CREATE POLICY "Anyone can view tasks"
  ON tasks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create tasks"
  ON tasks
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update tasks"
  ON tasks
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete tasks"
  ON tasks
  FOR DELETE
  TO public
  USING (true);
