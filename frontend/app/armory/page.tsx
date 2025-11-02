/**
 * Página principal do Armory - Sets de Armadura
 * 
 * Exibe todos os sets de armadura disponíveis com filtros, busca e ordenação.
 * Permite gerenciar relações (favoritos, coleção, wishlist) para usuários autenticados.
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import {
  getSets,
  getPassives,
  getPasses,
  addSetRelation,
  removeSetRelation,
  checkSetRelation,
} from '@/lib/armory-cached';
import { getDefaultImage } from '@/lib/armory/images';
import { getTranslatedName, getTranslatedEffect } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';
import { useAuth } from '@/contexts/AuthContext';
import type {
  ArmorSet,
  BattlePass,
  RelationType,
  SetRelationStatus,
} from '@/lib/types/armory';
import type {
  OrderingOption,
  CategoryOption,
  SourceOption,
  PassiveOption,
  UpdatingState,
} from './types';

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_ORDERING: OrderingOption = 'name';

// ============================================================================
// COMPONENTE PASSIVE SELECT
// ============================================================================

interface PassiveSelectProps {
  passives: PassiveOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

function PassiveSelect({ passives, selectedIds, onChange }: PassiveSelectProps) {
  const { isPortuguese } = useLanguage();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelectedIds, setTempSelectedIds] = useState<number[]>(selectedIds);

  const handleOpenModal = () => {
    setTempSelectedIds(selectedIds);
    setIsModalOpen(true);
  };

  // Fechar modal ao pressionar ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
        setTempSelectedIds(selectedIds);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, selectedIds]);

  const handleTogglePassive = (id: number) => {
    setTempSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    onChange(tempSelectedIds);
    setIsModalOpen(false);
  };

  const handleClear = () => {
    setTempSelectedIds([]);
    onChange([]);
    setIsModalOpen(false);
  };

  const selectedPassives = passives.filter((p) => selectedIds.includes(p.id));

  return (
    <>
      <div className="hd-select">
      <button
        type="button"
        onClick={handleOpenModal}
        className="hd-select__button w-full"
      >
        <span className="hd-select__value truncate">
          {selectedPassives.length > 0
            ? selectedPassives.length === 1
              ? getTranslatedName(selectedPassives[0], isPortuguese())
              : t('armory.selectedPassives', { count: selectedPassives.length })
            : t('armory.allPassives')}
        </span>
        <svg
          className="hd-select__arrow"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 9L1 4h10z" fill="currentColor" />
        </svg>
      </button>
      </div>

      {isModalOpen && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm" 
          onClick={(e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
              setTempSelectedIds(selectedIds);
            }
          }}
        >
          <div onClick={(e: React.MouseEvent) => e.stopPropagation()} className="w-full max-w-3xl h-[90vh] flex flex-col">
            <Card className="w-full h-full flex flex-col p-0 overflow-hidden" glowColor="cyan">
            {/* Header */}
            <div className="shrink-0 p-3 md:p-6 border-b-2 border-[#3a4a5a] bg-[rgba(26,35,50,0.98)] backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <h3 className="text-base md:text-xl font-bold uppercase tracking-wider font-['Rajdhani'] text-[#00d9ff]">
                  {t('armory.selectPassives')}
                </h3>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setTempSelectedIds(selectedIds);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {tempSelectedIds.length > 0 && (
                <p className="text-xs md:text-sm text-gray-400 font-['Rajdhani']">
                  {t('armory.selectedPassives', { count: tempSelectedIds.length })}
                </p>
              )}
            </div>

            {/* Content - área rolável */}
            <div className="flex-1 overflow-y-scroll overflow-x-hidden p-3 md:p-6" style={{ maxHeight: 'calc(90vh - 240px)', minHeight: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                {passives.map((passive) => {
                  const isSelected = tempSelectedIds.includes(passive.id);
                  return (
                    <button
                      key={passive.id}
                      type="button"
                      onClick={() => handleTogglePassive(passive.id)}
                      className={`p-3 md:p-5 border-2 rounded-lg transition-all text-left flex items-start gap-2 md:gap-4 hover:border-[#00d9ff] ${
                        isSelected
                          ? 'border-[#00d9ff] bg-[rgba(0,217,255,0.1)]'
                          : 'border-[#3a4a5a] bg-[rgba(26,35,50,0.3)]'
                      }`}
                    >
                      <div className={`shrink-0 w-5 h-5 mt-0.5 border-2 rounded flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'border-[#00d9ff] bg-[#00d9ff]'
                          : 'border-[#3a4a5a] bg-transparent'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {passive.image && (
                        <img
                          src={passive.image || getDefaultImage('passive')}
                          alt={getTranslatedName(passive, isPortuguese())}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover shrink-0 border-2 border-[#3a4a5a] [clip-path:polygon(0_0,calc(100%-4px)_0,100%_4px,100%_100%,0_100%)]"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-sm md:text-base font-semibold text-white mb-1 md:mb-2 font-['Rajdhani']">{getTranslatedName(passive, isPortuguese())}</div>
                        <div className="text-xs md:text-sm text-gray-400 leading-relaxed">{getTranslatedEffect(passive, isPortuguese())}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 md:p-6 border-t-2 border-[#3a4a5a] flex items-center justify-between gap-2 md:gap-4 shrink-0 bg-[rgba(26,35,50,0.98)] backdrop-blur-sm">
              <Button
                variant="outline"
                onClick={handleClear}
                disabled={tempSelectedIds.length === 0}
                size="sm"
              >
                {t('armory.clear')}
              </Button>
              <div className="flex gap-2 md:gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setTempSelectedIds(selectedIds);
                  }}
                  size="sm"
                >
                  {t('common.cancel')}
                </Button>
                <Button onClick={handleApply} size="sm">
                  {t('armory.apply')} ({tempSelectedIds.length})
                </Button>
              </div>
            </div>
            </Card>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Aplica ordenação customizada na lista de sets
 * @param list - Lista de sets a ser ordenada
 * @param ordering - Opção de ordenação
 * @returns Lista ordenada
 */
const applyCustomOrdering = (
  list: ArmorSet[],
  ordering: OrderingOption
): ArmorSet[] => {
  const sortedList = [...list];

  if (ordering === 'cost' || ordering === '-cost') {
    sortedList.sort((a, b) => (a.total_cost || 0) - (b.total_cost || 0));
    if (ordering === '-cost') sortedList.reverse();
  } else if (ordering === 'armor' || ordering === '-armor') {
    sortedList.sort((a, b) => {
      const aArmor =
        typeof a.armor_stats?.armor === 'number' ? a.armor_stats.armor : 0;
      const bArmor =
        typeof b.armor_stats?.armor === 'number' ? b.armor_stats.armor : 0;
      return aArmor - bArmor;
    });
    if (ordering === '-armor') sortedList.reverse();
  } else if (ordering === 'speed' || ordering === '-speed') {
    sortedList.sort((a, b) => {
      const aSpeed =
        typeof a.armor_stats?.speed === 'number' ? a.armor_stats.speed : 0;
      const bSpeed =
        typeof b.armor_stats?.speed === 'number' ? b.armor_stats.speed : 0;
      return aSpeed - bSpeed;
    });
    if (ordering === '-speed') sortedList.reverse();
  } else if (ordering === 'stamina' || ordering === '-stamina') {
    sortedList.sort((a, b) => {
      const aStamina =
        typeof a.armor_stats?.stamina === 'number' ? a.armor_stats.stamina : 0;
      const bStamina =
        typeof b.armor_stats?.stamina === 'number' ? b.armor_stats.stamina : 0;
      return aStamina - bStamina;
    });
    if (ordering === '-stamina') sortedList.reverse();
  }

  return sortedList;
};

/**
 * Limpa todos os filtros, resetando para valores padrão
 */
type ClearFiltersFunction = () => void;

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente da página de Armory
 */
export default function ArmoryPage() {
  // ============================================================================
  // HOOKS
  // ============================================================================

  const { user } = useAuth();
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

  const [sets, setSets] = useState<ArmorSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState<OrderingOption>(DEFAULT_ORDERING);
  const [passives, setPassives] = useState<PassiveOption[]>([]);
  const [selectedPassiveIds, setSelectedPassiveIds] = useState<number[]>([]);
  const [category, setCategory] = useState<CategoryOption>('');
  const [source, setSource] = useState<SourceOption>('');
  const [passes, setPasses] = useState<BattlePass[]>([]);
  const [passField, setPassField] = useState<number | ''>('');
  const [relations, setRelations] = useState<
    Record<number, SetRelationStatus>
  >({});
  const [updating, setUpdating] = useState<UpdatingState>({});

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
   * Carrega sets e passivas ao montar ou quando filtros mudarem
   */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [setsData, passivesData] = await Promise.all([
          getSets({
            search: search || undefined,
            ordering:
              ordering === 'name' || ordering === '-name'
                ? ordering
                : 'name',
          }),
          getPassives(),
        ]);

        const setsList = Array.isArray(setsData) ? setsData : [];
        setSets(setsList);
        setPassives(
          (passivesData || []).map((p: { id: number; name: string; effect: string; image?: string }) => ({
            id: p.id,
            name: p.name,
            effect: p.effect || '',
            image: p.image,
          }))
        );

        // Carregar relações para cada set se usuário estiver logado
        if (user) {
          const relationsMap: Record<number, SetRelationStatus> = {};
          for (const setItem of setsList) {
            try {
              const relationStatus = await checkSetRelation(setItem.id);
              relationsMap[setItem.id] = relationStatus;
            } catch (error) {
              // Erro ao verificar relação
              relationsMap[setItem.id] = {
                favorite: false,
                collection: false,
                wishlist: false,
              };
            }
          }
          setRelations(relationsMap);
        }
      } catch (e) {
        // Erro ao buscar sets/passivas
        setSets([]);
        setPassives([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [search, ordering, user]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Lista de sets filtrados e ordenados para exibição
   */
  const displayedSets = useMemo(() => {
    let list = [...sets];

    // Aplicar filtros
    if (selectedPassiveIds.length > 0) {
      list = list.filter((s) => s.passive_detail?.id && selectedPassiveIds.includes(s.passive_detail.id));
    }
    if (category) {
      list = list.filter((s) => s.armor_stats?.category === category);
    }
    if (source) {
      list = list.filter((s) => s.source === source);
    }
    
    // Filtro por passe (herdado da armadura)
    if (passField) {
      list = list.filter((s) => {
        // Verificar se o passe do set (herdado da armadura) corresponde ao filtro
        return s.pass_detail?.id === passField;
      });
    }

    // Aplicar ordenação customizada
    return applyCustomOrdering(list, ordering);
  }, [sets, selectedPassiveIds, category, source, passField, ordering]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handler para toggle de relação (favorito, coleção, wishlist)
   * Implementa atualização otimista e lógica de exclusão mútua entre coleção e wishlist
   */
  const handleToggleRelation = async (
    e: React.MouseEvent,
    set: ArmorSet,
    relationType: RelationType
  ): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('ACESSO NEGADO. Você precisa estar alistado para usar esta funcionalidade.');
      return;
    }

    const key = `${set.id}-${relationType}`;

    // Evitar múltiplos cliques simultâneos
    if (updating[key] === true) {
      return;
    }

    const currentStatus =
      relations[set.id] ||
      ({ favorite: false, collection: false, wishlist: false } as SetRelationStatus);
    const isActive = currentStatus[relationType];
    const newStatus = !isActive;

    // Marcar como atualizando
    setUpdating((prev) => ({ ...prev, [key]: true }));

    // Preparar novo status (lógica de exclusão mútua)
    const newRelationsStatus: SetRelationStatus = {
      ...currentStatus,
      [relationType]: newStatus,
    };

    // Se está adicionando à coleção, remover da wishlist
    if (relationType === 'collection' && newStatus === true && currentStatus.wishlist === true) {
      newRelationsStatus.wishlist = false;
    }
    // Se está adicionando à wishlist, remover da coleção
    if (relationType === 'wishlist' && newStatus === true && currentStatus.collection === true) {
      newRelationsStatus.collection = false;
    }

    // Atualização otimista - atualiza o estado ANTES da chamada à API
    setRelations((prev) => ({
      ...prev,
      [set.id]: newRelationsStatus,
    }));

    try {
      // Fazer a operação principal
      if (isActive) {
        await removeSetRelation(set.id, relationType);
      } else {
        await addSetRelation(set.id, relationType);
      }

      // Remover relação mútua se necessário
      if (relationType === 'collection' && newStatus === true && currentStatus.wishlist === true) {
        try {
          await removeSetRelation(set.id, 'wishlist');
        } catch (wishlistError) {
          // Erro ao remover da wishlist
        }
      }

      if (relationType === 'wishlist' && newStatus === true && currentStatus.collection === true) {
        try {
          await removeSetRelation(set.id, 'collection');
        } catch (collectionError) {
          // Erro ao remover da coleção
        }
      }
    } catch (error) {
      // Reverter estado em caso de erro
      setRelations((prev) => ({
        ...prev,
        [set.id]: {
          ...currentStatus,
          [relationType]: isActive, // Reverter para o estado anterior
        },
      }));

      // Erro ao atualizar relação
      const errorMessage =
        (error as { response?: { data?: { detail?: string } }; message?: string })?.response?.data?.detail ||
        (error as { message?: string })?.message ||
        'Erro ao atualizar relação';
      alert(errorMessage);
    } finally {
      // Sempre resetar o estado de updating
      setUpdating((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  /**
   * Handler para mudança do filtro de fonte de aquisição
   * Reseta o filtro de passe quando a fonte não for 'pass'
   */
  const handleSourceChange = (newSource: SourceOption) => {
    setSource(newSource);
    // Se não for 'pass', limpar o filtro de passe
    if (newSource !== 'pass') {
      setPassField('');
    }
  };

  /**
   * Limpa todos os filtros, resetando para valores padrão
   */
  const handleClearFilters: ClearFiltersFunction = () => {
    setSearch('');
    setOrdering(DEFAULT_ORDERING);
    setSelectedPassiveIds([]);
    setCategory('');
    setSource('');
    setPassField('');
  };

  // ============================================================================
  // EARLY RETURNS
  // ============================================================================

  // Não há early returns necessários nesta página

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="container page-content">
        {/* Título da página */}
        <div className="content-section">
          <h1 
            className="font-bold mb-2 uppercase font-['Orbitron'] text-white text-[clamp(2.25rem,5vw,3rem)]"
            suppressHydrationWarning
          >
            <span className="md:hidden">
              {t('armory.title')}
            </span>
            <span className="hidden md:inline">
              {t('armory.titleFull')}
            </span>
          </h1>
          <p className="text-gray-400">
            {t('armory.subtitle')}
          </p>
        </div>

        {/* Filtros */}
        <Card className="content-section" glowColor="cyan">
          {/* Busca */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder={t('armory.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full !pl-[3.5rem] !pr-4 !py-2.5 text-base border-2 border-[#3a4a5a] bg-[rgba(26,35,50,0.5)] text-white outline-none transition-all [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)] hover:border-[#00d9ff] focus:border-[#00d9ff] placeholder:text-gray-500"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Filtros e Ordenação */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ordenação */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 font-['Rajdhani'] text-[#00d9ff]">
                {t('armory.ordering')}
              </label>
              <Select
                value={ordering}
                onChange={(value) => setOrdering(value as OrderingOption)}
                options={[
                  { value: 'name', label: t('sets.orderNameAZ') },
                  { value: '-name', label: t('sets.orderNameZA') },
                  { value: 'cost', label: t('sets.orderTotalLower') },
                  { value: '-cost', label: t('sets.orderTotalHigher') },
                  { value: 'armor', label: t('sets.orderArmorLower') },
                  { value: '-armor', label: t('sets.orderArmorHigher') },
                  { value: 'speed', label: t('sets.orderSpeedLower') },
                  { value: '-speed', label: t('sets.orderSpeedHigher') },
                  { value: 'stamina', label: t('sets.orderStaminaLower') },
                  { value: '-stamina', label: t('sets.orderStaminaHigher') },
                ]}
              />
            </div>

            {/* Filtro por categoria */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 font-['Rajdhani'] text-[#00d9ff]">
                {t('armory.category')}
              </label>
              <Select
                value={category}
                onChange={(value) => setCategory((value as CategoryOption) || '')}
                options={[
                  { value: '', label: t('armory.allCategories') },
                  { value: 'light', label: t('armory.light') },
                  { value: 'medium', label: t('armory.medium') },
                  { value: 'heavy', label: t('armory.heavy') },
                ]}
              />
            </div>

            {/* Filtro por fonte */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 font-['Rajdhani'] text-[#00d9ff]">
                {t('armory.source')}
              </label>
              <Select
                value={source}
                onChange={(value) => handleSourceChange((value as SourceOption) || '')}
                options={[
                  { value: '', label: t('armory.allSources') },
                  { value: 'store', label: t('armory.store') },
                  { value: 'pass', label: t('armory.pass') },
                ]}
              />
            </div>

            {/* Filtro por passiva */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 font-['Rajdhani'] text-[#00d9ff]">
                {t('armory.passive')}
              </label>
              <PassiveSelect
                passives={passives}
                selectedIds={selectedPassiveIds}
                onChange={(ids) => setSelectedPassiveIds(ids)}
              />
            </div>
          </div>

          {/* Filtro de Passe específico */}
          {source === 'pass' && (
            <div className="mt-4">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 font-['Rajdhani'] text-[#00d9ff]">
                {t('armory.specificPass')}
              </label>
              <select
                value={passField}
                onChange={(e) =>
                  setPassField(e.target.value ? Number(e.target.value) : '')
                }
                className="w-full px-4 py-2.5 text-base border-2 border-[#3a4a5a] bg-[rgba(26,35,50,0.5)] text-white outline-none transition-all [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)] hover:border-[#00d9ff] focus:border-[#00d9ff]"
              >
                <option value="">{t('armory.allPasses')}</option>
                {passes.map((pass) => (
                  <option key={pass.id} value={pass.id}>
                    {getTranslatedName(pass, isPortuguese())}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botão Limpar */}
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              {t('armory.clear')}
            </Button>
          </div>
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-t-[#00d9ff] border-r-transparent border-b-transparent border-l-transparent shadow-[0_0_20px_rgba(0,217,255,0.5)]"></div>
            <p className="mt-4 text-gray-400">
              {t('armory.loading')}
            </p>
          </div>
        ) : displayedSets.length === 0 ? (
          <Card className="text-center py-12" glowColor="cyan">
            <p className="text-gray-400">
              {t('armory.noResults')}
            </p>
          </Card>
        ) : (
          <>
            <p className="text-sm mb-6 uppercase tracking-wider content-section font-['Rajdhani'] text-gray-400">
              {t('armory.results', { count: displayedSets.length })}
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSets.map((set) => {
                const relationStatus =
                  relations[set.id] ||
                  ({
                    favorite: false,
                    collection: false,
                    wishlist: false,
                  } as SetRelationStatus);

                return (
                  <Card key={set.id} className="transition-all flex flex-col p-0 overflow-visible" glowColor="cyan">
                      {/* Container com imagem e info principal lado a lado */}
                      <div className="flex flex-col md:flex-row">
                        {/* Imagem do set */}
                        <div className="relative w-full md:w-48 lg:w-56 h-64 md:h-auto md:max-h-[500px] overflow-hidden bg-[#2a3a4a] border-2 border-[#00d9ff] [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)] flex items-center justify-center shrink-0">
                          <img
                            src={set.image || getDefaultImage('set')}
                            alt={getTranslatedName(set, isPortuguese())}
                            className="w-full h-full max-h-[500px] object-contain"
                          />

                          {/* Botões de ação (favorito, coleção, wishlist) */}
                          {user && (
                            <div className="absolute top-2 right-2 flex flex-col gap-2">
                            {/* Botão Favorito */}
                            <button
                              onClick={(e) =>
                                handleToggleRelation(e, set, 'favorite')
                              }
                              disabled={
                                updating[`${set.id}-favorite`] === true
                              }
                              className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                                relationStatus.favorite ? 'scale-110' : ''
                              }`}
                              title={
                                relationStatus.favorite
                                  ? t('sets.removeFavorite')
                                  : t('sets.addFavorite')
                              }
                            >
                              {updating[`${set.id}-favorite`] === true ? (
                                <svg
                                  className="w-5 h-5 text-yellow-500 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className={`w-5 h-5 transition-all duration-200 ${
                                    relationStatus.favorite
                                      ? 'text-yellow-500 fill-current'
                                      : 'text-gray-400'
                                  }`}
                                  fill={
                                    relationStatus.favorite
                                      ? 'currentColor'
                                      : 'none'
                                  }
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
                              )}
                            </button>

                            {/* Botão Coleção */}
                            <button
                              onClick={(e) =>
                                handleToggleRelation(e, set, 'collection')
                              }
                              disabled={
                                updating[`${set.id}-collection`] === true
                              }
                              className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                                relationStatus.collection ? 'scale-110' : ''
                              }`}
                              title={
                                relationStatus.collection
                                  ? t('sets.removeCollection')
                                  : t('sets.addCollection')
                              }
                            >
                              {updating[`${set.id}-collection`] === true ? (
                                <svg
                                  className="w-5 h-5 text-blue-500 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className={`w-5 h-5 transition-all duration-200 ${
                                    relationStatus.collection
                                      ? 'text-blue-500 fill-current'
                                      : 'text-gray-400'
                                  }`}
                                  fill={
                                    relationStatus.collection
                                      ? 'currentColor'
                                      : 'none'
                                  }
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                  />
                                </svg>
                              )}
                            </button>

                            {/* Botão Wishlist */}
                            <button
                              onClick={(e) =>
                                handleToggleRelation(e, set, 'wishlist')
                              }
                              disabled={
                                updating[`${set.id}-wishlist`] === true
                              }
                              className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                                relationStatus.wishlist ? 'scale-110' : ''
                              }`}
                              title={
                                relationStatus.wishlist
                                  ? t('sets.removeWishlist')
                                  : t('sets.addWishlist')
                              }
                            >
                              {updating[`${set.id}-wishlist`] === true ? (
                                <svg
                                  className="w-5 h-5 text-green-500 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className={`w-5 h-5 transition-all duration-200 ${
                                    relationStatus.wishlist
                                      ? 'text-green-500 fill-current'
                                      : 'text-gray-400'
                                  }`}
                                  fill={
                                    relationStatus.wishlist
                                      ? 'currentColor'
                                      : 'none'
                                  }
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        )}
                        </div>

                        {/* Informações principais - ao lado da imagem */}
                        <div className="p-4 flex-1 flex flex-col justify-center min-w-0">
                          {/* Nome */}
                          <div className="mb-6">
                            <h3 className="text-base font-bold uppercase tracking-wide font-['Rajdhani'] text-white leading-tight mb-3">
                              {getTranslatedName(set, isPortuguese())}
                            </h3>
                            {set.armor_stats?.category_display && (
                              <p className="text-xs text-gray-400 font-['Rajdhani']">
                                {t('armory.categoryLabel')} <span className="text-[#00d9ff] font-semibold">{translateCategory(set.armor_stats.category_display)}</span>
                              </p>
                            )}
                          </div>

                          {/* Stats - um abaixo do outro */}
                          {set.armor_stats && (
                            <div className="flex flex-col gap-3">
                              {/* Armadura - Azul */}
                              <div className="flex items-center justify-between p-2 rounded-lg bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.3)]">
                                <p className="text-xs uppercase font-bold text-[#3b82f6] font-['Rajdhani']">
                                  {t('armory.armor')}
                                </p>
                                <p className="text-sm font-bold text-white font-['Rajdhani']">
                                  {set.armor_stats.armor_display || set.armor_stats.armor || 'N/A'}
                                </p>
                              </div>
                              {/* Velocidade - Laranja/Amarelo */}
                              <div className="flex items-center justify-between p-2 rounded-lg bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)]">
                                <p className="text-xs uppercase font-bold text-[#f59e0b] font-['Rajdhani']">
                                  {t('armory.speed')}
                                </p>
                                <p className="text-sm font-bold text-white font-['Rajdhani']">
                                  {set.armor_stats.speed_display || set.armor_stats.speed || 'N/A'}
                                </p>
                              </div>
                              {/* Estamina - Verde */}
                              <div className="flex items-center justify-between p-2 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)]">
                                <p className="text-xs uppercase font-bold text-[#10b981] font-['Rajdhani']">
                                  {t('armory.stamina')}
                                </p>
                                <p className="text-sm font-bold text-white font-['Rajdhani']">
                                  {set.armor_stats.stamina_display || set.armor_stats.stamina || 'N/A'}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Passiva, Custo Total e Botão - abaixo */}
                      <div className="mt-6">
                        {/* Container da passiva, custo e botão - largura total */}
                        <div className="w-full">
                        {/* Passiva */}
                        {set.passive_detail && (
                          <div className="mb-4">
                            <div className="p-3 rounded-lg bg-[rgba(255,215,0,0.1)] border border-[rgba(255,215,0,0.3)]">
                              <p className="text-sm uppercase mb-2 font-bold text-[#d4af37] font-['Rajdhani']">
                                {t('armory.passiveLabel')}
                              </p>
                              <p className="text-base font-semibold mb-2 text-white font-['Rajdhani']">
                                {getTranslatedName(set.passive_detail, isPortuguese())}
                              </p>
                              <p className="text-sm text-gray-400">
                                {getTranslatedEffect(set.passive_detail, isPortuguese())}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Custo Total e Botão */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold uppercase tracking-wide text-gray-500 font-['Rajdhani']">
                              {t('armory.totalCost')}
                            </span>
                            <span className="text-xl font-bold text-[#d4af37] font-['Rajdhani']">
                              {(set.total_cost || 0).toLocaleString('pt-BR')}{' '}
                              <span className="text-sm text-gray-500">
                                {set.source === 'pass' ? 'MED' : 'SC'}
                              </span>
                            </span>
                          </div>
                          <Link href={`/armory/sets/${set.id}`}>
                            <Button fullWidth className="mt-1">
                              {t('armory.viewDetails')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                      </div>
                    </Card>
                );
              })}
            </div>
          </>
        )}
    </div>
  );
}
