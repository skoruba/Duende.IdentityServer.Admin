import { Calendar, TrendingUp } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

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
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
          <Calendar className="h-8 w-8" />
          <TrendingUp className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t("AuditLogs.InsufficientData")}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {t("AuditLogs.InsufficientDataDescription")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const dateLabel = isToday(new Date(payload[0].payload.created))
                  ? t("Dashboard.Today")
                  : formatDate(new Date(payload[0].payload.created));

                return (
                  <div className="rounded-lg border bg-white dark:bg-gray-800 p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-gray-500 dark:text-gray-400">
                          {t("Dashboard.Average")}
                        </span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                          {payload[0].value}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-gray-500 dark:text-gray-400">
                          {dateLabel}
                        </span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                          {payload[1].value}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="average"
            name="Average"
            strokeWidth={2}
            activeDot={{
              r: 6,
              style: { fill: "var(--theme-primary)", opacity: 0.25 },
            }}
            stroke="var(--theme-primary)"
            className="stroke-black dark:stroke-white"
          />
          <Line
            type="monotone"
            strokeWidth={2}
            dataKey="total"
            name="Total"
            activeDot={{
              r: 8,
              style: { fill: "var(--theme-primary)" },
            }}
            stroke="var(--theme-primary)"
            className="stroke-black dark:stroke-white"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AuditLogs;
