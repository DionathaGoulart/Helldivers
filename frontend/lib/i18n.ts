/**
 * Utilitários de Internacionalização (i18n)
 * 
 * Fornece funções para obter textos traduzidos.
 * Suporta português brasileiro (pt-BR) e inglês (en).
 * 
 * NOTA: Este módulo usa o LanguageContext. Use as funções diretamente nos componentes.
 * Elas detectarão automaticamente o idioma do contexto ou usarão o padrão.
 */

/**
 * Detecta o idioma padrão com base no navegador (usado como fallback)
 * @returns 'pt-BR' se for português, caso contrário 'en'
 */
function detectBrowserLanguage(): 'pt-BR' | 'en' {
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
 * Verifica se o idioma atual é português brasileiro
 * Tenta usar o contexto, se não estiver disponível, detecta do navegador
 * @returns true se for pt-BR
 */
export function isPortuguese(): boolean {
  // Tenta usar o contexto se estiver disponível
  if (typeof window !== 'undefined') {
    try {
      const { useLanguage } = require('@/contexts/LanguageContext');
      // Esta função será usada nos componentes com hook, não aqui
    } catch {
      // Context não disponível, usa detecção do navegador
    }
  }
  
  // Fallback: detecta do navegador
  return detectBrowserLanguage() === 'pt-BR';
}

/**
 * Obtém o texto traduzido de um item
 * Retorna o texto em português se disponível e o idioma for pt-BR, 
 * caso contrário retorna o texto em inglês
 * 
 * Esta função deve ser usada dentro de componentes que têm acesso ao LanguageContext.
 * Para uso fora de componentes React, use getTranslatedTextWithLanguage.
 * 
 * @param text - Texto em inglês (original)
 * @param textPtBr - Texto em português brasileiro (opcional)
 * @param isPtBr - Flag indicando se deve usar português (opcional, tenta detectar se não fornecido)
 * @returns O texto apropriado baseado no idioma do usuário
 */
export function getTranslatedText(
  text: string, 
  textPtBr?: string | null, 
  isPtBr?: boolean
): string {
  // Se isPtBr foi fornecido explicitamente, usa ele
  if (isPtBr !== undefined) {
    if (isPtBr && textPtBr && textPtBr.trim() !== '') {
      return textPtBr;
    }
    return text;
  }
  
  // Tenta detectar automaticamente
  if (isPortuguese() && textPtBr && textPtBr.trim() !== '') {
    return textPtBr;
  }
  return text;
}

/**
 * Obtém o nome traduzido de um item de armory
 * @param item - Item que possui name e name_pt_br
 * @param isPtBr - Flag indicando se deve usar português (opcional)
 * @returns Nome traduzido
 */
export function getTranslatedName(
  item: { name: string; name_pt_br?: string | null },
  isPtBr?: boolean
): string {
  return getTranslatedText(item.name, item.name_pt_br, isPtBr);
}

/**
 * Obtém a descrição traduzida de uma passiva
 * @param passive - Passiva que possui description e description_pt_br
 * @param isPtBr - Flag indicando se deve usar português (opcional)
 * @returns Descrição traduzida
 */
export function getTranslatedDescription(
  passive: { description: string; description_pt_br?: string | null },
  isPtBr?: boolean
): string {
  return getTranslatedText(passive.description, passive.description_pt_br, isPtBr);
}

/**
 * Obtém o efeito prático traduzido de uma passiva
 * @param passive - Passiva que possui effect e effect_pt_br
 * @param isPtBr - Flag indicando se deve usar português (opcional)
 * @returns Efeito prático traduzido
 */
export function getTranslatedEffect(
  passive: { effect: string; effect_pt_br?: string | null },
  isPtBr?: boolean
): string {
  return getTranslatedText(passive.effect, passive.effect_pt_br, isPtBr);
}

// ============================================================================
// HOOKS CUSTOMIZADOS PARA USO COM LanguageContext
// ============================================================================

/**
 * Cria funções de tradução que usam o LanguageContext
 * Use este hook nos componentes para obter funções de tradução baseadas no contexto
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { getTranslatedName } = useTranslations();
 *   const armor = ...;
 *   return <h1>{getTranslatedName(armor)}</h1>;
 * }
 * ```
 */
export function useTranslations() {
  // Tenta importar o contexto se estiver disponível
  let useLanguage: any;
  let isPtBr = false;
  
  try {
    const LanguageContext = require('@/contexts/LanguageContext');
    useLanguage = LanguageContext.useLanguage;
    const { isPortuguese } = useLanguage();
    isPtBr = isPortuguese();
  } catch {
    // Context não disponível, usa detecção do navegador
    isPtBr = isPortuguese();
  }
  
  return {
    getTranslatedName: (item: { name: string; name_pt_br?: string | null }) =>
      getTranslatedName(item, isPtBr),
    getTranslatedDescription: (passive: { description: string; description_pt_br?: string | null }) =>
      getTranslatedDescription(passive, isPtBr),
    getTranslatedEffect: (passive: { effect: string; effect_pt_br?: string | null }) =>
      getTranslatedEffect(passive, isPtBr),
    isPtBr,
  };
}

