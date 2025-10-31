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
  const [showPassword, setShowPassword] = useState({ new_password1: false, new_password2: false });
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

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
        const response = await api.get('/api/v1/password/reset/confirm/', {
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

  // Validar força da senha em tempo real
  useEffect(() => {
    const password = formData.new_password1;
    
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [formData.new_password1]);

  // Mostrar loading enquanto verifica
  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Card className="w-full max-w-md text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--holo-cyan)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Verificando link...</p>
        </Card>
      </div>
    );
  }

  // Se houver erro na verificação, mostrar mensagem
  if (error && !uid && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[var(--bg-tertiary)] mb-4">
              <svg className="h-6 w-6 text-[var(--alert-red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Link Inválido</h3>
            <p className="text-[var(--text-secondary)] mb-4">{error}</p>
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Redefinir senha</h2>
          <p className="text-[var(--text-secondary)]">Digite sua nova senha</p>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[var(--bg-tertiary)] mb-4">
              <svg className="h-6 w-6 text-[var(--terminal-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">Senha redefinida!</h3>
            <p className="text-[var(--text-secondary)]">Redirecionando para login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-[var(--bg-tertiary)] border border-[var(--alert-red)] text-[var(--alert-red)] px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <div className="relative">
                <Input
                  label="Nova senha"
                  type={showPassword.new_password1 ? 'text' : 'password'}
                  value={formData.new_password1}
                  onChange={(e) => setFormData({ ...formData, new_password1: e.target.value })}
                  required
                  placeholder="Digite sua nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, new_password1: !prev.new_password1 }))}
                  className="absolute right-3 top-[calc(1.25rem+8px+12px+0.625rem)] -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex items-center justify-center z-10"
                >
                  {showPassword.new_password1 ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {formData.new_password1 && (
                <div className="mt-2 space-y-1 text-xs">
                  <div className={`flex items-center ${passwordStrength.length ? 'text-[var(--terminal-green)]' : 'text-[var(--text-muted)]'}`}>
                    <svg className={`w-4 h-4 mr-2 ${passwordStrength.length ? 'text-[var(--terminal-green)]' : 'text-[var(--text-muted)]'}`} fill="currentColor" viewBox="0 0 20 20">
                      {passwordStrength.length ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M4 10a6 6 0 1112 0A6 6 0 014 10zm12 0a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      )}
                    </svg>
                    Mínimo 8 caracteres
                  </div>
                  <div className={`flex items-center ${passwordStrength.uppercase ? 'text-[var(--terminal-green)]' : 'text-[var(--text-muted)]'}`}>
                    <svg className={`w-4 h-4 mr-2 ${passwordStrength.uppercase ? 'text-[var(--terminal-green)]' : 'text-[var(--text-muted)]'}`} fill="currentColor" viewBox="0 0 20 20">
                      {passwordStrength.uppercase ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M4 10a6 6 0 1112 0A6 6 0 014 10zm12 0a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      )}
                    </svg>
                    Uma letra maiúscula
                  </div>
                  <div className={`flex items-center ${passwordStrength.lowercase ? 'text-[var(--terminal-green)]' : 'text-[var(--text-muted)]'}`}>
                    <svg className={`w-4 h-4 mr-2 ${passwordStrength.lowercase ? 'text-[var(--terminal-green)]' : 'text-[var(--text-muted)]'}`} fill="currentColor" viewBox="0 0 20 20">
                      {passwordStrength.lowercase ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M4 10a6 6 0 1112 0A6 6 0 014 10zm12 0a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      )}
                    </svg>
                    Uma letra minúscula
                  </div>
                  <div className={`flex items-center ${passwordStrength.number ? 'text-[var(--terminal-green)]' : 'text-[var(--text-muted)]'}`}>
                    <svg className={`w-4 h-4 mr-2 ${passwordStrength.number ? 'text-[var(--terminal-green)]' : 'text-[var(--text-muted)]'}`} fill="currentColor" viewBox="0 0 20 20">
                      {passwordStrength.number ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M4 10a6 6 0 1112 0A6 6 0 014 10zm12 0a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      )}
                    </svg>
                    Um número
                  </div>
                  <div className={`flex items-center ${passwordStrength.special ? 'text-[var(--terminal-green)]' : 'text-[var(--text-muted)]'}`}>
                    <svg className={`w-4 h-4 mr-2 ${passwordStrength.special ? 'text-[var(--terminal-green)]' : 'text-[var(--text-muted)]'}`} fill="currentColor" viewBox="0 0 20 20">
                      {passwordStrength.special ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M4 10a6 6 0 1112 0A6 6 0 014 10zm12 0a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      )}
                    </svg>
                    Um caractere especial (!@#$%^&*...)
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <Input
                label="Confirmar nova senha"
                type={showPassword.new_password2 ? 'text' : 'password'}
                value={formData.new_password2}
                onChange={(e) => setFormData({ ...formData, new_password2: e.target.value })}
                required
                placeholder="Digite a senha novamente"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, new_password2: !prev.new_password2 }))}
                className="absolute right-3 top-[calc(1.25rem+8px+12px+0.625rem)] -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex items-center justify-center z-10"
              >
                {showPassword.new_password2 ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

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

