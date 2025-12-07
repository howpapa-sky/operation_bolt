import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database helper functions
export const db = {
  // Brands
  brands: {
    list: async () => {
      const { data, error } = await supabase.from('brands').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    create: async (brand: { name: string }) => {
      const { data, error } = await supabase.from('brands').insert(brand).select().single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, brand: { name: string }) => {
      const { data, error } = await supabase.from('brands').update(brand).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('brands').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // Categories
  categories: {
    list: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    create: async (category: { name: string }) => {
      const { data, error } = await supabase.from('categories').insert(category).select().single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, category: { name: string }) => {
      const { data, error } = await supabase.from('categories').update(category).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // Manufacturers
  manufacturers: {
    list: async () => {
      const { data, error } = await supabase.from('manufacturers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    create: async (manufacturer: { name: string; contact_info?: string }) => {
      const { data, error } = await supabase.from('manufacturers').insert(manufacturer).select().single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, manufacturer: { name: string; contact_info?: string }) => {
      const { data, error } = await supabase.from('manufacturers').update(manufacturer).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('manufacturers').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // Vendors
  vendors: {
    list: async () => {
      const { data, error } = await supabase.from('vendors').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    create: async (vendor: { name: string; contact_info?: string }) => {
      const { data, error } = await supabase.from('vendors').insert(vendor).select().single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, vendor: { name: string; contact_info?: string }) => {
      const { data, error } = await supabase.from('vendors').update(vendor).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id: string) => {
      const { error} = await supabase.from('vendors').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // Sellers
  sellers: {
    list: async () => {
      const { data, error } = await supabase.from('sellers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    create: async (seller: { name: string; contact_info?: string }) => {
      const { data, error } = await supabase.from('sellers').insert(seller).select().single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, seller: { name: string; contact_info?: string }) => {
      const { data, error } = await supabase.from('sellers').update(seller).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('sellers').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // Projects
  projects: {
    list: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          brands (name),
          categories (name),
          manufacturers (name)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    create: async (project: any) => {
      const { data, error } = await supabase.from('projects').insert(project).select().single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, project: any) => {
      const { data, error } = await supabase.from('projects').update(project).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    stats: {
      byType: async () => {
        const { data, error } = await supabase
          .from('projects')
          .select('project_type')
          .order('project_type');
        if (error) throw error;
        
        const stats: Record<string, number> = {};
        data.forEach((item: any) => {
          stats[item.project_type] = (stats[item.project_type] || 0) + 1;
        });
        
        return Object.entries(stats).map(([type, count]) => ({ type, count }));
      },
      byStatus: async () => {
        const { data, error } = await supabase
          .from('projects')
          .select('status')
          .order('status');
        if (error) throw error;
        
        const stats: Record<string, number> = {};
        data.forEach((item: any) => {
          stats[item.status] = (stats[item.status] || 0) + 1;
        });
        
        return Object.entries(stats).map(([status, count]) => ({ status, count }));
      },
      byPriority: async () => {
        const { data, error } = await supabase
          .from('projects')
          .select('priority')
          .order('priority');
        if (error) throw error;
        
        const stats: Record<string, number> = {};
        data.forEach((item: any) => {
          stats[item.priority] = (stats[item.priority] || 0) + 1;
        });
        
        return Object.entries(stats).map(([priority, count]) => ({ priority, count }));
      },
      budget: async () => {
        const { data, error } = await supabase
          .from('projects')
          .select('project_type, budget, revenue, profit');
        if (error) throw error;
        
        const stats: Record<string, { budget: number; revenue: number; profit: number }> = {};
        data.forEach((item: any) => {
          if (!stats[item.project_type]) {
            stats[item.project_type] = { budget: 0, revenue: 0, profit: 0 };
          }
          stats[item.project_type].budget += item.budget || 0;
          stats[item.project_type].revenue += item.revenue || 0;
          stats[item.project_type].profit += item.profit || 0;
        });
        
        return Object.entries(stats).map(([type, values]) => ({ type, ...values }));
      },
    },
  },
};
