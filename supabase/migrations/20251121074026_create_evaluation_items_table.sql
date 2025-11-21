/*
  # Create Evaluation Items Table

  1. New Tables
    - `evaluation_items`
      - `id` (uuid, primary key)
      - `project_subtype` (text) - 프로젝트 세부 유형 (e.g., "샘플링")
      - `item_name` (text) - 평가 항목 이름 (e.g., "겉보습", "속건조개선")
      - `description` (text, nullable) - 항목 설명
      - `display_order` (integer) - 표시 순서
      - `is_active` (boolean) - 활성 상태
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `evaluation_items` table
    - All users can view evaluation items
    - Only manager, admin, and super_admin can insert/update/delete evaluation items

  3. Important Notes
    - This table stores the evaluation criteria templates for different project subtypes
    - Used to populate the evaluation form dynamically based on project type
    - Manager level or higher required for modifications
*/

CREATE TABLE IF NOT EXISTS evaluation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_subtype text NOT NULL,
  item_name text NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_subtype, item_name)
);

ALTER TABLE evaluation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view evaluation items"
  ON evaluation_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Managers can insert evaluation items"
  ON evaluation_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('manager', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Managers can update evaluation items"
  ON evaluation_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('manager', 'admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('manager', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Managers can delete evaluation items"
  ON evaluation_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('manager', 'admin', 'super_admin')
    )
  );

CREATE INDEX IF NOT EXISTS idx_evaluation_items_subtype ON evaluation_items(project_subtype);
CREATE INDEX IF NOT EXISTS idx_evaluation_items_order ON evaluation_items(display_order);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_evaluation_items_updated_at') THEN
    CREATE TRIGGER update_evaluation_items_updated_at 
    BEFORE UPDATE ON evaluation_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

INSERT INTO evaluation_items (project_subtype, item_name, description, display_order) VALUES
  ('샘플링', '겉보습', '피부 표면 보습 효과', 1),
  ('샘플링', '속건조개선', '피부 내부 건조 개선', 2),
  ('샘플링', '발림성', '제품 발림 및 흡수성', 3),
  ('샘플링', '끈적임', '사용 후 끈적임 정도', 4),
  ('샘플링', '향', '제품의 향', 5)
ON CONFLICT (project_subtype, item_name) DO NOTHING;