/**
 * Componente Card reutilizável - Estética Helldivers 2
 * 
 * Container estilizado para agrupar conteúdo relacionado.
 * Design baseado na estética militar futurista da Super Earth.
 */

// ============================================================================
// IMPORTS
// ============================================================================

// 1. React e Next.js
import React from 'react';

// 2. Estilos
import './Card.css';

// ============================================================================
// TYPES
// ============================================================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  classified?: boolean;
  glowColor?: 'cyan' | 'gold' | 'green' | 'red';
}

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Componente Card
 * @param props - Props do componente
 */
export default function Card({
  children,
  className = '',
  title,
  classified = false,
  glowColor = 'cyan',
}: CardProps) {
  return (
    <div className={`hd-card hd-card--glow-${glowColor} ${className}`}>
      {title && (
        <div className="hd-card__header">
          <h3 className="hd-card__title">{title}</h3>
          {classified && (
            <span className="hd-card__badge">CLASSIFICADO</span>
          )}
        </div>
      )}
      <div className="hd-card__content">
        {children}
      </div>
      <div className="hd-card__corner hd-card__corner--tl"></div>
      <div className="hd-card__corner hd-card__corner--tr"></div>
      <div className="hd-card__corner hd-card__corner--bl"></div>
      <div className="hd-card__corner hd-card__corner--br"></div>
    </div>
  );
}
