import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "@hostiq/database";
import { AppError } from "./error-handler";

export interface AuthPayload {
  userId: string;
  companyId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new AppError(401, "Authentication required", "AUTH_REQUIRED"));
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    req.auth = payload;
    next();
  } catch {
    next(new AppError(401, "Invalid or expired token", "INVALID_TOKEN"));
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(new AppError(401, "Authentication required", "AUTH_REQUIRED"));
      return;
    }
    if (!roles.includes(req.auth.role)) {
      next(new AppError(403, "Insufficient permissions", "FORBIDDEN"));
      return;
    }
    next();
  };
}

/** Middleware that scopes all queries to the authenticated user's company */
export function tenantGuard(req: Request, _res: Response, next: NextFunction): void {
  if (!req.auth?.companyId) {
    next(new AppError(401, "Tenant context required", "NO_TENANT"));
    return;
  }
  next();
}
