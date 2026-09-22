import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDistanceToNowStrict } from "date-fns";
import {
  Activity,
  ArrowRight,
  History,
  KeyRound,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/Card/Card";
import { Button } from "@/components/ui/button";
import { AuditLogsUrl } from "@/routing/Urls";
import { useRecentAuditChanges } from "@/services/DashboardService";
import { cn } from "@/lib/utils";
import { humanizeEventName } from "@/lib/auditLogs/eventName";
import { formatCompactAge } from "@/lib/dates/compactAge";
import { getAuditLogTarget } from "@/lib/auditLogs/describeAuditLog";
import { AuditLogData } from "@/models/AuditLogs/AuditLogsModels";
import ActivityDetailDialog from "./ActivityDetailDialog";
import { getTargetLabelKey } from "./auditTarget";
import DashboardCardHeader from "./DashboardCardHeader";
import HomeQueryErrorState from "./HomeQueryErrorState";

const VISIBLE_EVENTS_COUNT = 8;

// Colour signals meaning, not decoration. Amber is reserved for credential
// changes (secrets, passwords, keys) an admin should double check; permission
// changes are labelled but stay calm; everything else is routine blue, and
// removals are neutral. The icon carries the verb.
const CREDENTIAL_PATTERN = /(Secret|Password|Key|TwoFactor|Lockout)/;
const PERMISSION_PATTERN = /(Role|Claim|Grant)/;

const TONES = {
  routine: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  credential: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  removal: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
} as const;

type EventKind = "credential" | "permission" | "routine";

const getEventVisual = (event = "") => {
  const kind: EventKind = CREDENTIAL_PATTERN.test(event)
    ? "credential"
    : PERMISSION_PATTERN.test(event)
      ? "permission"
      : "routine";
  const removal = /(Deleted|Removed)/.test(event);

  const icon = removal
    ? Trash2
    : kind === "credential"
      ? KeyRound
      : kind === "permission"
        ? ShieldCheck
        : /(Added|Created|Cloned)/.test(event)
          ? Plus
          : /(Updated|Changed|Saved)/.test(event)
            ? Pencil
            : Activity;

  return {
    icon,
    kind,
    className:
      kind === "credential"
        ? TONES.credential
        : removal
          ? TONES.removal
          : TONES.routine,
  };
};

const RecentActivity = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<AuditLogData | null>(null);
  const [openedFrom, setOpenedFrom] = useState<HTMLElement | null>(null);
  const { data, isLoading, isError, error } =
    useRecentAuditChanges(VISIBLE_EVENTS_COUNT);

  const title = t("Home.RecentActivity.Title");
  const description = t("Home.RecentActivity.Description");

  if (isError) {
    return (
      <HomeQueryErrorState
        error={error}
        cardTitle={title}
        cardDescription={description}
        className={className}
      />
    );
  }

  const items = data ?? [];

  return (
    <Card className={cn("min-w-0", className)}>
      <DashboardCardHeader
        icon={History}
        title={title}
        description={description}
        action={
          <Button variant="ghost" size="sm" asChild className="-mr-2">
            <Link to={AuditLogsUrl}>
              {t("Home.RecentActivity.ViewAll")}
              <ArrowRight className="ms-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        }
      />
      <CardContent className="px-5 pb-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-muted/60" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-5 text-sm text-muted-foreground">
            {t("Home.RecentActivity.Empty")}
          </p>
        ) : (
          <ul className="-mx-2">
            {items.map((log) => {
              const visual = getEventVisual(log.event);
              const Icon = visual.icon;
              const created = new Date(log.created);
              const targetInfo = getAuditLogTarget(log.data);
              // "My SPA", or "client #14" when the event recorded only an id
              const target =
                targetInfo?.type === "name"
                  ? targetInfo.name
                  : targetInfo
                    ? t(getTargetLabelKey(targetInfo), { id: targetInfo.id })
                    : undefined;

              return (
                <li key={log.id} className="border-b last:border-b-0">
                  <button
                    type="button"
                    onClick={(event) => {
                      setOpenedFrom(event.currentTarget);
                      setSelected(log);
                    }}
                    aria-haspopup="dialog"
                    className="group grid w-full text-left grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-primary/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring md:grid-cols-[auto_minmax(0,1fr)_minmax(0,7rem)_7.5rem_1rem] xl:grid-cols-[auto_minmax(0,1fr)_minmax(0,14rem)_7.5rem_1rem]"
                  >
                    <span
                      className={cn(
                        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        visual.className,
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>

                    <span className="min-w-0">
                      <span className="flex min-w-0 items-baseline gap-2">
                        <span className="min-w-0 truncate text-sm font-medium md:shrink-0">
                          {humanizeEventName(log.event)}
                        </span>
                        {target && (
                          <span className="hidden truncate text-sm text-muted-foreground md:inline">
                            {target}
                          </span>
                        )}
                        {visual.kind === "credential" && (
                          <Badge
                            variant="outline"
                            className="hidden shrink-0 self-center border-amber-500/40 px-1.5 py-0 text-[10px] font-medium text-amber-700 dark:text-amber-400 sm:inline-flex"
                          >
                            {t("Home.RecentActivity.Sensitive")}
                          </Badge>
                        )}
                        {visual.kind === "permission" && (
                          <Badge
                            variant="outline"
                            className="hidden shrink-0 self-center px-1.5 py-0 text-[10px] font-medium text-muted-foreground sm:inline-flex"
                          >
                            {t("Home.RecentActivity.PermissionChange")}
                          </Badge>
                        )}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground md:hidden">
                        {[log.subjectName, target].filter(Boolean).join(" · ")}
                      </span>
                    </span>

                    <span className="hidden truncate text-sm text-muted-foreground md:block">
                      {log.subjectName}
                    </span>

                    <time
                      dateTime={created.toISOString()}
                      title={created.toLocaleString()}
                      className="shrink-0 text-right text-xs tabular-nums text-muted-foreground"
                    >
                      {/* "13 hours ago" costs the event name its room on a phone */}
                      <span className="md:hidden">
                        {t("Home.Sections.Ago", {
                          age: formatCompactAge(created),
                        })}
                      </span>
                      <span className="hidden md:inline">
                        {formatDistanceToNowStrict(created, { addSuffix: true })}
                      </span>
                    </time>

                    <ChevronRight className="hidden h-4 w-4 -translate-x-1 text-primary opacity-0 transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 md:block" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
      <ActivityDetailDialog
        log={selected}
        onClose={() => setSelected(null)}
        returnFocusTo={openedFrom}
      />
    </Card>
  );
};

export default RecentActivity;
