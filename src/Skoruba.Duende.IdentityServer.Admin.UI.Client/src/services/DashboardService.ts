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

      return await configClient.get();
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

    return result.data.filter(
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
    { name: "Clients", total: dashboard.clientsTotal },
    { name: "Api Resources", total: dashboard.apiResourcesTotal },
    { name: "Api Scopes", total: dashboard.apiScopesTotal },
    { name: "Identity  Resources", total: dashboard.identityResourcesTotal },
  ];

  const auditLogsData =
    dashboard.auditLogsPerDaysTotal?.map((auditLog) => ({
      total: auditLog.total,
      average: dashboard.auditLogsAvg,
      created: auditLog.created,
    })) ?? [];

  return { identityServerDataChart, auditLogsData, identityServerData };
};
