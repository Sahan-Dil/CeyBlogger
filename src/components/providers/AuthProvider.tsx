"use client";

import { AuthContext } from "@/hooks/use-auth";
import { clearToken, post, setToken } from "@/lib/api";
import { getUser, getUsers } from "@/lib/data";
import type { User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { type ReactNode, useState, useEffect } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = sessionStorage.getItem("loggedInUser");
    const savedToken = sessionStorage.getItem("token");

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedToken) setToken(savedToken);

    setLoading(false);
  }, []);

  const login = async (email: string, password?: string) => {
    if (!password) {
      console.error("Password is required");
      return null;
    }

    setLoading(true);
    try {
      const data = await post<{ user: User; token: string }>("/auth/login", {
        email,
        password,
      });
      console.log("Login response data:", data);

      if (data?.token && data.user) {
        const userObj: User = {
          id: data.user.id ?? "unknown",
          name: data.user.name ?? "Unknown",
          email: data.user.email ?? "unknown@email.com",
          avatarUrl: data.user.avatarUrl ?? "",
          bio: data.user.bio ?? "",
        };

        setToken(data.token);
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("loggedInUser", JSON.stringify(userObj));
        setUser(data.user);
        setLoading(false);
        return data.user;
      }
    } catch (err) {
      console.error("Login error", err);
    }
    setLoading(false);
    return null;
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const data = await post<{ user: User; token: string }>("/auth/register", {
        name,
        email,
        password,
      });

      if (data?.token && data.user) {
        const userObj: User = {
          id: data.user.id ?? "unknown",
          name: data.user.name ?? "Unknown",
          email: data.user.email ?? "unknown@email.com",
          avatarUrl: data.user.avatarUrl ?? "",
          bio: data.user.bio ?? "",
        };

        setToken(data.token);
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("loggedInUser", JSON.stringify(userObj));
        setUser(userObj);
        setLoading(false);
        return data.user;
      }
    } catch (err) {
      console.error("Register error", err);
    }
    setLoading(false);
    return null;
  };

  const logout = () => {
    clearToken();
    sessionStorage.removeItem("loggedInUser");
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, register }}>
      {children}
    </AuthContext.Provider>
  );
}
