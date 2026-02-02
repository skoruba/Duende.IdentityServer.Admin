import { useQuery, UseQueryOptions } from "react-query";
import { queryKeys } from "./QueryKeys";
import ApiHelper from "@/helpers/ApiHelper";
import { client } from "@skoruba/duende.identityserver.admin.api.client";

type ApplicationInfo = {
  applicationName: string;
  applicationVersion: string;
};

export const useApplicationInformation = (
  options?: UseQueryOptions<ApplicationInfo>
) =>
  useQuery<ApplicationInfo>(
    [queryKeys.applicationInfo],
    async () => {
      const configClient = new client.InfoClient(ApiHelper.getApiBaseUrl());

      const applicationName = await configClient.getApplicationName();
      const applicationVersion = await configClient.getApplicationVersion();

      return {
        applicationName,
        applicationVersion,
      };
    },
    options
  );
