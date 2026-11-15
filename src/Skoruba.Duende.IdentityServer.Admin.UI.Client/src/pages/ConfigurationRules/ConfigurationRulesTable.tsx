import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/DataTable/DataTable";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Edit, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import DeleteDialog from "@/components/DeleteDialog/DeleteDialog";
import {
  toggleConfigurationRule,
  deleteConfigurationRule,
  useConfigurationRulesMetadata,
} from "@/services/ConfigurationRulesService";
import { summarizeRule } from "@/lib/configurationRules/summarizeRule";
import { isUnknownRuleType } from "@/lib/configurationRules/ruleTypeSelection";
import { useMutation } from "@tanstack/react-query";
import { IssueTypeBadge } from "../ConfigurationIssues/IssueTypeBadge";
import { toast } from "@/components/ui/use-toast";
import type { ColumnDef } from "@tanstack/react-table";
import { configurationChangeMeta } from "@/services/mutationMeta";

interface ConfigurationRulesTableProps {
  visibleRules: client.ConfigurationRuleDto[];
  filters: React.ReactNode;
  onEdit: (rule: client.ConfigurationRuleDto) => void;
  onRefresh: () => void;
}

const ConfigurationRulesTable: React.FC<ConfigurationRulesTableProps> = ({
  visibleRules,
  filters,
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

  const [ruleToDelete, setRuleToDelete] =
    useState<client.ConfigurationRuleDto | null>(null);

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

  const mutedIfUnknown = (rule: client.ConfigurationRuleDto) =>
    isUnknownRuleType(metadata, rule.ruleType) ? "opacity-50" : undefined;

  const columns: ColumnDef<client.ConfigurationRuleDto, unknown>[] = [
    {
      accessorKey: "ruleType",
      header: t("ConfigurationRules.RuleType"),
      cell: ({ row }) => {
        const summary = summarizeRule(row.original, metadata, formatBoolean);
        const isUnknown = isUnknownRuleType(metadata, row.original.ruleType);

        return (
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                // Nothing runs a rule that is not registered, so it reads as switched off
                className={
                  isUnknown
                    ? "font-medium text-muted-foreground"
                    : "font-medium"
                }
                title={String(row.original.ruleType)}
              >
                {summary.name}
              </span>
              {isUnknown && (
                <Badge
                  variant="outline"
                  className="gap-1 text-muted-foreground"
                  title={t("ConfigurationRules.UnknownRuleDescription")}
                >
                  {/* The icon of the note above the list: only an enabled rule calls for action */}
                  {row.original.isEnabled && (
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                  )}
                  {t("ConfigurationRules.UnknownRule")}
                </Badge>
              )}
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
      cell: ({ row }) => (
        <div className={mutedIfUnknown(row.original)}>
          {getResourceTypeBadge(row.original.resourceType)}
        </div>
      ),
    },
    {
      accessorKey: "issueType",
      header: t("ConfigurationRules.IssueType"),
      cell: ({ row }) => (
        <div className={mutedIfUnknown(row.original)}>
          {getIssueTypeBadge(row.original.issueType)}
        </div>
      ),
    },
    {
      accessorKey: "isEnabled",
      header: t("ConfigurationRules.Enabled"),
      cell: ({ row }) => {
        return (
          <Switch
            checked={row.original.isEnabled}
            onCheckedChange={() => handleToggle(row.original)}
            disabled={
              toggleMutation.isPending ||
              (!row.original.isEnabled &&
                isUnknownRuleType(metadata, row.original.ruleType))
            }
          />
        );
      },
    },
    {
      id: "actions",
      header: t("Actions.Actions"),
      cell: ({ row }) => {
        const isUnknown = isUnknownRuleType(metadata, row.original.ruleType);

        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(row.original)}
              disabled={isUnknown}
            >
              <Edit className="h-4 w-4" />
            </Button>
            {/* A disabled button gets no pointer events, so the span carries the explanation */}
            <span
              title={
                isUnknown
                  ? undefined
                  : t("ConfigurationRules.DeleteRegisteredRuleDisabled")
              }
            >
              <Button
                variant="ghost"
                size="sm"
                aria-label={t("Actions.Delete")}
                onClick={() => setRuleToDelete(row.original)}
                disabled={!isUnknown || deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {filters}
      <DataTable
        columns={columns}
        data={visibleRules}
        pagination={{ pageIndex: 0, pageSize: 10, hidePagination: true }}
        setPagination={() => {}}
        totalCount={visibleRules.length}
      />
      <DeleteDialog
        isAlertOpen={!!ruleToDelete}
        setIsAlertOpen={(open) => !open && setRuleToDelete(null)}
        title={t("ConfigurationRules.ConfirmDeleteTitle")}
        message={t("ConfigurationRules.ConfirmDeleteMessage")}
        handleDelete={() => {
          if (ruleToDelete) {
            deleteMutation.mutate(ruleToDelete.id);
          }
          setRuleToDelete(null);
        }}
      />
    </div>
  );
};

export default ConfigurationRulesTable;
