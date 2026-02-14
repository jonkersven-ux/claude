import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "@hostiq/database";
import { authenticate, tenantGuard } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { AppError } from "../../middleware/error-handler";

export const seasonRouter = Router();
seasonRouter.use(authenticate, tenantGuard);

const createSeasonSchema = z.object({
  venueId: z.string(),
  name: z.string().min(1),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  totalBudget: z.number().positive().optional(),
  notes: z.string().optional(),
});

// ── GET /seasons ────────────────────────────────────────
seasonRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const seasons = await prisma.season.findMany({
      where: { companyId: req.auth!.companyId },
      include: {
        venue: { select: { id: true, name: true, city: true } },
        _count: { select: { matches: true, seatBlocks: true } },
      },
      orderBy: { startDate: "desc" },
    });
    res.json({ data: seasons });
  } catch (err) {
    next(err);
  }
});

// ── GET /seasons/:id ────────────────────────────────────
seasonRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const season = await prisma.season.findFirst({
      where: { id: req.params.id, companyId: req.auth!.companyId },
      include: {
        venue: true,
        matches: { orderBy: { matchDate: "asc" } },
        seatBlocks: true,
      },
    });
    if (!season) throw new AppError(404, "Season not found", "NOT_FOUND");
    res.json({ data: season });
  } catch (err) {
    next(err);
  }
});

// ── POST /seasons ───────────────────────────────────────
seasonRouter.post(
  "/",
  validate(createSeasonSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const venue = await prisma.venue.findFirst({
        where: { id: req.body.venueId, companyId: req.auth!.companyId },
      });
      if (!venue) throw new AppError(404, "Venue not found", "NOT_FOUND");

      const season = await prisma.season.create({
        data: { ...req.body, companyId: req.auth!.companyId },
      });
      res.status(201).json({ data: season });
    } catch (err) {
      next(err);
    }
  },
);
