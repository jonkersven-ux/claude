"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";

const invitations = [
  { id: "1", guest: "Peter van den Berg", company: "ACME Corp", match: "Ajax vs Feyenoord", matchDate: "2026-10-25", status: "ACCEPTED", sentAt: "2026-10-01", respondedAt: "2026-10-03" },
  { id: "2", guest: "Maria Hendriks", company: "GlobalTech", match: "Ajax vs Feyenoord", matchDate: "2026-10-25", status: "ACCEPTED", sentAt: "2026-10-01", respondedAt: "2026-10-02" },
  { id: "3", guest: "Thomas Smit", company: "InnovaTech", match: "Ajax vs Feyenoord", matchDate: "2026-10-25", status: "SENT", sentAt: "2026-10-05", respondedAt: null },
  { id: "4", guest: "Emma de Groot", company: "Dutch Finance Group", match: "Ajax vs Feyenoord", matchDate: "2026-10-25", status: "ACCEPTED", sentAt: "2026-10-01", respondedAt: "2026-10-01" },
  { id: "5", guest: "Robert Visser", company: "BuildRight BV", match: "Ajax vs PSV", matchDate: "2026-11-22", status: "DRAFT", sentAt: null, respondedAt: null },
  { id: "6", guest: "Anna Vermeer", company: "LogisticsPro", match: "Ajax vs PSV", matchDate: "2026-11-22", status: "DRAFT", sentAt: null, respondedAt: null },
  { id: "7", guest: "Daan Kuijpers", company: "MediaWorks", match: "Ajax vs PSV", matchDate: "2026-11-22", status: "SENT", sentAt: "2026-10-20", respondedAt: null },
  { id: "8", guest: "Peter van den Berg", company: "ACME Corp", match: "Ajax vs PSV", matchDate: "2026-11-22", status: "SENT", sentAt: "2026-10-18", respondedAt: null },
];

export default function InvitationsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [matchFilter, setMatchFilter] = useState("");

  const filtered = invitations.filter((inv) => {
    const matchesStatus = !statusFilter || inv.status === statusFilter;
    const matchesMatch = !matchFilter || inv.match === matchFilter;
    return matchesStatus && matchesMatch;
  });

  const uniqueMatches = [...new Set(invitations.map((i) => i.match))];

  const statusCounts = {
    total: invitations.length,
    draft: invitations.filter((i) => i.status === "DRAFT").length,
    sent: invitations.filter((i) => i.status === "SENT").length,
    accepted: invitations.filter((i) => i.status === "ACCEPTED").length,
    declined: invitations.filter((i) => i.status === "DECLINED").length,
  };

  return (
    <AppLayout>
      <PageHeader
        title="Invitations"
        description="Manage and track all hospitality invitations"
        actions={
          <div className="flex gap-3">
            <button className="btn-secondary">Send reminders</button>
            <button className="btn-primary">New invitation</button>
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
          {uniqueMatches.map((m) => (
            <option key={m} value={m}>{m}</option>
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
            render: (inv) => (
              <div>
                <p className="font-medium text-surface-900">{inv.guest}</p>
                <p className="text-xs text-surface-500">{inv.company}</p>
              </div>
            ),
          },
          {
            key: "match",
            header: "Match",
            render: (inv) => (
              <div>
                <p className="text-sm text-surface-900">{inv.match}</p>
                <p className="text-xs text-surface-500">
                  {new Date(inv.matchDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (inv) => <StatusBadge status={inv.status} />,
          },
          {
            key: "sentAt",
            header: "Sent",
            render: (inv) => (
              <span className="text-sm text-surface-500">
                {inv.sentAt ? new Date(inv.sentAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
              </span>
            ),
          },
          {
            key: "respondedAt",
            header: "Responded",
            render: (inv) => (
              <span className="text-sm text-surface-500">
                {inv.respondedAt ? new Date(inv.respondedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            render: (inv) => (
              <div className="flex gap-2">
                {inv.status === "DRAFT" && (
                  <button className="text-xs font-medium text-brand-600 hover:text-brand-700">Send</button>
                )}
                {inv.status === "SENT" && (
                  <button className="text-xs font-medium text-brand-600 hover:text-brand-700">Remind</button>
                )}
                {inv.status === "ACCEPTED" && (
                  <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700">Check in</button>
                )}
              </div>
            ),
          },
        ]}
        data={filtered}
        emptyMessage="No invitations match your filters"
      />
    </AppLayout>
  );
}
