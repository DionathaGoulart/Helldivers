/**
 * Página de Detalhes do Set de Armadura
 * 
 * Exibe detalhes completos de um set de armadura específico
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

// 1. React e Next.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// 2. Contextos e Hooks customizados
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';

// 3. Componentes
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CachedImage from '@/components/ui/CachedImage';

// 4. Utilitários e Constantes
import { translateCategory } from '@/utils/armory';
import { getDefaultImage } from '@/lib/armory/images';
import { getTranslatedName, getTranslatedEffect } from '@/lib/i18n';

// 5. Tipos
import type { ArmorSet, RelationType, SetRelationStatus } from '@/lib/types/armory';

// 6. Serviços e Libs
// 6. Serviços e Libs
import {
  getSet,
} from '@/lib/armory-cached';
import { RelationService } from '@/lib/armory/relation-service';

export default function SetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isPortuguese } = useLanguage();
  const { t } = useTranslation();

  const [set, setSetData] = useState<ArmorSet | null>(null);
  const [loading, setLoading] = useState(true);

  // Status de relação do SET
  const [relationStatus, setRelationStatus] = useState<SetRelationStatus>({ favorite: false, collection: false, wishlist: false });

  // Status de relação dos COMPONENTES
  const [componentRelations, setComponentRelations] = useState<{
    helmet: SetRelationStatus;
    armor: SetRelationStatus;
    cape: SetRelationStatus;
  }>({
    helmet: { favorite: false, collection: false, wishlist: false },
    armor: { favorite: false, collection: false, wishlist: false },
    cape: { favorite: false, collection: false, wishlist: false },
  });

  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchSet = async () => {
      setLoading(true);
      try {
        const setId = parseInt(params.id as string);
        if (isNaN(setId)) {
          router.push('/armory');
          return;
        }

        const data = await getSet(setId);
        setSetData(data);

        // Carregar relações se usuário estiver logado
        if (user) {
          try {
            // Verificar relação do SET
            const setStatus = await RelationService.checkStatus('set', setId);
            setRelationStatus(setStatus);

            // Verificar relações dos componentes
            const [helmetStatus, armorStatus, capeStatus] = await Promise.all([
              data.helmet_detail ? RelationService.checkStatus('helmet', data.helmet_detail.id) : Promise.resolve({ favorite: false, collection: false, wishlist: false }),
              data.armor_detail ? RelationService.checkStatus('armor', data.armor_detail.id) : Promise.resolve({ favorite: false, collection: false, wishlist: false }),
              data.cape_detail ? RelationService.checkStatus('cape', data.cape_detail.id) : Promise.resolve({ favorite: false, collection: false, wishlist: false }),
            ]);

            setComponentRelations({
              helmet: helmetStatus,
              armor: armorStatus,
              cape: capeStatus,
            });

          } catch (e) {
            console.warn('Erro ao carregar relações', e);
          }
        }
      } catch {
        router.push('/armory');
      } finally {
        setLoading(false);
      }
    };

    fetchSet();
  }, [params.id, user, router]);

  // Handler para toggle de relação do SET (afeta todos os componentes)
  const handleToggleRelation = async (relationType: RelationType) => {
    if (!user) {
      alert(t('sets.needLogin'));
      return;
    }

    if (!set) return;

    const key = `set-${relationType}`;
    if (updating[key]) return;

    setUpdating(prev => ({ ...prev, [key]: true }));

    // Estados anteriores para reversão
    const prevSetStatus = { ...relationStatus };
    const prevCompStatus = { ...componentRelations };

    try {
      const isActive = relationStatus[relationType];
      const newStatus = !isActive;

      // 1. Atualiza status do SET (Local UI)
      const newSetRelations = { ...relationStatus, [relationType]: newStatus };
      if (relationType === 'collection' && newStatus) newSetRelations.wishlist = false;
      if (relationType === 'wishlist' && newStatus) newSetRelations.collection = false;
      setRelationStatus(newSetRelations);

      // 2. Atualiza status de TODOS os componentes (Local UI Deep Sync)
      const newCompStatus = { ...componentRelations };
      (['helmet', 'armor', 'cape'] as const).forEach(type => {
        if (newCompStatus[type]) { // Só se o componente existir
          newCompStatus[type] = { ...newCompStatus[type], [relationType]: newStatus };
          if (relationType === 'collection' && newStatus) newCompStatus[type].wishlist = false;
          if (relationType === 'wishlist' && newStatus) newCompStatus[type].collection = false;
        }
      });
      setComponentRelations(newCompStatus);

      // 3. Usa o RelationService para API e Cache Global
      await RelationService.toggleRelation('set', set.id, relationType, isActive, {
        id: set.id,
        helmet: set.helmet_detail,
        armor: set.armor_detail,
        cape: set.cape_detail
      });

    } catch (error) {
      setRelationStatus(prevSetStatus);
      setComponentRelations(prevCompStatus);
      console.error(error);
      alert(t('armory.updateRelationError'));
    } finally {
      setUpdating(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  // Handler para toggle de componentes individuais
  const handleToggleComponentRelation = async (
    type: 'helmet' | 'armor' | 'cape',
    id: number,
    relationType: RelationType
  ) => {
    if (!user) {
      alert(t('sets.needLogin'));
      return;
    }

    const key = `${type}-${id}-${relationType}`;
    if (updating[key]) return;

    setUpdating(prev => ({ ...prev, [key]: true }));

    const prevCompRelations = { ...componentRelations };
    const prevSetStatus = { ...relationStatus };

    try {
      const currentStatus = componentRelations[type];
      const isActive = currentStatus[relationType];
      const newStatus = !isActive;

      // 1. Atualiza componente específico (Local UI)
      const newCompRelations = {
        ...componentRelations,
        [type]: { ...componentRelations[type], [relationType]: newStatus }
      };
      if (relationType === 'collection' && newStatus) newCompRelations[type].wishlist = false;
      if (relationType === 'wishlist' && newStatus) newCompRelations[type].collection = false;

      setComponentRelations(newCompRelations);

      // 2. Sincronização Inversa Local (Se todos componentes completam o set)
      const allComponentsHaveStatus =
        (set?.helmet_detail ? newCompRelations.helmet[relationType] : true) &&
        (set?.armor_detail ? newCompRelations.armor[relationType] : true) &&
        (set?.cape_detail ? newCompRelations.cape[relationType] : true);

      let newSetStatus = relationStatus[relationType];
      if (newStatus === true && allComponentsHaveStatus) {
        newSetStatus = true;
      } else if (newStatus === false) {
        newSetStatus = false;
      }

      const newSetRelations = { ...relationStatus, [relationType]: newSetStatus };
      if (relationType === 'collection' && newSetStatus) newSetRelations.wishlist = false;
      if (relationType === 'wishlist' && newSetStatus) newSetRelations.collection = false;
      setRelationStatus(newSetRelations);

      // 3. Usa RelationService
      await RelationService.toggleRelation(type, id, relationType, isActive);

      // Otimização: Se atualizamos o Set visualmente, devemos atualizar seu cache também
      if (newSetStatus !== prevSetStatus[relationType]) {
        RelationService.updateLocalCache('set', set!.id, relationType, newSetStatus);
      }

    } catch (error) {
      setComponentRelations(prevCompRelations);
      setRelationStatus(prevSetStatus);
      console.error(error);
      alert(t('armory.updateRelationError'));
    } finally {
      setUpdating(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  // Ícones
  const FavoriteIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
  );
  const CollectionIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
  );
  const WishlistIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
  );

  // Componente de botão de relação interno
  const RelationButton = ({
    type,
    id,
    relationType,
    icon: IconComponent,
    color,
    titleActive,
    titleInactive,
  }: {
    type: 'helmet' | 'armor' | 'cape';
    id: number;
    relationType: RelationType;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    titleActive: string;
    titleInactive: string;
  }) => {
    const isActive = componentRelations[type][relationType];
    const isUpdating = updating[`${type}-${id}-${relationType}`];

    return (
      <button
        onClick={(e) => handleToggleComponentRelation(type, id, relationType)}
        disabled={isUpdating}
        className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${isActive ? 'scale-110' : ''}`}
        title={isActive ? titleActive : titleInactive}
      >
        {isUpdating ? (
          <div className={`w-5 h-5 border-2 ${color} border-t-transparent rounded-full animate-spin`} />
        ) : (
          <IconComponent className={`w-5 h-5 transition-all duration-200 ${isActive ? `${color} fill-current` : 'text-gray-400'}`} />
        )}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!set) {
    return (
      <div className="container page-content">
        <Card className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('armory.setNotFound')}</h2>
          <Button onClick={() => router.push('/armory')}>{t('armory.backToArmory')}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container page-content">
      {/* Botão Voltar */}
      <div className="content-section mb-4">
        <Link href="/armory/sets">
          <Button variant="outline" size="sm">
            {t('armory.back')}
          </Button>
        </Link>
      </div>

      {/* Layout: Imagem à esquerda, Informações à direita */}
      <div className="content-section grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6">
        {/* Imagem do Set - Esquerda */}
        <Card className="p-0 overflow-hidden lg:w-80 xl:w-96">
          <div className="relative w-full h-96 lg:h-full min-h-[500px] bg-gray-200 overflow-hidden flex items-center justify-center border-2 border-[#00d9ff]">
            <CachedImage
              src={set.image}
              fallback={getDefaultImage('set')}
              alt={getTranslatedName(set, isPortuguese())}
              className="w-full h-full object-contain"
            />
          </div>
        </Card>

        {/* Informações Gerais - Direita */}
        <Card className="p-6">
          <div className="flex flex-col gap-8">
            {/* Nome */}
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-wide font-['Orbitron'] text-white">
                {getTranslatedName(set, isPortuguese())}
              </h1>
            </div>

            {/* Categoria */}
            {set.armor_stats?.category_display && (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold uppercase text-gray-500 font-['Rajdhani']">
                    {t('armory.categoryLabel')}
                  </span>
                  <span className="inline-block px-3 py-1 text-sm font-bold uppercase bg-[rgba(0,217,255,0.2)] text-[#00d9ff] font-['Rajdhani']">
                    {translateCategory(set.armor_stats.category_display, t)}
                  </span>
                </div>
              </div>
            )}

            {/* Estatísticas */}
            {set.armor_stats && (
              <div>
                <div className="grid grid-cols-3 gap-4">
                  {/* Armadura - Azul */}
                  <div className="p-2 rounded-lg bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.3)]">
                    <p className="text-xs uppercase mb-2 font-bold text-[#3b82f6] font-['Rajdhani']">
                      {t('armory.armor')}
                    </p>
                    <p className="text-xl font-bold text-white font-['Rajdhani']">
                      {set.armor_detail?.armor || set.armor_stats.armor_display || set.armor_stats.armor || 'N/A'}
                    </p>
                  </div>
                  {/* Velocidade - Laranja/Amarelo */}
                  <div className="p-2 rounded-lg bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)]">
                    <p className="text-xs uppercase mb-2 font-bold text-[#f59e0b] font-['Rajdhani']">
                      {t('armory.speed')}
                    </p>
                    <p className="text-xl font-bold text-white font-['Rajdhani']">
                      {set.armor_detail?.speed || set.armor_stats.speed_display || set.armor_stats.speed || 'N/A'}
                    </p>
                  </div>
                  {/* Estamina - Verde */}
                  <div className="p-2 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)]">
                    <p className="text-xs uppercase mb-2 font-bold text-[#10b981] font-['Rajdhani']">
                      {t('armory.stamina')}
                    </p>
                    <p className="text-xl font-bold text-white font-['Rajdhani']">
                      {set.armor_detail?.stamina || set.armor_stats.stamina_display || set.armor_stats.stamina || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Passiva */}
            {set.passive_detail && (
              <div>
                <div className="p-2 rounded-lg bg-[rgba(255,215,0,0.1)] border border-[rgba(255,215,0,0.3)] flex items-start gap-3">
                  <CachedImage
                    src={set.passive_detail.image}
                    fallback={getDefaultImage('passive')}
                    alt={getTranslatedName(set.passive_detail, isPortuguese())}
                    className="w-16 h-16 object-cover shrink-0 border-2 border-[#d4af37] [clip-path:polygon(0_0,calc(100%-4px)_0,100%_4px,100%_100%,0_100%)]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase mb-2 font-bold text-[#d4af37] font-['Rajdhani']">
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
              </div>
            )}

            {/* Passe */}
            {set.pass_detail && (
              <div>
                <div className="p-2 rounded-lg bg-[rgba(57,255,20,0.1)] border border-[rgba(57,255,20,0.3)] flex items-start gap-3">
                  <CachedImage
                    src={set.pass_detail.image}
                    fallback={getDefaultImage('pass')}
                    alt={getTranslatedName(set.pass_detail, isPortuguese())}
                    className="w-16 h-16 object-cover shrink-0 border-2 border-[#39ff14] [clip-path:polygon(0_0,calc(100%-4px)_0,100%_4px,100%_100%,0_100%)]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase mb-2 font-bold text-[#39ff14] font-['Rajdhani']">
                      {t('armory.pass')}
                    </p>
                    <p className="text-base font-semibold mb-2 text-white font-['Rajdhani']">
                      {getTranslatedName(set.pass_detail, isPortuguese())}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <div>
                        <span className="font-medium">{t('armory.credits')}</span> {set.pass_detail.creditos_ganhaveis.toLocaleString('pt-BR')}
                      </div>
                      <div>
                        <span className="font-medium">{t('armory.pages')}</span> {set.pass_detail.quantidade_paginas}
                      </div>
                      <div>
                        <span className="font-medium">{t('armory.costPages')}</span> {set.pass_detail.custo_medalhas_todas_paginas.toLocaleString('pt-BR')} MED
                      </div>
                      <div>
                        <span className="font-medium">{t('armory.costItems')}</span> {set.pass_detail.custo_medalhas_todos_itens.toLocaleString('pt-BR')} MED
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">{t('armory.costSC')}</span> {set.pass_detail.custo_supercreditos.toLocaleString('pt-BR')} SC
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custo Total */}
            <div>
              <div className="p-2 rounded-lg bg-[rgba(0,217,255,0.1)] border border-[rgba(0,217,255,0.3)]">
                <p className="text-sm mb-2 uppercase font-bold text-[#00d9ff] font-['Rajdhani']">
                  {t('armory.totalCost')}
                </p>
                <p className="text-2xl font-bold text-white font-['Rajdhani']">
                  {set.total_cost?.toLocaleString('pt-BR') || 0} {set.source === 'pass' ? 'MED' : 'SC'}
                </p>
              </div>
            </div>

            {/* Botões de ação do SET */}
            {user && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant={relationStatus.favorite ? 'primary' : 'outline'}
                  onClick={() => handleToggleRelation('favorite')}
                  disabled={updating['set-favorite']}
                  className="flex items-center gap-2"
                >
                  <FavoriteIcon className={`w-5 h-5 ${relationStatus.favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                  {relationStatus.favorite ? t('armory.favorited') : t('armory.favorite')}
                </Button>
                <Button
                  variant={relationStatus.collection ? 'primary' : 'outline'}
                  onClick={() => handleToggleRelation('collection')}
                  disabled={updating['set-collection']}
                  className="flex items-center gap-2"
                >
                  <CollectionIcon className={`w-5 h-5 ${relationStatus.collection ? 'text-blue-500 fill-current' : 'text-gray-400'}`} />
                  {relationStatus.collection ? t('armory.inCollection') : t('armory.collection')}
                </Button>
                <Button
                  variant={relationStatus.wishlist ? 'primary' : 'outline'}
                  onClick={() => handleToggleRelation('wishlist')}
                  disabled={updating['set-wishlist']}
                  className="flex items-center gap-2"
                >
                  <WishlistIcon className={`w-5 h-5 ${relationStatus.wishlist ? 'text-green-500 fill-current' : 'text-gray-400'}`} />
                  {relationStatus.wishlist ? t('armory.inList') : t('armory.list')}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Componentes do Set */}
      <div className="content-section">
        {/* Capacete */}
        {set.helmet_detail && (
          <Card glowColor="cyan" className="mb-8">
            <div className="flex items-start gap-4">
              <div className="relative">
                <CachedImage
                  src={set.helmet_detail.image}
                  fallback={getDefaultImage('helmet')}
                  alt={getTranslatedName(set.helmet_detail, isPortuguese())}
                  className="w-24 h-24 object-cover shrink-0 border-2 border-[#3a4a5a] [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,0_100%)]"
                />
                {/* Botões do Capacete */}
                {user && (
                  <div className="absolute -right-3 top-0 flex flex-col gap-1">
                    <RelationButton
                      type="helmet"
                      id={set.helmet_detail.id}
                      relationType="favorite"
                      icon={FavoriteIcon}
                      color="text-yellow-500"
                      titleActive={t('sets.removeFavorite')}
                      titleInactive={t('sets.addFavorite')}
                    />
                    <RelationButton
                      type="helmet"
                      id={set.helmet_detail.id}
                      relationType="collection"
                      icon={CollectionIcon}
                      color="text-blue-500"
                      titleActive={t('sets.removeCollection')}
                      titleInactive={t('sets.addCollection')}
                    />
                    <RelationButton
                      type="helmet"
                      id={set.helmet_detail.id}
                      relationType="wishlist"
                      icon={WishlistIcon}
                      color="text-green-500"
                      titleActive={t('sets.removeWishlist')}
                      titleInactive={t('sets.addWishlist')}
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pl-4">
                <h3 className="text-base font-bold uppercase tracking-wide mb-1 font-['Rajdhani'] text-[#00d9ff]">
                  {t('armory.helmet')}
                </h3>
                <p className="text-sm font-semibold mb-2 text-white font-['Rajdhani']">
                  {getTranslatedName(set.helmet_detail, isPortuguese())}
                </p>
                <p className="text-xs text-gray-400">
                  <span className="font-medium">{t('armory.costLabel')}</span> {set.helmet_detail.cost.toLocaleString('pt-BR')} {set.helmet_detail.cost_currency}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Armadura */}
        {set.armor_detail && (
          <Card glowColor="cyan" className="mb-8">
            <div className="flex items-start gap-4">
              <div className="relative">
                <CachedImage
                  src={set.armor_detail.image}
                  fallback={getDefaultImage('armor')}
                  alt={getTranslatedName(set.armor_detail, isPortuguese())}
                  className="w-24 h-24 object-cover shrink-0 border-2 border-[#3a4a5a] [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,0_100%)]"
                />
                {/* Botões da Armadura */}
                {user && (
                  <div className="absolute -right-3 top-0 flex flex-col gap-1">
                    <RelationButton
                      type="armor"
                      id={set.armor_detail.id}
                      relationType="favorite"
                      icon={FavoriteIcon}
                      color="text-yellow-500"
                      titleActive={t('sets.removeFavorite')}
                      titleInactive={t('sets.addFavorite')}
                    />
                    <RelationButton
                      type="armor"
                      id={set.armor_detail.id}
                      relationType="collection"
                      icon={CollectionIcon}
                      color="text-blue-500"
                      titleActive={t('sets.removeCollection')}
                      titleInactive={t('sets.addCollection')}
                    />
                    <RelationButton
                      type="armor"
                      id={set.armor_detail.id}
                      relationType="wishlist"
                      icon={WishlistIcon}
                      color="text-green-500"
                      titleActive={t('sets.removeWishlist')}
                      titleInactive={t('sets.addWishlist')}
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pl-4">
                <h3 className="text-base font-bold uppercase tracking-wide mb-1 font-['Rajdhani'] text-[#00d9ff]">
                  {t('armory.armorLabel')}
                </h3>
                <p className="text-sm font-semibold mb-2 text-white font-['Rajdhani']">
                  {getTranslatedName(set.armor_detail, isPortuguese())}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div>
                    <p className="text-xs mb-1 uppercase text-gray-500 font-['Rajdhani']">{t('armory.armor')}</p>
                    <p className="text-sm font-bold text-[#00d9ff] font-['Rajdhani']">
                      {set.armor_detail.armor_display || set.armor_detail.armor || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1 uppercase text-gray-500 font-['Rajdhani']">{t('armory.speed')}</p>
                    <p className="text-sm font-bold text-[#00d9ff] font-['Rajdhani']">
                      {set.armor_detail.speed_display || set.armor_detail.speed || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1 uppercase text-gray-500 font-['Rajdhani']">{t('armory.regeneration')}</p>
                    <p className="text-sm font-bold text-[#00d9ff] font-['Rajdhani']">
                      {set.armor_detail.stamina_display || set.armor_detail.stamina || 'N/A'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  <span className="font-medium">{t('armory.costLabel')}</span> {set.armor_detail.cost.toLocaleString('pt-BR')} {set.armor_detail.cost_currency}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Capa */}
        {set.cape_detail && (
          <Card glowColor="cyan" className="mb-8 last:mb-0">
            <div className="flex items-start gap-4">
              <div className="relative">
                <CachedImage
                  src={set.cape_detail.image}
                  fallback={getDefaultImage('cape')}
                  alt={getTranslatedName(set.cape_detail, isPortuguese())}
                  className="w-24 h-24 object-cover shrink-0 border-2 border-[#3a4a5a] [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,0_100%)]"
                />
                {/* Botões da Capa */}
                {user && (
                  <div className="absolute -right-3 top-0 flex flex-col gap-1">
                    <RelationButton
                      type="cape"
                      id={set.cape_detail.id}
                      relationType="favorite"
                      icon={FavoriteIcon}
                      color="text-yellow-500"
                      titleActive={t('sets.removeFavorite')}
                      titleInactive={t('sets.addFavorite')}
                    />
                    <RelationButton
                      type="cape"
                      id={set.cape_detail.id}
                      relationType="collection"
                      icon={CollectionIcon}
                      color="text-blue-500"
                      titleActive={t('sets.removeCollection')}
                      titleInactive={t('sets.addCollection')}
                    />
                    <RelationButton
                      type="cape"
                      id={set.cape_detail.id}
                      relationType="wishlist"
                      icon={WishlistIcon}
                      color="text-green-500"
                      titleActive={t('sets.removeWishlist')}
                      titleInactive={t('sets.addWishlist')}
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pl-4">
                <h3 className="text-base font-bold uppercase tracking-wide mb-1 font-['Rajdhani'] text-[#00d9ff]">
                  {t('armory.cape')}
                </h3>
                <p className="text-sm font-semibold mb-2 text-white font-['Rajdhani']">
                  {getTranslatedName(set.cape_detail, isPortuguese())}
                </p>
                <p className="text-xs text-gray-400">
                  <span className="font-medium">{t('armory.costLabel')}</span> {set.cape_detail.cost.toLocaleString('pt-BR')} {set.cape_detail.cost_currency}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
