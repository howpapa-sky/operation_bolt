import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * 역할에 manager 추가
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "manager", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Brands - 브랜드 관리
 */
export const brands = mysqlTable("brands", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Brand = typeof brands.$inferSelect;
export type InsertBrand = typeof brands.$inferInsert;

/**
 * Categories - 카테고리 관리
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  type: mysqlEnum("type", ["화장품", "부자재"]).notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Manufacturers - 제조사 관리
 */
export const manufacturers = mysqlTable("manufacturers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  contact: varchar("contact", { length: 100 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Manufacturer = typeof manufacturers.$inferSelect;
export type InsertManufacturer = typeof manufacturers.$inferInsert;

/**
 * Vendors - 제작 업체 관리
 */
export const vendors = mysqlTable("vendors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  type: mysqlEnum("type", ["상세페이지", "디자인", "촬영", "기타"]).notNull(),
  contact: varchar("contact", { length: 100 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;

/**
 * Sellers - 셀러 관리
 */
export const sellers = mysqlTable("sellers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  platform: varchar("platform", { length: 100 }),
  contact: varchar("contact", { length: 100 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Seller = typeof sellers.$inferSelect;
export type InsertSeller = typeof sellers.$inferInsert;

/**
 * Evaluators - 평가자 관리
 */
export const evaluators = mysqlTable("evaluators", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  specialty: varchar("specialty", { length: 255 }),
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Evaluator = typeof evaluators.$inferSelect;
export type InsertEvaluator = typeof evaluators.$inferInsert;

/**
 * Evaluation Criteria - 평가 항목 관리
 */
export const evaluationCriteria = mysqlTable("evaluation_criteria", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  displayOrder: int("displayOrder").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EvaluationCriterion = typeof evaluationCriteria.$inferSelect;
export type InsertEvaluationCriterion = typeof evaluationCriteria.$inferInsert;

/**
 * Projects table - 통합 프로젝트 관리
 */
export const projects = mysqlTable("projects", {
  // 기본 정보
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", [
    "샘플링",
    "상세페이지",
    "인플루언서",
    "제품발주",
    "공동구매",
    "기타"
  ]).notNull(),
  
  // 공통 프로젝트 속성
  status: mysqlEnum("status", ["진행전", "진행중", "완료", "보류"]).default("진행전").notNull(),
  priority: mysqlEnum("priority", ["높음", "보통", "낮음"]).default("보통"),
  description: text("description"),
  notes: text("notes"),
  
  // 날짜 관리
  startDate: timestamp("startDate"),
  dueDate: timestamp("dueDate"),
  completedDate: timestamp("completedDate"),
  
  // 담당자
  assignedTo: int("assignedTo"),
  createdBy: int("createdBy").notNull(),
  
  // === 샘플링 전용 필드 ===
  brandId: int("brandId"),
  categoryId: int("categoryId"),
  manufacturerId: int("manufacturerId"),
  sampleCode: varchar("sampleCode", { length: 100 }),
  round: int("round"),
  evaluations: json("evaluations"), // [{ evaluatorId, scores: {criterionId: score}, comment, evaluatedAt }]
  
  // === 상세페이지 제작 전용 필드 ===
  productName: varchar("productName", { length: 255 }),
  vendorId: int("vendorId"),
  workType: mysqlEnum("workType", ["신규", "리뉴얼"]),
  includesPhotography: boolean("includesPhotography").default(false),
  includesPlanning: boolean("includesPlanning").default(false),
  budget: int("budget"),
  
  // === 인플루언서 협업 전용 필드 ===
  collaborationType: mysqlEnum("collaborationType", ["제품협찬", "유가콘텐츠"]),
  
  // === 제품 발주 전용 필드 ===
  containerMaterialId: int("containerMaterialId"),
  boxMaterialId: int("boxMaterialId"),
  
  // === 공동구매 전용 필드 ===
  sellerId: int("sellerId"),
  revenue: int("revenue"),
  contributionProfit: int("contributionProfit"),
  
  // 파일 첨부
  attachedFiles: json("attachedFiles"),
  
  // 타임스탬프
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Project Comments - 프로젝트 코멘트
 */
export const projectComments = mysqlTable("project_comments", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectComment = typeof projectComments.$inferSelect;
export type InsertProjectComment = typeof projectComments.$inferInsert;

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
  assignedTo: int("assignedTo"),
  dependsOn: int("dependsOn"),
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
  instagramId: varchar("instagramId", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  followerCount: int("followerCount"),
  category: varchar("category", { length: 100 }),
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
  contractAmount: int("contractAmount"),
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
  unitPrice: int("unitPrice").notNull(),
  totalAmount: int("totalAmount").notNull(),
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
  impressions: int("impressions"),
  clicks: int("clicks"),
  spend: int("spend"),
  conversions: int("conversions"),
  revenue: int("revenue"),
  roas: int("roas"),
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
  triggerConfig: text("triggerConfig"),
  actionType: mysqlEnum("actionType", ["이메일", "알림", "태스크생성", "리포트"]).notNull(),
  actionConfig: text("actionConfig"),
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
  relatedType: varchar("relatedType", { length: 50 }),
  relatedId: int("relatedId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
