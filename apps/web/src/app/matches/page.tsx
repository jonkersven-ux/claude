"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { getMatches, createMatch, getInvitations, type Match } from "@/lib/store";

const objectiveLabels: Record<string, string> = {
  NEW_BUSINESS: "New Business",
  RETENTION: "Retention",
  NETWORKING: "Networking",
  EMPLOYEE_ENGAGEMENT: "Employee Engagement",
  PARTNERSHIP: "Partnership",
  BRAND: "Brand",
};

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [invitations, setInvitations] = useState<ReturnType<typeof getInvitations>>([]);
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    homeTeam: "Ajax",
    awayTeam: "",
    matchDate: "",
    priority: "NORMAL",
    objective: "NEW_BUSINESS",
    status: "SCHEDULED",
    maxGuests: 20,
  });

  const reload = () => {
    setMatches(getMatches());
    setInvitations(getInvitations());
  };

  useEffect(() => {
    reload();
  }, []);

  const getInvitedCount = (matchId: string) =>
    invitations.filter((i) => i.matchId === matchId).length;

  const filtered = matches.filter((m) => {
    const matchesPriority = !priorityFilter || m.priority === priorityFilter;
    const matchesStatus = !statusFilter || m.status === statusFilter;
    return matchesPriority && matchesStatus;
  });

  const handleAdd = () => {
    const match = createMatch(form);
    reload();
    setShowAdd(false);
    setForm({
      homeTeam: "Ajax",
      awayTeam: "",
      matchDate: "",
      priority: "NORMAL",
      objective: "NEW_BUSINESS",
      status: "SCHEDULED",
      maxGuests: 20,
    });
    router.push(`/matches/${match.id}`);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Match Planning"
        description="Manage fixtures, set priorities, and plan guest allocations"
        actions={
          <button className="btn-primary" onClick={() => setShowAdd(true)}>Add match</button>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex items-center gap-3">
        <select
          className="input w-44"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="">All priorities</option>
          <option value="A_MATCH">A-Match</option>
          <option value="HIGH">High</option>
          <option value="NORMAL">Normal</option>
          <option value="LOW">Low</option>
        </select>
        <select
          className="input w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
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
            render: (m: Match) => (
              <Link href={`/matches/${m.id}`} className="block hover:text-brand-600">
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
              </Link>
            ),
          },
          {
            key: "priority",
            header: "Priority",
            render: (m: Match) => <StatusBadge status={m.priority} />,
          },
          {
            key: "objective",
            header: "Objective",
            render: (m: Match) => (
              <span className="text-sm text-surface-600">
                {objectiveLabels[m.objective] || m.objective}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (m: Match) => <StatusBadge status={m.status} />,
          },
          {
            key: "guests",
            header: "Guests",
            render: (m: Match) => {
              const invited = getInvitedCount(m.id);
              return (
                <div className="flex items-center gap-2">
                  <div className="h-2 w-20 overflow-hidden rounded-full bg-surface-200">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${(invited / m.maxGuests) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-surface-500">
                    {invited}/{m.maxGuests}
                  </span>
                </div>
              );
            },
          },
          {
            key: "actions",
            header: "",
            render: (m: Match) => (
              <Link
                href={`/matches/${m.id}`}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                View
              </Link>
            ),
          },
        ]}
        data={filtered}
        onRowClick={(m: Match) => router.push(`/matches/${m.id}`)}
        emptyMessage="No matches found. Add your first match to get started."
      />

      {/* Add match modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Match"
        actions={
          <>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAdd}>Create match</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Home team</label>
              <input
                className="input"
                value={form.homeTeam}
                onChange={(e) => setForm({ ...form, homeTeam: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Away team</label>
              <input
                className="input"
                value={form.awayTeam}
                onChange={(e) => setForm({ ...form, awayTeam: e.target.value })}
                placeholder="e.g. Feyenoord"
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Match date & time</label>
            <input
              type="datetime-local"
              className="input"
              value={form.matchDate}
              onChange={(e) => setForm({ ...form, matchDate: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priority</label>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="A_MATCH">A-Match</option>
                <option value="HIGH">High</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label className="label">Objective</label>
              <select
                className="input"
                value={form.objective}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
              >
                <option value="NEW_BUSINESS">New Business</option>
                <option value="RETENTION">Retention</option>
                <option value="NETWORKING">Networking</option>
                <option value="EMPLOYEE_ENGAGEMENT">Employee Engagement</option>
                <option value="PARTNERSHIP">Partnership</option>
                <option value="BRAND">Brand</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Max guests</label>
            <input
              type="number"
              className="input"
              value={form.maxGuests}
              onChange={(e) => setForm({ ...form, maxGuests: parseInt(e.target.value) || 20 })}
            />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
