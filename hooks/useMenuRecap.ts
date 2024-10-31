import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const MENU_RECAP_KEY = ["menuRecap"];

export const useMenuRecap = (enabled: boolean = true) => {
  const queryClient = useQueryClient();

  const fetchMenuRecap = async (): Promise<RecapData> => {
    const response = await fetch("/api/menuRecap");
    if (!response.ok) {
      throw new Error("Failed to fetch menu recap");
    }
    return response.json();
  };

  const updateMenu = async (input: UpdateMenuInput) => {
    const response = await fetch("/api/menuRecap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error("Failed to update menu");
    }
    return response.json();
  };

  const query = useQuery({
    queryKey: MENU_RECAP_KEY,
    queryFn: fetchMenuRecap,
    enabled,
  });

  const mutation = useMutation({
    mutationFn: updateMenu,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: MENU_RECAP_KEY });
    },
  });

  return {
    recap: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updateMenu: mutation.mutate,
    isUpdating: mutation.isPending,
  };
};
