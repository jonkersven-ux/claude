// localStorage-based data store for HostIQ demo
// Provides full CRUD without requiring a PostgreSQL backend

function uid(): string {
  return crypto.randomUUID();
}

// ── Types ──────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  companyId: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

export interface Guest {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  guestCompany: string;
  commercialValue: string;
  relationshipStage: string;
  accountManager: string;
  eventsAttended: number;
  pipeline: number;
  tags: string[];
  notes: string;
  createdAt: string;
}

export interface Match {
  id: string;
  companyId: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  priority: string;
  objective: string;
  status: string;
  maxGuests: number;
  createdAt: string;
}

export interface Invitation {
  id: string;
  companyId: string;
  matchId: string;
  guestId: string;
  status: string;
  personalMessage: string;
  sentAt: string | null;
  respondedAt: string | null;
  createdAt: string;
}

// ── Storage helpers ────────────────────────────────

function get<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(`hostiq_${key}`);
  return raw ? JSON.parse(raw) : null;
}

function set(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`hostiq_${key}`, JSON.stringify(value));
}

function getList<T>(key: string): T[] {
  return get<T[]>(key) || [];
}

// ── Auth ──────────────────────────────────────────

export function getAuth(): { user: User; company: Company } | null {
  const userId = get<string>("session");
  if (!userId) return null;
  const users = getList<User>("users");
  const companies = getList<Company>("companies");
  const user = users.find((u) => u.id === userId);
  if (!user) return null;
  const company = companies.find((c) => c.id === user.companyId);
  if (!company) return null;
  return { user, company };
}

export function login(email: string, password: string): { user: User; company: Company } | null {
  const users = getList<User>("users");
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return null;
  const companies = getList<Company>("companies");
  const company = companies.find((c) => c.id === user.companyId);
  if (!company) return null;
  set("session", user.id);
  return { user, company };
}

export function register(data: {
  companyName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): { user: User; company: Company } {
  const users = getList<User>("users");
  if (users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error("Email already in use");
  }

  const companyId = uid();
  const company: Company = {
    id: companyId,
    name: data.companyName,
    slug: data.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    plan: "PROFESSIONAL",
  };

  const user: User = {
    id: uid(),
    email: data.email,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    role: "OWNER",
    companyId,
    createdAt: new Date().toISOString(),
  };

  const companies = getList<Company>("companies");
  companies.push(company);
  set("companies", companies);

  users.push(user);
  set("users", users);

  set("session", user.id);
  return { user, company };
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("hostiq_session");
}

// ── Guests ────────────────────────────────────────

export function getGuests(): Guest[] {
  const auth = getAuth();
  if (!auth) return [];
  return getList<Guest>("guests").filter((g) => g.companyId === auth.company.id);
}

export function getGuest(id: string): Guest | null {
  return getList<Guest>("guests").find((g) => g.id === id) || null;
}

export function createGuest(data: Omit<Guest, "id" | "companyId" | "createdAt" | "eventsAttended">): Guest {
  const auth = getAuth();
  if (!auth) throw new Error("Not authenticated");
  const guest: Guest = {
    ...data,
    id: uid(),
    companyId: auth.company.id,
    eventsAttended: 0,
    createdAt: new Date().toISOString(),
  };
  const guests = getList<Guest>("guests");
  guests.push(guest);
  set("guests", guests);
  return guest;
}

export function updateGuest(id: string, data: Partial<Guest>): Guest | null {
  const guests = getList<Guest>("guests");
  const idx = guests.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  guests[idx] = { ...guests[idx], ...data };
  set("guests", guests);
  return guests[idx];
}

// ── Matches ───────────────────────────────────────

export function getMatches(): Match[] {
  const auth = getAuth();
  if (!auth) return [];
  return getList<Match>("matches").filter((m) => m.companyId === auth.company.id);
}

export function getMatch(id: string): Match | null {
  return getList<Match>("matches").find((m) => m.id === id) || null;
}

export function createMatch(data: Omit<Match, "id" | "companyId" | "createdAt">): Match {
  const auth = getAuth();
  if (!auth) throw new Error("Not authenticated");
  const match: Match = {
    ...data,
    id: uid(),
    companyId: auth.company.id,
    createdAt: new Date().toISOString(),
  };
  const matches = getList<Match>("matches");
  matches.push(match);
  set("matches", matches);
  return match;
}

export function updateMatch(id: string, data: Partial<Match>): Match | null {
  const matches = getList<Match>("matches");
  const idx = matches.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  matches[idx] = { ...matches[idx], ...data };
  set("matches", matches);
  return matches[idx];
}

// ── Invitations ───────────────────────────────────

export function getInvitations(filters?: { matchId?: string; guestId?: string; status?: string }): Invitation[] {
  const auth = getAuth();
  if (!auth) return [];
  let invs = getList<Invitation>("invitations").filter((i) => i.companyId === auth.company.id);
  if (filters?.matchId) invs = invs.filter((i) => i.matchId === filters.matchId);
  if (filters?.guestId) invs = invs.filter((i) => i.guestId === filters.guestId);
  if (filters?.status) invs = invs.filter((i) => i.status === filters.status);
  return invs;
}

export function createInvitation(data: { matchId: string; guestId: string; personalMessage?: string }): Invitation {
  const auth = getAuth();
  if (!auth) throw new Error("Not authenticated");
  const invitation: Invitation = {
    id: uid(),
    companyId: auth.company.id,
    matchId: data.matchId,
    guestId: data.guestId,
    status: "DRAFT",
    personalMessage: data.personalMessage || "",
    sentAt: null,
    respondedAt: null,
    createdAt: new Date().toISOString(),
  };
  const invitations = getList<Invitation>("invitations");
  invitations.push(invitation);
  set("invitations", invitations);
  return invitation;
}

export function updateInvitationStatus(id: string, status: string): Invitation | null {
  const invitations = getList<Invitation>("invitations");
  const idx = invitations.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  invitations[idx].status = status;
  if (status === "SENT" && !invitations[idx].sentAt) {
    invitations[idx].sentAt = new Date().toISOString();
  }
  if (["ACCEPTED", "DECLINED"].includes(status)) {
    invitations[idx].respondedAt = new Date().toISOString();
  }
  set("invitations", invitations);
  return invitations[idx];
}

// ── Dashboard KPIs ─────────────────────────────────

export function getDashboardData() {
  const guests = getGuests();
  const matches = getMatches();
  const invitations = getInvitations();

  const accepted = invitations.filter((i) => i.status === "ACCEPTED" || i.status === "CHECKED_IN").length;
  const totalInvited = invitations.filter((i) => i.status !== "DRAFT").length;

  return {
    kpis: {
      totalGuests: guests.length,
      totalMatches: matches.length,
      totalInvitations: invitations.length,
      attendanceRate: totalInvited > 0 ? Math.round((accepted / totalInvited) * 100) : 0,
      totalPipeline: guests.reduce((sum, g) => sum + g.pipeline, 0),
    },
    invitationFunnel: {
      total: invitations.length,
      draft: invitations.filter((i) => i.status === "DRAFT").length,
      sent: invitations.filter((i) => i.status === "SENT").length,
      accepted: invitations.filter((i) => i.status === "ACCEPTED").length,
      declined: invitations.filter((i) => i.status === "DECLINED").length,
      checkedIn: invitations.filter((i) => i.status === "CHECKED_IN").length,
    },
    upcomingMatches: matches
      .filter((m) => m.status !== "COMPLETED")
      .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime())
      .slice(0, 5)
      .map((m) => ({
        ...m,
        invitationCount: invitations.filter((i) => i.matchId === m.id).length,
      })),
  };
}

// ── Seed demo data ─────────────────────────────────

export function seedIfEmpty() {
  if (typeof window === "undefined") return;
  if (getList<User>("users").length > 0) return;

  const companyId = uid();
  const company: Company = {
    id: companyId,
    name: "TechVentures BV",
    slug: "techventures",
    plan: "PROFESSIONAL",
  };

  const admin: User = {
    id: uid(),
    email: "admin@hostiq.io",
    password: "admin123",
    firstName: "Jan",
    lastName: "de Vries",
    role: "OWNER",
    companyId,
    createdAt: new Date().toISOString(),
  };

  set("companies", [company]);
  set("users", [admin]);

  // Seed guests
  const guestData: Omit<Guest, "id" | "createdAt">[] = [
    { companyId, firstName: "Peter", lastName: "van den Berg", email: "peter@acmecorp.nl", phone: "+31 6 1234 5678", jobTitle: "CEO", guestCompany: "ACME Corp", commercialValue: "VERY_HIGH", relationshipStage: "QUALIFIED_LEAD", accountManager: "Lisa Bakker", eventsAttended: 3, pipeline: 450000, tags: ["enterprise", "decision-maker"], notes: "Key decision maker for their digital transformation initiative." },
    { companyId, firstName: "Maria", lastName: "Hendriks", email: "maria@globaltech.com", phone: "+31 6 2345 6789", jobTitle: "VP Procurement", guestCompany: "GlobalTech", commercialValue: "HIGH", relationshipStage: "ACTIVE_CLIENT", accountManager: "Mark Jansen", eventsAttended: 5, pipeline: 180000, tags: ["renewal"], notes: "Annual renewal due January. Recently promoted." },
    { companyId, firstName: "Thomas", lastName: "Smit", email: "thomas@innovatech.nl", phone: "+31 6 3456 7890", jobTitle: "CTO", guestCompany: "InnovaTech", commercialValue: "HIGH", relationshipStage: "PROSPECT", accountManager: "Lisa Bakker", eventsAttended: 0, pipeline: 0, tags: ["tech", "series-b"], notes: "Series B funded. Looking for enterprise SaaS tooling." },
    { companyId, firstName: "Emma", lastName: "de Groot", email: "emma@dutchfinance.nl", phone: "+31 6 4567 8901", jobTitle: "Managing Director", guestCompany: "Dutch Finance Group", commercialValue: "VERY_HIGH", relationshipStage: "STRATEGIC_PARTNER", accountManager: "Mark Jansen", eventsAttended: 8, pipeline: 320000, tags: ["strategic", "long-term"], notes: "Long-standing strategic partner." },
    { companyId, firstName: "Robert", lastName: "Visser", email: "robert@buildright.nl", phone: "+31 6 5678 9012", jobTitle: "Commercial Director", guestCompany: "BuildRight BV", commercialValue: "MEDIUM", relationshipStage: "QUALIFIED_LEAD", accountManager: "Lisa Bakker", eventsAttended: 1, pipeline: 75000, tags: ["construction"], notes: "Interested in procurement module." },
    { companyId, firstName: "Anna", lastName: "Vermeer", email: "anna@logisticspro.nl", phone: "+31 6 6789 0123", jobTitle: "COO", guestCompany: "LogisticsPro", commercialValue: "HIGH", relationshipStage: "PROSPECT", accountManager: "Mark Jansen", eventsAttended: 0, pipeline: 0, tags: ["logistics"], notes: "New contact from networking event." },
    { companyId, firstName: "Daan", lastName: "Kuijpers", email: "daan@mediaworks.nl", phone: "+31 6 7890 1234", jobTitle: "Creative Director", guestCompany: "MediaWorks", commercialValue: "MEDIUM", relationshipStage: "ACTIVE_CLIENT", accountManager: "Lisa Bakker", eventsAttended: 2, pipeline: 95000, tags: ["media", "creative"], notes: "Active client, exploring upsell." },
  ];

  const guests: Guest[] = guestData.map((g) => ({
    ...g,
    id: uid(),
    createdAt: new Date().toISOString(),
  }));
  set("guests", guests);

  // Seed matches
  const matchData: Omit<Match, "id" | "createdAt">[] = [
    { companyId, homeTeam: "Ajax", awayTeam: "Feyenoord", matchDate: "2026-10-25T18:45:00Z", priority: "A_MATCH", objective: "NEW_BUSINESS", status: "INVITATIONS_OPEN", maxGuests: 20 },
    { companyId, homeTeam: "Ajax", awayTeam: "PSV", matchDate: "2026-11-22T20:00:00Z", priority: "A_MATCH", objective: "RETENTION", status: "SCHEDULED", maxGuests: 20 },
    { companyId, homeTeam: "Ajax", awayTeam: "AZ", matchDate: "2026-12-13T14:30:00Z", priority: "NORMAL", objective: "NETWORKING", status: "SCHEDULED", maxGuests: 20 },
    { companyId, homeTeam: "Ajax", awayTeam: "FC Utrecht", matchDate: "2027-01-17T20:00:00Z", priority: "LOW", objective: "EMPLOYEE_ENGAGEMENT", status: "SCHEDULED", maxGuests: 20 },
    { companyId, homeTeam: "Ajax", awayTeam: "FC Twente", matchDate: "2027-02-14T18:45:00Z", priority: "HIGH", objective: "PARTNERSHIP", status: "SCHEDULED", maxGuests: 20 },
  ];

  const matches: Match[] = matchData.map((m) => ({
    ...m,
    id: uid(),
    createdAt: new Date().toISOString(),
  }));
  set("matches", matches);

  // Seed invitations for first match (Ajax vs Feyenoord)
  const feyenoordMatch = matches[0];
  const psvMatch = matches[1];
  const invitationSeeds: Invitation[] = [
    { id: uid(), companyId, matchId: feyenoordMatch.id, guestId: guests[0].id, status: "ACCEPTED", personalMessage: "", sentAt: "2026-10-01T09:00:00Z", respondedAt: "2026-10-03T14:00:00Z", createdAt: "2026-10-01T09:00:00Z" },
    { id: uid(), companyId, matchId: feyenoordMatch.id, guestId: guests[1].id, status: "ACCEPTED", personalMessage: "", sentAt: "2026-10-01T09:00:00Z", respondedAt: "2026-10-02T10:00:00Z", createdAt: "2026-10-01T09:00:00Z" },
    { id: uid(), companyId, matchId: feyenoordMatch.id, guestId: guests[2].id, status: "SENT", personalMessage: "", sentAt: "2026-10-05T11:00:00Z", respondedAt: null, createdAt: "2026-10-05T11:00:00Z" },
    { id: uid(), companyId, matchId: feyenoordMatch.id, guestId: guests[3].id, status: "ACCEPTED", personalMessage: "", sentAt: "2026-10-01T09:00:00Z", respondedAt: "2026-10-01T16:00:00Z", createdAt: "2026-10-01T09:00:00Z" },
    { id: uid(), companyId, matchId: psvMatch.id, guestId: guests[4].id, status: "DRAFT", personalMessage: "", sentAt: null, respondedAt: null, createdAt: "2026-10-15T09:00:00Z" },
    { id: uid(), companyId, matchId: psvMatch.id, guestId: guests[5].id, status: "DRAFT", personalMessage: "", sentAt: null, respondedAt: null, createdAt: "2026-10-15T09:00:00Z" },
    { id: uid(), companyId, matchId: psvMatch.id, guestId: guests[6].id, status: "SENT", personalMessage: "", sentAt: "2026-10-20T09:00:00Z", respondedAt: null, createdAt: "2026-10-18T09:00:00Z" },
    { id: uid(), companyId, matchId: psvMatch.id, guestId: guests[0].id, status: "SENT", personalMessage: "", sentAt: "2026-10-18T09:00:00Z", respondedAt: null, createdAt: "2026-10-18T09:00:00Z" },
  ];
  set("invitations", invitationSeeds);
}
