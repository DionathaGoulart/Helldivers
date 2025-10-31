'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSet, ArmorSet, addSetRelation, removeSetRelation, checkSetRelation, SetRelationStatus, RelationType } from '@/lib/armory';
import { getDefaultImage } from '@/lib/armory/images';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
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
          } catch (error) {
            console.error('Erro ao verificar relações:', error);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar set:', error);
        router.push('/armory');
      } finally {
        setLoading(false);
      }
    };

    fetchSet();
  }, [params.id, user, router]);

  const handleToggleRelation = async (relationType: RelationType) => {
    if (!user) {
      alert('Você precisa estar logado para usar esta funcionalidade');
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
        } catch (wishlistError) {
          console.error('Erro ao remover da wishlist:', wishlistError);
        }
      }
      
      // Se está adicionando à wishlist e tinha na coleção, remover da coleção
      if (relationType === 'wishlist' && newStatus === true && currentStatus.collection === true) {
        try {
          await removeSetRelation(set.id, 'collection');
        } catch (collectionError) {
          console.error('Erro ao remover da coleção:', collectionError);
        }
      }
    } catch (error: unknown) {
      // Reverter estado em caso de erro
      setRelationStatus(previousStatus);
      
      console.error('Erro ao atualizar relação:', error);
      const message = 
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (error as { message?: string })?.message ||
        'Erro ao atualizar relação';
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Set não encontrado</h2>
          <Button onClick={() => router.push('/armory')}>Voltar para Armory</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container page-content">
      {/* Header Compacto */}
      <div className="content-section">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Link href="/armory">
              <Button variant="outline" size="sm">
                ← Voltar
              </Button>
            </Link>
            <div>
              <h1 
                className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-1"
                style={{
                  fontFamily: 'Orbitron, sans-serif',
                  color: 'var(--text-primary)',
                  textShadow: '0 0 10px rgba(0,217,255,0.5)',
                }}
              >
                {set.name}
              </h1>
              {set.armor_stats?.category_display && (
                <span 
                  className="inline-block px-2 py-1 text-xs font-bold uppercase whitespace-nowrap"
                  style={{
                    backgroundColor: 'rgba(0,217,255,0.2)',
                    color: 'var(--holo-cyan)',
                    clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 0 100%)',
                    fontFamily: 'Rajdhani, sans-serif',
                  }}
                >
                  {set.armor_stats.category_display}
                </span>
              )}
            </div>
          </div>
          
          {/* Botões de ação compactos */}
          {user && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleToggleRelation('favorite')}
                disabled={updating.favorite}
                className={`p-2 rounded-full transition-all cursor-pointer disabled:opacity-50 ${
                  relationStatus.favorite ? 'bg-yellow-500/20' : 'bg-white/10 hover:bg-white/20'
                }`}
                title={relationStatus.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <svg className={`w-5 h-5 ${relationStatus.favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
              <button
                onClick={() => handleToggleRelation('collection')}
                disabled={updating.collection}
                className={`p-2 rounded-full transition-all cursor-pointer disabled:opacity-50 ${
                  relationStatus.collection ? 'bg-blue-500/20' : 'bg-white/10 hover:bg-white/20'
                }`}
                title={relationStatus.collection ? 'Remover da coleção' : 'Adicionar à coleção'}
              >
                <svg className={`w-5 h-5 ${relationStatus.collection ? 'text-blue-500 fill-current' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </button>
              <button
                onClick={() => handleToggleRelation('wishlist')}
                disabled={updating.wishlist}
                className={`p-2 rounded-full transition-all cursor-pointer disabled:opacity-50 ${
                  relationStatus.wishlist ? 'bg-green-500/20' : 'bg-white/10 hover:bg-white/20'
                }`}
                title={relationStatus.wishlist ? 'Remover da lista' : 'Adicionar à lista'}
              >
                <svg className={`w-5 h-5 ${relationStatus.wishlist ? 'text-green-500 fill-current' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

        {/* Botões de ação (Favorito, Coleção, Wishlist) */}
        {user && (
          <div className="flex gap-3 content-section">
            <Button
              variant={relationStatus.favorite ? 'primary' : 'outline'}
              onClick={() => handleToggleRelation('favorite')}
              disabled={updating.favorite}
              className="flex items-center gap-2"
            >
              <svg className={`w-5 h-5 ${relationStatus.favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {relationStatus.favorite ? 'Favoritado' : 'Favoritar'}
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
              {relationStatus.collection ? 'Na Coleção' : 'Adicionar à Coleção'}
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
              {relationStatus.wishlist ? 'Na Lista' : 'Adicionar à Lista'}
            </Button>
          </div>
        )}

        {/* Título */}
        <div className="content-section">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{set.name}</h1>
          {set.armor_stats?.category_display && (
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {set.armor_stats.category_display}
            </span>
          )}
        </div>

        {/* Imagem do Set */}
        <Card className="content-section p-0 overflow-hidden">
          <div className="relative h-96 bg-gray-200 overflow-hidden">
            <img
              src={set.image || getDefaultImage('set')}
              alt={set.name}
              className="w-full h-full object-cover"
            />
          </div>
        </Card>

      {/* Componentes do Set */}
      <div className="space-y-4 content-section">
        {/* Capacete */}
        {set.helmet_detail && (
          <Card glowColor="cyan">
            <div className="flex items-start gap-4">
              <img
                src={set.helmet_detail.image || getDefaultImage('helmet')}
                alt={set.helmet_detail.name}
                className="w-24 h-24 object-cover shrink-0"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                  border: '2px solid var(--border-primary)',
                }}
              />
              <div className="flex-1 min-w-0">
                <h3 
                  className="text-base font-bold uppercase tracking-wide mb-1"
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    color: 'var(--holo-cyan)',
                  }}
                >
                  CAPACETE
                </h3>
                <p 
                  className="text-sm font-semibold mb-2"
                  style={{ color: 'var(--text-primary)', fontFamily: 'Rajdhani, sans-serif' }}
                >
                  {set.helmet_detail.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium">Custo:</span> {set.helmet_detail.cost.toLocaleString('pt-BR')} {set.helmet_detail.cost_currency}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Armadura */}
        {set.armor_detail && (
          <Card glowColor="cyan">
            <div className="flex items-start gap-4">
              <img
                src={set.armor_detail.image || getDefaultImage('armor')}
                alt={set.armor_detail.name}
                className="w-24 h-24 object-cover shrink-0"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                  border: '2px solid var(--border-primary)',
                }}
              />
              <div className="flex-1 min-w-0">
                <h3 
                  className="text-base font-bold uppercase tracking-wide mb-1"
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    color: 'var(--holo-cyan)',
                  }}
                >
                  ARMADURA
                </h3>
                <p 
                  className="text-sm font-semibold mb-2"
                  style={{ color: 'var(--text-primary)', fontFamily: 'Rajdhani, sans-serif' }}
                >
                  {set.armor_detail.name}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div>
                    <p className="text-xs mb-1 uppercase" style={{ color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif' }}>Armadura</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--holo-cyan)', fontFamily: 'Rajdhani, sans-serif' }}>
                      {set.armor_detail.armor_display || set.armor_detail.armor || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1 uppercase" style={{ color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif' }}>Velocidade</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--holo-cyan)', fontFamily: 'Rajdhani, sans-serif' }}>
                      {set.armor_detail.speed_display || set.armor_detail.speed || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs mb-1 uppercase" style={{ color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif' }}>Regeneração</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--holo-cyan)', fontFamily: 'Rajdhani, sans-serif' }}>
                      {set.armor_detail.stamina_display || set.armor_detail.stamina || 'N/A'}
                    </p>
                  </div>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium">Custo:</span> {set.armor_detail.cost.toLocaleString('pt-BR')} {set.armor_detail.cost_currency}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Capa */}
        {set.cape_detail && (
          <Card glowColor="cyan">
            <div className="flex items-start gap-4">
              <img
                src={set.cape_detail.image || getDefaultImage('cape')}
                alt={set.cape_detail.name}
                className="w-24 h-24 object-cover shrink-0"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                  border: '2px solid var(--border-primary)',
                }}
              />
              <div className="flex-1 min-w-0">
                <h3 
                  className="text-base font-bold uppercase tracking-wide mb-1"
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    color: 'var(--holo-cyan)',
                  }}
                >
                  CAPA
                </h3>
                <p 
                  className="text-sm font-semibold mb-2"
                  style={{ color: 'var(--text-primary)', fontFamily: 'Rajdhani, sans-serif' }}
                >
                  {set.cape_detail.name}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium">Custo:</span> {set.cape_detail.cost.toLocaleString('pt-BR')} {set.cape_detail.cost_currency}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Passiva e Passe */}
      <div className="space-y-4 content-section">
        {/* Passiva */}
        {set.passive_detail && (
          <Card glowColor="gold">
            <div className="flex items-start gap-4">
              <img
                src={getDefaultImage('passive')}
                alt={set.passive_detail.name}
                className="w-24 h-24 object-cover shrink-0"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                  border: '2px solid var(--democracy-gold)',
                }}
              />
              <div className="flex-1 min-w-0">
                <h3 
                  className="text-base font-bold uppercase tracking-wide mb-1"
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    color: 'var(--democracy-gold)',
                  }}
                >
                  PASSIVA
                </h3>
                <p 
                  className="text-sm font-semibold mb-2"
                  style={{ color: 'var(--text-primary)', fontFamily: 'Rajdhani, sans-serif' }}
                >
                  {set.passive_detail.name}
                </p>
                <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                  {set.passive_detail.effect}
                </p>
                {set.passive_detail.description && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {set.passive_detail.description}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Passe */}
        {set.pass_detail && (
          <Card glowColor="green">
            <div className="flex items-start gap-4">
              <img
                src={set.pass_detail.image || getDefaultImage('pass')}
                alt={set.pass_detail.name}
                className="w-24 h-24 object-cover shrink-0"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)',
                  border: '2px solid var(--terminal-green)',
                }}
              />
              <div className="flex-1 min-w-0">
                <h3 
                  className="text-base font-bold uppercase tracking-wide mb-1"
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    color: 'var(--terminal-green)',
                  }}
                >
                  PASSE
                </h3>
                <p 
                  className="text-sm font-semibold mb-2"
                  style={{ color: 'var(--text-primary)', fontFamily: 'Rajdhani, sans-serif' }}
                >
                  {set.pass_detail.name}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <div>
                    <span className="font-medium">Créditos:</span> {set.pass_detail.creditos_ganhaveis.toLocaleString('pt-BR')}
                  </div>
                  <div>
                    <span className="font-medium">Páginas:</span> {set.pass_detail.quantidade_paginas}
                  </div>
                  <div>
                    <span className="font-medium">Custo (Páginas):</span> {set.pass_detail.custo_medalhas_todas_paginas.toLocaleString('pt-BR')} MED
                  </div>
                  <div>
                    <span className="font-medium">Custo (Itens):</span> {set.pass_detail.custo_medalhas_todos_itens.toLocaleString('pt-BR')} MED
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">Custo em SC:</span> {set.pass_detail.custo_supercreditos.toLocaleString('pt-BR')} SC
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Fonte de Aquisição */}
      {set.source && (
        <div className="content-section text-center">
          <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)', fontFamily: 'Rajdhani, sans-serif' }}>
            FONTE: {set.source}
          </p>
        </div>
      )}
    </div>
  );
}

