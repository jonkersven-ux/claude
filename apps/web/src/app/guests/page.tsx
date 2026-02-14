"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { getGuests, createGuest, type Guest } from "@/lib/store";

export default function GuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [valueFilter, setValueFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    jobTitle: "",
    guestCompany: "",
    commercialValue: "MEDIUM",
    relationshipStage: "PROSPECT",
    accountManager: "",
    pipeline: 0,
    tags: [] as string[],
    notes: "",
  });

  const reload = () => setGuests(getGuests());

  useEffect(() => {
    reload();
  }, []);

  const filtered = guests.filter((g) => {
    const matchesSearch =
      !search ||
      `${g.firstName} ${g.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      g.guestCompany.toLowerCase().includes(search.toLowerCase()) ||
      g.email.toLowerCase().includes(search.toLowerCase());
    const matchesStage = !stageFilter || g.relationshipStage === stageFilter;
    const matchesValue = !valueFilter || g.commercialValue === valueFilter;
    return matchesSearch && matchesStage && matchesValue;
  });

  const handleAdd = () => {
    createGuest(form);
    reload();
    setShowAdd(false);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      guestCompany: "",
      commercialValue: "MEDIUM",
      relationshipStage: "PROSPECT",
      accountManager: "",
      pipeline: 0,
      tags: [],
      notes: "",
    });
  };

  const stats = {
    total: guests.length,
    prospects: guests.filter((g) => g.relationshipStage === "PROSPECT").length,
    activeClients: guests.filter((g) => g.relationshipStage === "ACTIVE_CLIENT").length,
    strategic: guests.filter((g) => g.relationshipStage === "STRATEGIC_PARTNER").length,
    totalPipeline: guests.reduce((sum, g) => sum + g.pipeline, 0),
  };

  return (
    <AppLayout>
      <PageHeader
        title="Guest Intelligence CRM"
        description="Manage relationships, track commercial value, and monitor engagement"
        actions={
          <button className="btn-primary" onClick={() => setShowAdd(true)}>Add guest</button>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search guests by name, company, or email..."
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-44"
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
        >
          <option value="">All stages</option>
          <option value="PROSPECT">Prospect</option>
          <option value="QUALIFIED_LEAD">Qualified Lead</option>
          <option value="ACTIVE_CLIENT">Active Client</option>
          <option value="STRATEGIC_PARTNER">Strategic Partner</option>
          <option value="CHURNED">Churned</option>
        </select>
        <select
          className="input w-44"
          value={valueFilter}
          onChange={(e) => setValueFilter(e.target.value)}
        >
          <option value="">All values</option>
          <option value="VERY_HIGH">Very High</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      {/* Quick stats */}
      <div className="mb-6 grid grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total },
          { label: "Prospects", value: stats.prospects },
          { label: "Active Clients", value: stats.activeClients },
          { label: "Strategic Partners", value: stats.strategic },
          { label: "Total Pipeline", value: stats.totalPipeline > 0 ? `\u20AC${(stats.totalPipeline / 1000).toFixed(0)}K` : "\u20AC0" },
        ].map((stat) => (
          <div key={stat.label} className="card px-4 py-3 text-center">
            <p className="text-lg font-bold text-surface-900">{stat.value}</p>
            <p className="text-xs text-surface-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            header: "Guest",
            render: (g: Guest) => (
              <div>
                <Link
                  href={`/guests/${g.id}`}
                  className="font-medium text-surface-900 hover:text-brand-600"
                >
                  {g.firstName} {g.lastName}
                </Link>
                <p className="text-xs text-surface-500">{g.jobTitle}</p>
              </div>
            ),
          },
          { key: "guestCompany", header: "Company" },
          {
            key: "commercialValue",
            header: "Value",
            render: (g: Guest) => <StatusBadge status={g.commercialValue} />,
          },
          {
            key: "relationshipStage",
            header: "Stage",
            render: (g: Guest) => <StatusBadge status={g.relationshipStage} />,
          },
          {
            key: "eventsAttended",
            header: "Events",
            render: (g: Guest) => (
              <span className="text-sm text-surface-600">{g.eventsAttended}</span>
            ),
          },
          {
            key: "pipeline",
            header: "Pipeline",
            render: (g: Guest) => (
              <span className="text-sm font-medium text-surface-900">
                {g.pipeline > 0 ? `\u20AC${(g.pipeline / 1000).toFixed(0)}K` : "\u2014"}
              </span>
            ),
          },
          {
            key: "accountManager",
            header: "Manager",
            render: (g: Guest) => (
              <span className="text-sm text-surface-500">{g.accountManager}</span>
            ),
          },
        ]}
        data={filtered}
        emptyMessage="No guests found. Add your first guest to get started."
      />

      {/* Add guest modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Guest"
        actions={
          <>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAdd}>Add guest</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">First name</label>
              <input
                className="input"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Last name</label>
              <input
                className="input"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Job title</label>
              <input
                className="input"
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Company</label>
            <input
              className="input"
              value={form.guestCompany}
              onChange={(e) => setForm({ ...form, guestCompany: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Commercial value</label>
              <select
                className="input"
                value={form.commercialValue}
                onChange={(e) => setForm({ ...form, commercialValue: e.target.value })}
              >
                <option value="VERY_HIGH">Very High</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            <div>
              <label className="label">Relationship stage</label>
              <select
                className="input"
                value={form.relationshipStage}
                onChange={(e) => setForm({ ...form, relationshipStage: e.target.value })}
              >
                <option value="PROSPECT">Prospect</option>
                <option value="QUALIFIED_LEAD">Qualified Lead</option>
                <option value="ACTIVE_CLIENT">Active Client</option>
                <option value="STRATEGIC_PARTNER">Strategic Partner</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Account manager</label>
              <input
                className="input"
                value={form.accountManager}
                onChange={(e) => setForm({ ...form, accountManager: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Pipeline value (&euro;)</label>
              <input
                type="number"
                className="input"
                value={form.pipeline || ""}
                onChange={(e) => setForm({ ...form, pipeline: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input"
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
