"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Laptop,
  Users,
  Lock,
  Cable,
  ShieldCheck,
  Fingerprint,
  KeyRound,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card/Card";
import { DashboardDataChart } from "@/models/Dashboard/DashboardModels";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

type OverviewProps = {
  data: DashboardDataChart[];
};

const getIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case "clients":
      return Laptop;
    case "users":
      return Users;
    case "roles":
      return Lock;
    case "api resources":
    case "apiresources":
      return Cable;
    case "api scopes":
    case "apiscopes":
      return ShieldCheck;
    case "identity resources":
    case "identityresources":
      return Fingerprint;
    case "identity providers":
    case "identityproviders":
      return KeyRound;
    default:
      return Laptop;
  }
};

const getColor = (index: number) => {
  const colors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"];
  return colors[index % colors.length];
};

export function OverviewLeft({ data }: OverviewProps) {
  const { t } = useTranslation();

  const maxValue = useMemo(() => Math.max(...data.map((d) => d.total)), [data]);
  const totalCount = useMemo(
    () => data.reduce((sum, item) => sum + item.total, 0),
    [data]
  );

  return (
    <Card className="col-span-1 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              {t("Home.Overview")}
            </CardTitle>
            <CardDescription>{t("Home.OverviewDescription")}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground">
              {totalCount.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("Home.TotalResources")}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[200px] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
              barCategoryGap="30%"
            >
              <XAxis
                dataKey="name"
                fontSize={11}
                tickMargin={12}
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
                    const Icon = getIcon(data.name);

                    return (
                      <div className="rounded-2xl border bg-card/95 backdrop-blur-xl p-4 shadow-2xl">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                              <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-sm font-semibold">{data.name}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center gap-6">
                              <span className="text-sm text-muted-foreground">
                                Count
                              </span>
                              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {data.total.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ fill: "transparent" }}
              />

              <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getColor(index)}
                    className="transition-all duration-300 hover:opacity-80 drop-shadow-md"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.map((item, index) => {
              const Icon = getIcon(item.name);
              const color = getColor(index);

              return (
                <div
                  key={item.name}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                  ></div>
                  <Icon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">
                    {item.name}
                  </span>
                  <span className="text-xs font-medium ml-auto">
                    {item.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
