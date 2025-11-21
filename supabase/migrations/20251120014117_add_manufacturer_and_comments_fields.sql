/*
  # Add Manufacturer and Evaluation Comments Fields

  1. Changes
    - Add manufacturer column for storing manufacturer name (한국콜마, 코스맥스)
    - Add evaluation_comments JSONB column for storing comments per evaluation criterion
    
  2. Notes
    - manufacturer is text field for manufacturer selection
    - evaluation_comments stores comments in JSONB format:
      {
        "겉보습": "피부에 잘 흡수되고 촉촉함",
        "속건조개선": "속건조가 많이 개선됨"
      }
*/

-- Add manufacturer column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'manufacturer'
  ) THEN
    ALTER TABLE projects ADD COLUMN manufacturer text;
  END IF;
END $$;

-- Add evaluation_comments column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'evaluation_comments'
  ) THEN
    ALTER TABLE projects ADD COLUMN evaluation_comments jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN projects.manufacturer IS 'Manufacturer name for sample projects (e.g., 한국콜마, 코스맥스)';
COMMENT ON COLUMN projects.evaluation_comments IS 'Stores evaluation comments for each criterion. Example: {"겉보습": "피부에 잘 흡수됨"}';
