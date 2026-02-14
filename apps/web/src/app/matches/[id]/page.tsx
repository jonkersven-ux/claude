"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { InsightCard } from "@/components/ui/insight-card";

// Demo data for Ajax vs Feyenoord
const match = {
  homeTeam: "Ajax",
  awayTeam: "Feyenoord",
  matchDate: "2026-10-25T18:45:00Z",
  priority: "A_MATCH",
  objective: "NEW_BUSINESS",
  status: "INVITATIONS_OPEN",
  maxGuests: 20,
};

const invitations = [
  { id: "1", guestName: "Peter van den Berg", company: "ACME Corp", value: "VERY_HIGH", status: "ACCEPTED", role: "CEO" },
  { id: "2", guestName: "Maria Hendriks", company: "GlobalTech", value: "HIGH", status: "ACCEPTED", role: "VP Procurement" },
  { id: "3", guestName: "Thomas Smit", company: "InnovaTech", value: "HIGH", status: "SENT", role: "CTO" },
  { id: "4", guestName: "Emma de Groot", company: "Dutch Finance Group", value: "VERY_HIGH", status: "ACCEPTED", role: "Managing Director" },
];

export default function MatchDetailPage() {
  return (
    <AppLayout>
      <PageHeader
        title={`${match.homeTeam} vs ${match.awayTeam}`}
        description={new Date(match.matchDate).toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
        actions={
          <div className="flex gap-3">
            <button className="btn-secondary">AI Guest Suggestions</button>
            <button className="btn-primary">Invite Guests</button>
          </div>
        }
      />

      {/* Match info badges */}
      <div className="mb-6 flex items-center gap-3">
        <StatusBadge status={match.priority} />
        <StatusBadge status={match.status} />
        <span className="badge-blue">Objective: New Business</span>
      </div>

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        <KpiCard label="Invited" value={invitations.length} />
        <KpiCard label="Accepted" value={invitations.filter((i) => i.status === "ACCEPTED").length} />
        <KpiCard label="Pending" value={invitations.filter((i) => i.status === "SENT").length} />
        <KpiCard label="Available Seats" value={match.maxGuests - invitations.length} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Guest list */}
        <div className="col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-surface-900">Guest List</h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">RSVP</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-surface-900">{inv.guestName}</p>
                      <p className="text-xs text-surface-500">{inv.role}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600">{inv.company}</td>
                    <td className="px-4 py-3"><StatusBadge status={inv.value} /></td>
                    <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                    <td className="px-4 py-3">
                      <button className="text-xs font-medium text-brand-600 hover:text-brand-700">
                        Send reminder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: AI insight + seating */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-surface-900">AI Recommendations</h2>
          <InsightCard
            type="GUEST_PRIORITIZATION"
            title="Seating suggestion"
            content="Seat Peter van den Berg (ACME Corp, €450K pipeline) next to Jan de Vries (CEO) for maximum executive-level engagement. Their industries align on digital transformation."
            confidence={0.92}
          />
          <InsightCard
            type="FOLLOW_UP_SUGGESTION"
            title="Pre-match brief"
            content="Thomas Smit (InnovaTech) hasn't responded yet. His company just raised Series B funding. Consider a personal call — this is a high-conversion window."
            confidence={0.78}
          />

          <h2 className="mt-6 text-lg font-semibold text-surface-900">Seat Allocation</h2>
          <div className="card-padded">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-600">Skybox 42</span>
                <span className="text-sm font-medium text-surface-900">3/12 filled</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-200">
                <div className="h-full w-1/4 rounded-full bg-brand-500" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-surface-600">Business Seats Row A</span>
                <span className="text-sm font-medium text-surface-900">1/8 filled</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-200">
                <div className="h-full rounded-full bg-brand-500" style={{ width: "12.5%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
