import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Activity, AlertTriangle, ArrowRight, CalendarClock } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/Card/Card";
import { AuditLogsUrl } from "@/routing/Urls";
import {
  DASHBOARD_AUDIT_LOG_DAYS,
  useDashboardIdentityServer,
} from "@/services/DashboardService";
import {
  buildDailySeries,
  getActivityInsight,
  getNiceAxisTicks,
  getPastAnomalies,
} from "@/lib/auditLogs/activitySeries";
import { cn } from "@/lib/utils";
import { DashboardDataAuditLog } from "@/models/Dashboard/DashboardModels";
import DashboardCardHeader from "./DashboardCardHeader";
import HomeQueryErrorState from "./HomeQueryErrorState";

const EMPTY_DATA: DashboardDataAuditLog[] = [];
// Days with audit data needed before the trend chart is shown.
const MIN_TREND_DAYS = 3;

const SERIES_COLOR = "hsl(var(--chart-today))";
const ALERT_COLOR = "hsl(var(--chart-warning))";

const formatDay = (date: Date) =>
  date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat(undefined, {
    notation: "compact",
    // 1250 must read "1.25K", not a rounded-up "1.3K"
    maximumFractionDigits: 2,
  }).format(value);

const AuditLogs: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useTranslation();
  const dashboard = useDashboardIdentityServer();
  const data = dashboard.data?.auditLogsData ?? EMPTY_DATA;

  const { series, insight, axisTicks, anomalies } = useMemo(() => {
    const series = buildDailySeries(data).map((day) => ({
      ...day,
      label: formatDay(day.created),
    }));
    const insight = getActivityInsight(series);
    // Stable identity: a new ticks array on every render restarts the chart.
    const axisTicks = getNiceAxisTicks(
      Math.max(...series.map((day) => day.total), insight.threshold, 0),
    );
    const anomalies = getPastAnomalies(series, insight.threshold);
    return { series, insight, axisTicks, anomalies };
  }, [data]);

  const title = t("Home.AuditLogs");
  const description = t("Home.AuditLogsDescription");
  const totalEvents = data.reduce((sum, day) => sum + day.total, 0);
  const totalLabel = t("Home.Sections.LastDays", {
    days: DASHBOARD_AUDIT_LOG_DAYS,
  });

  const dayUrl = (date: Date) =>
    `${AuditLogsUrl}?created=${format(date, "yyyy-MM-dd")}`;

  const footerLinkClass =
    "inline-flex items-center gap-1 rounded-md text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const attentionLinkClass =
    "text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300";

  // Today's anomaly replaces the default link; an older one gets its own link
  // so it stays actionable while the current state is calm.
  const renderFooter = (todayIsUnusual = false, lastAnomaly?: Date) => (
    <div className="flex min-h-[44px] items-center justify-between gap-3 border-t px-5 py-3">
      <Link
        to={todayIsUnusual ? dayUrl(new Date()) : AuditLogsUrl}
        className={cn(
          footerLinkClass,
          todayIsUnusual
            ? attentionLinkClass
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {todayIsUnusual
          ? t("AuditLogs.Review")
          : t("Home.Sections.ViewAuditLogs")}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
      {lastAnomaly && (
        <Link
          to={dayUrl(lastAnomaly)}
          className={cn(footerLinkClass, attentionLinkClass)}
        >
          {t("AuditLogs.ReviewAnomaly", { date: formatDay(lastAnomaly) })}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );

  if (dashboard.isError) {
    return (
      <HomeQueryErrorState
        error={dashboard.error}
        cardTitle={title}
        cardDescription={description}
        className={className}
      />
    );
  }

  if (dashboard.isLoading || data.length < MIN_TREND_DAYS) {
    return (
      <Card className={cn("flex h-full min-w-0 flex-col", className)}>
        <DashboardCardHeader
          icon={Activity}
          tone="info"
          title={title}
          description={description}
          metric={dashboard.isLoading ? undefined : totalEvents.toLocaleString()}
          metricLabel={totalLabel}
        />
        <CardContent className="flex flex-1 px-5 pb-4">
          {dashboard.isLoading ? (
            <div className="min-h-[88px] flex-1 animate-pulse rounded-lg bg-muted/60" />
          ) : (
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-dashed px-4 py-4">
              <CalendarClock className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {data.length === 0
                    ? t("Dashboard.NoAuditData")
                    : t("AuditLogs.InsufficientData")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("AuditLogs.InsufficientDataDescription", {
                    current: data.length,
                    required: MIN_TREND_DAYS,
                  })}
                </p>
                <div
                  aria-hidden
                  className="mt-2.5 h-1 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-primary/70 transition-all"
                    style={{
                      width: `${(data.length / MIN_TREND_DAYS) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
        {renderFooter()}
      </Card>
    );
  }

  const todayPoint = series[series.length - 1];
  const lastAnomaly = anomalies[0];

  return (
    <Card className={cn("flex h-full min-w-0 flex-col overflow-hidden", className)}>
      <DashboardCardHeader
        icon={insight.isUnusual ? AlertTriangle : Activity}
        tone={insight.isUnusual ? "warning" : "info"}
        title={title}
        description={
          insight.isUnusual ? (
            <>
              {t("AuditLogs.UnusualActivity", {
                operations: insight.today.toLocaleString(),
              })}
              <span className="hidden xl:inline">
                {" "}
                {t("AuditLogs.UnusualActivityBaseline", {
                  baseline: Math.round(insight.baseline).toLocaleString(),
                })}
              </span>
            </>
          ) : (
            <>
              {/* With an anomaly to mention, narrow cards get the short wording
                  so the anomaly is never the part that gets truncated. */}
              <span className={cn(lastAnomaly && "hidden 2xl:inline")}>
                {t("AuditLogs.NormalActivity")}
              </span>
              {lastAnomaly && (
                <>
                  <span className="2xl:hidden">
                    {t("AuditLogs.NormalActivityShort")}
                  </span>
                  <span className="font-medium text-amber-700 dark:text-amber-400">
                    {" · "}
                    <span className="hidden 2xl:inline">
                      {t("AuditLogs.AnomalyOn", {
                        date: formatDay(lastAnomaly.created),
                      })}
                    </span>
                    <span className="2xl:hidden">
                      {t("AuditLogs.AnomalyOnShort", {
                        date: formatDay(lastAnomaly.created),
                      })}
                    </span>
                  </span>
                </>
              )}
            </>
          )
        }
        descriptionTitle={`${
          insight.isUnusual
            ? `${t("AuditLogs.UnusualActivity", {
                operations: insight.today.toLocaleString(),
              })} ${t("AuditLogs.UnusualActivityBaseline", {
                baseline: Math.round(insight.baseline).toLocaleString(),
              })}. `
            : ""
        }${
          !insight.isUnusual && lastAnomaly
            ? `${t("AuditLogs.NormalActivity")} · ${t("AuditLogs.AnomalyOn", {
                date: formatDay(lastAnomaly.created),
              })}. `
            : ""
        }${t("AuditLogs.BaselineExplanation", {
          days: DASHBOARD_AUDIT_LOG_DAYS,
        })}`}
        descriptionClassName={
          insight.isUnusual
            ? "font-medium text-amber-700 dark:text-amber-400"
            : undefined
        }
        metric={totalEvents.toLocaleString()}
        metricLabel={totalLabel}
      />
      <CardContent className="flex-1 space-y-2.5 px-5 pb-3">
        <div className="h-[118px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={series}
              margin={{ top: 12, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="auditActivityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={SERIES_COLOR} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={SERIES_COLOR} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="hsl(var(--border))"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="label"
                fontSize={11}
                tickMargin={8}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={28}
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis
                width={38}
                fontSize={11}
                ticks={axisTicks}
                axisLine={false}
                tickLine={false}
                domain={[0, axisTicks[axisTicks.length - 1]]}
                tickFormatter={formatCompactNumber}
                stroke="hsl(var(--muted-foreground))"
              />

              <Tooltip
                cursor={{ stroke: "hsl(var(--border))" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;

                  const point = payload[0].payload as (typeof series)[number];
                  const isToday = point === todayPoint;
                  const aboveThreshold =
                    point.total > insight.threshold;

                  return (
                    <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md">
                      <p className="text-xs text-muted-foreground">
                        {isToday
                          ? t("Dashboard.Today")
                          : point.created.toLocaleDateString(undefined, {
                              weekday: "short",
                              month: "long",
                              day: "numeric",
                            })}
                      </p>
                      <p className="text-sm font-semibold tabular-nums">
                        {point.total.toLocaleString()}{" "}
                        <span className="font-normal text-muted-foreground">
                          {t("AuditLogs.Operations")}
                        </span>
                      </p>
                      {aboveThreshold && (
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="h-3 w-3" />
                          {t("AuditLogs.AnomalyDetected")}
                        </p>
                      )}
                    </div>
                  );
                }}
              />

              <ReferenceLine
                y={insight.threshold}
                stroke={ALERT_COLOR}
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />

              <Area
                type="monotone"
                dataKey="total"
                stroke={SERIES_COLOR}
                strokeWidth={2}
                fill="url(#auditActivityFill)"
                isAnimationActive={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }}
              />

              {anomalies.map((day) => (
                <ReferenceDot
                  key={day.label}
                  x={day.label}
                  y={day.total}
                  r={4}
                  fill={ALERT_COLOR}
                  stroke="hsl(var(--card))"
                  strokeWidth={2}
                />
              ))}

              <ReferenceDot
                x={todayPoint.label}
                y={todayPoint.total}
                r={5}
                fill={insight.isUnusual ? ALERT_COLOR : SERIES_COLOR}
                stroke="hsl(var(--card))"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center gap-x-4 whitespace-nowrap text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-4 border-t-2 border-dashed"
              style={{ borderColor: ALERT_COLOR }}
            />
            {t("AuditLogs.AlertThreshold", {
              threshold: Math.round(insight.threshold).toLocaleString(),
            })}
          </span>
          {/* Only where it fits on the same line - a wrapped legend makes the card,
              and with it the whole row of tiles, taller. */}
          <span
            className="ml-auto hidden xl:inline"
            title={t("AuditLogs.BaselineExplanation", {
              days: DASHBOARD_AUDIT_LOG_DAYS,
            })}
          >
            {t("AuditLogs.DailyAverage", {
              count: Math.round(insight.baseline),
            })}
          </span>
        </div>
      </CardContent>
      {renderFooter(insight.isUnusual, lastAnomaly?.created)}
    </Card>
  );
};

export default AuditLogs;
