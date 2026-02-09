import {
  users, type User,
  learnCategories, type LearnCategory,
  learnPosts, type LearnPost,
  drafts, type Draft,
  testRuns, type TestRun,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

type DbInsertUser = typeof users.$inferInsert;
type DbInsertDraft = typeof drafts.$inferInsert;
type DbInsertTestRun = typeof testRuns.$inferInsert;

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: DbInsertUser): Promise<User>;

  getLearnCategories(): Promise<LearnCategory[]>;
  getLearnPosts(categoryId?: number, categorySlug?: string): Promise<(LearnPost & { category?: LearnCategory })[]>;
  getLearnPostBySlug(slug: string): Promise<(LearnPost & { category?: LearnCategory }) | undefined>;

  getDraft(id: number): Promise<Draft | undefined>;
  createDraft(draft: DbInsertDraft): Promise<Draft>;

  getTestRunsByUserId(userId: number): Promise<TestRun[]>;
  getTestRun(id: number): Promise<TestRun | undefined>;
  createTestRun(testRun: DbInsertTestRun): Promise<TestRun>;
  updateTestRunRatings(id: number, ratings: { ratingClarity: number; ratingCompleteness: number; ratingCorrectness: number; ratingStyleMatch: number; notes?: string }): Promise<TestRun | undefined>;

  getAdminStats(): Promise<{ totalUsers: number; totalPosts: number; totalCategories: number; totalAdmins: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: DbInsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getLearnCategories(): Promise<LearnCategory[]> {
    return db.select().from(learnCategories).orderBy(learnCategories.name);
  }

  async getLearnPosts(categoryId?: number, categorySlug?: string): Promise<(LearnPost & { category?: LearnCategory })[]> {
    const conditions = [eq(learnPosts.isPublished, true)];
    if (categoryId) {
      conditions.push(eq(learnPosts.categoryId, categoryId));
    }
    if (categorySlug) {
      const [cat] = await db.select().from(learnCategories).where(eq(learnCategories.slug, categorySlug));
      if (cat) {
        conditions.push(eq(learnPosts.categoryId, cat.id));
      } else {
        return [];
      }
    }
    const rows = await db
      .select()
      .from(learnPosts)
      .leftJoin(learnCategories, eq(learnPosts.categoryId, learnCategories.id))
      .where(and(...conditions))
      .orderBy(desc(learnPosts.createdAt));
    return rows.map((r) => ({ ...r.learn_posts, category: r.learn_categories || undefined }));
  }

  async getLearnPostBySlug(slug: string): Promise<(LearnPost & { category?: LearnCategory }) | undefined> {
    const rows = await db
      .select()
      .from(learnPosts)
      .leftJoin(learnCategories, eq(learnPosts.categoryId, learnCategories.id))
      .where(and(eq(learnPosts.slug, slug), eq(learnPosts.isPublished, true)));
    if (rows.length === 0) return undefined;
    return { ...rows[0].learn_posts, category: rows[0].learn_categories || undefined };
  }

  async getDraft(id: number): Promise<Draft | undefined> {
    const [draft] = await db.select().from(drafts).where(eq(drafts.id, id));
    return draft || undefined;
  }

  async createDraft(draft: DbInsertDraft): Promise<Draft> {
    const [created] = await db.insert(drafts).values(draft).returning();
    return created;
  }

  async getTestRunsByUserId(userId: number): Promise<TestRun[]> {
    return db.select().from(testRuns).where(eq(testRuns.userId, userId)).orderBy(desc(testRuns.createdAt));
  }

  async getTestRun(id: number): Promise<TestRun | undefined> {
    const [run] = await db.select().from(testRuns).where(eq(testRuns.id, id));
    return run || undefined;
  }

  async createTestRun(testRun: DbInsertTestRun): Promise<TestRun> {
    const [created] = await db.insert(testRuns).values(testRun).returning();
    return created;
  }

  async updateTestRunRatings(id: number, ratings: { ratingClarity: number; ratingCompleteness: number; ratingCorrectness: number; ratingStyleMatch: number; notes?: string }): Promise<TestRun | undefined> {
    const [updated] = await db
      .update(testRuns)
      .set({
        ratingClarity: ratings.ratingClarity,
        ratingCompleteness: ratings.ratingCompleteness,
        ratingCorrectness: ratings.ratingCorrectness,
        ratingStyleMatch: ratings.ratingStyleMatch,
        notes: ratings.notes || null,
        updatedAt: new Date(),
      })
      .where(eq(testRuns.id, id))
      .returning();
    return updated || undefined;
  }

  async getAdminStats(): Promise<{ totalUsers: number; totalPosts: number; totalCategories: number; totalAdmins: number }> {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [postCount] = await db.select({ count: sql<number>`count(*)` }).from(learnPosts);
    const [catCount] = await db.select({ count: sql<number>`count(*)` }).from(learnCategories);
    const [adminCount] = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "admin"));
    return {
      totalUsers: Number(userCount.count),
      totalPosts: Number(postCount.count),
      totalCategories: Number(catCount.count),
      totalAdmins: Number(adminCount.count),
    };
  }
}

export const storage = new DatabaseStorage();
