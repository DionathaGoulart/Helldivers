'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="container page-content">
        <div className="text-center flex flex-col items-center w-full">
          {/* Logo Grande */}
          <div className="inline-block">
            <div className="w-32 h-32 flex items-center justify-center bg-gradient-to-br from-[#d4af37] to-[#ff3333] shadow-[0_0_30px_rgba(212,175,55,0.5)] [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]">
              <span className="text-white font-bold text-6xl font-['Orbitron'] shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                SE
              </span>
            </div>
          </div>

          <div className="mt-16 mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-8 uppercase tracking-wider content-section font-['Orbitron'] text-white">
            BEM-VINDO À{' '}
            <span className="text-[#d4af37]">
              SUPER EARTH
            </span>
          </h1>
          </div>
          
          <div className="w-full flex flex-col items-center justify-center content-section">
            <p className="text-xl mb-6 max-w-3xl w-full leading-relaxed text-center text-gray-400 tracking-wide">
              Gerencie seu arsenal completo de armaduras, capacetes, capas e builds.
            </p>
            <p className="text-xl mb-0 max-w-3xl w-full leading-relaxed text-center text-[#d4af37] tracking-wide">
              Junte-se à luta pela Democracia™, cidadão.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center content-section">
            {user ? (
              <>
                <Link href="/armory">
                  <Button size="lg">
                    ARSENAL
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" size="lg">
                    PERFIL DO OPERATIVO
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg">
                    INICIAR ALISTAMENTO
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg">
                    AUTORIZAR ACESSO
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 content-section">
            <Card glowColor="cyan">
              <div className="w-12 h-12 mb-4 flex items-center justify-center bg-[rgba(0,217,255,0.2)] [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,0_100%)]">
                <svg className="w-6 h-6 text-[#00d9ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 uppercase tracking-wider font-['Rajdhani'] text-[#00d9ff]">
                ARSENAL COMPLETO
              </h3>
              <p className="text-gray-400">
                Explore todas as armaduras disponíveis com filtros por categoria, stats e passivas.
              </p>
            </Card>

            <Card glowColor="gold">
              <div className="w-12 h-12 mb-4 flex items-center justify-center bg-[rgba(212,175,55,0.2)] [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,0_100%)]">
                <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 uppercase tracking-wider font-['Rajdhani'] text-[#d4af37]">
                CONFIGURAÇÕES TÁTICAS
              </h3>
              <p className="text-gray-400">
                Adicione armaduras à sua coleção pessoal, favorite equipamentos estratégicos e monte sua lista de desejos. Organize seu arsenal para servir a Democracia™ com máxima eficiência, cidadão.
              </p>
            </Card>

            <Card glowColor="green">
              <div className="w-12 h-12 mb-4 flex items-center justify-center bg-[rgba(57,255,20,0.2)] [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,0_100%)]">
                <svg className="w-6 h-6 text-[#39ff14]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 uppercase tracking-wider font-['Rajdhani'] text-[#39ff14]">
                COMUNIDADE
              </h3>
              <p className="text-gray-400 mb-3">
                Crie sets de armadura personalizados e explore configurações táticas de outros operativos. Compartilhe seus loadouts e aprenda com os melhores da Super Earth.
              </p>
              <div className="text-xs uppercase tracking-wider px-3 py-2 rounded bg-[rgba(255,165,0,0.2)] border border-[#ffa500] text-[#ffa500] font-['Rajdhani'] font-bold">
                ⚠️ RECURSO EM DESENVOLVIMENTO
              </div>
            </Card>
          </div>
        </div>
    </div>
  );
}
