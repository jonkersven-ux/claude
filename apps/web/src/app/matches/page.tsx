"use client";

import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";

const matches = [
  { id: "1", homeTeam: "Ajax", awayTeam: "Feyenoord", matchDate: "2026-10-25T18:45:00Z", priority: "A_MATCH", objective: "NEW_BUSINESS", status: "INVITATIONS_OPEN", invited: 16, maxGuests: 20 },
  { id: "2", homeTeam: "Ajax", awayTeam: "PSV", matchDate: "2026-11-22T20:00:00Z", priority: "A_MATCH", objective: "RETENTION", status: "SCHEDULED", invited: 4, maxGuests: 20 },
  { id: "3", homeTeam: "Ajax", awayTeam: "AZ", matchDate: "2026-12-13T14:30:00Z", priority: "NORMAL", objective: "NETWORKING", status: "SCHEDULED", invited: 0, maxGuests: 20 },
  { id: "4", homeTeam: "Ajax", awayTeam: "FC Utrecht", matchDate: "2027-01-17T20:00:00Z", priority: "LOW", objective: "EMPLOYEE_ENGAGEMENT", status: "SCHEDULED", invited: 0, maxGuests: 20 },
  { id: "5", homeTeam: "Ajax", awayTeam: "FC Twente", matchDate: "2027-02-14T18:45:00Z", priority: "HIGH", objective: "PARTNERSHIP", status: "SCHEDULED", invited: 0, maxGuests: 20 },
];

const objectiveLabels: Record<string, string> = {
  NEW_BUSINESS: "New Business",
  RETENTION: "Retention",
  NETWORKING: "Networking",
  EMPLOYEE_ENGAGEMENT: "Employee Engagement",
  PARTNERSHIP: "Partnership",
  BRAND: "Brand",
};

export default function MatchesPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Match Planning"
        description="Manage fixtures, set priorities, and plan guest allocations"
        actions={
          <button className="btn-primary">Add match</button>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex items-center gap-3">
        <select className="input w-44">
          <option value="">All priorities</option>
          <option value="A_MATCH">A-Match</option>
          <option value="HIGH">High</option>
          <option value="NORMAL">Normal</option>
          <option value="LOW">Low</option>
        </select>
        <select className="input w-44">
          <option value="">All statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="INVITATIONS_OPEN">Invitations Open</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="MATCHDAY">Matchday</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <DataTable
        columns={[
          {
            key: "match",
            header: "Match",
            render: (m) => (
              <div>
                <p className="font-medium text-surface-900">
                  {m.homeTeam} vs {m.awayTeam}
                </p>
                <p className="text-xs text-surface-500">
                  {new Date(m.matchDate).toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ),
          },
          {
            key: "priority",
            header: "Priority",
            render: (m) => <StatusBadge status={m.priority} />,
          },
          {
            key: "objective",
            header: "Objective",
            render: (m) => (
              <span className="text-sm text-surface-600">
                {objectiveLabels[m.objective] || m.objective}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (m) => <StatusBadge status={m.status} />,
          },
          {
            key: "guests",
            header: "Guests",
            render: (m) => (
              <div className="flex items-center gap-2">
                <div className="h-2 w-20 overflow-hidden rounded-full bg-surface-200">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${(m.invited / m.maxGuests) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-surface-500">
                  {m.invited}/{m.maxGuests}
                </span>
              </div>
            ),
          },
          {
            key: "actions",
            header: "",
            render: (m) => (
              <Link
                href={`/matches/${m.id}`}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                View
              </Link>
            ),
          },
        ]}
        data={matches}
      />
    </AppLayout>
  );
}
