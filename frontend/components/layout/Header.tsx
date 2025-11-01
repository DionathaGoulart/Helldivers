'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    const confirmed = window.confirm('Deseja encerrar sua sessão, soldado?');
    if (confirmed) {
      await logout();
      setIsMobileMenuOpen(false);
    }
  };

  // Fechar menu ao mudar de rota
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router]);

  // Prevenir scroll quando menu está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const mobileMenuContent = isMobileMenuOpen && mounted && createPortal(
    <>
      {/* Mobile Menu Fullscreen com animação */}
      <div
        className={`lg:hidden fixed inset-0 z-[99998] transition-all duration-500 ease-in-out ${
          isMobileMenuOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {/* Backdrop */}
        <div 
          className={`absolute inset-0 bg-[var(--bg-primary)] transition-opacity duration-500 ${
            isMobileMenuOpen ? 'opacity-90' : 'opacity-0'
          }`}
        />
        
        {/* Menu Content */}
        <div 
          className={`absolute inset-0 overflow-y-auto bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] transition-transform duration-500 ease-in-out ${
            isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="min-h-full w-full flex flex-col p-6 sm:p-8 md:p-12">
            {/* Header do Menu Mobile */}
            <div className="flex items-center justify-between pb-6 sm:pb-8 mb-6 sm:mb-8 border-b-2 border-[var(--border-primary)]">
              <span
                className="font-bold text-2xl sm:text-3xl md:text-4xl uppercase tracking-wider text-[var(--text-primary)] drop-shadow-[0_0_15px_rgba(0,217,255,0.8)]"
                style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}
              >
                MENU DE OPERAÇÕES
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[var(--holo-cyan)] hover:opacity-80 transition-all duration-300 hover:scale-110"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                }}
              >
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Links Mobile */}
            <nav className="flex flex-col gap-3 sm:gap-4 flex-1">
            <Link
              href="/armory"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block transform transition-all duration-300 hover:scale-105"
            >
              <Button variant="ghost" fullWidth className="justify-start text-base sm:text-lg md:text-xl py-4 sm:py-5">
                ARSENAL
              </Button>
            </Link>

            {user ? (
              <>
                <div className="border-t-2 border-[var(--border-primary)] my-3 sm:my-4"></div>
                
                <Link
                  href="/favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block transform transition-all duration-300 hover:scale-105"
                >
                  <Button variant="ghost" fullWidth className="justify-start gap-3 text-base sm:text-lg md:text-xl py-4 sm:py-5">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--democracy-gold)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    FAVORITOS
                  </Button>
                </Link>

                <Link
                  href="/collection"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block transform transition-all duration-300 hover:scale-105"
                >
                  <Button variant="ghost" fullWidth className="justify-start gap-3 text-base sm:text-lg md:text-xl py-4 sm:py-5">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--holo-cyan)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    COLEÇÃO
                  </Button>
                </Link>

                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block transform transition-all duration-300 hover:scale-105"
                >
                  <Button variant="ghost" fullWidth className="justify-start gap-3 text-base sm:text-lg md:text-xl py-4 sm:py-5">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--terminal-green)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    LISTA DE DESEJOS
                  </Button>
                </Link>

                <div className="border-t-2 border-[var(--border-primary)] my-3 sm:my-4"></div>

                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block transform transition-all duration-300 hover:scale-105"
                >
                  <Button variant="outline" fullWidth className="justify-start text-base sm:text-lg md:text-xl py-4 sm:py-5">
                    PERFIL
                  </Button>
                </Link>

                <Button
                  variant="danger"
                  fullWidth
                  onClick={handleLogout}
                  className="justify-start mt-6 sm:mt-8 text-base sm:text-lg md:text-xl py-4 sm:py-5"
                >
                  ENCERRAR SESSÃO
                </Button>
              </>
            ) : (
              <>
                <div className="border-t-2 border-[var(--border-primary)] my-3 sm:my-4"></div>
                
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block transform transition-all duration-300 hover:scale-105"
                >
                  <Button variant="ghost" fullWidth className="justify-start text-base sm:text-lg md:text-xl py-4 sm:py-5">
                    AUTORIZAR ACESSO
                  </Button>
                </Link>

                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block transform transition-all duration-300 hover:scale-105"
                >
                  <Button fullWidth className="justify-start text-base sm:text-lg md:text-xl py-4 sm:py-5">
                    INICIAR ALISTAMENTO
                  </Button>
                </Link>
              </>
            )}
          </nav>
          </div>
        </div>
      </div>
    </>,
    document.body
  );

  return (
    <>
      <header className="sticky top-0 z-[100] border-b-2 border-[var(--border-primary)] bg-[var(--bg-secondary)] backdrop-blur-sm w-full mb-0">
        <div className="container">
          <div className="flex justify-between items-center h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div 
                className="w-10 h-10 bg-gradient-to-br from-[var(--democracy-gold)] to-[var(--alert-red)] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.5)]"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                }}
              >
                <span 
                  className="text-white font-bold text-xl drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                  style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}
                >
                  SE
                </span>
              </div>
              <span 
                className="font-bold text-xl uppercase tracking-wider hidden sm:inline-block text-[var(--text-primary)] drop-shadow-[0_0_10px_rgba(0,217,255,0.5)]"
                style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}
              >
                SUPER EARTH
              </span>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-wrap lg:flex-nowrap">
              {user ? (
                // Logado
                <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-wrap lg:flex-nowrap gap-2">
                  <Link href="/armory">
                    <Button variant="ghost" size="sm">ARSENAL</Button>
                  </Link>
                  <div className="flex items-center space-x-1 sm:space-x-2 border-l border-[var(--border-primary)] pl-2 sm:pl-3 lg:pl-4 ml-1 sm:ml-2">
                    <Link href="/favorites">
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-[var(--democracy-gold)]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="hidden xl:inline">FAVORITOS</span>
                      </Button>
                    </Link>
                    <Link href="/collection">
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-[var(--holo-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span className="hidden xl:inline">COLEÇÃO</span>
                      </Button>
                    </Link>
                    <Link href="/wishlist">
                      <Button variant="ghost" size="sm" className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-[var(--terminal-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="hidden xl:inline">LISTA DE DESEJOS</span>
                      </Button>
                    </Link>
                  </div>
                  <Link href="/profile">
                    <Button variant="outline" size="sm">PERFIL</Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleLogout}
                  >
                    ENCERRAR SESSÃO
                  </Button>
                </div>
              ) : (
                // Não logado
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Link href="/armory">
                    <Button variant="ghost" size="sm">ARSENAL</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">AUTORIZAR ACESSO</Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">INICIAR ALISTAMENTO</Button>
                  </Link>
                </div>
              )}
            </nav>

            {/* Menu Hambúrguer Mobile */}
            <button
              className="lg:hidden relative w-10 h-10 flex items-center justify-center transition-transform duration-300 hover:scale-110"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
              style={{
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              }}
            >
              <div className="relative w-6 h-5 flex flex-col justify-between">
                <span
                  className={`block h-0.5 w-full bg-[var(--holo-cyan)] transition-all duration-500 ease-in-out origin-center ${
                    isMobileMenuOpen 
                      ? 'rotate-45 translate-y-2.5 shadow-none' 
                      : 'shadow-[0_0_5px_rgba(0,217,255,0.5)]'
                  }`}
                />
                <span
                  className={`block h-0.5 w-full bg-[var(--holo-cyan)] transition-all duration-500 ease-in-out shadow-[0_0_5px_rgba(0,217,255,0.5)] ${
                    isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                  }`}
                />
                <span
                  className={`block h-0.5 w-full bg-[var(--holo-cyan)] transition-all duration-500 ease-in-out origin-center ${
                    isMobileMenuOpen 
                      ? '-rotate-45 -translate-y-2.5 shadow-none' 
                      : 'shadow-[0_0_5px_rgba(0,217,255,0.5)]'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Portal */}
      {mobileMenuContent}
    </>
  );
}
