'use client';

import { useState, useEffect } from 'react';
import { getArmors, Armor, ArmorFilters, addFavorite, removeFavorite, isFavorite } from '@/lib/armory';
import { getDefaultImage } from '@/lib/armory/images';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ArmorsPage() {
  const [armors, setArmors] = useState<Armor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ArmorFilters>({
    ordering: 'name'
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchArmors = async () => {
      setLoading(true);
      try {
        const data = await getArmors({
          ...filters,
          search: search || undefined
        });
        // Garantir que é um array
        setArmors(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao buscar armaduras:', error);
        setArmors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArmors();
  }, [filters, search]);

  const handleToggleFavorite = (armor: Armor) => {
    const favorite = isFavorite('armor', armor.id);
    
    if (favorite) {
      removeFavorite('armor', armor.id);
    } else {
      addFavorite({
        type: 'armor',
        id: armor.id,
        name: armor.name,
        image: armor.image
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Armaduras</h1>
          <p className="text-gray-600">Explore todas as armaduras disponíveis</p>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
          
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value as any || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todas</option>
                <option value="light">Leve</option>
                <option value="medium">Médio</option>
                <option value="heavy">Pesado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Armadura</label>
              <select
                value={filters.armor || ''}
                onChange={(e) => setFilters({ ...filters, armor: e.target.value as any || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todas</option>
                <option value="low">Baixo</option>
                <option value="medium">Médio</option>
                <option value="high">Alto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Velocidade</label>
              <select
                value={filters.speed || ''}
                onChange={(e) => setFilters({ ...filters, speed: e.target.value as any || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todas</option>
                <option value="low">Baixo</option>
                <option value="medium">Médio</option>
                <option value="high">Alto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stamina</label>
              <select
                value={filters.stamina || ''}
                onChange={(e) => setFilters({ ...filters, stamina: e.target.value as any || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todas</option>
                <option value="low">Baixo</option>
                <option value="medium">Médio</option>
                <option value="high">Alto</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <Input
                type="text"
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <Input
                type="number"
                placeholder="Custo máximo"
                value={filters.cost__lte || ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  cost__lte: e.target.value ? Number(e.target.value) : undefined 
                })}
              />
            </div>

            <div>
              <select
                value={filters.ordering || 'name'}
                onChange={(e) => setFilters({ ...filters, ordering: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="name">Nome (A-Z)</option>
                <option value="-name">Nome (Z-A)</option>
                <option value="cost">Custo (Menor)</option>
                <option value="-cost">Custo (Maior)</option>
              </select>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setFilters({ ordering: 'name' });
              setSearch('');
            }}
          >
            Limpar Filtros
          </Button>
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando armaduras...</p>
          </div>
        ) : armors.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600">Nenhuma armadura encontrada</p>
          </Card>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {armors.length} armadura(s) encontrada(s)
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {armors.map((armor) => {
                const favorite = isFavorite('armor', armor.id);
                
                return (
                  <Card key={armor.id} className="hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={armor.image || getDefaultImage('armor')}
                        alt={armor.name}
                        className="w-full h-48 object-cover rounded-t-lg bg-gray-200"
                      />
                      <button
                        onClick={() => handleToggleFavorite(armor)}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                      >
                        <svg
                          className={`w-5 h-5 ${favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{armor.name}</h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {armor.category_display}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                        <div>
                          <p className="text-gray-600">Classificação da armadura</p>
                          <p className="font-semibold">{(armor as any).armor}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Velocidade</p>
                          <p className="font-semibold">{(armor as any).speed}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Regeneração de Resistência</p>
                          <p className="font-semibold">{(armor as any).stamina}</p>
                        </div>
                      </div>

                      {armor.passive_detail && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {armor.passive_detail.name}
                          </p>
                          <p className="text-xs text-gray-600">{armor.passive_detail.effect}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          {armor.cost.toLocaleString('pt-BR')} SC
                        </span>
                        <Button size="sm" variant="outline">
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

