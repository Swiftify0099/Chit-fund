import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import { authApi, userApi } from "@/services/api";

interface User {
  id: number;
  name: string;
  phone: string;
  email?: string;
  role: "admin" | "user";
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("access_token");
      if (!token) return;
      const { data } = await userApi.me();
      setUser(data);
    } catch {
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("refresh_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (phone: string, password: string) => {
    const { data } = await authApi.login(phone, password);
    await SecureStore.setItemAsync("access_token", data.access_token);
    await SecureStore.setItemAsync("refresh_token", data.refresh_token);
    setUser({ id: data.user_id, name: data.name, phone, role: data.role, is_active: true });
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("refresh_token");
    setUser(null);
  };

  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
