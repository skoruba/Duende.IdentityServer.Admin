import ApiHelper from "@/helpers/ApiHelper";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { ApiScopeData, ApiScopesData } from "@/models/ApiScopes/ApiScopeModels";
import { PropertyData, PropertiesData } from "@/models/Common/CommonModels";
import { ApiScopeFormData } from "@/pages/ApiScope/Common/ApiScopeSchema";

export const getApiScopes = async (
  searchTerm: string,
  pageIndex: number,
  pageSize: number
): Promise<ApiScopesData> => {
  const apiScopesClient = new client.ApiScopesClient(ApiHelper.getApiBaseUrl());
  const response = await apiScopesClient.getScopes(
    searchTerm,
    pageIndex + 1,
    pageSize
  );

  const items: ApiScopeData[] =
    response.scopes?.map((scope) => ({
      id: scope.id,
      name: scope.name ?? "",
      displayName: scope.displayName ?? "",
      description: scope.description ?? "",
      enabled: scope.enabled ?? true,
      showInDiscoveryDocument: scope.showInDiscoveryDocument ?? true,
      required: scope.required ?? false,
      emphasize: scope.emphasize ?? false,
      userClaims: scope.userClaims ?? [],
    })) ?? [];

  return { items, totalCount: response.totalCount };
};

export const getApiScope = async (id: number): Promise<ApiScopeFormData> => {
  const apiScopesClient = new client.ApiScopesClient(ApiHelper.getApiBaseUrl());
  const response = await apiScopesClient.getScope(id);

  return {
    name: response.name ?? "",
    displayName: response.displayName ?? "",
    description: response.description ?? "",
    enabled: response.enabled ?? true,
    showInDiscoveryDocument: response.showInDiscoveryDocument ?? true,
    required: response.required ?? false,
    emphasize: response.emphasize ?? false,
    userClaims:
      response.userClaims?.map((claim) => ({
        id: claim,
        label: claim,
      })) ?? [],
  };
};

export const createApiScope = async (scope: ApiScopeFormData) => {
  const apiScopesClient = new client.ApiScopesClient(ApiHelper.getApiBaseUrl());

  const dto = new client.ApiScopeApiDto({
    ...scope,
    id: 0,
    apiScopeProperties: undefined,
    displayName: scope.displayName!,
    description: scope.description!,
    userClaims: scope.userClaims?.map((claim) => claim.id) ?? [],
  });

  await apiScopesClient.postScope(dto);
};

export const updateApiScope = async (id: number, scope: ApiScopeFormData) => {
  const apiScopesClient = new client.ApiScopesClient(ApiHelper.getApiBaseUrl());

  const dto = new client.ApiScopeApiDto({
    ...scope,
    id,
    apiScopeProperties: undefined,
    displayName: scope.displayName!,
    description: scope.description!,
    userClaims: scope.userClaims?.map((claim) => claim.id) ?? [],
  });

  await apiScopesClient.putScope(dto);
};

export const deleteApiScope = async (id: number): Promise<void> => {
  const apiScopesClient = new client.ApiScopesClient(ApiHelper.getApiBaseUrl());
  await apiScopesClient.deleteScope(id);
};

export const getApiScopeProperties = async (
  scopeId: number,
  pageIndex: number,
  pageSize: number
): Promise<PropertiesData> => {
  const apiScopesClient = new client.ApiScopesClient(ApiHelper.getApiBaseUrl());
  const response = await apiScopesClient.getScopeProperties(
    scopeId,
    pageIndex + 1,
    pageSize
  );

  const properties: PropertyData[] =
    response.apiScopeProperties?.map((prop) => ({
      id: prop.id,
      key: prop.key!,
      value: prop.value!,
    })) ?? [];

  return { items: properties, totalCount: response.totalCount };
};

export const addApiScopeProperty = async (
  scopeId: number,
  data: { key: string; value: string }
) => {
  const apiScopesClient = new client.ApiScopesClient(ApiHelper.getApiBaseUrl());

  const dto = new client.ApiScopePropertyApiDto({
    key: data.key,
    value: data.value,
    id: 0,
  });

  await apiScopesClient.postProperty(scopeId, dto);
};

export const deleteApiScopeProperty = async (propertyId: number) => {
  const apiScopesClient = new client.ApiScopesClient(ApiHelper.getApiBaseUrl());
  await apiScopesClient.deleteProperty(propertyId);
};
