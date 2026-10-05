import { useQuery } from "@tanstack/react-query";
import { settingsApi } from "@/services/api";

export function usePlatformBrand() {
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.get,
    staleTime: 60_000,
  });

  return {
    name: data?.platformName?.trim() || "BBD PROFOLIO",
    logo: data?.logo?.trim() || "",
  };
}
