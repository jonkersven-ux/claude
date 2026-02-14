import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "@hostiq/database";
import { authenticate, tenantGuard } from "../../middleware/authenticate";

export const dashboardRouter = Router();
dashboardRouter.use(authenticate, tenantGuard);

// ── GET /dashboard/overview ─────────────────────────────
dashboardRouter.get("/overview", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.auth!;
    const { seasonId } = req.query as Record<string, string>;

    const seasonFilter = seasonId
      ? { season: { id: seasonId, companyId } }
      : { season: { companyId } };

    // Run all queries concurrently
    const [
      totalGuests,
      totalMatches,
      invitationStats,
      totalCosts,
      totalRevenue,
      upcomingMatches,
      recentInsights,
    ] = await Promise.all([
      // Total active guests
      prisma.guest.count({ where: { companyId, isActive: true } }),

      // Total matches this season
      prisma.match.count({ where: seasonFilter }),

      // Invitation breakdown
      prisma.invitation.groupBy({
        by: ["status"],
        where: { match: seasonFilter },
        _count: true,
      }),

      // Total costs
      prisma.cost.aggregate({
        where: { companyId },
        _sum: { amount: true },
      }),

      // Total attributed revenue
      prisma.revenue.aggregate({
        where: { match: seasonFilter, isAttributed: true },
        _sum: { amount: true },
      }),

      // Next 3 upcoming matches
      prisma.match.findMany({
        where: {
          ...seasonFilter,
          matchDate: { gte: new Date() },
          status: { not: "CANCELLED" },
        },
        include: {
          _count: { select: { invitations: true } },
        },
        orderBy: { matchDate: "asc" },
        take: 3,
      }),

      // Latest AI insights
      prisma.aiInsight.findMany({
        where: { companyId, isDismissed: false },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // Compute invitation funnel
    const invitationFunnel = {
      total: 0,
      sent: 0,
      accepted: 0,
      declined: 0,
      checkedIn: 0,
      noShow: 0,
    };

    for (const row of invitationStats) {
      invitationFunnel.total += row._count;
      if (row.status === "SENT" || row.status === "OPENED") invitationFunnel.sent += row._count;
      if (row.status === "ACCEPTED") invitationFunnel.accepted += row._count;
      if (row.status === "DECLINED") invitationFunnel.declined += row._count;
      if (row.status === "CHECKED_IN") invitationFunnel.checkedIn += row._count;
      if (row.status === "NO_SHOW") invitationFunnel.noShow += row._count;
    }

    const spend = Number(totalCosts._sum.amount || 0);
    const revenue = Number(totalRevenue._sum.amount || 0);
    const attendees = invitationFunnel.accepted + invitationFunnel.checkedIn;
    const attendanceRate =
      invitationFunnel.total > 0
        ? Math.round(((attendees) / invitationFunnel.total) * 100)
        : 0;

    res.json({
      data: {
        kpis: {
          totalGuests,
          totalMatches,
          totalSpend: spend,
          totalRevenue: revenue,
          roi: spend > 0 ? Math.round(((revenue - spend) / spend) * 100) : 0,
          attendanceRate,
          costPerGuest: attendees > 0 ? Math.round(spend / attendees) : 0,
        },
        invitationFunnel,
        upcomingMatches,
        recentInsights,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /dashboard/roi ──────────────────────────────────
dashboardRouter.get("/roi", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId } = req.auth!;
    const { seasonId, accountManagerId } = req.query as Record<string, string>;

    const seasonFilter = seasonId
      ? { season: { id: seasonId, companyId } }
      : { season: { companyId } };

    // Cost breakdown by category
    const costsByCategory = await prisma.cost.groupBy({
      by: ["category"],
      where: { companyId },
      _sum: { amount: true },
    });

    // Revenue per match
    const revenueByMatch = await prisma.revenue.findMany({
      where: { match: seasonFilter, isAttributed: true },
      include: {
        match: { select: { id: true, homeTeam: true, awayTeam: true, matchDate: true } },
      },
    });

    // Attendance by match
    const matchAttendance = await prisma.match.findMany({
      where: seasonFilter,
      select: {
        id: true,
        homeTeam: true,
        awayTeam: true,
        matchDate: true,
        maxGuests: true,
        invitations: {
          select: { status: true },
        },
      },
      orderBy: { matchDate: "asc" },
    });

    const matchPerformance = matchAttendance.map((m) => {
      const attended = m.invitations.filter(
        (i) => i.status === "ACCEPTED" || i.status === "CHECKED_IN",
      ).length;
      return {
        matchId: m.id,
        label: `${m.homeTeam} vs ${m.awayTeam}`,
        date: m.matchDate,
        capacity: m.maxGuests || 0,
        invited: m.invitations.length,
        attended,
        utilization: m.maxGuests ? Math.round((attended / m.maxGuests) * 100) : 0,
      };
    });

    // Opportunities influenced (guests who attended and have active opps)
    const influencedOpps = await prisma.opportunity.findMany({
      where: {
        guest: {
          companyId,
          invitations: { some: { status: { in: ["ACCEPTED", "CHECKED_IN"] } } },
        },
        stage: { notIn: ["LOST"] },
      },
      include: {
        guest: { select: { firstName: true, lastName: true, guestCompany: true } },
      },
    });

    const pipelineInfluenced = influencedOpps.reduce(
      (sum, o) => sum + Number(o.value || 0),
      0,
    );

    // Per-account-manager performance
    let amPerformance: any[] = [];
    if (accountManagerId) {
      const amGuests = await prisma.guest.findMany({
        where: { companyId, accountManagerId },
        include: {
          invitations: { where: { match: seasonFilter } },
          opportunities: true,
        },
      });

      amPerformance = amGuests.map((g) => ({
        guestId: g.id,
        guestName: `${g.firstName} ${g.lastName}`,
        company: g.guestCompany,
        eventsAttended: g.invitations.filter(
          (i) => i.status === "ACCEPTED" || i.status === "CHECKED_IN",
        ).length,
        totalPipeline: g.opportunities.reduce((s, o) => s + Number(o.value || 0), 0),
        activeDeals: g.opportunities.filter((o) => !["WON", "LOST"].includes(o.stage)).length,
      }));
    }

    res.json({
      data: {
        costsByCategory: costsByCategory.map((c) => ({
          category: c.category,
          amount: Number(c._sum.amount || 0),
        })),
        matchPerformance,
        influencedOpportunities: {
          count: influencedOpps.length,
          pipelineValue: pipelineInfluenced,
          deals: influencedOpps.map((o) => ({
            id: o.id,
            title: o.title,
            value: Number(o.value || 0),
            stage: o.stage,
            probability: o.probability,
            guest: `${o.guest.firstName} ${o.guest.lastName}`,
            company: o.guest.guestCompany,
          })),
        },
        accountManagerPerformance: amPerformance,
      },
    });
  } catch (err) {
    next(err);
  }
});
