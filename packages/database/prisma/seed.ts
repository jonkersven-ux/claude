import { PrismaClient, Plan, UserRole, SeasonStatus, SeatType, MatchPriority, MatchObjective, MatchStatus, CommercialValue, RelationshipStage, InvitationStatus, CostCategory, InsightType } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("Seeding HostIQ database...");

  // ── Company ──────────────────────────────────────────
  const company = await prisma.company.create({
    data: {
      name: "TechVentures BV",
      slug: "techventures",
      domain: "techventures.nl",
      plan: Plan.PROFESSIONAL,
      maxSeats: 24,
      maxUsers: 15,
      settings: {
        currency: "EUR",
        timezone: "Europe/Amsterdam",
        language: "en",
      },
    },
  });

  // ── Users ────────────────────────────────────────────
  const owner = await prisma.user.create({
    data: {
      companyId: company.id,
      email: "jan@techventures.nl",
      passwordHash: hashPassword("demo1234"),
      firstName: "Jan",
      lastName: "de Vries",
      role: UserRole.OWNER,
    },
  });

  const salesManager = await prisma.user.create({
    data: {
      companyId: company.id,
      email: "lisa@techventures.nl",
      passwordHash: hashPassword("demo1234"),
      firstName: "Lisa",
      lastName: "Bakker",
      role: UserRole.MANAGER,
    },
  });

  const accountManager = await prisma.user.create({
    data: {
      companyId: company.id,
      email: "mark@techventures.nl",
      passwordHash: hashPassword("demo1234"),
      firstName: "Mark",
      lastName: "Jansen",
      role: UserRole.MEMBER,
    },
  });

  const host = await prisma.user.create({
    data: {
      companyId: company.id,
      email: "sophie@techventures.nl",
      passwordHash: hashPassword("demo1234"),
      firstName: "Sophie",
      lastName: "Mulder",
      role: UserRole.HOST,
    },
  });

  // ── Venue & Season ──────────────────────────────────
  const venue = await prisma.venue.create({
    data: {
      companyId: company.id,
      name: "Johan Cruijff ArenA",
      city: "Amsterdam",
      country: "Netherlands",
      sportType: "Football",
    },
  });

  const season = await prisma.season.create({
    data: {
      companyId: company.id,
      venueId: venue.id,
      name: "2026/2027",
      startDate: new Date("2026-08-01"),
      endDate: new Date("2027-06-30"),
      status: SeasonStatus.ACTIVE,
      totalBudget: 120000,
    },
  });

  // ── Seat Block ──────────────────────────────────────
  const skybox = await prisma.seatBlock.create({
    data: {
      seasonId: season.id,
      label: "Skybox 42",
      seatType: SeatType.SKYBOX,
      capacity: 12,
      costPerMatch: 3500,
    },
  });

  const businessSeats = await prisma.seatBlock.create({
    data: {
      seasonId: season.id,
      label: "Business Seats Row A",
      seatType: SeatType.BUSINESS_SEAT,
      capacity: 8,
      costPerMatch: 1200,
    },
  });

  // ── Matches ─────────────────────────────────────────
  const matches = await Promise.all([
    prisma.match.create({
      data: {
        seasonId: season.id,
        homeTeam: "Ajax",
        awayTeam: "Feyenoord",
        matchDate: new Date("2026-10-25T18:45:00Z"),
        kickoffTime: new Date("2026-10-25T18:45:00Z"),
        priority: MatchPriority.A_MATCH,
        objective: MatchObjective.NEW_BUSINESS,
        status: MatchStatus.INVITATIONS_OPEN,
        maxGuests: 20,
      },
    }),
    prisma.match.create({
      data: {
        seasonId: season.id,
        homeTeam: "Ajax",
        awayTeam: "PSV",
        matchDate: new Date("2026-11-22T20:00:00Z"),
        kickoffTime: new Date("2026-11-22T20:00:00Z"),
        priority: MatchPriority.A_MATCH,
        objective: MatchObjective.RETENTION,
        status: MatchStatus.SCHEDULED,
        maxGuests: 20,
      },
    }),
    prisma.match.create({
      data: {
        seasonId: season.id,
        homeTeam: "Ajax",
        awayTeam: "AZ",
        matchDate: new Date("2026-12-13T14:30:00Z"),
        kickoffTime: new Date("2026-12-13T14:30:00Z"),
        priority: MatchPriority.NORMAL,
        objective: MatchObjective.NETWORKING,
        status: MatchStatus.SCHEDULED,
        maxGuests: 20,
      },
    }),
    prisma.match.create({
      data: {
        seasonId: season.id,
        homeTeam: "Ajax",
        awayTeam: "FC Utrecht",
        matchDate: new Date("2027-01-17T20:00:00Z"),
        kickoffTime: new Date("2027-01-17T20:00:00Z"),
        priority: MatchPriority.LOW,
        objective: MatchObjective.EMPLOYEE_ENGAGEMENT,
        status: MatchStatus.SCHEDULED,
        maxGuests: 20,
      },
    }),
    prisma.match.create({
      data: {
        seasonId: season.id,
        homeTeam: "Ajax",
        awayTeam: "FC Twente",
        matchDate: new Date("2027-02-14T18:45:00Z"),
        kickoffTime: new Date("2027-02-14T18:45:00Z"),
        priority: MatchPriority.HIGH,
        objective: MatchObjective.PARTNERSHIP,
        status: MatchStatus.SCHEDULED,
        maxGuests: 20,
      },
    }),
  ]);

  // ── Guests ──────────────────────────────────────────
  const guests = await Promise.all([
    prisma.guest.create({
      data: {
        companyId: company.id,
        accountManagerId: salesManager.id,
        firstName: "Peter",
        lastName: "van den Berg",
        email: "peter@acmecorp.nl",
        jobTitle: "CEO",
        guestCompany: "ACME Corp",
        commercialValue: CommercialValue.VERY_HIGH,
        relationshipStage: RelationshipStage.QUALIFIED_LEAD,
        tags: ["enterprise", "decision-maker"],
      },
    }),
    prisma.guest.create({
      data: {
        companyId: company.id,
        accountManagerId: accountManager.id,
        firstName: "Maria",
        lastName: "Hendriks",
        email: "maria@globaltech.com",
        jobTitle: "VP Procurement",
        guestCompany: "GlobalTech",
        commercialValue: CommercialValue.HIGH,
        relationshipStage: RelationshipStage.ACTIVE_CLIENT,
        tags: ["mid-market", "renewal-2027"],
      },
    }),
    prisma.guest.create({
      data: {
        companyId: company.id,
        accountManagerId: salesManager.id,
        firstName: "Thomas",
        lastName: "Smit",
        email: "thomas@innovatech.nl",
        jobTitle: "CTO",
        guestCompany: "InnovaTech",
        commercialValue: CommercialValue.HIGH,
        relationshipStage: RelationshipStage.PROSPECT,
        tags: ["tech", "innovation"],
      },
    }),
    prisma.guest.create({
      data: {
        companyId: company.id,
        accountManagerId: accountManager.id,
        firstName: "Emma",
        lastName: "de Groot",
        email: "emma@dutchfinance.nl",
        jobTitle: "Managing Director",
        guestCompany: "Dutch Finance Group",
        commercialValue: CommercialValue.VERY_HIGH,
        relationshipStage: RelationshipStage.STRATEGIC_PARTNER,
        tags: ["finance", "strategic"],
      },
    }),
    prisma.guest.create({
      data: {
        companyId: company.id,
        accountManagerId: salesManager.id,
        firstName: "Robert",
        lastName: "Visser",
        email: "robert@buildright.nl",
        jobTitle: "Commercial Director",
        guestCompany: "BuildRight BV",
        commercialValue: CommercialValue.MEDIUM,
        relationshipStage: RelationshipStage.QUALIFIED_LEAD,
        tags: ["construction", "regional"],
      },
    }),
  ]);

  // ── Opportunities ───────────────────────────────────
  await Promise.all([
    prisma.opportunity.create({
      data: {
        guestId: guests[0].id,
        title: "ACME Corp Enterprise Platform Deal",
        value: 450000,
        stage: "QUALIFICATION",
        probability: 35,
        expectedCloseDate: new Date("2027-03-31"),
      },
    }),
    prisma.opportunity.create({
      data: {
        guestId: guests[1].id,
        title: "GlobalTech Annual Renewal",
        value: 180000,
        stage: "NEGOTIATION",
        probability: 75,
        expectedCloseDate: new Date("2027-01-15"),
      },
    }),
    prisma.opportunity.create({
      data: {
        guestId: guests[3].id,
        title: "Dutch Finance Group Expansion",
        value: 320000,
        stage: "PROPOSAL",
        probability: 55,
        expectedCloseDate: new Date("2027-06-30"),
      },
    }),
  ]);

  // ── Invitations ─────────────────────────────────────
  const classico = matches[0]; // Ajax vs Feyenoord

  await Promise.all([
    prisma.invitation.create({
      data: {
        matchId: classico.id,
        guestId: guests[0].id,
        createdById: salesManager.id,
        status: InvitationStatus.ACCEPTED,
        sentAt: new Date("2026-10-01"),
        respondedAt: new Date("2026-10-03"),
        qrCode: crypto.randomUUID(),
      },
    }),
    prisma.invitation.create({
      data: {
        matchId: classico.id,
        guestId: guests[1].id,
        createdById: accountManager.id,
        status: InvitationStatus.ACCEPTED,
        sentAt: new Date("2026-10-01"),
        respondedAt: new Date("2026-10-02"),
        qrCode: crypto.randomUUID(),
      },
    }),
    prisma.invitation.create({
      data: {
        matchId: classico.id,
        guestId: guests[2].id,
        createdById: salesManager.id,
        status: InvitationStatus.SENT,
        sentAt: new Date("2026-10-05"),
        qrCode: crypto.randomUUID(),
      },
    }),
    prisma.invitation.create({
      data: {
        matchId: classico.id,
        guestId: guests[3].id,
        createdById: accountManager.id,
        status: InvitationStatus.ACCEPTED,
        sentAt: new Date("2026-10-01"),
        respondedAt: new Date("2026-10-01"),
        qrCode: crypto.randomUUID(),
      },
    }),
  ]);

  // ── Costs ───────────────────────────────────────────
  await Promise.all([
    prisma.cost.create({
      data: {
        companyId: company.id,
        category: CostCategory.SEASON_PASS,
        description: "Skybox 42 — Season 2026/2027",
        amount: 85000,
        date: new Date("2026-07-01"),
      },
    }),
    prisma.cost.create({
      data: {
        companyId: company.id,
        category: CostCategory.SEASON_PASS,
        description: "Business Seats Row A — Season 2026/2027",
        amount: 24000,
        date: new Date("2026-07-01"),
      },
    }),
    prisma.cost.create({
      data: {
        companyId: company.id,
        matchId: classico.id,
        category: CostCategory.CATERING,
        description: "Premium catering — Ajax vs Feyenoord",
        amount: 2400,
        date: new Date("2026-10-25"),
      },
    }),
  ]);

  // ── AI Insights ─────────────────────────────────────
  await Promise.all([
    prisma.aiInsight.create({
      data: {
        companyId: company.id,
        matchId: classico.id,
        type: InsightType.GUEST_PRIORITIZATION,
        title: "High-value prospect available",
        content:
          "Peter van den Berg (ACME Corp, €450K pipeline) has accepted the invitation to Ajax vs Feyenoord. This is a high-priority touchpoint — his deal is in qualification stage. Recommend seating him next to Jan de Vries (CEO) for direct executive engagement.",
        confidence: 0.92,
        metadata: { guestId: guests[0].id },
      },
    }),
    prisma.aiInsight.create({
      data: {
        companyId: company.id,
        type: InsightType.UTILIZATION_ALERT,
        title: "Low utilization: Ajax vs FC Utrecht",
        content:
          "The Ajax vs FC Utrecht match (Jan 17) has 0 invitations sent with only 8 weeks to go. Consider using this match for employee engagement or networking with lower-priority contacts to maximize seat utilization.",
        confidence: 0.88,
        metadata: { matchId: matches[3].id },
      },
    }),
    prisma.aiInsight.create({
      data: {
        companyId: company.id,
        guestId: guests[1].id,
        type: InsightType.RELATIONSHIP_HEALTH,
        title: "Renewal at risk: GlobalTech",
        content:
          "Maria Hendriks (GlobalTech) has attended 2 of 3 invited events this year. Her renewal is due in January. The deal probability has dropped from 85% to 75%. Recommend scheduling a 1-on-1 meeting at the next match and preparing a personalized experience.",
        confidence: 0.85,
      },
    }),
  ]);

  // ── Prompt Templates ────────────────────────────────
  await Promise.all([
    prisma.promptTemplate.create({
      data: {
        slug: "follow-up-email",
        name: "Post-Match Follow-Up Email",
        description: "Generate a personalized follow-up email after a hospitality event",
        systemPrompt:
          "You are a professional business communication writer for a B2B company. Write warm but professional follow-up emails after corporate hospitality events at sports matches. Keep the tone conversational but business-appropriate. Reference specific details from the event when provided. Always include a clear next step or call to action.",
        userPrompt:
          "Write a follow-up email for {{guestName}} ({{guestTitle}} at {{guestCompany}}) who attended the {{homeTeam}} vs {{awayTeam}} match on {{matchDate}}. Event notes: {{eventNotes}}. Current deal stage: {{dealStage}}. Key talking points discussed: {{talkingPoints}}. Desired next step: {{nextStep}}.",
        temperature: 0.7,
        maxTokens: 512,
      },
    }),
    prisma.promptTemplate.create({
      data: {
        slug: "guest-prioritization",
        name: "Guest Prioritization for Match",
        description: "Rank and recommend guests for a specific match",
        systemPrompt:
          "You are a strategic hospitality advisor for B2B companies. Analyze guest lists and match priorities to recommend the optimal guest selection. Consider deal stage, commercial value, relationship health, attendance history, and the strategic objective of the match. Return a ranked list with reasoning.",
        userPrompt:
          "Match: {{homeTeam}} vs {{awayTeam}} ({{matchDate}}). Priority: {{priority}}. Objective: {{objective}}. Available seats: {{availableSeats}}. Guest pool:\n{{guestList}}\nRank the top {{availableSeats}} guests for this match with reasoning.",
        temperature: 0.4,
        maxTokens: 1024,
      },
    }),
    prisma.promptTemplate.create({
      data: {
        slug: "conversation-summary",
        name: "Matchday Conversation Summary",
        description: "Summarize matchday notes into actionable insights",
        systemPrompt:
          "You are a sales intelligence analyst. Summarize matchday conversation notes into structured, actionable business intelligence. Extract key topics discussed, sentiment, commitments made, and recommended follow-up actions. Be concise and action-oriented.",
        userPrompt:
          "Summarize the following matchday notes for {{guestName}} ({{guestCompany}}) from the {{homeTeam}} vs {{awayTeam}} match:\n\n{{notes}}\n\nProvide: 1) Key topics discussed, 2) Sentiment assessment, 3) Commitments or next steps mentioned, 4) Recommended follow-up actions.",
        temperature: 0.3,
        maxTokens: 768,
      },
    }),
    prisma.promptTemplate.create({
      data: {
        slug: "roi-insight",
        name: "ROI Insight Generator",
        description: "Generate natural language ROI insights from performance data",
        systemPrompt:
          "You are a commercial analytics advisor. Generate clear, actionable insights from hospitality ROI data. Focus on trends, anomalies, and opportunities. Use specific numbers and comparisons. Avoid generic statements — every insight should be actionable.",
        userPrompt:
          "Analyze the following hospitality performance data and generate 3-5 key insights:\n\nSeason: {{seasonName}}\nTotal spend: {{totalSpend}}\nTotal guests hosted: {{totalGuests}}\nAttendance rate: {{attendanceRate}}%\nDeals influenced: {{dealsInfluenced}}\nRevenue attributed: {{revenueAttributed}}\nTop performing matches: {{topMatches}}\nUnderutilized matches: {{underutilizedMatches}}\nConversion by segment: {{conversionBySegment}}",
        temperature: 0.5,
        maxTokens: 1024,
      },
    }),
  ]);

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
