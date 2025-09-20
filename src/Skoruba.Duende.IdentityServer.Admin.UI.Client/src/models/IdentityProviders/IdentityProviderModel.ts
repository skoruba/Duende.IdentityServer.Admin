export interface IdentityProviderModel {
  id: number;
  scheme: string;
  displayName: string;
  enabled: boolean;
}

export interface IdentityProviderData {
  items: IdentityProviderModel[];
  totalCount: number;
}
