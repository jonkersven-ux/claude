"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { InsightCard } from "@/components/ui/insight-card";

// Demo data — will be replaced by API calls
const kpis = {
  totalGuests: 127,
  totalMatches: 17,
  totalSpend: 111400,
  totalRevenue: 450000,
  roi: 304,
  attendanceRate: 87,
  costPerGuest: 876,
};

const upcomingMatches = [
  { id: "1", homeTeam: "Ajax", awayTeam: "Feyenoord", matchDate: "2026-10-25", priority: "A_MATCH", invitations: 16, maxGuests: 20 },
  { id: "2", homeTeam: "Ajax", awayTeam: "PSV", matchDate: "2026-11-22", priority: "A_MATCH", invitations: 4, maxGuests: 20 },
  { id: "3", homeTeam: "Ajax", awayTeam: "AZ", matchDate: "2026-12-13", priority: "NORMAL", invitations: 0, maxGuests: 20 },
];

const insights = [
  {
    type: "GUEST_PRIORITIZATION",
    title: "High-value prospect available",
    content: "Peter van den Berg (ACME Corp, €450K pipeline) has accepted the invitation to Ajax vs Feyenoord. Recommend seating him next to Jan de Vries for direct executive engagement.",
    confidence: 0.92,
  },
  {
    type: "UTILIZATION_ALERT",
    title: "Low utilization: Ajax vs FC Utrecht",
    content: "The Ajax vs FC Utrecht match (Jan 17) has 0 invitations sent with only 8 weeks to go. Consider using this for employee engagement or lower-priority contacts.",
    confidence: 0.88,
  },
  {
    type: "RELATIONSHIP_HEALTH",
    title: "Renewal at risk: GlobalTech",
    content: "Maria Hendriks (GlobalTech) has attended 2 of 3 invited events. Her renewal is due in January and deal probability dropped to 75%. Recommend a personalized experience.",
    confidence: 0.85,
  },
];

const invitationFunnel = { total: 24, sent: 3, accepted: 16, declined: 2, checkedIn: 0, noShow: 0 };

export default function DashboardPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        description="Season 2026/2027 — Johan Cruijff ArenA"
      />

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Total Guests"
          value={kpis.totalGuests}
          change="+12 this month"
          changeType="positive"
        />
        <KpiCard
          label="Attendance Rate"
          value={`${kpis.attendanceRate}%`}
          change="+3% vs last season"
          changeType="positive"
        />
        <KpiCard
          label="Total Spend"
          value={`€${(kpis.totalSpend / 1000).toFixed(0)}K`}
        />
        <KpiCard
          label="ROI"
          value={`${kpis.roi}%`}
          change={`€${(kpis.totalRevenue / 1000).toFixed(0)}K attributed revenue`}
          changeType="positive"
        />
      </div>

      <div className="mt-8 grid grid-cols-3 gap-6">
        {/* Upcoming matches */}
        <div className="col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-surface-900">Upcoming Matches</h2>
          <div className="space-y-3">
            {upcomingMatches.map((match) => (
              <div
                key={match.id}
                className="card flex items-center justify-between px-5 py-4"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-semibold text-surface-900">
                      {match.homeTeam} vs {match.awayTeam}
                    </p>
                    <p className="text-xs text-surface-500">
                      {new Date(match.matchDate).toLocaleDateString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <StatusBadge status={match.priority} />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-surface-900">
                    {match.invitations}/{match.maxGuests}
                  </p>
                  <p className="text-xs text-surface-500">guests invited</p>
                </div>
              </div>
            ))}
          </div>

          {/* Invitation funnel */}
          <h2 className="mb-4 mt-8 text-lg font-semibold text-surface-900">Invitation Funnel</h2>
          <div className="card-padded">
            <div className="flex items-end gap-4">
              {[
                { label: "Total", value: invitationFunnel.total, color: "bg-surface-300" },
                { label: "Sent", value: invitationFunnel.sent, color: "bg-blue-400" },
                { label: "Accepted", value: invitationFunnel.accepted, color: "bg-emerald-400" },
                { label: "Declined", value: invitationFunnel.declined, color: "bg-red-400" },
              ].map((step) => (
                <div key={step.label} className="flex-1 text-center">
                  <div className="mx-auto mb-2 flex items-end justify-center" style={{ height: 100 }}>
                    <div
                      className={`w-12 rounded-t ${step.color} transition-all`}
                      style={{
                        height: `${invitationFunnel.total > 0 ? (step.value / invitationFunnel.total) * 100 : 0}%`,
                        minHeight: step.value > 0 ? 8 : 0,
                      }}
                    />
                  </div>
                  <p className="text-lg font-bold text-surface-900">{step.value}</p>
                  <p className="text-xs text-surface-500">{step.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights sidebar */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-surface-900">AI Insights</h2>
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <InsightCard
                key={i}
                type={insight.type}
                title={insight.title}
                content={insight.content}
                confidence={insight.confidence}
                onDismiss={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
