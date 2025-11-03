/**
 * Hook para gerenciar estado de modais
 * 
 * Fornece funcionalidades comuns para modais:
 * - Abrir/fechar
 * - Fechar com ESC
 * - Prevenir scroll quando aberto
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UseModalOptions {
  /** Callback quando o modal é fechado */
  onClose?: () => void;
  /** Callback quando o modal é aberto */
  onOpen?: () => void;
  /** Prevenir scroll do body quando aberto */
  preventScroll?: boolean;
  /** Fechar com tecla ESC */
  closeOnEscape?: boolean;
}

export interface UseModalReturn {
  /** Se o modal está aberto */
  isOpen: boolean;
  /** Abrir o modal */
  open: () => void;
  /** Fechar o modal */
  close: () => void;
  /** Alternar estado do modal */
  toggle: () => void;
}

/**
 * Hook para gerenciar estado de modais
 */
export function useModal(options: UseModalOptions = {}): UseModalReturn {
  const {
    onClose,
    onOpen,
    preventScroll = true,
    closeOnEscape = true,
  } = options;

  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  // Fechar com ESC
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, close]);

  // Prevenir scroll quando aberto
  useEffect(() => {
    if (!preventScroll) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, preventScroll]);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

