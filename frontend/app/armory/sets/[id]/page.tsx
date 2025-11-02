'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSet, ArmorSet, addSetRelation, removeSetRelation, checkSetRelation, SetRelationStatus, RelationType } from '@/lib/armory-cached';
import { getDefaultImage } from '@/lib/armory/images';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getTranslatedName, getTranslatedDescription, getTranslatedEffect } from '@/lib/i18n';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/lib/translations';

export default function SetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { isPortuguese } = useLanguage();
  const { t } = useTranslation();
  
  // Função para traduzir categoria
  const translateCategory = (categoryDisplay: string | undefined) => {
    if (!categoryDisplay) return '';
    const categoryLower = categoryDisplay.toLowerCase();
    if (categoryLower === 'leve' || categoryLower === 'light') {
      return t('armory.light');
    }
    if (categoryLower === 'médio' || categoryLower === 'medio' || categoryLower === 'medium') {
      return t('armory.medium');
    }
    if (categoryLower === 'pesado' || categoryLower === 'heavy') {
      return t('armory.heavy');
    }
    return categoryDisplay; // Retorna o original se não encontrar correspondência
  };
  
  const [set, setSetData] = useState<ArmorSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [relationStatus, setRelationStatus] = useState<SetRelationStatus>({ favorite: false, collection: false, wishlist: false });
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
            const status = await checkSetRelation(setId);
            setRelationStatus(status);
          } catch {
            // Erro ao verificar relações
          }
        }
      } catch {
        // Erro ao buscar set
        router.push('/armory');
      } finally {
        setLoading(false);
      }
    };

    fetchSet();
  }, [params.id, user, router]);

  const handleToggleRelation = async (relationType: RelationType) => {
    if (!user) {
      alert(t('sets.needLogin'));
      return;
    }

    if (!set) return;

    const key = relationType;
    
    // Evitar múltiplos cliques simultâneos
    if (updating[key] === true) {
      return;
    }

    setUpdating(prev => ({ ...prev, [key]: true }));

    // Salvar estado anterior para reversão em caso de erro
    const previousStatus = { ...relationStatus };

    try {
      const currentStatus = { ...relationStatus };
      const isActive = currentStatus[relationType];
      const newStatus = !isActive;

      // Lógica: se está adicionando à coleção, remover da wishlist (e vice-versa)
      const newRelationsStatus = { ...currentStatus, [relationType]: newStatus };
      
      if (relationType === 'collection' && newStatus === true && currentStatus.wishlist === true) {
        newRelationsStatus.wishlist = false;
      }
      if (relationType === 'wishlist' && newStatus === true && currentStatus.collection === true) {
        newRelationsStatus.collection = false;
      }

      // Atualização otimista
      setRelationStatus(newRelationsStatus);

      // Operação principal
      if (isActive) {
        await removeSetRelation(set.id, relationType);
      } else {
        await addSetRelation(set.id, relationType);
      }

      // Se está adicionando à coleção e tinha na wishlist, remover da wishlist
      if (relationType === 'collection' && newStatus === true && currentStatus.wishlist === true) {
        try {
          await removeSetRelation(set.id, 'wishlist');
        } catch {
          // Erro ao remover da wishlist
        }
      }
      
      // Se está adicionando à wishlist e tinha na coleção, remover da coleção
      if (relationType === 'wishlist' && newStatus === true && currentStatus.collection === true) {
        try {
          await removeSetRelation(set.id, 'collection');
        } catch {
          // Erro ao remover da coleção
        }
      }
    } catch (error: unknown) {
      // Reverter estado em caso de erro
      setRelationStatus(previousStatus);
      
      // Erro ao atualizar relação
      const message = 
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (error as { message?: string })?.message ||
        t('armory.updateRelationError');
      alert(message);
    } finally {
      setUpdating(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
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
        <Link href="/armory">
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
            <img
              src={set.image || getDefaultImage('set')}
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
                      {translateCategory(set.armor_stats.category_display)}
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
                    <img
                      src={set.passive_detail.image || getDefaultImage('passive')}
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
                    <img
                      src={set.pass_detail.image || getDefaultImage('pass')}
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

              {/* Botões de ação (Favorito, Coleção, Wishlist) */}
              {user && (
                <div className="flex gap-3 pt-2">
                  <Button
                    variant={relationStatus.favorite ? 'primary' : 'outline'}
                    onClick={() => handleToggleRelation('favorite')}
                    disabled={updating.favorite}
                    className="flex items-center gap-2"
                  >
                    <svg className={`w-5 h-5 ${relationStatus.favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {relationStatus.favorite ? t('armory.favorited') : t('armory.favorite')}
                  </Button>
                  <Button
                    variant={relationStatus.collection ? 'primary' : 'outline'}
                    onClick={() => handleToggleRelation('collection')}
                    disabled={updating.collection}
                    className="flex items-center gap-2"
                  >
                    <svg className={`w-5 h-5 ${relationStatus.collection ? 'text-blue-500 fill-current' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {relationStatus.collection ? t('armory.inCollection') : t('armory.collection')}
                  </Button>
                  <Button
                    variant={relationStatus.wishlist ? 'primary' : 'outline'}
                    onClick={() => handleToggleRelation('wishlist')}
                    disabled={updating.wishlist}
                    className="flex items-center gap-2"
                  >
                    <svg className={`w-5 h-5 ${relationStatus.wishlist ? 'text-green-500 fill-current' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
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
              <img
                src={set.helmet_detail.image || getDefaultImage('helmet')}
                alt={getTranslatedName(set.helmet_detail, isPortuguese())}
                className="w-24 h-24 object-cover shrink-0 border-2 border-[#3a4a5a] [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,0_100%)]"
              />
              <div className="flex-1 min-w-0">
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
              <img
                src={set.armor_detail.image || getDefaultImage('armor')}
                alt={getTranslatedName(set.armor_detail, isPortuguese())}
                className="w-24 h-24 object-cover shrink-0 border-2 border-[#3a4a5a] [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,0_100%)]"
              />
              <div className="flex-1 min-w-0">
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
              <img
                src={set.cape_detail.image || getDefaultImage('cape')}
                alt={getTranslatedName(set.cape_detail, isPortuguese())}
                className="w-24 h-24 object-cover shrink-0 border-2 border-[#3a4a5a] [clip-path:polygon(0_0,calc(100%-6px)_0,100%_6px,100%_100%,0_100%)]"
              />
              <div className="flex-1 min-w-0">
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

