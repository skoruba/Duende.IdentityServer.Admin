import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { formatCompactAge } from "@/lib/dates/compactAge";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { useSystemHealth } from "@/services/InfoServices";
import { useConfigurationIssuesSummary } from "@/services/DashboardService";
import { ConfigurationIssuesUrl } from "@/routing/Urls";
import EnvironmentBadge from "./EnvironmentBadge";

const TICK_MS = 15_000;
// Two missed refreshes (the health query refetches every minute).
const STALE_AFTER_MS = 150_000;

// Green is reserved for "healthy", amber for degraded, red for a real outage.
const { Healthy, Degraded, Unhealthy, Unknown } = client.SystemHealthStatus;

// "Unknown" (host without health checks) has no style: it renders as unavailable.
type KnownHealthStatus = Exclude<
  client.SystemHealthStatus,
  client.SystemHealthStatus.Unknown
>;

const STATUS_STYLES: Record<KnownHealthStatus, { dot: string; text: string }> = {
  [Healthy]: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  [Degraded]: { dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
  [Unhealthy]: { dot: "bg-red-500", text: "text-red-700 dark:text-red-400" },
};

// Unknown ranks lowest: it never hides a status that was actually reported.
const STATUS_SEVERITY: Record<client.SystemHealthStatus, number> = {
  [Unknown]: 0,
  [Healthy]: 1,
  [Degraded]: 2,
  [Unhealthy]: 3,
};

const useNow = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(interval);
  }, []);

  return now;
};

const Separator = () => (
  <span aria-hidden className="text-muted-foreground/40">
    ·
  </span>
);

const SystemStatus = ({ version }: { version?: string }) => {
  const { t } = useTranslation();
  const { data, dataUpdatedAt, isLoading } = useSystemHealth();
  const issues = useConfigurationIssuesSummary();
  const now = useNow();

  // Runtime health and configuration quality are separate facts: the service
  // can be fully operational while its configuration still needs care.
  const issuesTotal = issues.data
    ? issues.data.errors + issues.data.warnings + issues.data.recommendations
    : 0;
  // The one actionable item in the row: a badge. Everything else is metadata.
  const issuesTone = !issues.data
    ? undefined
    : issues.data.errors > 0
      ? "border-red-500/30 bg-red-500/10 text-red-700 hover:bg-red-500/15 dark:text-red-400"
      : issues.data.warnings > 0
        ? "border-amber-500/30 bg-amber-500/10 text-amber-700 hover:bg-amber-500/15 dark:text-amber-400"
        : "border-border bg-muted text-muted-foreground hover:bg-muted/70";

  const entries = data?.entries ?? [];
  const failingChecks = entries
    .filter((entry) => entry.status !== Healthy)
    .map((entry) => entry.name ?? "");

  // IdentityServer reachability is the headline, unless another failing check
  // (databases) makes the overall status worse - the headline shows the worse one.
  const identityServerDown =
    !!data &&
    data.identityServerStatus !== Healthy &&
    data.identityServerStatus !== Unknown;
  const identityServerLeads =
    identityServerDown &&
    STATUS_SEVERITY[data.identityServerStatus] >= STATUS_SEVERITY[data.status];

  const reported = identityServerLeads
    ? data.identityServerStatus
    : data?.status;
  const status: KnownHealthStatus | undefined =
    reported && reported !== Unknown ? reported : undefined;

  // "Healthy · 13/13 checks passing" / "Unhealthy · IdentityServer unreachable"
  const detail = !status
    ? undefined
    : status === Healthy
      ? t("Home.Status.ChecksPassing", {
          passing: entries.length,
          total: entries.length,
        })
      : identityServerLeads
        ? t("Home.Status.IdentityServerUnreachable")
        : t("Home.Status.ChecksFailing", {
            count: failingChecks.length,
            total: entries.length,
          });

  // The status refreshes itself every minute, so "checked just now" is noise.
  // The age only matters once it stops refreshing (offline, failing requests).
  const checkedAt = new Date(dataUpdatedAt);
  const isStale = now.getTime() - checkedAt.getTime() > STALE_AFTER_MS;
  const tooltip = [
    t("Home.Status.LastChecked", { time: checkedAt.toLocaleTimeString() }),
    failingChecks.length > 0 ? failingChecks.join(", ") : undefined,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mt-2 flex min-h-6 flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-muted-foreground/80">
      <EnvironmentBadge className="mr-1" />
      {isLoading ? (
        <span className="h-4 w-44 animate-pulse rounded bg-muted" />
      ) : !status || !data ? (
        // Not knowing is a state of its own - never show nothing, and never green.
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-2 w-2 rounded-full bg-slate-400" />
          {t("Home.Status.Unknown")}
        </span>
      ) : (
        status &&
        data && (
          <>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 font-medium",
                STATUS_STYLES[status].text,
              )}
              title={tooltip}
            >
              <span className="relative flex h-2 w-2">
                {status === Healthy && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/60 motion-safe:animate-ping" />
                )}
                <span
                  className={cn(
                    "relative inline-flex h-2 w-2 rounded-full",
                    STATUS_STYLES[status].dot,
                  )}
                />
              </span>
              {t(`Home.Status.${status}`)}
            </span>
            <Separator />
            <span>{detail}</span>
            {isStale && (
              <>
                <Separator />
                <span className="text-amber-700 dark:text-amber-400">
                  {t("Home.Status.Checked", {
                    age: formatCompactAge(checkedAt, now),
                  })}
                </span>
              </>
            )}
          </>
        )
      )}
      {version && (
        <>
          <Separator />
          <span className="tabular-nums">v{version}</span>
        </>
      )}
      {issuesTotal > 0 && issuesTone && (
        <Link
          to={ConfigurationIssuesUrl}
          className={cn(
            "ml-1 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            issuesTone,
          )}
        >
          {t("Home.Status.ConfigurationIssues", { count: issuesTotal })}
          <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
};

export default SystemStatus;
