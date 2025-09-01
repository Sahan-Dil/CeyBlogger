"use client";

import type { User } from "@/lib/types";
import { createContext, useContext } from "react";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<User | null>;
  logout: () => void;
  loading: boolean;
  updateUser: (data: {
    name: string;
    bio?: string;
    avatarUrl?: string;
  }) => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
