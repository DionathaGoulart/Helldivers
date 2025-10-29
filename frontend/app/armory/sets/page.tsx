'use client';

import { useState, useEffect } from 'react';
import { getSets, ArmorSet, addFavorite, removeFavorite, isFavorite } from '@/lib/armory';
import { getDefaultImage } from '@/lib/armory/images';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SetsPage() {
  const [sets, setSets] = useState<ArmorSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('name');
  const [selectedSet, setSelectedSet] = useState<ArmorSet | null>(null);

  useEffect(() => {
    const fetchSets = async () => {
      setLoading(true);
      try {
        const data = await getSets({ search: search || undefined, ordering: ordering as any });
        setSets(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao buscar sets:', error);
        setSets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, [search, ordering]);

  const handleToggleFavorite = (set: ArmorSet) => {
    const favorite = isFavorite('set', set.id);
    
    if (favorite) {
      removeFavorite('set', set.id);
    } else {
      addFavorite({
        type: 'set',
        id: set.id,
        name: set.name
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Sets de Armadura</h1>
          <p className="text-gray-600">Conjuntos completos de equipamento</p>
        </div>

        {/* Filtros */}
        <Card className="mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                placeholder="Buscar sets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            
            <div>
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="name">Nome (A-Z)</option>
                <option value="-name">Nome (Z-A)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando sets...</p>
          </div>
        ) : sets.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600">Nenhum set encontrado</p>
          </Card>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {sets.length} set(s) encontrado(s)
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sets.map((set) => {
                const favorite = isFavorite('set', set.id);
                
                return (
                  <Card key={set.id} className="hover:shadow-lg transition-shadow">
                    <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                      <img
                        src={set.image || getDefaultImage('set')}
                        alt={set.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleToggleFavorite(set)}
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
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900">{set.name}</h3>
                        {set.armor_stats?.category_display && (
                          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {set.armor_stats.category_display}
                          </span>
                        )}
                      </div>

                      {/* Stats da Armadura (Herdados) */}
                      {set.armor_stats && (
                        <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                          <div className="p-2 bg-gray-50 rounded text-center">
                            <p className="text-gray-600 text-xs">Armadura</p>
                            <p className="font-semibold">{set.armor_stats.armor_display || set.armor_stats.armor}</p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded text-center">
                            <p className="text-gray-600 text-xs">Velocidade</p>
                            <p className="font-semibold">{set.armor_stats.speed_display || set.armor_stats.speed}</p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded text-center">
                            <p className="text-gray-600 text-xs">Stamina</p>
                            <p className="font-semibold">{set.armor_stats.stamina_display || set.armor_stats.stamina}</p>
                          </div>
                        </div>
                      )}

                      {/* Itens do Set */}
                      <div className="space-y-2 mb-4">
                        {/* Capacete */}
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <img
                            src={set.helmet_detail?.image || getDefaultImage('helmet')}
                            alt={set.helmet_detail?.name || 'Capacete'}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-gray-600">Capacete</p>
                            <p className="text-sm font-medium text-gray-900">{set.helmet_detail?.name || 'N/A'}</p>
                          </div>
                        </div>
                        
                        {/* Armadura */}
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <img
                            src={set.armor_detail?.image || getDefaultImage('armor')}
                            alt={set.armor_detail?.name || 'Armadura'}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-gray-600">Armadura</p>
                            <p className="text-sm font-medium text-gray-900">{set.armor_detail?.name || 'N/A'}</p>
                          </div>
                        </div>
                        
                        {/* Capa */}
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <img
                            src={set.cape_detail?.image || getDefaultImage('cape')}
                            alt={set.cape_detail?.name || 'Capa'}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-xs text-gray-600">Capa</p>
                            <p className="text-sm font-medium text-gray-900">{set.cape_detail?.name || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Passiva do Set */}
                      {set.passive_detail && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg mb-4">
                          <img
                            src={getDefaultImage('passive')}
                            alt={set.passive_detail.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900 mb-1">
                              {set.passive_detail.name}
                            </p>
                            <p className="text-xs text-blue-800">{set.passive_detail.effect}</p>
                          </div>
                        </div>
                      )}

                      {/* Custo Total */}
                      <div className="flex items-center justify-between pt-2 pb-4 border-b border-gray-200">
                        <span className="text-lg font-semibold text-gray-700">Custo Total</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {set.total_cost?.toLocaleString('pt-BR') || 0} SC
                        </span>
                      </div>

                      <Button fullWidth className="mt-4" onClick={() => setSelectedSet(set)}>
                        Ver Detalhes Completos
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedSet && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedSet(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{selectedSet.name}</h2>
              <button
                onClick={() => setSelectedSet(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Imagem do Set */}
              <div className="relative h-64 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={selectedSet.image || getDefaultImage('set')}
                  alt={selectedSet.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Categoria */}
              {selectedSet.armor_stats?.category_display && (
                <div className="flex justify-center">
                  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {selectedSet.armor_stats.category_display}
                  </span>
                </div>
              )}

              {/* Stats da Armadura */}
              {selectedSet.armor_stats && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600 text-sm mb-2">Armadura</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedSet.armor_stats.armor_display || selectedSet.armor_stats.armor}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600 text-sm mb-2">Velocidade</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedSet.armor_stats.speed_display || selectedSet.armor_stats.speed}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-600 text-sm mb-2">Stamina</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedSet.armor_stats.stamina_display || selectedSet.armor_stats.stamina}
                    </p>
                  </div>
                </div>
              )}

              {/* Detalhes do Capacete */}
              {selectedSet.helmet_detail && (
                <Card className="p-6">
                  <h3 className="font-bold text-xl mb-4 text-gray-900">Capacete</h3>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="shrink-0">
                      <img
                        src={selectedSet.helmet_detail.image || getDefaultImage('helmet')}
                        alt={selectedSet.helmet_detail.name}
                        className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xl font-semibold text-gray-900 mb-2">{selectedSet.helmet_detail.name}</p>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Custo:</span> {selectedSet.helmet_detail.cost.toLocaleString('pt-BR')} {selectedSet.helmet_detail.cost_currency}
                        </p>
                        {selectedSet.helmet_detail.source_display && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Fonte:</span> {selectedSet.helmet_detail.source_display}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Detalhes da Armadura */}
              {selectedSet.armor_detail && (
                <Card className="p-6">
                  <h3 className="font-bold text-xl mb-4 text-gray-900">Armadura</h3>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="shrink-0">
                      <img
                        src={selectedSet.armor_detail.image || getDefaultImage('armor')}
                        alt={selectedSet.armor_detail.name}
                        className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xl font-semibold text-gray-900 mb-3">{selectedSet.armor_detail.name}</p>
                      
                      {/* Stats da Armadura */}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-gray-600 text-xs mb-1">Armadura</p>
                          <p className="text-lg font-bold text-blue-900">{selectedSet.armor_detail.armor_display}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <p className="text-gray-600 text-xs mb-1">Velocidade</p>
                          <p className="text-lg font-bold text-green-900">{selectedSet.armor_detail.speed_display}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                          <p className="text-gray-600 text-xs mb-1">Stamina</p>
                          <p className="text-lg font-bold text-purple-900">{selectedSet.armor_detail.stamina_display}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Custo:</span> {selectedSet.armor_detail.cost.toLocaleString('pt-BR')} {selectedSet.armor_detail.cost_currency}
                        </p>
                        {selectedSet.armor_detail.source_display && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Fonte:</span> {selectedSet.armor_detail.source_display}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Detalhes da Capa */}
              {selectedSet.cape_detail && (
                <Card className="p-6">
                  <h3 className="font-bold text-xl mb-4 text-gray-900">Capa</h3>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="shrink-0">
                      <img
                        src={selectedSet.cape_detail.image || getDefaultImage('cape')}
                        alt={selectedSet.cape_detail.name}
                        className="w-48 h-48 object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xl font-semibold text-gray-900 mb-2">{selectedSet.cape_detail.name}</p>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Custo:</span> {selectedSet.cape_detail.cost.toLocaleString('pt-BR')} {selectedSet.cape_detail.cost_currency}
                        </p>
                        {selectedSet.cape_detail.source_display && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Fonte:</span> {selectedSet.cape_detail.source_display}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Passiva do Set */}
              {selectedSet.passive_detail && (
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <h3 className="font-bold text-xl mb-4 text-blue-900">Passiva</h3>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="shrink-0">
                      <img
                        src={getDefaultImage('passive')}
                        alt={selectedSet.passive_detail.name}
                        className="w-48 h-48 object-cover rounded-lg border-2 border-blue-200"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xl font-semibold text-blue-900 mb-2">
                        {selectedSet.passive_detail.name}
                      </p>
                      <p className="text-blue-800 mb-3 text-lg">{selectedSet.passive_detail.effect}</p>
                      {selectedSet.passive_detail.description && (
                        <p className="text-sm text-blue-700">{selectedSet.passive_detail.description}</p>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Custo Total */}
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-semibold text-green-900">Custo Total</span>
                  <span className="text-3xl font-bold text-green-600">
                    {selectedSet.total_cost?.toLocaleString('pt-BR') || 0} SC
                  </span>
                </div>
              </Card>

              {/* Fonte de Aquisição */}
              {selectedSet.source && (
                <p className="text-sm text-gray-600 italic text-center">
                  {selectedSet.source}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

