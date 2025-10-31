/**
 * Types relacionados à autenticação e usuários
 */

// ============================================================================
// MODELOS DE DADOS
// ============================================================================

/**
 * Modelo de Usuário
 */
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

// ============================================================================
// AUTENTICAÇÃO
// ============================================================================

/**
 * Credenciais de login
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Dados de registro de usuário
 */
export interface RegisterData {
  username: string;
  email: string;
  password1: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

/**
 * Resposta de autenticação com tokens
 */
export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

/**
 * Dados para atualização de perfil
 */
export interface UpdateProfileData {
  username?: string;
  first_name?: string;
  last_name?: string;
}

