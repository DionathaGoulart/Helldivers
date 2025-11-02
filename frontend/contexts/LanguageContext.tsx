/**
 * Context de Idioma (i18n)
 * 
 * Fornece estado global do idioma selecionado pelo usuário e funções para alternar entre idiomas.
 * Salva a preferência do usuário no localStorage.
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';

// ============================================================================
// TIPOS
// ============================================================================

export type Language = 'pt-BR' | 'en';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  isPortuguese: () => boolean;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const LANGUAGE_STORAGE_KEY = 'helldivers_language';

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Detecta o idioma do navegador do usuário
 * @returns 'pt-BR' se for português, caso contrário 'en'
 */
function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'pt-BR';
  }

  const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
  const normalizedLang = browserLang.toLowerCase().split('-')[0];
  
  if (normalizedLang === 'pt') {
    return 'pt-BR';
  }
  
  return 'en';
}

/**
 * Carrega o idioma salvo no localStorage ou detecta do navegador
 * @returns Idioma salvo ou detectado
 */
function loadSavedLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'pt-BR';
  }

  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === 'pt-BR' || saved === 'en') {
    return saved as Language;
  }
  
  return detectBrowserLanguage();
}

/**
 * Salva o idioma no localStorage
 * @param lang - Idioma para salvar
 */
function saveLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

/**
 * Provider do Context de Idioma
 * @param children - Componentes filhos
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [language, setLanguageState] = useState<Language>(() => {
    // Inicializa com o idioma salvo ou detectado do navegador
    return loadSavedLanguage();
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Carrega o idioma salvo ao montar o componente
   */
  useEffect(() => {
    const savedLang = loadSavedLanguage();
    setLanguageState(savedLang);
  }, []);

  // ============================================================================
  // FUNÇÕES
  // ============================================================================

  /**
   * Define o idioma atual
   * @param lang - Idioma para definir
   */
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
  };

  /**
   * Alterna entre português e inglês
   */
  const toggleLanguage = () => {
    const newLang = language === 'pt-BR' ? 'en' : 'pt-BR';
    setLanguage(newLang);
  };

  /**
   * Verifica se o idioma atual é português
   * @returns true se for pt-BR
   */
  const isPortuguese = () => {
    return language === 'pt-BR';
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        isPortuguese,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// ============================================================================
// HOOK CUSTOMIZADO
// ============================================================================

/**
 * Hook para consumir o Context de Idioma
 * @returns Context de idioma
 * @throws Error se usado fora do LanguageProvider
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

