'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    new_password1: '',
    new_password2: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uid, setUid] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const uidParam = searchParams.get('uid');
    const tokenParam = searchParams.get('token');

    if (!uidParam || !tokenParam) {
      setError('Link inválido ou expirado');
    } else {
      setUid(uidParam);
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (formData.new_password1 !== formData.new_password2) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      await resetPassword(uid, token, formData.new_password1, formData.new_password2);
      setSuccess(true);
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      const errors = err.response?.data;
      if (errors?.new_password2) {
        setError(errors.new_password2[0]);
      } else if (errors?.token) {
        setError('Token inválido ou expirado');
      } else {
        setError('Erro ao redefinir senha');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Redefinir senha</h2>
          <p className="text-gray-600">Digite sua nova senha</p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Senha redefinida!</h3>
            <p className="text-gray-600">Redirecionando para login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Nova senha"
              type="password"
              value={formData.new_password1}
              onChange={(e) => setFormData({ ...formData, new_password1: e.target.value })}
              required
              placeholder="Digite sua nova senha"
            />

            <Input
              label="Confirmar nova senha"
              type="password"
              value={formData.new_password2}
              onChange={(e) => setFormData({ ...formData, new_password2: e.target.value })}
              required
              placeholder="Digite a senha novamente"
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading || !uid || !token}
            >
              Redefinir senha
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}

