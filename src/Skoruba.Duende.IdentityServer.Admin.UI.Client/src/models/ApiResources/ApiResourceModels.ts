export interface ApiResourceData {
  id: number;
  apiResourceName: string;
}
export interface ApiResourcesData {
  totalCount: number;
  items: ApiResourceData[];
}

export type ApiResourceSecretData = {
  id: number;
  type: string;
  description: string;
  expiration?: Date;
  created: Date;
};

export interface ApiResourceSecretsData {
  totalCount: number;
  items: ApiResourceSecretData[];
}
