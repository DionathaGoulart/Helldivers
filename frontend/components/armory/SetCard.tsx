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

// 3. Componentes
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

// 4. Utilitários e Constantes
import { translateCategory } from '@/utils/armory';
import { normalizeImageUrl } from '@/utils/images';
import { getDefaultImage } from '@/lib/armory/images';
import { getTranslatedName, getTranslatedEffect } from '@/lib/i18n';

// 5. Tipos
import type { ArmorSet, RelationType, SetRelationStatus } from '@/lib/types/armory';
import type { UpdatingState } from '@/lib/types/armory-page';

interface SetCardProps {
  set: ArmorSet;
  relationStatus: SetRelationStatus;
  updating: UpdatingState;
  user: { id: number } | null;
  onToggleRelation: (
    e: React.MouseEvent,
    set: ArmorSet,
    relationType: RelationType
  ) => Promise<void>;
}

/**
 * Componente para exibir card de set de armadura
 */
export default function SetCard({
  set,
  relationStatus,
  updating,
  user,
  onToggleRelation,
}: SetCardProps) {
  const { isPortuguese } = useLanguage();

  // Estado para controlar erro de carregamento da imagem
  const [imgError, setImgError] = React.useState(false);

  // Normaliza a URL da imagem ou usa fallback se houve erro
  const imageSrc = imgError || !set.image ? getDefaultImage('set') : normalizeImageUrl(set.image);

  const { t } = useTranslation();

  const isLoading = (relationType: RelationType) =>
    updating[`${set.id}-${relationType}`] === true;

  const RelationButton = ({
    relationType,
    icon: IconComponent,
    color,
    titleActive,
    titleInactive,
  }: {
    relationType: RelationType;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    titleActive: string;
    titleInactive: string;
  }) => {
    const isActive = relationStatus[relationType];
    const loading = isLoading(relationType);

    return (
      <button
        onClick={(e) => onToggleRelation(e, set, relationType)}
        disabled={loading}
        className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${isActive ? 'scale-110' : ''
          }`}
        title={isActive ? titleActive : titleInactive}
      >
        {loading ? (
          <svg
            className={`w-5 h-5 ${color} animate-spin`}
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
          <IconComponent
            className={`w-5 h-5 transition-all duration-200 ${isActive ? `${color} fill-current` : 'text-gray-400'
              }`}
          />
        )}
      </button>
    );
  };

  const FavoriteIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      fill={relationStatus.favorite ? 'currentColor' : 'none'}
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
  );

  const CollectionIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      fill={relationStatus.collection ? 'currentColor' : 'none'}
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
  );

  const WishlistIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      fill={relationStatus.wishlist ? 'currentColor' : 'none'}
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
  );

  return (
    <Card className="transition-all flex flex-col p-0 overflow-visible" glowColor="cyan">
      {/* Container com imagem e info principal lado a lado */}
      <div className="flex flex-col md:flex-row">
        {/* Imagem do set */}
        <div className="relative w-full md:w-48 lg:w-56 h-64 md:h-auto md:max-h-[500px] overflow-hidden bg-[#2a3a4a] border-2 border-[#00d9ff] [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,0_100%)] flex items-center justify-center shrink-0">
          <img
            src={imageSrc}
            alt={getTranslatedName(set, isPortuguese())}
            onError={() => setImgError(true)}
            className="w-full h-full max-h-[500px] object-contain"
          />

          {/* Botões de ação (favorito, coleção, wishlist) */}
          {user && (
            <div className="absolute top-2 right-2 flex flex-col gap-2">
              <RelationButton
                relationType="favorite"
                icon={FavoriteIcon}
                color="text-yellow-500"
                titleActive={t('sets.removeFavorite')}
                titleInactive={t('sets.addFavorite')}
              />
              <RelationButton
                relationType="collection"
                icon={CollectionIcon}
                color="text-blue-500"
                titleActive={t('sets.removeCollection')}
                titleInactive={t('sets.addCollection')}
              />
              <RelationButton
                relationType="wishlist"
                icon={WishlistIcon}
                color="text-green-500"
                titleActive={t('sets.removeWishlist')}
                titleInactive={t('sets.addWishlist')}
              />
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
                {t('armory.categoryLabel')}{' '}
                <span className="text-[#00d9ff] font-semibold">
                  {translateCategory(set.armor_stats.category_display, t)}
                </span>
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
      <div className="mt-6 px-4 pb-4">
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
    </Card>
  );
}

