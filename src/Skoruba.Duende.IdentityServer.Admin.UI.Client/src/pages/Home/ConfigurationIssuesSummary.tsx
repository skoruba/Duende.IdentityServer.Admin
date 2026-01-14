import { useNavigate } from "react-router-dom";
import { Pie, PieChart, Label } from "recharts";
import {
  Bug,
  Shield,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Zap,
  Settings,
} from "lucide-react";
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
import { ConfigurationIssuesUrl, ConfigurationRulesUrl } from "@/routing/Urls";
import Loading from "@/components/Loading/Loading";
import { getConfigurationIssues } from "@/services/DashboardService";

const LEGEND_STYLES = {
  errors: {
    icon: "text-[hsl(var(--chart-error))]",
    count: "text-[hsl(var(--chart-error))]",
    bg: "bg-[hsl(var(--chart-error)/0.2)]",
  },
  warnings: {
    icon: "text-[hsl(var(--chart-warning))]",
    count: "text-[hsl(var(--chart-warning))]",
    bg: "bg-[hsl(var(--chart-warning)/0.2)]",
  },
  recommendations: {
    icon: "text-[hsl(var(--chart-recommendation))]",
    count: "text-[hsl(var(--chart-recommendation))]",
    bg: "bg-[hsl(var(--chart-recommendation)/0.2)]",
  },
  done: {
    icon: "text-[hsl(var(--chart-3))]",
    count: "text-[hsl(var(--chart-3))]",
    bg: "bg-[hsl(var(--chart-3)/0.2)]",
  },
} as const;

function LegendItem({
  variant,
  label,
  icon: Icon,
  count,
}: {
  variant: keyof typeof LEGEND_STYLES;
  label: string;
  icon: any;
  count?: number;
}) {
  const styles = LEGEND_STYLES[variant];
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 rounded-lg ${styles.bg}`}>
          <Icon className={`h-3 w-3 ${styles.icon}`} />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {count !== undefined && (
        <span className={`ml-auto text-sm font-bold ${styles.count}`}>
          {count}
        </span>
      )}
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

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                hasNoIssues
                  ? "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20"
                  : totalIssues > 5
                  ? "bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20"
                  : "bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20"
              }`}
            >
              {hasNoIssues ? (
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : totalIssues > 5 ? (
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">
                {t("Home.ClientsChecker.Title")}
              </CardTitle>
              <CardDescription className="text-xs">
                {t("Home.ClientsChecker.Description")}
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`text-2xl font-bold ${
                hasNoIssues
                  ? "text-green-600 dark:text-green-400"
                  : totalIssues > 5
                  ? "text-red-600 dark:text-red-400"
                  : "text-yellow-600 dark:text-yellow-400"
              }`}
            >
              {hasNoIssues ? "✓" : totalIssues}
            </div>
            <div className="text-xs text-muted-foreground">
              {hasNoIssues ? "No Issues" : "Issues Found"}
            </div>
          </div>
        </div>
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
                            className="text-xl font-bold fill-current text-foreground"
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

        <div className="flex flex-col justify-center gap-2">
          <LegendItem
            variant="errors"
            label={t("Home.ClientsChecker.Legend.Errors")}
            icon={XCircle}
            count={errors}
          />
          <LegendItem
            variant="warnings"
            label={t("Home.ClientsChecker.Legend.Warnings")}
            icon={AlertTriangle}
            count={warnings}
          />
          <LegendItem
            variant="recommendations"
            label={t("Home.ClientsChecker.Legend.Recommendations")}
            icon={Zap}
            count={recommendations}
          />
          {hasNoIssues && (
            <LegendItem
              variant="done"
              label={t("Home.ClientsChecker.Legend.NoIssues")}
              icon={CheckCircle}
            />
          )}
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-3 text-sm pt-3">
        <div className="flex gap-2 w-full">
          <Button
            variant={
              hasNoIssues
                ? "outline"
                : totalIssues > 10
                ? "destructive"
                : totalIssues > 3
                ? "secondary"
                : "outline"
            }
            size="sm"
            type="button"
            onClick={() => navigate(ConfigurationIssuesUrl)}
            className="flex-1 transition-all duration-200"
          >
            {t("Home.ClientsChecker.Button")} <Bug size={14} className="ms-1" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => navigate(ConfigurationRulesUrl)}
            className="flex-1 transition-all duration-200"
          >
            Manage Rules <Settings size={14} className="ms-1" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ConfigurationIssuesSummary;
