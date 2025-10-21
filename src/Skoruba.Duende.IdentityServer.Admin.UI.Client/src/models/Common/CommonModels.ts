export interface PropertyData {
  key: string;
  value: string;
  id: number;
}

export interface PropertiesData {
  totalCount: number;
  items: PropertyData[];
}

export type SecretData = {
  id: number;
  type: string;
  description: string;
  expiration?: Date;
  created: Date;
};

export type SecretsData = {
  totalCount: number;
  items: SecretData[];
};
