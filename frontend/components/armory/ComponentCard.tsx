import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';
import Card from '@/components/ui/Card';
import { normalizeImageUrl } from '@/utils/images';
import { getDefaultImage } from '@/lib/armory/images';
import { getTranslatedName } from '@/lib/i18n';
import type { Helmet, Armor, Cape, RelationType, SetRelationStatus } from '@/lib/types/armory';
import { translateCategory } from '@/utils';
import { RelationService } from '@/lib/armory/relation-service';
import { useAuth } from '@/contexts/AuthContext';

// Tipo União para os componentes possíveis
type ArmoryComponent = Helmet | Armor | Cape;

interface ComponentCardProps {
    item: ArmoryComponent;
    type: 'helmet' | 'armor' | 'cape';
    // Removed relationStatus/updating/onToggleRelation props as they are handled internally or via service
    initialRelationStatus?: SetRelationStatus;
}

export default function ComponentCard({
    item,
    type,
    initialRelationStatus,
}: ComponentCardProps) {
    const { isPortuguese } = useLanguage();
    const { t } = useTranslation();
    const { user } = useAuth();
    const [imgError, setImgError] = React.useState(false);

    // Status local para UI instantânea
    const [status, setStatus] = React.useState<SetRelationStatus>(
        initialRelationStatus || { favorite: false, collection: false, wishlist: false }
    );
    const [loading, setLoading] = React.useState<Record<string, boolean>>({});

    // Carrega status real se não fornecido ou para garantir
    React.useEffect(() => {
        if (user) {
            RelationService.checkStatus(type, item.id).then(setStatus);
        }
    }, [user, type, item.id]);

    const handleToggle = async (e: React.MouseEvent, relationType: RelationType) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) return; // TODO: Trigger login modal?

        const currentVal = status[relationType];

        // Optimistic UI Update
        const nextStatus = { ...status, [relationType]: !currentVal };
        // Mutual exclusion logic
        if (relationType === 'collection' && nextStatus.collection) nextStatus.wishlist = false;
        if (relationType === 'wishlist' && nextStatus.wishlist) nextStatus.collection = false;

        setStatus(nextStatus);
        setLoading(prev => ({ ...prev, [relationType]: true }));

        try {
            await RelationService.toggleRelation(type, item.id, relationType, currentVal, item);
        } catch (error) {
            // Revert on error
            setStatus(status);
            console.error('Failed to toggle relation', error);
        } finally {
            setLoading(prev => ({ ...prev, [relationType]: false }));
        }
    };

    const imageSrc = imgError || !item.image ? getDefaultImage(type) : normalizeImageUrl(item.image);

    // Helper para verificar se é uma Armadura (tem stats)
    const isArmor = (item: ArmoryComponent): item is Armor => {
        return type === 'armor';
    };

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
        const isActive = status[relationType];
        const isLoading = loading[relationType];

        return (
            <button
                onClick={(e) => handleToggle(e, relationType)}
                disabled={isLoading}
                className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${isActive ? 'scale-110' : ''}`}
                title={isActive ? titleActive : titleInactive}
            >
                {isLoading ? (
                    <svg className={`w-5 h-5 ${color} animate-spin`} fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                ) : (
                    <IconComponent className={`w-5 h-5 transition-all duration-200 ${isActive ? `${color} fill-current` : 'text-gray-400'}`} />
                )}
            </button>
        );
    };

    const FavoriteIcon = ({ className }: { className?: string }) => (
        <svg className={className} fill={status.favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
    );
    const CollectionIcon = ({ className }: { className?: string }) => (
        <svg className={className} fill={status.collection ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
    );
    const WishlistIcon = ({ className }: { className?: string }) => (
        <svg className={className} fill={status.wishlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
    );

    return (
        <Card className="transition-all flex flex-col p-0 overflow-visible h-full" glowColor="cyan">
            <div className="flex flex-col flex-1">
                {/* Imagem + Ações */}
                <div className="relative w-full h-64 bg-[#2a3a4a] border-b-2 border-[#00d9ff] flex items-center justify-center shrink-0">
                    <img
                        src={imageSrc}
                        alt={getTranslatedName(item, isPortuguese())}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-contain p-4"
                    />
                    {user && (
                        <div className="absolute top-2 right-2 flex flex-col gap-2">
                            <RelationButton relationType="favorite" icon={FavoriteIcon} color="text-yellow-500" titleActive={t('sets.removeFavorite')} titleInactive={t('sets.addFavorite')} />
                            <RelationButton relationType="collection" icon={CollectionIcon} color="text-blue-500" titleActive={t('sets.removeCollection')} titleInactive={t('sets.addCollection')} />
                            <RelationButton relationType="wishlist" icon={WishlistIcon} color="text-green-500" titleActive={t('sets.removeWishlist')} titleInactive={t('sets.addWishlist')} />
                        </div>
                    )}
                </div>

                {/* Informações */}
                <div className="p-4 flex flex-col flex-1">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold uppercase tracking-wide font-['Rajdhani'] text-white leading-tight mb-2">
                            {getTranslatedName(item, isPortuguese())}
                        </h3>

                        {/* Categoria (apenas Armaduras) */}
                        {isArmor(item) && item.category_display && (
                            <p className="text-xs text-gray-400 font-['Rajdhani'] mb-2">
                                {t('armory.categoryLabel')}{' '}
                                <span className="text-[#00d9ff] font-semibold">
                                    {translateCategory(item.category_display, t)}
                                </span>
                            </p>
                        )}

                        {/* Stats de Armadura */}
                        {isArmor(item) && (
                            <div className="flex flex-col gap-2 mt-3">
                                <div className="flex items-center justify-between p-2 rounded bg-[rgba(37,99,235,0.1)] border border-[rgba(37,99,235,0.3)]">
                                    <span className="text-xs uppercase font-bold text-[#3b82f6] font-['Rajdhani']">{t('armory.armor')}</span>
                                    <span className="text-sm font-bold text-white font-['Rajdhani']">{item.armor_display || item.armor || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)]">
                                    <span className="text-xs uppercase font-bold text-[#f59e0b] font-['Rajdhani']">{t('armory.speed')}</span>
                                    <span className="text-sm font-bold text-white font-['Rajdhani']">{item.speed_display || item.speed || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)]">
                                    <span className="text-xs uppercase font-bold text-[#10b981] font-['Rajdhani']">{t('armory.stamina')}</span>
                                    <span className="text-sm font-bold text-white font-['Rajdhani']">{item.stamina_display || item.stamina || 'N/A'}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto space-y-4">
                        {/* Passiva (Armaduras) */}
                        {isArmor(item) && item.passive_detail && (
                            <div className="p-3 rounded-lg bg-[rgba(255,215,0,0.1)] border border-[rgba(255,215,0,0.3)]">
                                <p className="text-xs uppercase mb-1 font-bold text-[#d4af37] font-['Rajdhani']">
                                    {t('armory.passiveLabel')}
                                </p>
                                <p className="text-sm font-semibold text-white font-['Rajdhani']">
                                    {getTranslatedName(item.passive_detail, isPortuguese())}
                                </p>
                            </div>
                        )}

                        {/* Passe de Batalha */}
                        {item.pass_detail && (
                            <div className="p-3 rounded-lg bg-[rgba(147,51,234,0.1)] border border-[rgba(147,51,234,0.3)]">
                                <p className="text-xs uppercase mb-1 font-bold text-purple-400 font-['Rajdhani']">
                                    {t('armory.pass')}
                                </p>
                                <p className="text-sm font-semibold text-white font-['Rajdhani']">
                                    {getTranslatedName(item.pass_detail, isPortuguese())}
                                </p>
                            </div>
                        )}

                        {/* Fonte de Aquisição (Outros) */}
                        {item.acquisition_source_detail && (
                            <div className={`p-3 rounded-lg border ${item.acquisition_source_detail.is_event ? 'bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)]' : 'bg-[rgba(6,182,212,0.1)] border-[rgba(6,182,212,0.3)]'}`}>
                                <p className={`text-xs uppercase mb-1 font-bold font-['Rajdhani'] ${item.acquisition_source_detail.is_event ? 'text-red-400' : 'text-cyan-400'}`}>
                                    {item.acquisition_source_detail.is_event ? 'Event' : 'Source'}
                                </p>
                                <p className="text-sm font-semibold text-white font-['Rajdhani']">
                                    {getTranslatedName(item.acquisition_source_detail, isPortuguese())}
                                </p>
                            </div>
                        )}

                        {/* Custo */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                            <span className="text-sm font-semibold uppercase tracking-wide text-gray-500 font-['Rajdhani']">
                                {t('armory.costLabel')}
                            </span>
                            <span className="text-xl font-bold text-[#d4af37] font-['Rajdhani']">
                                {(item.cost || 0).toLocaleString('pt-BR')}{' '}
                                <span className="text-sm text-gray-500">
                                    {item.cost_currency || (item.source === 'pass' ? 'MED' : 'SC')}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
