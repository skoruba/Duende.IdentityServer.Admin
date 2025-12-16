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
import { Hammer, Cog, Settings, Search, Filter, X } from "lucide-react";
import { TooltipField } from "@/components/FormRow/FormRow";
import { IssueTypeBadge } from "./IssueTypeBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import {
  ResourceTypeFilterOptions,
  IssueTypeFilterOptions,
  ResourceTypeFilter,
  IssueTypeFilter,
} from "./ConfigurationIssuesFilters";

const ConfigurationIssues: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [resourceTypeFilter, setResourceTypeFilter] =
    useState<ResourceTypeFilter>(ResourceTypeFilterOptions.ALL);
  const [issueTypeFilter, setIssueTypeFilter] = useState<IssueTypeFilter>(
    IssueTypeFilterOptions.ALL
  );
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useConfigurationIssues();

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.filter((issue) => {
      const matchesSearch =
        searchTerm === "" ||
        issue.resourceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.message?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesResourceType =
        resourceTypeFilter === ResourceTypeFilterOptions.ALL ||
        String(issue.resourceType) === resourceTypeFilter;

      const matchesIssueType =
        issueTypeFilter === IssueTypeFilterOptions.ALL ||
        String(issue.issueType) === issueTypeFilter;

      return matchesSearch && matchesResourceType && matchesIssueType;
    });
  }, [data, searchTerm, resourceTypeFilter, issueTypeFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setResourceTypeFilter(ResourceTypeFilterOptions.ALL);
    setIssueTypeFilter(IssueTypeFilterOptions.ALL);
  };

  const hasActiveFilters =
    searchTerm ||
    resourceTypeFilter !== ResourceTypeFilterOptions.ALL ||
    issueTypeFilter !== IssueTypeFilterOptions.ALL;

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
          Client: "outline",
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
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            {t("ConfigurationIssues.Filters")}
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                {
                  [
                    searchTerm && "search",
                    resourceTypeFilter !== ResourceTypeFilterOptions.ALL &&
                      "type",
                    issueTypeFilter !== IssueTypeFilterOptions.ALL &&
                      "severity",
                  ].filter(Boolean).length
                }
              </Badge>
            )}
          </Button>
          <Link to="/configuration-rules">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              {t("ConfigurationIssues.ManageRules")}
            </Button>
          </Link>
        </div>
      }
    >
      {showFilters && (
        <div className="mb-6 space-y-4 rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {t("ConfigurationIssues.FilterOptions")}
            </h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                {t("ConfigurationIssues.ClearFilters")}
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("ConfigurationIssues.SearchPlaceholder")}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("ConfigurationIssues.SearchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("ConfigurationIssues.ResourceType")}
              </label>
              <Select
                value={resourceTypeFilter}
                onValueChange={(value) =>
                  setResourceTypeFilter(value as ResourceTypeFilter)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ResourceTypeFilterOptions.ALL}>
                    {t("ConfigurationIssues.AllTypes")}
                  </SelectItem>
                  <SelectItem value={ResourceTypeFilterOptions.CLIENT}>
                    {t("ConfigurationIssues.Client")}
                  </SelectItem>
                  <SelectItem value={ResourceTypeFilterOptions.API_SCOPE}>
                    {t("ConfigurationIssues.ApiScope")}
                  </SelectItem>
                  <SelectItem value={ResourceTypeFilterOptions.API_RESOURCE}>
                    {t("ConfigurationIssues.ApiResource")}
                  </SelectItem>
                  <SelectItem
                    value={ResourceTypeFilterOptions.IDENTITY_RESOURCE}
                  >
                    {t("ConfigurationIssues.IdentityResource")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("ConfigurationIssues.Severity")}
              </label>
              <Select
                value={issueTypeFilter}
                onValueChange={(value) =>
                  setIssueTypeFilter(value as IssueTypeFilter)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={IssueTypeFilterOptions.ALL}>
                    {t("ConfigurationIssues.AllSeverities")}
                  </SelectItem>
                  <SelectItem value={IssueTypeFilterOptions.ERROR}>
                    {t("ConfigurationIssues.IssueTypeError")}
                  </SelectItem>
                  <SelectItem value={IssueTypeFilterOptions.WARNING}>
                    {t("ConfigurationIssues.IssueTypeWarning")}
                  </SelectItem>
                  <SelectItem value={IssueTypeFilterOptions.RECOMMENDATION}>
                    {t("ConfigurationIssues.IssueTypeRecommendation")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {t("ConfigurationIssues.ShowingResults", {
                count: filteredData.length,
                total: Array.isArray(data) ? data.length : 0,
              })}
            </span>
          </div>
        </div>
      )}
      <DataTable<client.ConfigurationIssueDto, number>
        columns={columns}
        data={filteredData}
        totalCount={filteredData.length}
        pagination={{
          pageIndex: 0,
          pageSize: filteredData.length,
          hidePagination: true,
        }}
        setPagination={() => {}}
      />
    </Page>
  );
};

export default ConfigurationIssues;
