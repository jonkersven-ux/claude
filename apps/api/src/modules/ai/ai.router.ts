import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "@hostiq/database";
import { authenticate, tenantGuard } from "../../middleware/authenticate";
import { validate } from "../../middleware/validate";
import { AppError } from "../../middleware/error-handler";
import {
  generateFollowUpEmail,
  generateGuestPrioritization,
  generateConversationSummary,
  generateRoiInsights,
} from "./ai.service";

export const aiRouter = Router();
aiRouter.use(authenticate, tenantGuard);

// ── POST /ai/follow-up-email ────────────────────────────
aiRouter.post(
  "/follow-up-email",
  validate(
    z.object({
      matchId: z.string(),
      guestId: z.string(),
      talkingPoints: z.string().optional(),
      nextStep: z.string().optional(),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId } = req.auth!;
      const { matchId, guestId, talkingPoints, nextStep } = req.body;

      const [match, guest] = await Promise.all([
        prisma.match.findFirst({ where: { id: matchId, season: { companyId } } }),
        prisma.guest.findFirst({
          where: { id: guestId, companyId },
          include: { opportunities: { orderBy: { updatedAt: "desc" }, take: 1 } },
        }),
      ]);

      if (!match) throw new AppError(404, "Match not found", "NOT_FOUND");
      if (!guest) throw new AppError(404, "Guest not found", "NOT_FOUND");

      // Gather event notes for this guest at this match
      const notes = await prisma.eventNote.findMany({
        where: { matchId, guestId },
        orderBy: { createdAt: "asc" },
      });

      const email = await generateFollowUpEmail({
        guestName: `${guest.firstName} ${guest.lastName}`,
        guestTitle: guest.jobTitle || "Professional",
        guestCompany: guest.guestCompany || "their company",
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        matchDate: match.matchDate.toLocaleDateString("en-GB"),
        eventNotes: notes.map((n) => n.content).join("\n") || "No notes captured",
        dealStage: guest.opportunities[0]?.stage || "No active deal",
        talkingPoints: talkingPoints || "General business discussion",
        nextStep: nextStep || "Schedule a follow-up meeting",
        companyId,
      });

      // Store as AI insight
      await prisma.aiInsight.create({
        data: {
          companyId,
          userId: req.auth!.userId,
          matchId,
          guestId,
          type: "EMAIL_DRAFT",
          title: `Follow-up email for ${guest.firstName} ${guest.lastName}`,
          content: email,
          confidence: 0.85,
        },
      });

      res.json({ data: { email } });
    } catch (err) {
      next(err);
    }
  },
);

// ── POST /ai/guest-prioritization ───────────────────────
aiRouter.post(
  "/guest-prioritization",
  validate(z.object({ matchId: z.string() })),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId } = req.auth!;
      const match = await prisma.match.findFirst({
        where: { id: req.body.matchId, season: { companyId } },
        include: { seatAllocations: true },
      });

      if (!match) throw new AppError(404, "Match not found", "NOT_FOUND");

      const guests = await prisma.guest.findMany({
        where: { companyId, isActive: true },
        include: {
          opportunities: { where: { stage: { notIn: ["WON", "LOST"] } } },
          invitations: {
            where: { match: { season: { companyId } } },
            select: { status: true, match: { select: { matchDate: true } } },
          },
        },
      });

      const guestList = guests
        .map((g) => {
          const attended = g.invitations.filter(
            (i) => i.status === "ACCEPTED" || i.status === "CHECKED_IN",
          ).length;
          const pipeline = g.opportunities.reduce((s, o) => s + Number(o.value || 0), 0);
          return `- ${g.firstName} ${g.lastName} (${g.guestCompany || "N/A"}) | Value: ${g.commercialValue} | Stage: ${g.relationshipStage} | Past events: ${attended} | Pipeline: €${pipeline}`;
        })
        .join("\n");

      const result = await generateGuestPrioritization({
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        matchDate: match.matchDate.toLocaleDateString("en-GB"),
        priority: match.priority,
        objective: match.objective || "GENERAL",
        availableSeats: String(match.maxGuests || 20),
        guestList,
        companyId,
      });

      await prisma.aiInsight.create({
        data: {
          companyId,
          userId: req.auth!.userId,
          matchId: match.id,
          type: "GUEST_PRIORITIZATION",
          title: `Guest priorities for ${match.homeTeam} vs ${match.awayTeam}`,
          content: result,
          confidence: 0.8,
        },
      });

      res.json({ data: { recommendation: result } });
    } catch (err) {
      next(err);
    }
  },
);

// ── POST /ai/conversation-summary ───────────────────────
aiRouter.post(
  "/conversation-summary",
  validate(
    z.object({
      matchId: z.string(),
      guestId: z.string(),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { companyId } = req.auth!;
      const { matchId, guestId } = req.body;

      const [match, guest, notes] = await Promise.all([
        prisma.match.findFirst({ where: { id: matchId, season: { companyId } } }),
        prisma.guest.findFirst({ where: { id: guestId, companyId } }),
        prisma.eventNote.findMany({
          where: { matchId, guestId },
          orderBy: { createdAt: "asc" },
        }),
      ]);

      if (!match) throw new AppError(404, "Match not found", "NOT_FOUND");
      if (!guest) throw new AppError(404, "Guest not found", "NOT_FOUND");

      if (notes.length === 0) {
        throw new AppError(400, "No event notes to summarize", "NO_NOTES");
      }

      const summary = await generateConversationSummary({
        guestName: `${guest.firstName} ${guest.lastName}`,
        guestCompany: guest.guestCompany || "their company",
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        notes: notes.map((n) => `[${n.createdAt.toISOString()}] ${n.content}`).join("\n"),
        companyId,
      });

      await prisma.aiInsight.create({
        data: {
          companyId,
          userId: req.auth!.userId,
          matchId,
          guestId,
          type: "CONVERSATION_SUMMARY",
          title: `Summary: ${guest.firstName} at ${match.homeTeam} vs ${match.awayTeam}`,
          content: summary,
          confidence: 0.82,
        },
      });

      res.json({ data: { summary } });
    } catch (err) {
      next(err);
    }
  },
);

// ── GET /ai/insights ────────────────────────────────────
aiRouter.get("/insights", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.auth!;
    const { type, matchId, limit = "10" } = req.query as Record<string, string>;

    const where: any = { companyId, isDismissed: false };
    if (type) where.type = type;
    if (matchId) where.matchId = matchId;

    const insights = await prisma.aiInsight.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: parseInt(limit),
    });

    res.json({ data: insights });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /ai/insights/:id/dismiss ──────────────────────
aiRouter.patch("/insights/:id/dismiss", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const insight = await prisma.aiInsight.findFirst({
      where: { id: req.params.id, companyId: req.auth!.companyId },
    });
    if (!insight) throw new AppError(404, "Insight not found", "NOT_FOUND");

    await prisma.aiInsight.update({
      where: { id: req.params.id },
      data: { isDismissed: true },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
