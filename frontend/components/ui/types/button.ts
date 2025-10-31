/**
 * Types para o componente Button
 */

import type { ButtonHTMLAttributes } from 'react';

/**
 * Variantes de estilo do botão
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

/**
 * Tamanhos do botão
 */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props do componente Button
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante de estilo do botão */
  variant?: ButtonVariant;
  /** Tamanho do botão */
  size?: ButtonSize;
  /** Se o botão deve ocupar toda a largura disponível */
  fullWidth?: boolean;
  /** Se o botão está em estado de carregamento */
  loading?: boolean;
}

