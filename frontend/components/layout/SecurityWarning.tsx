'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/translations';

export default function SecurityWarning() {
  const { t } = useTranslation();
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Verifica se o usuário já dispensou o aviso nesta sessão
    const dismissed = sessionStorage.getItem('security-warning-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('security-warning-dismissed', 'true');
  };

  if (!mounted || isDismissed) {
    return null;
  }

  return (
    <div className="relative w-full bg-gradient-to-r from-[var(--alert-red)] via-[var(--democracy-gold)] to-[var(--alert-red)] border-b-2 border-[var(--border-primary)]">
      <div className="container">
        <div className="flex items-center justify-between gap-4 py-3 px-4">
          {/* Ícone de Aviso */}
          <div className="shrink-0">
            <svg 
              className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
          </div>

          {/* Mensagem */}
          <div className="flex-1 text-center">
            <p className="text-white text-xs sm:text-sm font-semibold leading-tight">
              <span className="inline-block mr-2">⚠️</span>
              <span className="font-bold uppercase tracking-wide">{t('securityWarning.title')}</span>
              {' '}{t('securityWarning.message')}
              <span className="font-bold"> {t('securityWarning.warning')}</span>. 
              {' '}{t('securityWarning.note')}
              {' '}{t('securityWarning.googleLogin')}.
            </p>
          </div>

          {/* Botão de Fechar */}
          <button
            onClick={handleDismiss}
            className="shrink-0 text-white hover:opacity-80 transition-opacity p-1 [clip-path:polygon(0_0,calc(100%-4px)_0,100%_4px,100%_100%,4px_100%,0_calc(100%-4px))]"
            aria-label={t('securityWarning.close')}
          >
            <svg 
              className="w-4 h-4 sm:w-5 sm:h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Efeito de brilho animado */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-r from-transparent via-white to-transparent bg-[length:200%_100%] animate-[shimmer_3s_infinite]" />
    </div>
  );
}

