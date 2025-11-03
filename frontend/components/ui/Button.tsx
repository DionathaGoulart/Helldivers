/**
 * Componente Button reutilizável - Estética Helldivers 2
 * 
 * Botão estilizado com suporte a múltiplas variantes, tamanhos e estados.
 * Design baseado na propaganda militar futurista da Super Earth.
 */

// ============================================================================
// IMPORTS
// ============================================================================

// 1. React e Next.js
import React from 'react';

// 2. Tipos
import type { ButtonProps } from './types/button';

// 3. Estilos
import './Button.css';

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Componente Button
 * @param props - Props do componente
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const widthClass = fullWidth ? 'hd-button--full' : '';
  const loadingClass = loading ? 'hd-button--loading' : '';

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <button
      className={`hd-button hd-button--${variant} hd-button--${size} ${widthClass} ${loadingClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      <span className="hd-button__text">
        {loading && <span className="hd-button__spinner" />}
        {children}
      </span>
      <span className="hd-button__glow"></span>
    </button>
  );
}
