'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from '@/lib/translations';
import { useLanguage } from '@/contexts/LanguageContext';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ComponentCard from '@/components/armory/ComponentCard';
import { Cape, BattlePass, SetRelationStatus, AcquisitionSource } from '@/lib/types/armory';
import { RelationService } from '@/lib/armory/relation-service';
import { useAuth } from '@/contexts/AuthContext';

interface CapesClientProps {
  initialCapes: Cape[];
  initialPasses: BattlePass[];
  initialSources: AcquisitionSource[];
}

export default function CapesClient({ initialCapes, initialPasses, initialSources }: CapesClientProps) {
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
        const statuses = await RelationService.checkBulkStatus('cape', initialCapes.map(c => c.id), user.id);
        setRelationStatuses(statuses);
      } catch (error) {
        console.error('Error fetching cape statuses:', error);
      }
    };
    fetchStatuses();
  }, [user, initialCapes]);

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

  const filteredCapes = useMemo(() => {
    return initialCapes.filter((cape) => {
      const name = isPortuguese() && cape.name_pt_br ? cape.name_pt_br : cape.name;
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
      const matchesSource = sourceFilter === 'all' || cape.source === sourceFilter;
      return matchesSearch && matchesSource;
    });
  }, [initialCapes, search, sourceFilter, isPortuguese]);

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
            placeholder={t('search.placeholderCapes') || "Buscar capas..."}
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
        {filteredCapes.map((cape) => (
          <ComponentCard
            key={cape.id}
            item={cape}
            type="cape"
            warbondsMap={warbondsMap}
            acquisitionSourcesMap={acquisitionSourcesMap}
            userId={user?.id}
            initialRelationStatus={relationStatuses[String(cape.id)]}
          />
        ))}
      </div>

      {filteredCapes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">{t('search.noResults') || "Nenhuma capa encontrada."}</p>
        </div>
      )}
    </div>
  );
}
