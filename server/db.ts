import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  projects, 
  InsertProject,
  Project,
  projectTasks,
  InsertProjectTask,
  ProjectTask,
  influencers,
  InsertInfluencer,
  Influencer,
  influencerCampaigns,
  InsertInfluencerCampaign,
  InfluencerCampaign,
  salesData,
  InsertSalesData,
  SalesData,
  adCampaigns,
  InsertAdCampaign,
  AdCampaign,
  automationRules,
  InsertAutomationRule,
  AutomationRule,
  notifications,
  InsertNotification,
  Notification
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== User Functions ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

// ==================== Project Functions ====================

export async function createProject(project: InsertProject): Promise<Project> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(projects).values(project);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(projects).where(eq(projects.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getProjectById(id: number): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0];
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(projects).orderBy(desc(projects.createdAt));
}

export async function getProjectsByStatus(status: string): Promise<Project[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(projects).where(eq(projects.status, status as any)).orderBy(desc(projects.createdAt));
}

export async function updateProject(id: number, updates: Partial<InsertProject>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set(updates).where(eq(projects.id, id));
}

export async function deleteProject(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(projects).where(eq(projects.id, id));
}

// ==================== Project Task Functions ====================

export async function createProjectTask(task: InsertProjectTask): Promise<ProjectTask> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(projectTasks).values(task);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(projectTasks).where(eq(projectTasks.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getTasksByProjectId(projectId: number): Promise<ProjectTask[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(projectTasks).where(eq(projectTasks.projectId, projectId)).orderBy(desc(projectTasks.createdAt));
}

export async function updateProjectTask(id: number, updates: Partial<InsertProjectTask>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projectTasks).set(updates).where(eq(projectTasks.id, id));
}

export async function deleteProjectTask(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(projectTasks).where(eq(projectTasks.id, id));
}

// ==================== Influencer Functions ====================

export async function createInfluencer(influencer: InsertInfluencer): Promise<Influencer> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(influencers).values(influencer);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(influencers).where(eq(influencers.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getAllInfluencers(): Promise<Influencer[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(influencers).orderBy(desc(influencers.createdAt));
}

export async function getInfluencerById(id: number): Promise<Influencer | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(influencers).where(eq(influencers.id, id)).limit(1);
  return result[0];
}

export async function updateInfluencer(id: number, updates: Partial<InsertInfluencer>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(influencers).set(updates).where(eq(influencers.id, id));
}

export async function deleteInfluencer(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(influencers).where(eq(influencers.id, id));
}

// ==================== Influencer Campaign Functions ====================

export async function createInfluencerCampaign(campaign: InsertInfluencerCampaign): Promise<InfluencerCampaign> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(influencerCampaigns).values(campaign);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(influencerCampaigns).where(eq(influencerCampaigns.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getCampaignsByInfluencerId(influencerId: number): Promise<InfluencerCampaign[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(influencerCampaigns).where(eq(influencerCampaigns.influencerId, influencerId)).orderBy(desc(influencerCampaigns.createdAt));
}

export async function getAllCampaigns(): Promise<InfluencerCampaign[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(influencerCampaigns).orderBy(desc(influencerCampaigns.createdAt));
}

export async function updateInfluencerCampaign(id: number, updates: Partial<InsertInfluencerCampaign>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(influencerCampaigns).set(updates).where(eq(influencerCampaigns.id, id));
}

// ==================== Sales Data Functions ====================

export async function createSalesData(data: InsertSalesData): Promise<SalesData> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(salesData).values(data);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(salesData).where(eq(salesData.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getAllSalesData(): Promise<SalesData[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(salesData).orderBy(desc(salesData.orderDate));
}

export async function getSalesDataByPlatform(platform: string): Promise<SalesData[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(salesData).where(eq(salesData.platform, platform as any)).orderBy(desc(salesData.orderDate));
}

// ==================== Ad Campaign Functions ====================

export async function createAdCampaign(campaign: InsertAdCampaign): Promise<AdCampaign> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(adCampaigns).values(campaign);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(adCampaigns).where(eq(adCampaigns.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getAllAdCampaigns(): Promise<AdCampaign[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(adCampaigns).orderBy(desc(adCampaigns.date));
}

export async function getAdCampaignsByPlatform(platform: string): Promise<AdCampaign[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(adCampaigns).where(eq(adCampaigns.platform, platform as any)).orderBy(desc(adCampaigns.date));
}

// ==================== Automation Rule Functions ====================

export async function createAutomationRule(rule: InsertAutomationRule): Promise<AutomationRule> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(automationRules).values(rule);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(automationRules).where(eq(automationRules.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getAllAutomationRules(): Promise<AutomationRule[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(automationRules).orderBy(desc(automationRules.createdAt));
}

export async function getActiveAutomationRules(): Promise<AutomationRule[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(automationRules).where(eq(automationRules.isActive, true)).orderBy(desc(automationRules.createdAt));
}

export async function updateAutomationRule(id: number, updates: Partial<InsertAutomationRule>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(automationRules).set(updates).where(eq(automationRules.id, id));
}

// ==================== Notification Functions ====================

export async function createNotification(notification: InsertNotification): Promise<Notification> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(notifications).values(notification);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(notifications).where(eq(notifications.id, insertedId)).limit(1);
  return inserted[0]!;
}

export async function getNotificationsByUserId(userId: number): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotifications(userId: number): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
    .orderBy(desc(notifications.createdAt));
}

export async function markNotificationAsRead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}
