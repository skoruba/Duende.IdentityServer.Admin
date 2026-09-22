import { AlertTriangle, ShieldX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/Card/Card";
import { getStatusCode } from "@/helpers/ErrorHelper";
import { cn } from "@/lib/utils";
import DashboardCardHeader from "./DashboardCardHeader";
import { getDashboardErrorKey } from "./dashboardErrors";

type HomeQueryErrorStateProps = {
  error: unknown;
  cardTitle?: string;
  cardDescription?: string;
  /** Grid placement of the card this state stands in for. */
  className?: string;
  /** Without the card chrome, for use inside an existing card. */
  compact?: boolean;
};

const HomeQueryErrorState = ({
  error,
  cardTitle,
  cardDescription,
  className,
  compact = false,
}: HomeQueryErrorStateProps) => {
  const { t } = useTranslation();
  const status = getStatusCode(error);
  const isForbidden = status === 403;
  const Icon = isForbidden ? ShieldX : AlertTriangle;

  const description = t(getDashboardErrorKey(error));

  // A missing permission is an expected state, not an incident: it stays
  // neutral. Anything else is a failed request and is flagged as a warning.
  const message = (
    <div
      role={isForbidden ? "status" : "alert"}
      className={cn(
        "flex flex-1 items-center gap-3 rounded-xl border border-dashed px-4 py-4",
        !isForbidden && "border-amber-500/40 bg-amber-500/5",
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 shrink-0",
          isForbidden
            ? "text-muted-foreground"
            : "text-amber-600 dark:text-amber-400",
        )}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium">{t("Home.DashboardState.Title")}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  if (compact) return message;

  return (
    <Card className={cn("flex h-full min-w-0 flex-col", className)}>
      {cardTitle && (
        <DashboardCardHeader
          icon={Icon}
          tone={isForbidden ? "neutral" : "warning"}
          title={cardTitle}
          description={cardDescription}
        />
      )}
      <CardContent className={cn("flex flex-1 px-5 pb-5", !cardTitle && "pt-5")}>
        {message}
      </CardContent>
    </Card>
  );
};

export default HomeQueryErrorState;
