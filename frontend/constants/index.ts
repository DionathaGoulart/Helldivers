/**
 * Constantes da aplicação
 * 
 * Centraliza todas as constantes compartilhadas pela aplicação
 */

/**
 * Chaves de armazenamento local
 */
export const STORAGE_KEYS = {
  LANGUAGE: 'helldivers_language',
  FAVORITES: 'helldivers_favorites',
} as const;

/**
 * Valores padrão da aplicação
 */
export const DEFAULTS = {
  LANGUAGE: 'pt-BR',
  ORDERING: 'name',
} as const;

/**
 * URLs da API
 */
export const API_ENDPOINTS = {
  BASE: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  AUTH: {
    LOGIN: '/api/v1/auth/login/',
    REGISTER: '/api/v1/auth/register/',
    LOGOUT: '/api/v1/auth/logout/',
    USER: '/api/v1/auth/user/',
    GOOGLE: '/api/v1/auth/google/',
    GOOGLE_CALLBACK: '/api/v1/auth/google/callback/',
    VERIFY_EMAIL: '/api/v1/verify-email/',
    RESEND_VERIFICATION: '/api/v1/auth/resend-verification/',
    FORGOT_PASSWORD: '/api/v1/password/reset/',
    RESET_PASSWORD: '/api/v1/password/reset/confirm/',
    CHANGE_PASSWORD: '/api/v1/auth/change-password/',
    UPDATE_PROFILE: '/api/v1/auth/update-profile/',
    CHECK_USERNAME: '/api/v1/auth/check-username/',
    CHECK_EMAIL: '/api/v1/auth/check-email/',
  },
  ARMORY: {
    ARMORS: '/api/v1/armory/armors/',
    HELMETS: '/api/v1/armory/helmets/',
    CAPES: '/api/v1/armory/capes/',
    SETS: '/api/v1/armory/sets/',
    PASSIVES: '/api/v1/armory/passives/',
    PASSES: '/api/v1/armory/passes/',
    RELATIONS: '/api/v1/armory/set-relations/',
    FAVORITES: '/api/v1/armory/favorites/',
    COLLECTION: '/api/v1/armory/collection/',
    WISHLIST: '/api/v1/armory/wishlist/',
  },
} as const;

/**
 * Z-index layers da aplicação
 */
export const Z_INDEX = {
  MODAL: 9999,
  HEADER: 100,
  DROPDOWN: 50,
} as const;

/**
 * Timeouts e delays
 */
export const TIMEOUTS = {
  DEBOUNCE: 500,
  DEBOUNCE_VALIDATION: 500,
  REDIRECT_DELAY: 2000,
} as const;

