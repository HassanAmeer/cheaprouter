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
  is_student?: boolean | null;
  experience_level?: string | null;
  use_cases?: string | null;
  earning_goal?: string | null;
  onboarding_completed?: boolean | null;
}

interface AuthValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  updateProfile: (name: string, profile_picture?: string | File) => Promise<void>;
  completeOnboarding: (data: { isStudent: boolean; experienceLevel: string; useCases: string[]; earningGoal: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue>({ user: null, loading: true, login: async () => {}, signup: async () => {}, updateProfile: async () => {}, completeOnboarding: async () => {}, logout: () => {} });

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

  const updateProfile = async (name: string, profile_picture?: string | File) => {
    let finalPicture: string | undefined;
    if (profile_picture instanceof File) {
      const formData = new FormData();
      formData.append('file', profile_picture);
      const uploadRes = await fetch('/api/upload/profile', { method: 'POST', body: formData });
      if (!uploadRes.ok) throw new Error('Failed to upload profile picture');
      const uploadData = await uploadRes.json();
      finalPicture = uploadData.url;
    } else if (profile_picture) {
      finalPicture = profile_picture;
    }
    const r = await api.updateProfile(name, finalPicture);
    setUser(r.user);
  };

  const completeOnboarding = async (data: { isStudent: boolean; experienceLevel: string; useCases: string[]; earningGoal: string }) => {
    const r = await api.saveOnboarding(data);
    setUser(r.user);
  };

  const logout = () => {
    localStorage.removeItem('cm_token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, signup, updateProfile, completeOnboarding, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
