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
import { saveFiltersToStorage, getFiltersFromStorage, clearFiltersFromStorage } from '@/utils/filters-storage';

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
} from '@/lib/types/armory-page';

// 6. Serviços e Libs
import {
  getSets,
  getPassives,
  getPasses,
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
export default function SetsPage() {
  // ============================================================================
  // HOOKS
  // ============================================================================

  const { user, loading: authLoading } = useAuth();
  const { isPortuguese } = useLanguage();
  const { t } = useTranslation();


  // ============================================================================
  // STATE
  // ============================================================================

  // Estado para filtros (com valores padrão)
  const defaultFilters = {
    search: '',
    ordering: DEFAULT_ORDERING,
    selectedPassiveIds: [] as number[],
    category: '' as CategoryOption,
    source: '' as SourceOption,
    passField: '' as number | '',
  };

  // Recupera filtros do sessionStorage ao montar
  const [search, setSearch] = useState(() => {
    const saved = getFiltersFromStorage('armorySets', defaultFilters);
    return saved.search;
  });
  const [ordering, setOrdering] = useState<OrderingOption>(() => {
    const saved = getFiltersFromStorage('armorySets', defaultFilters);
    return saved.ordering;
  });
  const [selectedPassiveIds, setSelectedPassiveIds] = useState<number[]>(() => {
    const saved = getFiltersFromStorage('armorySets', defaultFilters);
    return saved.selectedPassiveIds;
  });
  const [category, setCategory] = useState<CategoryOption>(() => {
    const saved = getFiltersFromStorage('armorySets', defaultFilters);
    return saved.category;
  });
  const [source, setSource] = useState<SourceOption>(() => {
    const saved = getFiltersFromStorage('armorySets', defaultFilters);
    return saved.source;
  });
  const [passField, setPassField] = useState<number | ''>(() => {
    const saved = getFiltersFromStorage('armorySets', defaultFilters);
    return saved.passField;
  });

  const [sets, setSets] = useState<ArmorSet[]>([]);
  const [displayedSets, setDisplayedSets] = useState<ArmorSet[]>([]); // Sets que já podem ser exibidos
  // Estados de Interface
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false); // Indica se ainda está carregando mais sets
  const [animatedCount, setAnimatedCount] = useState(0); // Contador animado para exibição
  const [passives, setPassives] = useState<PassiveOption[]>([]);
  const [passes, setPasses] = useState<BattlePass[]>([]);
  const [retryTrigger, setRetryTrigger] = useState(0); // Gatilho para retry manual
  const [error, setError] = useState(false); // Estado de erro geral

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
   * Salva filtros no sessionStorage sempre que mudarem
   */
  useEffect(() => {
    saveFiltersToStorage('armorySets', {
      search,
      ordering,
      selectedPassiveIds,
      category,
      source,
      passField,
    });
  }, [search, ordering, selectedPassiveIds, category, source, passField]);

  /**
   * Carrega passivas ao montar (dados estáticos)
   */
  useEffect(() => {
    const fetchPassives = async () => {
      try {
        const passivesData = await getPassives();
        const passivesList = (passivesData || []).map((p: Passive) => ({
          id: p.id,
          name: p.name,
          name_pt_br: p.name_pt_br,
          effect: p.effect || '',
          effect_pt_br: p.effect_pt_br,
          image: p.image,
        }));
        setPassives(passivesList);
      } catch (error) {
        setPassives([]);
      }
    };

    fetchPassives();
  }, []);

  /**
   * Carrega sets progressivamente (um por vez) quando filtros mudarem
   */
  useEffect(() => {
    // Aguarda autenticação terminar antes de começar a carregar
    if (authLoading) {
      return;
    }

    let cancelled = false;

    const fetchSetsProgressively = async () => {
      // Limpa sets anteriores e reseta estado
      setSets([]);
      setDisplayedSets([]);
      setLoading(true);
      setLoadingMore(false);
      setError(false);

      try {
        // Busca sets página por página e mostra conforme vão chegando
        const { cachedGet } = await import('@/lib/api-cached');
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        const orderingParam = ordering === 'name' || ordering === '-name' ? ordering : 'name';
        params.append('ordering', orderingParam);

        let currentUrl: string | null = `/api/v1/armory/sets/?${params.toString()}`;
        let allSets: ArmorSet[] = [];
        let displayed: ArmorSet[] = [];

        // Função para processar e mostrar um set
        const processAndDisplaySet = async (set: ArmorSet) => {
          if (cancelled) return;

          // Adiciona à lista completa e exibe IMEDIATAMENTE
          allSets = [...allSets, set];
          displayed = [...displayed, set];

          // Atualiza estado imediatamente
          setSets([...allSets]);
          setDisplayedSets([...displayed]);

          // Força re-render usando requestAnimationFrame para garantir que apareça imediatamente
          await new Promise(resolve => requestAnimationFrame(resolve));
        };

        // Função para buscar próxima página em paralelo
        const fetchNextPage = async (url: string): Promise<{ sets: ArmorSet[]; nextUrl: string | null }> => {
          const response = await cachedGet<ArmorSet[] | { results: ArmorSet[]; next?: string }>(
            url,
            { checkForUpdates: true } as any
          );
          const data = response.data;

          if (Array.isArray(data)) {
            return { sets: data, nextUrl: null };
          } else if (data && typeof data === 'object' && 'results' in data) {
            return { sets: data.results || [], nextUrl: data.next || null };
          }

          return { sets: [], nextUrl: null };
        };

        // Carrega e mostra em lotes de 9 sets: carrega primeira página, mostra em lotes de 9
        const BATCH_SIZE = 9; // Tamanho do lote

        // Carrega primeira página IMEDIATAMENTE
        let currentPageUrl: string | null = currentUrl;
        let currentPageSets: ArmorSet[] = [];
        let currentPageIndex = 0;
        let nextPagePromise: Promise<{ sets: ArmorSet[]; nextUrl: string | null }> | null = null;

        // Busca primeira página - assim que chegar, mostra IMEDIATAMENTE
        const firstPageData = await fetchNextPage(currentPageUrl);
        currentPageSets = firstPageData.sets;
        currentPageUrl = firstPageData.nextUrl;

        if (cancelled) {
          setLoading(false);
          return;
        }

        // Se há próxima página, já começa a carregar em paralelo
        if (currentPageUrl) {
          nextPagePromise = fetchNextPage(currentPageUrl);
          setLoadingMore(true); // Indica que há mais para carregar
        }

        // Processa primeira página em lotes de 9 - MOSTRA IMEDIATAMENTE
        let firstSetShown = false;
        while (currentPageIndex < currentPageSets.length && !cancelled) {
          // Pega o próximo lote de 9 sets
          const batch = currentPageSets.slice(currentPageIndex, currentPageIndex + BATCH_SIZE);

          if (batch.length === 0) {
            break;
          }

          // Mostra todos os sets deste lote um por um
          for (const set of batch) {
            if (cancelled) break;

            // Mostra o set IMEDIATAMENTE
            await processAndDisplaySet(set);

            // Desliga loading assim que mostrar o PRIMEIRO set
            if (!firstSetShown) {
              firstSetShown = true;
              setLoading(false);
            }
          }

          // Atualiza índice para próximo lote
          currentPageIndex += batch.length;
        }

        // Processa páginas seguintes
        while (currentPageUrl && !cancelled) {
          // Se já estava carregando, usa o resultado, senão carrega agora
          const pageData = nextPagePromise ? await nextPagePromise : await fetchNextPage(currentPageUrl);
          currentPageSets = pageData.sets;
          currentPageUrl = pageData.nextUrl;
          currentPageIndex = 0;
          nextPagePromise = null;

          if (cancelled || currentPageSets.length === 0) {
            break;
          }

          // Se há próxima página, já começa a carregar em paralelo
          if (currentPageUrl) {
            nextPagePromise = fetchNextPage(currentPageUrl);
            setLoadingMore(true); // Indica que há mais para carregar
          } else {
            setLoadingMore(false); // Não há mais páginas, para de mostrar loading
          }

          // Processa esta página em lotes de 9
          while (currentPageIndex < currentPageSets.length && !cancelled) {
            const batch = currentPageSets.slice(currentPageIndex, currentPageIndex + BATCH_SIZE);

            if (batch.length === 0) {
              break;
            }

            // Mostra todos os sets deste lote um por um
            for (const set of batch) {
              if (cancelled) break;
              await processAndDisplaySet(set);
            }

            currentPageIndex += batch.length;
          }
        }

        setLoading(false);
        setLoadingMore(false); // Terminou de carregar tudo
      } catch (e) {
        if (!cancelled) {
          console.error("Erro ao carregar sets:", e);
          setSets([]);
          setDisplayedSets([]);
          setLoading(false);
          setLoadingMore(false);
          setError(true);
        }
      }
    };

    fetchSetsProgressively();

    return () => {
      cancelled = true;
    };
  }, [search, ordering, authLoading, retryTrigger]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Lista de sets filtrados e ordenados para exibição
   * Usa displayedSets (que já foram carregados progressivamente) em vez de sets
   */
  const filteredDisplayedSets = useMemo(() => {
    let list = [...displayedSets];

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
  }, [displayedSets, selectedPassiveIds, category, source, passField, ordering]);

  // Anima o contador quando o número de sets muda
  useEffect(() => {
    const targetCount = filteredDisplayedSets.length;
    if (targetCount === animatedCount) return; // Já está no valor correto

    const duration = 600; // 600ms para a animação
    const steps = Math.abs(targetCount - animatedCount);
    const stepDuration = Math.max(20, duration / Math.max(steps, 1)); // Mínimo 20ms por step
    const increment = targetCount > animatedCount ? 1 : -1;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const newCount = animatedCount + (increment * currentStep);

      if ((increment > 0 && newCount >= targetCount) || (increment < 0 && newCount <= targetCount)) {
        setAnimatedCount(targetCount);
        clearInterval(interval);
      } else {
        setAnimatedCount(newCount);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [filteredDisplayedSets.length, animatedCount]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

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
    clearFiltersFromStorage('armorySets');
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
            {t('sets.title')}
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
          <div
            className="spinner inline-block rounded-full h-12 w-12 border-[3px] border-t-[#00d9ff] border-r-transparent border-b-transparent border-l-transparent shadow-[0_0_20px_rgba(0,217,255,0.5)]"
          ></div>
          <p className="mt-4 text-gray-400 font-['Rajdhani'] font-bold text-[#00d9ff] uppercase tracking-wider">
            {t('armory.loading')}
          </p>
        </div>
      ) : error && filteredDisplayedSets.length === 0 ? (
        <Card className="text-center py-12 border-red-500/50 bg-red-900/10" glowColor="cyan">
          <div className="flex flex-col items-center justify-center p-6">
            <svg className="w-16 h-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-xl font-bold text-red-400 mb-2 uppercase font-['Orbitron']">
              {t('error.connectionFailed') || 'FALHA NA COMUNICAÇÃO'}
            </h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              {t('error.backendSleeping') || 'Não foi possível conectar ao servidor. O backend pode estar "dormindo" (cold start).'}
            </p>
            <Button
              onClick={() => setRetryTrigger(prev => prev + 1)}
              className="bg-red-600 hover:bg-red-700 text-white min-w-[200px]"
            >
              {t('common.retry') || 'RECONECTAR'}
            </Button>
          </div>
        </Card>
      ) : filteredDisplayedSets.length === 0 ? (
        <Card className="text-center py-12" glowColor="cyan">
          <p className="text-gray-400">
            {t('armory.noResults')}
          </p>
        </Card>
      ) : (
        <>
          <p className="text-sm mb-6 uppercase tracking-wider content-section font-['Rajdhani'] text-gray-400">
            {t('armory.results', { count: animatedCount })}
            {loadingMore && (
              <span className="inline-flex items-center ml-2" style={{ height: '1.5em', gap: '2px' }}>
                <span className="bounce-dot">.</span>
                <span className="bounce-dot">.</span>
                <span className="bounce-dot">.</span>
              </span>
            )}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDisplayedSets.map((set) => {


              return (
                <SetCard
                  key={set.id}
                  set={set}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
