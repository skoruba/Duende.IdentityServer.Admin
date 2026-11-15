import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Page from "@/components/Page/Page";
import Loading from "@/components/Loading/Loading";
import useModal from "@/hooks/modalHooks";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  FilterX,
  PlusCircle,
  Search,
  Settings,
} from "lucide-react";
import ConfigurationRulesTable from "./ConfigurationRulesTable";
import ConfigurationRuleModal from "./ConfigurationRuleModal";
import { queryKeys } from "@/services/QueryKeys";
import {
  getConfigurationRules,
  useConfigurationRulesMetadata,
} from "@/services/ConfigurationRulesService";
import {
  filterRules,
  hasRuleFilters,
  parseRuleFilters,
  RESOURCE_TYPE_PARAM,
  RULE_RESOURCE_TYPES,
  RULE_STATUSES,
  SEARCH_PARAM,
  STATUS_PARAM,
} from "@/lib/configurationRules/ruleFilters";
import { countEnabledUnknownRules } from "@/lib/configurationRules/ruleTypeSelection";
import { client } from "@skoruba/duende.identityserver.admin.api.client";

const ConfigurationRules: React.FC = () => {
  const { isOpen, closeModal, openModal } = useModal();
  const { t } = useTranslation();
  const [selectedRule, setSelectedRule] =
    useState<client.ConfigurationRuleDto | null>(null);

  const rules = useQuery({
    queryKey: [queryKeys.configurationRules],
    queryFn: () => getConfigurationRules(),
    placeholderData: (previousData) => previousData,
  });

  // The filters live in the URL (?search=pkce&resource=Client&status=enabled),
  // so a filtered list can be shared and survives a reload.
  const { data: metadata } = useConfigurationRulesMetadata();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseRuleFilters(searchParams), [searchParams]);
  const hasFilters = hasRuleFilters(filters);
  const allRules = rules.data?.rules;
  const visibleRules = useMemo(
    () =>
      filterRules(allRules ?? [], metadata, filters, (value) =>
        value ? t("Actions.Yes") : t("Actions.No"),
      ),
    [allRules, metadata, filters, t],
  );

  // Counted over every stored rule, whatever the filters hide
  const enabledUnknownRules = countEnabledUnknownRules(
    metadata,
    allRules ?? [],
  );

  const updateFilters = (update: (params: URLSearchParams) => void) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        update(next);
        return next;
      },
      { replace: true },
    );

  const setSearch = (value: string) =>
    updateFilters((params) => {
      if (value) {
        params.set(SEARCH_PARAM, value);
      } else {
        params.delete(SEARCH_PARAM);
      }
    });

  const toggleFilter = (name: string, value: string) =>
    updateFilters((params) => {
      const current = params.getAll(name);
      params.delete(name);
      const next = current.includes(value)
        ? current.filter((x) => x !== value)
        : [...current, value];
      next.forEach((x) => params.append(name, x));
    });

  const clearFilters = () =>
    updateFilters((params) => {
      params.delete(SEARCH_PARAM);
      params.delete(RESOURCE_TYPE_PARAM);
      params.delete(STATUS_PARAM);
    });

  const handleAddNew = () => {
    setSelectedRule(null);
    openModal();
  };

  const handleEdit = (rule: client.ConfigurationRuleDto) => {
    setSelectedRule(rule);
    openModal();
  };

  const headerActions = (
    <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-3 md:space-y-0">
      <Button onClick={handleAddNew}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {t("ConfigurationRules.AddNewRule")}
      </Button>

      <div className="relative w-full md:w-72">
        <Input
          type="text"
          placeholder={t("ConfigurationRules.SearchPlaceholder")}
          aria-label={t("ConfigurationRules.SearchPlaceholder")}
          className="pr-10"
          value={filters.search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );

  const filterGroup = <T extends string>(
    label: string,
    name: string,
    options: readonly T[],
    selected: readonly T[],
    optionLabel: (option: T) => string,
  ) => (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => (
          <Button
            key={option}
            type="button"
            size="sm"
            variant={selected.includes(option) ? "default" : "outline"}
            aria-pressed={selected.includes(option)}
            onClick={() => toggleFilter(name, option)}
          >
            {optionLabel(option)}
          </Button>
        ))}
      </div>
    </div>
  );

  const filterBar = (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      {filterGroup(
        t("ConfigurationRules.ResourceType"),
        RESOURCE_TYPE_PARAM,
        RULE_RESOURCE_TYPES,
        filters.resourceTypes,
        (type) => t(`ConfigurationRules.${type}`),
      )}
      {filterGroup(
        t("ConfigurationRules.Status"),
        STATUS_PARAM,
        RULE_STATUSES,
        filters.statuses,
        (status) =>
          status === "enabled"
            ? t("ConfigurationRules.Enabled")
            : t("ConfigurationRules.Disabled"),
      )}
      {hasFilters && (
        <Button type="button" variant="ghost" onClick={clearFilters}>
          <FilterX className="mr-2 h-4 w-4" />
          {t("ConfigurationRules.ClearFilters")}
        </Button>
      )}
      {(hasFilters || enabledUnknownRules > 0) && (
        <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 pb-2 text-sm text-muted-foreground">
          {enabledUnknownRules > 0 && (
            <span
              className="flex items-center gap-1.5"
              title={t("ConfigurationRules.UnknownRulesWarning", {
                count: enabledUnknownRules,
              })}
            >
              <AlertTriangle className="h-4 w-4 shrink-0 text-orange-500" />
              {t("ConfigurationRules.UnknownRulesNote", {
                count: enabledUnknownRules,
              })}
            </span>
          )}
          {hasFilters && (
            <span>
              {t("ConfigurationRules.ShowingResults", {
                count: visibleRules.length,
                total: allRules?.length ?? 0,
              })}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Page
      title={t("ConfigurationRules.PageTitle")}
      icon={Settings}
      accentKind="management"
      topSection={headerActions}
    >
      {rules.isLoading ? (
        <Loading fullscreen />
      ) : rules.data ? (
        <>
          <ConfigurationRulesTable
            visibleRules={visibleRules}
            filters={filterBar}
            onEdit={handleEdit}
            onRefresh={rules.refetch}
          />
          <ConfigurationRuleModal
            rule={selectedRule}
            existingRules={rules.data?.rules || []}
            isOpen={isOpen}
            onClose={closeModal}
            onSuccess={() => {
              closeModal();
              rules.refetch();
            }}
          />
        </>
      ) : null}
    </Page>
  );
};

export default ConfigurationRules;
