"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card/Card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardDataChart } from "@/models/Dashboard/DashboardModels";
import { useTranslation } from "react-i18next";

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type OverviewProps = {
  data: DashboardDataChart[];
};

const chartConfigValues = {
  fontSize: 12,
  barRadius: 8,
  marginTop: 12 * 2,
  barOffset: 4,
};

export function OverviewLeft({ data }: OverviewProps) {
  const { t } = useTranslation();

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>{t("Home.Overview")}</CardTitle>
        <CardDescription>{t("Home.OverviewDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={data} margin={{ top: chartConfigValues.marginTop }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="total"
              fill="var(--color-total)"
              radius={chartConfigValues.barRadius}
            >
              <LabelList
                position="top"
                offset={chartConfigValues.barOffset}
                className="fill-foreground"
                fontSize={chartConfigValues.fontSize}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
