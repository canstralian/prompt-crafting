import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDraftSchema, insertTestRunSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { z } from "zod";
import { requireAuth, requireAdmin, authRateLimit, sanitizeError, csrfProtection } from "./middleware";

const loginSchema = z.object({
  email: z.string().email("Invalid email format").transform((e) => e.toLowerCase().trim()),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email format").transform((e) => e.toLowerCase().trim()),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  fullName: z.string().max(200).optional(),
});

const createDraftSchema = insertDraftSchema
  .pick({ source: true, goal: true, outputFormat: true, context: true })
  .extend({
    source: z.string().min(1, "Source is required").max(500),
    goal: z.string().min(1, "Goal is required").max(2000),
    context: z.string().max(5000).optional().default(""),
    generate: z.boolean().optional().default(false),
  });

const createTestRunSchema = insertTestRunSchema
  .omit({ userId: true })
  .extend({
    promptTitle: z.string().min(1, "Prompt title is required").max(500),
    userPrompt: z.string().min(1, "User prompt is required").max(10000),
    systemPrompt: z.string().max(10000).nullable().optional(),
    inputVariables: z.record(z.string(), z.unknown()).optional().default({}),
    outputs: z.array(z.unknown()).optional().default([]),
    draftId: z.number().int().positive().nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
  });

const ratingsSchema = z.object({
  clarity: z.number().int().min(1).max(5),
  completeness: z.number().int().min(1).max(5),
  correctness: z.number().int().min(1).max(5),
  styleMatch: z.number().int().min(1).max(5),
  notes: z.string().max(2000).optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use("/api/", csrfProtection);

  app.post("/api/auth/register", authRateLimit, async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }
      const { email, password, fullName } = parsed.data;
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        fullName: fullName || "User",
      });
      (req as any).session.userId = user.id;
      const { password: _, ...safeUser } = user;
      return res.status(201).json({ user: safeUser });
    } catch (err: unknown) {
      return res.status(500).json({ error: sanitizeError(err) });
    }
  });

  app.post("/api/auth/login", authRateLimit, async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }
      const { email, password } = parsed.data;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      (req as any).session.userId = user.id;
      const { password: _, ...safeUser } = user;
      return res.json({ user: safeUser });
    } catch (err: unknown) {
      return res.status(500).json({ error: sanitizeError(err) });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) return res.status(500).json({ error: "Failed to logout" });
      res.clearCookie("sid");
      return res.json({ ok: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    const userId = (req as any).session?.userId;
    if (!userId) {
      return res.json({ user: null });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.json({ user: null });
    }
    const { password: _, ...safeUser } = user;
    return res.json({ user: safeUser });
  });

  app.get("/api/learn/categories", async (_req, res) => {
    try {
      const categories = await storage.getLearnCategories();
      res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
      return res.json(categories);
    } catch (err: unknown) {
      return res.status(500).json({ error: sanitizeError(err) });
    }
  });

  app.get("/api/learn/posts", async (req, res) => {
    try {
      const categorySlug = req.query.categorySlug as string | undefined;
      const posts = await storage.getLearnPosts(undefined, categorySlug);
      res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
      return res.json(posts);
    } catch (err: unknown) {
      return res.status(500).json({ error: sanitizeError(err) });
    }
  });

  app.get("/api/learn/posts/:slug", async (req, res) => {
    try {
      const slug = req.params.slug;
      if (!slug || slug.length > 200) {
        return res.status(400).json({ error: "Invalid slug" });
      }
      const post = await storage.getLearnPostBySlug(slug);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
      return res.json(post);
    } catch (err: unknown) {
      return res.status(500).json({ error: sanitizeError(err) });
    }
  });

  app.post("/api/drafts", async (req, res) => {
    try {
      const parsed = createDraftSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const userId = (req as any).session?.userId;
      const { source, goal, outputFormat, context, generate } = parsed.data;

      const sectionsJson = {
        role: { title: "Role", content: "", placeholder: "Define the AI's role or persona..." },
        objective: { title: "Objective", content: goal, placeholder: "What should the AI accomplish?" },
        context: { title: "Context", content: context, placeholder: "Provide relevant background information..." },
        constraints: { title: "Constraints", content: "", placeholder: "List any limitations or requirements..." },
        output_format: { title: "Output Format", content: outputFormat, placeholder: "Specify the desired output structure..." },
      };

      let compiledPrompt = null;
      if (generate) {
        const parts: string[] = [];
        if (goal) parts.push(`Your task: ${goal}`);
        if (context) parts.push(`Context: ${context}`);
        const formatInstructions: Record<string, string> = {
          bullets: "Format your response as a bulleted list.",
          table: "Format your response as a markdown table.",
          json: "Respond with valid JSON only. No prose or explanation.",
          email: "Format your response as an email with a subject line and body.",
        };
        parts.push(formatInstructions[outputFormat] || "");
        compiledPrompt = parts.join("\n\n");
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const draft = await storage.createDraft({
        userId: userId || null,
        sessionId: userId ? null : (req as any).sessionID,
        source,
        goal,
        outputFormat,
        context,
        sectionsJson,
        compiledPrompt,
        expiresAt,
      });

      return res.status(201).json({ draftId: draft.id, createdAt: draft.createdAt, generated: !!generate });
    } catch (err: unknown) {
      return res.status(500).json({ error: sanitizeError(err) });
    }
  });

  app.get("/api/drafts/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid draft ID" });
      }
      const draft = await storage.getDraft(id);
      if (!draft) {
        return res.status(404).json({ error: "Draft not found" });
      }
      return res.json(draft);
    } catch (err: unknown) {
      return res.status(500).json({ error: sanitizeError(err) });
    }
  });

  app.get("/api/test-runs", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const runs = await storage.getTestRunsByUserId(userId);
      res.set("Cache-Control", "private, no-store");
      return res.json(runs);
    } catch (err: unknown) {
      return res.status(500).json({ error: sanitizeError(err) });
    }
  });

  app.get("/api/test-runs/:id", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid test run ID" });
      }
      const userId = (req as any).userId;
      const run = await storage.getTestRun(id);
      if (!run || run.userId !== userId) {
        return res.status(404).json({ error: "Test run not found" });
      }
      return res.json(run);
    } catch (err: unknown) {
      return res.status(500).json({ error: sanitizeError(err) });
    }
  });

  app.post("/api/test-runs", requireAuth, async (req, res) => {
    try {
      const parsed = createTestRunSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const userId = (req as any).userId;
      const { promptTitle, systemPrompt, userPrompt, inputVariables, outputs, draftId, ratingClarity, ratingCompleteness, ratingCorrectness, ratingStyleMatch, notes } = parsed.data;

      const run = await storage.createTestRun({
        userId,
        draftId: draftId || null,
        promptTitle,
        systemPrompt: systemPrompt || null,
        userPrompt,
        inputVariables: inputVariables || {},
        outputs: outputs || [],
        ratingClarity: ratingClarity || null,
        ratingCompleteness: ratingCompleteness || null,
        ratingCorrectness: ratingCorrectness || null,
        ratingStyleMatch: ratingStyleMatch || null,
        notes: notes || null,
      });
      return res.status(201).json(run);
    } catch (err: unknown) {
      return res.status(500).json({ error: sanitizeError(err) });
    }
  });

  app.patch("/api/test-runs/:id/ratings", requireAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid test run ID" });
      }
      const userId = (req as any).userId;
      const run = await storage.getTestRun(id);
      if (!run || run.userId !== userId) {
        return res.status(404).json({ error: "Test run not found" });
      }
      const parsed = ratingsSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }
      const { clarity, completeness, correctness, styleMatch, notes } = parsed.data;
      const updated = await storage.updateTestRunRatings(id, {
        ratingClarity: clarity,
        ratingCompleteness: completeness,
        ratingCorrectness: correctness,
        ratingStyleMatch: styleMatch,
        notes,
      });
      return res.json(updated);
    } catch (err: unknown) {
      return res.status(500).json({ error: sanitizeError(err) });
    }
  });

  app.get("/api/admin/stats", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const stats = await storage.getAdminStats();
      return res.json(stats);
    } catch (err: unknown) {
      return res.status(500).json({ error: sanitizeError(err) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
