export interface ClientData {
  id: number;
  clientId: string;
  clientName: string;
  clientProperties?: ClientProperty[];
}
export interface ClientsData {
  totalCount: number;
  items: ClientData[];
}

export type ClientProperty = {
  key: string;
  value: string;
};

export type ClientScope = {
  id: string;
  label: string;
};

export type GrantType = {
  id: string;
  label: string;
};

export enum ClientType {
  Confidential = "Confidential",
  Public = "Public",
  Machine = "Machine",
  HighSecure = "HighSecure",
}

export const ClientTypeKey = "skoruba_client_type";
export const ClientTypeLabelPrefix = "Skoruba";

export const ClientTypeLabel = {
  [ClientType.Confidential]: `${ClientTypeLabelPrefix}_Confidential`,
  [ClientType.Public]: `${ClientTypeLabelPrefix}_Public`,
  [ClientType.Machine]: `${ClientTypeLabelPrefix}_Machine`,
  [ClientType.HighSecure]: `${ClientTypeLabelPrefix}_HighSecure`,
};

export enum ClientStepType {
  Basics = 1,
  Uris = 2,
  Scopes = 3,
  Secrets = 4,
  Review = 5,
}

export type ClientWizardExcludeOptions = {
  consent?: boolean;
  identityResources?: boolean;
  uris?: boolean;
  secrets?: boolean;
};

export type ClientWizardAdditionData = {
  grantTypes: string[];
};

export type ClientStep = {
  stepType: ClientStepType;
  component: React.ReactNode;
};

export type ClientWizardConfig = {
  type: ClientType;
  steps: ClientStep[];
};

/** Grant type ids as returned by the API - see ClientConsts.GetGrantTypes(). */
export const GrantTypeIds = {
  AuthorizationCode: "authorization_code",
  Implicit: "implicit",
  ClientCredentials: "client_credentials",
  Hybrid: "hybrid",
  Password: "password",
  DeviceCode: "urn:ietf:params:oauth:grant-type:device_code",
  Delegation: "delegation",
  Ciba: "urn:openid:params:grant-type:ciba",
} as const;

/**
 * Grant types that are still offered so an existing client can keep them, but
 * are marked as deprecated - the ones OAuth 2.1 leaves out. The same two are
 * flagged in ClientConsts.GetGrantTypes().
 */
export const DEPRECATED_GRANT_TYPE_IDS: readonly string[] = [
  GrantTypeIds.Implicit,
  GrantTypeIds.Password,
];

export const isDeprecatedGrantType = (grantTypeId: string): boolean =>
  DEPRECATED_GRANT_TYPE_IDS.includes(grantTypeId);

/** Secret types as returned by the API - see ClientConsts.GetSecretTypes(). */
export const SecretTypes = {
  SharedSecret: "SharedSecret",
  Jwk: "JWK",
} as const;

export enum DPoPMode {
  Custom = 0,
  Iat = 1,
  Nonce = 2,
  IatAndNonce = Iat | Nonce,
}

export type SelectItem = {
  value: string;
  label: string;
};

export type ClientSecretData = {
  id: number;
  type: string;
  description: string;
  expiration?: Date;
  created: Date;
};

export interface ClientSecretsData {
  totalCount: number;
  items: ClientSecretData[];
}

export interface ScopeClientData {
  id: number;
  clientId: string;
  clientName: string;
  enabled: boolean;
}

export interface ScopeClientsData {
  totalCount: number;
  items: ScopeClientData[];
}
