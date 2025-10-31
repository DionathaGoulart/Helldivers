/**
 * Funções de API relacionadas à autenticação e gerenciamento de usuários
 */

import api, { setTokens, clearTokens } from './api';
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
 * @param credentials - Credenciais de login (username e password)
 * @returns Resposta de autenticação com tokens e dados do usuário
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/api/v1/auth/login/', credentials);
  const { access, refresh, user } = response.data;
  
  setTokens(access, refresh);
  return { access, refresh, user };
};

/**
 * Registra um novo usuário no sistema
 * @param data - Dados de registro (username, email, passwords, etc.)
 * @returns Resposta de autenticação com tokens e dados do usuário
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/api/v1/auth/registration/', data);
  const { access, refresh, user } = response.data;
  
  setTokens(access, refresh);
  return { access, refresh, user };
};

/**
 * Realiza logout do usuário atual
 */
export const logout = async (): Promise<void> => {
  await api.post('/api/v1/auth/logout/');
  clearTokens();
};

/**
 * Obtém os dados do usuário atualmente autenticado
 * @returns Dados do usuário atual
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/api/v1/auth/user/');
  return response.data;
};

// ============================================================================
// VALIDAÇÕES
// ============================================================================

/**
 * Verifica se um username está disponível
 * @param username - Username a ser verificado
 * @returns true se o username está disponível
 */
export const checkUsername = async (username: string): Promise<boolean> => {
  const response = await api.get('/api/v1/check/username/', {
    params: { username },
  });
  return response.data.available;
};

/**
 * Verifica se um email está disponível
 * @param email - Email a ser verificado
 * @returns true se o email está disponível
 */
export const checkEmail = async (email: string): Promise<boolean> => {
  const response = await api.get('/api/v1/check/email/', {
    params: { email },
  });
  return response.data.available;
};

// ============================================================================
// EMAIL E SENHA
// ============================================================================

/**
 * Reenvia email de verificação para o usuário atual
 */
export const resendVerificationEmail = async (): Promise<void> => {
  await api.post('/api/v1/resend-verification-email/');
};

/**
 * Envia email de recuperação de senha
 * @param email - Email do usuário
 */
export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/api/v1/password/reset/', { email });
};

/**
 * Redefine a senha do usuário usando token de recuperação
 * @param uid - ID único do usuário
 * @param token - Token de recuperação
 * @param newPassword1 - Nova senha
 * @param newPassword2 - Confirmação da nova senha
 */
export const resetPassword = async (
  uid: string,
  token: string,
  newPassword1: string,
  newPassword2: string
): Promise<void> => {
  await api.post('/api/v1/password/reset/confirm/', {
    uid,
    token,
    new_password1: newPassword1,
    new_password2: newPassword2,
  });
};

/**
 * Altera a senha do usuário autenticado
 * @param oldPassword - Senha atual
 * @param newPassword1 - Nova senha
 * @param newPassword2 - Confirmação da nova senha
 */
export const changePassword = async (
  oldPassword: string,
  newPassword1: string,
  newPassword2: string
): Promise<void> => {
  await api.post('/api/v1/password/change/', {
    old_password: oldPassword,
    new_password1: newPassword1,
    new_password2: newPassword2,
  });
};

// ============================================================================
// AUTENTICAÇÃO SOCIAL
// ============================================================================

/**
 * Realiza login usando OAuth do Google
 * @param code - Código de autorização do OAuth
 * @param redirectUri - URI de redirecionamento configurada
 * @returns Resposta de autenticação com tokens e dados do usuário
 */
export const loginWithGoogle = async (
  code: string,
  redirectUri: string
): Promise<AuthResponse> => {
  const response = await api.post('/api/v1/auth/google/callback/', {
    code,
    redirect_uri: redirectUri,
  });
  
  const { access, refresh, user } = response.data;
  setTokens(access, refresh);
  return { access, refresh, user };
};

// ============================================================================
// PERFIL E DASHBOARD
// ============================================================================

/**
 * Atualiza o perfil do usuário autenticado
 * @param data - Dados a serem atualizados (username, first_name, last_name)
 * @returns Dados atualizados do usuário
 */
export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  const response = await api.patch('/api/v1/profile/update/', data);
  return response.data;
};

/**
 * Obtém dados do dashboard do usuário
 * @returns Dados do dashboard
 */
export const getDashboard = async (): Promise<unknown> => {
  const response = await api.get('/api/v1/dashboard/');
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
