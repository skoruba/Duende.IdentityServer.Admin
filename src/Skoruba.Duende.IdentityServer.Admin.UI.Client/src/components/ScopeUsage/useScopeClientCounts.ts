import { useQuery } from "@tanstack/react-query";
import { getClientCountsByScopes } from "@/services/ClientServices";
import { queryKeys, queryWithoutCache } from "@/services/QueryKeys";

export const useScopeClientCounts = (scopes: string[]) =>
  useQuery({
    queryKey: [queryKeys.scopeClientCounts, scopes],
    queryFn: () => getClientCountsByScopes(scopes),
    enabled: scopes.length > 0,
    placeholderData: (previousData) => previousData,
    ...queryWithoutCache,
  });
