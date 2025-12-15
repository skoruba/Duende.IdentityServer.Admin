import { AlertTriangle, Info, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { client } from "@skoruba/duende.identityserver.admin.api.client";

type Props = {
  type: client.ConfigurationIssueTypeView;
  label: string;
};

export function IssueTypeBadge({ type, label }: Props) {
  const isError =
    String(type) === "Error" ||
    type === client.ConfigurationIssueTypeView.Error;
  const isWarning =
    String(type) === "Warning" ||
    type === client.ConfigurationIssueTypeView.Warning;

  let colorClasses = "";
  let icon = null;

  if (isError) {
    colorClasses =
      "border-red-500 text-red-800 bg-red-100 dark:border-red-700 dark:text-red-200 dark:bg-red-950";
    icon = <XCircle className="h-3.5 w-3.5 shrink-0" />;
  } else if (isWarning) {
    colorClasses =
      "border-orange-400 text-orange-800 bg-orange-100 dark:border-orange-600 dark:text-orange-200 dark:bg-orange-950";
    icon = <AlertTriangle className="h-3.5 w-3.5 shrink-0" />;
  } else {
    colorClasses =
      "border-blue-300 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950";
    icon = <Info className="h-3.5 w-3.5 shrink-0" />;
  }

  return (
    <Badge
      variant="outline"
      className={[
        "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs",
        colorClasses,
      ].join(" ")}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Badge>
  );
}
