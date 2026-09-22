import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pie, PieChart, Label } from "recharts";
import {
  Bug,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle,
  ChevronRight,
  Zap,
  Settings,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardFooter } from "@/components/Card/Card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { ConfigurationIssuesUrl, ConfigurationRulesUrl } from "@/routing/Urls";
import {
  useConfigurationIssues,
  useConfigurationIssuesSummary,
} from "@/services/DashboardService";
import {
  getTopIssueGroups,
  IssueGroup,
} from "@/lib/configurationIssues/issueInsights";
import { findRuleTypeForIssueGroup } from "@/lib/configurationIssues/matchRule";
import {
  getConfigurationRules,
  getConfigurationRulesMetadata,
} from "@/services/ConfigurationRulesService";
import { queryKeys } from "@/services/QueryKeys";
import { useQuery } from "@tanstack/react-query";
import { IssueTypeFilterOptions } from "@/pages/ConfigurationIssues/ConfigurationIssuesFilters";
import HomeQueryErrorState from "./HomeQueryErrorState";
import { cn } from "@/lib/utils";
import DashboardCardHeader from "./DashboardCardHeader";

const LEGEND_STYLES = {
  errors: {
    icon: "text-[hsl(var(--chart-error))]",
    bg: "bg-[hsl(var(--chart-error)/0.15)]",
  },
  warnings: {
    icon: "text-[hsl(var(--chart-warning))]",
    bg: "bg-[hsl(var(--chart-warning)/0.15)]",
  },
  recommendations: {
    icon: "text-[hsl(var(--chart-recommendation))]",
    bg: "bg-[hsl(var(--chart-recommendation)/0.15)]",
  },
} as const;

function LegendItem({
  variant,
  label,
  icon: Icon,
  count,
  to,
  detail,
}: {
  variant: keyof typeof LEGEND_STYLES;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  to?: string;
  /** The most widespread problem of this severity - says why, not just how many. */
  detail?: string;
}) {
  const styles = LEGEND_STYLES[variant];
  const content = (
    <>
      <span className={`rounded-lg p-1.5 ${styles.bg}`}>
        <Icon className={`h-3.5 w-3.5 ${styles.icon}`} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium leading-5">{label}</span>
        {detail && (
          <span
            title={detail}
            className="mt-0.5 line-clamp-2 block text-xs leading-4 text-muted-foreground"
          >
            {detail}
          </span>
        )}
      </span>
      {count !== undefined && (
        <span className="shrink-0 text-sm font-semibold tabular-nums">
          {count}
        </span>
      )}
      {to && (
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      )}
    </>
  );

  const className =
    "group flex items-center gap-3 rounded-lg border border-transparent bg-muted/50 px-2.5 py-1.5 transition-all duration-150";

  return to ? (
    <Link
      to={to}
      className={`${className} hover:border-primary/40 hover:bg-card hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
    >
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

const issuesUrl = (type: string) =>
  `${ConfigurationIssuesUrl}?type=${encodeURIComponent(type)}`;

export function ConfigurationIssuesSummary({
  className,
}: {
  className?: string;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data, error, isError, isLoading } = useConfigurationIssuesSummary();
  const issues = useConfigurationIssues();
  // Rules + metadata give the top problem a readable name. Both are optional:
  // without them (e.g. no permission) the row just says how many are affected.
  const rules = useQuery({
    queryKey: [queryKeys.configurationRules],
    queryFn: getConfigurationRules,
    retry: false,
  });
  const rulesMetadata = useQuery({
    queryKey: [queryKeys.configurationRulesMetadata],
    queryFn: getConfigurationRulesMetadata,
    retry: false,
    staleTime: Infinity,
  });
  const topProblem = useMemo(() => {
    const top = (severity: string) =>
      getTopIssueGroups(
        (issues.data ?? []).filter((issue) => issue.issueType === severity),
        1,
      )[0];

    return {
      errors: top(IssueTypeFilterOptions.ERROR),
      warnings: top(IssueTypeFilterOptions.WARNING),
      recommendations: top(IssueTypeFilterOptions.RECOMMENDATION),
    };
  }, [issues.data]);

  const errors = data?.errors ?? 0;
  const warnings = data?.warnings ?? 0;
  const recommendations = data?.recommendations ?? 0;

  const hasNoIssues = errors === 0 && warnings === 0 && recommendations === 0;

  // Only the most severe level explains itself, in full: three truncated
  // one-liners read worse than one complete sentence.
  const mostSevere =
    errors > 0 ? "errors" : warnings > 0 ? "warnings" : "recommendations";

  // "8 clients affected · Client access token lifetime too long" - the rule's
  // display name, never the raw (user editable) message, which stays a click away.
  const describe = (level: keyof typeof topProblem) => {
    const group: IssueGroup | undefined =
      level === mostSevere ? topProblem[level] : undefined;
    if (!group) return undefined;

    const affected = t(
      `Home.ClientsChecker.Affected.${group.resourceType}` as never,
      { count: group.resources },
    );
    const ruleType = findRuleTypeForIssueGroup(
      group,
      (rules.data?.rules ?? []).map((rule) => ({
        ruleType: String(rule.ruleType),
        resourceType: String(rule.resourceType),
        issueType: String(rule.issueType),
        isEnabled: rule.isEnabled,
        messageTemplate: rule.messageTemplate,
      })),
    );
    const ruleName = rulesMetadata.data?.find(
      (meta) => meta.ruleType === ruleType,
    )?.displayName;

    return ruleName ? `${affected} · ${ruleName}` : String(affected);
  };

  const chartConfig = {
    issues: {
      label: t("Home.ClientsChecker.Legend.Issues"),
    },
    errors: {
      label: t("Home.ClientsChecker.Legend.Errors"),
      color: "hsl(var(--chart-error))",
    },
    warnings: {
      label: t("Home.ClientsChecker.Legend.Warnings"),
      color: "hsl(var(--chart-warning))",
    },
    recommendations: {
      label: t("Home.ClientsChecker.Legend.Recommendations"),
      color: "hsl(var(--chart-recommendation))",
    },
    done: {
      label: t("Home.ClientsChecker.Legend.NoIssues"),
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  const chartData = hasNoIssues
    ? [{ browser: "done", issues: 1, fill: "var(--color-done)" }]
    : [
        ...(errors > 0
          ? [
              {
                browser: "errors",
                issues: errors,
                fill: "var(--color-errors)",
              },
            ]
          : []),
        ...(warnings > 0
          ? [
              {
                browser: "warnings",
                issues: warnings,
                fill: "var(--color-warnings)",
              },
            ]
          : []),
        ...(recommendations > 0
          ? [
              {
                browser: "recommendations",
                issues: recommendations,
                fill: "var(--color-recommendations)",
              },
            ]
          : []),
      ];

  if (isLoading) {
    return (
      <Card className={cn("flex h-full min-w-0 flex-col", className)}>
        <DashboardCardHeader
          icon={ShieldCheck}
          title={t("Home.ClientsChecker.Title")}
          description={t("Home.ClientsChecker.Description")}
        />
        <CardContent
          aria-busy
          className="flex flex-1 items-center justify-center gap-8 px-5 pb-5"
        >
          <div className="h-[148px] w-[148px] shrink-0 animate-pulse rounded-full border-[20px] border-muted" />
          <div className="hidden flex-1 space-y-2 sm:block">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded-lg bg-muted/60" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <HomeQueryErrorState
        error={error}
        cardTitle={t("Home.ClientsChecker.Title")}
        cardDescription={t("Home.ClientsChecker.Description")}
        className={className}
      />
    );
  }

  const totalIssues = errors + warnings + recommendations;

  const tone = hasNoIssues ? "success" : errors > 0 ? "danger" : "warning";
  const HeaderIcon = hasNoIssues
    ? ShieldCheck
    : errors > 0
      ? XCircle
      : AlertTriangle;

  return (
    <Card className={cn("flex h-full min-w-0 flex-col overflow-hidden", className)}>
      <DashboardCardHeader
        icon={HeaderIcon}
        tone={tone}
        title={t("Home.ClientsChecker.Title")}
        description={t("Home.ClientsChecker.Description")}
      />

      <CardContent className="flex flex-1 flex-col items-center justify-center gap-4 px-5 pb-0 sm:flex-row sm:gap-8 lg:flex-col lg:gap-4 xl:flex-row xl:gap-8">
        <div className="h-[148px] w-[148px] shrink-0">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <PieChart width={148} height={148}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="issues"
                nameKey="browser"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={chartData.length > 1 ? 3 : 0}
                cornerRadius={4}
                stroke="none"
                startAngle={90}
                endAngle={-270}
                // The legend rows are the keyboard path; the SVG sectors are not.
                rootTabIndex={-1}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const cy = viewBox.cy ?? 0;
                      return (
                        <text
                          x={viewBox.cx}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={cy - 6}
                            className="fill-foreground text-3xl font-semibold"
                          >
                            {totalIssues}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={cy + 18}
                            className="fill-muted-foreground text-xs"
                          >
                            {t("Home.ClientsChecker.Pie.IssuesLabel", {
                              count: totalIssues,
                            })}
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        <div className="flex w-full min-w-0 flex-col justify-center gap-1.5 sm:flex-1 lg:w-full lg:flex-none xl:w-auto xl:flex-1">
          {hasNoIssues ? (
            // Three rows of zeros say less than one clear "all good".
            <div className="flex items-center gap-3 rounded-lg bg-[hsl(var(--chart-3)/0.08)] px-3 py-3">
              <span className="rounded-lg bg-[hsl(var(--chart-3)/0.15)] p-1.5">
                <CheckCircle className="h-4 w-4 text-[hsl(var(--chart-3))]" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">
                  {t("Home.ClientsChecker.Legend.NoIssues")}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t("Home.ClientsChecker.AllRulesPass")}
                </span>
              </span>
            </div>
          ) : (
            <>
              <LegendItem
                variant="errors"
                label={t("Home.ClientsChecker.Legend.Errors")}
                icon={XCircle}
                count={errors}
                detail={describe("errors")}
                to={issuesUrl(IssueTypeFilterOptions.ERROR)}
              />
              <LegendItem
                variant="warnings"
                label={t("Home.ClientsChecker.Legend.Warnings")}
                icon={AlertTriangle}
                count={warnings}
                detail={describe("warnings")}
                to={issuesUrl(IssueTypeFilterOptions.WARNING)}
              />
              <LegendItem
                variant="recommendations"
                label={t("Home.ClientsChecker.Legend.Recommendations")}
                icon={Zap}
                count={recommendations}
                detail={describe("recommendations")}
                to={issuesUrl(IssueTypeFilterOptions.RECOMMENDATION)}
              />
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2 p-5 pt-3">
        <Button
          variant={hasNoIssues || errors > 0 ? "outline" : "default"}
          size="sm"
          type="button"
          onClick={() => navigate(ConfigurationIssuesUrl)}
          className={cn(
            "flex-1",
            // Same "needs attention" tint as the issues badge in the header. A solid
            // red button would be the single loudest surface on the page, and solid
            // red is what the app uses for delete / discard.
            errors > 0 &&
              "border-red-500/30 bg-red-500/10 text-red-700 hover:bg-red-500/15 hover:text-red-700 dark:text-red-400 dark:hover:text-red-400",
          )}
        >
          {t("Home.ClientsChecker.Button")} <Bug size={14} className="ms-1" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => navigate(ConfigurationRulesUrl)}
          className="flex-1"
        >
          {t("Home.ClientsChecker.ManageRules")}{" "}
          <Settings size={14} className="ms-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ConfigurationIssuesSummary;
