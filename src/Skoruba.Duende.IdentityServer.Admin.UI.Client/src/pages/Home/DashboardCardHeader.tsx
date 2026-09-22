import { CardDescription, CardHeader, CardTitle } from "@/components/Card/Card";
import { cn } from "@/lib/utils";

const TONES = {
  neutral: "bg-slate-500/10 ring-slate-500/20 text-slate-600 dark:text-slate-400",
  indigo:
    "bg-indigo-500/10 ring-indigo-500/20 text-indigo-600 dark:text-indigo-400",
  info: "bg-blue-500/10 ring-blue-500/20 text-blue-600 dark:text-blue-400",
  success:
    "bg-emerald-500/10 ring-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 ring-amber-500/20 text-amber-600 dark:text-amber-400",
  danger: "bg-red-500/10 ring-red-500/20 text-red-600 dark:text-red-400",
} as const;

export type DashboardCardTone = keyof typeof TONES;

type DashboardCardHeaderProps = {
  icon: React.ComponentType<{ className?: string }>;
  tone?: DashboardCardTone;
  title: string;
  description?: React.ReactNode;
  /** Tooltip for the (possibly truncated) description. */
  descriptionTitle?: string;
  descriptionClassName?: string;
  metric?: React.ReactNode;
  metricLabel?: string;
  action?: React.ReactNode;
};

const DashboardCardHeader = ({
  icon: Icon,
  tone = "neutral",
  title,
  description,
  descriptionTitle,
  descriptionClassName,
  metric,
  metricLabel,
  action,
}: DashboardCardHeaderProps) => (
  <CardHeader className="flex-row items-center justify-between gap-4 space-y-0 p-5 pb-3">
    <div className="flex min-w-0 items-center gap-3">
      <div
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1",
          TONES[tone],
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="min-w-0">
        <CardTitle className="text-base font-semibold leading-tight tracking-normal">
          {title}
        </CardTitle>
        {description && (
          <CardDescription
            className={cn("mt-0.5 truncate text-xs", descriptionClassName)}
            title={
              descriptionTitle ??
              (typeof description === "string" ? description : undefined)
            }
          >
            {description}
          </CardDescription>
        )}
      </div>
    </div>

    {metric !== undefined && metric !== null ? (
      <div className="shrink-0 text-right">
        <div className="text-2xl font-semibold leading-none tabular-nums">
          {metric}
        </div>
        {metricLabel && (
          <div className="mt-1 text-xs text-muted-foreground">{metricLabel}</div>
        )}
      </div>
    ) : (
      action && <div className="shrink-0">{action}</div>
    )}
  </CardHeader>
);

export default DashboardCardHeader;
