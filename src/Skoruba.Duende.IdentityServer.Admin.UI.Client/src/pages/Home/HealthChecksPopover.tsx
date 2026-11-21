import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { cn } from "@/lib/utils";
import {
  groupHealthChecks,
  type HealthCheckPart,
  type HealthComponent,
} from "@/lib/health/healthChecks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const { Healthy, Degraded, Unhealthy, Unknown } = client.SystemHealthStatus;

// The colours of the headline: green healthy, amber degraded, red an outage.
const CHECK_STYLES: Record<
  client.SystemHealthStatus,
  { dot: string; text: string }
> = {
  [Healthy]: { dot: "bg-emerald-500", text: "text-muted-foreground" },
  [Degraded]: {
    dot: "bg-amber-500",
    text: "font-medium text-amber-700 dark:text-amber-400",
  },
  [Unhealthy]: {
    dot: "bg-red-500",
    text: "font-medium text-red-700 dark:text-red-400",
  },
  [Unknown]: { dot: "bg-slate-400", text: "text-muted-foreground" },
};

// A database has two checks; the row says which of them does not pass, next to the
// name it has in the /health report and in the logs.
const notPassingChecks = (
  component: HealthComponent,
  partLabel: (part: HealthCheckPart) => string,
) =>
  component.checks
    .filter((check) => check.part && check.status !== Healthy)
    .map((check) => `${partLabel(check.part!)} (${check.name})`)
    .join(", ");

type HealthChecksPopoverProps = {
  entries: readonly client.SystemHealthEntryApiDto[];
  checkedAt: Date;
  /** The status headline, which opens the list. */
  children: ReactNode;
};

const HealthChecksPopover = ({
  entries,
  checkedAt,
  children,
}: HealthChecksPopoverProps) => {
  const { t } = useTranslation();
  const components = groupHealthChecks(entries);
  const passing = entries.filter((entry) => entry.status === Healthy).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="group -mx-1.5 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md px-1.5 py-0.5 text-left transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:bg-muted"
        >
          {children}
          <ChevronDown
            aria-hidden
            className="h-3.5 w-3.5 text-muted-foreground/70 transition-transform group-data-[state=open]:rotate-180"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[22rem] max-w-[calc(100vw-2rem)] p-0"
      >
        <div className="flex items-baseline justify-between gap-3 border-b px-4 py-3">
          <h2 className="text-sm font-semibold">
            {t("Home.Status.ChecksTitle")}
          </h2>
          <span className="text-xs tabular-nums text-muted-foreground">
            {t("Home.Status.ChecksPassing", {
              passing,
              total: entries.length,
            })}
          </span>
        </div>
        <ul className="max-h-[min(28rem,60vh)] overflow-y-auto py-1.5">
          {components.map((component) => {
            const style = CHECK_STYLES[component.status];
            const notPassing = notPassingChecks(component, (part) =>
              t(`Home.Status.Parts.${part}`),
            );

            return (
              <li
                key={`${component.key ?? "custom"}-${component.name}`}
                className="flex items-start justify-between gap-3 px-4 py-2"
                title={component.checks.map((check) => check.name).join(", ")}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span
                      aria-hidden
                      className={cn("h-2 w-2 shrink-0 rounded-full", style.dot)}
                    />
                    <span className="truncate">
                      {component.key
                        ? t(`Home.Status.Components.${component.key}.Name`)
                        : component.name}
                    </span>
                  </div>
                  {component.key && (
                    <p className="pl-4 text-xs text-muted-foreground">
                      {t(`Home.Status.Components.${component.key}.Description`)}
                    </p>
                  )}
                  {notPassing && (
                    <p className={cn("pl-4 text-xs", style.text)}>
                      {t("Home.Status.NotPassing", { checks: notPassing })}
                    </p>
                  )}
                </div>
                <span className={cn("shrink-0 pt-0.5 text-xs", style.text)}>
                  {t(`Home.Status.Check.${component.status}`)}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="border-t px-4 py-2.5 text-xs text-muted-foreground">
          {t("Home.Status.LastChecked", {
            time: checkedAt.toLocaleTimeString(),
          })}
        </p>
      </PopoverContent>
    </Popover>
  );
};

export default HealthChecksPopover;
