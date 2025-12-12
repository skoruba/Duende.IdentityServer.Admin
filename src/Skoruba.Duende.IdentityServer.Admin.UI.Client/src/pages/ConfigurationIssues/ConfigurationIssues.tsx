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
import { Hammer, Cog } from "lucide-react";
import { TooltipField } from "@/components/FormRow/FormRow";
import { IssueTypeBadge } from "./IssueTypeBadge";

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
      accessorKey: "issueType",
      header: t("ConfigurationIssues.IssueType"),
      cell: ({ row }: { row: { original: client.ConfigurationIssueDto } }) => {
        const r = row.original;
        const isWarning =
          String(r.issueType) === "Warning" ||
          r.issueType === client.ConfigurationIssueTypeView.Warning;
        const label = isWarning
          ? t("ConfigurationIssues.IssueTypeWarning")
          : t("ConfigurationIssues.IssueTypeRecommendation");

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
