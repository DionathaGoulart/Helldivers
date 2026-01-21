/**
 * Página Principal do Armory (Hub)
 * 
 * Permite que o usuário navegue para Sets, Capacetes, Armaduras ou Capas.
 */

'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/translations';
import Card from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultImage } from '@/lib/armory/images';

export default function ArmoryHubPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const navigationOptions = [
    {
      title: t('header.sets'),
      description: t('armory.subtitle'),
      href: '/armory/sets',
      image: '/images/sets-preview.jpg', // Placeholder, idealmente uma imagem representativa
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      title: t('header.helmets'),
      description: t('helmets.subtitle'),
      href: '/armory/helmets',
      image: '/images/helmets-preview.jpg',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      title: t('header.armors'),
      description: t('armors.subtitle'),
      href: '/armory/armors',
      image: '/images/armors-preview.jpg',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      title: t('header.capes'),
      description: t('capes.subtitle'),
      href: '/armory/capes',
      image: '/images/capes-preview.jpg',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M3 21h18M5 11V7a2 2 0 012-2h10a2 2 0 012 2v4M5 7l2-2h10l2 2" />
        </svg>
      )
    }
  ];

  return (
    <div className="container page-content">
      <div className="content-section flex flex-col items-center text-center mb-12">
        <h1 className="font-bold mb-4 uppercase font-['Orbitron'] text-white text-[clamp(2.5rem,6vw,4rem)]">
          {t('armory.titleFull')}
        </h1>
        <p className="text-xl text-gray-400 font-['Rajdhani'] max-w-2xl mx-auto text-center">
          {t('home.arsenalDescription')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {navigationOptions.map((option) => (
          <Link key={option.href} href={option.href} className="group">
            <Card
              className="h-full transform transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_0_30px_rgba(0,217,255,0.3)] border-2 border-[#3a4a5a] group-hover:border-[#00d9ff]"
              glowColor="cyan"
            >
              <div className="flex flex-col h-full items-center text-center p-8">
                <div className="mb-6 p-4 rounded-full bg-[rgba(0,217,255,0.1)] text-[#00d9ff] group-hover:bg-[#00d9ff] group-hover:text-black transition-colors duration-300">
                  {option.icon}
                </div>
                <h2 className="text-3xl font-bold mb-4 uppercase font-['Orbitron'] text-white group-hover:text-[#00d9ff] transition-colors">
                  {option.title}
                </h2>
                <p className="text-gray-400 font-['Rajdhani'] text-lg">
                  {option.description}
                </p>
                <div className="mt-8">
                  <span className="inline-block px-6 py-2 border border-[#00d9ff] text-[#00d9ff] font-bold uppercase tracking-wider font-['Rajdhani'] rounded hover:bg-[#00d9ff] hover:text-black transition-all">
                    {t('common.view')}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
