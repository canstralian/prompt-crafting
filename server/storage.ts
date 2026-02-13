import {
  users, type User,
  learnCategories, type LearnCategory,
  learnPosts, type LearnPost,
  drafts, type Draft,
  testRuns, type TestRun,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

/**
 * Simple in-memory cache for read-heavy, infrequently changing data.
 * Entries expire after a configurable TTL (default 5 minutes).
 */
class QueryCache {
  private cache = new Map<string, { data: unknown; expiresAt: number }>();
  private defaultTtlMs: number;

  constructor(defaultTtlMs = 5 * 60 * 1000) {
    this.defaultTtlMs = defaultTtlMs;
  }

  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.data as T;
  }

  set(key: string, data: unknown, ttlMs?: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTtlMs),
    });
  }

  invalidate(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }
}

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
  private queryCache = new QueryCache();

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
    this.queryCache.invalidate("admin:");
    return user;
  }

  async getLearnCategories(): Promise<LearnCategory[]> {
    const cacheKey = "categories:all";
    const cached = this.queryCache.get<LearnCategory[]>(cacheKey);
    if (cached) return cached;

    const result = await db.select().from(learnCategories).orderBy(learnCategories.name);
    this.queryCache.set(cacheKey, result);
    return result;
  }

  async getLearnPosts(categoryId?: number, categorySlug?: string): Promise<(LearnPost & { category?: LearnCategory })[]> {
    const cacheKey = `posts:${categoryId || ""}:${categorySlug || ""}`;
    const cached = this.queryCache.get<(LearnPost & { category?: LearnCategory })[]>(cacheKey);
    if (cached) return cached;

    const conditions = [eq(learnPosts.isPublished, true)];
    if (categoryId) {
      conditions.push(eq(learnPosts.categoryId, categoryId));
    }
    // Filter by slug via the joined category table directly — eliminates the
    // extra round-trip query that previously fetched the category first.
    if (categorySlug) {
      conditions.push(eq(learnCategories.slug, categorySlug));
    }
    const rows = await db
      .select()
      .from(learnPosts)
      .leftJoin(learnCategories, eq(learnPosts.categoryId, learnCategories.id))
      .where(and(...conditions))
      .orderBy(desc(learnPosts.createdAt));

    // When filtering by slug and the category doesn't exist the join yields 0
    // rows — the same semantics as the previous implementation.
    const result = rows.map((r) => ({ ...r.learn_posts, category: r.learn_categories || undefined }));
    this.queryCache.set(cacheKey, result);
    return result;
  }

  async getLearnPostBySlug(slug: string): Promise<(LearnPost & { category?: LearnCategory }) | undefined> {
    const cacheKey = `post:${slug}`;
    const cached = this.queryCache.get<(LearnPost & { category?: LearnCategory }) | undefined>(cacheKey);
    if (cached !== undefined) return cached;

    const rows = await db
      .select()
      .from(learnPosts)
      .leftJoin(learnCategories, eq(learnPosts.categoryId, learnCategories.id))
      .where(and(eq(learnPosts.slug, slug), eq(learnPosts.isPublished, true)));
    if (rows.length === 0) return undefined;
    const result = { ...rows[0].learn_posts, category: rows[0].learn_categories || undefined };
    this.queryCache.set(cacheKey, result);
    return result;
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
    const cacheKey = "admin:stats";
    const cached = this.queryCache.get<{ totalUsers: number; totalPosts: number; totalCategories: number; totalAdmins: number }>(cacheKey);
    if (cached) return cached;

    // Batch all counts into a single query to eliminate N+1 pattern
    const [row] = await db.select({
      totalUsers: sql<number>`(SELECT count(*) FROM users)`,
      totalPosts: sql<number>`(SELECT count(*) FROM learn_posts)`,
      totalCategories: sql<number>`(SELECT count(*) FROM learn_categories)`,
      totalAdmins: sql<number>`(SELECT count(*) FROM users WHERE role = 'admin')`,
    }).from(sql`(SELECT 1) AS _`);

    const result = {
      totalUsers: Number(row.totalUsers),
      totalPosts: Number(row.totalPosts),
      totalCategories: Number(row.totalCategories),
      totalAdmins: Number(row.totalAdmins),
    };
    this.queryCache.set(cacheKey, result, 60 * 1000); // 1 minute for admin stats
    return result;
  }
}

export const storage = new DatabaseStorage();
