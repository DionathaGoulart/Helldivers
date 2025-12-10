/**
 * Componente LoadingSpinner - Estética Helldivers 2
 * 
 * Spinner de carregamento reutilizável em diferentes tamanhos.
 * Design baseado na estética militar futurista da Super Earth.
 */

import React from 'react';
import { useTranslation } from '@/lib/translations';

// ============================================================================
// TYPES
// ============================================================================

interface LoadingSpinnerProps {
  /** Tamanho do spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Texto opcional a ser exibido. Se não fornecido, usa a tradução padrão */
  text?: string | null;
}

// ============================================================================
// CONSTANTES
// ============================================================================

type SizeType = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<SizeType, string> = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Componente LoadingSpinner
 * @param props - Props do componente
 */
export default function LoadingSpinner({ 
  size = 'md',
  text
}: LoadingSpinnerProps) {
  const { t } = useTranslation();
  const displayText = text !== undefined ? text : t('armory.loading');
  const borderWidth = size === 'sm' ? 'border-[2px]' : size === 'md' ? 'border-[3px]' : 'border-[4px]';
  
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <div className={`${SIZE_CLASSES[size]} ${borderWidth} border-t-[#00d9ff] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(0,217,255,0.5)]`} />
      {displayText && (
        <p className="text-sm font-['Rajdhani'] font-bold text-[#00d9ff] uppercase tracking-wider">
          {displayText}
        </p>
      )}
    </div>
  );
}
