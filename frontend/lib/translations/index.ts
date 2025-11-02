/**
 * Sistema de Tradução
 * 
 * Centraliza todas as traduções e fornece função para obter textos traduzidos
 */

import { ptBR } from './pt-BR';
import { en } from './en';
import { useLanguage } from '@/contexts/LanguageContext';

export type TranslationKey = keyof typeof ptBR;

/**
 * Função auxiliar para substituir placeholders em strings
 * Exemplo: replacePlaceholders('{count} resultados', { count: 5 }) => '5 resultados'
 */
function replacePlaceholders(text: string, params: Record<string, string | number>): string {
  let result = text;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  });
  return result;
}

/**
 * Hook para usar traduções nos componentes
 * @returns Função t() para obter traduções
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { t } = useTranslation();
 *   return <h1>{t('header.superEarth')}</h1>;
 * }
 * ```
 */
export function useTranslation() {
  const { language } = useLanguage();
  const translations = language === 'pt-BR' ? ptBR : en;

  /**
   * Obtém uma tradução
   * @param key - Chave da tradução (ex: 'header.superEarth')
   * @param params - Parâmetros para substituir placeholders (opcional)
   * @returns Texto traduzido
   * 
   * @example
   * t('armory.results', { count: 5 }) => '5 resultado(s) encontrado(s)'
   */
  function t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Se a chave não existir, retorna a própria chave
        return key;
      }
    }
    
    if (typeof value !== 'string') {
      return key;
    }
    
    if (params) {
      return replacePlaceholders(value, params);
    }
    
    return value;
  }

  return { t };
}

/**
 * Exporta as traduções para uso fora de componentes React
 */
export { ptBR, en };

