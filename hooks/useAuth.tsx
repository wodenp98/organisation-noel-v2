import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export function useAuth(requireAuth: boolean = true) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "loading") {
      setLoading(false);
      if (requireAuth && !session) {
        redirect("/login");
      }
    }
  }, [session, status, requireAuth]);

  return {
    user: session?.user,
    loading,
    status,
  };
}
