import ApiHelper from "@/helpers/ApiHelper";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import {
  IdentityResourceFormData,
  mapFormDataToIdentityResource,
  mapIdentityResourceToFormData,
} from "@/pages/IdentityResource/Common/IdentityResourceSchema";
import {
  IdentityResourceData,
  IdentityResourcesData,
} from "@/models/IdentityResources/IdentityResourceModels";
import { PropertiesData, PropertyData } from "@/models/Common/CommonModels";

export const getIdentityResources = async (
  searchTerm: string,
  pageIndex: number,
  pageSize: number
): Promise<IdentityResourcesData> => {
  const api = new client.IdentityResourcesClient(ApiHelper.getApiBaseUrl());
  const response = await api.get(searchTerm, pageIndex + 1, pageSize);

  const items: IdentityResourceData[] =
    response.identityResources?.map((x) => ({
      id: x.id,
      name: x.name ?? "",
    })) ?? [];

  return { items, totalCount: response.totalCount };
};

export const getIdentityResource = async (
  id: number
): Promise<IdentityResourceFormData> => {
  const api = new client.IdentityResourcesClient(ApiHelper.getApiBaseUrl());
  const dto = await api.get2(id);
  return mapIdentityResourceToFormData(dto);
};

export const createIdentityResource = async (
  resource: IdentityResourceFormData
): Promise<void> => {
  const api = new client.IdentityResourcesClient(ApiHelper.getApiBaseUrl());
  const dto = mapFormDataToIdentityResource(0, resource);
  await api.post(new client.IdentityResourceApiDto({ ...dto, id: 0 }));
};

export const updateIdentityResource = async (
  id: number,
  resource: IdentityResourceFormData
): Promise<void> => {
  const api = new client.IdentityResourcesClient(ApiHelper.getApiBaseUrl());
  const dto = mapFormDataToIdentityResource(id, resource);
  await api.put(new client.IdentityResourceApiDto(dto));
};

export const deleteIdentityResource = async (id: number): Promise<void> => {
  const api = new client.IdentityResourcesClient(ApiHelper.getApiBaseUrl());
  await api.delete(id);
};

export const getIdentityResourceProperties = async (
  id: number,
  pageIndex: number,
  pageSize: number
): Promise<PropertiesData> => {
  const api = new client.IdentityResourcesClient(ApiHelper.getApiBaseUrl());
  const result = await api.getProperties(id, pageIndex + 1, pageSize);

  const items: PropertyData[] =
    result.identityResourceProperties?.map((p) => ({
      id: p.id,
      key: p.key!,
      value: p.value!,
    })) ?? [];

  return {
    items,
    totalCount: result.totalCount,
  };
};

export const addIdentityResourceProperty = async (
  id: number,
  data: { key: string; value: string }
): Promise<void> => {
  const api = new client.IdentityResourcesClient(ApiHelper.getApiBaseUrl());
  await api.postProperty(
    id,
    new client.IdentityResourcePropertyApiDto({
      id: 0,
      key: data.key,
      value: data.value,
    })
  );
};

export const deleteIdentityResourceProperty = async (
  propertyId: number
): Promise<void> => {
  const api = new client.IdentityResourcesClient(ApiHelper.getApiBaseUrl());
  await api.deleteProperty(propertyId);
};
