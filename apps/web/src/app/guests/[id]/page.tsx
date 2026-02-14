"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { InsightCard } from "@/components/ui/insight-card";
import {
  getGuest,
  getInvitations,
  getMatches,
  type Guest,
  type Invitation,
  type Match,
} from "@/lib/store";

export default function GuestDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [guest, setGuest] = useState<Guest | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    setGuest(getGuest(id));
    setInvitations(getInvitations({ guestId: id }));
    setMatches(getMatches());
  }, [id]);

  if (!guest) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-lg font-medium text-surface-900">Guest not found</p>
            <Link href="/guests" className="mt-2 inline-block text-sm text-brand-600 hover:text-brand-700">
              Back to guests
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const matchForInvitation = (matchId: string) => matches.find((m) => m.id === matchId);

  return (
    <AppLayout>
      <PageHeader
        title={`${guest.firstName} ${guest.lastName}`}
        description={`${guest.jobTitle} at ${guest.guestCompany}`}
        actions={
          <div className="flex gap-3">
            <Link href="/invitations" className="btn-secondary">Invite to Match</Link>
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
                <p className="mt-0.5 text-sm text-surface-900">{guest.email || "\u2014"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-surface-500">Phone</p>
                <p className="mt-0.5 text-sm text-surface-900">{guest.phone || "\u2014"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-surface-500">Account Manager</p>
                <p className="mt-0.5 text-sm text-surface-900">{guest.accountManager || "\u2014"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-surface-500">Pipeline</p>
                <p className="mt-0.5 text-sm font-medium text-surface-900">
                  {guest.pipeline > 0 ? `\u20AC${(guest.pipeline / 1000).toFixed(0)}K` : "\u2014"}
                </p>
              </div>
              {guest.tags.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs font-medium text-surface-500">Tags</p>
                  <div className="mt-0.5 flex gap-1">
                    {guest.tags.map((tag) => (
                      <span key={tag} className="badge-gray">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {guest.notes && (
              <div className="mt-4 border-t border-surface-200 pt-4">
                <p className="text-xs font-medium text-surface-500">Notes</p>
                <p className="mt-1 text-sm leading-relaxed text-surface-600">{guest.notes}</p>
              </div>
            )}
          </div>

          {/* Attendance history */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-surface-900">Invitation History</h3>
            {invitations.length === 0 ? (
              <div className="card flex items-center justify-center py-8">
                <p className="text-sm text-surface-500">No invitations for this guest yet</p>
              </div>
            ) : (
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
                    {invitations.map((inv) => {
                      const m = matchForInvitation(inv.matchId);
                      return (
                        <tr key={inv.id}>
                          <td className="px-4 py-3">
                            <Link
                              href={`/matches/${inv.matchId}`}
                              className="text-sm font-medium text-surface-900 hover:text-brand-600"
                            >
                              {m ? `${m.homeTeam} vs ${m.awayTeam}` : "Unknown match"}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-sm text-surface-500">
                            {m ? new Date(m.matchDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "\u2014"}
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-surface-900">AI Insights</h3>
          <InsightCard
            type="RELATIONSHIP_HEALTH"
            title="Engagement summary"
            content={`${guest.firstName} has been invited to ${invitations.length} event${invitations.length !== 1 ? "s" : ""}. ${invitations.filter((i) => i.status === "ACCEPTED" || i.status === "CHECKED_IN").length} accepted. ${guest.relationshipStage === "PROSPECT" ? "Consider inviting to a high-priority match to deepen the relationship." : "Maintain the current engagement cadence."}`}
            confidence={0.89}
          />
          {guest.pipeline > 0 && (
            <InsightCard
              type="ROI_INSIGHT"
              title="Pipeline opportunity"
              content={`\u20AC${(guest.pipeline / 1000).toFixed(0)}K in active pipeline. Hospitality events can accelerate deal progression \u2014 prioritize this contact for upcoming A-Matches.`}
              confidence={0.84}
            />
          )}

          {/* Quick stats */}
          <div className="card-padded">
            <h4 className="text-sm font-semibold text-surface-900">Quick Stats</h4>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-500">Events attended</span>
                <span className="text-sm font-medium text-surface-900">{guest.eventsAttended}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-500">Invitations</span>
                <span className="text-sm font-medium text-surface-900">{invitations.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-500">Accepted</span>
                <span className="text-sm font-medium text-surface-900">
                  {invitations.filter((i) => i.status === "ACCEPTED" || i.status === "CHECKED_IN").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-500">Response rate</span>
                <span className="text-sm font-medium text-surface-900">
                  {invitations.length > 0
                    ? `${Math.round((invitations.filter((i) => i.status !== "DRAFT" && i.status !== "SENT").length / invitations.length) * 100)}%`
                    : "\u2014"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
