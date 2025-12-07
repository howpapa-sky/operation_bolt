import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as supabase from "./supabase-client";

// ==================== Master Data Routers ====================

export const masterDataRouter = router({
  // Brands
  brands: router({
    list: protectedProcedure.query(async () => {
      return await supabase.getAllBrands();
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await supabase.createBrand(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        is_active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await supabase.updateBrand(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await supabase.deleteBrand(input.id);
        return { success: true };
      }),
  }),

  // Categories
  categories: router({
    list: protectedProcedure.query(async () => {
      return await supabase.getAllCategories();
    }),

    listByType: protectedProcedure
      .input(z.object({ type: z.enum(['화장품', '부자재']) }))
      .query(async ({ input }) => {
        return await supabase.getCategoriesByType(input.type);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        type: z.enum(['화장품', '부자재']),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await supabase.createCategory(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        type: z.enum(['화장품', '부자재']).optional(),
        description: z.string().optional(),
        is_active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await supabase.updateCategory(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await supabase.deleteCategory(input.id);
        return { success: true };
      }),
  }),

  // Manufacturers
  manufacturers: router({
    list: protectedProcedure.query(async () => {
      return await supabase.getAllManufacturers();
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        contact: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await supabase.createManufacturer(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        contact: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
        is_active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await supabase.updateManufacturer(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await supabase.deleteManufacturer(input.id);
        return { success: true };
      }),
  }),

  // Vendors
  vendors: router({
    list: protectedProcedure.query(async () => {
      return await supabase.getAllVendors();
    }),

    listByType: protectedProcedure
      .input(z.object({ type: z.enum(['상세페이지', '디자인', '촬영', '기타']) }))
      .query(async ({ input }) => {
        return await supabase.getVendorsByType(input.type);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        type: z.enum(['상세페이지', '디자인', '촬영', '기타']),
        contact: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await supabase.createVendor(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        type: z.enum(['상세페이지', '디자인', '촬영', '기타']).optional(),
        contact: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        notes: z.string().optional(),
        is_active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await supabase.updateVendor(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await supabase.deleteVendor(input.id);
        return { success: true };
      }),
  }),

  // Sellers
  sellers: router({
    list: protectedProcedure.query(async () => {
      return await supabase.getAllSellers();
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        platform: z.string().optional(),
        contact: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await supabase.createSeller(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        platform: z.string().optional(),
        contact: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        notes: z.string().optional(),
        is_active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await supabase.updateSeller(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await supabase.deleteSeller(input.id);
        return { success: true };
      }),
  }),

  // Evaluators
  evaluators: router({
    list: protectedProcedure.query(async () => {
      return await supabase.getAllEvaluators();
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
        specialty: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await supabase.createEvaluator(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        specialty: z.string().optional(),
        notes: z.string().optional(),
        is_active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await supabase.updateEvaluator(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await supabase.deleteEvaluator(input.id);
        return { success: true };
      }),
  }),

  // Evaluation Criteria
  evaluationCriteria: router({
    list: protectedProcedure.query(async () => {
      return await supabase.getAllEvaluationCriteria();
    }),

    listByCategoryId: protectedProcedure
      .input(z.object({ categoryId: z.string() }))
      .query(async ({ input }) => {
        return await supabase.getEvaluationCriteriaByCategoryId(input.categoryId);
      }),

    create: protectedProcedure
      .input(z.object({
        category_id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        display_order: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await supabase.createEvaluationCriterion(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        display_order: z.number().optional(),
        is_active: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await supabase.updateEvaluationCriterion(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await supabase.deleteEvaluationCriterion(input.id);
        return { success: true };
      }),
  }),

  // Project Comments
  projectComments: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ input }) => {
        return await supabase.getProjectComments(input.projectId);
      }),

    create: protectedProcedure
      .input(z.object({
        project_id: z.string(),
        comment: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await supabase.createProjectComment({
          ...input,
          user_id: ctx.user.id,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        comment: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await supabase.updateProjectComment(input.id, input.comment);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await supabase.deleteProjectComment(input.id);
        return { success: true };
      }),
  }),
});
