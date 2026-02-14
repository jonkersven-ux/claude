const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      if (typeof window !== "undefined") localStorage.setItem("hostiq_token", token);
    } else {
      if (typeof window !== "undefined") localStorage.removeItem("hostiq_token");
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("hostiq_token");
    }
    return this.token;
  }

  async fetch<T = any>(path: string, options: FetchOptions = {}): Promise<T> {
    const { params, headers: customHeaders, ...rest } = options;

    let url = `${API_BASE}${path}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((customHeaders as Record<string, string>) || {}),
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...rest, headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: "Request failed" } }));
      throw new ApiError(response.status, error.error?.message || "Request failed", error.error?.code);
    }

    if (response.status === 204) return undefined as T;
    return response.json();
  }

  // ── Auth ────────────────────────────────────────────
  login(email: string, password: string) {
    return this.fetch<{
      token: string;
      user: any;
      company: any;
    }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  }

  register(data: { companyName: string; companySlug: string; email: string; password: string; firstName: string; lastName: string }) {
    return this.fetch<{ token: string; user: any; company: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  me() {
    return this.fetch<{ user: any; company: any }>("/auth/me");
  }

  // ── Guests ──────────────────────────────────────────
  getGuests(params?: Record<string, string>) {
    return this.fetch<{ data: any[]; meta: any }>("/guests", { params });
  }

  getGuest(id: string) {
    return this.fetch<{ data: any }>(`/guests/${id}`);
  }

  createGuest(data: any) {
    return this.fetch<{ data: any }>("/guests", { method: "POST", body: JSON.stringify(data) });
  }

  updateGuest(id: string, data: any) {
    return this.fetch<{ data: any }>(`/guests/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  }

  // ── Matches ─────────────────────────────────────────
  getMatches(params?: Record<string, string>) {
    return this.fetch<{ data: any[] }>("/matches", { params });
  }

  getMatch(id: string) {
    return this.fetch<{ data: any }>(`/matches/${id}`);
  }

  createMatch(data: any) {
    return this.fetch<{ data: any }>("/matches", { method: "POST", body: JSON.stringify(data) });
  }

  // ── Invitations ─────────────────────────────────────
  getInvitations(params?: Record<string, string>) {
    return this.fetch<{ data: any[] }>("/invitations", { params });
  }

  createInvitation(data: any) {
    return this.fetch<{ data: any }>("/invitations", { method: "POST", body: JSON.stringify(data) });
  }

  batchInvite(data: { matchId: string; guestIds: string[]; personalMessage?: string }) {
    return this.fetch<{ data: any[]; count: number }>("/invitations/batch", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateInvitationStatus(id: string, status: string) {
    return this.fetch<{ data: any }>(`/invitations/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  // ── Seasons ─────────────────────────────────────────
  getSeasons() {
    return this.fetch<{ data: any[] }>("/seasons");
  }

  getSeason(id: string) {
    return this.fetch<{ data: any }>(`/seasons/${id}`);
  }

  // ── Dashboard ───────────────────────────────────────
  getDashboardOverview(seasonId?: string) {
    const params = seasonId ? { seasonId } : undefined;
    return this.fetch<{ data: any }>("/dashboard/overview", { params });
  }

  getRoiDashboard(params?: Record<string, string>) {
    return this.fetch<{ data: any }>("/dashboard/roi", { params });
  }

  // ── AI ──────────────────────────────────────────────
  generateFollowUpEmail(matchId: string, guestId: string, extra?: { talkingPoints?: string; nextStep?: string }) {
    return this.fetch<{ data: { email: string } }>("/ai/follow-up-email", {
      method: "POST",
      body: JSON.stringify({ matchId, guestId, ...extra }),
    });
  }

  generateGuestPrioritization(matchId: string) {
    return this.fetch<{ data: { recommendation: string } }>("/ai/guest-prioritization", {
      method: "POST",
      body: JSON.stringify({ matchId }),
    });
  }

  getAiInsights(params?: Record<string, string>) {
    return this.fetch<{ data: any[] }>("/ai/insights", { params });
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = new ApiClient();
