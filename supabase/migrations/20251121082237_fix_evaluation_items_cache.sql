/*
  # Fix Evaluation Items Schema Cache Issue
  
  1. Changes
    - Create RPC function to fetch evaluation items
    - This bypasses PostgREST cache issues
    
  2. Security
    - Function is accessible to authenticated users
    - Returns same data as direct table query
*/

CREATE OR REPLACE FUNCTION get_evaluation_items()
RETURNS TABLE (
  id uuid,
  product_category text,
  item_name text,
  description text,
  display_order integer,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.product_category,
    e.item_name,
    e.description,
    e.display_order,
    e.is_active,
    e.created_at,
    e.updated_at
  FROM evaluation_items e
  ORDER BY e.product_category, e.display_order;
END;
$$;

GRANT EXECUTE ON FUNCTION get_evaluation_items() TO authenticated;
