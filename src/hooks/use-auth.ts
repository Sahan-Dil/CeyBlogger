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
