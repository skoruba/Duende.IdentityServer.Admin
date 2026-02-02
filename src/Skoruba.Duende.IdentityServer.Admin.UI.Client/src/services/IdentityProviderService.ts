import { useQuery, useMutation, useQueryClient } from "react-query";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import ApiHelper from "@/helpers/ApiHelper";
import {
  IdentityProviderData,
  IdentityProviderModel,
} from "@/models/IdentityProviders/IdentityProviderModel";
import { queryKeys } from "./QueryKeys";
import { IdentityProviderFormData } from "@/pages/IdentityProvider/Common/IdentityProviderSchema";

const getClient = () =>
  new client.IdentityProvidersClient(ApiHelper.getApiBaseUrl());

export const useIdentityProviders = (
  searchTerm: string = "",
  page: number = 0,
  pageSize: number = 10
) => {
  return useQuery(
    [queryKeys.identityProviders, searchTerm, page, pageSize],
    async () => {
      const client = getClient();
      const result = await client.get(searchTerm, page, pageSize);

      const items: IdentityProviderModel[] = (
        result.identityProviders ?? []
      ).map((provider) => ({
        ...provider,
        displayName: provider.displayName ?? "",
      }));

      const data: IdentityProviderData = {
        items,
        totalCount: result.totalCount ?? 0,
      };

      return data;
    }
  );
};

export const useCreateIdentityProvider = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (data: IdentityProviderFormData) => {
      const identityProvidersClient = getClient();
      return await identityProvidersClient.post(
        new client.IdentityProviderApiDto({
          ...data,
          type: data.type,
          identityProviderProperties: Object.fromEntries(
            data.properties.map((prop) => [prop.key, prop.value])
          ),
          displayName: data.displayName,
        })
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.identityProviders);
        queryClient.invalidateQueries(queryKeys.identityProvider);
      },
    }
  );
};

export const useUpdateIdentityProvider = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (data: IdentityProviderFormData) => {
      const identityProvidersClient = getClient();
      return await identityProvidersClient.put(
        new client.IdentityProviderApiDto({
          ...data,
          type: data.type,
          identityProviderProperties: Object.fromEntries(
            data.properties.map((prop) => [prop.key, prop.value])
          ),
          displayName: data.displayName,
        })
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.identityProviders);
        queryClient.invalidateQueries(queryKeys.identityProvider);
      },
    }
  );
};

export const useDeleteIdentityProvider = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (id: number) => {
      const identityProvidersClient = getClient();
      return await identityProvidersClient.delete(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.identityProviders);
      },
    }
  );
};

export const useIdentityProviderById = (id: number) => {
  return useQuery([queryKeys.identityProvider, id], async () => {
    const client = getClient();
    const result = await client.get2(id);

    const properties = Object.entries(
      result.identityProviderProperties ?? {}
    ).map(([key, value], index) => ({
      id: index,
      key,
      value: value as string,
    }));

    const formData: IdentityProviderFormData = {
      ...result,
      properties,
      displayName: result.displayName ?? "",
      type: result.type ?? "",
    };

    return formData;
  });
};
