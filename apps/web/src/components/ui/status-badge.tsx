import { clsx } from "clsx";

const statusColors: Record<string, string> = {
  // Invitation statuses
  DRAFT: "bg-surface-100 text-surface-600",
  SENT: "bg-blue-50 text-blue-700",
  OPENED: "bg-blue-50 text-blue-700",
  ACCEPTED: "bg-emerald-50 text-emerald-700",
  DECLINED: "bg-red-50 text-red-700",
  WAITLISTED: "bg-orange-50 text-orange-700",
  CHECKED_IN: "bg-emerald-50 text-emerald-700",
  NO_SHOW: "bg-red-50 text-red-700",
  CANCELLED: "bg-surface-100 text-surface-500",

  // Match statuses
  SCHEDULED: "bg-surface-100 text-surface-600",
  INVITATIONS_OPEN: "bg-blue-50 text-blue-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  MATCHDAY: "bg-purple-50 text-purple-700",
  COMPLETED: "bg-surface-100 text-surface-600",

  // Match priorities
  A_MATCH: "bg-red-50 text-red-700",
  HIGH: "bg-orange-50 text-orange-700",
  NORMAL: "bg-blue-50 text-blue-700",
  LOW: "bg-surface-100 text-surface-500",

  // Commercial values
  VERY_HIGH: "bg-purple-50 text-purple-700",
  MEDIUM: "bg-blue-50 text-blue-700",

  // Relationship stages
  PROSPECT: "bg-surface-100 text-surface-600",
  QUALIFIED_LEAD: "bg-blue-50 text-blue-700",
  ACTIVE_CLIENT: "bg-emerald-50 text-emerald-700",
  STRATEGIC_PARTNER: "bg-purple-50 text-purple-700",
  CHURNED: "bg-red-50 text-red-700",
  INTERNAL: "bg-surface-100 text-surface-500",
};

const labelOverrides: Record<string, string> = {
  A_MATCH: "A-Match",
  VERY_HIGH: "Very High",
  QUALIFIED_LEAD: "Qualified Lead",
  ACTIVE_CLIENT: "Active Client",
  STRATEGIC_PARTNER: "Strategic Partner",
  CHECKED_IN: "Checked In",
  NO_SHOW: "No Show",
  INVITATIONS_OPEN: "Invitations Open",
  NEW_BUSINESS: "New Business",
  EMPLOYEE_ENGAGEMENT: "Employee Engagement",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const color = statusColors[status] || "bg-surface-100 text-surface-600";
  const label =
    labelOverrides[status] ||
    status.charAt(0) + status.slice(1).toLowerCase().replaceAll("_", " ");

  return (
    <span className={clsx("badge", color, className)}>
      {label}
    </span>
  );
}
