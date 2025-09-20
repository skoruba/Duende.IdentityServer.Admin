export type IdentityResourceData = {
  id: number;
  name: string;
};

export type IdentityResourcesData = {
  items: IdentityResourceData[];
  totalCount: number;
};
