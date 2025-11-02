'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { changePassword, checkUsername, resendVerificationEmail } from '@/lib/auth';

function ProfileContent() {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  const { t } = useTranslation();

  const [profileData, setProfileData] = useState({
    username: '',
    first_name: '',
    last_name: '',
  });

  // Atualizar dados quando o user mudar
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
      });
    }
  }, [user]);

  // Função para validar username em tempo real
  const validateUsername = useCallback(
    async (username: string) => {
      // Se não mudou do username original, não precisa verificar
      if (!username || username === user?.username) {
        setUsernameError('');
        return;
      }

      if (username.length < 3) {
        setUsernameError(t('profile.usernameMinLength'));
        return;
      }

      setCheckingUsername(true);
      try {
        const available = await checkUsername(username);
        if (!available) {
          setUsernameError(t('profile.usernameTaken'));
        } else {
          setUsernameError('');
        }
      } catch (error) {
        // Erro ao verificar username
      } finally {
        setCheckingUsername(false);
      }
    },
    [user?.username]
  );

  // Debounce para username
  useEffect(() => {
    const timer = setTimeout(() => {
      if (profileData.username) {
        validateUsername(profileData.username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [profileData.username, validateUsername]);

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password1: '',
    new_password2: '',
  });

  // Validar força da senha em tempo real
  useEffect(() => {
    const password = passwordData.new_password1;
    
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  }, [passwordData.new_password1]);

  // Validar se as senhas coincidem
  useEffect(() => {
    if (passwordData.new_password2 && passwordData.new_password1 !== passwordData.new_password2) {
      setPasswordMatch(false);
    } else {
      setPasswordMatch(true);
    }
  }, [passwordData.new_password1, passwordData.new_password2]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({ old_password: false, new_password1: false, new_password2: false });
  const [usernameError, setUsernameError] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [emailVerified, setEmailVerified] = useState<boolean | undefined>(undefined);
  const [checkingEmailStatus, setCheckingEmailStatus] = useState(true);
  const [resendingEmail, setResendingEmail] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Verificar se há erro de username antes de enviar
    if (usernameError) {
      setError(t('profile.fillRequired'));
      return;
    }
    
    setLoading(true);

    try {
      await updateProfile(profileData);
      setSuccess(t('profile.profileUpdated'));
    } catch (err: any) {
      const errors = err.response?.data;
      let errorMsg = t('profile.updateError');
      
      if (errors) {
        // Erro de username já em uso
        if (errors.username) {
          errorMsg = Array.isArray(errors.username) ? errors.username[0] : errors.username;
        }
        // Outros erros de campo
        else if (errors.email) {
          errorMsg = Array.isArray(errors.email) ? errors.email[0] : errors.email;
        }
        // Erro genérico do detail
        else if (errors.detail) {
          errorMsg = errors.detail;
        }
        else if (typeof errors === 'string') {
          errorMsg = errors;
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.new_password1 !== passwordData.new_password2) {
      setError(t('profile.passwordMismatch'));
      return;
    }

    setLoading(true);

    try {
      await changePassword(
        passwordData.old_password,
        passwordData.new_password1,
        passwordData.new_password2
      );
      
      // Limpar campos
      setPasswordData({
        old_password: '',
        new_password1: '',
        new_password2: '',
      });
      
      // Mostrar mensagem de sucesso
      setSuccess(t('profile.passwordChanged'));
      
      // Redirecionar após 2 segundos
      // Os cookies serão limpos automaticamente pelo backend no logout
      setTimeout(() => {
        // Redirecionar para login
        window.location.href = '/login';
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message;
      
      if (errorMessage) {
        setError(errorMessage);
      } else if (err.response?.data?.old_password) {
        setError(err.response.data.old_password[0]);
      } else if (err.response?.data?.new_password2) {
        setError(err.response.data.new_password2[0]);
      } else {
        setError(t('profile.changePasswordError'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Buscar dados do dashboard para verificar status de email
  useEffect(() => {
    const fetchDashboardData = async () => {
      setCheckingEmailStatus(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiUrl}/api/v1/dashboard/`, {
          credentials: 'include', // Enviar cookies automaticamente
        });
        if (response.ok) {
          const data = await response.json();
          const verified = data.account_info?.email_verified || false;
          setEmailVerified(verified);
        }
      } catch (error) {
        // Erro ao buscar dashboard
      } finally {
        setCheckingEmailStatus(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleResendVerificationEmail = async () => {
    setResendingEmail(true);
    setError('');
    try {
      await resendVerificationEmail();
      setSuccess(t('profile.resendSuccess'));
    } catch (err: any) {
      setError(t('profile.resendError'));
    } finally {
      setResendingEmail(false);
    }
  };

  // Verificar autenticação - deve estar antes de qualquer retorno condicional
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-[#00d9ff] border-r-transparent border-b-transparent border-l-transparent shadow-[0_0_20px_rgba(0,217,255,0.5)]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
      <div className="container page-content">
        <div className="content-section">
          <h1 className="text-4xl font-bold mb-2 uppercase tracking-wider font-['Orbitron'] text-white">
            {t('profile.title')}
          </h1>
          <p className="text-gray-400">
            {t('profile.subtitle')}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b-2 border-[#3a4a5a]">
          <nav className="flex gap-12">
            <Link
              href="/profile"
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all font-['Rajdhani'] uppercase tracking-wide ${
                activeTab === 'profile' 
                  ? 'text-[#00d9ff] border-[#00d9ff]' 
                  : 'text-gray-500 border-transparent hover:text-gray-400 hover:border-[#3a4a5a]'
              }`}
            >
              {t('profile.tabProfile')}
            </Link>
            <Link
              href="/profile?tab=password"
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all font-['Rajdhani'] uppercase tracking-wide ${
                activeTab === 'password' 
                  ? 'text-[#00d9ff] border-[#00d9ff]' 
                  : 'text-gray-500 border-transparent hover:text-gray-400 hover:border-[#3a4a5a]'
              }`}
            >
              {t('profile.tabPassword')}
            </Link>
          </nav>
        </div>

        {/* Aviso de email não verificado */}
        {!checkingEmailStatus && !emailVerified && (
          <div className="mb-4 p-4 bg-[rgba(255,165,0,0.1)] border-2 border-[#ffa500] [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]">
            <div className="flex items-start">
              <svg className="w-5 h-5 mt-0.5 mr-3 text-[#ffa500]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-1 uppercase tracking-wide font-['Rajdhani'] text-[#ffa500]">
                  {t('profile.emailUnverified')}
                </h3>
                <p className="text-sm mb-3 text-gray-400">
                  {t('profile.emailUnverifiedMessage')}
                </p>
                <Button
                  onClick={handleResendVerificationEmail}
                  variant="outline"
                  disabled={resendingEmail}
                  size="sm"
                >
                  {resendingEmail ? t('profile.sendingEmail') : t('profile.resendEmail')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-[rgba(255,51,51,0.1)] border-2 border-[#ff3333] text-[#ff3333] font-['Rajdhani'] uppercase tracking-wider [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 px-4 py-3 bg-[rgba(57,255,20,0.1)] border-2 border-[#39ff14] text-[#39ff14] font-['Rajdhani'] uppercase tracking-wider [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]">
            {success}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card glowColor="cyan">
            <h2 className="text-xl font-semibold mb-6 uppercase tracking-wider font-['Rajdhani'] text-[#00d9ff]">
              {t('profile.profileInfo')}
            </h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label={t('profile.emailUnchangeable')}
                type="email"
                value={user.email}
                disabled
              />

              <div className="relative">
                <Input
                  label={t('profile.username')}
                  type="text"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                  required
                  placeholder={t('profile.usernamePlaceholder')}
                  error={usernameError}
                />
                {checkingUsername && (
                  <div className="absolute right-3 top-9">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-[#00d9ff] border-r-transparent border-b-transparent border-l-transparent"></div>
                  </div>
                )}
                {!checkingUsername && usernameError === '' && profileData.username && profileData.username !== user?.username && (
                  <div className="absolute right-3 top-9">
                    <svg 
                      className="h-5 w-5 text-[#39ff14]" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('profile.firstName')}
                  type="text"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                  placeholder={t('profile.firstNamePlaceholder')}
                />
                <Input
                  label={t('profile.lastName')}
                  type="text"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                  placeholder={t('profile.lastNamePlaceholder')}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  {t('profile.saveChanges')}
                </Button>
                <Link href="/armory">
                  <Button type="button" variant="outline">{t('common.cancel')}</Button>
                </Link>
              </div>
            </form>
          </Card>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <Card glowColor="cyan">
            <h2 className="text-xl font-semibold mb-6 uppercase tracking-wider font-['Rajdhani'] text-[#00d9ff]">
              {t('profile.changePassword')}
            </h2>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="relative">
                <Input
                  label={t('profile.currentPassword')}
                  type={showPassword.old_password ? 'text' : 'password'}
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                  required
                  placeholder={t('profile.passwordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, old_password: !prev.old_password }))}
                  className="absolute right-3 top-[calc(1.25rem+8px+12px+0.625rem)] -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--holo-cyan)] transition-colors flex items-center justify-center z-10"
                >
                  {showPassword.old_password ? (
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

              <div className="relative">
                <Input
                  label={t('profile.newPassword')}
                  type={showPassword.new_password1 ? 'text' : 'password'}
                  value={passwordData.new_password1}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password1: e.target.value })}
                  required
                  placeholder={t('profile.newPasswordPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, new_password1: !prev.new_password1 }))}
                  className="absolute right-3 top-[calc(1.25rem+8px+12px+0.625rem)] -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--holo-cyan)] transition-colors flex items-center justify-center z-10"
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
              {passwordData.new_password1 && (
                <div className="mt-2 space-y-1 text-xs">
                  <div className={`flex items-center font-['Rajdhani'] ${passwordStrength.length ? 'text-[#39ff14]' : 'text-gray-500'}`}>
                    <svg className={`w-4 h-4 mr-2 ${passwordStrength.length ? 'text-[#39ff14]' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                      {passwordStrength.length ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M4 10a6 6 0 1112 0A6 6 0 014 10zm12 0a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      )}
                    </svg>
                    {t('profile.minChars')}
                  </div>
                  <div className={`flex items-center font-['Rajdhani'] ${passwordStrength.uppercase ? 'text-[#39ff14]' : 'text-gray-500'}`}>
                    <svg className={`w-4 h-4 mr-2 ${passwordStrength.uppercase ? 'text-[#39ff14]' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                      {passwordStrength.uppercase ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M4 10a6 6 0 1112 0A6 6 0 014 10zm12 0a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      )}
                    </svg>
                    {t('profile.oneUppercase')}
                  </div>
                  <div className={`flex items-center font-['Rajdhani'] ${passwordStrength.lowercase ? 'text-[#39ff14]' : 'text-gray-500'}`}>
                    <svg className={`w-4 h-4 mr-2 ${passwordStrength.lowercase ? 'text-[#39ff14]' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                      {passwordStrength.lowercase ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M4 10a6 6 0 1112 0A6 6 0 014 10zm12 0a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      )}
                    </svg>
                    {t('profile.oneLowercase')}
                  </div>
                  <div className={`flex items-center font-['Rajdhani'] ${passwordStrength.number ? 'text-[#39ff14]' : 'text-gray-500'}`}>
                    <svg className={`w-4 h-4 mr-2 ${passwordStrength.number ? 'text-[#39ff14]' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                      {passwordStrength.number ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M4 10a6 6 0 1112 0A6 6 0 014 10zm12 0a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      )}
                    </svg>
                    {t('profile.oneNumber')}
                  </div>
                  <div className={`flex items-center font-['Rajdhani'] ${passwordStrength.special ? 'text-[#39ff14]' : 'text-gray-500'}`}>
                    <svg className={`w-4 h-4 mr-2 ${passwordStrength.special ? 'text-[#39ff14]' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                      {passwordStrength.special ? (
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      ) : (
                        <path fillRule="evenodd" d="M4 10a6 6 0 1112 0A6 6 0 014 10zm12 0a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                      )}
                    </svg>
                    {t('profile.oneSpecial')}
                  </div>
                </div>
              )}

              <div className="relative">
                <Input
                  label={t('profile.confirmPassword')}
                  type={showPassword.new_password2 ? 'text' : 'password'}
                  value={passwordData.new_password2}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password2: e.target.value })}
                  required
                  placeholder={t('profile.confirmPasswordPlaceholder')}
                  error={!passwordMatch && passwordData.new_password2 ? t('profile.passwordMismatch') : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, new_password2: !prev.new_password2 }))}
                  className="absolute right-3 top-[calc(1.25rem+8px+12px+0.625rem)] -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--holo-cyan)] transition-colors flex items-center justify-center z-10"
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

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  {t('profile.changePassword')}
                </Button>
                <Link href="/armory">
                  <Button type="button" variant="outline">{t('common.cancel')}</Button>
                </Link>
              </div>
            </form>
          </Card>
        )}
      </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-[#00d9ff] border-r-transparent border-b-transparent border-l-transparent shadow-[0_0_20px_rgba(0,217,255,0.5)]"></div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}

