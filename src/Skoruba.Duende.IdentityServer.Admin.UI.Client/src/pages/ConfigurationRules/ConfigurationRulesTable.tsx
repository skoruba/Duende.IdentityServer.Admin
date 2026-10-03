import React from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/DataTable/DataTable";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  toggleConfigurationRule,
  deleteConfigurationRule,
  useConfigurationRulesMetadata,
} from "@/services/ConfigurationRulesService";
import { summarizeRule } from "@/lib/configurationRules/summarizeRule";
import { useMutation } from "@tanstack/react-query";
import { IssueTypeBadge } from "../ConfigurationIssues/IssueTypeBadge";
import { toast } from "@/components/ui/use-toast";
import type { ColumnDef } from "@tanstack/react-table";
import { configurationChangeMeta } from "@/services/mutationMeta";

interface ConfigurationRulesTableProps {
  data: client.ConfigurationRulesDto;
  onEdit: (rule: client.ConfigurationRuleDto) => void;
  onRefresh: () => void;
}

const ConfigurationRulesTable: React.FC<ConfigurationRulesTableProps> = ({
  data,
  onEdit,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const { data: metadata } = useConfigurationRulesMetadata();
  const formatBoolean = (value: boolean) =>
    value ? t("Actions.Yes") : t("Actions.No");

  const toggleMutation = useMutation({
    meta: configurationChangeMeta,
    mutationFn: (id: number) => toggleConfigurationRule(id),
    onSuccess: () => {
      onRefresh();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: t("ConfigurationRules.ToggleFailed"),
        description: t("ConfigurationRules.GenericError"),
      });
    },
  });

  const deleteMutation = useMutation({
    meta: configurationChangeMeta,
    mutationFn: (id: number) => deleteConfigurationRule(id),
    onSuccess: () => {
      onRefresh();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: t("ConfigurationRules.DeleteFailed"),
        description: t("ConfigurationRules.GenericError"),
      });
    },
  });

  const handleToggle = async (rule: client.ConfigurationRuleDto) => {
    await toggleMutation.mutateAsync(rule.id);
  };

  const handleDelete = async (id: number) => {
    if (confirm(t("ConfigurationRules.ConfirmDelete"))) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getIssueTypeBadge = (issueType: client.ConfigurationIssueType) => {
    const isError =
      String(issueType) === "Error" ||
      issueType === client.ConfigurationIssueType.Error;
    const isWarning =
      String(issueType) === "Warning" ||
      issueType === client.ConfigurationIssueType.Warning;

    let label;
    if (isError) {
      label = t("ConfigurationRules.Error");
    } else if (isWarning) {
      label = t("ConfigurationRules.Warning");
    } else {
      label = t("ConfigurationRules.Recommendation");
    }

    return (
      <IssueTypeBadge
        type={
          issueType === client.ConfigurationIssueType.Error
            ? client.ConfigurationIssueTypeView.Error
            : issueType === client.ConfigurationIssueType.Warning
              ? client.ConfigurationIssueTypeView.Warning
              : client.ConfigurationIssueTypeView.Recommendation
        }
        label={label}
      />
    );
  };

  const getResourceTypeBadge = (
    resourceType: client.ConfigurationResourceType,
  ) => {
    const variants: Record<client.ConfigurationResourceType, "outline"> = {
      [client.ConfigurationResourceType.Client]: "outline",
      [client.ConfigurationResourceType.ApiScope]: "outline",
      [client.ConfigurationResourceType.ApiResource]: "outline",
      [client.ConfigurationResourceType.IdentityResource]: "outline",
    };
    return (
      <Badge variant={variants[resourceType] || "default"}>
        {resourceType}
      </Badge>
    );
  };

  const columns: ColumnDef<client.ConfigurationRuleDto, unknown>[] = [
    {
      accessorKey: "ruleType",
      header: t("ConfigurationRules.RuleType"),
      cell: ({ row }) => {
        const summary = summarizeRule(row.original, metadata, formatBoolean);

        return (
          <div className="space-y-1">
            <div className="font-medium" title={row.original.ruleType}>
              {summary.name}
            </div>
            {summary.description && (
              <div className="text-xs text-muted-foreground">
                {summary.description}
              </div>
            )}
            {summary.parameters.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1 pt-0.5 text-xs text-muted-foreground">
                {summary.parameters.map((parameter) => (
                  <span key={parameter.label}>
                    {parameter.label}:{" "}
                    {parameter.values.map((value, index) => (
                      <code
                        key={index}
                        className="mr-1 whitespace-pre rounded bg-muted px-1 py-0.5 font-mono text-foreground last:mr-0"
                      >
                        {value}
                      </code>
                    ))}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "resourceType",
      header: t("ConfigurationRules.ResourceType"),
      cell: ({ row }) => {
        return getResourceTypeBadge(row.original.resourceType);
      },
    },
    {
      accessorKey: "issueType",
      header: t("ConfigurationRules.IssueType"),
      cell: ({ row }) => {
        return getIssueTypeBadge(row.original.issueType);
      },
    },
    {
      accessorKey: "isEnabled",
      header: t("ConfigurationRules.Enabled"),
      cell: ({ row }) => {
        return (
          <Switch
            checked={row.original.isEnabled}
            onCheckedChange={() => handleToggle(row.original)}
            disabled={toggleMutation.isPending}
          />
        );
      },
    },
    {
      id: "actions",
      header: t("Actions.Actions"),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(row.original.id)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data.rules || []}
      pagination={{ pageIndex: 0, pageSize: 10, hidePagination: true }}
      setPagination={() => {}}
      totalCount={data.totalCount}
    />
  );
};

export default ConfigurationRulesTable;
