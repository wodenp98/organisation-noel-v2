import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface Menu {
  id?: string;
  entries: string | null;
  flat: string | null;
  desserts: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserMenu {
  id?: string;
  userId?: string;
  menuId?: string;
  menu: Menu;
}

interface MenuUpdateData {
  entries?: string | null;
  flat?: string | null;
  desserts?: string | null;
}

export function useMenu(userId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: menuData, isLoading } = useQuery<UserMenu>({
    queryKey: ["menu", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");

      const response = await fetch(`/api/menu/${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch menu: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!userId,
    initialData: {
      menu: {
        entries: null,
        flat: null,
        desserts: null,
      },
    },
  });

  const createOrUpdateMenu = useMutation<UserMenu, Error, MenuUpdateData>({
    mutationFn: async (menuData: MenuUpdateData) => {
      if (!userId) throw new Error("User ID is required");

      const response = await fetch("/api/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...menuData,
        }),
      });

      if (!response.ok) {
        if (response.status === 304) {
          return queryClient.getQueryData<UserMenu>(["menu", userId]);
        }
        throw new Error(`Failed to update menu: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(["menu", userId], newData);

      queryClient.refetchQueries({
        queryKey: ["allMenusRecap"],
        exact: true,
      });
    },
    onError: (error) => {
      console.error("Failed to update menu:", error);
      queryClient.invalidateQueries({ queryKey: ["menu", userId] });
      queryClient.invalidateQueries({ queryKey: ["allMenusRecap"] });
    },
  });

  return {
    menuData,
    isLoading,
    createOrUpdateMenu,
    isUpdating: createOrUpdateMenu.isPending,
    error: createOrUpdateMenu.error,
  };
}
