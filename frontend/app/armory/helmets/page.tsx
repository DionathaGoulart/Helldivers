/**
 * Página de Capacetes
 * 
 * Exibe todos os capacetes disponíveis com filtros, incluindo filtro por passe.
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

import { useState, useEffect } from 'react';
import {
  getHelmets,
  getPasses,
  Helmet,
  ItemFilters,
  BattlePass,
  addFavorite,
  removeFavorite,
  isFavorite,
} from '@/lib/armory';
import { getDefaultImage } from '@/lib/armory/images';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Componente da página de Capacetes
 */
export default function HelmetsPage() {
  // ============================================================================
  // STATE
  // ============================================================================

  const [helmets, setHelmets] = useState<Helmet[]>([]);
  const [passes, setPasses] = useState<BattlePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [maxCost, setMaxCost] = useState<string>('');
  const [ordering, setOrdering] = useState('name');
  const [source, setSource] = useState<'store' | 'pass' | ''>('');
  const [passField, setPassField] = useState<number | ''>('');

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Carrega passes ao montar o componente
   */
  useEffect(() => {
    const fetchPasses = async () => {
      try {
        const passesData = await getPasses();
        setPasses(Array.isArray(passesData) ? passesData : []);
      } catch (error) {
        console.error('Erro ao buscar passes:', error);
        setPasses([]);
      }
    };

    fetchPasses();
  }, []);

  /**
   * Carrega capacetes quando filtros mudarem
   */
  useEffect(() => {
    const fetchHelmets = async () => {
      setLoading(true);
      try {
        const filters: ItemFilters = {
          search: search || undefined,
          cost__lte: maxCost ? Number(maxCost) : undefined,
          ordering: ordering,
        };

        if (source) {
          filters.source = source;
        }

        if (passField) {
          filters.pass_field = Number(passField);
        }

        const data = await getHelmets(filters);
        setHelmets(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao buscar capacetes:', error);
        setHelmets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHelmets();
  }, [search, maxCost, ordering, source, passField]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handler para mudança do filtro de fonte de aquisição
   */
  const handleSourceChange = (newSource: 'store' | 'pass' | '') => {
    setSource(newSource);
    // Se não for 'pass', limpar o filtro de passe
    if (newSource !== 'pass') {
      setPassField('');
    }
  };

  /**
   * Handler para toggle de favorito
   */
  const handleToggleFavorite = (helmet: Helmet) => {
    const favorite = isFavorite('helmet', helmet.id);

    if (favorite) {
      removeFavorite('helmet', helmet.id);
    } else {
      addFavorite({
        type: 'helmet',
        id: helmet.id,
        name: helmet.name,
        image: helmet.image,
      });
    }
  };

  /**
   * Limpa todos os filtros
   */
  const handleClearFilters = () => {
    setSearch('');
    setMaxCost('');
    setOrdering('name');
    setSource('');
    setPassField('');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (

      <div className="container page-content">
        {/* Título */}
        <div className="content-section">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Capacetes</h1>
          <p className="text-gray-600">Explore todos os capacetes disponíveis</p>
        </div>

        {/* Filtros */}
        <Card className="content-section">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {/* Fonte de Aquisição */}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fonte de Aquisição
              </label>
              <select
                value={source}
                onChange={(e) =>
                  handleSourceChange(
                    (e.target.value as 'store' | 'pass' | '') || ''
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todas</option>
                <option value="store">Loja</option>
                <option value="pass">Passe</option>
              </select>
            </div>

            {/* Passe - aparece apenas quando source === 'pass' */}
            {source === 'pass' && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passe
                </label>
                <select
                  value={passField}
                  onChange={(e) =>
                    setPassField(
                      e.target.value ? Number(e.target.value) : ''
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Todos os passes</option>
                  {passes.map((pass) => (
                    <option key={pass.id} value={pass.id}>
                      {pass.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Busca */}
              <Input
                type="text"
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Custo máximo */}
              <Input
                type="number"
                placeholder="Custo máximo"
                value={maxCost}
                onChange={(e) => setMaxCost(e.target.value)}
              />
            </div>

            {/* Ordenação */}
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="name">Nome (A-Z)</option>
                <option value="-name">Nome (Z-A)</option>
                <option value="cost">Custo (Menor)</option>
                <option value="-cost">Custo (Maior)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Limpar Filtros
          </button>
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Carregando capacetes...</p>
          </div>
        ) : helmets.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600">Nenhum capacete encontrado</p>
          </Card>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {helmets.length} capacete(s) encontrado(s)
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {helmets.map((helmet) => {
                const favorite = isFavorite('helmet', helmet.id);

                return (
                  <Card key={helmet.id} className="hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <img
                        src={helmet.image || getDefaultImage('helmet')}
                        alt={helmet.name}
                        className="w-full h-48 object-cover rounded-t-lg bg-gray-100"
                      />
                      <button
                        onClick={() => handleToggleFavorite(helmet)}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                      >
                        <svg
                          className={`w-5 h-5 ${
                            favorite
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-400'
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        {helmet.name}
                      </h3>

                      {/* Informação do passe se aplicável */}
                      {helmet.pass_detail && (
                        <div className="mb-3 p-2 bg-purple-50 rounded-lg">
                          <p className="text-xs text-purple-800 font-medium">
                            Passe: {helmet.pass_detail.name}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <span className="text-lg font-semibold text-gray-700">
                          Custo
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          {helmet.cost.toLocaleString('pt-BR')}{' '}
                          {helmet.cost_currency}
                        </span>
                      </div>

                      {helmet.source_display && (
                        <p className="text-sm text-gray-600 mt-3">
                          {helmet.source_display}
                        </p>
                      )}
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
