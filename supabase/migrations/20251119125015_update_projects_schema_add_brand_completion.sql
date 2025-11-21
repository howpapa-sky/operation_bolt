/*
  # Update Projects Schema - Add Brand and Completion Date

  1. Changes
    - Add brand column (누씨오, 하우파파)
    - Add project_subtype column for detailed project types
    - Add completed_date column for completion tracking
    - Update project_type to match new requirements
    - Update status values to match new requirements

  2. Notes
    - This migration safely adds new columns
    - Existing data is preserved
*/

-- Add brand column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'brand'
  ) THEN
    ALTER TABLE projects ADD COLUMN brand text CHECK (brand IN ('누씨오', '하우파파'));
  END IF;
END $$;

-- Add project_subtype column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'project_subtype'
  ) THEN
    ALTER TABLE projects ADD COLUMN project_subtype text;
  END IF;
END $$;

-- Add completed_date column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'completed_date'
  ) THEN
    ALTER TABLE projects ADD COLUMN completed_date date;
  END IF;
END $$;

-- Update project_type constraint to include new types
DO $$
BEGIN
  ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_project_type_check;
  ALTER TABLE projects ADD CONSTRAINT projects_project_type_check 
    CHECK (project_type IN ('샘플링', '상세페이지', '인플루언서', '제품 발주'));
END $$;

-- Update status constraint to include new values
DO $$
BEGIN
  ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
  ALTER TABLE projects ADD CONSTRAINT projects_status_check 
    CHECK (status IN ('진행 전', '진행 중', '완료', '보류', '대기'));
END $$;

-- Update description column name to notes if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'notes'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'description'
  ) THEN
    ALTER TABLE projects RENAME COLUMN description TO notes;
  END IF;
END $$;
