/**
 * Context de Autenticação
 * 
 * Fornece estado global de autenticação e funções relacionadas para toda a aplicação.
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/lib/types/auth';
import type { AuthContextType } from '@/lib/types/auth-context';
import * as authService from '@/lib/auth';

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

/**
 * Provider do Context de Autenticação
 * @param children - Componentes filhos
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Verifica autenticação ao carregar a aplicação
   */
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

  // ============================================================================
  // FUNÇÕES DE AUTENTICAÇÃO
  // ============================================================================

  /**
   * Realiza login do usuário
   * @param credentials - Credenciais de login
   */
  const login = async (credentials: authService.LoginCredentials) => {
    const response = await authService.login(credentials);
    setUser(response.user);
  };

  /**
   * Registra um novo usuário
   * @param data - Dados de registro
   */
  const register = async (data: authService.RegisterData) => {
    const response = await authService.register(data);
    setUser(response.user);
  };

  /**
   * Realiza logout do usuário
   */
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  /**
   * Atualiza os dados do usuário atual
   */
  const updateUser = async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
  };

  /**
   * Atualiza o perfil do usuário
   * @param data - Dados para atualização
   */
  const updateProfile = async (data: authService.UpdateProfileData) => {
    const updatedUser = await authService.updateProfile(data);
    setUser(updatedUser);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

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

// ============================================================================
// HOOK CUSTOMIZADO
// ============================================================================

/**
 * Hook para consumir o Context de Autenticação
 * @returns Context de autenticação
 * @throws Error se usado fora do AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

