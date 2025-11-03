/**
 * Hook para validar força de senha
 * 
 * Retorna o estado de validação de cada critério de senha forte
 */

'use client';

import { useState, useEffect, useMemo } from 'react';

export interface PasswordStrength {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

/**
 * Hook para validar força de senha
 */
export function usePasswordStrength(password: string): PasswordStrength {
  const [strength, setStrength] = useState<PasswordStrength>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    setStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  return strength;
}

/**
 * Verifica se a senha atende a todos os critérios
 */
export function isPasswordStrong(strength: PasswordStrength): boolean {
  return Object.values(strength).every(Boolean);
}

