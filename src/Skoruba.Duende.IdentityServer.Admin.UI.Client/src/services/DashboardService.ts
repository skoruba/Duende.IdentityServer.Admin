import { useMemo } from "react";
import ApiHelper from "@/helpers/ApiHelper";
import { DashboardIdentityServerResult } from "@/models/Dashboard/DashboardModels";
import {
  ApiResourceEditUrl,
  ApiScopeEditUrl,
  ClientEditUrl,
  IdentityResourceEditUrl,
} from "@/routing/Urls";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { useQuery } from "react-query";
import { queryKeys, queryWithoutCache } from "./QueryKeys";
import i18next from "@/i18n/config";

export const buildConfigurationIssueLink = (
  resourceId: string,
  resourceType: client.ConfigurationResourceType
): string => {
  switch (resourceType) {
    case client.ConfigurationResourceType.Client:
      return ClientEditUrl.replace(":clientId", resourceId);
    case client.ConfigurationResourceType.IdentityResource:
      return IdentityResourceEditUrl.replace(":resourceId", resourceId);
    case client.ConfigurationResourceType.ApiResource:
      return ApiResourceEditUrl.replace(":resourceId", resourceId);
    case client.ConfigurationResourceType.ApiScope:
      return ApiScopeEditUrl.replace(":scopeId", resourceId);
    default:
      return "";
  }
};

export const useConfigurationIssues = () =>
  useQuery(
    [queryKeys.configurationIssues],
    async () => {
      const configClient = new client.ConfigurationIssuesClient(
        ApiHelper.getApiBaseUrl()
      );

      // Use new API with filter parameters - skip pagination to get all results
      const result = await configClient.get(null, null, null, 0, 50, true);
      return result.issues || [];
    },
    queryWithoutCache
  );

export const getConfigurationIssues = () =>
  useQuery(
    queryKeys.configurationIssuesSummary,
    async () => {
      const configClient = new client.ConfigurationIssuesClient(
        ApiHelper.getApiBaseUrl()
      );
      return await configClient.getSummary();
    },
    queryWithoutCache
  );

export const useConfigurationIssuesForResource = (
  resourceId?: number,
  resourceType?: client.ConfigurationResourceType
) => {
  const result = useConfigurationIssues();

  const filtered = useMemo(() => {
    if (
      resourceId == null ||
      Number.isNaN(resourceId) ||
      resourceType == null ||
      result.data == null
    ) {
      return [];
    }

    return (result.data || []).filter(
      (issue) =>
        issue.resourceType === resourceType && issue.resourceId === resourceId
    );
  }, [result.data, resourceId, resourceType]);

  return {
    ...result,
    data: filtered,
  };
};

export const getDashboardIdentityServerData = async (
  auditLogsLastNumberOfDays: number
): Promise<DashboardIdentityServerResult> => {
  const dashboardClient = new client.DashboardClient(ApiHelper.getApiBaseUrl());

  const dashboard = await dashboardClient.getDashboardIdentityServer(
    auditLogsLastNumberOfDays
  );

  const identityServerData = {
    clientsTotal: dashboard.clientsTotal,
    apiResourcesTotal: dashboard.apiResourcesTotal,
    apiScopesTotal: dashboard.apiScopesTotal,
    identityResourcesTotal: dashboard.identityResourcesTotal,
    identityProvidersTotal: dashboard.identityProvidersTotal,
  };

  const identityServerDataChart = [
    { name: String(i18next.t("Home.Clients")), total: dashboard.clientsTotal },
    {
      name: String(i18next.t("Home.ApiResources")),
      total: dashboard.apiResourcesTotal,
    },
    { name: String(i18next.t("Home.ApiScopes")), total: dashboard.apiScopesTotal },
    {
      name: String(i18next.t("Home.IdentityResources")),
      total: dashboard.identityResourcesTotal,
    },
  ];

  const auditLogsData =
    dashboard.auditLogsPerDaysTotal?.map((auditLog) => ({
      total: auditLog.total,
      average: dashboard.auditLogsAvg,
      created: auditLog.created,
    })) ?? [];

  return { identityServerDataChart, auditLogsData, identityServerData };
};
