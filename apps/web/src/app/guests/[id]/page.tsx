"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { InsightCard } from "@/components/ui/insight-card";

const guest = {
  firstName: "Peter",
  lastName: "van den Berg",
  email: "peter@acmecorp.nl",
  phone: "+31 6 1234 5678",
  jobTitle: "CEO",
  guestCompany: "ACME Corp",
  commercialValue: "VERY_HIGH",
  relationshipStage: "QUALIFIED_LEAD",
  accountManager: "Lisa Bakker",
  tags: ["enterprise", "decision-maker"],
  notes: "Key decision maker for their digital transformation initiative. Strong interest in our platform capabilities. Prefers direct executive engagement.",
};

const opportunities = [
  { id: "1", title: "ACME Corp Enterprise Platform Deal", value: 450000, stage: "QUALIFICATION", probability: 35, expectedClose: "2027-03-31" },
];

const attendance = [
  { match: "Ajax vs Feyenoord", date: "2026-10-25", status: "ACCEPTED" },
  { match: "Ajax vs PSV", date: "2026-03-15", status: "CHECKED_IN" },
  { match: "Ajax vs AZ", date: "2025-12-07", status: "CHECKED_IN" },
];

export default function GuestDetailPage() {
  return (
    <AppLayout>
      <PageHeader
        title={`${guest.firstName} ${guest.lastName}`}
        description={`${guest.jobTitle} at ${guest.guestCompany}`}
        actions={
          <div className="flex gap-3">
            <button className="btn-secondary">Generate Follow-Up</button>
            <button className="btn-primary">Invite to Match</button>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 space-y-6">
          {/* Profile card */}
          <div className="card-padded">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-600">
                {guest.firstName[0]}{guest.lastName[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold text-surface-900">
                  {guest.firstName} {guest.lastName}
                </h2>
                <p className="text-sm text-surface-500">
                  {guest.jobTitle} at {guest.guestCompany}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={guest.commercialValue} />
                  <StatusBadge status={guest.relationshipStage} />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-surface-200 pt-6">
              <div>
                <p className="text-xs font-medium text-surface-500">Email</p>
                <p className="mt-0.5 text-sm text-surface-900">{guest.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-surface-500">Phone</p>
                <p className="mt-0.5 text-sm text-surface-900">{guest.phone}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-surface-500">Account Manager</p>
                <p className="mt-0.5 text-sm text-surface-900">{guest.accountManager}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-surface-500">Tags</p>
                <div className="mt-0.5 flex gap-1">
                  {guest.tags.map((tag) => (
                    <span key={tag} className="badge-gray">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {guest.notes && (
              <div className="mt-4 border-t border-surface-200 pt-4">
                <p className="text-xs font-medium text-surface-500">Notes</p>
                <p className="mt-1 text-sm leading-relaxed text-surface-600">{guest.notes}</p>
              </div>
            )}
          </div>

          {/* Opportunities */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-surface-900">Opportunities</h3>
            {opportunities.map((opp) => (
              <div key={opp.id} className="card-padded">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-surface-900">{opp.title}</p>
                    <p className="mt-1 text-sm text-surface-500">
                      Expected close: {new Date(opp.expectedClose).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-surface-900">
                      &euro;{(opp.value / 1000).toFixed(0)}K
                    </p>
                    <StatusBadge status={opp.stage} />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-surface-500 mb-1">
                    <span>Probability</span>
                    <span>{opp.probability}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-200">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${opp.probability}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Attendance history */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-surface-900">Attendance History</h3>
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Match</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {attendance.map((a, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 text-sm font-medium text-surface-900">{a.match}</td>
                      <td className="px-4 py-3 text-sm text-surface-500">
                        {new Date(a.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-surface-900">AI Insights</h3>
          <InsightCard
            type="RELATIONSHIP_HEALTH"
            title="Engagement trending up"
            content="Peter has attended 3 consecutive events and his deal moved from Identified to Qualification. Engagement is strong — maintain current cadence of executive-level touchpoints."
            confidence={0.89}
          />
          <InsightCard
            type="FOLLOW_UP_SUGGESTION"
            title="Suggested next step"
            content="Schedule a focused 1-on-1 dinner at the Ajax vs PSV match (Nov 22). The A-Match atmosphere plus a smaller setting is ideal for advancing qualification discussions."
            confidence={0.84}
          />
          <InsightCard
            type="EMAIL_DRAFT"
            title="Draft follow-up ready"
            content="A personalized follow-up email is ready referencing the Ajax vs Feyenoord match and his interest in the platform analytics capabilities discussed during halftime."
            confidence={0.91}
          />

          {/* Relationship health score */}
          <div className="card-padded">
            <h4 className="text-sm font-semibold text-surface-900">Relationship Health</h4>
            <div className="mt-3 flex items-center gap-3">
              <div className="relative h-16 w-16">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e9ecef" strokeWidth="3" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4c6ef5" strokeWidth="3" strokeDasharray="78, 100" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-surface-900">78</span>
              </div>
              <div>
                <p className="text-sm font-medium text-surface-900">Strong</p>
                <p className="text-xs text-surface-500">+5 since last month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
