import { useTranslation } from "react-i18next";
import {
  buildConfigurationIssueLink,
  useConfigurationIssues,
} from "@/services/DashboardService";
import { DataTable } from "@/components/DataTable/DataTable";
import Loading from "@/components/Loading/Loading";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import Page from "@/components/Page/Page";
import { Link } from "react-router-dom";
import { Hammer, Cog, Settings } from "lucide-react";
import { TooltipField } from "@/components/FormRow/FormRow";
import { IssueTypeBadge } from "./IssueTypeBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ConfigurationIssues: React.FC = () => {
  const { t } = useTranslation();

  const { data, isLoading } = useConfigurationIssues();

  const columns = [
    {
      accessorKey: "resourceName",
      header: t("ConfigurationIssues.ResourceName"),
      cell: ({ row }: { row: { original: client.ConfigurationIssueDto } }) => {
        const resource = row.original;
        return (
          <Link
            to={buildConfigurationIssueLink(
              resource.resourceId.toString(),
              resource.resourceType
            )}
            className="underline"
          >
            {resource.resourceName}
          </Link>
        );
      },
    },
    {
      accessorKey: "resourceType",
      header: t("ConfigurationIssues.ResourceType"),
      cell: ({ row }: { row: { original: client.ConfigurationIssueDto } }) => {
        const resourceType = String(row.original.resourceType);
        const variants: any = {
          Client: "default",
          ApiScope: "outline",
          ApiResource: "outline",
          IdentityResource: "outline",
        };
        return (
          <Badge variant={variants[resourceType] || "default"}>
            {resourceType}
          </Badge>
        );
      },
    },
    {
      accessorKey: "issueType",
      header: t("ConfigurationIssues.IssueType"),
      cell: ({ row }: { row: { original: client.ConfigurationIssueDto } }) => {
        const r = row.original;
        const isError =
          String(r.issueType) === "Error" ||
          r.issueType === client.ConfigurationIssueTypeView.Error;
        const isWarning =
          String(r.issueType) === "Warning" ||
          r.issueType === client.ConfigurationIssueTypeView.Warning;

        let label;
        if (isError) {
          label = t("ConfigurationIssues.IssueTypeError");
        } else if (isWarning) {
          label = t("ConfigurationIssues.IssueTypeWarning");
        } else {
          label = t("ConfigurationIssues.IssueTypeRecommendation");
        }

        return (
          <div className="whitespace-nowrap">
            <IssueTypeBadge type={r.issueType} label={label} />
          </div>
        );
      },
    },
    {
      accessorKey: "message",
      header: t("ConfigurationIssues.Message"),
      cell: ({ row }: { row: { original: client.ConfigurationIssueDto } }) => {
        return row.original.message;
      },
    },
    {
      header: t("ConfigurationIssues.Fix"),
      cell: ({ row }: { row: { original: client.ConfigurationIssueDto } }) => {
        const fixDescription = row.original.fixDescription;
        if (!fixDescription) return null;

        return (
          <TooltipField side="left" description={fixDescription}>
            <Hammer />
          </TooltipField>
        );
      },
    },
  ];

  if (isLoading) return <Loading fullscreen />;

  return (
    <Page
      title={t("ConfigurationIssues.PageTitle")}
      icon={Cog}
      accentKind="monitoring"
      topSection={
        <Link to="/configuration-rules">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            {t("ConfigurationIssues.ManageRules")}
          </Button>
        </Link>
      }
    >
      <DataTable<client.ConfigurationIssueDto, number>
        columns={columns}
        data={data ?? []}
        totalCount={data?.length ?? 0}
        pagination={{
          pageIndex: 0,
          pageSize: data?.length ?? 0,
          hidePagination: true,
        }}
        setPagination={() => {}}
      />
    </Page>
  );
};

export default ConfigurationIssues;
