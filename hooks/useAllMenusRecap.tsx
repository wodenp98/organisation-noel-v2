import { useQuery } from "@tanstack/react-query";

interface MenuRecapItem {
  name: string;
  username: string;
  entries: string | null;
  flat: string | null;
  desserts: string | null;
}

export function useAllMenusRecap() {
  return useQuery<MenuRecapItem[]>({
    queryKey: ["allMenusRecap"],
    queryFn: async (): Promise<MenuRecapItem[]> => {
      const response = await fetch("/api/menus");
      if (!response.ok) {
        throw new Error(`Failed to fetch all menus: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 0,
    refetchInterval: 5000,
  });
}
