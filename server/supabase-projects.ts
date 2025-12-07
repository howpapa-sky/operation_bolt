import { getSupabaseClient } from './supabase-client';

// ==================== Project Management Functions ====================

export async function getAllProjects() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      manufacturer:manufacturers(*),
      vendor:vendors(*),
      seller:sellers(*),
      owner:user_profiles(*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getProjectById(id: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      manufacturer:manufacturers(*),
      vendor:vendors(*),
      seller:sellers(*),
      owner:user_profiles(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getProjectsByType(projectType: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      manufacturer:manufacturers(*),
      vendor:vendors(*),
      seller:sellers(*),
      owner:user_profiles(*)
    `)
    .eq('project_type', projectType)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getProjectsByStatus(status: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      manufacturer:manufacturers(*),
      vendor:vendors(*),
      seller:sellers(*),
      owner:user_profiles(*)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getProjectsByDateRange(startDate: string, endDate: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      manufacturer:manufacturers(*),
      vendor:vendors(*),
      seller:sellers(*),
      owner:user_profiles(*)
    `)
    .gte('start_date', startDate)
    .lte('due_date', endDate)
    .order('start_date', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function createProject(project: {
  name: string;
  notes?: string;
  project_type: '샘플링' | '상세페이지' | '인플루언서' | '제품 발주' | '공동구매' | '기타';
  project_subtype?: string;
  status?: '진행 전' | '진행 중' | '완료' | '보류' | '대기';
  priority?: '낮음' | '보통' | '높음' | '긴급';
  brand_id?: string;
  category_id?: string;
  manufacturer_id?: string;
  vendor_id?: string;
  seller_id?: string;
  start_date?: string;
  due_date?: string;
  completed_date?: string;
  owner_id?: string;
  
  // 샘플링 관련
  sample_code?: string;
  sample_round?: string;
  evaluations?: any;
  
  // 상세페이지 관련
  product_name?: string;
  work_type?: '신규' | '리뉴얼';
  includes_photography?: boolean;
  includes_planning?: boolean;
  budget?: number;
  
  // 인플루언서 관련
  collaboration_type?: '제품협찬' | '유가콘텐츠';
  
  // 제품 발주 관련
  container_material_id?: string;
  box_material_id?: string;
  
  // 공동구매 관련
  revenue?: number;
  contribution_profit?: number;
  
  // 파일 첨부
  attached_files?: any;
}) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      manufacturer:manufacturers(*),
      vendor:vendors(*),
      seller:sellers(*),
      owner:user_profiles(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateProject(id: string, updates: Partial<{
  name: string;
  notes: string;
  project_type: string;
  project_subtype: string;
  status: string;
  priority: string;
  brand_id: string;
  category_id: string;
  manufacturer_id: string;
  vendor_id: string;
  seller_id: string;
  start_date: string;
  due_date: string;
  completed_date: string;
  owner_id: string;
  
  // 샘플링 관련
  sample_code: string;
  sample_round: string;
  evaluations: any;
  
  // 상세페이지 관련
  product_name: string;
  work_type: string;
  includes_photography: boolean;
  includes_planning: boolean;
  budget: number;
  
  // 인플루언서 관련
  collaboration_type: string;
  
  // 제품 발주 관련
  container_material_id: string;
  box_material_id: string;
  
  // 공동구매 관련
  revenue: number;
  contribution_profit: number;
  
  // 파일 첨부
  attached_files: any;
}>) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      brand:brands(*),
      category:categories(*),
      manufacturer:manufacturers(*),
      vendor:vendors(*),
      seller:sellers(*),
      owner:user_profiles(*)
    `)
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteProject(id: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// ==================== Project Statistics ====================

export async function getProjectStatsByType() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select('project_type, status')
    .order('project_type');
  
  if (error) throw error;
  
  // Group by project_type and status
  const stats: Record<string, Record<string, number>> = {};
  data.forEach((project: any) => {
    if (!stats[project.project_type]) {
      stats[project.project_type] = {};
    }
    if (!stats[project.project_type][project.status]) {
      stats[project.project_type][project.status] = 0;
    }
    stats[project.project_type][project.status]++;
  });
  
  return stats;
}

export async function getProjectStatsByStatus() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select('status')
    .order('status');
  
  if (error) throw error;
  
  // Count by status
  const stats: Record<string, number> = {};
  data.forEach((project: any) => {
    if (!stats[project.status]) {
      stats[project.status] = 0;
    }
    stats[project.status]++;
  });
  
  return stats;
}

export async function getProjectStatsByPriority() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select('priority')
    .order('priority');
  
  if (error) throw error;
  
  // Count by priority
  const stats: Record<string, number> = {};
  data.forEach((project: any) => {
    if (!stats[project.priority]) {
      stats[project.priority] = 0;
    }
    stats[project.priority]++;
  });
  
  return stats;
}

export async function getBudgetStatsByType() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select('project_type, budget, revenue, contribution_profit')
    .not('budget', 'is', null);
  
  if (error) throw error;
  
  // Sum by project_type
  const stats: Record<string, { budget: number; revenue: number; profit: number }> = {};
  data.forEach((project: any) => {
    if (!stats[project.project_type]) {
      stats[project.project_type] = { budget: 0, revenue: 0, profit: 0 };
    }
    stats[project.project_type].budget += project.budget || 0;
    stats[project.project_type].revenue += project.revenue || 0;
    stats[project.project_type].profit += project.contribution_profit || 0;
  });
  
  return stats;
}

// ==================== Sample Evaluation Statistics ====================

export async function getSampleEvaluationStats() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, sample_code, evaluations, category:categories(*)')
    .eq('project_type', '샘플링')
    .not('evaluations', 'is', null)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data;
}

export async function getSampleEvaluationsByCategory(categoryId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, sample_code, evaluations, category:categories(*)')
    .eq('project_type', '샘플링')
    .eq('category_id', categoryId)
    .not('evaluations', 'is', null)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data;
}
