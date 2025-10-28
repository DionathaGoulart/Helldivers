import api, { setTokens, clearTokens } from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password1: string;
  password2: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// Login tradicional
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post('/api/auth/login/', credentials);
  const { access, refresh, user } = response.data;
  
  setTokens(access, refresh);
  return { access, refresh, user };
};

// Registro
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post('/api/auth/registration/', data);
  const { access, refresh, user } = response.data;
  
  setTokens(access, refresh);
  return { access, refresh, user };
};

// Logout
export const logout = async (): Promise<void> => {
  await api.post('/api/auth/logout/');
  clearTokens();
};

// Obter usuário atual
export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/api/auth/user/');
  return response.data;
};

// Esqueceu a senha (usando endpoint customizado)
export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/api/password/reset/', { email });
};

// Reset de senha (com token) - usando endpoint customizado
export const resetPassword = async (uid: string, token: string, newPassword1: string, newPassword2: string): Promise<void> => {
  await api.post('/api/password/reset/confirm/', {
    uid,
    token,
    new_password1: newPassword1,
    new_password2: newPassword2,
  });
};

// Trocar senha
export const changePassword = async (oldPassword: string, newPassword1: string, newPassword2: string): Promise<void> => {
  // Usar nosso endpoint customizado que valida a senha antiga
  await api.post('/api/password/change/', {
    old_password: oldPassword,
    new_password1: newPassword1,
    new_password2: newPassword2,
  });
};

// Login com Google
export const loginWithGoogle = async (code: string, redirectUri: string): Promise<AuthResponse> => {
  const response = await api.post('/api/auth/google/callback/', {
    code,
    redirect_uri: redirectUri,
  });
  
  const { access, refresh, user } = response.data;
  setTokens(access, refresh);
  return { access, refresh, user };
};

// Atualizar perfil
export interface UpdateProfileData {
  username?: string;
  first_name?: string;
  last_name?: string;
}

export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  const response = await api.patch('/api/profile/update/', data);
  return response.data;
};

// Dashboard
export const getDashboard = async () => {
  const response = await api.get('/api/dashboard/');
  return response.data;
};

