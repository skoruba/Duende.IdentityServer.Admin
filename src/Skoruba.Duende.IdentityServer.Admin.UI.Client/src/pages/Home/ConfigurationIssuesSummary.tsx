import { useNavigate } from "react-router-dom";
import { Pie, PieChart, Label } from "recharts";
import { Bug } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/Card/Card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { ConfigurationIssuesUrl } from "@/routing/Urls";
import Loading from "@/components/Loading/Loading";
import { getConfigurationIssues } from "@/services/DashboardService";

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block w-3 h-3 rounded-full"
        style={{ backgroundColor: `hsl(${color})` }}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function ConfigurationIssuesSummary() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data, isLoading } = getConfigurationIssues();

  const errors = data?.errors ?? 0;
  const warnings = data?.warnings ?? 0;
  const recommendations = data?.recommendations ?? 0;

  const hasNoIssues = errors === 0 && warnings === 0 && recommendations === 0;

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
    return <Loading />;
  }

  const totalIssues = errors + warnings + recommendations;

  const errorsStr = t("Home.ClientsChecker.Error", { count: errors });
  const warningsStr = t("Home.ClientsChecker.Warning", { count: warnings });
  const recommendationsStr = t("Home.ClientsChecker.Recommendation", {
    count: recommendations,
  });

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle>{t("Home.ClientsChecker.Title")}</CardTitle>
        <CardDescription>
          {t("Home.ClientsChecker.Description")}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col md:flex-row md:items-center md:justify-center gap-6 pb-0">
        <div className="w-[200px] h-[200px]">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <PieChart width={200} height={200}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="issues"
                nameKey="browser"
                innerRadius={50}
                strokeWidth={9}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <g>
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-xl font-bold fill-current text-gray-800 dark:text-gray-200"
                          >
                            {hasNoIssues
                              ? t("Home.ClientsChecker.Pie.NoIssues")
                              : t("Home.ClientsChecker.Pie.Issues", {
                                  count: totalIssues,
                                })}
                          </text>
                        </g>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        <div className="flex flex-col justify-center gap-4">
          <LegendItem
            color="var(--chart-error)"
            label={t("Home.ClientsChecker.Legend.Errors")}
          />
          <LegendItem
            color="var(--chart-warning)"
            label={t("Home.ClientsChecker.Legend.Warnings")}
          />
          <LegendItem
            color="var(--chart-recommendation)"
            label={t("Home.ClientsChecker.Legend.Recommendations")}
          />
          <LegendItem
            color="var(--chart-3)"
            label={t("Home.ClientsChecker.Legend.NoIssues")}
          />
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-4 text-sm">
        <div className="leading-none text-muted-foreground text-center">
          {t("Home.ClientsChecker.Found", {
            errors: errorsStr,
            warnings: warningsStr,
            recommendations: recommendationsStr,
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => navigate(ConfigurationIssuesUrl)}
        >
          {t("Home.ClientsChecker.Button")} <Bug size={16} className="ms-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ConfigurationIssuesSummary;
