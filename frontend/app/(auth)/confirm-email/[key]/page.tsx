/**
 * Página de Confirmação de Email
 * 
 * Confirma o email do usuário usando a chave de confirmação recebida por email
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

// 1. React e Next.js
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// 2. Contextos e Hooks customizados
import { useTranslation } from '@/lib/translations';

// 3. Componentes
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function ConfirmEmailPage() {
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      const key = params?.key as string;

      if (!key) {
        setStatus('error');
        setMessage(t('confirmEmail.invalidLink'));
        return;
      }

      // Definir mensagem inicial de loading
      setMessage(t('confirmEmail.loadingMessage'));

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        // Obter idioma atual do localStorage
        const savedLanguage = typeof window !== 'undefined' 
          ? localStorage.getItem('helldivers_language') || 'pt-BR'
          : 'pt-BR';
        const languageHeader = savedLanguage === 'pt-BR' ? 'pt-br' : 'en';
        
        const response = await fetch(`${apiUrl}/api/v1/verify-email/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': languageHeader,
          },
          credentials: 'include', // Para enviar cookies
          body: JSON.stringify({ key }),
        });
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            const backendMessage = data.detail || data.message;
            
            // Backend já retorna mensagem no idioma correto
            setStatus('success');
            setMessage(backendMessage || t('confirmEmail.successMessage'));
          } else {
            setStatus('success');
            setMessage(t('confirmEmail.successMessage'));
          }
          // Redirecionar para armory após 2 segundos
          setTimeout(() => {
            router.push('/armory');
          }, 2000);
        } else {
          const contentType = response.headers.get('content-type');
          let errorMessage = t('confirmEmail.errorMessage');
          
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            // Backend já retorna mensagem no idioma correto baseado no Accept-Language header
            errorMessage = data.detail || data.error || data.message || errorMessage;
          } else {
            errorMessage = `${t('confirmEmail.errorMessage')} - ${response.status}: ${response.statusText}`;
          }
          
          setStatus('error');
          setMessage(errorMessage);
        }
      } catch (error) {
        setStatus('error');
        setMessage(t('confirmEmail.errorMessage'));
      }
    };

    confirmEmail();
  }, [params, router, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center py-6">
          {status === 'loading' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[var(--bg-tertiary)] mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--holo-cyan)]"></div>
              </div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">{t('confirmEmail.loading')}</h3>
              <p className="text-[var(--text-secondary)]">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[var(--bg-tertiary)] mb-4">
                <svg className="h-6 w-6 text-[var(--terminal-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">{t('confirmEmail.success')}</h3>
              <p className="text-[var(--text-secondary)] mb-4">{message}</p>
              <p className="text-sm text-[var(--text-muted)]">{t('confirmEmail.redirecting')}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[var(--bg-tertiary)] mb-4">
                <svg className="h-6 w-6 text-[var(--alert-red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">{t('confirmEmail.error')}</h3>
              <p className="text-[var(--text-secondary)] mb-4">{message}</p>
              <Button onClick={() => router.push('/armory')} fullWidth>
                {t('confirmEmail.goToArmory')}
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

