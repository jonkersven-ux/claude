import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "@hostiq/database";
import { v4 as uuidv4 } from "uuid";
import { authenticate, tenantGuard } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { AppError } from "../../middleware/error-handler";

export const invitationRouter = Router();
invitationRouter.use(authenticate, tenantGuard);

const createInvitationSchema = z.object({
  matchId: z.string(),
  guestId: z.string(),
  personalMessage: z.string().optional(),
  dietaryNotes: z.string().optional(),
  parkingRequested: z.boolean().optional(),
  extraRequests: z.string().optional(),
});

const batchInviteSchema = z.object({
  matchId: z.string(),
  guestIds: z.array(z.string()).min(1).max(50),
  personalMessage: z.string().optional(),
});

// ── GET /invitations ────────────────────────────────────
invitationRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.auth!;
    const { matchId, status } = req.query as Record<string, string>;

    const where: any = { match: { season: { companyId } } };
    if (matchId) where.matchId = matchId;
    if (status) where.status = status;

    const invitations = await prisma.invitation.findMany({
      where,
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            guestCompany: true,
            commercialValue: true,
            email: true,
          },
        },
        match: {
          select: { id: true, homeTeam: true, awayTeam: true, matchDate: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: invitations });
  } catch (err) {
    next(err);
  }
});

// ── POST /invitations ───────────────────────────────────
invitationRouter.post(
  "/",
  validate(createInvitationSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId, userId } = req.auth!;

      // Verify match and guest belong to company
      const [match, guest] = await Promise.all([
        prisma.match.findFirst({
          where: { id: req.body.matchId, season: { companyId } },
        }),
        prisma.guest.findFirst({
          where: { id: req.body.guestId, companyId },
        }),
      ]);

      if (!match) throw new AppError(404, "Match not found", "NOT_FOUND");
      if (!guest) throw new AppError(404, "Guest not found", "NOT_FOUND");

      const invitation = await prisma.invitation.create({
        data: {
          ...req.body,
          createdById: userId,
          qrCode: uuidv4(),
        },
        include: {
          guest: { select: { id: true, firstName: true, lastName: true } },
          match: { select: { id: true, homeTeam: true, awayTeam: true, matchDate: true } },
        },
      });

      res.status(201).json({ data: invitation });
    } catch (err) {
      next(err);
    }
  },
);

// ── POST /invitations/batch ─────────────────────────────
invitationRouter.post(
  "/batch",
  validate(batchInviteSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId, userId } = req.auth!;
      const { matchId, guestIds, personalMessage } = req.body;

      const match = await prisma.match.findFirst({
        where: { id: matchId, season: { companyId } },
      });
      if (!match) throw new AppError(404, "Match not found", "NOT_FOUND");

      const guests = await prisma.guest.findMany({
        where: { id: { in: guestIds }, companyId },
      });

      if (guests.length !== guestIds.length) {
        throw new AppError(400, "Some guests not found", "INVALID_GUESTS");
      }

      const invitations = await prisma.$transaction(
        guestIds.map((guestId: string) =>
          prisma.invitation.create({
            data: {
              matchId,
              guestId,
              createdById: userId,
              personalMessage,
              qrCode: uuidv4(),
            },
          }),
        ),
      );

      res.status(201).json({ data: invitations, count: invitations.length });
    } catch (err) {
      next(err);
    }
  },
);

// ── PATCH /invitations/:id/status ───────────────────────
invitationRouter.patch(
  "/:id/status",
  validate(z.object({
    status: z.enum([
      "DRAFT", "SENT", "OPENED", "ACCEPTED", "DECLINED",
      "WAITLISTED", "CHECKED_IN", "NO_SHOW", "CANCELLED",
    ]),
  })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const existing = await prisma.invitation.findFirst({
        where: { id: req.params.id, match: { season: { companyId: req.auth!.companyId } } },
      });
      if (!existing) throw new AppError(404, "Invitation not found", "NOT_FOUND");

      const updateData: any = { status: req.body.status };

      if (req.body.status === "SENT") updateData.sentAt = new Date();
      if (["ACCEPTED", "DECLINED"].includes(req.body.status)) updateData.respondedAt = new Date();
      if (req.body.status === "CHECKED_IN") updateData.checkedInAt = new Date();

      const invitation = await prisma.invitation.update({
        where: { id: req.params.id },
        data: updateData,
      });

      res.json({ data: invitation });
    } catch (err) {
      next(err);
    }
  },
);

// ── Public RSVP endpoint (no auth) ─────────────────────
// This is mounted separately for guest-facing responses
export const publicRsvpRouter = Router();

publicRsvpRouter.post(
  "/rsvp/:qrCode",
  validate(z.object({
    response: z.enum(["ACCEPTED", "DECLINED"]),
    dietaryNotes: z.string().optional(),
    parkingRequested: z.boolean().optional(),
  })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invitation = await prisma.invitation.findUnique({
        where: { qrCode: req.params.qrCode },
        include: {
          match: { select: { homeTeam: true, awayTeam: true, matchDate: true } },
          guest: { select: { firstName: true } },
        },
      });

      if (!invitation) throw new AppError(404, "Invitation not found", "NOT_FOUND");

      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: req.body.response,
          respondedAt: new Date(),
          dietaryNotes: req.body.dietaryNotes,
          parkingRequested: req.body.parkingRequested,
        },
      });

      res.json({
        message: `Thank you, ${invitation.guest.firstName}! Your response has been recorded.`,
        match: `${invitation.match.homeTeam} vs ${invitation.match.awayTeam}`,
        date: invitation.match.matchDate,
      });
    } catch (err) {
      next(err);
    }
  },
);
