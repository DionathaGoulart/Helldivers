'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboard();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Bem-vindo, {user.username}!
            </h1>
            <p className="text-gray-600 mt-2">Gerencie sua conta e preferências</p>
          </div>
          <div className="flex gap-3">
            <Link href="/profile">
              <Button variant="outline">Perfil</Button>
            </Link>
            <Button variant="danger" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informações da Conta</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Usuário</p>
                <p className="text-gray-900 font-medium">{user.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
              {user.first_name && (
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="text-gray-900 font-medium">
                    {user.first_name} {user.last_name}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
              <Link href="/profile">
                <Button variant="outline" fullWidth className="justify-start">
                  ✏️ Editar Perfil
                </Button>
              </Link>
              <Link href="/profile?tab=password">
                <Button variant="outline" fullWidth className="justify-start">
                  🔒 Alterar Senha
                </Button>
              </Link>
              <Button variant="danger" fullWidth onClick={handleLogout} className="justify-start">
                🚪 Sair
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

