import { SecretsFormData } from "@/components/SecretForm/SecretForm";
import ApiHelper from "@/helpers/ApiHelper";
import {
  ApiResourceData,
  ApiResourcesData,
  ApiResourceSecretData,
  ApiResourceSecretsData,
} from "@/models/ApiResources/ApiResourceModels";
import { PropertiesData, PropertyData } from "@/models/Common/CommonModels";
import {
  ApiResourceFormData,
  mapApiResourceToFormData,
  mapFormDataToApiResource,
} from "@/pages/ApiResource/Common/ApiResourceSchema";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { useQuery } from "react-query";
import { queryKeys } from "./QueryKeys";

export const getApiResources = async (
  searchTerms: string,
  pageIndex: number,
  pageSize: number
): Promise<ApiResourcesData> => {
  const apiResourceClient = new client.ApiResourcesClient(
    ApiHelper.getApiBaseUrl()
  );

  const apiResources = await apiResourceClient.get(
    searchTerms,
    pageIndex + 1,
    pageSize
  );

  const items =
    apiResources.apiResources?.map(
      (apiResource): ApiResourceData => ({
        id: apiResource.id,
        apiResourceName: apiResource.name,
      })
    ) ?? [];

  return { items, totalCount: apiResources.totalCount };
};

export const deleteApiResource = async (id: number): Promise<void> => {
  const apiResourcesClient = new client.ApiResourcesClient(
    ApiHelper.getApiBaseUrl()
  );
  await apiResourcesClient.delete(id);
};

export const getApiResourceSecrets = async (
  apiResourceId: number,
  pageIndex: number,
  pageSize: number
): Promise<ApiResourceSecretsData> => {
  const apiResourcesClient = new client.ApiResourcesClient(
    ApiHelper.getApiBaseUrl()
  );

  const secrets = await apiResourcesClient.getSecrets(
    apiResourceId,
    pageIndex + 1,
    pageSize
  );

  const secretsData: ApiResourceSecretData[] =
    secrets.apiSecrets?.map((secret) => ({
      created: secret.created!,
      description: secret.description!,
      expiration: secret.expiration,
      id: secret.id,
      type: secret.type!,
    })) ?? [];

  return { items: secretsData, totalCount: secrets.totalCount };
};

export const addApiResourceSecret = async (
  apiResourceId: number,
  secret: SecretsFormData
) => {
  await createApiResourceSecret(apiResourceId, {
    description: secret.secretDescription,
    expiration: secret.expiration === null ? undefined : secret.expiration,
    type: secret.secretType,
    value: secret.secretValue,
    id: 0,
    hashType: secret.secretHashType,
    created: new Date(),
  });
};

export const createApiResourceSecret = async (
  apiResourceId: number,
  apiResourceSecret: client.IApiSecretApiDto
): Promise<void> => {
  const apiResourcesClient = new client.ApiResourcesClient(
    ApiHelper.getApiBaseUrl()
  );
  await apiResourcesClient.postSecret(
    apiResourceId,
    new client.ApiSecretApiDto(apiResourceSecret)
  );
};

export const useApiResource = (id: number) => {
  return useQuery([queryKeys.apiResource, id], () => getApiResource(id));
};

export const getApiResource = async (
  id: number
): Promise<ApiResourceFormData> => {
  const apiResourcesClient = new client.ApiResourcesClient(
    ApiHelper.getApiBaseUrl()
  );

  const apiResource = await apiResourcesClient.get2(id);

  return mapApiResourceToFormData(apiResource);
};

export const createApiResource = async (apiResource: ApiResourceFormData) => {
  const apiResourcesClient = new client.ApiResourcesClient(
    ApiHelper.getApiBaseUrl()
  );

  const apiResourceData = mapFormDataToApiResource(0, apiResource);

  await apiResourcesClient.post(
    new client.ApiResourceApiDto({
      ...apiResourceData,
      id: 0,
    })
  );
};

export const updateApiResource = async (
  id: number,
  apiResource: ApiResourceFormData
) => {
  const apiResourcesClient = new client.ApiResourcesClient(
    ApiHelper.getApiBaseUrl()
  );

  const apiResourceData = mapFormDataToApiResource(id, apiResource);

  await apiResourcesClient.put(
    new client.ApiResourceApiDto({
      ...apiResourceData,
      id,
    })
  );
};

export const deleteApiResourceSecret = async (secretId: number) => {
  const apiResourcesClient = new client.ApiResourcesClient(
    ApiHelper.getApiBaseUrl()
  );

  await apiResourcesClient.deleteSecret(secretId);
};

export const getApiResourceProperties = async (
  resourceId: number,
  pageIndex: number,
  pageSize: number
): Promise<PropertiesData> => {
  const apiResourcesClient = new client.ApiResourcesClient(
    ApiHelper.getApiBaseUrl()
  );

  const properties = await apiResourcesClient.getProperties(
    resourceId,
    pageIndex + 1,
    pageSize
  );

  const propertiesData: PropertyData[] =
    properties.apiResourceProperties?.map((property) => ({
      id: property.id,
      key: property.key!,
      value: property.value!,
    })) ?? [];

  return { items: propertiesData, totalCount: properties.totalCount };
};

export const addApiResourceProperty = async (
  resourceId: number,
  data: { key: string; value: string }
) => {
  const apiResourcesClient = new client.ApiResourcesClient(
    ApiHelper.getApiBaseUrl()
  );

  await apiResourcesClient.postProperty(
    resourceId,
    new client.ApiResourcePropertyApiDto({
      key: data.key,
      value: data.value,
      id: 0,
    })
  );
};

export const deleteApiResourceProperty = async (id: number) => {
  const apiResourcesClient = new client.ApiResourcesClient(
    ApiHelper.getApiBaseUrl()
  );

  await apiResourcesClient.deleteProperty(id);
};
