import { useMemo } from "react";
import ApiHelper from "@/helpers/ApiHelper";
import {
  DashBoardIdentityData,
  DashboardIdentityServerResult,
} from "@/models/Dashboard/DashboardModels";
import { KeyApiDto } from "@/models/Keys/KeysModel";
import { getAuditLogs } from "./AuditLogsService";
import {
  ApiResourceEditUrl,
  ApiScopeEditUrl,
  ClientEditUrl,
  IdentityResourceEditUrl,
} from "@/routing/Urls";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys, queryWithoutCache } from "./QueryKeys";

export const buildConfigurationIssueLink = (
  resourceId: string,
  resourceType: client.ConfigurationResourceType,
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

// Both endpoints run every enabled configuration rule against the whole
// configuration (all clients with their relations), so the result is cached
// instead of being recomputed on every mount and window focus. It cannot go
// silently stale: every successful mutation invalidates these queries
// (see the MutationCache in helpers/ErrorHelper.ts).
const configurationIssuesQueryOptions = {
  staleTime: 2 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  refetchOnWindowFocus: false,
} as const;

type ConfigurationIssuesQueryOptions = {
  /** The header renders before ProtectedRoute: never query until authenticated. */
  enabled?: boolean;
  /** "always" for the page whose whole purpose is showing the current issues. */
  refetchOnMount?: boolean | "always";
};

export const useConfigurationIssues = (
  options: ConfigurationIssuesQueryOptions = {},
) =>
  useQuery({
    queryKey: [queryKeys.configurationIssues],
    queryFn: async () => {
      const configClient = new client.ConfigurationIssuesClient(
        ApiHelper.getApiBaseUrl(),
      );

      // Use new API with filter parameters - skip pagination to get all results
      const result = await configClient.get(null, null, null, 0, 50, true);
      return result.issues || [];
    },
    ...configurationIssuesQueryOptions,
    ...options,
  });

export const useConfigurationIssuesSummary = (
  options: ConfigurationIssuesQueryOptions = {},
) =>
  useQuery({
    queryKey: [queryKeys.configurationIssuesSummary],
    queryFn: async () => {
      const configClient = new client.ConfigurationIssuesClient(
        ApiHelper.getApiBaseUrl(),
      );
      return await configClient.getSummary();
    },
    ...configurationIssuesQueryOptions,
    ...options,
  });

export const useConfigurationIssuesForResource = (
  resourceId?: number,
  resourceType?: client.ConfigurationResourceType,
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
        issue.resourceType === resourceType && issue.resourceId === resourceId,
    );
  }, [result.data, resourceId, resourceType]);

  return {
    ...result,
    data: filtered,
  };
};

export const getDashboardIdentityServerData = async (
  auditLogsLastNumberOfDays: number,
): Promise<DashboardIdentityServerResult> => {
  const dashboardClient = new client.DashboardClient(ApiHelper.getApiBaseUrl());

  const dashboard = await dashboardClient.getDashboardIdentityServer(
    auditLogsLastNumberOfDays,
  );

  const identityServerData = {
    clientsTotal: dashboard.clientsTotal,
    apiResourcesTotal: dashboard.apiResourcesTotal,
    apiScopesTotal: dashboard.apiScopesTotal,
    identityResourcesTotal: dashboard.identityResourcesTotal,
    identityProvidersTotal: dashboard.identityProvidersTotal,
  };

  const auditLogsData =
    dashboard.auditLogsPerDaysTotal?.map((auditLog) => ({
      total: auditLog.total,
      average: dashboard.auditLogsAvg,
      created: auditLog.created,
    })) ?? [];

  return { auditLogsData, identityServerData };
};

export const DASHBOARD_AUDIT_LOG_DAYS = 30;
const DASHBOARD_KEYS_PAGE_SIZE = 50;

export const useDashboardIdentityServer = () =>
  useQuery({
    queryKey: [queryKeys.dashboard],
    queryFn: () => getDashboardIdentityServerData(DASHBOARD_AUDIT_LOG_DAYS),
    ...queryWithoutCache,
  });

export const useDashboardIdentity = () =>
  useQuery({
    queryKey: [queryKeys.dashboardIdentity],
    queryFn: async (): Promise<DashBoardIdentityData> => {
      const dashboardClient = new client.DashboardClient(
        ApiHelper.getApiBaseUrl(),
      );
      const identity = await dashboardClient.getDashboardIdentity();

      return {
        usersTotal: identity.usersTotal,
        rolesTotal: identity.rolesTotal,
      };
    },
    ...queryWithoutCache,
  });

// The keys endpoint pages by id, so the newest keys are picked on the client.
export const useDashboardKeys = () =>
  useQuery({
    queryKey: [queryKeys.dashboardKeys],
    queryFn: async () => {
      const keysClient = new client.KeysClient(ApiHelper.getApiBaseUrl());
      const result = await keysClient.get(1, DASHBOARD_KEYS_PAGE_SIZE);

      const keys = [...(result.keys ?? [])]
        .map(
          (key): KeyApiDto => ({
            id: key.id ?? "",
            version: key.version,
            created: new Date(key.created),
            use: key.use ?? "",
            algorithm: key.algorithm ?? "",
            isX509Certificate: key.isX509Certificate,
          }),
        )
        .sort((a, b) => b.created.getTime() - a.created.getTime());

      return { keys, totalCount: result.totalCount };
    },
    ...queryWithoutCache,
  });

// Every audit event name ends with one of these verbs or with "Requested".
// Read events vastly outnumber changes (the dashboard itself produces them),
// so changes are queried per verb instead of being filtered out of one page.
const AUDIT_CHANGE_VERBS = [
  "Added",
  "Updated",
  "Deleted",
  "Saved",
  "Changed",
  "Cloned",
];

export const useRecentAuditChanges = (count: number) =>
  useQuery({
    queryKey: [queryKeys.dashboardRecentAuditLogs, count],
    queryFn: async () => {
      const pages = await Promise.all(
        AUDIT_CHANGE_VERBS.map((verb) =>
          getAuditLogs({ event: `${verb}Event` }, 0, count),
        ),
      );

      return pages
        .flatMap((page) => page.items)
        .sort(
          (a, b) =>
            new Date(b.created).getTime() - new Date(a.created).getTime(),
        )
        .slice(0, count);
    },
    ...queryWithoutCache,
  });
