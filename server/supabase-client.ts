import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from './_core/env';

let _supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_supabase) {
    const supabaseUrl = process.env.SUPABASE_URL || ENV.supabaseUrl;
    const supabaseKey = process.env.SUPABASE_KEY || ENV.supabaseKey;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and Key are required');
    }
    
    _supabase = createClient(supabaseUrl, supabaseKey);
  }
  
  return _supabase;
}

// ==================== Master Data Functions ====================

// Brands
export async function getAllBrands() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data;
}

export async function createBrand(brand: { name: string; description?: string }) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('brands')
    .insert(brand)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateBrand(id: string, updates: Partial<{ name: string; description: string; is_active: boolean }>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('brands')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteBrand(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Categories
export async function getAllCategories() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('type', { ascending: true })
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function getCategoriesByType(type: '화장품' | '부자재') {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', type)
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data;
}

export async function createCategory(category: { name: string; type: '화장품' | '부자재'; description?: string }) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, updates: Partial<{ name: string; type: string; description: string; is_active: boolean }>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Manufacturers
export async function getAllManufacturers() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('manufacturers')
    .select('*')
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data;
}

export async function createManufacturer(manufacturer: { 
  name: string; 
  contact?: string; 
  email?: string; 
  phone?: string; 
  address?: string; 
  notes?: string 
}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('manufacturers')
    .insert(manufacturer)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateManufacturer(id: string, updates: Partial<{ 
  name: string; 
  contact: string; 
  email: string; 
  phone: string; 
  address: string; 
  notes: string; 
  is_active: boolean 
}>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('manufacturers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteManufacturer(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('manufacturers')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Vendors
export async function getAllVendors() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data;
}

export async function getVendorsByType(type: '상세페이지' | '디자인' | '촬영' | '기타') {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('type', type)
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data;
}

export async function createVendor(vendor: { 
  name: string; 
  type: '상세페이지' | '디자인' | '촬영' | '기타';
  contact?: string; 
  email?: string; 
  phone?: string; 
  notes?: string 
}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('vendors')
    .insert(vendor)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateVendor(id: string, updates: Partial<{ 
  name: string; 
  type: string;
  contact: string; 
  email: string; 
  phone: string; 
  notes: string; 
  is_active: boolean 
}>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('vendors')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteVendor(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('vendors')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Sellers
export async function getAllSellers() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('sellers')
    .select('*')
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data;
}

export async function createSeller(seller: { 
  name: string; 
  platform?: string;
  contact?: string; 
  email?: string; 
  phone?: string; 
  notes?: string 
}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('sellers')
    .insert(seller)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateSeller(id: string, updates: Partial<{ 
  name: string; 
  platform: string;
  contact: string; 
  email: string; 
  phone: string; 
  notes: string; 
  is_active: boolean 
}>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('sellers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteSeller(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('sellers')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Evaluators
export async function getAllEvaluators() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('evaluators')
    .select('*')
    .eq('is_active', true)
    .order('name');
  
  if (error) throw error;
  return data;
}

export async function createEvaluator(evaluator: { 
  name: string; 
  email?: string; 
  phone?: string; 
  specialty?: string;
  notes?: string 
}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('evaluators')
    .insert(evaluator)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateEvaluator(id: string, updates: Partial<{ 
  name: string; 
  email: string; 
  phone: string; 
  specialty: string;
  notes: string; 
  is_active: boolean 
}>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('evaluators')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteEvaluator(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('evaluators')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Evaluation Criteria
export async function getAllEvaluationCriteria() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('evaluation_criteria')
    .select('*, category:categories(*)')
    .eq('is_active', true)
    .order('display_order');
  
  if (error) throw error;
  return data;
}

export async function getEvaluationCriteriaByCategoryId(categoryId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('evaluation_criteria')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('display_order');
  
  if (error) throw error;
  return data;
}

export async function createEvaluationCriterion(criterion: { 
  category_id: string;
  name: string; 
  description?: string; 
  display_order?: number;
}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('evaluation_criteria')
    .insert(criterion)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateEvaluationCriterion(id: string, updates: Partial<{ 
  name: string; 
  description: string; 
  display_order: number;
  is_active: boolean 
}>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('evaluation_criteria')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteEvaluationCriterion(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('evaluation_criteria')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Project Comments
export async function getProjectComments(projectId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('project_comments')
    .select('*, user:users(*)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createProjectComment(comment: { 
  project_id: string;
  user_id: string;
  comment: string;
}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('project_comments')
    .insert(comment)
    .select('*, user:users(*)')
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateProjectComment(id: string, comment: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('project_comments')
    .update({ comment })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteProjectComment(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('project_comments')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}
