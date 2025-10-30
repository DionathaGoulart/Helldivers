'use client';

import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getSets, getPassives, ArmorSet } from '@/lib/armory';
import { getDefaultImage } from '@/lib/armory/images';

export default function ArmoryPage() {
  const [sets, setSets] = useState<ArmorSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState<'name' | '-name' | 'cost' | '-cost' | 'armor' | '-armor' | 'speed' | '-speed' | 'stamina' | '-stamina'>('name');
  const [passives, setPassives] = useState<{ id: number; name: string }[]>([]);
  const [passiveId, setPassiveId] = useState<number | ''>('');
  const [category, setCategory] = useState<'' | 'light' | 'medium' | 'heavy'>('');
  const [source, setSource] = useState<'' | 'store' | 'pass'>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced filters
  const [selectedPassives, setSelectedPassives] = useState<number[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Array<'light' | 'medium' | 'heavy'>>([]);
  const [selectedSources, setSelectedSources] = useState<Array<'store' | 'pass'>>([]);
  const [costMin, setCostMin] = useState<number | ''>('');
  const [costMax, setCostMax] = useState<number | ''>('');
  const [armorMin, setArmorMin] = useState<number | ''>('');
  const [armorMax, setArmorMax] = useState<number | ''>('');
  const [speedMin, setSpeedMin] = useState<number | ''>('');
  const [speedMax, setSpeedMax] = useState<number | ''>('');
  const [staminaMin, setStaminaMin] = useState<number | ''>('');
  const [staminaMax, setStaminaMax] = useState<number | ''>('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [setsData, passivesData] = await Promise.all([
          getSets({ search: search || undefined, ordering: ordering === 'name' || ordering === '-name' ? ordering : 'name' }),
          getPassives(),
        ]);
        setSets(Array.isArray(setsData) ? setsData : []);
        setPassives((passivesData || []).map((p: any) => ({ id: p.id, name: p.name })));
      } catch (e) {
        console.error('Erro ao buscar sets/passivas:', e);
        setSets([]);
        setPassives([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [search, ordering]);

  const displayedSets = useMemo(() => {
    let list = [...sets];
    if (passiveId) {
      list = list.filter((s) => s.passive_detail?.id === passiveId);
    }
    if (category) {
      list = list.filter((s) => s.armor_stats?.category === category);
    }
    if (source) {
      list = list.filter((s) => (s as any).source === source);
    }

    // Advanced filters
    if (selectedPassives.length > 0) {
      list = list.filter((s) => (s.passive_detail ? selectedPassives.includes(s.passive_detail.id) : false));
    }
    if (selectedCategories.length > 0) {
      list = list.filter((s) => (s.armor_stats?.category ? selectedCategories.includes(s.armor_stats.category as any) : false));
    }
    if (selectedSources.length > 0) {
      list = list.filter((s) => (s as any).source && selectedSources.includes((s as any).source));
    }
    if (costMin !== '' || costMax !== '') {
      list = list.filter((s) => {
        const total = s.total_cost || 0;
        if (costMin !== '' && total < (costMin as number)) return false;
        if (costMax !== '' && total > (costMax as number)) return false;
        return true;
      });
    }
    if (armorMin !== '' || armorMax !== '') {
      list = list.filter((s) => {
        const v = s.armor_stats?.armor || 0;
        if (armorMin !== '' && v < (armorMin as number)) return false;
        if (armorMax !== '' && v > (armorMax as number)) return false;
        return true;
      });
    }
    if (speedMin !== '' || speedMax !== '') {
      list = list.filter((s) => {
        const v = s.armor_stats?.speed || 0;
        if (speedMin !== '' && v < (speedMin as number)) return false;
        if (speedMax !== '' && v > (speedMax as number)) return false;
        return true;
      });
    }
    if (staminaMin !== '' || staminaMax !== '') {
      list = list.filter((s) => {
        const v = s.armor_stats?.stamina || 0;
        if (staminaMin !== '' && v < (staminaMin as number)) return false;
        if (staminaMax !== '' && v > (staminaMax as number)) return false;
        return true;
      });
    }
    if (ordering === 'cost' || ordering === '-cost') {
      list.sort((a, b) => (a.total_cost || 0) - (b.total_cost || 0));
      if (ordering === '-cost') list.reverse();
    } else if (ordering === 'armor' || ordering === '-armor') {
      list.sort((a, b) => (a.armor_stats?.armor || 0) - (b.armor_stats?.armor || 0));
      if (ordering === '-armor') list.reverse();
    } else if (ordering === 'speed' || ordering === '-speed') {
      list.sort((a, b) => (a.armor_stats?.speed || 0) - (b.armor_stats?.speed || 0));
      if (ordering === '-speed') list.reverse();
    } else if (ordering === 'stamina' || ordering === '-stamina') {
      list.sort((a, b) => (a.armor_stats?.stamina || 0) - (b.armor_stats?.stamina || 0));
      if (ordering === '-stamina') list.reverse();
    }
    return list;
  }, [sets, passiveId, category, source, ordering]);

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
          <div className="grid md:grid-cols-5 gap-4 mb-4">
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
                onChange={(e) => setOrdering(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="name">Nome (A-Z)</option>
                <option value="-name">Nome (Z-A)</option>
                <option value="cost">Valor total (Menor)</option>
                <option value="-cost">Valor total (Maior)</option>
                <option value="armor">Classificação (Menor)</option>
                <option value="-armor">Classificação (Maior)</option>
                <option value="speed">Velocidade (Menor)</option>
                <option value="-speed">Velocidade (Maior)</option>
                <option value="stamina">Regeneração (Menor)</option>
                <option value="-stamina">Regeneração (Maior)</option>
              </select>
            </div>

            <div>
              <select
                value={passiveId}
                onChange={(e) => setPassiveId(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todas as passivas</option>
                {passives.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={category}
                onChange={(e) => setCategory((e.target.value as any) || '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todas as categorias</option>
                <option value="light">Leve</option>
                <option value="medium">Médio</option>
                <option value="heavy">Pesado</option>
              </select>
            </div>

            <div>
              <select
                value={source}
                onChange={(e) => setSource((e.target.value as any) || '')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todas as fontes</option>
                <option value="store">Loja</option>
                <option value="pass">Passe</option>
              </select>
            </div>
          </div>

          {/* Toggle advanced */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="outline" onClick={() => setShowAdvanced((v) => !v)}>
              {showAdvanced ? 'Ocultar filtros avançados' : 'Mostrar filtros avançados'}
            </Button>
          </div>

          {showAdvanced && (
            <div className="space-y-6 border-t border-gray-200 pt-6">
              {/* Quick chips for categories and sources */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Categorias</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'light', label: 'Leve' },
                      { key: 'medium', label: 'Médio' },
                      { key: 'heavy', label: 'Pesado' },
                    ].map((c: any) => {
                      const active = selectedCategories.includes(c.key);
                      return (
                        <button
                          key={c.key}
                          onClick={() => {
                            setSelectedCategories((prev) =>
                              active ? prev.filter((v) => v !== c.key) : [...prev, c.key]
                            );
                          }}
                          className={`px-3 py-1 rounded-full border text-sm ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Fonte de Aquisição</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'store', label: 'Loja' },
                      { key: 'pass', label: 'Passe' },
                    ].map((s: any) => {
                      const active = selectedSources.includes(s.key);
                      return (
                        <button
                          key={s.key}
                          onClick={() => {
                            setSelectedSources((prev) =>
                              active ? prev.filter((v) => v !== s.key) : [...prev, s.key]
                            );
                          }}
                          className={`px-3 py-1 rounded-full border text-sm ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
        </div>

              {/* Passive multi-select */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Passivas</p>
                <select
                  multiple
                  value={selectedPassives.map(String)}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
                    setSelectedPassives(values);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32"
                >
                  {passives.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Ranges */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Custo total (SC/Medalhas)</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={costMin}
                      onChange={(e) => setCostMin(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      value={costMax}
                      onChange={(e) => setCostMax(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Classificação da armadura</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={armorMin}
                      onChange={(e) => setArmorMin(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      value={armorMax}
                      onChange={(e) => setArmorMax(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Velocidade</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={speedMin}
                      onChange={(e) => setSpeedMin(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      value={speedMax}
                      onChange={(e) => setSpeedMax(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Regeneração</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Mín"
                      value={staminaMin}
                      onChange={(e) => setStaminaMin(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Máx"
                      value={staminaMax}
                      onChange={(e) => setStaminaMax(e.target.value ? Number(e.target.value) : '')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
            </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedPassives([]);
                    setSelectedCategories([]);
                    setSelectedSources([]);
                    setCostMin('');
                    setCostMax('');
                    setArmorMin('');
                    setArmorMax('');
                    setSpeedMin('');
                    setSpeedMax('');
                    setStaminaMin('');
                    setStaminaMax('');
                  }}
                >
                  Limpar filtros avançados
                </Button>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => {
              setSearch('');
              setOrdering('name');
              setPassiveId('');
              setCategory('');
              setSource('');
              setShowAdvanced(false);
              setSelectedPassives([]);
              setSelectedCategories([]);
              setSelectedSources([]);
              setCostMin('');
              setCostMax('');
              setArmorMin('');
              setArmorMax('');
              setSpeedMin('');
              setSpeedMax('');
              setStaminaMin('');
              setStaminaMax('');
            }}
          >
            Limpar Filtros
          </Button>
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando sets...</p>
          </div>
        ) : displayedSets.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600">Nenhum set encontrado</p>
          </Card>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {displayedSets.length} set(s) encontrado(s)
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSets.map((set) => (
                <Card key={set.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    <img
                      src={set.image || getDefaultImage('set')}
                      alt={set.name}
                      className="w-full h-full object-cover"
                    />
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

                    {/* Stats resumidos */}
                    {set.armor_stats && (
                      <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                        <div className="p-2 bg-gray-50 rounded text-center">
                          <p className="text-gray-600 text-xs">Armadura</p>
                          <p className="font-semibold">{set.armor_stats.armor}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded text-center">
                          <p className="text-gray-600 text-xs">Velocidade</p>
                          <p className="font-semibold">{set.armor_stats.speed}</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded text-center">
                          <p className="text-gray-600 text-xs">Regeneração</p>
                          <p className="font-semibold">{set.armor_stats.stamina}</p>
                        </div>
                      </div>
                    )}

                    {/* Custo Total */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-semibold text-gray-700">Custo Total</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {(set.total_cost || 0).toLocaleString('pt-BR')} {(set as any).source === 'pass' ? 'Medalhas' : 'Supercréditos'}
                      </span>
              </div>
            </div>
          </Card>
              ))}
        </div>
          </>
        )}
      </div>
    </div>
  );
}

