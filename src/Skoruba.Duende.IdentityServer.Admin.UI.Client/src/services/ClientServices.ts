import ApiHelper from "@/helpers/ApiHelper";
import {
  ClientData,
  ClientsData,
  ClientScope,
  GrantType,
  SelectItem,
  ClientSecretData,
  ClientSecretsData,
} from "@/models/Clients/ClientModels";
import { SecretsFormData } from "@/components/SecretForm/SecretForm";
import { client } from "@skoruba/duende.identityserver.admin.api.client";
import { ClientApiDto } from "@skoruba/duende.identityserver.admin.api.client/dist/types/client";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { INT_MAX } from "@/helpers/NumberHelper";
import { queryKeys, queryWithoutCache } from "./QueryKeys";
import { getNowForUnspecifiedDb } from "@/helpers/DateTimeHelper";

export const getClients = async (
  searchTerms: string,
  pageIndex: number,
  pageSize: number
): Promise<ClientsData> => {
  const clientsClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());

  const clients = await clientsClient.get(searchTerms, pageIndex + 1, pageSize);

  const items =
    clients.clients?.map(
      (client): ClientData => ({
        id: client.id,
        clientId: client.clientId!,
        clientName: client.clientName!,
        clientProperties: client.properties?.map((property) => ({
          key: property.key!,
          value: property.value!,
        })),
      })
    ) ?? [];

  return { items, totalCount: clients.totalCount };
};

export const getClientSecrets = async (
  clientId: number,
  pageIndex: number,
  pageSize: number
): Promise<ClientSecretsData> => {
  const clientClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());

  const secrets = await clientClient.getSecrets(
    clientId,
    pageIndex + 1,
    pageSize
  );

  const secretsData: ClientSecretData[] =
    secrets.clientSecrets?.map((secret) => ({
      created: secret.created!,
      description: secret.description!,
      expiration: secret.expiration,
      id: secret.id,
      type: secret.type!,
    })) ?? [];

  return { items: secretsData, totalCount: secrets.totalCount };
};

export const deleteClientSecret = async (secretId: number) => {
  const clientClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());

  await clientClient.deleteSecret(secretId);
};

export const getClientScopes = async (
  excludeIdentityResources: boolean,
  excludeApiScopes: boolean
): Promise<ClientScope[]> => {
  const clientClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());

  const scopes = await clientClient.getScopes(
    undefined,
    undefined,
    excludeIdentityResources,
    excludeApiScopes
  );

  const items = scopes.map((scope) => ({ id: scope, label: scope }));

  return items;
};

export const getGrantTypes = async (): Promise<GrantType[]> => {
  const clientClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());

  const grantTypes = await clientClient.getGrantTypes(null, false, undefined);

  const items = grantTypes.map((type) => ({ id: type.id!, label: type.text! }));

  return items;
};

export const getSigningAlgorithms = async (): Promise<SelectItem[]> => {
  const clientClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());
  const algorithms = await clientClient.getSigningAlgorithms(null, undefined);
  return algorithms.map((x) => ({ value: x, label: x }));
};

export const useSigningAlgorithms = () => {
  return useQuery(queryKeys.signingAlgorithms, getSigningAlgorithms);
};

export const useClient = (clientId: number) => {
  return useQuery([queryKeys.client, clientId], () =>
    getClient(Number(clientId!))
  );
};

export const getClient = async (
  clientId: number
): Promise<client.ClientApiDto> => {
  const clientClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());

  return await clientClient.get2(clientId);
};

export const getStandardClaims = async (): Promise<string[]> => {
  const clientClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());

  return await clientClient.getStandardClaims(undefined, INT_MAX);
};

export const updateClient = async (
  clientToUpdate: client.IClientApiDto
): Promise<void> => {
  const clientClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());

  await clientClient.put(new client.ClientApiDto(clientToUpdate));
};

export const cloneClient = async (
  clientToClone: client.IClientCloneApiDto
): Promise<void> => {
  const clientClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());

  await clientClient.postClientClone(
    new client.ClientCloneApiDto(clientToClone)
  );
};

const fetchAccessTokenTypes = async (): Promise<SelectItem[]> => {
  const clientClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());

  const data = await clientClient.getAccessTokenTypes();

  return data.map((x) => ({ value: x.id!, label: x.text! }));
};

const fetchRefreshTokenUsages = async (): Promise<SelectItem[]> => {
  const clientClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());
  const data = await clientClient.getTokenUsage();

  return data.map((x) => ({ value: x.id!, label: x.text! }));
};

const fetchRefreshTokenExpirations = async (): Promise<SelectItem[]> => {
  const clientClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());
  const data = await clientClient.getTokenExpirations();

  return data.map((x) => ({ value: x.id!, label: x.text! }));
};

const fetchDPoPValidationModes = async (): Promise<SelectItem[]> => {
  const clientClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());
  const data = await clientClient.getDPoPValidationModes();

  return data.map((x) => ({ value: x.id!, label: x.text! }));
};

const fetchSecretTypes = async (): Promise<SelectItem[]> => {
  const clientClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());
  const data = await clientClient.getSecretTypes();

  return data.map((x) => ({ value: x.id!, label: x.text! }));
};

export const useClientScopes = (
  excludeIdentityResources: boolean,
  excludeApiScopes: boolean
) => {
  return useQuery(
    [queryKeys.clientScopes, excludeIdentityResources, excludeApiScopes],
    () => getClientScopes(excludeIdentityResources, excludeApiScopes),
    queryWithoutCache
  );
};

export const useGrantTypes = () => {
  return useQuery(queryKeys.grantTypes, getGrantTypes);
};

export const useStandardClaims = () => {
  return useQuery(queryKeys.standardClaims, getStandardClaims);
};

export const useAccessTokenTypes = () => {
  return useQuery(queryKeys.accessTokenTypes, fetchAccessTokenTypes);
};

export const useRefreshTokenUsages = () => {
  return useQuery(queryKeys.refreshTokenUsages, fetchRefreshTokenUsages);
};

export const useRefreshTokenExpirations = () => {
  return useQuery(
    queryKeys.refreshTokenExpirations,
    fetchRefreshTokenExpirations
  );
};

export const useDPoPValidationModes = () => {
  return useQuery(queryKeys.dpopValidationModes, fetchDPoPValidationModes);
};

export const useSecretTypes = () => {
  return useQuery(queryKeys.secretTypes, fetchSecretTypes);
};

export const createClient = async (
  clientToAdd: client.IClientApiDto
): Promise<client.IClientApiDto> => {
  const clientClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());
  return (await clientClient.post(
    new client.ClientApiDto(clientToAdd)
  )) as any as ClientApiDto;
};

export const addClientSecret = async (
  clientId: number,
  secret: SecretsFormData
) => {
  await createClientSecret(clientId, {
    description: secret.secretDescription,
    expiration: secret.expiration === null ? undefined : secret.expiration,
    type: secret.secretType,
    value: secret.secretValue,
    id: 0,
    hashType: secret.secretHashType,
    created: getNowForUnspecifiedDb(),
  });
};

export const createClientSecret = async (
  clientId: number,
  clientSecret: client.IClientSecretApiDto
): Promise<void> => {
  const clientClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());
  await clientClient.postSecret(
    clientId,
    new client.ClientSecretApiDto(clientSecret)
  );
};

type CreateClientVariables = {
  clientData: client.IClientApiDto;
  secret?: client.IClientSecretApiDto;
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (variables: CreateClientVariables) => {
      const { clientData, secret } = variables;
      const createdClient = await createClient(clientData);

      if (secret) {
        createClientSecret(createdClient.id, secret);
      }

      return createdClient;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(queryKeys.clients);
        queryClient.invalidateQueries(queryKeys.configurationIssues);
        queryClient.invalidateQueries(queryKeys.configurationIssuesSummary);
      },
    }
  );
};

export const deleteClient = async (id: number): Promise<void> => {
  const clientClient = new client.ClientsClient(ApiHelper.getApiBaseUrl());
  await clientClient.delete(id);
};
