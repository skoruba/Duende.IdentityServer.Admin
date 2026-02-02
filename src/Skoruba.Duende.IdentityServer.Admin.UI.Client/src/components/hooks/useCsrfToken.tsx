import { queryKeys } from "@/services/QueryKeys";
import { useQuery } from "react-query";

export type CsrfResponse = { token: string; fieldName: string };

async function fetchCsrf(csrfUrl: string): Promise<CsrfResponse> {
  const res = await fetch(csrfUrl, {
    method: "POST",
    credentials: "include",
    headers: { "X-ANTI-CSRF": "1", Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`CSRF load failed: ${res.status}`);
  }
  return (await res.json()) as CsrfResponse;
}

export function useCsrfToken(csrfUrl: string, enabled: boolean) {
  return useQuery({
    queryKey: [queryKeys.csrfToken, csrfUrl],
    queryFn: () => fetchCsrf(csrfUrl),
    enabled,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });
}
