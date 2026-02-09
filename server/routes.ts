import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertDraftSchema, insertTestRunSchema } from "@shared/schema";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, fullName } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        fullName: fullName || "User",
      });
      (req as any).session.userId = user.id;
      const { password: _, ...safeUser } = user;
      return res.status(201).json({ user: safeUser });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
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
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) return res.status(500).json({ error: "Failed to logout" });
      res.clearCookie("connect.sid");
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

  // Learn categories
  app.get("/api/learn/categories", async (_req, res) => {
    try {
      const categories = await storage.getLearnCategories();
      return res.json(categories);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/learn/posts", async (req, res) => {
    try {
      const categorySlug = req.query.categorySlug as string | undefined;
      const posts = await storage.getLearnPosts(undefined, categorySlug);
      return res.json(posts);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Learn post by slug
  app.get("/api/learn/posts/:slug", async (req, res) => {
    try {
      const post = await storage.getLearnPostBySlug(req.params.slug);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      return res.json(post);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Drafts
  app.post("/api/drafts", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      const { source, goal, outputFormat, context, generate } = req.body;

      const sectionsJson = {
        role: { title: "Role", content: "", placeholder: "Define the AI's role or persona..." },
        objective: { title: "Objective", content: goal, placeholder: "What should the AI accomplish?" },
        context: { title: "Context", content: context || "", placeholder: "Provide relevant background information..." },
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
        context: context || "",
        sectionsJson,
        compiledPrompt,
        expiresAt,
      });

      return res.status(201).json({ draftId: draft.id, createdAt: draft.createdAt, generated: !!generate });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/drafts/:id", async (req, res) => {
    try {
      const draft = await storage.getDraft(Number(req.params.id));
      if (!draft) {
        return res.status(404).json({ error: "Draft not found" });
      }
      return res.json(draft);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Test runs
  app.get("/api/test-runs", async (req, res) => {
    const userId = (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const runs = await storage.getTestRunsByUserId(userId);
      return res.json(runs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/test-runs/:id", async (req, res) => {
    const userId = (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const run = await storage.getTestRun(Number(req.params.id));
      if (!run || run.userId !== userId) {
        return res.status(404).json({ error: "Test run not found" });
      }
      return res.json(run);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/test-runs", async (req, res) => {
    const userId = (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const { promptTitle, systemPrompt, userPrompt, inputVariables, outputs, draftId, ratingClarity, ratingCompleteness, ratingCorrectness, ratingStyleMatch, notes } = req.body;
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
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/test-runs/:id/ratings", async (req, res) => {
    const userId = (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    try {
      const run = await storage.getTestRun(Number(req.params.id));
      if (!run || run.userId !== userId) {
        return res.status(404).json({ error: "Test run not found" });
      }
      const { clarity, completeness, correctness, styleMatch, notes } = req.body;
      const updated = await storage.updateTestRunRatings(Number(req.params.id), {
        ratingClarity: clarity,
        ratingCompleteness: completeness,
        ratingCorrectness: correctness,
        ratingStyleMatch: styleMatch,
        notes,
      });
      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Admin stats
  app.get("/api/admin/stats", async (req, res) => {
    const userId = (req as any).session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await storage.getUser(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    try {
      const stats = await storage.getAdminStats();
      return res.json(stats);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
