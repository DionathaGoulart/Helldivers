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

// 1. React e Next.js
import { useEffect, useMemo, useState, useRef } from 'react';

// 2. Contextos e Hooks customizados
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';

// 3. Componentes
import { PassiveSelect, SetCard } from '@/components/armory';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';

// 4. Utilitários e Constantes
import { applyCustomOrdering, translateCategory } from '@/utils';
import { getTranslatedName } from '@/lib/i18n';

// 5. Tipos
import type {
  ArmorSet,
  BattlePass,
  Passive,
  RelationType,
  SetRelationStatus,
} from '@/lib/types/armory';
import type {
  OrderingOption,
  CategoryOption,
  SourceOption,
  PassiveOption,
  UpdatingState,
} from '@/lib/types/armory-page';

// 6. Serviços e Libs
import {
  getSets,
  getPassives,
  getPasses,
  addSetRelation,
  removeSetRelation,
  checkSetRelation,
} from '@/lib/armory-cached';

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_ORDERING: OrderingOption = 'name';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

  const { user, loading: authLoading } = useAuth();
  const { isPortuguese } = useLanguage();
  const { t } = useTranslation();


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
  const relationsLoadedRef = useRef<string>(''); // Rastreia quais sets já foram carregados

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
   * (sem depender de user para evitar recarregamento desnecessário)
   * 
   * Se o usuário estiver logado, também carrega relações do cache em paralelo
   */
  useEffect(() => {
    const fetchAll = async () => {
      // Só mostra loading se realmente não tiver dados carregados
      // Isso evita o "piscar" ao dar F5 quando os dados já estão no cache
      const shouldShowLoading = sets.length === 0 && passives.length === 0;
      
      if (shouldShowLoading) {
        setLoading(true);
      }
      
      try {
        // IMPORTANTE: Carrega sets e passives primeiro (podem estar no cache)
        // Depois carrega relações se houver usuário
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
        const passivesList = (passivesData || []).map((p: Passive) => ({
          id: p.id,
          name: p.name,
          name_pt_br: p.name_pt_br,
          effect: p.effect || '',
          effect_pt_br: p.effect_pt_br,
          image: p.image,
        }));
        
        // Carrega relações em PARALELO usando as listas completas (muito mais eficiente)
        // IMPORTANTE: Carrega relações ANTES de setar os sets para evitar delay visível
        const currentSetsIds = setsList.length > 0 ? setsList.map(s => s.id).sort().join(',') : '';
        let relationsMap: Record<number, SetRelationStatus> = {};
        
        // IMPORTANTE: Carrega relações se:
        // 1. Há usuário logado
        // 2. Há sets para carregar relações
        // 3. As relações ainda não foram carregadas para estes sets
        // 4. OU se há sets mas não há relações no estado (após F5 quando relações não foram carregadas)
        const hasNoRelations = Object.keys(relations).length === 0;
        const differentSets = relationsLoadedRef.current !== currentSetsIds;
        const shouldLoadRelations = user && setsList.length > 0 && (differentSets || (hasNoRelations && !authLoading));
        
        if (shouldLoadRelations) {
          try {
            // Usa as listas completas de favoritos/coleção/wishlist do cache
            // Isso é MUITO mais eficiente: apenas 3 requisições em vez de N (uma por set)
            const { getFavoriteSets, getCollectionSets, getWishlistSets } = await import('@/lib/armory-cached');
            
            // Busca todas as relações de uma vez (usando cache)
            // Se estiver no cache, retorna imediatamente sem requisição
            const [favoriteSets, collectionSets, wishlistSets] = await Promise.all([
              getFavoriteSets(),
              getCollectionSets(),
              getWishlistSets(),
            ]);
            
            // Cria mapas de IDs para acesso rápido
            const favoriteIds = new Set(favoriteSets.map(s => s.id));
            const collectionIds = new Set(collectionSets.map(s => s.id));
            const wishlistIds = new Set(wishlistSets.map(s => s.id));
            
            // Constrói o mapa de relações para cada set
            setsList.forEach((setItem) => {
              relationsMap[setItem.id] = {
                favorite: favoriteIds.has(setItem.id),
                collection: collectionIds.has(setItem.id),
                wishlist: wishlistIds.has(setItem.id),
              };
            });
            
            // Marca como carregado
            relationsLoadedRef.current = currentSetsIds;
          } catch (error) {
            // Se der erro (401, etc), será tentado novamente quando authLoading terminar
            // Não marca como carregado para tentar novamente
          }
        }
        
        // Atualiza sets, passives E relações ao mesmo tempo para evitar delay visível
        setSets(setsList);
        setPassives(passivesList);
        if (Object.keys(relationsMap).length > 0) {
          setRelations(relationsMap);
        }
      } catch (e) {
        // Erro ao buscar sets/passivas
        setSets([]);
        setPassives([]);
      } finally {
        if (shouldShowLoading) {
          setLoading(false);
        }
      }
    };

    fetchAll();
    // IMPORTANTE: user?.id é usado em vez de user para evitar re-render quando
    // o objeto user muda mas o ID permanece o mesmo
    // authLoading é necessário para carregar relações quando o usuário for identificado
  }, [search, ordering, user?.id, authLoading]);

  /**
   * Limpa relações quando o usuário faz logout
   * IMPORTANTE: Removido o segundo useEffect que carregava relações
   * porque o primeiro useEffect já carrega as relações junto com os sets
   * Isso evita requisições duplicadas
   */
  useEffect(() => {
    // Limpar relações se não há usuário (após authLoading terminar)
    if (!user && !authLoading) {
      setRelations({});
      relationsLoadedRef.current = '';
    }
  }, [user, authLoading]);

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
                  <SetCard
                    key={set.id}
                    set={set}
                    relationStatus={relationStatus}
                    updating={updating}
                    user={user}
                    onToggleRelation={handleToggleRelation}
                  />
                );
              })}
            </div>
          </>
        )}
    </div>
  );
}
