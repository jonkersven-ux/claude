import { clsx } from "clsx";

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
}

export function KpiCard({ label, value, change, changeType = "neutral", icon }: KpiCardProps) {
  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between">
        <span className="kpi-label">{label}</span>
        {icon && <span className="text-surface-400">{icon}</span>}
      </div>
      <span className="kpi-value">{value}</span>
      {change && (
        <span
          className={clsx(
            "kpi-change",
            changeType === "positive" && "text-emerald-600",
            changeType === "negative" && "text-red-600",
            changeType === "neutral" && "text-surface-500",
          )}
        >
          {change}
        </span>
      )}
    </div>
  );
}
