"use client";
import React, { createContext, useContext, useState } from "react";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";

interface UserContextType {
  login: (username: string, password: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Identifiants incorrects");
        return;
      }

      redirect("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ login, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
