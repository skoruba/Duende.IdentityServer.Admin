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
} from "@/services/ConfigurationRulesService";
import { useMutation } from "react-query";
import { IssueTypeBadge } from "../ConfigurationIssues/IssueTypeBadge";

interface ConfigurationRulesTableProps {
  data: client.ConfigurationRulesDto;
  onEdit: (rule: client.ConfigurationRuleDto) => void;
  onRefresh: () => void;
}

type ColumnRow = { row: { original: client.ConfigurationRuleDto } };

const ConfigurationRulesTable: React.FC<ConfigurationRulesTableProps> = ({
  data,
  onEdit,
  onRefresh,
}) => {
  const { t } = useTranslation();

  const toggleMutation = useMutation(
    (id: number) => toggleConfigurationRule(id),
    {
      onSuccess: () => {
        onRefresh();
      },
    }
  );

  const deleteMutation = useMutation(
    (id: number) => deleteConfigurationRule(id),
    {
      onSuccess: () => {
        onRefresh();
      },
    }
  );

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

    return <IssueTypeBadge type={issueType as any} label={label} />;
  };

  const getResourceTypeBadge = (
    resourceType: client.ConfigurationResourceType
  ) => {
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
  };

  const columns = [
    {
      accessorKey: "ruleType",
      header: t("ConfigurationRules.RuleType"),
      cell: ({ row }: ColumnRow) => {
        return (
          <div>
            <div className="font-medium">{row.original.ruleType}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.messageTemplate}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "resourceType",
      header: t("ConfigurationRules.ResourceType"),
      cell: ({ row }: ColumnRow) => {
        return getResourceTypeBadge(row.original.resourceType);
      },
    },
    {
      accessorKey: "issueType",
      header: t("ConfigurationRules.IssueType"),
      cell: ({ row }: ColumnRow) => {
        return getIssueTypeBadge(row.original.issueType);
      },
    },
    {
      accessorKey: "isEnabled",
      header: t("ConfigurationRules.Enabled"),
      cell: ({ row }: ColumnRow) => {
        return (
          <Switch
            checked={row.original.isEnabled}
            onCheckedChange={() => handleToggle(row.original)}
            disabled={toggleMutation.isLoading}
          />
        );
      },
    },
    {
      id: "actions",
      header: t("Actions.Actions"),
      cell: ({ row }: ColumnRow) => {
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
              disabled={deleteMutation.isLoading}
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
      columns={columns as any}
      data={data.rules || []}
      pagination={{ pageIndex: 0, pageSize: data.totalCount }}
      setPagination={() => {}}
      totalCount={data.totalCount}
    />
  );
};

export default ConfigurationRulesTable;
