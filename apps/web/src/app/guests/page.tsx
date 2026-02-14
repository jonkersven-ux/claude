"use client";

import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { DataTable } from "@/components/ui/data-table";

const guests = [
  { id: "1", firstName: "Peter", lastName: "van den Berg", email: "peter@acmecorp.nl", guestCompany: "ACME Corp", jobTitle: "CEO", commercialValue: "VERY_HIGH", relationshipStage: "QUALIFIED_LEAD", eventsAttended: 3, pipeline: 450000, accountManager: "Lisa Bakker" },
  { id: "2", firstName: "Maria", lastName: "Hendriks", email: "maria@globaltech.com", guestCompany: "GlobalTech", jobTitle: "VP Procurement", commercialValue: "HIGH", relationshipStage: "ACTIVE_CLIENT", eventsAttended: 5, pipeline: 180000, accountManager: "Mark Jansen" },
  { id: "3", firstName: "Thomas", lastName: "Smit", email: "thomas@innovatech.nl", guestCompany: "InnovaTech", jobTitle: "CTO", commercialValue: "HIGH", relationshipStage: "PROSPECT", eventsAttended: 0, pipeline: 0, accountManager: "Lisa Bakker" },
  { id: "4", firstName: "Emma", lastName: "de Groot", email: "emma@dutchfinance.nl", guestCompany: "Dutch Finance Group", jobTitle: "Managing Director", commercialValue: "VERY_HIGH", relationshipStage: "STRATEGIC_PARTNER", eventsAttended: 8, pipeline: 320000, accountManager: "Mark Jansen" },
  { id: "5", firstName: "Robert", lastName: "Visser", email: "robert@buildright.nl", guestCompany: "BuildRight BV", jobTitle: "Commercial Director", commercialValue: "MEDIUM", relationshipStage: "QUALIFIED_LEAD", eventsAttended: 1, pipeline: 75000, accountManager: "Lisa Bakker" },
];

export default function GuestsPage() {
  return (
    <AppLayout>
      <PageHeader
        title="Guest Intelligence CRM"
        description="Manage relationships, track commercial value, and monitor engagement"
        actions={
          <button className="btn-primary">Add guest</button>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search guests by name, company, or email..."
            className="input"
          />
        </div>
        <select className="input w-44">
          <option value="">All stages</option>
          <option value="PROSPECT">Prospect</option>
          <option value="QUALIFIED_LEAD">Qualified Lead</option>
          <option value="ACTIVE_CLIENT">Active Client</option>
          <option value="STRATEGIC_PARTNER">Strategic Partner</option>
          <option value="CHURNED">Churned</option>
        </select>
        <select className="input w-44">
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
          { label: "Total", value: 127 },
          { label: "Prospects", value: 34 },
          { label: "Active Clients", value: 52 },
          { label: "Strategic Partners", value: 18 },
          { label: "Total Pipeline", value: "€2.4M" },
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
            render: (g) => (
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
            render: (g) => <StatusBadge status={g.commercialValue} />,
          },
          {
            key: "relationshipStage",
            header: "Stage",
            render: (g) => <StatusBadge status={g.relationshipStage} />,
          },
          {
            key: "eventsAttended",
            header: "Events",
            render: (g) => (
              <span className="text-sm text-surface-600">{g.eventsAttended}</span>
            ),
          },
          {
            key: "pipeline",
            header: "Pipeline",
            render: (g) => (
              <span className="text-sm font-medium text-surface-900">
                {g.pipeline > 0 ? `€${(g.pipeline / 1000).toFixed(0)}K` : "—"}
              </span>
            ),
          },
          {
            key: "accountManager",
            header: "Manager",
            render: (g) => (
              <span className="text-sm text-surface-500">{g.accountManager}</span>
            ),
          },
        ]}
        data={guests}
      />
    </AppLayout>
  );
}
