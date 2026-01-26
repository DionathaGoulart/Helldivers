import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/lib/translations';
import { useLanguage } from '@/contexts/LanguageContext';
import Card from '@/components/ui/Card';
import { Booster, SetRelationStatus, RelationType } from '@/lib/types/armory';
import { getDefaultImage } from '@/lib/armory/images';
import { HeartIcon as HeartOutline, QueueListIcon as ListOutline, BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, QueueListIcon as ListSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { addBoosterRelation, removeBoosterRelation } from '@/lib/armory-cached';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface BoosterCardProps {
    booster: Booster;
    initialRelationStatus?: SetRelationStatus;
}

export default function BoosterCard({ booster, initialRelationStatus }: BoosterCardProps) {
    const { t } = useTranslation();
    const { isPortuguese } = useLanguage();
    const { user } = useAuth();
    const [imgError, setImgError] = useState(false);

    const [relations, setRelations] = useState<SetRelationStatus>(initialRelationStatus || {
        favorite: false,
        collection: false,
        wishlist: false
    });

    const [updating, setUpdating] = useState({
        favorite: false,
        collection: false,
        wishlist: false
    });

    useEffect(() => {
        if (initialRelationStatus) {
            setRelations(initialRelationStatus);
        }
    }, [initialRelationStatus]);

    const handleToggleRelation = async (type: RelationType, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error(t('auth.loginRequired'));
            return;
        }

        if (updating[type]) return;

        setUpdating(prev => ({ ...prev, [type]: true }));

        // Optimistic update
        const newState = !relations[type];
        setRelations(prev => ({ ...prev, [type]: newState }));

        try {
            if (newState) {
                await addBoosterRelation(booster.id, type);
                toast.success(t(`success.added_${type}`));
            } else {
                await removeBoosterRelation(booster.id, type);
                toast.success(t(`success.removed_${type}`));
            }
        } catch (error) {
            // Revert on error
            setRelations(prev => ({ ...prev, [type]: !newState }));
            console.error(`Error toggling ${type}:`, error);
            toast.error(t('error.generic'));
        } finally {
            setUpdating(prev => ({ ...prev, [type]: false }));
        }
    };

    const name = isPortuguese() && booster.name_pt_br ? booster.name_pt_br : booster.name;
    const description = isPortuguese() && booster.description_pt_br ? booster.description_pt_br : booster.description;

    return (
        <Card className="transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,217,255,0.3)] flex flex-col h-full relative group" glowColor="cyan">
            {/* Actions Overlay */}
            <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => handleToggleRelation('favorite', e)}
                    className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
                    title={t('actions.favorite')}
                >
                    {relations.favorite ? (
                        <HeartSolid className="w-5 h-5 text-[var(--democracy-gold)]" />
                    ) : (
                        <HeartOutline className="w-5 h-5 text-gray-400 hover:text-[var(--democracy-gold)]" />
                    )}
                </button>
                <button
                    onClick={(e) => handleToggleRelation('collection', e)}
                    className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
                    title={t('actions.collection')}
                >
                    {relations.collection ? (
                        <ListSolid className="w-5 h-5 text-[var(--holo-cyan)]" />
                    ) : (
                        <ListOutline className="w-5 h-5 text-gray-400 hover:text-[var(--holo-cyan)]" />
                    )}
                </button>
                <button
                    onClick={(e) => handleToggleRelation('wishlist', e)}
                    className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 transition-colors"
                    title={t('actions.wishlist')}
                >
                    {relations.wishlist ? (
                        <BookmarkSolid className="w-5 h-5 text-[var(--terminal-green)]" />
                    ) : (
                        <BookmarkOutline className="w-5 h-5 text-gray-400 hover:text-[var(--terminal-green)]" />
                    )}
                </button>
            </div>

            <div className="flex flex-col h-full gap-4">
                {/* Header with Icon and Name */}
                <div className="flex items-start gap-4">
                    <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 bg-[#1a2332] border border-[#00d9ff]/30 [clip-path:polygon(25%_0%,75%_0%,100%_50%,75%_100%,25%_100%,0%_50%)] p-1">
                        <div className="relative w-full h-full">
                            <Image
                                src={imgError || !booster.icon ? getDefaultImage('booster') : booster.icon}
                                alt={name}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 64px, 80px"
                                onError={() => setImgError(true)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 flex items-center">
                        {/* Name - Centered vertically if no other tags */}
                        <div className="w-full">
                            {booster.warbond_detail && (
                                <div className="mb-1">
                                    <span className="px-2 py-0.5 text-[0.65rem] uppercase tracking-wider font-bold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 rounded-sm">
                                        {booster.warbond_detail.name}
                                    </span>
                                </div>
                            )}
                            <h3 className="text-lg font-bold text-white uppercase font-['Orbitron'] leading-tight truncate" title={name}>
                                {name}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mt-auto pt-2 border-t border-[#00d9ff]/10">
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">
                        {description}
                    </p>
                </div>
            </div>
        </Card>
    );
}
