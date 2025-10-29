'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import { getArmors, getHelmets, getCapes, getPassives } from '@/lib/armory';

export default function ArmoryPage() {
  const [stats, setStats] = useState({
    armors: 0,
    helmets: 0,
    capes: 0,
    passives: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [armors, helmets, capes, passives] = await Promise.all([
          getArmors(),
          getHelmets(),
          getCapes(),
          getPassives()
        ]);

        setStats({
          armors: Array.isArray(armors) ? armors.length : 0,
          helmets: Array.isArray(helmets) ? helmets.length : 0,
          capes: Array.isArray(capes) ? capes.length : 0,
          passives: Array.isArray(passives) ? passives.length : 0
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      }
    };

    fetchStats();
  }, []);
  const categories = [
    {
      title: 'Armaduras',
      description: 'Explore todas as armaduras disponíveis com filtros por categoria, stats e passivas',
      icon: '🛡️',
      href: '/armory/armors',
      color: 'blue'
    },
    {
      title: 'Capacetes',
      description: 'Catálogo completo de capacetes cosméticos',
      icon: '⚔️',
      href: '/armory/helmets',
      color: 'yellow'
    },
    {
      title: 'Capas',
      description: 'Coleção de capas cosméticas',
      icon: '📜',
      href: '/armory/capes',
      color: 'orange'
    },
    {
      title: 'Passivas',
      description: 'Lista completa de passivas disponíveis nas armaduras',
      icon: '✨',
      href: '/armory/passives',
      color: 'purple'
    },
    {
      title: 'Sets',
      description: 'Conjuntos completos de equipamento pré-montados',
      icon: '🎯',
      href: '/armory/sets',
      color: 'green'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Armory
          </h1>
          <p className="text-xl text-gray-600">
            Gerencie suas armaduras, capacetes, capas e builds favoritas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Link key={index} href={category.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">{category.icon}</div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                    {category.title}
                  </h2>
                  <p className="text-gray-600">
                    {category.description}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid md:grid-cols-4 gap-6">
          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.armors || '-'}
              </div>
              <p className="text-sm text-gray-600">Armaduras</p>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {stats.helmets || '-'}
              </div>
              <p className="text-sm text-gray-600">Capacetes</p>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {stats.capes || '-'}
              </div>
              <p className="text-sm text-gray-600">Capas</p>
            </div>
          </Card>
          <Card>
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.passives || '-'}
              </div>
              <p className="text-sm text-gray-600">Passivas</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

