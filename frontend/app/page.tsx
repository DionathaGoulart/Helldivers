/**
 * Página Inicial
 * 
 * Landing page da aplicação com informações sobre o sistema e CTAs principais
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

// 1. React e Next.js
import Link from 'next/link';

// 2. Contextos e Hooks customizados
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/translations';

// 3. Componentes
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function HomePage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="container page-content">
      <div className="text-center flex flex-col items-center w-full">
        {/* Logo Grande */}
        <div className="inline-block">
          <div className="w-32 h-32 flex items-center justify-center bg-gradient-to-br from-[#d4af37] to-[#ff3333] shadow-[0_0_30px_rgba(212,175,55,0.5)] [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]">
            <span className="text-white font-bold text-6xl font-['Orbitron'] shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              GD
            </span>
          </div>
        </div>

        <div className="mt-16 mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 uppercase tracking-wider content-section font-['Orbitron'] text-white">
            {t('home.welcome')}{' '}
            <span className="text-[#d4af37]">
              {t('home.superEarth')}
            </span>
          </h1>
        </div>

        <div className="w-full flex flex-col items-center justify-center content-section">
          <p className="text-xl mb-6 max-w-3xl w-full leading-relaxed text-center text-gray-400 tracking-wide">
            {t('home.subtitle')}
          </p>
          <p className="text-xl mb-0 max-w-3xl w-full leading-relaxed text-center text-[#d4af37] tracking-wide">
            {t('home.join')}
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center content-section">
          {loading ? (
            <>
              <Button size="lg" loading disabled>
                {t('home.enlist')}
              </Button>
              <Button variant="outline" size="lg" loading disabled>
                {t('home.authorize')}
              </Button>
            </>
          ) : user ? (
            <>
              <Link href="/armory">
                <Button size="lg">
                  {t('home.arsenal')}
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" size="lg">
                  {t('home.operativeProfile')}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/register">
                <Button size="lg">
                  {t('home.enlist')}
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  {t('home.authorize')}
                </Button>
              </Link>
            </>
          )}
        </div>


        {/* Features */}
        <div className="w-full max-w-6xl flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-8 uppercase tracking-wider font-['Orbitron'] text-white/80 border-b border-white/10 pb-4 px-12">
            {t('home.featuresTitle')}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 content-section w-full px-4">
            {/* Armory */}
            <Link href="/armory" className="block h-full">
              <Card glowColor="cyan" className="h-full hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center text-center p-6 bg-gradient-to-br from-[#1a2332] to-[#0d141f]">
                <div className="w-14 h-14 mb-4 flex items-center justify-center bg-[rgba(0,217,255,0.1)] rounded-full border border-[#00d9ff]/30 shadow-[0_0_15px_rgba(0,217,255,0.2)]">
                  <svg className="w-7 h-7 text-[#00d9ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 uppercase tracking-wider font-['Rajdhani'] text-[#00d9ff]">
                  {t('home.feature.armory.title')}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {t('home.feature.armory.desc')}
                </p>
              </Card>
            </Link>

            {/* Weaponry */}
            <Link href="/weaponry" className="block h-full">
              <Card glowColor="gold" className="h-full hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center text-center p-6 bg-gradient-to-br from-[#1a2332] to-[#0d141f]">
                <div className="w-14 h-14 mb-4 flex items-center justify-center bg-[rgba(212,175,55,0.1)] rounded-full border border-[#d4af37]/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                  <svg className="w-7 h-7 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 uppercase tracking-wider font-['Rajdhani'] text-[#d4af37]">
                  {t('home.feature.weaponry.title')}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {t('home.feature.weaponry.desc')}
                </p>
              </Card>
            </Link>

            {/* Random Loadout */}
            <Link href="/random-loadout" className="block h-full">
              <Card glowColor="green" className="h-full hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center text-center p-6 bg-gradient-to-br from-[#1a2332] to-[#0d141f]">
                <div className="w-14 h-14 mb-4 flex items-center justify-center bg-[rgba(57,255,20,0.1)] rounded-full border border-[#39ff14]/30 shadow-[0_0_15px_rgba(57,255,20,0.2)]">
                  <svg className="w-7 h-7 text-[#39ff14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 uppercase tracking-wider font-['Rajdhani'] text-[#39ff14]">
                  {t('home.feature.random.title')}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {t('home.feature.random.desc')}
                </p>
              </Card>
            </Link>

            {/* Collection */}
            <Link href={user ? "/collection" : "/login"} className="block h-full">
              <Card glowColor="purple" className="h-full hover:scale-105 transition-transform duration-300 cursor-pointer flex flex-col items-center text-center p-6 bg-gradient-to-br from-[#1a2332] to-[#0d141f]">
                <div className="w-14 h-14 mb-4 flex items-center justify-center bg-[rgba(168,85,247,0.1)] rounded-full border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 uppercase tracking-wider font-['Rajdhani'] text-purple-500">
                  {t('home.feature.collection.title')}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {t('home.feature.collection.desc')}
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
