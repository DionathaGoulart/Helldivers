/**
 * Componente Input reutilizável - Estética Helldivers 2
 * 
 * Campo de entrada de texto com suporte a label, validação e mensagens de erro.
 * Design baseado na estética militar futurista da Super Earth.
 */

// ============================================================================
// IMPORTS
// ============================================================================

// 1. React e Next.js
import React from 'react';

// 2. Estilos
import './Input.css';

// ============================================================================
// TYPES
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label do campo */
  label?: string;
  /** Mensagem de erro a ser exibida */
  error?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Obtém mensagem de validação personalizada baseada no tipo e requisitos do campo
 * @param required - Se o campo é obrigatório
 * @param type - Tipo do input (email, password, etc.)
 * @returns Mensagem de validação ou undefined
 */
const getValidationMessage = (
  required: boolean | undefined,
  type: string | undefined
): string | undefined => {
  if (!required) return undefined;
  
  if (type === 'email') {
    return 'ID DE OPERATIVO INVÁLIDO. Verifique suas credenciais.';
  }
  
  return 'CAMPO OBRIGATÓRIO. Preencha para continuar.';
};

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Componente Input
 * @param props - Props do componente
 */
export default function Input({
  label,
  error,
  className = '',
  required,
  ...props
}: InputProps) {
  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="hd-input-wrapper">
      {label && (
        <label className="hd-input-label">
          {label}
          {required && <span className="hd-input-required">*</span>}
        </label>
      )}
      <div className="hd-input-container">
        <input
          className={`hd-input ${error ? 'hd-input--error' : ''} ${className}`}
          {...props}
          required={required}
          onInvalid={(e) => {
            const target = e.target as HTMLInputElement;
            if (required && target.validity.valueMissing) {
              const message =
                getValidationMessage(required, props.type) ||
                'CAMPO OBRIGATÓRIO. Preencha para continuar.';
              target.setCustomValidity(message);
            }
          }}
          onInput={(e) => {
            const target = e.target as HTMLInputElement;
            target.setCustomValidity('');
          }}
        />
        <div className="hd-input-border"></div>
      </div>
      {error && (
        <span className="hd-input-error">
          ⚠ {error}
        </span>
      )}
    </div>
  );
}
