/*
  # Update Evaluation Items to Use Product Category

  1. Changes
    - Rename `project_subtype` column to `product_category` for clarity
    - Update unique constraint to use product_category
    - Update indexes to use product_category
    - Delete old sample data (샘플링)
    - Add new sample data for product categories (크림, 토너패드, 앰플, 로션, 미스트)

  2. Important Notes
    - This table now stores evaluation criteria for product categories under "제품출시 > 샘플"
    - Product categories: 크림, 토너패드, 앰플, 로션, 미스트
    - Manager level or higher required for modifications
*/

ALTER TABLE evaluation_items
  RENAME COLUMN project_subtype TO product_category;

DROP INDEX IF EXISTS idx_evaluation_items_subtype;
CREATE INDEX IF NOT EXISTS idx_evaluation_items_category ON evaluation_items(product_category);

DELETE FROM evaluation_items WHERE product_category = '샘플링';

INSERT INTO evaluation_items (product_category, item_name, description, display_order) VALUES
  ('크림', '겉보습', '피부 표면 보습 효과', 1),
  ('크림', '속건조개선', '피부 내부 건조 개선', 2),
  ('크림', '발림성', '제품 발림 및 흡수성', 3),
  ('크림', '끈적임', '사용 후 끈적임 정도', 4),
  ('크림', '향', '제품의 향', 5),
  
  ('토너패드', '겉보습', '피부 표면 보습 효과', 1),
  ('토너패드', '속건조개선', '피부 내부 건조 개선', 2),
  ('토너패드', '발림성', '제품 발림 및 흡수성', 3),
  ('토너패드', '끈적임', '사용 후 끈적임 정도', 4),
  ('토너패드', '향', '제품의 향', 5),
  
  ('앰플', '겉보습', '피부 표면 보습 효과', 1),
  ('앰플', '속건조개선', '피부 내부 건조 개선', 2),
  ('앰플', '발림성', '제품 발림 및 흡수성', 3),
  ('앰플', '끈적임', '사용 후 끈적임 정도', 4),
  ('앰플', '향', '제품의 향', 5),
  
  ('로션', '겉보습', '피부 표면 보습 효과', 1),
  ('로션', '속건조개선', '피부 내부 건조 개선', 2),
  ('로션', '발림성', '제품 발림 및 흡수성', 3),
  ('로션', '끈적임', '사용 후 끈적임 정도', 4),
  ('로션', '향', '제품의 향', 5),
  
  ('미스트', '겉보습', '피부 표면 보습 효과', 1),
  ('미스트', '속건조개선', '피부 내부 건조 개선', 2),
  ('미스트', '발림성', '제품 발림 및 흡수성', 3),
  ('미스트', '끈적임', '사용 후 끈적임 정도', 4),
  ('미스트', '향', '제품의 향', 5)
ON CONFLICT (product_category, item_name) DO NOTHING;