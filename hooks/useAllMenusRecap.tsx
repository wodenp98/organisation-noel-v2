import { useQuery } from "@tanstack/react-query";

interface AllMenusRecap {
  name: string;
  username: string;
  entries: string | null;
  flat: string | null;
  desserts: string | null;
}

export function useAllMenusRecap(isOpen: boolean) {
  return useQuery<AllMenusRecap[]>({
    queryKey: ["allMenusRecap"],
    queryFn: async () => {
      const response = await fetch("/api/menus");
      if (!response.ok) {
        throw new Error(`Failed to fetch all menus: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: isOpen,
    staleTime: 30000,
    refetchInterval: isOpen ? 30000 : false,
  });
}
