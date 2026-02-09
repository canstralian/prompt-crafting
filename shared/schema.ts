import { pgTable, text, serial, boolean, timestamp, integer, numeric, jsonb, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").default("User"),
  avatarUrl: text("avatar_url"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  drafts: many(drafts),
  testRuns: many(testRuns),
}));

export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  fullName: z.string().optional(),
  avatarUrl: z.string().optional(),
  role: z.string().optional(),
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const learnCategories = pgTable("learn_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const learnCategoriesRelations = relations(learnCategories, ({ many }) => ({
  posts: many(learnPosts),
}));

export const insertLearnCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
});
export type InsertLearnCategory = z.infer<typeof insertLearnCategorySchema>;
export type LearnCategory = typeof learnCategories.$inferSelect;

export const learnPosts = pgTable("learn_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  categoryId: integer("category_id").references(() => learnCategories.id),
  tags: text("tags").array().default(sql`'{}'::text[]`),
  summary: text("summary"),
  bodyMarkdown: text("body_markdown").notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const learnPostsRelations = relations(learnPosts, ({ one }) => ({
  category: one(learnCategories, {
    fields: [learnPosts.categoryId],
    references: [learnCategories.id],
  }),
}));

export const insertLearnPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  categoryId: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
  summary: z.string().optional(),
  bodyMarkdown: z.string().min(1),
  isPublished: z.boolean().optional(),
});
export type InsertLearnPost = z.infer<typeof insertLearnPostSchema>;
export type LearnPost = typeof learnPosts.$inferSelect;

export const outputFormatEnum = pgEnum("output_format", ["bullets", "table", "json", "email"]);

export const drafts = pgTable("drafts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  sessionId: text("session_id"),
  source: text("source").notNull(),
  goal: text("goal").notNull(),
  context: text("context").default(""),
  outputFormat: text("output_format").notNull(),
  sectionsJson: jsonb("sections_json").default(sql`'[]'::jsonb`),
  compiledPrompt: text("compiled_prompt"),
  metaJson: jsonb("meta_json").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const draftsRelations = relations(drafts, ({ one }) => ({
  user: one(users, {
    fields: [drafts.userId],
    references: [users.id],
  }),
}));

export const insertDraftSchema = z.object({
  userId: z.number().int().nullable().optional(),
  sessionId: z.string().nullable().optional(),
  source: z.string().min(1, "Source is required"),
  goal: z.string().min(1, "Goal is required"),
  context: z.string().optional().default(""),
  outputFormat: z.enum(["bullets", "table", "json", "email"]),
  sectionsJson: z.any().optional(),
  compiledPrompt: z.string().nullable().optional(),
  metaJson: z.any().optional(),
  expiresAt: z.date().optional(),
});
export type InsertDraft = z.infer<typeof insertDraftSchema>;
export type Draft = typeof drafts.$inferSelect;

export const testRuns = pgTable("test_runs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  draftId: integer("draft_id").references(() => drafts.id, { onDelete: "set null" }),
  promptTitle: text("prompt_title").notNull(),
  systemPrompt: text("system_prompt"),
  userPrompt: text("user_prompt").notNull(),
  inputVariables: jsonb("input_variables").default(sql`'{}'::jsonb`),
  outputs: jsonb("outputs").notNull().default(sql`'[]'::jsonb`),
  ratingClarity: integer("rating_clarity"),
  ratingCompleteness: integer("rating_completeness"),
  ratingCorrectness: integer("rating_correctness"),
  ratingStyleMatch: integer("rating_style_match"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const testRunsRelations = relations(testRuns, ({ one }) => ({
  user: one(users, {
    fields: [testRuns.userId],
    references: [users.id],
  }),
  draft: one(drafts, {
    fields: [testRuns.draftId],
    references: [drafts.id],
  }),
}));

export const insertTestRunSchema = z.object({
  userId: z.number().int(),
  draftId: z.number().int().nullable().optional(),
  promptTitle: z.string().min(1, "Prompt title is required"),
  systemPrompt: z.string().nullable().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
  inputVariables: z.any().optional(),
  outputs: z.any().optional(),
  ratingClarity: z.number().int().min(1).max(5).nullable().optional(),
  ratingCompleteness: z.number().int().min(1).max(5).nullable().optional(),
  ratingCorrectness: z.number().int().min(1).max(5).nullable().optional(),
  ratingStyleMatch: z.number().int().min(1).max(5).nullable().optional(),
  notes: z.string().nullable().optional(),
});
export type InsertTestRun = z.infer<typeof insertTestRunSchema>;
export type TestRun = typeof testRuns.$inferSelect;
