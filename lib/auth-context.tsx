// Auth state + helpers, shared via React Context.
// Mirrors the web app's useAuth() hook so screen code feels identical.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { clearToken, loadToken, saveToken } from './session';
import type { User } from './types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (phone: string, code: string) => Promise<{ success: boolean; isNew?: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = await loadToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    const res = await api.get<User>('/api/auth/me');
    if (res.success && res.data) {
      setUser(res.data);
    } else {
      await clearToken();
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (phone: string, code: string) => {
    const res = await api.post<{ token: string; user: User; isNew: boolean }>(
      '/api/auth/verify-otp',
      { phone, code },
      { skipAuth: true },
    );
    if (!res.success || !res.data) {
      return { success: false, error: res.error || 'Invalid OTP' };
    }
    await saveToken(res.data.token);
    setUser(res.data.user);
    return { success: true, isNew: res.data.isNew };
  }, []);

  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(() => ({ user, loading, login, logout, refresh }), [user, loading, login, logout, refresh]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
