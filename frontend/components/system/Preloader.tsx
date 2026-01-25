'use client';

import { useEffect, useState } from 'react';
import { checkAndPreload, executePreload, hasBasicCache } from '@/lib/preload';
import { useAuth } from '@/contexts/AuthContext';

export default function Preloader({ children }: { children: React.ReactNode }) {
    // INICIALIZAÇÃO SÍNCRONA:
    // Verifica o cache IMEDIATAMENTE na criação do estado
    // Se tiver cache, loading começa como FALSE (sem flash)
    // Se não tiver cache ou estiver no servidor, começa como TRUE
    const [loading, setLoading] = useState(() => {
        // Se rodando no server, sempre true
        if (typeof window === 'undefined') return true;
        // Se tem cache, já começa DESLIGADO (Instantâneo)
        return !hasBasicCache();
    });

    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('INITIALIZING UPLINK');

    // Usa AuthContext para verificar estado de login
    const { loading: authLoading, user } = useAuth();

    // Evita executar duas vezes
    const [checkRun, setCheckRun] = useState(false);

    useEffect(() => {
        // Se já carregamos instantaneamente (loading = false), 
        // apenas rodamos a verificação em background sem travar nada
        if (!loading) {
            if (checkRun) return;
            setCheckRun(true);

            // Background Check
            checkAndPreload().then(async (needsUpdate) => {
                if (needsUpdate) {
                    console.log('[Background] Updating content...');
                    // Se precisar atualizar, usa estado atual de user
                    // (pode ser null se auth ainda não carregou, mas ok para background update)
                    const isAuthenticated = !!user;
                    await executePreload(isAuthenticated);
                }
            });
            return;
        }

        // Se estamos mostrando o Loading (loading = true), aí sim esperamos o Auth
        // para decidir se carregamos dados de usuário ou não
        if (authLoading || checkRun) return;

        const init = async () => {
            setCheckRun(true);

            // Dupla checagem (caso o estado inicial tenha falhado ou mudado)
            // Se tem cache, aborta loading visual agora
            if (hasBasicCache()) {
                setLoading(false);
                return;
            }

            // --- FLUXO NORMAL DE PRELOAD (Primeira visita ou cache limpo) ---
            const needsPreload = await checkAndPreload();

            if (!needsPreload) {
                setLoading(false);
                return;
            }

            setStatus('DOWNLOADING ASSETS');

            const isAuthenticated = !!user;

            await executePreload(isAuthenticated, (p) => {
                setProgress(p);
            });

            setStatus('READY');
            setLoading(false);
        };

        init();
    }, [authLoading, user, checkRun, loading]);

    if (!loading) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-[#0f1419] flex flex-col items-center justify-center text-[#00d9ff] font-['Orbitron']">

            {/* Container Hexagonal / Logo Placeholder */}
            <div className="relative mb-12">
                <div className="w-32 h-32 border-4 border-[#ffe800] rotate-45 flex items-center justify-center shadow-[0_0_20px_rgba(255,232,0,0.3)]">
                    <div className="w-24 h-24 bg-[#ffe800]/10" />
                </div>
                {/* Animated Rings */}
                <div className="absolute inset-0 border-2 border-[#00d9ff]/30 w-48 h-48 -top-8 -left-8 rounded-full animate-spin-slow" />
                <div className="absolute inset-0 border border-[#00d9ff]/20 w-64 h-64 -top-16 -left-16 rounded-full animate-reverse-spin" />
            </div>

            <h1 className="text-4xl font-bold tracking-[0.2em] mb-8 text-[#ffe800]">
                HELLDIVERS
            </h1>

            {/* Progress Bar Container */}
            <div className="w-80 h-2 bg-[#1a2332] relative overflow-hidden mb-4 border border-[#3a4a5a]">
                {/* Progress Bar Fill */}
                <div
                    className="h-full bg-[#ffe800] transition-all duration-300 ease-out shadow-[0_0_10px_#ffe800]"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Status Text */}
            <div className="h-6 flex items-center justify-between w-80 text-xs font-['Barlow_Condensed'] tracking-widest text-[#00d9ff]/80">
                <span>{status}</span>
                <span>{progress}%</span>
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-10 text-[10px] text-gray-600 font-mono">
                SECURE CONNECTION // TERMINAL ACCESS GRANTED
            </div>

        </div>
    );
}
