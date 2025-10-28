'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password1: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validação de senha
    if (formData.password1 !== formData.password2) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      router.push('/dashboard');
    } catch (err: any) {
      // Limpar erros anteriores
      setFieldErrors({
        username: '',
        email: '',
        password1: '',
        password2: '',
      });
      
      // Tratamento detalhado de erros
      const errors = err.response?.data;
      let errorMessage = '';
      const newFieldErrors = {
        username: '',
        email: '',
        password1: '',
        password2: '',
      };
      
      if (errors) {
        // Verificar TODOS os erros possíveis (não só o primeiro)
        let hasFieldError = false;
        
        // Erro de email já em uso
        if (errors.email) {
          const emailError = Array.isArray(errors.email) ? errors.email[0] : errors.email;
          newFieldErrors.email = emailError;
          hasFieldError = true;
        }
        
        // Erro de username já em uso
        if (errors.username) {
          const usernameError = Array.isArray(errors.username) ? errors.username[0] : errors.username;
          newFieldErrors.username = usernameError;
          hasFieldError = true;
        }
        
        // Erro de senha 1
        if (errors.password1) {
          const pwdError = Array.isArray(errors.password1) ? errors.password1[0] : errors.password1;
          newFieldErrors.password1 = pwdError;
          hasFieldError = true;
        }
        
        // Erro de senha 2
        if (errors.password2) {
          const pwdError = Array.isArray(errors.password2) ? errors.password2[0] : errors.password2;
          newFieldErrors.password2 = pwdError;
          hasFieldError = true;
        }
        
        // Se tiver erros de campo, mostrar mensagem genérica
        if (hasFieldError) {
          errorMessage = 'Verifique os erros nos campos abaixo';
        }
        // Erros gerais do serializer
        else if (errors.detail) {
          errorMessage = errors.detail;
        }
        else if (typeof errors === 'string') {
          errorMessage = errors;
        }
        else {
          errorMessage = 'Erro ao criar conta';
        }
      } else {
        errorMessage = 'Erro ao criar conta. Verifique sua conexão.';
      }
      
      // Aplicar TODOS os erros de campo
      setFieldErrors(newFieldErrors);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    const redirectUri = `${window.location.origin}/api/auth/google`;
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email profile`;
    
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Criar Conta</h2>
          <p className="text-gray-600">Preencha seus dados para começar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nome"
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              placeholder="Seu nome"
            />
            <Input
              label="Sobrenome"
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              placeholder="Seu sobrenome"
            />
          </div>

          <Input
            label="Usuário"
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            required
            placeholder="Escolha um nome de usuário"
            error={fieldErrors.username}
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="seu@email.com"
            error={fieldErrors.email}
          />

          <Input
            label="Senha"
            type="password"
            value={formData.password1}
            onChange={(e) => setFormData({ ...formData, password1: e.target.value })}
            required
            placeholder="Mínimo 8 caracteres"
            error={fieldErrors.password1}
          />

          <Input
            label="Confirmar Senha"
            type="password"
            value={formData.password2}
            onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
            required
            placeholder="Digite a senha novamente"
            error={fieldErrors.password2}
          />

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Criar Conta
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            fullWidth
            className="mt-4"
            onClick={handleGoogleRegister}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Criar com Google
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Fazer login
          </Link>
        </p>
      </Card>
    </div>
  );
}

