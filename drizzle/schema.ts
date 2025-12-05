import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Projects table - 제품 개발 프로젝트 관리
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["샘플링", "인플루언서", "제품발주", "상세페이지"]).notNull(),
  status: mysqlEnum("status", ["진행전", "진행중", "완료", "보류"]).default("진행전").notNull(),
  priority: mysqlEnum("priority", ["높음", "보통", "낮음"]).default("보통"),
  description: text("description"),
  startDate: timestamp("startDate"),
  dueDate: timestamp("dueDate"),
  completedDate: timestamp("completedDate"),
  assignedTo: int("assignedTo"), // userId
  createdBy: int("createdBy").notNull(), // userId
  // 샘플 관리 전용 필드
  brand: varchar("brand", { length: 255 }), // 브랜드명
  manufacturer: varchar("manufacturer", { length: 255 }), // 제조사
  round: int("round"), // 회차
  sampleCode: varchar("sampleCode", { length: 100 }), // 샘플 코드
  projectSubtype: varchar("projectSubtype", { length: 100 }), // 세부 유형: 크림, 토너패드, 앰플, 로션, 미스트 등
  evaluationScores: json("evaluationScores"), // 평가 점수 JSON
  evaluatorId: int("evaluatorId"), // 평가자 userId
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Project tasks - 프로젝트 내 세부 작업
 */
export const projectTasks = mysqlTable("project_tasks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["대기", "진행중", "완료", "보류"]).default("대기").notNull(),
  priority: mysqlEnum("priority", ["높음", "보통", "낮음"]).default("보통"),
  assignedTo: int("assignedTo"), // userId
  dependsOn: int("dependsOn"), // taskId - 선행 작업
  dueDate: timestamp("dueDate"),
  completedDate: timestamp("completedDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectTask = typeof projectTasks.$inferSelect;
export type InsertProjectTask = typeof projectTasks.$inferInsert;

/**
 * Influencers table - 인플루언서 관리
 */
export const influencers = mysqlTable("influencers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  instagramHandle: varchar("instagramHandle", { length: 255 }),
  instagramId: varchar("instagramId", { length: 255 }), // Instagram user ID for API
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  followerCount: int("followerCount"),
  category: varchar("category", { length: 100 }), // 뷰티, 라이프스타일 등
  notes: text("notes"),
  status: mysqlEnum("status", ["활성", "비활성", "계약종료"]).default("활성").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Influencer = typeof influencers.$inferSelect;
export type InsertInfluencer = typeof influencers.$inferInsert;

/**
 * Influencer campaigns - 인플루언서 캠페인
 */
export const influencerCampaigns = mysqlTable("influencer_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  influencerId: int("influencerId").notNull(),
  projectId: int("projectId"),
  campaignName: varchar("campaignName", { length: 255 }).notNull(),
  productName: varchar("productName", { length: 255 }),
  contractAmount: int("contractAmount"), // 계약 금액 (원)
  postType: mysqlEnum("postType", ["피드", "릴스", "스토리", "기타"]),
  postUrl: varchar("postUrl", { length: 500 }),
  postDate: timestamp("postDate"),
  likes: int("likes"),
  comments: int("comments"),
  views: int("views"),
  reach: int("reach"),
  status: mysqlEnum("status", ["계획", "진행중", "완료", "취소"]).default("계획").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InfluencerCampaign = typeof influencerCampaigns.$inferSelect;
export type InsertInfluencerCampaign = typeof influencerCampaigns.$inferInsert;

/**
 * Sales data - 쇼핑몰 매출 데이터
 */
export const salesData = mysqlTable("sales_data", {
  id: int("id").autoincrement().primaryKey(),
  platform: mysqlEnum("platform", ["카페24", "쿠팡", "스마트스토어"]).notNull(),
  orderId: varchar("orderId", { length: 255 }).notNull(),
  orderDate: timestamp("orderDate").notNull(),
  productName: varchar("productName", { length: 255 }),
  quantity: int("quantity").notNull(),
  unitPrice: int("unitPrice").notNull(), // 단가 (원)
  totalAmount: int("totalAmount").notNull(), // 총 금액 (원)
  status: mysqlEnum("status", ["주문완료", "배송중", "배송완료", "취소", "환불"]).notNull(),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SalesData = typeof salesData.$inferSelect;
export type InsertSalesData = typeof salesData.$inferInsert;

/**
 * Ad campaigns - 광고 캠페인 데이터
 */
export const adCampaigns = mysqlTable("ad_campaigns", {
  id: int("id").autoincrement().primaryKey(),
  platform: mysqlEnum("platform", ["메타", "네이버"]).notNull(),
  campaignId: varchar("campaignId", { length: 255 }).notNull(),
  campaignName: varchar("campaignName", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  impressions: int("impressions"), // 노출수
  clicks: int("clicks"), // 클릭수
  spend: int("spend"), // 지출 (원)
  conversions: int("conversions"), // 전환수
  revenue: int("revenue"), // 매출 (원)
  roas: int("roas"), // ROAS (%) - stored as integer (e.g., 250 = 250%)
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdCampaign = typeof adCampaigns.$inferSelect;
export type InsertAdCampaign = typeof adCampaigns.$inferInsert;

/**
 * Automation rules - 자동화 규칙
 */
export const automationRules = mysqlTable("automation_rules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  triggerType: mysqlEnum("triggerType", ["시간", "이벤트", "조건"]).notNull(),
  triggerConfig: text("triggerConfig"), // JSON string
  actionType: mysqlEnum("actionType", ["이메일", "알림", "태스크생성", "리포트"]).notNull(),
  actionConfig: text("actionConfig"), // JSON string
  isActive: boolean("isActive").default(true).notNull(),
  lastRun: timestamp("lastRun"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutomationRule = typeof automationRules.$inferSelect;
export type InsertAutomationRule = typeof automationRules.$inferInsert;

/**
 * Notifications - 알림 로그
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["정보", "경고", "에러", "성공"]).default("정보").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  isRead: boolean("isRead").default(false).notNull(),
  relatedType: varchar("relatedType", { length: 50 }), // project, influencer, sales, ad
  relatedId: int("relatedId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
