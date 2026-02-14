"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import {
  getInvitations,
  getGuests,
  getMatches,
  createInvitation,
  updateInvitationStatus,
  type Invitation,
  type Guest,
  type Match,
} from "@/lib/store";

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [matchFilter, setMatchFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ matchId: "", guestId: "", personalMessage: "" });

  const reload = () => {
    setInvitations(getInvitations());
    setGuests(getGuests());
    setMatches(getMatches());
  };

  useEffect(() => {
    reload();
  }, []);

  const guestName = (guestId: string) => {
    const g = guests.find((g) => g.id === guestId);
    return g ? `${g.firstName} ${g.lastName}` : "Unknown";
  };

  const guestCompany = (guestId: string) => {
    const g = guests.find((g) => g.id === guestId);
    return g?.guestCompany || "";
  };

  const matchLabel = (matchId: string) => {
    const m = matches.find((m) => m.id === matchId);
    return m ? `${m.homeTeam} vs ${m.awayTeam}` : "Unknown";
  };

  const matchDate = (matchId: string) => {
    const m = matches.find((m) => m.id === matchId);
    return m?.matchDate || "";
  };

  const filtered = invitations.filter((inv) => {
    const matchesStatus = !statusFilter || inv.status === statusFilter;
    const matchesMatch = !matchFilter || inv.matchId === matchFilter;
    return matchesStatus && matchesMatch;
  });

  const statusCounts = {
    total: invitations.length,
    draft: invitations.filter((i) => i.status === "DRAFT").length,
    sent: invitations.filter((i) => i.status === "SENT").length,
    accepted: invitations.filter((i) => i.status === "ACCEPTED").length,
    declined: invitations.filter((i) => i.status === "DECLINED").length,
  };

  const handleAdd = () => {
    if (!form.matchId || !form.guestId) return;
    createInvitation(form);
    reload();
    setShowAdd(false);
    setForm({ matchId: "", guestId: "", personalMessage: "" });
  };

  const handleStatusChange = (id: string, status: string) => {
    updateInvitationStatus(id, status);
    reload();
  };

  return (
    <AppLayout>
      <PageHeader
        title="Invitations"
        description="Manage and track all hospitality invitations"
        actions={
          <div className="flex gap-3">
            <button className="btn-primary" onClick={() => setShowAdd(true)}>New invitation</button>
          </div>
        }
      />

      {/* Funnel summary */}
      <div className="mb-6 grid grid-cols-5 gap-3">
        {[
          { label: "Total", count: statusCounts.total, color: "bg-surface-900" },
          { label: "Draft", count: statusCounts.draft, color: "bg-surface-400" },
          { label: "Sent", count: statusCounts.sent, color: "bg-blue-500" },
          { label: "Accepted", count: statusCounts.accepted, color: "bg-emerald-500" },
          { label: "Declined", count: statusCounts.declined, color: "bg-red-500" },
        ].map((item) => (
          <div key={item.label} className="card px-4 py-3">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
              <span className="text-xs font-medium text-surface-500">{item.label}</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-surface-900">{item.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex items-center gap-3">
        <select
          className="input w-56"
          value={matchFilter}
          onChange={(e) => setMatchFilter(e.target.value)}
        >
          <option value="">All matches</option>
          {matches.map((m) => (
            <option key={m.id} value={m.id}>{m.homeTeam} vs {m.awayTeam}</option>
          ))}
        </select>
        <select
          className="input w-44"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="DECLINED">Declined</option>
          <option value="CHECKED_IN">Checked In</option>
          <option value="NO_SHOW">No Show</option>
        </select>
      </div>

      <DataTable
        columns={[
          {
            key: "guest",
            header: "Guest",
            render: (inv: Invitation) => (
              <div>
                <p className="font-medium text-surface-900">{guestName(inv.guestId)}</p>
                <p className="text-xs text-surface-500">{guestCompany(inv.guestId)}</p>
              </div>
            ),
          },
          {
            key: "match",
            header: "Match",
            render: (inv: Invitation) => (
              <div>
                <p className="text-sm text-surface-900">{matchLabel(inv.matchId)}</p>
                <p className="text-xs text-surface-500">
                  {matchDate(inv.matchId) ? new Date(matchDate(inv.matchId)).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}
                </p>
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (inv: Invitation) => <StatusBadge status={inv.status} />,
          },
          {
            key: "sentAt",
            header: "Sent",
            render: (inv: Invitation) => (
              <span className="text-sm text-surface-500">
                {inv.sentAt ? new Date(inv.sentAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "\u2014"}
              </span>
            ),
          },
          {
            key: "respondedAt",
            header: "Responded",
            render: (inv: Invitation) => (
              <span className="text-sm text-surface-500">
                {inv.respondedAt ? new Date(inv.respondedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "\u2014"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            render: (inv: Invitation) => (
              <div className="flex gap-2">
                {inv.status === "DRAFT" && (
                  <button
                    onClick={() => handleStatusChange(inv.id, "SENT")}
                    className="text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    Send
                  </button>
                )}
                {inv.status === "SENT" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(inv.id, "ACCEPTED")}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusChange(inv.id, "DECLINED")}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Decline
                    </button>
                  </>
                )}
                {inv.status === "ACCEPTED" && (
                  <button
                    onClick={() => handleStatusChange(inv.id, "CHECKED_IN")}
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                  >
                    Check in
                  </button>
                )}
              </div>
            ),
          },
        ]}
        data={filtered}
        emptyMessage="No invitations match your filters"
      />

      {/* New invitation modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="New Invitation"
        actions={
          <>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAdd}>Create invitation</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Match</label>
            <select
              className="input"
              value={form.matchId}
              onChange={(e) => setForm({ ...form, matchId: e.target.value })}
            >
              <option value="">Select a match...</option>
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.homeTeam} vs {m.awayTeam} ({new Date(m.matchDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Guest</label>
            <select
              className="input"
              value={form.guestId}
              onChange={(e) => setForm({ ...form, guestId: e.target.value })}
            >
              <option value="">Select a guest...</option>
              {guests.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.firstName} {g.lastName} — {g.guestCompany}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Personal message (optional)</label>
            <textarea
              className="input"
              rows={3}
              value={form.personalMessage}
              onChange={(e) => setForm({ ...form, personalMessage: e.target.value })}
              placeholder="Add a personal touch to this invitation..."
            />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
