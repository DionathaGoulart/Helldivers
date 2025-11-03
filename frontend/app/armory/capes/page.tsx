/**
 * Página de Capas
 * 
 * Exibe todas as capas disponíveis com filtros, incluindo filtro por passe.
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

// 1. React e Next.js
import { useState, useEffect } from 'react';

// 2. Contextos e Hooks customizados
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';

// 3. Componentes
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import CachedImage from '@/components/ui/CachedImage';

// 4. Utilitários e Constantes
import { getDefaultImage } from '@/lib/armory/images';
import { getTranslatedName } from '@/lib/i18n';

// 5. Tipos
import type { Cape, ItemFilters, BattlePass } from '@/lib/types/armory';

// 6. Serviços e Libs
import { getCapes, getPasses } from '@/lib/armory-cached';

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Componente da página de Capas
 */
export default function CapesPage() {
  const { isPortuguese } = useLanguage();
  const { t } = useTranslation();
  // ============================================================================
  // STATE
  // ============================================================================

  const [capes, setCapes] = useState<Cape[]>([]);
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
        // Erro ao buscar passes
        setPasses([]);
      }
    };

    fetchPasses();
  }, []);

  /**
   * Carrega capas quando filtros mudarem
   */
  useEffect(() => {
    const fetchCapes = async () => {
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

        const data = await getCapes(filters);
        setCapes(Array.isArray(data) ? data : []);
      } catch (error) {
        // Erro ao buscar capas
        setCapes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCapes();
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('capes.title')}</h1>
          <p className="text-gray-600">{t('capes.subtitle')}</p>
        </div>

        {/* Filtros */}
        <Card className="content-section">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('capes.filters')}</h2>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {/* Fonte de Aquisição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('armory.source')}
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
                <option value="">{t('armory.all')}</option>
                <option value="store">{t('armory.store')}</option>
                <option value="pass">{t('armory.pass')}</option>
              </select>
            </div>

            {/* Passe - aparece apenas quando source === 'pass' */}
            {source === 'pass' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('capes.pass')}
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
                  <option value="">{t('capes.allPasses')}</option>
                  {passes.map((pass) => (
                    <option key={pass.id} value={pass.id}>
                      {getTranslatedName(pass, isPortuguese())}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Busca */}
            <div>
              <Input
                type="text"
                placeholder={t('capes.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {/* Custo máximo */}
            <div>
              <Input
                type="number"
                placeholder={t('capes.cost')}
                value={maxCost}
                onChange={(e) => setMaxCost(e.target.value)}
              />
            </div>

            {/* Ordenação */}
            <div>
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="name">{t('armors.nameAZ')}</option>
                <option value="-name">{t('armors.nameZA')}</option>
                <option value="cost">{t('armors.costLower')}</option>
                <option value="-cost">{t('armors.costHigher')}</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleClearFilters}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('armory.clear')}
          </button>
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{t('capes.loading')}</p>
          </div>
        ) : capes.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600">{t('capes.noResults')}</p>
          </Card>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {t('capes.results', { count: capes.length })}
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {capes.map((cape) => (
                <Card key={cape.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <CachedImage
                      src={cape.image}
                      fallback={getDefaultImage('cape')}
                      alt={cape.name}
                      className="w-full h-48 object-cover rounded-t-lg bg-gray-100"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {getTranslatedName(cape, isPortuguese())}
                    </h3>

                    {/* Informação do passe se aplicável */}
                    {cape.pass_detail && (
                      <div className="mb-3 p-2 bg-purple-50 rounded-lg">
                        <p className="text-xs text-purple-800 font-medium">
                          {t('capes.pass')}: {getTranslatedName(cape.pass_detail, isPortuguese())}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-lg font-semibold text-gray-700">
                        {t('capes.cost')}
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {cape.cost.toLocaleString('pt-BR')} {cape.cost_currency}
                      </span>
                    </div>

                    {cape.source_display && (
                      <p className="text-sm text-gray-600 mt-3">
                        {cape.source_display}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
  );
}
