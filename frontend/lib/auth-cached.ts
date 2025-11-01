/**
 * Funções de API relacionadas à autenticação e gerenciamento de usuários (COM CACHE)
 * 
 * Versão otimizada com cache automático das funções em auth.ts
 */

import { cachedGet, cachedPost, cachedPatch } from './api-cached';
import { clearCache } from './cache';
import { setTokens, clearTokens } from './api';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  UpdateProfileData,
} from './types/auth';

// ============================================================================
// AUTENTICAÇÃO
// ============================================================================

/**
 * Realiza login tradicional com username e password
 * NÃO usa cache (operação crítica de segurança)
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Usa api normal (não cached) pois login não deve ser cachead
  const { api } = await import('./api-cached');
  const response = await api.post('/api/v1/auth/login/', credentials);
  const { user } = response.data;
  
  // Tokens são gerenciados via cookies HttpOnly pelo servidor
  // Não precisamos mais armazenar no cliente
  return { access: '', refresh: '', user };
};

/**
 * Registra um novo usuário no sistema
 * NÃO usa cache (operação crítica)
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const { api } = await import('./api-cached');
  const response = await api.post('/api/v1/auth/registration/', data);
  const { user } = response.data;
  
  // Tokens são gerenciados via cookies HttpOnly pelo servidor
  // Não precisamos mais armazenar no cliente
  return { access: '', refresh: '', user };
};

/**
 * Realiza logout do usuário atual
 * Limpa cache automaticamente
 */
export const logout = async (): Promise<void> => {
  try {
    const { api } = await import('./api-cached');
    await api.post('/api/v1/auth/logout/');
  } catch (error) {
    // Continua mesmo se logout falhar no servidor
    console.error('Erro no logout:', error);
  } finally {
    clearTokens();
    // Limpa todo o cache ao fazer logout
    clearCache();
  }
};

/**
 * Obtém os dados do usuário atualmente autenticado
 * CACHE PERMANENTE (até logout) - dados não mudam durante sessão
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await cachedGet<User>('/api/v1/auth/user/');
  return response.data;
};

// ============================================================================
// VALIDAÇÕES
// ============================================================================

/**
 * Verifica se um username está disponível
 * Cache curto (1 minuto) por segurança
 */
export const checkUsername = async (username: string): Promise<boolean> => {
  const response = await cachedGet<{ available: boolean }>('/api/v1/check/username/', {
    params: { username },
  });
  return response.data.available;
};

/**
 * Verifica se um email está disponível
 * Cache curto (1 minuto) por segurança
 */
export const checkEmail = async (email: string): Promise<boolean> => {
  const response = await cachedGet<{ available: boolean }>('/api/v1/check/email/', {
    params: { email },
  });
  return response.data.available;
};

// ============================================================================
// EMAIL E SENHA
// ============================================================================

/**
 * Reenvia email de verificação para o usuário atual
 * NÃO usa cache
 */
export const resendVerificationEmail = async (): Promise<void> => {
  const { api } = await import('./api-cached');
  await api.post('/api/v1/resend-verification-email/');
};

/**
 * Envia email de recuperação de senha
 * NÃO usa cache
 */
export const forgotPassword = async (email: string): Promise<void> => {
  const { api } = await import('./api-cached');
  await api.post('/api/v1/password/reset/', { email });
};

/**
 * Redefine a senha do usuário usando token de recuperação
 * NÃO usa cache
 */
export const resetPassword = async (
  uid: string,
  token: string,
  newPassword1: string,
  newPassword2: string
): Promise<void> => {
  const { api } = await import('./api-cached');
  await api.post('/api/v1/password/reset/confirm/', {
    uid,
    token,
    new_password1: newPassword1,
    new_password2: newPassword2,
  });
};

/**
 * Altera a senha do usuário autenticado
 * NÃO usa cache, mas invalida cache de usuário
 */
export const changePassword = async (
  oldPassword: string,
  newPassword1: string,
  newPassword2: string
): Promise<void> => {
  const { api } = await import('./api-cached');
  await api.post('/api/v1/password/change/', {
    old_password: oldPassword,
    new_password1: newPassword1,
    new_password2: newPassword2,
  });
  
  // Invalida cache de dados do usuário após mudança de senha
  const { invalidateCache } = await import('./cache');
  invalidateCache('/api/v1/auth/user/');
};

// ============================================================================
// AUTENTICAÇÃO SOCIAL
// ============================================================================

/**
 * Realiza login usando OAuth do Google
 * NÃO usa cache
 */
export const loginWithGoogle = async (
  code: string,
  redirectUri: string
): Promise<AuthResponse> => {
  const { api } = await import('./api-cached');
  const response = await api.post('/api/v1/auth/google/callback/', {
    code,
    redirect_uri: redirectUri,
  });
  
  const { user } = response.data;
  // Tokens são gerenciados via cookies HttpOnly pelo servidor
  // Não precisamos mais armazenar no cliente
  return { access: '', refresh: '', user };
};

// ============================================================================
// PERFIL E DASHBOARD
// ============================================================================

/**
 * Atualiza o perfil do usuário autenticado
 * Invalida cache de dados do usuário automaticamente
 */
export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  const response = await cachedPatch<User>('/api/v1/profile/update/', data);
  return response.data;
};

/**
 * Obtém dados do dashboard do usuário
 * Cache médio (5 minutos)
 */
export const getDashboard = async (): Promise<unknown> => {
  const response = await cachedGet('/api/v1/dashboard/');
  return response.data;
};

// Re-exportar types para compatibilidade
export type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  UpdateProfileData,
} from './types/auth';

