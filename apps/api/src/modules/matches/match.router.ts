import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "@hostiq/database";
import { authenticate, tenantGuard } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { AppError } from "../../middleware/error-handler";

export const matchRouter = Router();
matchRouter.use(authenticate, tenantGuard);

const createMatchSchema = z.object({
  seasonId: z.string(),
  homeTeam: z.string().min(1),
  awayTeam: z.string().min(1),
  matchDate: z.string().transform((s) => new Date(s)),
  kickoffTime: z.string().transform((s) => new Date(s)).optional(),
  priority: z.enum(["A_MATCH", "HIGH", "NORMAL", "LOW"]).optional(),
  objective: z
    .enum(["NEW_BUSINESS", "RETENTION", "NETWORKING", "EMPLOYEE_ENGAGEMENT", "PARTNERSHIP", "BRAND"])
    .optional(),
  maxGuests: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

const updateMatchSchema = createMatchSchema.partial();

// ── GET /matches ────────────────────────────────────────
matchRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.auth!;
    const { seasonId, status, priority } = req.query as Record<string, string>;

    const where: any = { season: { companyId } };
    if (seasonId) where.seasonId = seasonId;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const matches = await prisma.match.findMany({
      where,
      include: {
        season: { select: { id: true, name: true } },
        _count: { select: { invitations: true } },
      },
      orderBy: { matchDate: "asc" },
    });

    res.json({ data: matches });
  } catch (err) {
    next(err);
  }
});

// ── GET /matches/:id ────────────────────────────────────
matchRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const match = await prisma.match.findFirst({
      where: { id: req.params.id, season: { companyId: req.auth!.companyId } },
      include: {
        season: true,
        invitations: {
          include: {
            guest: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                guestCompany: true,
                commercialValue: true,
              },
            },
          },
        },
        seatAllocations: true,
        costs: true,
        revenues: true,
        aiInsights: { where: { isDismissed: false }, orderBy: { createdAt: "desc" } },
        _count: { select: { eventNotes: true, followUpTasks: true } },
      },
    });

    if (!match) throw new AppError(404, "Match not found", "NOT_FOUND");
    res.json({ data: match });
  } catch (err) {
    next(err);
  }
});

// ── POST /matches ───────────────────────────────────────
matchRouter.post(
  "/",
  validate(createMatchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verify season belongs to company
      const season = await prisma.season.findFirst({
        where: { id: req.body.seasonId, companyId: req.auth!.companyId },
      });
      if (!season) throw new AppError(404, "Season not found", "NOT_FOUND");

      const match = await prisma.match.create({ data: req.body });
      res.status(201).json({ data: match });
    } catch (err) {
      next(err);
    }
  },
);

// ── PATCH /matches/:id ──────────────────────────────────
matchRouter.patch(
  "/:id",
  validate(updateMatchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await prisma.match.findFirst({
        where: { id: req.params.id, season: { companyId: req.auth!.companyId } },
      });
      if (!existing) throw new AppError(404, "Match not found", "NOT_FOUND");

      const match = await prisma.match.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json({ data: match });
    } catch (err) {
      next(err);
    }
  },
);
