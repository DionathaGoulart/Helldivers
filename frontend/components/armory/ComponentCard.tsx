import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';
import Card from '@/components/ui/Card';
import { normalizeImageUrl } from '@/utils/images';
import { getDefaultImage } from '@/lib/armory/images';
import { getTranslatedName } from '@/lib/i18n';
import type { Helmet, Armor, Cape, Passive, SetRelationStatus } from '@/lib/types/armory';
import { translateCategory } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';
import ItemRelationButtons from './ItemRelationButtons';

// Tipo União para os componentes possíveis
type ArmoryComponent = Helmet | Armor | Cape;

interface ComponentCardProps {
    item: Armor | Helmet | Cape;
    type: 'armor' | 'helmet' | 'cape';
    warbondsMap?: Record<number, string>;
    acquisitionSourcesMap?: Record<number, string>;
    passivesMap?: Record<number, any>;
    userId?: string;
    initialRelationStatus?: SetRelationStatus;
}

export default function ComponentCard({
    item,
    type,
    warbondsMap,
    acquisitionSourcesMap,
    passivesMap,
    userId,
    initialRelationStatus,
}: ComponentCardProps) {
    const { isPortuguese } = useLanguage();
    const { t } = useTranslation();
    const { user } = useAuth();
    const [imgError, setImgError] = useState(false);
    const [warbondName, setWarbondName] = useState<string>('');

    // Resolve Warbond/Source Name
    useEffect(() => {
        const resolve = () => {
            // Priority 1: Object detail already on item
            const p = (item as any).pass_detail || (item as any).warbond;
            if (p && typeof p === 'object') {
                setWarbondName(isPortuguese() && p.name_pt_br ? p.name_pt_br : p.name);
                return;
            }

            if ((item as any).acquisition_source_detail) {
                const detail = (item as any).acquisition_source_detail;
                setWarbondName(isPortuguese() && detail.name_pt_br ? detail.name_pt_br : detail.name);
                return;
            }

            // Priority 2: Check Maps if we have IDs
            let passId = (item as any).pass_field || (item as any).warbond_id || (typeof (item as any).warbond === 'number' ? (item as any).warbond : null);
            
            // If it's a number-string
            if (!passId && typeof (item as any).warbond === 'string' && /^\d+$/.test((item as any).warbond)) {
                passId = parseInt((item as any).warbond);
            }

            if (passId && warbondsMap && warbondsMap[passId]) {
                setWarbondName(warbondsMap[passId]);
                return;
            }

            const sourceId = (item as any).acquisition_source;
            if (sourceId && acquisitionSourcesMap && acquisitionSourcesMap[sourceId]) {
                setWarbondName(acquisitionSourcesMap[sourceId]);
                return;
            }

            // Priority 3: String fallbacks
            if (typeof (item as any).warbond === 'string' && !/^\d+$/.test((item as any).warbond)) {
                setWarbondName((item as any).warbond);
                return;
            }

            setWarbondName('');
        };
        resolve();
    }, [item, isPortuguese, warbondsMap, acquisitionSourcesMap]);

    const imageSrc = imgError || !item.image ? getDefaultImage(type) : normalizeImageUrl(item.image);

    // Helper para verificar se é uma Armadura (tem stats)
    const isArmor = (item: ArmoryComponent): item is Armor => {
        return type === 'armor';
    };

    // Helper to get passive detail
    const getPassiveDetail = (): Passive | undefined => {
        if (!isArmor(item)) return undefined;
        if (item.passive_detail) return item.passive_detail;
        if (item.passive && passivesMap && passivesMap[item.passive]) {
            return passivesMap[item.passive];
        }
        return undefined;
    };

    const passiveDetail = getPassiveDetail();

    const isGenericSource = (val: string) => {
        if (!val) return true;
        const low = val.toLowerCase();
        return ['other', 'outro', 'padrão', 'default', 'starter', 'starter equipment', 'none', 'nenhum'].some(g => low.includes(g));
    };

    // Helper to determine Source Type
    const getSourceType = () => {
        const sourceDetail = (item as any).acquisition_source_detail;
        if (sourceDetail?.is_event) return 'event';
        
        const isWarbond = (item.source === 'pass' || (item as any).pass_field || (item as any).pass_detail || (item as any).warbond_id) ||
                          ((item as any).warbond && typeof (item as any).warbond === 'object') ||
                          (warbondName && !isGenericSource(warbondName));

        if (isWarbond) return 'warbond';
        if (item.source === 'store') return 'store';
        return 'other';
    };

    const sourceType = getSourceType();

    return (
        <Card className="transition-all flex flex-col p-0 overflow-visible h-full group" glowColor="cyan">
            <div className="flex flex-col flex-1">
                {/* Imagem + Ações */}
                <div className="relative w-full h-64 bg-[#2a3a4a] border-b-2 border-[#00d9ff] flex items-center justify-center shrink-0">
                    <img
                        src={imageSrc}
                        alt={getTranslatedName(item, isPortuguese())}
                        onError={() => setImgError(true)}
                        className="w-full h-full object-contain p-4 transition-transform group-hover:scale-110 duration-300"
                    />
                    {user && (
                        <div className="absolute top-2 right-2 z-10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <ItemRelationButtons 
                                itemType={type}
                                itemId={item.id}
                                initialStatus={initialRelationStatus}
                                itemData={item}
                                onStatusChange={() => {}} 
                                userId={user.id}
                            />
                        </div>
                    )}
                </div>

                {/* Informações */}
                <div className="p-4 flex flex-col flex-1 space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold uppercase tracking-wide font-['Rajdhani'] text-white leading-tight min-h-[3rem] flex items-center">
                            {getTranslatedName(item, isPortuguese())}
                        </h3>

                        {/* Categoria (apenas Armaduras) */}
                        {isArmor(item) && item.category_display && (
                            <p className="text-xs text-gray-400 font-['Rajdhani']">
                                {t('armory.categoryLabel')}{' '}
                                <span className="text-[#00d9ff] font-semibold">
                                    {translateCategory(item.category_display, t)}
                                </span>
                            </p>
                        )}
                    </div>

                    {/* Stats de Armadura */}
                    {isArmor(item) && (
                        <div className="grid grid-cols-1 gap-2">
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

                    <div className="mt-auto space-y-4">
                        {/* Passiva (Armaduras) */}
                        {isArmor(item) && passiveDetail && (
                            <div className="p-3 rounded-lg bg-[rgba(255,215,0,0.1)] border border-[rgba(255,215,0,0.3)]">
                                <p className="text-xs uppercase mb-1 font-bold text-[#d4af37] font-['Rajdhani']">
                                    {t('armory.passiveLabel')}
                                </p>
                                <p className="text-sm font-semibold text-white font-['Rajdhani'] mb-1">
                                    {getTranslatedName(passiveDetail, isPortuguese())}
                                </p>
                                <p className="text-[10px] text-gray-400 leading-snug line-clamp-2">
                                    {isPortuguese() && passiveDetail.description_pt_br ? passiveDetail.description_pt_br : (passiveDetail.effect_pt_br || passiveDetail.description || passiveDetail.effect)}
                                </p>
                            </div>
                        )}

                        {/* Unified Acquisition Source Block */}
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

                        {/* Custo */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
                            <span className="text-sm font-semibold uppercase tracking-wide text-gray-500 font-['Rajdhani']">
                                {t('armory.costLabel')}
                            </span>
                            <span className={`text-xl font-bold font-['Rajdhani'] ${(item.cost || 0) === 0 ? 'text-[#00d9ff]' : 'text-[#d4af37]'}`}>
                                {(item.cost || 0) === 0 ? (
                                    'FREE'
                                ) : (
                                    <>
                                        {(item.cost || 0).toLocaleString('pt-BR')}{' '}
                                        <span className="text-sm text-gray-500">
                                            {item.cost_currency || (item.source === 'pass' ? 'MED' : 'SC')}
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
