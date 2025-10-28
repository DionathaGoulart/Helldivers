'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/lib/auth';
import * as authService from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: authService.LoginCredentials) => Promise<void>;
  register: (data: authService.RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: () => Promise<void>;
  updateProfile: (data: authService.UpdateProfileData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar se o usuário está autenticado ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: authService.LoginCredentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  };

  const register = async (data: authService.RegisterData) => {
    const response = await authService.register(data);
    setUser(response.user);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  const updateProfile = async (data: authService.UpdateProfileData) => {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

