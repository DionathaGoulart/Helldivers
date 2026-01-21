/**
 * Configuração da API Client
 * 
 * Instância do Axios configurada com interceptors para autenticação e idioma
 */

// ============================================================================
// IMPORTS
// ============================================================================

// 1. Bibliotecas externas
import axios from 'axios';

// ============================================================================
// CONSTANTES
// ============================================================================

// Usar URL relativa no client-side para aproveitar o proxy do Next.js (rewrites)
// Isso resolve problemas de CORS e Cookies (SameSite) em desenvolvimento local via LAN
const API_BASE_URL = typeof window !== 'undefined'
  ? ''
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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

    // Adicionar header Accept-Language baseado no idioma salvo no localStorage
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('helldivers_language') || 'pt-BR';
      // Django usa 'pt-br' ou 'en' no Accept-Language
      const languageHeader = savedLanguage === 'pt-BR' ? 'pt-br' : 'en';
      config.headers['Accept-Language'] = languageHeader;
    }

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
      // Se for verificação de usuário, não tenta refresh
      // Deixa o erro ser tratado normalmente pelo AuthContext
      const isAuthCheck = originalRequest?.url?.includes('/api/v1/auth/user/');

      if (isAuthCheck) {
        // Limpa cache mas não tenta refresh nem redireciona
        // O AuthContext vai tratar como "usuário não logado"
        if (typeof window !== 'undefined') {
          try {
            const { invalidateCache } = await import('./cache');
            invalidateCache('/api/v1/auth/user/');
          } catch {
            // Ignora erros ao limpar cache
          }
        }
        return Promise.reject(error);
      }

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
        // Se falhou, limpa cache mas NÃO redireciona automaticamente
        // Deixa o erro ser tratado pelo componente
        // Evita loops infinitos quando já estamos na página inicial
        if (typeof window !== 'undefined') {
          // Limpa qualquer cache relacionado a autenticação
          try {
            const { invalidateCache, clearCache } = await import('./cache');
            invalidateCache('/api/v1/auth/user/');
            clearCache();
          } catch {
            // Ignora erros ao limpar cache
          }

          // Só redireciona se não estiver já na página inicial
          const currentPath = window.location.pathname;
          const isAlreadyOnHome = currentPath === '/';

          if (!isAlreadyOnHome) {
            // Apenas redireciona para login se não estiver na página inicial
            window.location.href = '/login';
          }
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

