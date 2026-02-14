import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@hostiq/database";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { AppError } from "../../middleware/error-handler";

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// ── Schemas ─────────────────────────────────────────────
const registerSchema = z.object({
  companyName: z.string().min(2),
  companySlug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ── POST /auth/register ─────────────────────────────────
authRouter.post(
  "/register",
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyName, companySlug, email, password, firstName, lastName } = req.body;

      const existingCompany = await prisma.company.findUnique({ where: { slug: companySlug } });
      if (existingCompany) {
        throw new AppError(409, "Company slug already taken", "SLUG_TAKEN");
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const company = await prisma.company.create({
        data: {
          name: companyName,
          slug: companySlug,
        },
      });

      const user = await prisma.user.create({
        data: {
          companyId: company.id,
          email,
          passwordHash,
          firstName,
          lastName,
          role: "OWNER",
        },
      });

      const token = jwt.sign(
        { userId: user.id, companyId: company.id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN },
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// ── POST /auth/login ────────────────────────────────────
authRouter.post(
  "/login",
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findFirst({
        where: { email, isActive: true },
        include: { company: true },
      });

      if (!user) {
        throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        throw new AppError(401, "Invalid credentials", "INVALID_CREDENTIALS");
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const token = jwt.sign(
        { userId: user.id, companyId: user.companyId, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN },
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        company: {
          id: user.company.id,
          name: user.company.name,
          slug: user.company.slug,
          plan: user.company.plan,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// ── GET /auth/me ────────────────────────────────────────
authRouter.get(
  "/me",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.auth!.userId },
        include: { company: true },
      });

      if (!user) {
        throw new AppError(404, "User not found", "NOT_FOUND");
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
        company: {
          id: user.company.id,
          name: user.company.name,
          slug: user.company.slug,
          plan: user.company.plan,
          settings: user.company.settings,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);
