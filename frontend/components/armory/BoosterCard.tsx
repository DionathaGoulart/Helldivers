import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/lib/translations';
import { useLanguage } from '@/contexts/LanguageContext';
import Card from '@/components/ui/Card';
import { Booster, SetRelationStatus } from '@/lib/types/armory';
import { getDefaultImage } from '@/lib/armory/images';
import { useAuth } from '@/contexts/AuthContext';
import ItemRelationButtons from './ItemRelationButtons';

interface BoosterCardProps {
    booster: Booster;
    warbondsMap?: Record<number, string>;
    initialRelationStatus?: SetRelationStatus;
}

export default function BoosterCard({ booster, warbondsMap, initialRelationStatus }: BoosterCardProps) {
    const { t } = useTranslation();
    const { isPortuguese } = useLanguage();
    const { user } = useAuth();
    const [imgError, setImgError] = useState(false);
    const [warbondName, setWarbondName] = useState<string>('');

    const isGenericSource = (val: string) => {
        if (!val) return true;
        const low = val.toLowerCase();
        return ['other', 'outro', 'padrão', 'default', 'starter', 'starter equipment', 'none', 'nenhum'].some(g => low.includes(g));
    };

    // Resolve Warbond Name
    useEffect(() => {
        const resolve = () => {
            if (booster.warbond_detail) {
                setWarbondName(isPortuguese() && booster.warbond_detail.name_pt_br ? booster.warbond_detail.name_pt_br : booster.warbond_detail.name);
                return;
            }

            let warbondId = (booster as any).warbond || (booster as any).warbond_id;
            
            // Handle number-string
            if (!warbondId && typeof (booster as any).warbond === 'string' && /^\d+$/.test((booster as any).warbond)) {
                warbondId = parseInt((booster as any).warbond);
            }

            if (warbondId && warbondsMap && warbondsMap[warbondId]) {
                setWarbondName(warbondsMap[warbondId]);
                return;
            }

            if (typeof (booster as any).warbond === 'string' && !/^\d+$/.test((booster as any).warbond)) {
                setWarbondName((booster as any).warbond);
                return;
            }

            setWarbondName('');
        };
        resolve();
    }, [booster, isPortuguese, warbondsMap]);

    const name = isPortuguese() && booster.name_pt_br ? booster.name_pt_br : booster.name;
    const description = isPortuguese() && booster.description_pt_br ? booster.description_pt_br : booster.description;

    return (
        <Card className="transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,217,255,0.3)] flex flex-col h-full relative group" glowColor="cyan">
            {/* Actions Overlay */}
            {user && (
                <div className="absolute top-2 right-2 z-10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <ItemRelationButtons 
                        itemType="booster"
                        itemId={booster.id}
                        initialStatus={initialRelationStatus}
                        itemData={booster}
                        userId={user.id}
                    />
                </div>
            )}

            <div className="flex flex-col h-full gap-4 p-4">
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
                            {warbondName && (
                                <div className="mb-1">
                                    <span className={`px-2 py-0.5 text-[0.65rem] uppercase tracking-wider font-bold border rounded-sm ${
                                        isGenericSource(warbondName) 
                                        ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' 
                                        : 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20'
                                    }`}>
                                        {!isGenericSource(warbondName) && (isPortuguese() ? 'Bônus: ' : 'Warbond: ')}
                                        {warbondName}
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
