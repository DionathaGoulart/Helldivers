/**
 * Context de Autenticação
 * 
 * Fornece estado global de autenticação e funções relacionadas para toda a aplicação usando Supabase.
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginCredentials, RegisterData, UpdateProfileData } from '@/lib/types/auth';
import type { AuthContextType } from '@/lib/types/auth-context';
import { supabase } from '@/lib/supabase';

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

  // Helper para mapear usuário do Supabase para o tipo User esperado
  const mapSupabaseUser = (suUser: any): User | null => {
    if (!suUser) return null;
    return {
      id: suUser.id,
      email: suUser.email,
      username: suUser.user_metadata?.username || suUser.email?.split('@')[0] || '',
      first_name: suUser.user_metadata?.first_name || '',
      last_name: suUser.user_metadata?.last_name || '',
      is_staff: false,
      is_superuser: false,
    };
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Monitora estado de autenticação via onAuthStateChange
   */
  useEffect(() => {
    // Carregar usuário na inicialização
    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      setUser(mapSupabaseUser(currentUser));
      setLoading(false);
    });

    // Inscrever-se em mudanças de autenticação (login, logout, refresh etc)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ============================================================================
  // FUNÇÕES DE AUTENTICAÇÃO
  // ============================================================================

  /**
   * Realiza login do usuário
   * @param credentials - Credenciais de login
   */
  const login = async (credentials: LoginCredentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });
    if (error) throw error;
  };

  /**
   * Registra um novo usuário
   * @param data - Dados de registro
   */
  const register = async (data: RegisterData) => {
    const { data: sessionData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password1,
      options: {
        data: {
          username: data.username,
          first_name: data.first_name,
          last_name: data.last_name,
        }
      }
    });
    if (error) throw error;
  };

  /**
   * Realiza logout do usuário
   */
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      // Redireciona para a página inicial após logout
      window.location.href = '/';
    } else {
      console.error("Erro no logout:", error);
    }
  };

  /**
   * Atualiza os dados do usuário atual a partir do servidor
   */
  const updateUser = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(mapSupabaseUser(currentUser));
  };

  /**
   * Atualiza o perfil do usuário
   * @param data - Dados para atualização
   */
  const updateProfile = async (data: UpdateProfileData) => {
    const { data: sessionData, error } = await supabase.auth.updateUser({
      data: {
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
      }
    });
    
    if (error) throw error;
    setUser(mapSupabaseUser(sessionData.user));
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

