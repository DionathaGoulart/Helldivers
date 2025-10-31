/**
 * Componente LoadingSpinner - Estética Helldivers 2
 * 
 * Spinner de carregamento reutilizável em diferentes tamanhos.
 * Design baseado na estética militar futurista da Super Earth.
 */

import React from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface LoadingSpinnerProps {
  /** Tamanho do spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Texto opcional a ser exibido */
  text?: string;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const SIZE_CLASSES: Record<LoadingSpinnerProps['size'], string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
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
  text = 'TRANSMISSÃO INCOMING...'
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <div
        className={`${SIZE_CLASSES[size]} border-t-2 border-[var(--holo-cyan)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin`}
        style={{
          borderTopColor: 'var(--holo-cyan)',
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
          boxShadow: '0 0 20px rgba(0,217,255,0.5)',
        }}
      />
      {text && (
        <p 
          className="text-sm font-rajdhani font-bold text-[var(--holo-cyan)] uppercase tracking-wider"
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            textShadow: '0 0 10px rgba(0,217,255,0.8)',
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
}
