export type RoleData = {
  id: string;
  name: string;
};

export type RolesData = {
  items: RoleData[];
  totalCount: number;
};

export type RoleFormData = {
  id?: string;
  name: string;
};
