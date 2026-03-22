import clsx from "clsx";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; up: boolean } | null;
  color?: "blue" | "emerald" | "violet" | "amber" | "rose";
  sub?: string;
}

const colors = {
  blue:    { bg: "bg-blue-50 dark:bg-blue-900/20",   icon: "bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-400" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: "bg-emerald-100 dark:bg-emerald-800/40 text-emerald-600 dark:text-emerald-400" },
  violet:  { bg: "bg-violet-50 dark:bg-violet-900/20",  icon: "bg-violet-100 dark:bg-violet-800/40 text-violet-600 dark:text-violet-400" },
  amber:   { bg: "bg-amber-50 dark:bg-amber-900/20",    icon: "bg-amber-100 dark:bg-amber-800/40 text-amber-600 dark:text-amber-400" },
  rose:    { bg: "bg-rose-50 dark:bg-rose-900/20",      icon: "bg-rose-100 dark:bg-rose-800/40 text-rose-600 dark:text-rose-400" },
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  color = "blue",
  sub,
}: StatCardProps) {
  const c = colors[color];
  return (
    <div className={clsx("rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/60", c.bg.replace("bg-", "ring-0 "))}>
      <div className="flex items-start justify-between mb-4">
        <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", c.icon)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span
            className={clsx(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              trend.up
                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            )}
          >
            {trend.up ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-0.5">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
        {label}
      </div>
      {sub && (
        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</div>
      )}
    </div>
  );
}
