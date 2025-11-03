/**
 * Hook para gerenciar operações assíncronas
 * 
 * Simplifica o gerenciamento de loading, error e success states
 */

'use client';

import { useState, useCallback } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseAsyncReturn<T> extends UseAsyncState<T> {
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook para gerenciar operações assíncronas
 */
export function useAsync<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  immediate = false
): UseAsyncReturn<T> {
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = useCallback(
    async (...args: unknown[]) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const data = await asyncFunction(...args);
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, loading: false, error: errorObj });
        return null;
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  // Executar imediatamente se solicitado
  if (immediate && !state.loading && state.data === null && state.error === null) {
    execute();
  }

  return {
    ...state,
    execute,
    reset,
  };
}

