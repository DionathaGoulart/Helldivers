/**
 * Componente SetCard
 * 
 * Card para exibir um set de armadura com suas informações e ações
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

// 1. React e Next.js
import React from 'react';
import Link from 'next/link';

// 2. Contextos e Hooks customizados
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';
import { useAuth } from '@/contexts/AuthContext';

// 3. Componentes
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ItemRelationButtons from '@/components/armory/ItemRelationButtons';

// 4. Utilitários e Constantes
import { translateCategory } from '@/utils/armory';
import { normalizeImageUrl } from '@/utils/images';
import { getDefaultImage } from '@/lib/armory/images';
import { getTranslatedName, getTranslatedEffect } from '@/lib/i18n';
import { RelationService } from '@/lib/armory/relation-service';

// 5. Tipos
import type { ArmorSet, SetRelationStatus } from '@/lib/types/armory';

interface SetCardProps {
  set: ArmorSet;
  initialRelationStatus?: SetRelationStatus;
  warbondsMap?: Record<number, string>;
}

/**
 * Componente para exibir card de set de armadura
 */
export default function SetCard({
  set,
  initialRelationStatus,
  warbondsMap,
}: SetCardProps) {
  const { isPortuguese } = useLanguage();
  const { t } = useTranslation();
  const { user } = useAuth();

  // Estado para controlar erro de carregamento da imagem
  const [imgError, setImgError] = React.useState(false);

  // Status local para UI instantânea
  const [status, setStatus] = React.useState<SetRelationStatus>(
    initialRelationStatus || { favorite: false, collection: false, wishlist: false }
  );
  const [warbondName, setWarbondName] = React.useState<string>('');

  // Carrega status real se não fornecido
  React.useEffect(() => {
    if (user && !initialRelationStatus) {
      RelationService.checkStatus('set', set.id, user.id).then(setStatus);
    }
  }, [user, set.id, initialRelationStatus]);

  // Sync state if initialRelationStatus changes (bulk fetch)
  React.useEffect(() => {
    if (initialRelationStatus) {
      setStatus(initialRelationStatus);
    }
  }, [initialRelationStatus]);

  const isGenericSource = (val: string) => {
    if (!val) return true;
    const low = val.toLowerCase();
    return ['other', 'outro', 'padrão', 'default', 'starter', 'starter equipment', 'none', 'nenhum'].some(g => low.includes(g));
  };

  // Resolve Warbond Name
  React.useEffect(() => {
    const resolveWarbond = () => {
      // Priority 1: Direct Object details
      if (set.pass_detail) {
        setWarbondName(getTranslatedName(set.pass_detail, isPortuguese()));
        return;
      }

      // Priority 2: Check Map if we have ID
      let passId = (set as any).pass_field || (set as any).acquisition_source || (set as any).pass_id || (set as any).warbond_id;
      
      // Handle number-string
      if (!passId && typeof (set as any).warbond === 'string' && /^\d+$/.test((set as any).warbond)) {
        passId = parseInt((set as any).warbond);
      }

      if (passId && warbondsMap && warbondsMap[passId]) {
        setWarbondName(warbondsMap[passId]);
        return;
      }

      // Priority 3: String fallbacks
      if (typeof (set as any).warbond === 'string' && !/^\d+$/.test((set as any).warbond)) {
        setWarbondName((set as any).warbond);
        return;
      }

      setWarbondName('');
    };

    resolveWarbond();
  }, [set, isPortuguese, warbondsMap]);

  // Normaliza a URL da imagem ou usa fallback se houve erro
  const imageSrc = imgError || !set.image ? getDefaultImage('set') : normalizeImageUrl(set.image);

  // Helper to determine Source Type
  const getSourceType = (): 'warbond' | 'store' | 'event' | 'other' => {
    if (set.source === 'pass' || set.pass_detail || (warbondName && !isGenericSource(warbondName))) return 'warbond';
    if (set.source === 'store') return 'store';
    return 'other';
  };

  const sourceType = getSourceType();

  return (
    <Card className="transition-all flex flex-col p-0 overflow-visible h-full group" glowColor="cyan">
      <div className="flex flex-col h-full">
        {/* Container com imagem e info principal lado a lado */}
        <div className="flex flex-col md:flex-row flex-1">
          {/* Imagem do set */}
          <div className="relative w-full md:w-48 lg:w-56 h-64 md:h-auto md:max-h-[500px] overflow-hidden bg-[#2a3a4a] border-b-2 md:border-b-0 md:border-r-2 border-[#00d9ff] flex items-center justify-center shrink-0">
            <img
              src={imageSrc}
              alt={getTranslatedName(set, isPortuguese())}
              onError={() => setImgError(true)}
              className="w-full h-full max-h-[500px] object-contain p-4"
            />

            {/* Botões de ação (favorito, coleção, wishlist) */}
            {user && (
              <div className="absolute top-2 right-2 flex flex-col gap-2 z-10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <ItemRelationButtons 
                  itemType="set"
                  itemId={set.id}
                  initialStatus={status}
                  itemData={set}
                  onStatusChange={setStatus}
                />
              </div>
            )}
          </div>

          {/* Informações principais - ao lado da imagem */}
          <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold uppercase tracking-wide font-['Rajdhani'] text-white leading-tight mb-2">
                  {getTranslatedName(set, isPortuguese())}
                </h3>
                {set.armor_stats?.category_display && (
                  <p className="text-xs text-gray-400 font-['Rajdhani']">
                    {t('armory.categoryLabel')}{' '}
                    <span className="text-[#00d9ff] font-semibold">
                      {translateCategory(set.armor_stats.category_display, t)}
                    </span>
                  </p>
                )}
              </div>

              {/* Stats */}
              {set.armor_stats && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-2 rounded bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.3)]">
                    <span className="text-xs uppercase font-bold text-[#3b82f6] font-['Rajdhani']">{t('armory.armor')}</span>
                    <span className="text-sm font-bold text-white font-['Rajdhani']">{set.armor_stats.armor_display || set.armor_stats.armor || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)]">
                    <span className="text-xs uppercase font-bold text-[#f59e0b] font-['Rajdhani']">{t('armory.speed')}</span>
                    <span className="text-sm font-bold text-white font-['Rajdhani']">{set.armor_stats.speed_display || set.armor_stats.speed || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)]">
                    <span className="text-xs uppercase font-bold text-[#10b981] font-['Rajdhani']">{t('armory.stamina')}</span>
                    <span className="text-sm font-bold text-white font-['Rajdhani']">{set.armor_stats.stamina_display || set.armor_stats.stamina || 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Passiva, Source, Custo Total e Botão - abaixo */}
        <div className="p-4 pt-2 w-full space-y-2 border-t border-[#00d9ff]/10">
          {/* Passiva */}
          {set.passive_detail && (
            <div className="p-3 rounded-lg bg-[rgba(255,215,0,0.1)] border border-[rgba(255,215,0,0.3)]">
              <p className="text-xs uppercase mb-1 font-bold text-[#d4af37] font-['Rajdhani']">
                {t('armory.passiveLabel')}
              </p>
              <p className="text-sm font-semibold text-white font-['Rajdhani']">
                {getTranslatedName(set.passive_detail, isPortuguese())}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {getTranslatedEffect(set.passive_detail, isPortuguese())}
              </p>
            </div>
          )}

          {/* Unified Acquisition Source Block */}
          {(sourceType !== 'other' || (warbondName && !isGenericSource(warbondName))) ? (
            <div
              className={`p-1.5 rounded border w-full ${sourceType === 'event' ? 'bg-red-500/10 border-red-500/20' :
                sourceType === 'warbond' ? 'bg-yellow-500/10 border-yellow-500/20' :
                  sourceType === 'store' ? 'bg-emerald-500/10 border-emerald-500/20' :
                    'bg-cyan-500/10 border-cyan-500/20'
                }`}
            >
              {sourceType !== 'other' && (
                <p className={`text-[10px] uppercase font-bold ${sourceType === 'event' ? 'text-red-400' :
                  sourceType === 'warbond' ? 'text-yellow-400' :
                    sourceType === 'store' ? 'text-emerald-400' :
                      'text-cyan-400'
                  }`}>
                  {
                    sourceType === 'event' ? (isPortuguese() ? 'Evento' : 'EVENT') :
                      sourceType === 'warbond' ? (isPortuguese() ? 'Bônus de Guerra' : 'Warbond') :
                        sourceType === 'store' ? (isPortuguese() ? 'Super Loja' : 'Store') :
                          'ORIGEM'
                  }
                </p>
              )}
              <p className="text-xs font-semibold text-white truncate">
                {warbondName && warbondName !== 'Passe' && warbondName !== 'Bônus de Guerra' && warbondName !== 'Super Loja' && warbondName !== 'Super Store' ? warbondName : 
                 (sourceType === 'store' ? '' : (isPortuguese() ? 'Padrão' : 'Default'))}
              </p>
            </div>
          ) : (
            <div className="p-2 rounded border bg-gray-500/5 border-gray-500/10 w-full">
                <p className="text-xs font-semibold text-gray-400 truncate uppercase">
                    {warbondName || (isPortuguese() ? 'Padrão' : 'Default')}
                </p>
            </div>
          )}

          {/* Custo Total e Botão */}
          <div className="space-y-3 pt-2 border-t border-gray-700/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wide text-gray-500 font-['Rajdhani']">
                {t('armory.totalCost')}
              </span>
              <span className={`text-xl font-bold font-['Rajdhani'] ${(set.total_cost || 0) === 0 ? 'text-[#00d9ff]' : 'text-[#d4af37]'}`}>
                {(set.total_cost || 0) === 0 ? 'FREE' : (
                  <>
                    {(set.total_cost || 0).toLocaleString('pt-BR')}{' '}
                    <span className="text-sm text-gray-500">
                      {set.source === 'pass' ? 'MED' : 'SC'}
                    </span>
                  </>
                )}
              </span>
            </div>
            <Link href={`/armory/sets/${set.id}`} className="block">
              <Button fullWidth variant="primary">
                {t('armory.viewDetails')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
