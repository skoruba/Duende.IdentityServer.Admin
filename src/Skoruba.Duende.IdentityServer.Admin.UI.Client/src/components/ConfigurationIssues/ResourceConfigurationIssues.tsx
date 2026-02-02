import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { IssueTypeBadge } from "@/pages/ConfigurationIssues/IssueTypeBadge";
import { useConfigurationIssuesForResource } from "@/services/DashboardService";
import { Button } from "@/components/ui/button";

const severityRank: Record<client.ConfigurationIssueTypeView, number> = {
  [client.ConfigurationIssueTypeView.Error]: 0,
  [client.ConfigurationIssueTypeView.Warning]: 1,
  [client.ConfigurationIssueTypeView.Recommendation]: 2,
};

interface ResourceConfigurationIssuesProps {
  resourceId?: number;
  resourceType: client.ConfigurationResourceType;
}

const ResourceConfigurationIssues: React.FC<
  ResourceConfigurationIssuesProps
> = ({ resourceId, resourceType }) => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(true);
  const normalizedResourceId = Number(resourceId);
  const { data: issues = [], isLoading } = useConfigurationIssuesForResource(
    normalizedResourceId,
    resourceType
  );

  const sortedIssues = useMemo(
    () =>
      [...issues].sort(
        (left, right) =>
          (severityRank[left.issueType as client.ConfigurationIssueTypeView] ??
            99) -
          (severityRank[right.issueType as client.ConfigurationIssueTypeView] ??
            99)
      ),
    [issues]
  );

  if (
    !Number.isFinite(normalizedResourceId) ||
    (!issues.length && !isLoading)
  ) {
    return null;
  }

  const getIssueLabel = (issueType: client.ConfigurationIssueTypeView) => {
    if (issueType === client.ConfigurationIssueTypeView.Error) {
      return t("ConfigurationIssues.IssueTypeError");
    }
    if (issueType === client.ConfigurationIssueTypeView.Warning) {
      return t("ConfigurationIssues.IssueTypeWarning");
    }
    return t("ConfigurationIssues.IssueTypeRecommendation");
  };

  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  return (
    <section className="mb-6 rounded-lg border border-border/50 bg-background/60 p-4 text-sm shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {t("ConfigurationIssues.ResourceIssuesTitle")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("ConfigurationIssues.ResourceIssuesSummary", {
              count: issues.length,
            })}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={toggleCollapsed}>
          {collapsed
            ? t("ConfigurationIssues.ShowIssues")
            : t("ConfigurationIssues.HideIssues")}
        </Button>
      </div>
      {!collapsed && (
        <div className="mt-4 space-y-4">
          {sortedIssues.map((issue, index) => (
            <div className="flex gap-4" key={`${issue.issueType}-${index}`}>
              <div className="flex w-32 shrink-0 items-start">
                <IssueTypeBadge
                  type={issue.issueType}
                  label={getIssueLabel(issue.issueType)}
                />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-semibold text-foreground">
                  {issue.message ??
                    t("ConfigurationIssues.UnknownIssueMessage")}
                </p>
                {issue.fixDescription && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">
                      {t("ConfigurationIssues.Fix")}:{" "}
                    </span>
                    {issue.fixDescription}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ResourceConfigurationIssues;
