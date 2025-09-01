"use client";

import { AuthContext } from "@/hooks/use-auth";
import { apiFetch, clearToken, getToken, post, setToken } from "@/lib/api";
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

  // inside AuthProvider
  const updateUser = async (data: {
    name: string;
    bio?: string;
    avatarUrl?: string;
  }) => {
    if (!user) return null;

    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.bio) formData.append("bio", data.bio);

      // If avatarUrl is a data URL (from file upload), convert to blob
      if (data.avatarUrl && data.avatarUrl.startsWith("data:")) {
        const res = await fetch(data.avatarUrl);
        const blob = await res.blob();
        formData.append("avatar", blob, "avatar.png");
      }

      const updatedUser = await apiFetch<User>(`/users/${user.id}`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      // Update local state + sessionStorage
      setUser(updatedUser);
      sessionStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      console.error("Update user error", err);
      return null;
    }
  };

  const logout = () => {
    clearToken();
    sessionStorage.removeItem("loggedInUser");
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
