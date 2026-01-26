/**
 * Página de Armaduras
 * 
 * Exibe todas as armaduras disponíveis com filtros, busca e ordenação.
 * Design padronizado com a página de Sets.
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';

import ComponentCard from '@/components/armory/ComponentCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { PassiveSelect } from '@/components/armory';
import { getTranslatedName } from '@/lib/i18n';

import { saveFiltersToStorage, getFiltersFromStorage, clearFiltersFromStorage } from '@/utils/filters-storage';

import type {
  Armor,
  BattlePass,
  RelationType,
  SetRelationStatus,
  ArmorFilters,
  Passive
} from '@/lib/types/armory';
import type {
  OrderingOption,
  SourceOption,
  CategoryOption,
  PassiveOption
} from '@/lib/types/armory-page';

import {
  getArmors,
  getPasses,
  getPassives,
} from '@/lib/armory-cached';

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_ORDERING: OrderingOption = 'name';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function ArmorsPage() {
  const { user, loading: authLoading } = useAuth();
  const { isPortuguese } = useLanguage();
  const { t } = useTranslation();

  // ============================================================================
  // STATE
  // ============================================================================

  const defaultFilters = {
    search: '',
    ordering: DEFAULT_ORDERING,
    category: '' as CategoryOption,
    source: '' as SourceOption,
    passField: '' as number | '',
    selectedPassiveIds: [] as number[],
    maxCost: '' as number | '',
  };

  const [search, setSearch] = useState(() => getFiltersFromStorage('armors', defaultFilters).search);
  const [ordering, setOrdering] = useState<OrderingOption>(() => getFiltersFromStorage('armors', defaultFilters).ordering);
  const [category, setCategory] = useState<CategoryOption>(() => getFiltersFromStorage('armors', defaultFilters).category);
  const [source, setSource] = useState<SourceOption>(() => getFiltersFromStorage('armors', defaultFilters).source);
  const [passField, setPassField] = useState<number | ''>(() => getFiltersFromStorage('armors', defaultFilters).passField);
  const [selectedPassiveIds, setSelectedPassiveIds] = useState<number[]>(() => getFiltersFromStorage('armors', defaultFilters).selectedPassiveIds);
  const [maxCost, setMaxCost] = useState<number | ''>(() => getFiltersFromStorage('armors', defaultFilters).maxCost);

  const [armors, setArmors] = useState<Armor[]>([]);
  const [displayedArmors, setDisplayedArmors] = useState<Armor[]>([]);
  const [passes, setPasses] = useState<BattlePass[]>([]);
  const [passives, setPassives] = useState<PassiveOption[]>([]);

  // Estados de Interface
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [error, setError] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Carrega passes e passivas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [passesData, passivesData] = await Promise.all([
          getPasses(),
          getPassives()
        ]);
        setPasses(Array.isArray(passesData) ? passesData : []);

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
        // silent fail
      }
    };
    fetchData();
  }, []);

  // Salva filtros
  useEffect(() => {
    saveFiltersToStorage('armors', {
      search,
      ordering,
      category,
      source,
      passField,
      selectedPassiveIds,
      maxCost
    });
  }, [search, ordering, category, source, passField, selectedPassiveIds, maxCost]);

  // Carrega armaduras
  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const fetchArmorsProgressively = async () => {
      setArmors([]);
      setDisplayedArmors([]);
      setLoading(true);
      setLoadingMore(false);
      setError(false);

      try {
        const filters: ArmorFilters = {
          search: search || undefined,
          cost__lte: maxCost ? Number(maxCost) : undefined,
          ordering: ordering === 'name' || ordering === '-name' ? ordering : 'name',
          source: source || undefined,
          pass_field: passField ? Number(passField) : undefined,
          category: category || undefined,
          // Passive filtering logic might need manual handling if API doesn't support array
        };

        // Se a API suportasse passive__in seria ideal, mas assumindo comportamento similar ao Sets:
        // O filtro de passiva no SetsPage é feito no front (linha 468 do original SetsPage).
        // Vamos manter assim.

        const data = await getArmors(filters);
        let allArmors = Array.isArray(data) ? data : [];

        // Filtragem frontend de passivas (se a API não tiver suporte direto a lista de IDs)
        if (selectedPassiveIds.length > 0) {
          allArmors = allArmors.filter(a => a.passive_detail && selectedPassiveIds.includes(a.passive_detail.id));
        }

        if (cancelled) return;

        // Progressive Loading
        const BATCH_SIZE = 9;
        let displayed: Armor[] = [];

        const firstBatch = allArmors.slice(0, BATCH_SIZE);
        displayed = [...firstBatch];
        setArmors(allArmors);
        setDisplayedArmors(displayed);
        setLoading(false);

        if (allArmors.length > BATCH_SIZE) {
          setLoadingMore(true);
          let currentIndex = BATCH_SIZE;
          while (currentIndex < allArmors.length && !cancelled) {
            await new Promise(resolve => setTimeout(resolve, 50));
            const nextBatch = allArmors.slice(currentIndex, currentIndex + BATCH_SIZE);
            displayed = [...displayed, ...nextBatch];
            setDisplayedArmors(displayed);

            currentIndex += BATCH_SIZE;
          }
          setLoadingMore(false);
        }

      } catch (e) {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };

    fetchArmorsProgressively();

    return () => { cancelled = true; };
  }, [search, ordering, category, source, passField, selectedPassiveIds, maxCost, authLoading, retryTrigger]);

  // Animação contador
  useEffect(() => {
    const targetCount = armors.length;
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
  }, [armors.length, animatedCount]);

  // Handlers

  const handleClearFilters = () => {
    setSearch('');
    setOrdering(DEFAULT_ORDERING);
    setCategory('');
    setSource('');
    setPassField('');
    setSelectedPassiveIds([]);
    setMaxCost('');
    clearFiltersFromStorage('armors');
  };

  const handleSourceChange = (newSource: SourceOption) => {
    setSource(newSource);
    if (newSource !== 'pass') setPassField('');
  };


  return (
    <div className="container page-content">
      <div className="content-section flex flex-col items-center text-center">
        <h1 className="font-bold mb-2 uppercase font-['Orbitron'] text-white text-[clamp(2.25rem,5vw,3rem)]">
          {t('armors.title')}
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">{t('armors.subtitle')}</p>
      </div>

      <Card className="content-section" glowColor="cyan">
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('armors.searchByName')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full !pl-[3.5rem] !pr-4 !py-2.5 text-base border-2 border-[#3a4a5a] bg-[rgba(26,35,50,0.5)] text-white outline-none transition-all [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)] hover:border-[#00d9ff] focus:border-[#00d9ff] placeholder:text-gray-500"
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

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

          {/* Categoria */}
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

          {/* Passiva */}
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

        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            {t('armory.clear')}
          </Button>
        </div>
      </Card>

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
      ) : displayedArmors.length === 0 ? (
        <Card className="text-center py-12" glowColor="cyan">
          <p className="text-gray-400">{t('armors.noResults')}</p>
        </Card>
      ) : (
        <>
          {loadingMore && (
            <></>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedArmors.map((armor) => {
              return (
                <ComponentCard
                  key={armor.id}
                  item={armor}
                  type="armor"
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
