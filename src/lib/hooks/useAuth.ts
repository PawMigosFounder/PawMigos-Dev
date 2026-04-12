'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api-client';

interface User {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  city: string | null;
  onboardingCompleted: boolean;
  profilePhoto: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, code: string) => Promise<{ success: boolean; isNew?: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get<any>('/api/auth/me');
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (phone: string, code: string) => {
    const res = await api.post<any>('/api/auth/verify-otp', { phone, code });
    if (res.success && res.data) {
      setUser(res.data.user);
      return { success: true, isNew: res.data.isNew };
    }
    return { success: false, error: res.error };
  };

  const logout = async () => {
    await api.post('/api/auth/logout', {});
    setUser(null);
  };

  return { user, loading, login, logout, refreshUser };
}
