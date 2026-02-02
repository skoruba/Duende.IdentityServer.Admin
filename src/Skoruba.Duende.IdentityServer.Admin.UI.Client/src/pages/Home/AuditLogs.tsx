import { CalendarClock, BarChart, Activity, Shield, Zap } from "lucide-react";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type DashboardDataAuditLog = {
  total: number;
  created: Date;
  average: number;
};

interface AuditLogsProps {
  data: DashboardDataAuditLog[];
}

const AuditLogs: React.FC<AuditLogsProps> = ({ data }) => {
  const { t } = useTranslation();

  const formatDate = (date: Date, groupBy: "day" | "week") => {
    if (groupBy === "week") {
      const weekEnd = new Date(date);
      weekEnd.setDate(date.getDate() + 6);
      return `${date.getDate()}/${date.getMonth() + 1} - ${weekEnd.getDate()}/${
        weekEnd.getMonth() + 1
      }`;
    }
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const formatDateFull = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const { processedData, groupBy, hasUnusualActivity, averageActivity } =
    useMemo(() => {
      if (data.length < 3)
        return {
          processedData: data,
          groupBy: "day" as const,
          hasUnusualActivity: false,
          averageActivity: 0,
        };

      const shouldGroupByWeeks = data.length > 14;
      const grouping = shouldGroupByWeeks ? "week" : "day";

      let processedData = data;

      if (shouldGroupByWeeks) {
        const weekGroups = new Map<string, DashboardDataAuditLog[]>();

        data.forEach((item) => {
          const weekStart = getStartOfWeek(item.created);
          const weekKey = weekStart.toISOString().split("T")[0];

          if (!weekGroups.has(weekKey)) {
            weekGroups.set(weekKey, []);
          }
          weekGroups.get(weekKey)!.push(item);
        });

        processedData = Array.from(weekGroups.entries())
          .map(([weekKey, weekData]) => {
            const totalForWeek = weekData.reduce(
              (sum, item) => sum + item.total,
              0
            );
            const avgForWeek =
              weekData.reduce((sum, item) => sum + item.average, 0) /
              weekData.length;
            const weekStart = new Date(weekKey);

            return {
              total: totalForWeek,
              created: weekStart,
              average: avgForWeek,
            };
          })
          .sort((a, b) => a.created.getTime() - b.created.getTime());
      }

      const totals = processedData.map((d) => d.total);
      const avg = totals.reduce((sum, val) => sum + val, 0) / totals.length;
      const recentActivity =
        processedData.slice(-2).reduce((sum, d) => sum + d.total, 0) / 2;

      const isUnusual = recentActivity > avg * 1.5 && avg > 10;

      return {
        processedData,
        groupBy: grouping,
        hasUnusualActivity: isUnusual,
        averageActivity: Math.round(avg),
      };
    }, [data]);

  if (data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        {t("Dashboard.NoAuditData")}
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <div className="h-[200px] flex flex-col items-center justify-center gap-3 text-center px-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarClock className="h-8 w-8" />
          <BarChart className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {t("AuditLogs.InsufficientData")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("AuditLogs.InsufficientDataDescription")}
          </p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...processedData.map((d) => d.total));
  const latestValue = processedData[processedData.length - 1]?.total || 0;

  const chartData = processedData.map((item, index) => {
    const isHigh = item.total > averageActivity * 1.3;
    const isCurrent = index === processedData.length - 1;
    return {
      ...item,
      isHigh,
      isCurrent,
      formattedDate: formatDate(item.created, groupBy as "day" | "week"),
    };
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl ${
              hasUnusualActivity
                ? "bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20"
                : "bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20"
            }`}
          >
            {hasUnusualActivity ? (
              <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            ) : (
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                {latestValue.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                {groupBy === "week"
                  ? t("AuditLogs.ThisWeeksOperations")
                  : t("AuditLogs.TodaysOperations")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {hasUnusualActivity
                ? t("AuditLogs.HighActivity")
                : t("AuditLogs.NormalActivity")}{" "}
              •
              {groupBy === "week"
                ? t("AuditLogs.WeeklyAverage", { count: averageActivity })
                : t("AuditLogs.DailyAverage", { count: averageActivity })}
            </p>
          </div>
        </div>
      </div>

      {hasUnusualActivity && (
        <div className="relative overflow-hidden rounded-xl border border-orange-200/50 dark:border-orange-800/50 p-3">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 animate-pulse"></div>
          <div className="relative flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50">
              <Activity className="h-3 w-3 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                {t("AuditLogs.SecurityAlert")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative p-1">
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 20,
                right: 5,
                left: 5,
                bottom: 20,
              }}
            >
              <defs>
                <linearGradient
                  id="activityGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient
                  id="highActivityGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="formattedDate"
                fontSize={11}
                tickMargin={8}
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground"
              />
              <YAxis
                fontSize={11}
                tickMargin={8}
                axisLine={false}
                tickLine={false}
                className="text-muted-foreground"
                domain={[0, maxValue * 1.1]}
                hide
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const date = new Date(data.created);
                    const dateLabel = (() => {
                      if (groupBy === "week") {
                        const weekEnd = new Date(date);
                        weekEnd.setDate(date.getDate() + 6);
                        return `Week ${formatDateFull(date)} - ${formatDateFull(
                          weekEnd
                        )}`;
                      }
                      return isToday(date)
                        ? t("Dashboard.Today")
                        : formatDateFull(date);
                    })();
                    const value = data.total;
                    const isHighActivity = data.isHigh;

                    return (
                      <div className="rounded-2xl border bg-card/95 backdrop-blur-xl p-4 shadow-2xl">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-3 w-3 rounded-full ${
                                isHighActivity
                                  ? "bg-orange-500 shadow-orange-500/50 shadow-lg animate-pulse"
                                  : "bg-blue-500 shadow-blue-500/50 shadow-lg"
                              }`}
                            ></div>
                            <p className="text-sm font-semibold">{dateLabel}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center gap-6">
                              <span className="text-sm text-muted-foreground">
                                {t("AuditLogs.Operations")}
                              </span>
                              <span
                                className={`text-2xl font-bold bg-gradient-to-r ${
                                  isHighActivity
                                    ? "from-orange-600 to-red-600"
                                    : "from-blue-600 to-purple-600"
                                } bg-clip-text text-transparent`}
                              >
                                {value.toLocaleString()}
                              </span>
                            </div>
                            {isHighActivity && (
                              <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 font-medium">
                                <Zap className="h-3 w-3" />
                                {t("AuditLogs.AboveAverage")}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: "transparent" }}
              />

              <Area
                type="monotone"
                dataKey="total"
                stroke={hasUnusualActivity ? "#f97316" : "#3b82f6"}
                strokeWidth={3}
                fill={
                  hasUnusualActivity
                    ? "url(#highActivityGradient)"
                    : "url(#activityGradient)"
                }
                className="drop-shadow-sm"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full chart-indicator-normal"></div>
            <span className="text-xs text-muted-foreground">
              {t("AuditLogs.Normal")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full chart-indicator-today"></div>
            <span className="text-xs text-muted-foreground">
              {groupBy === "week"
                ? t("AuditLogs.CurrentWeek")
                : t("Dashboard.Today")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full chart-indicator-high-activity"></div>
            <span className="text-xs text-muted-foreground">
              {t("AuditLogs.HighActivity")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
