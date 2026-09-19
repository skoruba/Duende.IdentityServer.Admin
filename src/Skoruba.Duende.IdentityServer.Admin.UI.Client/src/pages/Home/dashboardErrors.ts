import { getStatusCode } from "@/helpers/ErrorHelper";

/** Translation key explaining why a dashboard request failed. */
export const getDashboardErrorKey = (error: unknown) => {
  const status = getStatusCode(error);

  if (status === 401) return "Home.DashboardState.Unauthorized" as const;
  if (status === 403) return "Home.DashboardState.Forbidden" as const;
  return "Home.DashboardState.Generic" as const;
};
