import { AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { client } from "@skoruba/duende.identityserver.admin.api.client";

type Props = {
  type: client.ConfigurationIssueTypeView;
  label: string;
};

export function IssueTypeBadge({ type, label }: Props) {
  const isWarning = type === client.ConfigurationIssueTypeView.Warning;

  return (
    <Badge
      variant="outline"
      className={[
        "inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs",
        isWarning
          ? "border-red-300 text-red-700 bg-red-50"
          : "border-blue-300 text-blue-700 bg-blue-50",
        isWarning
          ? "dark:border-red-800 dark:text-red-300 dark:bg-red-950"
          : "dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950",
      ].join(" ")}
    >
      {isWarning ? (
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      ) : (
        <Info className="h-3.5 w-3.5 shrink-0" />
      )}
      <span className="font-medium">{label}</span>
    </Badge>
  );
}
