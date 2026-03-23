import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/lib/translations';
import { useLanguage } from '@/contexts/LanguageContext';
import Card from '@/components/ui/Card';
import { Stratagem, SetRelationStatus, RelationType } from '@/lib/types/armory';
import ItemRelationButtons from './ItemRelationButtons';
import { RelationService } from '@/lib/armory/relation-service';
import { getDefaultImage } from '@/lib/armory/images';
import { useAuth } from '@/contexts/AuthContext';

interface StratagemCardProps {
    stratagem: Stratagem;
    warbondsMap?: Record<number, string>;
    initialRelationStatus?: SetRelationStatus;
}

export default function StratagemCard({ stratagem, warbondsMap, initialRelationStatus }: StratagemCardProps) {
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
            if (stratagem.warbond_detail) {
                setWarbondName(isPortuguese() && stratagem.warbond_detail.name_pt_br ? stratagem.warbond_detail.name_pt_br : stratagem.warbond_detail.name);
                return;
            }

            let warbondId = (stratagem as any).warbond || (stratagem as any).warbond_id;
            
            // Handle number-string
            if (!warbondId && typeof (stratagem as any).warbond === 'string' && /^\d+$/.test((stratagem as any).warbond)) {
                warbondId = parseInt((stratagem as any).warbond);
            }

            if (warbondId && warbondsMap && warbondsMap[warbondId]) {
                setWarbondName(warbondsMap[warbondId]);
                return;
            }

            if (typeof (stratagem as any).warbond === 'string' && !/^\d+$/.test((stratagem as any).warbond)) {
                setWarbondName((stratagem as any).warbond);
                return;
            }

            setWarbondName('');
        };
        resolve();
    }, [stratagem, isPortuguese, warbondsMap]);

    const renderArrows = (codex: string) => {
        if (!codex) return null;
        const codes = codex.split(',').map(c => c.trim().toUpperCase());

        return (
            <div className="flex flex-wrap gap-1 mt-2">
                {codes.map((code, index) => {
                    let arrow = '';
                    switch (code) {
                        case 'UP': arrow = '⬆️'; break;
                        case 'DOWN': arrow = '⬇️'; break;
                        case 'LEFT': arrow = '⬅️'; break;
                        case 'RIGHT': arrow = '➡️'; break;
                        default: return null;
                    }

                    return (
                        <span key={index} className="text-xl md:text-2xl drop-shadow-[0_0_2px_rgba(0,0,0,0.8)] filter grayscale-0 text-white">
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
            <div className="absolute top-2 right-2 z-10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                {user && (
                    <ItemRelationButtons 
                        itemType="stratagem"
                        itemId={stratagem.id}
                        initialStatus={initialRelationStatus}
                        itemData={stratagem}
                        userId={user.id}
                    />
                )}
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
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="px-2 py-0.5 text-[0.65rem] uppercase tracking-wider font-bold bg-[#00d9ff]/10 text-[#00d9ff] border border-[#00d9ff]/20 rounded-sm">
                                {t(`stratagems.departments.${stratagem.department}`) || stratagem.department_display}
                            </span>
                            {warbondName && (
                                <span className={`px-2 py-0.5 text-[0.65rem] uppercase tracking-wider font-bold border rounded-sm ${
                                    isGenericSource(warbondName) 
                                    ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' 
                                    : 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20'
                                }`}>
                                    {!isGenericSource(warbondName) && (isPortuguese() ? 'Bônus: ' : 'Warbond: ')}
                                    {warbondName}
                                </span>
                            )}
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
                        <div className="text-gray-400 mb-1 uppercase tracking-wider text-[10px]">{t('stratagems.cooldown')}</div>
                        <div className="text-[#00d9ff] font-bold font-['Orbitron']">{stratagem.cooldown}s</div>
                    </div>
                    <div className="bg-[#1a2332] p-2 border border-[#00d9ff]/10">
                        <div className="text-gray-400 mb-1 uppercase tracking-wider text-[10px]">{t('stratagems.cost')}</div>
                        <div className="text-[#democracy-gold] font-bold font-['Orbitron']">{stratagem.cost}</div>
                    </div>
                    <div className="bg-[#1a2332] p-2 border border-[#00d9ff]/10">
                        <div className="text-gray-400 mb-1 uppercase tracking-wider text-[10px]">{t('stratagems.unlock')}</div>
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
