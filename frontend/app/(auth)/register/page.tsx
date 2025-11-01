'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { checkUsername, checkEmail } from '@/lib/auth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { formatError, formatFieldErrors } from '@/lib/error-utils';

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
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password1: '',
    password2: '',
  });
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState({ username: false, email: false });
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [showPassword, setShowPassword] = useState({ password1: false, password2: false });

  // Função para validar username em tempo real
  const validateUsername = useCallback(
    async (username: string) => {
      if (!username || username.length < 3) {
        if (username.length > 0) {
          setFieldErrors(prev => ({ ...prev, username: 'O username deve ter pelo menos 3 caracteres' }));
        } else {
          setFieldErrors(prev => ({ ...prev, username: '' }));
        }
        return;
      }

      setChecking(prev => ({ ...prev, username: true }));
      try {
        const available = await checkUsername(username);
        if (!available) {
          setFieldErrors(prev => ({ ...prev, username: 'Este nome de usuário já está sendo usado' }));
        } else {
          setFieldErrors(prev => ({ ...prev, username: '' }));
        }
      } catch (error) {
        // Erro ao verificar username
      } finally {
        setChecking(prev => ({ ...prev, username: false }));
      }
    },
    []
  );

  // Função para validar email em tempo real
  const validateEmail = useCallback(
    async (email: string) => {
      if (!email) {
        setFieldErrors(prev => ({ ...prev, email: '' }));
        return;
      }

      // Validação básica de formato
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setFieldErrors(prev => ({ ...prev, email: 'Digite um email válido' }));
        return;
      }

      setChecking(prev => ({ ...prev, email: true }));
      try {
        const available = await checkEmail(email);
        if (!available) {
          setFieldErrors(prev => ({ ...prev, email: 'Este email já está sendo usado' }));
        } else {
          setFieldErrors(prev => ({ ...prev, email: '' }));
        }
      } catch (error) {
        // Erro ao verificar email
      } finally {
        setChecking(prev => ({ ...prev, email: false }));
      }
    },
    []
  );

  // Debounce para username
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.username) {
        validateUsername(formData.username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, validateUsername]);

  // Debounce para email
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email) {
        validateEmail(formData.email);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email, validateEmail]);

  // Validar força da senha em tempo real
  useEffect(() => {
    const password = formData.password1;
    
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [formData.password1]);

  // Validar se as senhas coincidem
  useEffect(() => {
    if (formData.password2 && formData.password1 !== formData.password2) {
      setFieldErrors(prev => ({ ...prev, password2: 'As senhas não coincidem' }));
    } else if (formData.password2 && formData.password1 === formData.password2) {
      setFieldErrors(prev => ({ ...prev, password2: '' }));
    }
  }, [formData.password1, formData.password2]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validação manual de todos os campos
    const newFieldErrors = {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      password1: '',
      password2: '',
    };
    
    let hasErrors = false;
    
    if (!formData.first_name.trim()) {
      newFieldErrors.first_name = 'O campo Nome é obrigatório';
      hasErrors = true;
    }
    
    if (!formData.last_name.trim()) {
      newFieldErrors.last_name = 'O campo Sobrenome é obrigatório';
      hasErrors = true;
    }
    
    if (!formData.username.trim()) {
      newFieldErrors.username = 'O campo Usuário é obrigatório';
      hasErrors = true;
    }
    
    if (!formData.email.trim()) {
      newFieldErrors.email = 'O campo Email é obrigatório';
      hasErrors = true;
    }
    
    if (!formData.password1.trim()) {
      newFieldErrors.password1 = 'O campo Senha é obrigatório';
      hasErrors = true;
    }
    
    if (!formData.password2.trim()) {
      newFieldErrors.password2 = 'O campo Confirmar Senha é obrigatório';
      hasErrors = true;
    }
    
    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      setError('Preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }

    // Validação de senha
    if (formData.password1 !== formData.password2) {
      setError('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      router.push('/armory');
    } catch (err: any) {
      // Limpar erros anteriores
      setFieldErrors({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password1: '',
        password2: '',
      });
      
      // Tratamento detalhado de erros
      const errors = err.response?.data;
      const newFieldErrors = {
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        password1: '',
        password2: '',
      };
      
      let errorMessage = '';
      
      if (errors) {
        // Formata erros de campo usando formatFieldErrors
        if (typeof errors === 'object' && !errors.detail && !errors.error && !errors.non_field_errors) {
          const formattedFieldErrors = formatFieldErrors(errors as Record<string, string | string[]>);
          Object.assign(newFieldErrors, formattedFieldErrors);
          
          // Verifica se há erros de campo
          const hasFieldError = Object.values(newFieldErrors).some(err => err !== '');
          if (hasFieldError) {
            errorMessage = 'VERIFIQUE OS ERROS NOS CAMPOS ABAIXO. Corrija antes de continuar, cidadão.';
          }
        }
        
        // Erros não relacionados a campos específicos (non_field_errors)
        if (errors.non_field_errors && Array.isArray(errors.non_field_errors) && errors.non_field_errors.length > 0) {
          errorMessage = formatError(errors.non_field_errors[0]);
        }
        // Erros gerais
        else if (errors.detail) {
          errorMessage = formatError(errors.detail);
        }
        else if (errors.error) {
          errorMessage = formatError(errors.error);
        }
        else if (!errorMessage) {
          errorMessage = formatError(err);
        }
      } else {
        errorMessage = formatError(err);
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
    <div className="min-h-screen w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Card className="w-full max-w-md mx-auto" glowColor="gold">
        <div className="text-center mb-6">
          <h2 
            className="text-3xl font-bold mb-2 uppercase tracking-wider"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              color: 'var(--text-primary)',
              textShadow: '0 0 10px rgba(212,175,55,0.8)',
            }}
          >
            ALISTAMENTO DE NOVO OPERATIVO
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Preencha seus dados para servir a Democracia™
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div 
              className="px-4 py-3 border-2 border-[var(--alert-red)]"
              style={{
                backgroundColor: 'rgba(255,51,51,0.1)',
                color: 'var(--alert-red)',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
              }}
            >
              ⚠ FALHA NO ALISTAMENTO. {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="PRIMEIRO NOME"
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
              placeholder="PRIMEIRO NOME"
              error={fieldErrors.first_name}
            />
            <Input
              label="SOBRENOME"
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
              placeholder="SOBRENOME"
              error={fieldErrors.last_name}
            />
          </div>

          <div className="relative">
            <Input
              label="IDENTIFICAÇÃO DE OPERATIVO"
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              placeholder="IDENTIFICAÇÃO DE OPERATIVO"
              error={fieldErrors.username}
            />
            {checking.username && (
              <div className="absolute right-3 top-9">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
            {!checking.username && fieldErrors.username === '' && formData.username.length >= 3 && (
              <div className="absolute right-3 top-9">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>

          <div className="relative">
            <Input
              label="ID DE OPERATIVO (EMAIL)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="ID DE OPERATIVO"
              error={fieldErrors.email}
            />
            {checking.email && (
              <div className="absolute right-3 top-9">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              </div>
            )}
            {!checking.email && fieldErrors.email === '' && formData.email.includes('@') && formData.email.includes('.') && (
              <div className="absolute right-3 top-9">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>

          <div>
            <div className="relative">
              <Input
                label="CÓDIGO DE AUTORIZAÇÃO"
                type={showPassword.password1 ? 'text' : 'password'}
                value={formData.password1}
                onChange={(e) => setFormData({ ...formData, password1: e.target.value })}
                required
                placeholder="CÓDIGO DE AUTORIZAÇÃO"
                error={fieldErrors.password1}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, password1: !prev.password1 }))}
                className="absolute right-3 top-[calc(1.25rem+8px+12px+0.625rem)] -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex items-center justify-center z-10"
              >
                {showPassword.password1 ? (
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
            {formData.password1 && (
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
              label="CONFIRMAR CÓDIGO"
              type={showPassword.password2 ? 'text' : 'password'}
              value={formData.password2}
              onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
              required
              placeholder="CONFIRMAR CÓDIGO"
              error={fieldErrors.password2}
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => ({ ...prev, password2: !prev.password2 }))}
              className="absolute right-3 top-[calc(1.25rem+8px+12px+0.625rem)] -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex items-center justify-center z-10"
            >
              {showPassword.password2 ? (
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
            disabled={loading}
          >
            {loading ? 'PROCESSANDO ALISTAMENTO...' : 'INICIAR ALISTAMENTO'}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-primary)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span 
                className="px-2 uppercase"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                }}
              >
                ou
              </span>
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
            ALISTAR COM GOOGLE
          </Button>
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Já está alistado?{' '}
          <Link href="/login" className="hover:opacity-80 transition-opacity font-medium" style={{ color: 'var(--holo-cyan)' }}>
            AUTORIZAR ACESSO
          </Link>
        </p>
      </Card>
    </div>
  );
}

