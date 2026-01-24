import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/lib/translations';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import { WeaponCategory, AnyWeapon, WeaponRelationStatus } from '@/lib/types/weaponry';
import { WeaponryService } from '@/lib/weaponry-service';
import { getDefaultImage } from '@/lib/armory/images';
import { HeartIcon as HeartOutline, QueueListIcon as ListOutline, BookmarkIcon as BookmarkOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, QueueListIcon as ListSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

interface WeaponCardProps {
    weapon: AnyWeapon;
    category: WeaponCategory;
    initialRelationStatus?: WeaponRelationStatus;
}

export default function WeaponCard({ weapon, category, initialRelationStatus }: WeaponCardProps) {
    const { t } = useTranslation();
    const { isPortuguese } = useLanguage();
    const { user } = useAuth();

    const [status, setStatus] = useState<WeaponRelationStatus>(
        initialRelationStatus || { favorite: false, collection: false, wishlist: false }
    );
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        if (user && !initialRelationStatus) {
            WeaponryService.checkStatus(category, weapon.id).then(setStatus);
        }
    }, [user, category, weapon.id, initialRelationStatus]);

    const handleToggle = async (e: React.MouseEvent, type: 'favorite' | 'collection' | 'wishlist') => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error(t('auth.loginRequired') || 'Login required');
            return;
        }

        if (loading[type]) return;

        const currentVal = status[type];
        const nextStatus = { ...status, [type]: !currentVal };

        // Mutual exclusion logic similar to Armory/Stratagems
        if (type === 'collection' && nextStatus.collection) nextStatus.wishlist = false;
        if (type === 'wishlist' && nextStatus.wishlist) nextStatus.collection = false;

        setStatus(nextStatus);
        setLoading(prev => ({ ...prev, [type]: true }));

        try {
            await WeaponryService.toggleRelation(category, weapon.id, type, currentVal, weapon);
            toast.success(currentVal ? t(`success.removed_${type}`) : t(`success.added_${type}`));
        } catch (error) {
            setStatus(status); // Revert
            console.error('Failed to toggle relation', error);
            toast.error(t('error.generic') || 'Error updating status');
        } finally {
            setLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    const name = isPortuguese() && weapon.name_pt_br ? weapon.name_pt_br : weapon.name;


    return (
        <Card className="transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,217,255,0.3)] flex flex-col h-full relative group" glowColor="cyan">
            {/* Actions Overlay */}
            <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => handleToggle(e, 'favorite')} className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 transition-colors" title={t('actions.favorite')}>
                    {status.favorite ? <HeartSolid className="w-5 h-5 text-[var(--democracy-gold)]" /> : <HeartOutline className="w-5 h-5 text-gray-400 hover:text-[var(--democracy-gold)]" />}
                </button>
                <button onClick={(e) => handleToggle(e, 'collection')} className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 transition-colors" title={t('actions.collection')}>
                    {status.collection ? <ListSolid className="w-5 h-5 text-[var(--holo-cyan)]" /> : <ListOutline className="w-5 h-5 text-gray-400 hover:text-[var(--holo-cyan)]" />}
                </button>
                <button onClick={(e) => handleToggle(e, 'wishlist')} className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 transition-colors" title={t('actions.wishlist')}>
                    {status.wishlist ? <BookmarkSolid className="w-5 h-5 text-[var(--terminal-green)]" /> : <BookmarkOutline className="w-5 h-5 text-gray-400 hover:text-[var(--terminal-green)]" />}
                </button>
            </div>

            <div className="flex flex-col h-full gap-4">
                {/* Image */}
                <div className="relative w-full h-40 bg-[#1a2332] border border-[#00d9ff]/30 p-2 flex items-center justify-center">
                    <div className="relative w-full h-full">
                        <Image
                            src={imgError || !weapon.image ? getDefaultImage(category) : weapon.image}
                            alt={name}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 300px"
                            onError={() => setImgError(true)}
                        />
                    </div>
                </div>

                {/* Name */}
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-[0.65rem] uppercase tracking-wider font-bold bg-[#00d9ff]/10 text-[#00d9ff] border border-[#00d9ff]/20 rounded-sm">
                            {t(`weaponry.weaponTypes.${weapon.weapon_type}`) || weapon.weapon_type.replace('_', ' ')}
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-white uppercase font-['Orbitron'] leading-tight truncate" title={name}>
                        {name}
                    </h3>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs mt-auto">
                    <div className="bg-[#1a2332] p-2 border border-[#00d9ff]/10 flex flex-col items-center">
                        <span className="text-gray-400 uppercase text-[10px]">{t('weaponry.damage')}</span>
                        <span className="text-white font-bold font-['Orbitron']">{weapon.damage_value}</span>
                    </div>
                    <div className="bg-[#1a2332] p-2 border border-[#00d9ff]/10 flex flex-col items-center">
                        <span className="text-gray-400 uppercase text-[10px]">{t('weaponry.penetration')}</span>
                        <span className="text-white font-bold font-['Orbitron']">{weapon.max_penetration}</span>
                    </div>

                </div>

                {/* Acquisition Source */}
                {weapon.acquisition_source_detail && (
                    <div className={`mt-2 p-2 rounded border ${weapon.acquisition_source_detail.is_event ? 'bg-red-500/10 border-red-500/20' : 'bg-cyan-500/10 border-cyan-500/20'}`}>
                        <p className={`text-[10px] uppercase font-bold ${weapon.acquisition_source_detail.is_event ? 'text-red-400' : 'text-cyan-400'}`}>
                            {weapon.acquisition_source_detail.is_event ? 'Event' : 'Source'}
                        </p>
                        <p className="text-xs font-semibold text-white truncate">
                            {isPortuguese() && weapon.acquisition_source_detail.name_pt_br ? weapon.acquisition_source_detail.name_pt_br : weapon.acquisition_source_detail.name}
                        </p>
                    </div>
                )}

                {/* Cost */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 font-['Rajdhani']">
                        {t('weaponry.cost')}
                    </span>
                    <span className="text-sm font-bold text-[#d4af37] font-['Rajdhani']">
                        {weapon.cost} <span className="text-xs text-gray-500">{weapon.source === 'pass' ? 'MED' : 'SC'}</span>
                    </span>
                </div>
            </div>
        </Card>
    );
}
