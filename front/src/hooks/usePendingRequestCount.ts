import { useQuery } from "@tanstack/react-query";
import { requestsApi } from "@/services/api";

/** Shared query so sidebar, topbar, dashboard and the requests page stay in sync. */
export const requestsQuery = {
  queryKey: ["requests"] as const,
  queryFn: requestsApi.list,
  refetchInterval: 15_000,
  refetchOnWindowFocus: true,
};

export function usePendingRequestCount() {
  const { data: requests } = useQuery(requestsQuery);
  return (requests || []).filter((r) => r.status === "pending").length;
}
