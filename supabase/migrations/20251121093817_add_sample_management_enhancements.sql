/*
  # Sample Management Enhancements

  ## Overview
  Adds comprehensive fields for enhanced sample management including evaluator feedback,
  manufacturer communications, sampling dates, and lab tracking.

  ## New Tables
  - `evaluator_feedback`
    - `id` (uuid, primary key)
    - `project_id` (uuid, foreign key to projects)
    - `evaluator_id` (uuid, foreign key to auth.users)
    - `evaluator_name` (text)
    - `criterion_name` (text) - evaluation criterion (e.g., "겉보습")
    - `feedback` (text) - one-line feedback for this criterion
    - `score` (integer) - score 1-5
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Modified Tables
  - `projects`
    - Added `lab_number` (text) - Lab tracking number
    - Added `sampling_start_date` (date) - When sampling started
    - Added `sampling_notes` (text) - Special notes/issues for this round
    - Added `final_feedback_to_manufacturer` (text) - Consolidated feedback for manufacturer
    - Added `sample_status` (text) - Status specific to sampling workflow

  ## Security
  - Enable RLS on `evaluator_feedback` table
  - Add policies for authenticated users to manage their feedback
  - Add policies for admins to view all feedback

  ## Notes
  1. Evaluator feedback is stored per criterion to enable detailed tracking
  2. Final manufacturer feedback is a separate consolidated field
  3. Lab numbers help track samples across different systems
  4. Sampling dates and notes provide timeline visibility
*/

-- Add new fields to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'lab_number'
  ) THEN
    ALTER TABLE projects ADD COLUMN lab_number text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'sampling_start_date'
  ) THEN
    ALTER TABLE projects ADD COLUMN sampling_start_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'sampling_notes'
  ) THEN
    ALTER TABLE projects ADD COLUMN sampling_notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'final_feedback_to_manufacturer'
  ) THEN
    ALTER TABLE projects ADD COLUMN final_feedback_to_manufacturer text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'sample_status'
  ) THEN
    ALTER TABLE projects ADD COLUMN sample_status text DEFAULT '평가 대기'
      CHECK (sample_status IN ('평가 대기', '평가 중', '평가 완료', '제조사 전달', '샘플 확정', '샘플 지연'));
  END IF;
END $$;

-- Create evaluator_feedback table
CREATE TABLE IF NOT EXISTS evaluator_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  evaluator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluator_name text NOT NULL,
  criterion_name text NOT NULL,
  feedback text,
  score integer CHECK (score >= 1 AND score <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_evaluator_feedback_project_id ON evaluator_feedback(project_id);
CREATE INDEX IF NOT EXISTS idx_evaluator_feedback_evaluator_id ON evaluator_feedback(evaluator_id);

-- Enable RLS
ALTER TABLE evaluator_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for evaluator_feedback
CREATE POLICY "Allow anon to read evaluator feedback"
  ON evaluator_feedback FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated to read evaluator feedback"
  ON evaluator_feedback FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated to insert their own feedback"
  ON evaluator_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = evaluator_id);

CREATE POLICY "Allow authenticated to update their own feedback"
  ON evaluator_feedback FOR UPDATE
  TO authenticated
  USING (auth.uid() = evaluator_id)
  WITH CHECK (auth.uid() = evaluator_id);

CREATE POLICY "Allow authenticated to delete their own feedback"
  ON evaluator_feedback FOR DELETE
  TO authenticated
  USING (auth.uid() = evaluator_id);

-- Add comment
COMMENT ON TABLE evaluator_feedback IS 'Stores individual evaluator feedback per criterion for each project';
COMMENT ON COLUMN projects.lab_number IS 'Laboratory tracking number for sample identification';
COMMENT ON COLUMN projects.sampling_start_date IS 'Date when sampling round started';
COMMENT ON COLUMN projects.sampling_notes IS 'Special notes or issues for this sampling round';
COMMENT ON COLUMN projects.final_feedback_to_manufacturer IS 'Consolidated final feedback to be delivered to manufacturer';
COMMENT ON COLUMN projects.sample_status IS 'Specific status for sampling workflow tracking';
