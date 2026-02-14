// ─────────────────────────────────────────────────────────
// Shared constants and types used across frontend and backend
// ─────────────────────────────────────────────────────────

export const APP_NAME = "HostIQ";
export const APP_TAGLINE = "The Operating System for Corporate Sports Hospitality";

// ── Route constants ─────────────────────────────────────
export const ROUTES = {
  DASHBOARD: "/dashboard",
  MATCHES: "/matches",
  GUESTS: "/guests",
  INVITATIONS: "/invitations",
  SEASONS: "/seasons",
  ROI: "/roi",
  AI_INSIGHTS: "/insights",
  SETTINGS: "/settings",
  HOST_APP: "/host",
} as const;

// ── Display mappings ────────────────────────────────────
export const MATCH_PRIORITY_LABELS: Record<string, string> = {
  A_MATCH: "A-Match",
  HIGH: "High Priority",
  NORMAL: "Normal",
  LOW: "Low Priority",
};

export const MATCH_PRIORITY_COLORS: Record<string, string> = {
  A_MATCH: "red",
  HIGH: "orange",
  NORMAL: "blue",
  LOW: "gray",
};

export const MATCH_OBJECTIVE_LABELS: Record<string, string> = {
  NEW_BUSINESS: "New Business",
  RETENTION: "Client Retention",
  NETWORKING: "Networking",
  EMPLOYEE_ENGAGEMENT: "Employee Engagement",
  PARTNERSHIP: "Partnership",
  BRAND: "Brand Building",
};

export const COMMERCIAL_VALUE_LABELS: Record<string, string> = {
  VERY_HIGH: "Very High",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const RELATIONSHIP_STAGE_LABELS: Record<string, string> = {
  PROSPECT: "Prospect",
  QUALIFIED_LEAD: "Qualified Lead",
  ACTIVE_CLIENT: "Active Client",
  STRATEGIC_PARTNER: "Strategic Partner",
  CHURNED: "Churned",
  INTERNAL: "Internal",
};

export const INVITATION_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  OPENED: "Opened",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  WAITLISTED: "Waitlisted",
  CHECKED_IN: "Checked In",
  NO_SHOW: "No Show",
  CANCELLED: "Cancelled",
};

export const PLAN_LABELS: Record<string, { name: string; price: string; features: string[] }> = {
  STARTER: {
    name: "Starter",
    price: "€299/mo",
    features: [
      "Up to 5 users",
      "1 venue",
      "Guest CRM (100 guests)",
      "Basic match management",
      "Email invitations",
      "Basic reporting",
    ],
  },
  PROFESSIONAL: {
    name: "Professional",
    price: "€799/mo",
    features: [
      "Up to 15 users",
      "3 venues",
      "Unlimited guests",
      "Full match planning",
      "AI follow-up emails",
      "ROI dashboard",
      "Host companion app",
      "Priority support",
    ],
  },
  ENTERPRISE: {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Unlimited users",
      "Unlimited venues",
      "Full AI suite",
      "Advanced analytics",
      "CRM integration (HubSpot/Salesforce)",
      "SSO / SAML",
      "Dedicated success manager",
      "Custom prompt templates",
      "Marketplace access",
      "API access",
    ],
  },
};
