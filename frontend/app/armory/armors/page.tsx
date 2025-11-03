/**
 * Página de Armaduras
 * 
 * Exibe todas as armaduras disponíveis com filtros avançados, incluindo filtro por passe.
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
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import CachedImage from '@/components/ui/CachedImage';

// 4. Utilitários e Constantes
import { getDefaultImage } from '@/lib/armory/images';
import { getTranslatedName, getTranslatedDescription, getTranslatedEffect } from '@/lib/i18n';

// 5. Tipos
import type { Armor, ArmorFilters, BattlePass } from '@/lib/types/armory';

// 6. Serviços e Libs
import { getArmors, getPasses } from '@/lib/armory-cached';

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Componente da página de Armaduras
 */
export default function ArmorsPage() {
  // ============================================================================
  // HOOKS
  // ============================================================================

  const { isPortuguese } = useLanguage();
  const { t } = useTranslation();
  
  // Função para traduzir categoria
  const translateCategory = (categoryDisplay: string | undefined) => {
    if (!categoryDisplay) return '';
    const categoryLower = categoryDisplay.toLowerCase();
    if (categoryLower === 'leve' || categoryLower === 'light') {
      return t('armory.light');
    }
    if (categoryLower === 'médio' || categoryLower === 'medio' || categoryLower === 'medium') {
      return t('armory.medium');
    }
    if (categoryLower === 'pesado' || categoryLower === 'heavy') {
      return t('armory.heavy');
    }
    return categoryDisplay; // Retorna o original se não encontrar correspondência
  };

  // ============================================================================
  // STATE
  // ============================================================================

  const [armors, setArmors] = useState<Armor[]>([]);
  const [passes, setPasses] = useState<BattlePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ArmorFilters>({
    ordering: 'name',
  });
  const [search, setSearch] = useState('');

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
   * Carrega armaduras quando filtros ou busca mudarem
   */
  useEffect(() => {
    const fetchArmors = async () => {
      setLoading(true);
      try {
        const data = await getArmors({
          ...filters,
          search: search || undefined,
        });
        setArmors(Array.isArray(data) ? data : []);
      } catch (error) {
        // Erro ao buscar armaduras
        setArmors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArmors();
  }, [filters, search]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handler para mudança do filtro de fonte de aquisição
   * Reseta o filtro de passe quando a fonte não for 'pass'
   */
  const handleSourceChange = (source: 'store' | 'pass' | '') => {
    const newFilters: ArmorFilters = { ...filters, source: source || undefined };
    
    // Se não for 'pass', remover o filtro de passe
    if (source !== 'pass') {
      delete newFilters.pass_field;
    }
    
    setFilters(newFilters);
  };


  return (
    <div className="container page-content">
        <div className="content-section">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('armors.title')}</h1>
          <p className="text-gray-600">Explore todas as armaduras disponíveis</p>
        </div>

        {/* Filtros */}
        <Card className="content-section">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
          
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            {/* Filtro de Fonte de Aquisição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fonte de Aquisição
              </label>
              <select
                value={filters.source || ''}
                onChange={(e) =>
                  handleSourceChange(
                    (e.target.value as 'store' | 'pass' | '') || ''
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Todas</option>
                <option value="store">Loja</option>
                <option value="pass">Passe</option>
              </select>
            </div>

            {/* Filtro de Passe - aparece apenas quando source === 'pass' */}
            {filters.source === 'pass' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passe
                </label>
                <select
                  value={filters.pass_field || ''}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      pass_field: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    category: (e.target.value as any) || undefined,
                  })
                }
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
                placeholder={t('armory.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div>
              <Input
                type="number"
                placeholder={t('armory.cost')}
                value={filters.cost__lte || ''}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    cost__lte: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>

            <div>
              <select
                value={filters.ordering || 'name'}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    ordering: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="name">{t('armory.ordering')} (A-Z)</option>
                <option value="-name">{t('armory.ordering')} (Z-A)</option>
                <option value="cost">{t('armory.cost')} ({t('common.lower')})</option>
                <option value="-cost">{t('armory.cost')} ({t('common.higher')})</option>
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
            {t('armory.clear')}
          </Button>
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{t('armors.loading')}</p>
          </div>
        ) : armors.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-600">{t('armors.noResults')}</p>
          </Card>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {t('armors.results', { count: armors.length })}
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {armors.map((armor) => (
                <Card key={armor.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <CachedImage
                      src={armor.image}
                      fallback={getDefaultImage('armor')}
                      alt={getTranslatedName(armor, isPortuguese())}
                      className="w-full h-48 object-cover rounded-t-lg bg-gray-200"
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{getTranslatedName(armor, isPortuguese())}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {translateCategory(armor.category_display)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                      <div>
                        <p className="text-gray-600">{t('armors.armor')}</p>
                        <p className="font-semibold">{(armor as any).armor}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">{t('armors.speed')}</p>
                        <p className="font-semibold">{(armor as any).speed}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">{t('armors.stamina')}</p>
                        <p className="font-semibold">{(armor as any).stamina}</p>
                      </div>
                    </div>

                    {armor.passive_detail && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {getTranslatedName(armor.passive_detail, isPortuguese())}
                        </p>
                        <p className="text-xs text-gray-600">
                          {getTranslatedEffect(armor.passive_detail, isPortuguese())}
                        </p>
                      </div>
                    )}

                    {/* Informação do passe se aplicável */}
                    {armor.pass_detail && (
                      <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm font-medium text-purple-900 mb-1">
                          {t('armors.pass')}: {getTranslatedName(armor.pass_detail, isPortuguese())}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {armor.cost.toLocaleString('pt-BR')} {armor.cost_currency}
                      </span>
                      <Button size="sm" variant="outline">
                        {t('armors.viewDetails')}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
  );
}

