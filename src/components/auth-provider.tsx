'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  plan_cli?: string;
  plan_api?: string;
  plan_chat?: string;
  plan_agents?: string;
  profile_picture?: string | null;
  last_login?: string | null;
}

interface AuthValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  updateProfile: (name: string, profile_picture?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue>({ user: null, loading: true, login: async () => {}, signup: async () => {}, updateProfile: async () => {}, logout: () => {} });

function getHardwareSystemInfo() {
  if (typeof window === 'undefined') return {};
  try {
    return {
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      deviceMemory: (navigator as any).deviceMemory || 'Unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
      platform: navigator.platform || 'Unknown',
      language: navigator.language || 'Unknown',
      userAgent: navigator.userAgent,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown',
      colorDepth: window.screen.colorDepth || 'Unknown',
    };
  } catch (e) {
    return { error: 'Failed to collect hardware info' };
  }
}

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
    const hwInfo = getHardwareSystemInfo();
    const r = await api.login(email, password, hwInfo);
    localStorage.setItem('cm_token', r.token);
    setUser(r.user);
  };

  const signup = async (email: string, password: string, name?: string) => {
    const hwInfo = getHardwareSystemInfo();
    const r = await api.signup(email, password, name, hwInfo);
    localStorage.setItem('cm_token', r.token);
    setUser(r.user);
  };

  const updateProfile = async (name: string, profile_picture?: string) => {
    const r = await api.updateProfile(name, profile_picture);
    setUser(r.user);
  };

  const logout = () => {
    localStorage.removeItem('cm_token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, signup, updateProfile, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
