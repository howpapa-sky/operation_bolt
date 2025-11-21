/*
  # Create evaluation_items table for product evaluation criteria
  
  1. New Tables
    - `evaluation_items`
      - `id` (uuid, primary key) - Unique identifier
      - `product_category` (text, required) - Product category (크림, 토너패드, 앰플, 로션, 미스트)
      - `item_name` (text, required) - Evaluation item name
      - `description` (text, optional) - Description of the evaluation criterion
      - `display_order` (integer, default 0) - Order for display in UI
      - `is_active` (boolean, default true) - Whether item is active
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `evaluation_items` table
    - Add policy for anyone (anon + authenticated) to view evaluation items
    - Add policies for managers/admins to insert, update, and delete items
  
  3. Initial Data
    - Pre-populate with evaluation criteria for each product category:
      - 크림: 겉보습, 속건조개선, 발림성, 끈적임, 향
      - 토너패드: 보습력, 진정효과, 각질제거, 패드두께, 향
      - 앰플: 흡수력, 보습지속력, 끈적임, 발림성, 향
      - 로션: 보습력, 흡수력, 발림성, 끈적임, 향
      - 미스트: 분사력, 보습력, 진정효과, 지속력, 향
  
  4. Important Notes
    - This table provides standardized evaluation criteria for different product types
    - Used in project evaluation forms throughout the application
    - RLS policies ensure public read access while restricting modifications to authorized users
*/

-- Drop table if exists to ensure clean slate
DROP TABLE IF EXISTS evaluation_items CASCADE;

-- Create evaluation_items table
CREATE TABLE evaluation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_category text NOT NULL,
  item_name text NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE evaluation_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view evaluation items"
  ON evaluation_items FOR SELECT
  TO anon, authenticated
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

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON evaluation_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON evaluation_items TO authenticated;

-- Insert initial evaluation items data
INSERT INTO evaluation_items (product_category, item_name, description, display_order) VALUES
  ('크림', '겉보습', '피부 표면 보습 효과', 1),
  ('크림', '속건조개선', '피부 내부 건조 개선', 2),
  ('크림', '발림성', '제품 발림 및 흡수성', 3),
  ('크림', '끈적임', '사용 후 끈적임 정도', 4),
  ('크림', '향', '제품의 향', 5),
  ('토너패드', '보습력', '사용 후 보습 효과', 1),
  ('토너패드', '진정효과', '피부 진정 효과', 2),
  ('토너패드', '각질제거', '각질 제거 효과', 3),
  ('토너패드', '패드두께', '패드의 두께 및 질감', 4),
  ('토너패드', '향', '제품의 향', 5),
  ('앰플', '흡수력', '피부 흡수 속도', 1),
  ('앰플', '보습지속력', '보습 지속 시간', 2),
  ('앰플', '끈적임', '사용 후 끈적임 정도', 3),
  ('앰플', '발림성', '제품 발림성', 4),
  ('앰플', '향', '제품의 향', 5),
  ('로션', '보습력', '사용 후 보습 효과', 1),
  ('로션', '흡수력', '피부 흡수 속도', 2),
  ('로션', '발림성', '제품 발림성', 3),
  ('로션', '끈적임', '사용 후 끈적임 정도', 4),
  ('로션', '향', '제품의 향', 5),
  ('미스트', '분사력', '분사 입자 크기 및 균일성', 1),
  ('미스트', '보습력', '사용 후 보습 효과', 2),
  ('미스트', '진정효과', '피부 진정 효과', 3),
  ('미스트', '지속력', '보습 지속 시간', 4),
  ('미스트', '향', '제품의 향', 5);
