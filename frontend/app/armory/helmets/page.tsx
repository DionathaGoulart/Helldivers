/**
 * Página de Capacetes
 * 
 * Exibe todos os capacetes disponíveis com filtros, busca e ordenação.
 * Design padronizado com a página de Sets.
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

// 1. React e Next.js
import { useState, useEffect, useMemo, useRef } from 'react';

// 2. Contextos e Hooks customizados
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';

// 3. Componentes
import ComponentCard from '@/components/armory/ComponentCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getTranslatedName } from '@/lib/i18n';

// 4. Utilitários e Constantes
import { saveFiltersToStorage, getFiltersFromStorage, clearFiltersFromStorage } from '@/utils/filters-storage';
import { applyCustomOrdering } from '@/utils';

// 5. Tipos
import type {
  Helmet,
  BattlePass,
  RelationType,
  SetRelationStatus,
  ItemFilters
} from '@/lib/types/armory';
import type {
  OrderingOption,
  SourceOption,
} from '@/lib/types/armory-page';

// 6. Serviços e Libs
import {
  getHelmets,
  getPasses,
} from '@/lib/armory-cached';

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_ORDERING: OrderingOption = 'name';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function HelmetsPage() {
  // ============================================================================
  // HOOKS
  // ============================================================================

  const { user, loading: authLoading } = useAuth();
  const { isPortuguese } = useLanguage();
  const { t } = useTranslation();

  // ============================================================================
  // STATE
  // ============================================================================

  // Filtros
  const defaultFilters = {
    search: '',
    ordering: DEFAULT_ORDERING,
    source: '' as SourceOption,
    passField: '' as number | '',
    maxCost: '' as number | '',
  };

  const [search, setSearch] = useState(() => getFiltersFromStorage('helmets', defaultFilters).search);
  const [ordering, setOrdering] = useState<OrderingOption>(() => getFiltersFromStorage('helmets', defaultFilters).ordering);
  const [source, setSource] = useState<SourceOption>(() => getFiltersFromStorage('helmets', defaultFilters).source);
  const [passField, setPassField] = useState<number | ''>(() => getFiltersFromStorage('helmets', defaultFilters).passField);

  // Dados
  const [helmets, setHelmets] = useState<Helmet[]>([]);
  const [displayedHelmets, setDisplayedHelmets] = useState<Helmet[]>([]); // Para carregamento progressivo
  const [passes, setPasses] = useState<BattlePass[]>([]);

  // Estados de Interface
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [error, setError] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const [warbondsMap, setWarbondsMap] = useState<Record<number, string>>({});

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Pre-fetch Warbonds (Optimization)
  useEffect(() => {
    const loadWarbonds = async () => {
      try {
        const passesData = await getPasses();
        const map: Record<number, string> = {};
        if (Array.isArray(passesData)) {
          passesData.forEach(p => {
            map[p.id] = isPortuguese() && p.name_pt_br ? p.name_pt_br : p.name;
          });
        }
        setWarbondsMap(map);
        setPasses(Array.isArray(passesData) ? passesData : []);
      } catch (error) {
        console.error("Failed to load warbonds", error);
        setPasses([]);
      }
    };
    loadWarbonds();
  }, [isPortuguese]);

  // Salva filtros
  useEffect(() => {
    saveFiltersToStorage('helmets', {
      search,
      ordering,
      source,
      passField,
    });
  }, [search, ordering, source, passField]);

  // Carrega capacetes (Progressive Loading similar ao SetsPage)
  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const fetchHelmetsProgressively = async () => {
      setHelmets([]);
      setDisplayedHelmets([]);
      setLoading(true);
      setLoadingMore(false);
      setError(false);

      try {
        const filters: ItemFilters = {
          search: search || undefined,
          ordering: ordering === 'name' || ordering === '-name' ? ordering : 'name', // API ordering
          source: source || undefined,
          pass_field: passField ? Number(passField) : undefined,
        };

        // 1. Busca dados da API
        const data = await getHelmets(filters);
        const allHelmets = Array.isArray(data) ? data : [];

        if (cancelled) return;

        // Simula carregamento progressivo para UI consistente com Sets
        const BATCH_SIZE = 9;
        let displayed: Helmet[] = [];

        // Mostra primeiro lote imediatamente
        const firstBatch = allHelmets.slice(0, BATCH_SIZE);
        displayed = [...firstBatch];
        setHelmets(allHelmets); // Guarda tudo para filtrar localmente se necessário
        setDisplayedHelmets(displayed);
        setLoading(false);

        // Carrega o restante progressivamente
        if (allHelmets.length > BATCH_SIZE) {
          setLoadingMore(true);
          let currentIndex = BATCH_SIZE;

          while (currentIndex < allHelmets.length && !cancelled) {
            // Delay pequeno para não travar a UI
            await new Promise(resolve => setTimeout(resolve, 50));

            const nextBatch = allHelmets.slice(currentIndex, currentIndex + BATCH_SIZE);
            displayed = [...displayed, ...nextBatch];
            setDisplayedHelmets(displayed);

            currentIndex += BATCH_SIZE;
          }
          setLoadingMore(false);
        }

      } catch (e) {
        if (!cancelled) {
          console.error("Erro ao carregar capacetes:", e);
          setHelmets([]);
          setDisplayedHelmets([]);
          setLoading(false);
          setLoadingMore(false);
          setError(true);
        }
      }
    };

    fetchHelmetsProgressively();

    return () => { cancelled = true; };
  }, [search, ordering, source, passField, authLoading, retryTrigger]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredDisplayedHelmets = useMemo(() => {
    // A API já faz a maioria dos filtros, mas a ordenação customizada (cost, etc) é feita no front se a API não suportar
    // Como a API getHelmets suporta ordering, usamos o resultado direto, 
    // mas aplicamos o sort do front para garantir consistencia visual com 'applyCustomOrdering' se necessário.
    // Neste caso, 'helmets' já vem da API. Vamos apenas garantir a consistência com displayedHelmets.

    // Se a ordenação for complexa (não suportada pela API de capacetes totalmente igual a sets), aplicar aqui.
    // Por enquanto assumimos que a ordem de exibição é a ordem de displayedHelmets.

    // Porém, se quisermos reordenar dinamicamente O QUE JÁ ESTÁ NA TELA sem refetch, faríamos aqui.
    // O useEffect faz refetch na mudança de ordering, então displayedHelmets já deve vir na ordem certa (se a API suportar).
    // O parametro 'ordering' foi passado para a API.

    return displayedHelmets;
  }, [displayedHelmets]);

  // Animação do contador
  useEffect(() => {
    const targetCount = helmets.length; // Usa o total real, não só o exibido
    if (targetCount === animatedCount) return;

    const duration = 600;
    const steps = Math.abs(targetCount - animatedCount);
    const stepDuration = Math.max(20, duration / Math.max(steps, 1));
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
  }, [helmets.length, animatedCount]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSourceChange = (newSource: SourceOption) => {
    setSource(newSource);
    if (newSource !== 'pass') setPassField('');
  };

  const handleClearFilters = () => {
    setSearch('');
    setOrdering(DEFAULT_ORDERING);
    setSource('');
    setPassField('');
    clearFiltersFromStorage('helmets');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="container page-content">
      {/* Título */}
      {/* Título */}
      <div className="content-section flex flex-col items-center text-center">
        <h1 className="font-bold mb-2 uppercase font-['Orbitron'] text-white text-[clamp(2.25rem,5vw,3rem)]">
          {t('helmets.title')}
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          {t('helmets.subtitle')}
        </p>
      </div>

      {/* Filtros */}
      <Card className="content-section" glowColor="cyan">
        {/* Busca */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('helmets.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full !pl-[3.5rem] !pr-4 !py-2.5 text-base border-2 border-[#3a4a5a] bg-[rgba(26,35,50,0.5)] text-white outline-none transition-all [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)] hover:border-[#00d9ff] focus:border-[#00d9ff] placeholder:text-gray-500"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Grid de Filtros */}
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
              ]}
            />
          </div>

          {/* Fonte */}
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

        </div>

        {/* Filtro de Passe Específico */}
        {source === 'pass' && (
          <div className="mt-4">
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 font-['Rajdhani'] text-[#00d9ff]">
              {t('armory.specificPass')}
            </label>
            <select
              value={passField}
              onChange={(e) => setPassField(e.target.value ? Number(e.target.value) : '')}
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
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-400 font-['Rajdhani'] font-bold text-[#00d9ff] uppercase tracking-wider">
            {t('armory.loading')}
          </p>
        </div>
      ) : error ? (
        <Card className="text-center py-12 border-red-500/50 bg-red-900/10" glowColor="cyan">
          <h3 className="text-xl font-bold text-red-400 mb-2 uppercase font-['Orbitron']">
            {t('error.connectionFailed') || 'FALHA NA COMUNICAÇÃO'}
          </h3>
          <Button onClick={() => setRetryTrigger(prev => prev + 1)} className="bg-red-600">
            {t('common.retry') || 'RECONECTAR'}
          </Button>
        </Card>
      ) : filteredDisplayedHelmets.length === 0 ? (
        <Card className="text-center py-12" glowColor="cyan">
          <p className="text-gray-400">{t('helmets.noResults')}</p>
        </Card>
      ) : (
        <>
          {loadingMore && (
            <></>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDisplayedHelmets.map((helmet) => {
              return (
                <ComponentCard
                  key={helmet.id}
                  item={helmet}
                  type="helmet"
                  warbondsMap={warbondsMap}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
