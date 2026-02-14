"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { InsightCard } from "@/components/ui/insight-card";
import { Modal } from "@/components/ui/modal";
import {
  getMatch,
  getInvitations,
  getGuests,
  createInvitation,
  updateInvitationStatus,
  updateMatch,
  type Match,
  type Invitation,
  type Guest,
} from "@/lib/store";

const objectiveLabels: Record<string, string> = {
  NEW_BUSINESS: "New Business",
  RETENTION: "Retention",
  NETWORKING: "Networking",
  EMPLOYEE_ENGAGEMENT: "Employee Engagement",
  PARTNERSHIP: "Partnership",
  BRAND: "Brand",
};

export default function MatchDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [match, setMatch] = useState<Match | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState("");

  const reload = () => {
    setMatch(getMatch(id));
    setInvitations(getInvitations({ matchId: id }));
    setGuests(getGuests());
  };

  useEffect(() => {
    reload();
  }, [id]);

  if (!match) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-lg font-medium text-surface-900">Match not found</p>
            <Link href="/matches" className="mt-2 inline-block text-sm text-brand-600 hover:text-brand-700">
              Back to matches
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const guestForInvitation = (guestId: string) => guests.find((g) => g.id === guestId);

  const invitedGuestIds = new Set(invitations.map((i) => i.guestId));
  const availableGuests = guests.filter((g) => !invitedGuestIds.has(g.id));

  const accepted = invitations.filter((i) => i.status === "ACCEPTED" || i.status === "CHECKED_IN").length;
  const pending = invitations.filter((i) => i.status === "SENT").length;

  const handleInvite = () => {
    if (!selectedGuestId) return;
    createInvitation({ matchId: id, guestId: selectedGuestId });
    setSelectedGuestId("");
    setShowInvite(false);
    reload();
  };

  const handleStatusChange = (invId: string, status: string) => {
    updateInvitationStatus(invId, status);
    reload();
  };

  const handleOpenInvitations = () => {
    updateMatch(id, { status: "INVITATIONS_OPEN" });
    reload();
  };

  return (
    <AppLayout>
      <PageHeader
        title={`${match.homeTeam} vs ${match.awayTeam}`}
        description={new Date(match.matchDate).toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
        actions={
          <div className="flex gap-3">
            {match.status === "SCHEDULED" && (
              <button className="btn-secondary" onClick={handleOpenInvitations}>
                Open Invitations
              </button>
            )}
            <button className="btn-primary" onClick={() => setShowInvite(true)}>
              Invite Guests
            </button>
          </div>
        }
      />

      {/* Match info badges */}
      <div className="mb-6 flex items-center gap-3">
        <StatusBadge status={match.priority} />
        <StatusBadge status={match.status} />
        <span className="badge-blue">Objective: {objectiveLabels[match.objective] || match.objective}</span>
      </div>

      {/* KPIs */}
      <div className="mb-8 grid grid-cols-4 gap-4">
        <KpiCard label="Invited" value={invitations.length} />
        <KpiCard label="Accepted" value={accepted} />
        <KpiCard label="Pending" value={pending} />
        <KpiCard label="Available Seats" value={match.maxGuests - invitations.length} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Guest list */}
        <div className="col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-surface-900">Guest List</h2>
          {invitations.length === 0 ? (
            <div className="card flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-sm text-surface-500">No guests invited yet</p>
                <button
                  onClick={() => setShowInvite(true)}
                  className="mt-2 text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Invite your first guest
                </button>
              </div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Guest</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">RSVP</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {invitations.map((inv) => {
                    const guest = guestForInvitation(inv.guestId);
                    return (
                      <tr key={inv.id} className="hover:bg-surface-50">
                        <td className="px-4 py-3">
                          <Link href={`/guests/${inv.guestId}`} className="hover:text-brand-600">
                            <p className="text-sm font-medium text-surface-900">
                              {guest ? `${guest.firstName} ${guest.lastName}` : "Unknown"}
                            </p>
                            <p className="text-xs text-surface-500">{guest?.jobTitle || ""}</p>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-surface-600">{guest?.guestCompany || ""}</td>
                        <td className="px-4 py-3">{guest && <StatusBadge status={guest.commercialValue} />}</td>
                        <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                        <td className="px-4 py-3">
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-surface-900">AI Recommendations</h2>
          <InsightCard
            type="GUEST_PRIORITIZATION"
            title="Seating suggestion"
            content={`Consider inviting high-value prospects to this ${objectiveLabels[match.objective] || match.objective} match. ${availableGuests.filter((g) => g.commercialValue === "VERY_HIGH" || g.commercialValue === "HIGH").length} high-value guests are still available.`}
            confidence={0.92}
          />
          <InsightCard
            type="UTILIZATION_ALERT"
            title="Capacity status"
            content={`${invitations.length} of ${match.maxGuests} seats allocated (${Math.round((invitations.length / match.maxGuests) * 100)}% utilized). ${match.maxGuests - invitations.length} seats remaining.`}
            confidence={0.95}
          />

          <h2 className="mt-6 text-lg font-semibold text-surface-900">Seat Allocation</h2>
          <div className="card-padded">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-600">Total Capacity</span>
                <span className="text-sm font-medium text-surface-900">{invitations.length}/{match.maxGuests} filled</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-200">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${(invitations.length / match.maxGuests) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite guest modal */}
      <Modal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        title="Invite Guest"
        actions={
          <>
            <button className="btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleInvite}>Send invitation</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Select guest</label>
            <select
              className="input"
              value={selectedGuestId}
              onChange={(e) => setSelectedGuestId(e.target.value)}
            >
              <option value="">Choose a guest...</option>
              {availableGuests.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.firstName} {g.lastName} — {g.guestCompany} ({g.commercialValue.replace("_", " ")})
                </option>
              ))}
            </select>
          </div>
          {availableGuests.length === 0 && (
            <p className="text-sm text-surface-500">
              All guests have already been invited to this match.{" "}
              <Link href="/guests" className="text-brand-600 hover:text-brand-700">Add more guests</Link> first.
            </p>
          )}
        </div>
      </Modal>
    </AppLayout>
  );
}
