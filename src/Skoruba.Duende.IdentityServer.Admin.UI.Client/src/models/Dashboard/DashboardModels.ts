export type DashBoardIdentityData = {
  usersTotal: number;
  rolesTotal: number;
};

export type DashboardDataAuditLog = {
  total: number;
  created: Date;
  average: number;
};

export type DashboardDataChart = {
  name: string;
  total: number;
};

export type DashboardIdentityServerData = {
  clientsTotal: number;
  apiResourcesTotal: number;
  apiScopesTotal: number;
  identityResourcesTotal: number;
  identityProvidersTotal: number;
};

export type DashboardIdentityServerResult = {
  identityServerDataChart: DashboardDataChart[];
  identityServerData: DashboardIdentityServerData;
  auditLogsData: DashboardDataAuditLog[];
};
