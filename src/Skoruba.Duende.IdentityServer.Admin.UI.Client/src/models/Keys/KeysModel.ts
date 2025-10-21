export interface KeyApiDto {
  id: string;
  version: number;
  created: Date;
  use: string;
  algorithm: string;
  isX509Certificate: boolean;
}

export interface KeysApiDto {
  keys: KeyApiDto[];
  totalCount: number;
}
