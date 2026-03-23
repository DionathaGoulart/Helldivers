import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/lib/translations';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import { WeaponCategory, AnyWeapon } from '@/lib/types/weaponry';
import { SetRelationStatus } from '@/lib/types/armory';
import { getDefaultImage } from '@/lib/armory/images';
import ItemRelationButtons from '@/components/armory/ItemRelationButtons';

interface WeaponCardProps {
    weapon: AnyWeapon;
    category: WeaponCategory;
    warbondsMap?: Record<number, string>;
    acquisitionSourcesMap?: Record<number, string>;
    initialRelationStatus?: SetRelationStatus;
}

export default function WeaponCard({
    weapon,
    category,
    warbondsMap,
    acquisitionSourcesMap,
    initialRelationStatus,
}: WeaponCardProps) {
    const { t } = useTranslation();
    const { isPortuguese } = useLanguage();
    const { user } = useAuth();

    const [imgError, setImgError] = useState(false);
    const [warbondName, setWarbondName] = useState<string>('');

    // Resolve Warbond/Source Name
    useEffect(() => {
        const resolve = () => {
            // Priority 1: Object detail already on weapon
            if (weapon.warbond && typeof weapon.warbond === 'object') {
                const detail = weapon.warbond;
                setWarbondName(isPortuguese() && detail.name_pt_br ? detail.name_pt_br : detail.name);
                return;
            }

            if (weapon.acquisition_source_detail) {
                const detail = weapon.acquisition_source_detail;
                setWarbondName(isPortuguese() && detail.name_pt_br ? detail.name_pt_br : detail.name);
                return;
            }

            // Priority 2: Check Maps if we have IDs
            let warbondId = (weapon as any).warbond_id || (typeof weapon.warbond === 'number' ? weapon.warbond : null);
            
            // If weapon.warbond is a string but is actually a number-string (like "16")
            if (!warbondId && typeof weapon.warbond === 'string' && /^\d+$/.test(weapon.warbond)) {
                warbondId = parseInt(weapon.warbond);
            }

            if (warbondId && warbondsMap && warbondsMap[warbondId]) {
                setWarbondName(warbondsMap[warbondId]);
                return;
            }

            const sourceId = (weapon as any).acquisition_source || (weapon as any).acquisition_source_id;
            if (sourceId && acquisitionSourcesMap && acquisitionSourcesMap[sourceId]) {
                setWarbondName(acquisitionSourcesMap[sourceId]);
                return;
            }

            // Priority 3: String fallbacks (only if not a number)
            if (typeof weapon.warbond === 'string' && !/^\d+$/.test(weapon.warbond)) {
                setWarbondName(weapon.warbond);
                return;
            }

            setWarbondName('');
        };

        resolve();
    }, [weapon, isPortuguese, warbondsMap, acquisitionSourcesMap]);

    if (!weapon) return null;

    const name = isPortuguese() && weapon.name_pt_br ? weapon.name_pt_br : weapon.name;

    // Map category to RelationService type
    const relationType = category === 'throwable' ? 'throwable_weapon' : `${category}_weapon`;

    // Helper to determine if it's a warbond weapon (Strict)
    const isGenericSource = (val: string) => {
        if (!val) return true;
        const low = val.toLowerCase();
        return ['other', 'outro', 'padrão', 'default', 'starter', 'starter equipment', 'none', 'nenhum'].some(g => low.includes(g));
    };

    const isWarbondWeapon = (weapon.source && ['pass', 'warbond', 'battle pass', 'battle_pass'].includes(weapon.source.toLowerCase())) || 
                            (weapon.warbond && typeof weapon.warbond === 'object') || 
                            (warbondName && !isGenericSource(warbondName));

    // Helper to determine source type for labels
    const sourceType = (weapon.acquisition_source_detail as any)?.is_event ? 'event' : 
                       (isWarbondWeapon ? 'warbond' : 
                       (weapon.source === 'store' ? 'store' : 'other'));

    return (
        <Card className="transition-all flex flex-col p-0 overflow-visible h-full group" glowColor="cyan">
            <div className="flex flex-col h-full">
                {/* Image Section */}
                <div className="relative w-full h-48 bg-[#2a3a4a] border-b-2 border-[#00d9ff] flex items-center justify-center shrink-0 overflow-hidden">
                    <div className="relative w-full h-full p-6">
                        <Image
                            src={imgError || !weapon.image ? getDefaultImage(category) : weapon.image}
                            alt={name}
                            fill
                            className="object-contain transition-transform group-hover:scale-110 duration-300"
                            sizes="(max-width: 768px) 100vw, 300px"
                            onError={() => setImgError(true)}
                        />
                    </div>
                    {user && (
                        <div className="absolute top-2 right-2 z-10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <ItemRelationButtons 
                                itemType={relationType}
                                itemId={weapon.id}
                                initialStatus={initialRelationStatus}
                                itemData={weapon}
                                userId={user.id}
                            />
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="p-4 flex flex-col flex-1 space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-[0.65rem] uppercase tracking-wider font-bold bg-[#00d9ff]/10 text-[#00d9ff] border border-[#00d9ff]/20 rounded-sm">
                                {t(`weaponry.weaponTypes.${weapon.weapon_type}`) || weapon.weapon_type.replace('_', ' ')}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-white uppercase font-['Orbitron'] leading-tight min-h-[3rem] flex items-center" title={name}>
                            {name}
                        </h3>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#1a2332] p-2 border border-[#00d9ff]/10 flex flex-col items-center rounded">
                            <span className="text-gray-400 uppercase text-[10px] font-bold">{t('weaponry.damage')}</span>
                            <span className="text-white font-bold font-['Orbitron'] text-sm">{weapon.damage_value}</span>
                        </div>
                        <div className="bg-[#1a2332] p-2 border border-[#00d9ff]/10 flex flex-col items-center rounded">
                            <span className="text-gray-400 uppercase text-[10px] font-bold">{t('weaponry.penetration')}</span>
                            <span className="text-white font-bold font-['Orbitron'] text-sm">{weapon.max_penetration}</span>
                        </div>
                    </div>

                    {/* Acquisition Source Block */}
                    <div className="mt-auto space-y-2">
                        {(sourceType !== 'other' || (warbondName && !isGenericSource(warbondName))) ? (
                            <div
                                className={`p-1.5 rounded border ${sourceType === 'event' ? 'bg-red-500/10 border-red-500/20' :
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
                                        {sourceType === 'warbond' ? (isPortuguese() ? 'Bônus de Guerra' : 'Warbond') :
                                         sourceType === 'store' ? (isPortuguese() ? 'Super Loja' : 'Super Store') :
                                         sourceType === 'event' ? (isPortuguese() ? 'Evento' : 'Event') : 'ORIGEM'}
                                    </p>
                                )}
                                <p className="text-xs font-semibold text-white truncate">
                                    {warbondName && warbondName !== 'Passe' && warbondName !== 'Bônus de Guerra' && warbondName !== 'Super Loja' && warbondName !== 'Super Store' ? warbondName : 
                                     (sourceType === 'store' ? '' : (isPortuguese() ? 'Padrão' : 'Default'))}
                                </p>
                            </div>
                        ) : (
                            <div className="p-2 rounded border bg-gray-500/5 border-gray-500/10">
                                <p className="text-xs font-semibold text-gray-400 truncate uppercase">
                                    {warbondName || (isPortuguese() ? 'Padrão' : 'Default')}
                                </p>
                            </div>
                        )}

                        {/* Cost Row */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                            <span className="text-sm font-semibold uppercase tracking-wide text-gray-500 font-['Rajdhani']">
                                {t('weaponry.cost')}
                            </span>
                            <span className={`text-xl font-bold font-['Rajdhani'] ${weapon.cost === 0 ? 'text-[#00d9ff]' : 'text-[#d4af37]'}`}>
                                {weapon.cost === 0 ? 'FREE' : (
                                    <>
                                        {weapon.cost.toLocaleString('pt-BR')}{' '}
                                        <span className="text-sm text-gray-500">
                                            {['pass', 'warbond'].includes(weapon.source?.toLowerCase() || '') ? 'MED' : 'SC'}
                                        </span>
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
