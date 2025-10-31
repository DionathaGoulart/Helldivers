'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H2</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Helldivers 2</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {user ? (
              // Logado
              <div className="flex items-center space-x-4">
                <Link href="/armory">
                  <Button variant="ghost">Armory</Button>
                </Link>
                <div className="flex items-center space-x-2 border-l border-gray-300 pl-4 ml-2">
                  <Link href="/armory/favorites">
                    <Button variant="ghost" className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Favoritos
                    </Button>
                  </Link>
                  <Link href="/armory/collection">
                    <Button variant="ghost" className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Coleção
                    </Button>
                  </Link>
                  <Link href="/armory/wishlist">
                    <Button variant="ghost" className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Desejos
                    </Button>
                  </Link>
                </div>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline">Perfil</Button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
                >
                  Sair
                </button>
              </div>
            ) : (
              // Não logado
              <div className="flex items-center space-x-3">
                <Link href="/armory">
                  <Button variant="ghost">Armory</Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link href="/register">
                  <Button>Registrar</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

