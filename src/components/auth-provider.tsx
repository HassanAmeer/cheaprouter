'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
}

interface AuthValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue>({ user: null, loading: true, login: async () => {}, signup: async () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('cm_token');
    if (!t) { setLoading(false); return; }
    api
      .me()
      .then((r) => setUser(r.user))
      .catch(() => localStorage.removeItem('cm_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const r = await api.login(email, password);
    localStorage.setItem('cm_token', r.token);
    setUser(r.user);
  };

  const signup = async (email: string, password: string, name?: string) => {
    const r = await api.signup(email, password, name);
    localStorage.setItem('cm_token', r.token);
    setUser(r.user);
  };

  const logout = () => {
    localStorage.removeItem('cm_token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
