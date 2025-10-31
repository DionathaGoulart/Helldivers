/**
 * Types relacionados ao Context de Autenticação
 */

import type { User, LoginCredentials, RegisterData, UpdateProfileData } from './auth';

/**
 * Tipo do Context de Autenticação
 */
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}

