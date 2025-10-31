'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

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
      setError(err.response?.data?.email?.[0] || 'Erro ao enviar email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Esqueceu a senha?</h2>
          <p className="text-[var(--text-secondary)]">Digite seu email e enviaremos um link para redefinir sua senha</p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[var(--bg-tertiary)] mb-4">
              <svg className="h-6 w-6 text-[var(--terminal-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Email enviado!</h3>
            <p className="text-[var(--text-secondary)] mb-4">Verifique sua caixa de entrada e clique no link para redefinir sua senha.</p>
            <Link href="/login">
              <Button variant="outline" fullWidth>Voltar para login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-[var(--bg-tertiary)] border border-[var(--alert-red)] text-[var(--alert-red)] px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Enviar link de recuperação
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          Lembrou da senha?{' '}
          <Link href="/login" className="text-[var(--holo-cyan)] hover:text-[var(--holo-cyan)] hover:opacity-80 font-medium transition-opacity">
            Fazer login
          </Link>
        </p>
      </Card>
    </div>
  );
}

