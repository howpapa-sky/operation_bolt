# 하우파파 프로젝트 관리 시스템 - 데이터베이스 스키마 설계

## 1. 개요

기존 스키마를 기반으로 기획서의 요구사항을 반영하여 확장된 데이터베이스 스키마를 설계합니다.

## 2. 핵심 개선 사항

### 2.1 통합 프로젝트 관리 모델
- 기존 `projects` 테이블을 확장하여 모든 프로젝트 유형을 통합 관리
- 프로젝트 유형: 샘플링, 상세페이지 제작, 인플루언서 협업, 제품 발주, 공동구매, 기타

### 2.2 기준 정보 관리 (Master Data)
- 브랜드, 카테고리, 제조사, 평가항목 등을 별도 테이블로 관리
- 데이터 일관성 및 무결성 확보

### 2.3 역할 기반 접근 제어 (RBAC)
- 사용자 역할: admin, manager, user
- 역할별 권한 차등 부여

## 3. 테이블 설계

### 3.1 기존 테이블 유지
- `users`: 사용자 정보 (role 필드에 manager 추가)
- `notifications`: 알림 로그
- `automation_rules`: 자동화 규칙

### 3.2 확장 테이블: projects

```typescript
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
  notes: text("notes"), // 비고란
  
  // 날짜 관리
  startDate: timestamp("startDate"),
  dueDate: timestamp("dueDate"), // 목표일
  completedDate: timestamp("completedDate"), // 완료일
  
  // 담당자
  assignedTo: int("assignedTo"), // 담당자 userId
  createdBy: int("createdBy").notNull(), // 생성자 userId
  
  // === 샘플링 전용 필드 ===
  brandId: int("brandId"), // 브랜드 ID (FK)
  categoryId: int("categoryId"), // 카테고리 ID (FK)
  manufacturerId: int("manufacturerId"), // 제조사 ID (FK)
  sampleCode: varchar("sampleCode", { length: 100 }), // 샘플 코드
  round: int("round"), // 회차
  evaluations: json("evaluations"), // 평가 데이터 배열 [{ evaluatorId, scores: {}, comment, evaluatedAt }]
  
  // === 상세페이지 제작 전용 필드 ===
  productName: varchar("productName", { length: 255 }), // 제품명
  vendorId: int("vendorId"), // 제작 업체 ID (FK)
  workType: mysqlEnum("workType", ["신규", "리뉴얼"]), // 업무 구분
  includesPhotography: boolean("includesPhotography").default(false), // 촬영 포함 여부
  includesPlanning: boolean("includesPlanning").default(false), // 기획 포함 여부
  budget: int("budget"), // 예산 (원)
  
  // === 인플루언서 협업 전용 필드 ===
  collaborationType: mysqlEnum("collaborationType", ["제품협찬", "유가콘텐츠"]), // 협업 유형
  
  // === 제품 발주 전용 필드 ===
  containerMaterialId: int("containerMaterialId"), // 용기 부자재 ID (FK)
  boxMaterialId: int("boxMaterialId"), // 단상자 부자재 ID (FK)
  
  // === 공동구매 전용 필드 ===
  sellerId: int("sellerId"), // 셀러 ID (FK)
  revenue: int("revenue"), // 매출 (원)
  contributionProfit: int("contributionProfit"), // 공헌 이익 (원)
  
  // 파일 첨부
  attachedFiles: json("attachedFiles"), // 첨부 파일 URL 배열
  
  // 타임스탬프
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```

### 3.3 신규 테이블: 기준 정보 관리

#### brands (브랜드)
```typescript
export const brands = mysqlTable("brands", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```

#### categories (카테고리)
```typescript
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  type: mysqlEnum("type", ["화장품", "부자재"]).notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```

#### manufacturers (제조사)
```typescript
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
```

#### vendors (제작 업체)
```typescript
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
```

#### sellers (셀러)
```typescript
export const sellers = mysqlTable("sellers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  platform: varchar("platform", { length: 100 }), // 플랫폼 (예: 쿠팡, 네이버 등)
  contact: varchar("contact", { length: 100 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```

#### evaluationCriteria (평가 항목)
```typescript
export const evaluationCriteria = mysqlTable("evaluation_criteria", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(), // 카테고리 ID (FK)
  name: varchar("name", { length: 255 }).notNull(), // 평가 항목명 (예: 보습력, 발림성)
  description: text("description"),
  displayOrder: int("displayOrder").default(0), // 표시 순서
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```

#### evaluators (평가자)
```typescript
export const evaluators = mysqlTable("evaluators", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  specialty: varchar("specialty", { length: 255 }), // 전문 분야
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```

### 3.4 프로젝트 코멘트 테이블

```typescript
export const projectComments = mysqlTable("project_comments", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```

## 4. 데이터 관계

```
users (1) ----< (N) projects (createdBy, assignedTo)
brands (1) ----< (N) projects (brandId)
categories (1) ----< (N) projects (categoryId)
manufacturers (1) ----< (N) projects (manufacturerId)
vendors (1) ----< (N) projects (vendorId)
sellers (1) ----< (N) projects (sellerId)
categories (1) ----< (N) evaluationCriteria (categoryId)
projects (1) ----< (N) projectComments (projectId)
users (1) ----< (N) projectComments (userId)
```

## 5. 마이그레이션 전략

1. 기존 데이터 백업
2. 신규 테이블 생성 (brands, categories, manufacturers, vendors, sellers, evaluationCriteria, evaluators, projectComments)
3. users 테이블에 manager 역할 추가
4. projects 테이블 확장 (신규 필드 추가)
5. 기존 데이터 마이그레이션
6. 테스트 및 검증

## 6. 다음 단계

- Drizzle ORM을 사용하여 스키마 구현
- 마이그레이션 스크립트 작성 및 실행
- Supabase 데이터베이스에 적용
