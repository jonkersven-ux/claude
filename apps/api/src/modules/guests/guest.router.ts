import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "@hostiq/database";
import { authenticate, tenantGuard } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { AppError } from "../../middleware/error-handler";

export const guestRouter = Router();
guestRouter.use(authenticate, tenantGuard);

// ── Schemas ─────────────────────────────────────────────
const createGuestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  guestCompany: z.string().optional(),
  linkedInUrl: z.string().url().optional(),
  commercialValue: z.enum(["VERY_HIGH", "HIGH", "MEDIUM", "LOW"]).optional(),
  relationshipStage: z
    .enum(["PROSPECT", "QUALIFIED_LEAD", "ACTIVE_CLIENT", "STRATEGIC_PARTNER", "CHURNED", "INTERNAL"])
    .optional(),
  accountManagerId: z.string().optional(),
  dietaryRequirements: z.string().optional(),
  parkingRequired: z.boolean().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const updateGuestSchema = createGuestSchema.partial();

// ── GET /guests ─────────────────────────────────────────
guestRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.auth!;
    const {
      search,
      stage,
      value,
      accountManagerId,
      page = "1",
      limit = "25",
    } = req.query as Record<string, string>;

    const where: any = { companyId, isActive: true };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { guestCompany: { contains: search, mode: "insensitive" } },
      ];
    }
    if (stage) where.relationshipStage = stage;
    if (value) where.commercialValue = value;
    if (accountManagerId) where.accountManagerId = accountManagerId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [guests, total] = await Promise.all([
      prisma.guest.findMany({
        where,
        include: {
          accountManager: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { invitations: true, opportunities: true } },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.guest.count({ where }),
    ]);

    res.json({
      data: guests,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /guests/:id ─────────────────────────────────────
guestRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const guest = await prisma.guest.findFirst({
      where: { id: req.params.id, companyId: req.auth!.companyId },
      include: {
        accountManager: { select: { id: true, firstName: true, lastName: true } },
        invitations: {
          include: {
            match: { select: { id: true, homeTeam: true, awayTeam: true, matchDate: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        opportunities: { orderBy: { updatedAt: "desc" } },
        eventNotes: { orderBy: { createdAt: "desc" }, take: 5 },
        aiInsights: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });

    if (!guest) throw new AppError(404, "Guest not found", "NOT_FOUND");
    res.json({ data: guest });
  } catch (err) {
    next(err);
  }
});

// ── POST /guests ────────────────────────────────────────
guestRouter.post(
  "/",
  validate(createGuestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const guest = await prisma.guest.create({
        data: { ...req.body, companyId: req.auth!.companyId },
      });
      res.status(201).json({ data: guest });
    } catch (err) {
      next(err);
    }
  },
);

// ── PATCH /guests/:id ───────────────────────────────────
guestRouter.patch(
  "/:id",
  validate(updateGuestSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await prisma.guest.findFirst({
        where: { id: req.params.id, companyId: req.auth!.companyId },
      });
      if (!existing) throw new AppError(404, "Guest not found", "NOT_FOUND");

      const guest = await prisma.guest.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json({ data: guest });
    } catch (err) {
      next(err);
    }
  },
);

// ── DELETE /guests/:id (soft delete) ────────────────────
guestRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.guest.findFirst({
      where: { id: req.params.id, companyId: req.auth!.companyId },
    });
    if (!existing) throw new AppError(404, "Guest not found", "NOT_FOUND");

    await prisma.guest.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
