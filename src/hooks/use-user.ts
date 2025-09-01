"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";

export function useUser(userId: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (!authUser) return;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const data = await apiFetch<User>(`/users/${userId}`);
        setUser(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, authUser]);

  return { user, loading };
}
