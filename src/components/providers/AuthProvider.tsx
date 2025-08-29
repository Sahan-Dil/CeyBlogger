"use client";

import { AuthContext } from "@/hooks/use-auth";
import { getUser, getUsers } from "@/lib/data";
import type { User } from "@/lib/types";
import { useRouter } from "next/navigation";
import { type ReactNode, useState, useEffect } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Mock checking for a logged-in user in session storage
    const loggedInUserId = sessionStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
      getUser(loggedInUserId).then(u => {
        if(u) setUser(u);
        setLoading(false);
      });
    } else {
        setLoading(false);
    }
  }, []);

  const login = async (email: string, password?: string): Promise<User | null> => {
    setLoading(true);
    // Mock login logic
    const users = await getUsers();
    const foundUser = users.find(u => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      sessionStorage.setItem('loggedInUserId', foundUser.id);
      setLoading(false);
      return foundUser;
    }
    
    setLoading(false);
    return null;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('loggedInUserId');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
