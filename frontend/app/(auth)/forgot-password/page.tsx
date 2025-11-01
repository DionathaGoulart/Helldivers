'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { formatError } from '@/lib/error-utils';

export default function ForgotPasswordPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 
            className="text-3xl font-bold mb-2 uppercase tracking-wider"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              color: 'var(--text-primary)',
              textShadow: '0 0 10px rgba(0,217,255,0.8)',
            }}
          >
            RECUPERAR CÓDIGO DE AUTORIZAÇÃO
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Envie um novo código de autorização para seu email, cidadão
          </p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[var(--bg-tertiary)] mb-4">
              <svg className="h-6 w-6 text-[var(--terminal-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2 uppercase">CÓDIGO ENVIADO!</h3>
            <p className="text-[var(--text-secondary)] mb-4">Verifique sua caixa de entrada. Um novo código de autorização foi enviado para servir a Democracia™.</p>
            <Link href="/login">
              <Button variant="outline" fullWidth>VOLTAR PARA AUTORIZAÇÃO</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div 
                className="px-4 py-3 border-2 border-[var(--alert-red)]"
                style={{
                  backgroundColor: 'rgba(255,51,51,0.1)',
                  color: 'var(--alert-red)',
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                }}
              >
                ⚠ {error}
              </div>
            )}

            <Input
              label="ID DE OPERATIVO (EMAIL)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ID DE OPERATIVO"
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              {loading ? 'ENVIANDO CÓDIGO...' : 'ENVIAR CÓDIGO DE AUTORIZAÇÃO'}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Lembrou do código?{' '}
          <Link 
            href="/login" 
            className="hover:opacity-80 transition-opacity font-medium" 
            style={{ color: 'var(--holo-cyan)' }}
          >
            AUTORIZAR ACESSO
          </Link>
        </p>
      </Card>
    </div>
  );
}

