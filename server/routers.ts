import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ==================== Project Management ====================
  projects: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllProjects();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProjectById(input.id);
      }),

    getByStatus: protectedProcedure
      .input(z.object({ status: z.enum(["진행전", "진행중", "완료", "보류"]) }))
      .query(async ({ input }) => {
        return await db.getProjectsByStatus(input.status);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        type: z.enum(["샘플링", "인플루언서", "제품발주", "상세페이지"]),
        status: z.enum(["진행전", "진행중", "완료", "보류"]).optional(),
        priority: z.enum(["높음", "보통", "낮음"]).optional(),
        description: z.string().optional(),
        startDate: z.date().optional(),
        dueDate: z.date().optional(),
        assignedTo: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createProject({
          ...input,
          createdBy: ctx.user.id,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        type: z.enum(["샘플링", "인플루언서", "제품발주", "상세페이지"]).optional(),
        status: z.enum(["진행전", "진행중", "완료", "보류"]).optional(),
        priority: z.enum(["높음", "보통", "낮음"]).optional(),
        description: z.string().optional(),
        startDate: z.date().optional(),
        dueDate: z.date().optional(),
        completedDate: z.date().optional(),
        assignedTo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateProject(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProject(input.id);
        return { success: true };
      }),
  }),

  // ==================== Project Tasks ====================
  tasks: router({
    listByProject: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input }) => {
        return await db.getTasksByProjectId(input.projectId);
      }),

    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        status: z.enum(["대기", "진행중", "완료", "보류"]).optional(),
        priority: z.enum(["높음", "보통", "낮음"]).optional(),
        assignedTo: z.number().optional(),
        dependsOn: z.number().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createProjectTask(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["대기", "진행중", "완료", "보류"]).optional(),
        priority: z.enum(["높음", "보통", "낮음"]).optional(),
        assignedTo: z.number().optional(),
        dependsOn: z.number().optional(),
        dueDate: z.date().optional(),
        completedDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateProjectTask(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProjectTask(input.id);
        return { success: true };
      }),
  }),

  // ==================== Influencer Management ====================
  influencers: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllInfluencers();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getInfluencerById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        instagramHandle: z.string().optional(),
        instagramId: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        followerCount: z.number().optional(),
        category: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(["활성", "비활성", "계약종료"]).optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createInfluencer(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        instagramHandle: z.string().optional(),
        instagramId: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        followerCount: z.number().optional(),
        category: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(["활성", "비활성", "계약종료"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateInfluencer(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteInfluencer(input.id);
        return { success: true };
      }),
  }),

  // ==================== Influencer Campaigns ====================
  campaigns: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllCampaigns();
    }),

    listByInfluencer: protectedProcedure
      .input(z.object({ influencerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCampaignsByInfluencerId(input.influencerId);
      }),

    create: protectedProcedure
      .input(z.object({
        influencerId: z.number(),
        projectId: z.number().optional(),
        campaignName: z.string(),
        productName: z.string().optional(),
        contractAmount: z.number().optional(),
        postType: z.enum(["피드", "릴스", "스토리", "기타"]).optional(),
        postUrl: z.string().optional(),
        postDate: z.date().optional(),
        likes: z.number().optional(),
        comments: z.number().optional(),
        views: z.number().optional(),
        reach: z.number().optional(),
        status: z.enum(["계획", "진행중", "완료", "취소"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createInfluencerCampaign(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        campaignName: z.string().optional(),
        productName: z.string().optional(),
        contractAmount: z.number().optional(),
        postType: z.enum(["피드", "릴스", "스토리", "기타"]).optional(),
        postUrl: z.string().optional(),
        postDate: z.date().optional(),
        likes: z.number().optional(),
        comments: z.number().optional(),
        views: z.number().optional(),
        reach: z.number().optional(),
        status: z.enum(["계획", "진행중", "완료", "취소"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateInfluencerCampaign(id, updates);
        return { success: true };
      }),
  }),

  // ==================== Sales Data ====================
  sales: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllSalesData();
    }),

    listByPlatform: protectedProcedure
      .input(z.object({ platform: z.enum(["카페24", "쿠팡", "스마트스토어"]) }))
      .query(async ({ input }) => {
        return await db.getSalesDataByPlatform(input.platform);
      }),

    create: protectedProcedure
      .input(z.object({
        platform: z.enum(["카페24", "쿠팡", "스마트스토어"]),
        orderId: z.string(),
        orderDate: z.date(),
        productName: z.string().optional(),
        quantity: z.number(),
        unitPrice: z.number(),
        totalAmount: z.number(),
        status: z.enum(["주문완료", "배송중", "배송완료", "취소", "환불"]),
      }))
      .mutation(async ({ input }) => {
        return await db.createSalesData(input);
      }),
  }),

  // ==================== Ad Campaigns ====================
  ads: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllAdCampaigns();
    }),

    listByPlatform: protectedProcedure
      .input(z.object({ platform: z.enum(["메타", "네이버"]) }))
      .query(async ({ input }) => {
        return await db.getAdCampaignsByPlatform(input.platform);
      }),

    create: protectedProcedure
      .input(z.object({
        platform: z.enum(["메타", "네이버"]),
        campaignId: z.string(),
        campaignName: z.string(),
        date: z.date(),
        impressions: z.number().optional(),
        clicks: z.number().optional(),
        spend: z.number().optional(),
        conversions: z.number().optional(),
        revenue: z.number().optional(),
        roas: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createAdCampaign(input);
      }),
  }),

  // ==================== Automation Rules ====================
  automation: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllAutomationRules();
    }),

    listActive: protectedProcedure.query(async () => {
      return await db.getActiveAutomationRules();
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        triggerType: z.enum(["시간", "이벤트", "조건"]),
        triggerConfig: z.string().optional(),
        actionType: z.enum(["이메일", "알림", "태스크생성", "리포트"]),
        actionConfig: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.createAutomationRule({
          ...input,
          createdBy: ctx.user.id,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        triggerType: z.enum(["시간", "이벤트", "조건"]).optional(),
        triggerConfig: z.string().optional(),
        actionType: z.enum(["이메일", "알림", "태스크생성", "리포트"]).optional(),
        actionConfig: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateAutomationRule(id, updates);
        return { success: true };
      }),
  }),

  // ==================== Notifications ====================
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getNotificationsByUserId(ctx.user.id);
    }),

    unread: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUnreadNotifications(ctx.user.id);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),

    create: protectedProcedure
      .input(z.object({
        userId: z.number(),
        type: z.enum(["정보", "경고", "에러", "성공"]).optional(),
        title: z.string(),
        message: z.string().optional(),
        relatedType: z.string().optional(),
        relatedId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createNotification(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
