import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/lib/translations';
import { useLanguage } from '@/contexts/LanguageContext';
import Card from '@/components/ui/Card';
import { Stratagem, SetRelationStatus, RelationType } from '@/lib/types/armory';
import { HeartIcon as HeartOutline, QueueListIcon as ListOutline, BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, QueueListIcon as ListSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { addStratagemRelation, removeStratagemRelation } from '@/lib/armory-cached';
import { getDefaultImage } from '@/lib/armory/images';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface StratagemCardProps {
    stratagem: Stratagem;
    initialRelationStatus?: SetRelationStatus;
}

export default function StratagemCard({ stratagem, initialRelationStatus }: StratagemCardProps) {
    const { t } = useTranslation();
    const { isPortuguese } = useLanguage();
    const { user } = useAuth();

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
    const [imgError, setImgError] = useState(false);

    // Update local state when initialRelationStatus changes (e.g. after data fetch)
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
                await addStratagemRelation(stratagem.id, type);
                toast.success(t(`success.added_${type}`));
            } else {
                await removeStratagemRelation(stratagem.id, type);
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

    const renderArrows = (codex: string) => {
        if (!codex) return null;
        const codes = codex.split(',').map(c => c.trim().toUpperCase());

        return (
            <div className="flex flex-wrap gap-1 mt-2">
                {codes.map((code, index) => {
                    let arrow = '';
                    let colorClass = 'text-white'; // Default

                    switch (code) {
                        case 'UP':
                            arrow = '⬆️';
                            break;
                        case 'DOWN':
                            arrow = '⬇️';
                            break;
                        case 'LEFT':
                            arrow = '⬅️';
                            break;
                        case 'RIGHT':
                            arrow = '➡️';
                            break;
                        default: return null;
                    }

                    return (
                        <span key={index} className={`text-xl md:text-2xl drop-shadow-[0_0_2px_rgba(0,0,0,0.8)] filter grayscale-0 ${colorClass}`}>
                            {arrow}
                        </span>
                    );
                })}
            </div>
        );
    };

    const name = isPortuguese() && stratagem.name_pt_br ? stratagem.name_pt_br : stratagem.name;
    const description = isPortuguese() && stratagem.description_pt_br ? stratagem.description_pt_br : stratagem.description;

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
                    <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 bg-[#1a2332] border border-[#00d9ff]/30 p-1">
                        <div className="relative w-full h-full">
                            <Image
                                src={imgError || !stratagem.icon ? getDefaultImage('stratagem') : stratagem.icon}
                                alt={name}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 64px, 80px"
                                onError={() => setImgError(true)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-[0.65rem] uppercase tracking-wider font-bold bg-[#00d9ff]/10 text-[#00d9ff] border border-[#00d9ff]/20 rounded-sm">
                                {stratagem.department_display}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white uppercase font-['Orbitron'] leading-tight truncate" title={name}>
                            {name}
                        </h3>
                    </div>
                </div>

                {/* Codex (Arrows) */}
                <div className="bg-[#1a2332]/50 p-2 border-t border-b border-[#00d9ff]/10 flex justify-center">
                    {renderArrows(stratagem.codex)}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-[#1a2332] p-2 border border-[#00d9ff]/10">
                        <div className="text-gray-400 mb-1 uppercase tracking-wider text-[10px]">Cooldown</div>
                        <div className="text-[#00d9ff] font-bold font-['Orbitron']">{stratagem.cooldown}s</div>
                    </div>
                    <div className="bg-[#1a2332] p-2 border border-[#00d9ff]/10">
                        <div className="text-gray-400 mb-1 uppercase tracking-wider text-[10px]">Cost</div>
                        <div className="text-[#democracy-gold] font-bold font-['Orbitron']">{stratagem.cost}</div>
                    </div>
                    <div className="bg-[#1a2332] p-2 border border-[#00d9ff]/10">
                        <div className="text-gray-400 mb-1 uppercase tracking-wider text-[10px]">Unlock</div>
                        <div className="text-white font-bold font-['Orbitron']">Lvl {stratagem.unlock_level}</div>
                    </div>
                </div>

                {/* Description */}
                <div className="mt-auto">
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
                        {description}
                    </p>
                </div>
            </div>
        </Card>
    );
}
