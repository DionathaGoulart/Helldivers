'use client';

import { useEffect } from 'react';
import { checkGlobalVersion } from '@/lib/cache';

export default function CacheManager() {
    useEffect(() => {
        // Verifica versão ao montar
        checkGlobalVersion();

        // Opcional: Verificar periodicamente (ex: a cada 5 minutos)
        const interval = setInterval(() => {
            checkGlobalVersion();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return null; // Este componente não renderiza nada visualmente
}
