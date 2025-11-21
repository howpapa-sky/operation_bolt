/*
  # Add Project Evaluation Fields

  1. Changes
    - Add evaluation_criteria JSONB column to store evaluation items and scores
    - This column will store flexible evaluation data based on project subtype
    
  2. Notes
    - JSONB format allows storing different evaluation criteria per project type
    - Example structure:
      {
        "겉보습": 4,
        "속건조개선": 5,
        "마무리감": 3
      }
*/

-- Add evaluation_criteria column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'evaluation_criteria'
  ) THEN
    ALTER TABLE projects ADD COLUMN evaluation_criteria jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN projects.evaluation_criteria IS 'Stores evaluation criteria and scores (1-5) for each project subtype. Example: {"겉보습": 4, "속건조개선": 5}';
