/**
 * Página de Recuperação de Senha
 * 
 * Permite que usuários solicitem recuperação de senha via email
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

// 1. React e Next.js
import { useState } from 'react';
import Link from 'next/link';

// 2. Contextos e Hooks customizados
import { useTranslation } from '@/lib/translations';

// 3. Componentes
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

// 4. Utilitários e Constantes
import { formatError } from '@/lib/error-utils';

// 5. Serviços e Libs
import { forgotPassword } from '@/lib/auth-cached';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      const errorMessage = formatError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1419] py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold mb-2 uppercase tracking-wider font-['Orbitron'] text-white">
            {t('auth.forgotPassword.title')}
          </h2>
          <p className="text-gray-400">
            {t('auth.forgotPassword.subtitle')}
          </p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#2a3a4a] mb-4">
              <svg className="h-6 w-6 text-[#39ff14]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-white mb-2 uppercase">{t('auth.forgotPassword.success')}</h3>
            <p className="text-gray-400 mb-4">{t('auth.forgotPassword.successMessage')}</p>
            <Link href="/login">
              <Button variant="outline" fullWidth>{t('auth.forgotPassword.backToLogin')}</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-4 py-3 border-2 border-[#ff3333] bg-[rgba(255,51,51,0.1)] text-[#ff3333] [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)]">
                ⚠ {error}
              </div>
            )}

            <Input
              label={t('auth.forgotPassword.operativeEmail')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t('auth.forgotPassword.operativeEmailPlaceholder')}
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {loading ? t('auth.forgotPassword.submitting') : t('auth.forgotPassword.submit')}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-400">
          {t('auth.forgotPassword.remembered')}{' '}
          <Link 
            href="/login" 
            className="hover:opacity-80 transition-opacity font-medium text-[#00d9ff]"
          >
            {t('auth.forgotPassword.signIn')}
          </Link>
        </p>
      </Card>
    </div>
  );
}

