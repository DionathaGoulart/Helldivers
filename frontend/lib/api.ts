import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enviar cookies automaticamente
});

// Interceptor para requisições
// Tokens agora são gerenciados via cookies HttpOnly pelo servidor
// Não precisamos mais adicionar manualmente o token
api.interceptors.request.use(
  (config) => {
    // Cookies são enviados automaticamente com withCredentials: true
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com erros de autenticação
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se recebeu 401 e não é a segunda tentativa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Tenta renovar o token usando cookies
        // O refresh token está no cookie, o backend gerencia automaticamente
        await axios.post(
          `${API_BASE_URL}/api/v1/auth/token/refresh/`,
          {}, // Body vazio, token vem do cookie
          {
            withCredentials: true,
          }
        );

        // Retenta a requisição original
        // O novo access token já está no cookie
        return api(originalRequest);
      } catch (refreshError) {
        // Se falhou, redireciona para a página inicial
        // Os cookies serão limpos automaticamente pelo logout
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Funções auxiliares para gerenciar tokens via cookies
// Os tokens agora são gerenciados pelo servidor via cookies HttpOnly
// Estas funções são mantidas para compatibilidade mas não fazem nada
export const setTokens = (access: string, refresh: string) => {
  // Tokens são gerenciados pelo servidor via cookies HttpOnly
  // Não precisamos armazenar no cliente
};

export const clearTokens = () => {
  // Os cookies serão limpos pelo servidor no logout
  // Não precisamos fazer nada no cliente
};

export const getAccessToken = () => {
  // Não podemos acessar cookies HttpOnly via JavaScript
  // O token é enviado automaticamente pelo navegador
  return null;
};

