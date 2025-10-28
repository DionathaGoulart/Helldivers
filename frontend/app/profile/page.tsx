'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { changePassword } from '@/lib/auth';

export default function ProfilePage() {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

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

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password1: '',
    new_password2: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile(profileData);
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err: any) {
      const errors = err.response?.data;
      let errorMsg = 'Erro ao atualizar perfil';
      
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
      setError('As senhas não coincidem');
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
      setSuccess('Senha alterada com sucesso! Você será deslogado e redirecionado para o login...');
      
      // Limpar tokens localmente e redirecionar após 2 segundos
      setTimeout(() => {
        // Limpar tokens do localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
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
        setError('Erro ao alterar senha');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Configurações da Conta</h1>
          <p className="text-gray-600 mt-1">Gerencie suas informações pessoais</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <Link
              href="/profile"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Perfil
            </Link>
            <Link
              href="/profile?tab=password"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'password'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Senha
            </Link>
          </nav>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações do Perfil</h2>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Email (não pode ser alterado)"
                type="email"
                value={user.email}
                disabled
                className="bg-gray-50"
              />

              <Input
                label="Usuário"
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                required
                placeholder="Nome de usuário"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  type="text"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                  placeholder="Seu nome"
                />
                <Input
                  label="Sobrenome"
                  type="text"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                  placeholder="Seu sobrenome"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  Salvar Alterações
                </Button>
                <Link href="/dashboard">
                  <Button type="button" variant="outline">Cancelar</Button>
                </Link>
              </div>
            </form>
          </Card>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Alterar Senha</h2>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <Input
                label="Senha Atual"
                type="password"
                value={passwordData.old_password}
                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                required
                placeholder="Digite sua senha atual"
              />

              <Input
                label="Nova Senha"
                type="password"
                value={passwordData.new_password1}
                onChange={(e) => setPasswordData({ ...passwordData, new_password1: e.target.value })}
                required
                placeholder="Digite sua nova senha"
              />

              <Input
                label="Confirmar Nova Senha"
                type="password"
                value={passwordData.new_password2}
                onChange={(e) => setPasswordData({ ...passwordData, new_password2: e.target.value })}
                required
                placeholder="Digite a senha novamente"
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  Alterar Senha
                </Button>
                <Link href="/dashboard">
                  <Button type="button" variant="outline">Cancelar</Button>
                </Link>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}

