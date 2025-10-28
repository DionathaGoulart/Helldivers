'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { resetPassword } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import api from '@/lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    new_password1: '',
    new_password2: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uid, setUid] = useState('');
  const [token, setToken] = useState('');

  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    // Verificar validade do token ao carregar a página
    const checkToken = async () => {
      const uidParam = params?.uid as string;
      const tokenParam = params?.token as string;

      if (!uidParam || !tokenParam) {
        setError('Link inválido ou expirado');
        setCheckingToken(false);
        return;
      }

      try {
        // Verificar se o token é válido e não foi usado
        const response = await api.get('/api/password/reset/confirm/', {
          params: { uid: uidParam, token: tokenParam }
        });
        
        if (response.data.valid) {
          setUid(uidParam);
          setToken(tokenParam);
          setCheckingToken(false);
        }
      } catch (err: any) {
        const errors = err.response?.data;
        if (errors?.error) {
          setError(Array.isArray(errors.error) ? errors.error[0] : errors.error);
        } else {
          setError('Link inválido ou expirado');
        }
        setCheckingToken(false);
      }
    };

    checkToken();
  }, [params]);

  // Mostrar loading enquanto verifica
  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando link...</p>
        </Card>
      </div>
    );
  }

  // Se houver erro na verificação, mostrar mensagem
  if (error && !uid && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Link Inválido</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/login')} fullWidth>
              Voltar para Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

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
      
      // Mensagem específica para quando tentar usar a senha atual
      if (errors?.error) {
        const errorMsg = Array.isArray(errors.error) ? errors.error[0] : errors.error;
        setError(errorMsg);
      } else if (errors?.new_password2) {
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

