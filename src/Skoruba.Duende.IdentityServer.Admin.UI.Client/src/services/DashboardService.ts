import { useMemo } from "react";
import ApiHelper from "@/helpers/ApiHelper";
import {
  DashBoardIdentityData,
  DashboardDataAuditLog,
  DashboardIdentityServerData,
} from "@/models/Dashboard/DashboardModels";
import { KeyApiDto } from "@/models/Keys/KeysModel";
import { mapAuditLog } from "./AuditLogsService";
import {
  ApiResourceEditUrl,
  ApiScopeEditUrl,
  ClientEditUrl,
  IdentityResourceEditUrl,
} from "@/routing/Urls";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys, queryWithoutCache } from "./QueryKeys";
import { summarizeIssues } from "@/lib/configurationIssues/issueInsights";

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

// The endpoint runs every enabled configuration rule against the whole
// configuration (all clients with their relations), so the result is cached
// instead of being recomputed on every mount and window focus. It cannot go
// silently stale: every successful mutation invalidates the query
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

const configurationIssuesQuery = {
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
};

export const useConfigurationIssues = (
  options: ConfigurationIssuesQueryOptions = {},
) =>
  useQuery({
    ...configurationIssuesQuery,
    ...options,
  });

/**
 * The severity counts, taken from the issue list instead of the GetSummary
 * endpoint. Both run the full validation on the server, and the list is needed
 * on the dashboard and the detail pages anyway - sharing one query halves the work.
 */
export const useConfigurationIssuesSummary = (
  options: ConfigurationIssuesQueryOptions = {},
) =>
  useQuery({
    ...configurationIssuesQuery,
    select: summarizeIssues,
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

// The counters only: 0 days leaves the audit log statistics out of the response,
// so the counters never wait for the audit log, the largest table of the system.
// The statistics have their own query (useDashboardAuditLogStatistics) and card.
export const getDashboardIdentityServerData = async (): Promise<DashboardIdentityServerData> => {
  const dashboardClient = new client.DashboardClient(ApiHelper.getApiBaseUrl());

  const dashboard = await dashboardClient.getDashboardIdentityServer(0);

  return {
    clientsTotal: dashboard.clientsTotal,
    apiResourcesTotal: dashboard.apiResourcesTotal,
    apiScopesTotal: dashboard.apiScopesTotal,
    identityResourcesTotal: dashboard.identityResourcesTotal,
    identityProvidersTotal: dashboard.identityProvidersTotal,
  };
};

export const DASHBOARD_AUDIT_LOG_DAYS = 30;
const DASHBOARD_KEYS_PAGE_SIZE = 50;

export const useDashboardIdentityServer = () =>
  useQuery({
    queryKey: [queryKeys.dashboard],
    queryFn: getDashboardIdentityServerData,
    ...queryWithoutCache,
  });

export const getDashboardAuditLogStatistics = async (
  lastNumberOfDays: number,
): Promise<DashboardDataAuditLog[]> => {
  const dashboardClient = new client.DashboardClient(ApiHelper.getApiBaseUrl());

  const statistics =
    await dashboardClient.getDashboardAuditLogStatistics(lastNumberOfDays);

  return (statistics.auditLogsPerDaysTotal ?? []).map((day) => ({
    total: day.total,
    average: statistics.auditLogsAvg,
    created: day.created,
  }));
};

// Not retried: the statistics fail when the audit log query runs into the SQL
// command timeout, and three retries at 30 seconds each kept the card loading
// for minutes. The card reports the failure and the next mount asks again.
export const useDashboardAuditLogStatistics = () =>
  useQuery({
    queryKey: [queryKeys.dashboardAuditLogStatistics, DASHBOARD_AUDIT_LOG_DAYS],
    queryFn: () => getDashboardAuditLogStatistics(DASHBOARD_AUDIT_LOG_DAYS),
    retry: false,
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

// Dashboard/GetRecentAuditChanges leaves the read events out on the server, in one
// bounded query. Filtering on the client meant one request (and one COUNT over the
// whole audit log) per change verb.
export const useRecentAuditChanges = (count: number) =>
  useQuery({
    queryKey: [queryKeys.dashboardRecentAuditLogs, count],
    queryFn: async () => {
      const dashboardClient = new client.DashboardClient(
        ApiHelper.getApiBaseUrl(),
      );

      return (await dashboardClient.getRecentAuditChanges(count)).map(
        mapAuditLog,
      );
    },
    ...queryWithoutCache,
  });
