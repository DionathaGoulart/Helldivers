/**
 * Componente Header
 * 
 * Cabeçalho da aplicação com navegação, menu do usuário e controles de idioma
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

// 1. React e Next.js
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserGroupIcon } from '@heroicons/react/24/outline';

// 2. Contextos e Hooks customizados
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';

// 3. Componentes
import Button from '@/components/ui/Button';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente Header
 * Gerencia navegação, autenticação e menu mobile
 */
export default function Header() {
  const { user, logout, loading: authLoading } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    const confirmed = window.confirm(t('auth.logout.confirm'));
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
        className={`lg:hidden fixed inset-0 z-[99998] transition-all duration-500 ease-in-out ${isMobileMenuOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-[var(--bg-primary)] transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-90' : 'opacity-0'
            }`}
        />

        {/* Menu Content */}
        <div
          className={`absolute inset-0 overflow-y-auto bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] transition-transform duration-500 ease-in-out ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
            }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="min-h-full w-full flex flex-col p-6 sm:p-8 md:p-12">
            {/* Header do Menu Mobile */}
            <div className="flex items-center justify-between pb-6 sm:pb-8 mb-6 sm:mb-8 border-b-2 border-[var(--border-primary)]">
              <span className="font-bold text-2xl sm:text-3xl md:text-4xl uppercase tracking-wider text-white drop-shadow-[0_0_15px_rgba(0,217,255,0.8)] font-orbitron">
                {t('header.menu')}
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#00d9ff] hover:opacity-80 transition-all duration-300 hover:scale-110 [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%-8px))]"
              >
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Botão de Idioma Mobile */}
            <div className="mb-4 pb-4 border-b-2 border-[var(--border-primary)]">
              <Button
                variant="ghost"
                size="md"
                fullWidth
                onClick={toggleLanguage}
                className="justify-between text-base sm:text-lg md:text-xl py-4 sm:py-5"
                title={language === 'pt-BR' ? 'Switch to English' : 'Mudar para Português'}
                aria-label={language === 'pt-BR' ? 'Switch to English' : 'Mudar para Português'}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--holo-cyan)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span>{language === 'pt-BR' ? t('header.portuguese') : t('header.english')}</span>
                </div>
                <span className="text-[var(--holo-cyan)] font-semibold">{language === 'pt-BR' ? 'EN' : 'PT-BR'}</span>
              </Button>
            </div>

            {/* Navigation Links Mobile */}
            <nav className="flex flex-col gap-3 sm:gap-4 flex-1">
              {/* Mobile Link: Random Loadout */}
              <Link href="/random-loadout" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" fullWidth className="justify-start text-base sm:text-lg py-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--holo-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    {t('nav.randomLoadout') || "Random"}
                  </div>
                </Button>
              </Link>

              {/* Mobile Link: Weaponry */}
              <Link href="/weaponry" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" fullWidth className="justify-start text-base sm:text-lg py-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--holo-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" style={{ transform: 'rotate(45deg)' }} />
                    </svg>
                    {t('nav.weaponry')}
                  </div>
                </Button>
              </Link>

              {/* Submenu Mobile: Armaduras */}
              <div className="flex flex-col gap-1">
                <span className="text-[var(--holo-cyan)] text-xs uppercase tracking-widest font-bold opacity-70 px-4">
                  {t('header.arsenal')}
                </span>
                <div className="pl-4 border-l-2 border-[var(--border-primary)] ml-4 space-y-2">
                  <Link href="/armory" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" fullWidth className="justify-start text-base sm:text-lg py-2">
                      {t('header.sets')}
                    </Button>
                  </Link>
                  <Link href="/armory/helmets" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" fullWidth className="justify-start text-base sm:text-lg py-2">
                      {t('header.helmets')}
                    </Button>
                  </Link>
                  <Link href="/armory/armors" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" fullWidth className="justify-start text-base sm:text-lg py-2">
                      {t('header.armors')}
                    </Button>
                  </Link>
                  <Link href="/armory/capes" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" fullWidth className="justify-start text-base sm:text-lg py-2">
                      {t('header.capes')}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Mobile Link: Stratagems (Top Level) */}
              <Link href="/armory/stratagems" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" fullWidth className="justify-start text-base sm:text-lg py-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[var(--holo-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {t('header.stratagems')}
                  </div>
                </Button>
              </Link>

              {/* Mobile Link: Community */}
              <Link href="/community" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" fullWidth className="justify-start text-base sm:text-lg py-2">
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="w-5 h-5 text-[var(--holo-cyan)]" />
                    {t('community.community')}
                  </div>
                </Button>
              </Link>

              {authLoading ? (
                // Loader enquanto verifica autenticação
                <div className="flex items-center justify-center gap-2 py-8">
                  <div className="inline-block w-6 h-6 border-2 border-[var(--holo-cyan)] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-400 text-sm">{t('header.checkingAuth') || 'Verificando...'}</span>
                </div>
              ) : user ? (
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
                      {t('header.favorites')}
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
                      {t('header.collection')}
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
                      {t('header.wishlist')}
                    </Button>
                  </Link>

                  <div className="border-t-2 border-[var(--border-primary)] my-3 sm:my-4"></div>

                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block transform transition-all duration-300 hover:scale-105"
                  >
                    <Button variant="outline" fullWidth className="justify-start text-base sm:text-lg md:text-xl py-4 sm:py-5">
                      {t('header.profile')}
                    </Button>
                  </Link>

                  <Button
                    variant="danger"
                    fullWidth
                    onClick={handleLogout}
                    className="justify-start mt-6 sm:mt-8 text-base sm:text-lg md:text-xl py-4 sm:py-5"
                  >
                    {t('header.logout')}
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
                    <Button variant="secondary" fullWidth className="justify-start text-base sm:text-lg md:text-xl py-4 sm:py-5">
                      {t('header.login')}
                    </Button>
                  </Link>

                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block transform transition-all duration-300 hover:scale-105"
                  >
                    <Button fullWidth className="justify-start text-base sm:text-lg md:text-xl py-4 sm:py-5">
                      {t('header.register')}
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div >
      </div >
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
              <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] to-[#ff3333] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.5)] [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,0_100%)]">
                <span className="text-white font-bold text-xl drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] font-orbitron">
                  GD
                </span>
              </div>
              <span className="font-bold text-xl uppercase tracking-wider hidden sm:inline-block text-white drop-shadow-[0_0_10px_rgba(0,217,255,0.5)] font-orbitron">
                {t('header.superEarth')}
              </span>
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden lg:flex items-center gap-4">

              {/* Left Group: Game Info */}
              <div className="flex items-center gap-1">
                {/* Random Loadout Link */}
                <Link href="/random-loadout">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-[var(--holo-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    {t('nav.randomLoadout') || "Random"}
                  </Button>
                </Link>

                {/* Weaponry Link */}
                <Link href="/weaponry">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-[var(--holo-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" style={{ transform: 'rotate(45deg)' }} />
                    </svg>
                    {t('nav.weaponry')}
                  </Button>
                </Link>

                {/* Dropdown de Armaduras/Armory */}
                <div className="relative group">
                  <Link href="/armory">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      {t('header.arsenal')}
                      <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>
                  </Link>

                  {/* Dropdown Menu */}
                  <div className="absolute top-full left-0 mt-0 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left -translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md p-1 mt-2">
                      <Link href="/armory/sets" className="block">
                        <button className="w-full text-left px-4 py-2 hover:bg-[rgba(0,217,255,0.1)] text-[#00d9ff] hover:text-white transition-colors text-sm font-['Orbitron'] tracking-wider">
                          {t('header.sets')}
                        </button>
                      </Link>
                      <Link href="/armory/helmets" className="block">
                        <button className="w-full text-left px-4 py-2 hover:bg-[rgba(0,217,255,0.1)] text-[#00d9ff] hover:text-white transition-colors text-sm font-['Orbitron'] tracking-wider">
                          {t('header.helmets')}
                        </button>
                      </Link>
                      <Link href="/armory/armors" className="block">
                        <button className="w-full text-left px-4 py-2 hover:bg-[rgba(0,217,255,0.1)] text-[#00d9ff] hover:text-white transition-colors text-sm font-['Orbitron'] tracking-wider">
                          {t('header.armors')}
                        </button>
                      </Link>
                      <Link href="/armory/capes" className="block">
                        <button className="w-full text-left px-4 py-2 hover:bg-[rgba(0,217,255,0.1)] text-[#00d9ff] hover:text-white transition-colors text-sm font-['Orbitron'] tracking-wider">
                          {t('header.capes')}
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Stratagems Link */}
                <Link href="/armory/stratagems">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-[var(--holo-cyan)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {t('header.stratagems')}
                  </Button>
                </Link>
              </div>

              {/* Separator */}
              <div className="h-8 w-px bg-[var(--border-primary)] opacity-50"></div>

              {/* Right Group: Community & User Lists */}
              <div className="flex items-center gap-1">
                {/* Community Link */}
                <Link href="/community">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <UserGroupIcon className="w-4 h-4" />
                    {t('community.community')}
                  </Button>
                </Link>

                {user && (
                  /* My Lists Dropdown */
                  <div className="relative group">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <span className="font-bold uppercase tracking-wider text-xs">
                        {t('header.myLists')}
                      </span>
                      <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>

                    {/* Dropdown Menu */}
                    <div className="absolute top-full right-0 mt-0 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right -translate-y-2 group-hover:translate-y-0 z-50">
                      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-[0_0_15px_rgba(0,0,0,0.8)] backdrop-blur-md p-1 mt-2">
                        <Link href="/favorites" className="block">
                          <button className="w-full text-left px-4 py-2 hover:bg-[rgba(0,217,255,0.1)] text-[#00d9ff] hover:text-white transition-colors text-sm font-['Orbitron'] tracking-wider flex items-center gap-2">
                            <svg className="w-4 h-4 text-[var(--democracy-gold)]" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {t('header.favorites')}
                          </button>
                        </Link>
                        <Link href="/collection" className="block">
                          <button className="w-full text-left px-4 py-2 hover:bg-[rgba(0,217,255,0.1)] text-[#00d9ff] hover:text-white transition-colors text-sm font-['Orbitron'] tracking-wider flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            {t('header.collection')}
                          </button>
                        </Link>
                        <Link href="/wishlist" className="block">
                          <button className="w-full text-left px-4 py-2 hover:bg-[rgba(0,217,255,0.1)] text-[#00d9ff] hover:text-white transition-colors text-sm font-['Orbitron'] tracking-wider flex items-center gap-2">
                            <svg className="w-4 h-4 text-[var(--terminal-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {t('header.wishlist')}
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu / Login Buttons */}
              <div className="flex items-center gap-2 border-l border-[var(--border-primary)] pl-4 ml-2">
                {authLoading ? (
                  <div className="inline-block w-5 h-5 border-2 border-[var(--holo-cyan)] border-t-transparent rounded-full animate-spin"></div>
                ) : user ? (
                  <>
                    <Link href="/profile">
                      <Button variant="outline" size="sm">{t('header.profile')}</Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={handleLogout}>{t('header.logout')}</Button>
                  </>
                ) : (
                  <>
                    <Link href="/login"><Button variant="secondary" size="sm">{t('header.login')}</Button></Link>
                    <Link href="/register"><Button size="sm">{t('header.register')}</Button></Link>
                  </>
                )}
                {/* Lang Switch */}
                <Button variant="ghost" size="sm" onClick={toggleLanguage} className="ml-1">
                  {language === 'pt-BR' ? 'PT-BR' : 'EN'}
                </Button>
              </div>
            </nav>

            {/* Menu Hambúrguer Mobile */}
            <button
              className="lg:hidden relative w-10 h-10 flex items-center justify-center transition-transform duration-300 hover:scale-110 [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%-8px))]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-5 flex flex-col justify-between">
                <span
                  className={`block h-0.5 w-full bg-[var(--holo-cyan)] transition-all duration-500 ease-in-out origin-center ${isMobileMenuOpen
                    ? 'rotate-45 translate-y-2.5 shadow-none'
                    : 'shadow-[0_0_5px_rgba(0,217,255,0.5)]'
                    }`}
                />
                <span
                  className={`block h-0.5 w-full bg-[var(--holo-cyan)] transition-all duration-500 ease-in-out shadow-[0_0_5px_rgba(0,217,255,0.5)] ${isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                    }`}
                />
                <span
                  className={`block h-0.5 w-full bg-[var(--holo-cyan)] transition-all duration-500 ease-in-out origin-center ${isMobileMenuOpen
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
