import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./QueryKeys";
import ApiHelper from "@/helpers/ApiHelper";
import { client } from "@skoruba/duende.identityserver.admin.api.client";

export const useApplicationInformation = (options?: {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}) =>
  useQuery({
    queryKey: [queryKeys.applicationInfo],
    queryFn: async () => {
      const configClient = new client.InfoClient(ApiHelper.getApiBaseUrl());

      const applicationName = await configClient.getApplicationName();
      const applicationVersion = await configClient.getApplicationVersion();

      return {
        applicationName,
        applicationVersion,
      };
    },
    ...options,
  });

// A failed request resolves to null instead of throwing: query errors raise the
// global error toast, and the badge is optional chrome - it simply stays hidden
// (e.g. against a backend that does not have the endpoint yet).
export const useEnvironmentInfo = () =>
  useQuery({
    queryKey: [queryKeys.environmentInfo],
    queryFn: async (): Promise<client.EnvironmentInfoApiDto | null> => {
      try {
        const environment = await new client.InfoClient(
          ApiHelper.getApiBaseUrl(),
        ).getEnvironment();

        return environment.environmentName ? environment : null;
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: Infinity,
  });

const HEALTH_REFETCH_MS = 60_000;

// Info/GetHealth always answers 200 with the status in the body (unlike /health,
// which answers 503), so an unhealthy system is data, not a failed request.
// A request that does fail resolves to null: this query polls every minute and a
// thrown error would raise the global error toast every minute.
export const useSystemHealth = () =>
  useQuery({
    queryKey: [queryKeys.systemHealth],
    queryFn: async (): Promise<client.SystemHealthApiDto | null> => {
      try {
        return await new client.InfoClient(ApiHelper.getApiBaseUrl()).getHealth();
      } catch {
        return null;
      }
    },
    retry: false,
    refetchInterval: HEALTH_REFETCH_MS,
    staleTime: HEALTH_REFETCH_MS,
  });
