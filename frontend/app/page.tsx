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
            <div 
              className="w-32 h-32 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--democracy-gold) 0%, var(--alert-red) 100%)',
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                boxShadow: '0 0 30px rgba(212,175,55,0.5)',
              }}
            >
              <span 
                className="text-white font-bold text-6xl"
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  textShadow: '0 0 20px rgba(0,0,0,0.8)',
                }}
              >
                SE
              </span>
            </div>
          </div>

          <div style={{ marginTop: '4rem', marginBottom: '2rem' }}>
            <h1 
              className="text-5xl md:text-6xl font-bold mb-8 uppercase tracking-wider content-section"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                color: 'var(--text-primary)',
                textShadow: '0 0 20px rgba(0,217,255,0.8)',
              }}
            >
            BEM-VINDO À{' '}
            <span style={{
              color: 'var(--democracy-gold)',
              textShadow: '0 0 20px rgba(212,175,55,0.8)',
            }}>
              SUPER EARTH
            </span>
          </h1>
          </div>
          
          <div className="w-full flex flex-col items-center justify-center content-section">
            <p 
              className="text-xl mb-6 max-w-3xl w-full leading-relaxed text-center"
              style={{ 
                color: 'var(--text-secondary)',
                lineHeight: '1.8',
                letterSpacing: '0.5px',
              }}
            >
              Gerencie seu arsenal completo de armaduras, capacetes, capas e builds.
            </p>
            <p 
              className="text-xl mb-0 max-w-3xl w-full leading-relaxed text-center"
              style={{ 
                color: 'var(--democracy-gold)',
                lineHeight: '1.8',
                letterSpacing: '0.5px',
                textShadow: '0 0 10px rgba(212,175,55,0.3)',
              }}
            >
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
              <div className="w-12 h-12 mb-4 flex items-center justify-center" style={{
                backgroundColor: 'rgba(0,217,255,0.2)',
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
              }}>
                <svg className="w-6 h-6" style={{ color: 'var(--holo-cyan)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 
                className="text-xl font-semibold mb-2 uppercase tracking-wider"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  color: 'var(--holo-cyan)',
                  textShadow: '0 0 10px rgba(0,217,255,0.5)',
                }}
              >
                ARSENAL COMPLETO
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Explore todas as armaduras disponíveis com filtros por categoria, stats e passivas.
              </p>
            </Card>

            <Card glowColor="gold">
              <div className="w-12 h-12 mb-4 flex items-center justify-center" style={{
                backgroundColor: 'rgba(212,175,55,0.2)',
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
              }}>
                <svg className="w-6 h-6" style={{ color: 'var(--democracy-gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 
                className="text-xl font-semibold mb-2 uppercase tracking-wider"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  color: 'var(--democracy-gold)',
                  textShadow: '0 0 10px rgba(212,175,55,0.5)',
                }}
              >
                CONFIGURAÇÕES TÁTICAS
              </h3>
              <p style={{ color: 'var(--text-secondary)' }}>
                Adicione armaduras à sua coleção pessoal, favorite equipamentos estratégicos e monte sua lista de desejos. Organize seu arsenal para servir a Democracia™ com máxima eficiência, cidadão.
              </p>
            </Card>

            <Card glowColor="green">
              <div className="w-12 h-12 mb-4 flex items-center justify-center" style={{
                backgroundColor: 'rgba(57,255,20,0.2)',
                clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
              }}>
                <svg className="w-6 h-6" style={{ color: 'var(--terminal-green)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 
                className="text-xl font-semibold mb-2 uppercase tracking-wider"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  color: 'var(--terminal-green)',
                  textShadow: '0 0 10px rgba(57,255,20,0.5)',
                }}
              >
                COMUNIDADE
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                Crie sets de armadura personalizados e explore configurações táticas de outros operativos. Compartilhe seus loadouts e aprenda com os melhores da Super Earth.
              </p>
              <div 
                className="text-xs uppercase tracking-wider px-3 py-2 rounded"
                style={{
                  backgroundColor: 'rgba(255,165,0,0.2)',
                  border: '1px solid var(--warning)',
                  color: 'var(--warning)',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 700,
                }}
              >
                ⚠️ RECURSO EM DESENVOLVIMENTO
              </div>
            </Card>
          </div>
        </div>
    </div>
  );
}
