'use client';

// ============================================================================
// IMPORTS
// ============================================================================

// 1. React e Next.js
import { useEffect, useMemo, useState } from 'react';

// 2. Contextos e Hooks customizados
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';

// 3. Componentes
import { PassiveSelect, SetCard } from '@/components/armory';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// 4. Utilitários e Constantes
import { applyCustomOrdering } from '@/utils';
import { getTranslatedName } from '@/lib/i18n';
import { saveFiltersToStorage, getFiltersFromStorage, clearFiltersFromStorage } from '@/utils/filters-storage';

// 5. Tipos
import type {
  ArmorSet,
  BattlePass,
  Passive,
} from '@/lib/types/armory';
import type {
  OrderingOption,
  CategoryOption,
  SourceOption,
  PassiveOption,
} from '@/lib/types/armory-page';

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_ORDERING: OrderingOption = 'name';

// ============================================================================
// PROPS
// ============================================================================

interface SetsClientProps {
  initialSets: ArmorSet[];
  initialPassives: Passive[];
  initialPasses: BattlePass[];
}

/**
 * Componente Cliente da página de Armory Sets
 * Lida apenas com filtros, estados e relações de usuário, sem fetching inicial.
 */
export default function SetsClient({ initialSets, initialPassives, initialPasses }: SetsClientProps) {
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
    if (typeof window === 'undefined') return defaultFilters.search;
    return getFiltersFromStorage('armorySets', defaultFilters).search;
  });
  const [ordering, setOrdering] = useState<OrderingOption>(() => {
    if (typeof window === 'undefined') return defaultFilters.ordering;
    return getFiltersFromStorage('armorySets', defaultFilters).ordering;
  });
  const [selectedPassiveIds, setSelectedPassiveIds] = useState<number[]>(() => {
    if (typeof window === 'undefined') return defaultFilters.selectedPassiveIds;
    return getFiltersFromStorage('armorySets', defaultFilters).selectedPassiveIds;
  });
  const [category, setCategory] = useState<CategoryOption>(() => {
    if (typeof window === 'undefined') return defaultFilters.category;
    return getFiltersFromStorage('armorySets', defaultFilters).category;
  });
  const [source, setSource] = useState<SourceOption>(() => {
    if (typeof window === 'undefined') return defaultFilters.source;
    return getFiltersFromStorage('armorySets', defaultFilters).source;
  });
  const [passField, setPassField] = useState<number | ''>(() => {
    if (typeof window === 'undefined') return defaultFilters.passField;
    return getFiltersFromStorage('armorySets', defaultFilters).passField;
  });

  const [animatedCount, setAnimatedCount] = useState(0); 

  // Arrays convertidos a partir das props
  const passives: PassiveOption[] = useMemo(() => 
    initialPassives.map(p => ({
      id: p.id,
      name: p.name,
      name_pt_br: p.name_pt_br,
      effect: p.effect || '',
      effect_pt_br: p.effect_pt_br,
      image: p.image,
    })), [initialPassives]);
    
  const warbondsMap: Record<number, string> = useMemo(() => {
    const map: Record<number, string> = {};
    initialPasses.forEach(p => {
      map[p.id] = isPortuguese() && p.name_pt_br ? p.name_pt_br : p.name;
    });
    return map;
  }, [initialPasses, isPortuguese]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

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

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const filteredSets = useMemo(() => {
    let list = [...initialSets];

    // Busca de texto
    if (search) {
      const searchLower = search.toLowerCase();
      list = list.filter((s) =>
        (s.name && s.name.toLowerCase().includes(searchLower)) ||
        (s.name_pt_br && s.name_pt_br.toLowerCase().includes(searchLower))
      );
    }

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

    // Filtro por passe (herdado da armadura ou do set explicitamente, o SSG envia pass_detail ou algo)
    // No backend `getSetsData` passamos a source
    // Atualmente we need to filter if `s.pass_detail?.id === passField` Wait, in previous code:
    if (passField) {
      list = list.filter((s) => {
        // No original code eles verificavam passe herdado The SSG needs that info
        // We will assume any matching logic required isn't here yet if pass_detail is omitted from SQL
        // But let's leave as is if they have pass relations.
        return (s as any).pass_detail?.id === passField || (s as any).pass_field === passField;
      });
    }

    // Aplicar ordenação customizada
    return applyCustomOrdering(list, ordering);
  }, [initialSets, search, selectedPassiveIds, category, source, passField, ordering]);

  // Anima o contador quando o número de sets muda
  useEffect(() => {
    const targetCount = filteredSets.length;
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
  }, [filteredSets.length, animatedCount]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSourceChange = (newSource: SourceOption) => {
    setSource(newSource);
    if (newSource !== 'pass') {
      setPassField('');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setOrdering(DEFAULT_ORDERING);
    setSelectedPassiveIds([]);
    setCategory('');
    setSource('');
    setPassField('');
    clearFiltersFromStorage('armorySets');
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              onChange={(e) =>
                setPassField(e.target.value ? Number(e.target.value) : '')
              }
              className="w-full px-4 py-2.5 text-base border-2 border-[#3a4a5a] bg-[rgba(26,35,50,0.5)] text-white outline-none transition-all [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)] hover:border-[#00d9ff] focus:border-[#00d9ff]"
            >
              <option value="">{t('armory.allPasses')}</option>
              {initialPasses.map((pass) => (
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

      {/* Resultados */}
      {filteredSets.length === 0 ? (
        <Card className="text-center py-12" glowColor="cyan">
          <p className="text-gray-400">
            {t('armory.noResults')}
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map((set) => (
            <SetCard
              key={set.id}
              set={set}
              warbondsMap={warbondsMap}
            />
          ))}
        </div>
      )}
    </div>
  );
}
