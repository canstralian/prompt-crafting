import type { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).session?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  (req as any).userId = userId;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const user = await storage.getUser(userId);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const origin = req.get("origin");
  const referer = req.get("referer");
  const host = req.get("host");

  if (!origin && !referer) {
    // Reject all state-changing requests without an origin/referer header,
    // regardless of content-type. The previous bypass for JSON requests
    // weakened CSRF protection since browsers can send JSON via fetch.
    return res.status(403).json({ error: "Missing origin header" });
  }

  const sourceUrl = origin || referer!;
  try {
    const sourceHost = new URL(sourceUrl).host;
    if (sourceHost !== host) {
      return res.status(403).json({ error: "Cross-origin request blocked" });
    }
  } catch {
    return res.status(403).json({ error: "Invalid origin header" });
  }

  next();
}

export function sanitizeError(err: unknown): string {
  if (process.env.NODE_ENV === "production") {
    return "An unexpected error occurred";
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "An unexpected error occurred";
}
