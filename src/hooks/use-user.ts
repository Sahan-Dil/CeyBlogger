"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";

interface UseUserResult {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUser(userId?: string): UseUserResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(!!userId);
  const [error, setError] = useState<string | null>(null);
  const { user: authUser } = useAuth();

  const fetchUser = async () => {
    if (!userId || !authUser) return;
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<User>(`/users/${userId}`);
      setUser(data);
    } catch (err: any) {
      if (err?.status === 401) {
        console.warn("Unauthorized fetching user:", userId);
        setUser(null);
      } else {
        console.error("Error fetching user:", err);
        setError("Failed to load user");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, authUser]);

  return { user, loading, error, refetch: fetchUser };
}
