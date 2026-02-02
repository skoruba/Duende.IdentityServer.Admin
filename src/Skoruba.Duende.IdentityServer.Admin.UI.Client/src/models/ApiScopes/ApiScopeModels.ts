export type ApiScopeData = {
  id: number;
  name: string;
  displayName: string;
  description: string;
  enabled: boolean;
  showInDiscoveryDocument: boolean;
  required: boolean;
  emphasize: boolean;
  userClaims: string[];
};

export type ApiScopesData = {
  items: ApiScopeData[];
  totalCount: number;
};

export type ApiScopeSecretData = {
  id: number;
  type: string;
  description: string;
  expiration: Date | null;
  created: Date;
};

export type ApiScopeSecretsData = {
  items: ApiScopeSecretData[];
  totalCount: number;
};
