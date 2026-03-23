'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from '@/lib/translations';
import { useLanguage } from '@/contexts/LanguageContext';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ComponentCard from '@/components/armory/ComponentCard';
import { Helmet, BattlePass, SetRelationStatus, AcquisitionSource } from '@/lib/types/armory';
import { RelationService } from '@/lib/armory/relation-service';
import { useAuth } from '@/contexts/AuthContext';

interface HelmetsClientProps {
  initialHelmets: Helmet[];
  initialPasses: BattlePass[];
  initialSources: AcquisitionSource[];
}

export default function HelmetsClient({ initialHelmets, initialPasses, initialSources }: HelmetsClientProps) {
  const { user, loading: authLoading } = useAuth();
  const { isPortuguese } = useLanguage();
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [relationStatuses, setRelationStatuses] = useState<Record<string, SetRelationStatus>>({});

  // Fetch relation statuses in bulk
  useEffect(() => {
    const fetchStatuses = async () => {
      if (!user) return;
      try {
        const statuses = await RelationService.checkBulkStatus('helmet', initialHelmets.map(h => h.id), user.id);
        setRelationStatuses(statuses);
      } catch (error) {
        console.error('Error fetching helmet statuses:', error);
      }
    };
    fetchStatuses();
  }, [user, initialHelmets]);

  const warbondsMap = useMemo(() => {
    const map: Record<number, string> = {};
    initialPasses.forEach((p) => {
      map[p.id] = isPortuguese() && p.name_pt_br ? p.name_pt_br : p.name;
    });
    return map;
  }, [initialPasses, isPortuguese]);

  const acquisitionSourcesMap = useMemo(() => {
    const map: Record<number, string> = {};
    initialSources.forEach((s) => {
      map[s.id] = isPortuguese() && s.name_pt_br ? s.name_pt_br : s.name;
    });
    return map;
  }, [initialSources, isPortuguese]);

  const filteredHelmets = useMemo(() => {
    return initialHelmets.filter((helmet) => {
      const name = isPortuguese() && helmet.name_pt_br ? helmet.name_pt_br : helmet.name;
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
      const matchesSource = sourceFilter === 'all' || helmet.source === sourceFilter;
      return matchesSearch && matchesSource;
    });
  }, [initialHelmets, search, sourceFilter, isPortuguese]);

  const sourceOptions = [
    { value: 'all', label: t('filters.allSources') },
    { value: 'pass', label: t('filters.warbond') },
    { value: 'store', label: t('filters.superStore') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-dark-lighter p-4 rounded-lg border border-gray-800">
        <div className="w-full md:w-1/2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search.placeholderHelmets') || "Buscar capacetes..."}
          />
        </div>
        <div className="w-full md:w-1/4">
          <Select
            value={sourceFilter}
            onChange={setSourceFilter}
            options={sourceOptions}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredHelmets.map((helmet) => (
          <ComponentCard
            key={helmet.id}
            item={helmet}
            type="helmet"
            warbondsMap={warbondsMap}
            acquisitionSourcesMap={acquisitionSourcesMap}
            userId={user?.id}
            initialRelationStatus={relationStatuses[String(helmet.id)]}
          />
        ))}
      </div>

      {filteredHelmets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">{t('search.noResults') || "Nenhum capacete encontrado."}</p>
        </div>
      )}
    </div>
  );
}
