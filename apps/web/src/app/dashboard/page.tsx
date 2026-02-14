"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { InsightCard } from "@/components/ui/insight-card";
import { getDashboardData, getAuth } from "@/lib/store";

const insights = [
  {
    type: "GUEST_PRIORITIZATION",
    title: "High-value prospect available",
    content: "Peter van den Berg (ACME Corp, \u20AC450K pipeline) has accepted the invitation to Ajax vs Feyenoord. Recommend seating him next to Jan de Vries for direct executive engagement.",
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

export default function DashboardPage() {
  const [data, setData] = useState<ReturnType<typeof getDashboardData> | null>(null);
  const auth = getAuth();

  useEffect(() => {
    setData(getDashboardData());
  }, []);

  if (!data) return null;

  const { kpis, invitationFunnel, upcomingMatches } = data;

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard"
        description={auth ? `${auth.company.name} — Season 2026/2027` : "Season 2026/2027"}
      />

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Total Guests"
          value={kpis.totalGuests}
          change={`${kpis.totalMatches} matches planned`}
        />
        <KpiCard
          label="Attendance Rate"
          value={kpis.attendanceRate > 0 ? `${kpis.attendanceRate}%` : "—"}
          change="Based on responses"
        />
        <KpiCard
          label="Total Invitations"
          value={kpis.totalInvitations}
        />
        <KpiCard
          label="Pipeline"
          value={kpis.totalPipeline > 0 ? `\u20AC${(kpis.totalPipeline / 1000).toFixed(0)}K` : "\u20AC0"}
          change="Total guest pipeline"
        />
      </div>

      <div className="mt-8 grid grid-cols-3 gap-6">
        {/* Upcoming matches — now clickable */}
        <div className="col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-surface-900">Upcoming Matches</h2>
          <div className="space-y-3">
            {upcomingMatches.length === 0 && (
              <div className="card flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-sm text-surface-500">No matches yet</p>
                  <Link href="/matches" className="mt-2 inline-block text-sm font-medium text-brand-600 hover:text-brand-700">
                    Add your first match
                  </Link>
                </div>
              </div>
            )}
            {upcomingMatches.map((match) => (
              <Link
                key={match.id}
                href={`/matches/${match.id}`}
                className="card flex items-center justify-between px-5 py-4 hover:shadow-md transition-shadow cursor-pointer"
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
                    {match.invitationCount}/{match.maxGuests}
                  </p>
                  <p className="text-xs text-surface-500">guests invited</p>
                </div>
              </Link>
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
