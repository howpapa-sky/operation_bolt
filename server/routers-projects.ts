import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as projects from "./supabase-projects";

// ==================== Project Management Routers ====================

export const projectsRouter = router({
  // List operations
  list: protectedProcedure.query(async () => {
    return await projects.getAllProjects();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await projects.getProjectById(input.id);
    }),

  listByType: protectedProcedure
    .input(z.object({ 
      projectType: z.enum(['샘플링', '상세페이지', '인플루언서', '제품 발주', '공동구매', '기타']) 
    }))
    .query(async ({ input }) => {
      return await projects.getProjectsByType(input.projectType);
    }),

  listByStatus: protectedProcedure
    .input(z.object({ 
      status: z.enum(['진행 전', '진행 중', '완료', '보류', '대기']) 
    }))
    .query(async ({ input }) => {
      return await projects.getProjectsByStatus(input.status);
    }),

  listByDateRange: protectedProcedure
    .input(z.object({ 
      startDate: z.string(), 
      endDate: z.string() 
    }))
    .query(async ({ input }) => {
      return await projects.getProjectsByDateRange(input.startDate, input.endDate);
    }),

  // CRUD operations
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      notes: z.string().optional(),
      project_type: z.enum(['샘플링', '상세페이지', '인플루언서', '제품 발주', '공동구매', '기타']),
      project_subtype: z.string().optional(),
      status: z.enum(['진행 전', '진행 중', '완료', '보류', '대기']).optional(),
      priority: z.enum(['낮음', '보통', '높음', '긴급']).optional(),
      brand_id: z.string().optional(),
      category_id: z.string().optional(),
      manufacturer_id: z.string().optional(),
      vendor_id: z.string().optional(),
      seller_id: z.string().optional(),
      start_date: z.string().optional(),
      due_date: z.string().optional(),
      completed_date: z.string().optional(),
      owner_id: z.string().optional(),
      
      // 샘플링 관련
      sample_code: z.string().optional(),
      sample_round: z.string().optional(),
      evaluations: z.any().optional(),
      
      // 상세페이지 관련
      product_name: z.string().optional(),
      work_type: z.enum(['신규', '리뉴얼']).optional(),
      includes_photography: z.boolean().optional(),
      includes_planning: z.boolean().optional(),
      budget: z.number().optional(),
      
      // 인플루언서 관련
      collaboration_type: z.enum(['제품협찬', '유가콘텐츠']).optional(),
      
      // 제품 발주 관련
      container_material_id: z.string().optional(),
      box_material_id: z.string().optional(),
      
      // 공동구매 관련
      revenue: z.number().optional(),
      contribution_profit: z.number().optional(),
      
      // 파일 첨부
      attached_files: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await projects.createProject({
        ...input,
        owner_id: input.owner_id || ctx.user.id,
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      notes: z.string().optional(),
      project_type: z.enum(['샘플링', '상세페이지', '인플루언서', '제품 발주', '공동구매', '기타']).optional(),
      project_subtype: z.string().optional(),
      status: z.enum(['진행 전', '진행 중', '완료', '보류', '대기']).optional(),
      priority: z.enum(['낮음', '보통', '높음', '긴급']).optional(),
      brand_id: z.string().optional(),
      category_id: z.string().optional(),
      manufacturer_id: z.string().optional(),
      vendor_id: z.string().optional(),
      seller_id: z.string().optional(),
      start_date: z.string().optional(),
      due_date: z.string().optional(),
      completed_date: z.string().optional(),
      owner_id: z.string().optional(),
      
      // 샘플링 관련
      sample_code: z.string().optional(),
      sample_round: z.string().optional(),
      evaluations: z.any().optional(),
      
      // 상세페이지 관련
      product_name: z.string().optional(),
      work_type: z.enum(['신규', '리뉴얼']).optional(),
      includes_photography: z.boolean().optional(),
      includes_planning: z.boolean().optional(),
      budget: z.number().optional(),
      
      // 인플루언서 관련
      collaboration_type: z.enum(['제품협찬', '유가콘텐츠']).optional(),
      
      // 제품 발주 관련
      container_material_id: z.string().optional(),
      box_material_id: z.string().optional(),
      
      // 공동구매 관련
      revenue: z.number().optional(),
      contribution_profit: z.number().optional(),
      
      // 파일 첨부
      attached_files: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      return await projects.updateProject(id, updates);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await projects.deleteProject(input.id);
      return { success: true };
    }),

  // Statistics
  stats: router({
    byType: protectedProcedure.query(async () => {
      return await projects.getProjectStatsByType();
    }),

    byStatus: protectedProcedure.query(async () => {
      return await projects.getProjectStatsByStatus();
    }),

    byPriority: protectedProcedure.query(async () => {
      return await projects.getProjectStatsByPriority();
    }),

    budget: protectedProcedure.query(async () => {
      return await projects.getBudgetStatsByType();
    }),
  }),

  // Sample evaluations
  sampleEvaluations: router({
    list: protectedProcedure.query(async () => {
      return await projects.getSampleEvaluationStats();
    }),

    listByCategory: protectedProcedure
      .input(z.object({ categoryId: z.string() }))
      .query(async ({ input }) => {
        return await projects.getSampleEvaluationsByCategory(input.categoryId);
      }),
  }),
});
