import { clsx } from "clsx";

const typeIcons: Record<string, string> = {
  GUEST_PRIORITIZATION: "star",
  MATCH_RECOMMENDATION: "calendar",
  FOLLOW_UP_SUGGESTION: "arrow-right",
  ROI_INSIGHT: "trending-up",
  RELATIONSHIP_HEALTH: "heart",
  UTILIZATION_ALERT: "alert-triangle",
  EMAIL_DRAFT: "mail",
  CONVERSATION_SUMMARY: "file-text",
};

const typeColors: Record<string, string> = {
  GUEST_PRIORITIZATION: "border-l-purple-500",
  MATCH_RECOMMENDATION: "border-l-blue-500",
  FOLLOW_UP_SUGGESTION: "border-l-emerald-500",
  ROI_INSIGHT: "border-l-amber-500",
  RELATIONSHIP_HEALTH: "border-l-red-500",
  UTILIZATION_ALERT: "border-l-orange-500",
  EMAIL_DRAFT: "border-l-blue-500",
  CONVERSATION_SUMMARY: "border-l-surface-500",
};

interface InsightCardProps {
  type: string;
  title: string;
  content: string;
  confidence?: number;
  onDismiss?: () => void;
}

export function InsightCard({
  type,
  title,
  content,
  confidence,
  onDismiss,
}: InsightCardProps) {
  return (
    <div
      className={clsx(
        "card-padded border-l-4",
        typeColors[type] || "border-l-surface-300",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-surface-900">{title}</h4>
            {confidence !== undefined && (
              <span className="badge-blue">
                {Math.round(confidence * 100)}% confidence
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-surface-600">{content}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-surface-400 hover:text-surface-600 transition-colors"
            aria-label="Dismiss insight"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
