/**
 * Página principal do Armory - Sets de Armadura
 * 
 * Exibe todos os sets de armadura disponíveis com filtros, busca e ordenação.
 * Permite gerenciar relações (favoritos, coleção, wishlist) para usuários autenticados.
 */

'use client';

// ============================================================================
// IMPORTS
// ============================================================================

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  getSets,
  getPassives,
  getPasses,
  addSetRelation,
  removeSetRelation,
  checkSetRelation,
} from '@/lib/armory';
import { getDefaultImage } from '@/lib/armory/images';
import { useAuth } from '@/contexts/AuthContext';
import type {
  ArmorSet,
  BattlePass,
  RelationType,
  SetRelationStatus,
} from '@/lib/types/armory';
import type {
  OrderingOption,
  CategoryOption,
  SourceOption,
  PassiveOption,
  UpdatingState,
} from './types';

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_ORDERING: OrderingOption = 'name';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Aplica ordenação customizada na lista de sets
 * @param list - Lista de sets a ser ordenada
 * @param ordering - Opção de ordenação
 * @returns Lista ordenada
 */
const applyCustomOrdering = (
  list: ArmorSet[],
  ordering: OrderingOption
): ArmorSet[] => {
  const sortedList = [...list];

  if (ordering === 'cost' || ordering === '-cost') {
    sortedList.sort((a, b) => (a.total_cost || 0) - (b.total_cost || 0));
    if (ordering === '-cost') sortedList.reverse();
  } else if (ordering === 'armor' || ordering === '-armor') {
    sortedList.sort((a, b) => {
      const aArmor =
        typeof a.armor_stats?.armor === 'number' ? a.armor_stats.armor : 0;
      const bArmor =
        typeof b.armor_stats?.armor === 'number' ? b.armor_stats.armor : 0;
      return aArmor - bArmor;
    });
    if (ordering === '-armor') sortedList.reverse();
  } else if (ordering === 'speed' || ordering === '-speed') {
    sortedList.sort((a, b) => {
      const aSpeed =
        typeof a.armor_stats?.speed === 'number' ? a.armor_stats.speed : 0;
      const bSpeed =
        typeof b.armor_stats?.speed === 'number' ? b.armor_stats.speed : 0;
      return aSpeed - bSpeed;
    });
    if (ordering === '-speed') sortedList.reverse();
  } else if (ordering === 'stamina' || ordering === '-stamina') {
    sortedList.sort((a, b) => {
      const aStamina =
        typeof a.armor_stats?.stamina === 'number' ? a.armor_stats.stamina : 0;
      const bStamina =
        typeof b.armor_stats?.stamina === 'number' ? b.armor_stats.stamina : 0;
      return aStamina - bStamina;
    });
    if (ordering === '-stamina') sortedList.reverse();
  }

  return sortedList;
};

/**
 * Limpa todos os filtros, resetando para valores padrão
 */
type ClearFiltersFunction = () => void;

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Componente da página de Armory
 */
export default function ArmoryPage() {
  // ============================================================================
  // HOOKS
  // ============================================================================

  const { user } = useAuth();

  // ============================================================================
  // STATE
  // ============================================================================

  const [sets, setSets] = useState<ArmorSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState<OrderingOption>(DEFAULT_ORDERING);
  const [passives, setPassives] = useState<PassiveOption[]>([]);
  const [passiveId, setPassiveId] = useState<number | ''>('');
  const [category, setCategory] = useState<CategoryOption>('');
  const [source, setSource] = useState<SourceOption>('');
  const [passes, setPasses] = useState<BattlePass[]>([]);
  const [passField, setPassField] = useState<number | ''>('');
  const [relations, setRelations] = useState<
    Record<number, SetRelationStatus>
  >({});
  const [updating, setUpdating] = useState<UpdatingState>({});

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Carrega passes ao montar o componente
   */
  useEffect(() => {
    const fetchPasses = async () => {
      try {
        const passesData = await getPasses();
        setPasses(Array.isArray(passesData) ? passesData : []);
      } catch (error) {
        console.error('Erro ao buscar passes:', error);
        setPasses([]);
      }
    };

    fetchPasses();
  }, []);

  /**
   * Carrega sets e passivas ao montar ou quando filtros mudarem
   */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [setsData, passivesData] = await Promise.all([
          getSets({
            search: search || undefined,
            ordering:
              ordering === 'name' || ordering === '-name'
                ? ordering
                : 'name',
          }),
          getPassives(),
        ]);

        const setsList = Array.isArray(setsData) ? setsData : [];
        setSets(setsList);
        setPassives(
          (passivesData || []).map((p: { id: number; name: string }) => ({
            id: p.id,
            name: p.name,
          }))
        );

        // Carregar relações para cada set se usuário estiver logado
        if (user) {
          const relationsMap: Record<number, SetRelationStatus> = {};
          for (const setItem of setsList) {
            try {
              const relationStatus = await checkSetRelation(setItem.id);
              relationsMap[setItem.id] = relationStatus;
            } catch (error) {
              console.error(
                `Erro ao verificar relação do set ${setItem.id}:`,
                error
              );
              relationsMap[setItem.id] = {
                favorite: false,
                collection: false,
                wishlist: false,
              };
            }
          }
          setRelations(relationsMap);
        }
      } catch (e) {
        console.error('Erro ao buscar sets/passivas:', e);
        setSets([]);
        setPassives([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [search, ordering, user]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Lista de sets filtrados e ordenados para exibição
   */
  const displayedSets = useMemo(() => {
    let list = [...sets];

    // Aplicar filtros
    if (passiveId) {
      list = list.filter((s) => s.passive_detail?.id === passiveId);
    }
    if (category) {
      list = list.filter((s) => s.armor_stats?.category === category);
    }
    if (source) {
      list = list.filter((s) => s.source === source);
    }
    
    // Filtro por passe (herdado da armadura)
    if (passField) {
      list = list.filter((s) => {
        // Verificar se o passe do set (herdado da armadura) corresponde ao filtro
        return s.pass_detail?.id === passField;
      });
    }

    // Aplicar ordenação customizada
    return applyCustomOrdering(list, ordering);
  }, [sets, passiveId, category, source, passField, ordering]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handler para toggle de relação (favorito, coleção, wishlist)
   * Implementa atualização otimista e lógica de exclusão mútua entre coleção e wishlist
   */
  const handleToggleRelation = async (
    e: React.MouseEvent,
    set: ArmorSet,
    relationType: RelationType
  ): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('ACESSO NEGADO. Você precisa estar alistado para usar esta funcionalidade.');
      return;
    }

    const key = `${set.id}-${relationType}`;

    // Evitar múltiplos cliques simultâneos
    if (updating[key] === true) {
      return;
    }

    const currentStatus =
      relations[set.id] ||
      ({ favorite: false, collection: false, wishlist: false } as SetRelationStatus);
    const isActive = currentStatus[relationType];
    const newStatus = !isActive;

    // Marcar como atualizando
    setUpdating((prev) => ({ ...prev, [key]: true }));

    // Preparar novo status (lógica de exclusão mútua)
    const newRelationsStatus: SetRelationStatus = {
      ...currentStatus,
      [relationType]: newStatus,
    };

    // Se está adicionando à coleção, remover da wishlist
    if (relationType === 'collection' && newStatus === true && currentStatus.wishlist === true) {
      newRelationsStatus.wishlist = false;
    }
    // Se está adicionando à wishlist, remover da coleção
    if (relationType === 'wishlist' && newStatus === true && currentStatus.collection === true) {
      newRelationsStatus.collection = false;
    }

    // Atualização otimista - atualiza o estado ANTES da chamada à API
    setRelations((prev) => ({
      ...prev,
      [set.id]: newRelationsStatus,
    }));

    try {
      // Fazer a operação principal
      if (isActive) {
        await removeSetRelation(set.id, relationType);
      } else {
        await addSetRelation(set.id, relationType);
      }

      // Remover relação mútua se necessário
      if (relationType === 'collection' && newStatus === true && currentStatus.wishlist === true) {
        try {
          await removeSetRelation(set.id, 'wishlist');
        } catch (wishlistError) {
          console.error('Erro ao remover da wishlist:', wishlistError);
        }
      }

      if (relationType === 'wishlist' && newStatus === true && currentStatus.collection === true) {
        try {
          await removeSetRelation(set.id, 'collection');
        } catch (collectionError) {
          console.error('Erro ao remover da coleção:', collectionError);
        }
      }
    } catch (error) {
      // Reverter estado em caso de erro
      setRelations((prev) => ({
        ...prev,
        [set.id]: {
          ...currentStatus,
          [relationType]: isActive, // Reverter para o estado anterior
        },
      }));

      console.error('Erro ao atualizar relação:', error);
      const errorMessage =
        (error as { response?: { data?: { detail?: string } }; message?: string })?.response?.data?.detail ||
        (error as { message?: string })?.message ||
        'Erro ao atualizar relação';
      alert(errorMessage);
    } finally {
      // Sempre resetar o estado de updating
      setUpdating((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  /**
   * Handler para mudança do filtro de fonte de aquisição
   * Reseta o filtro de passe quando a fonte não for 'pass'
   */
  const handleSourceChange = (newSource: SourceOption) => {
    setSource(newSource);
    // Se não for 'pass', limpar o filtro de passe
    if (newSource !== 'pass') {
      setPassField('');
    }
  };

  /**
   * Limpa todos os filtros, resetando para valores padrão
   */
  const handleClearFilters: ClearFiltersFunction = () => {
    setSearch('');
    setOrdering(DEFAULT_ORDERING);
    setPassiveId('');
    setCategory('');
    setSource('');
    setPassField('');
  };

  // ============================================================================
  // EARLY RETURNS
  // ============================================================================

  // Não há early returns necessários nesta página

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="container page-content">
        {/* Título da página */}
        <div className="content-section">
          <h1 
            className="text-4xl font-bold mb-2 uppercase tracking-wider"
            style={{
              fontFamily: 'Orbitron, sans-serif',
              color: 'var(--text-primary)',
              textShadow: '0 0 15px rgba(0,217,255,0.8)',
            }}
          >
            CONFIGURAÇÕES DE COMBATE
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Conjuntos completos de equipamento para servir a Democracia™
          </p>
        </div>

        {/* Filtros */}
        <Card className="content-section" glowColor="cyan">
          <h3 
            className="mb-4 uppercase tracking-wider"
            style={{
              fontFamily: 'Rajdhani, sans-serif',
              color: 'var(--holo-cyan)',
              textShadow: '0 0 10px rgba(0,217,255,0.5)',
            }}
          >
            PARÂMETROS DE BUSCA
          </h3>
          <div className="grid md:grid-cols-5 gap-4 mb-4">
            {/* Busca por nome */}
            <div>
              <Input
                label="BUSCAR NO ARSENAL"
                type="text"
                placeholder="BUSCAR NO ARSENAL DA SUPER EARTH"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Ordenação */}
            <div>
              <label 
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  color: 'var(--holo-cyan)',
                }}
              >
                ORDENAÇÃO
              </label>
              <select
                value={ordering}
                onChange={(e) =>
                  setOrdering(e.target.value as OrderingOption)
                }
                className="w-full px-4 py-2 border-2 border-[var(--border-primary)] bg-[rgba(26,35,50,0.5)] text-[var(--text-primary)] outline-none transition-all"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                }}
              >
                <option value="name">Nome (A-Z)</option>
                <option value="-name">Nome (Z-A)</option>
                <option value="cost">Valor total (Menor)</option>
                <option value="-cost">Valor total (Maior)</option>
                <option value="armor">Classificação (Menor)</option>
                <option value="-armor">Classificação (Maior)</option>
                <option value="speed">Velocidade (Menor)</option>
                <option value="-speed">Velocidade (Maior)</option>
                <option value="stamina">Regeneração (Menor)</option>
                <option value="-stamina">Regeneração (Maior)</option>
              </select>
            </div>

            {/* Filtro por passiva */}
            <div>
              <label 
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  color: 'var(--holo-cyan)',
                }}
              >
                PASSIVA
              </label>
              <select
                value={passiveId}
                onChange={(e) =>
                  setPassiveId(e.target.value ? Number(e.target.value) : '')
                }
                className="w-full px-4 py-2 border-2 border-[var(--border-primary)] bg-[rgba(26,35,50,0.5)] text-[var(--text-primary)] outline-none transition-all"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                }}
              >
                <option value="">Todas as passivas</option>
                {passives.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por categoria */}
            <div>
              <label 
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  color: 'var(--holo-cyan)',
                }}
              >
                CATEGORIA
              </label>
              <select
                value={category}
                onChange={(e) =>
                  setCategory((e.target.value as CategoryOption) || '')
                }
                className="w-full px-4 py-2 border-2 border-[var(--border-primary)] bg-[rgba(26,35,50,0.5)] text-[var(--text-primary)] outline-none transition-all"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                }}
              >
                <option value="">Todas as categorias</option>
                <option value="light">Leve</option>
                <option value="medium">Médio</option>
                <option value="heavy">Pesado</option>
              </select>
            </div>

            {/* Filtro por fonte */}
            <div>
              <label 
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  color: 'var(--holo-cyan)',
                }}
              >
                FONTE
              </label>
              <select
                value={source}
                onChange={(e) =>
                  handleSourceChange((e.target.value as SourceOption) || '')
                }
                className="w-full px-4 py-2 border-2 border-[var(--border-primary)] bg-[rgba(26,35,50,0.5)] text-[var(--text-primary)] outline-none transition-all"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                }}
              >
                <option value="">Todas as fontes</option>
                <option value="store">Loja</option>
                <option value="pass">Passe</option>
              </select>
            </div>
          </div>

          {/* Filtro de Passe - aparece apenas quando source === 'pass' */}
          {source === 'pass' && (
            <div className="mb-4">
              <label 
                className="block text-xs font-bold uppercase tracking-wider mb-2"
                style={{
                  fontFamily: 'Rajdhani, sans-serif',
                  color: 'var(--holo-cyan)',
                }}
              >
                PASSE ESPECÍFICO
              </label>
              <select
                value={passField}
                onChange={(e) =>
                  setPassField(e.target.value ? Number(e.target.value) : '')
                }
                className="w-full px-4 py-2 border-2 border-[var(--border-primary)] bg-[rgba(26,35,50,0.5)] text-[var(--text-primary)] outline-none transition-all"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                }}
              >
                <option value="">Todos os passes</option>
                {passes.map((pass) => (
                  <option key={pass.id} value={pass.id}>
                    {pass.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button variant="outline" onClick={handleClearFilters}>
            LIMPAR FILTROS
          </Button>
        </Card>

        {/* Resultados */}
        {loading ? (
          <div className="text-center py-12">
            <div 
              className="inline-block animate-spin rounded-full h-12 w-12 border-2"
              style={{
                borderTopColor: 'var(--holo-cyan)',
                borderRightColor: 'transparent',
                borderBottomColor: 'transparent',
                borderLeftColor: 'transparent',
                boxShadow: '0 0 20px rgba(0,217,255,0.5)',
              }}
            ></div>
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>
              TRANSMISSÃO INCOMING...
            </p>
          </div>
        ) : displayedSets.length === 0 ? (
          <Card className="text-center py-12" glowColor="cyan">
            <p style={{ color: 'var(--text-secondary)' }}>
              EQUIPAMENTO NÃO LOCALIZADO. Tente outras especificações.
            </p>
          </Card>
        ) : (
          <>
            <p 
              className="text-sm mb-6 uppercase tracking-wider content-section"
              style={{
                fontFamily: 'Rajdhani, sans-serif',
                color: 'var(--text-secondary)',
              }}
            >
              {displayedSets.length} CONFIGURAÇÃO(ÕES) TÁTICA(S) DETECTADA(S)
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedSets.map((set) => {
                const relationStatus =
                  relations[set.id] ||
                  ({
                    favorite: false,
                    collection: false,
                    wishlist: false,
                  } as SetRelationStatus);

                return (
                  <Card key={set.id} className="transition-all" glowColor="cyan">
                      {/* Imagem do set */}
                      <div 
                        className="relative h-40 overflow-hidden"
                        style={{
                          backgroundColor: 'var(--bg-tertiary)',
                          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
                        }}
                      >
                        <img
                          src={set.image || getDefaultImage('set')}
                          alt={set.name}
                          className="w-full h-full object-cover"
                        />

                        {/* Botões de ação (favorito, coleção, wishlist) */}
                        {user && (
                          <div className="absolute top-2 right-2 flex flex-col gap-2">
                            {/* Botão Favorito */}
                            <button
                              onClick={(e) =>
                                handleToggleRelation(e, set, 'favorite')
                              }
                              disabled={
                                updating[`${set.id}-favorite`] === true
                              }
                              className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                                relationStatus.favorite ? 'scale-110' : ''
                              }`}
                              title={
                                relationStatus.favorite
                                  ? 'Remover dos favoritos'
                                  : 'Adicionar aos favoritos'
                              }
                            >
                              {updating[`${set.id}-favorite`] === true ? (
                                <svg
                                  className="w-5 h-5 text-yellow-500 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className={`w-5 h-5 transition-all duration-200 ${
                                    relationStatus.favorite
                                      ? 'text-yellow-500 fill-current'
                                      : 'text-gray-400'
                                  }`}
                                  fill={
                                    relationStatus.favorite
                                      ? 'currentColor'
                                      : 'none'
                                  }
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                  />
                                </svg>
                              )}
                            </button>

                            {/* Botão Coleção */}
                            <button
                              onClick={(e) =>
                                handleToggleRelation(e, set, 'collection')
                              }
                              disabled={
                                updating[`${set.id}-collection`] === true
                              }
                              className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                                relationStatus.collection ? 'scale-110' : ''
                              }`}
                              title={
                                relationStatus.collection
                                  ? 'Remover da coleção'
                                  : 'Adicionar à coleção'
                              }
                            >
                              {updating[`${set.id}-collection`] === true ? (
                                <svg
                                  className="w-5 h-5 text-blue-500 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className={`w-5 h-5 transition-all duration-200 ${
                                    relationStatus.collection
                                      ? 'text-blue-500 fill-current'
                                      : 'text-gray-400'
                                  }`}
                                  fill={
                                    relationStatus.collection
                                      ? 'currentColor'
                                      : 'none'
                                  }
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                  />
                                </svg>
                              )}
                            </button>

                            {/* Botão Wishlist */}
                            <button
                              onClick={(e) =>
                                handleToggleRelation(e, set, 'wishlist')
                              }
                              disabled={
                                updating[`${set.id}-wishlist`] === true
                              }
                              className={`p-2 bg-white rounded-full shadow-md hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                                relationStatus.wishlist ? 'scale-110' : ''
                              }`}
                              title={
                                relationStatus.wishlist
                                  ? 'Remover da lista de desejo'
                                  : 'Adicionar à lista de desejo'
                              }
                            >
                              {updating[`${set.id}-wishlist`] === true ? (
                                <svg
                                  className="w-5 h-5 text-green-500 animate-spin"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className={`w-5 h-5 transition-all duration-200 ${
                                    relationStatus.wishlist
                                      ? 'text-green-500 fill-current'
                                      : 'text-gray-400'
                                  }`}
                                  fill={
                                    relationStatus.wishlist
                                      ? 'currentColor'
                                      : 'none'
                                  }
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Informações do set */}
                      <div className="p-4">
                        {/* Nome e Categoria */}
                        <div className="mb-3">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 
                              className="text-base font-bold uppercase tracking-wide flex-1"
                              style={{
                                fontFamily: 'Rajdhani, sans-serif',
                                color: 'var(--text-primary)',
                                textShadow: '0 0 8px rgba(0,217,255,0.4)',
                                lineHeight: '1.3',
                              }}
                            >
                              {set.name}
                            </h3>
                            {set.armor_stats?.category_display && (
                              <span 
                                className="px-2 py-0.5 text-xs font-bold uppercase whitespace-nowrap"
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

                        {/* Stats resumidos */}
                        {set.armor_stats && (
                          <div className="grid grid-cols-3 gap-1.5 mb-3">
                            <div 
                              className="py-1.5 px-1 text-center"
                              style={{
                                backgroundColor: 'rgba(26,35,50,0.5)',
                                clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 0 100%)',
                              }}
                            >
                              <p 
                                className="text-xs uppercase tracking-wide mb-0.5"
                                style={{
                                  color: 'var(--text-muted)',
                                  fontFamily: 'Rajdhani, sans-serif',
                                  fontSize: '0.65rem',
                                }}
                              >
                                ARM
                              </p>
                              <p 
                                className="font-bold text-sm"
                                style={{
                                  color: 'var(--holo-cyan)',
                                  fontFamily: 'Rajdhani, sans-serif',
                                }}
                              >
                                {set.armor_stats.armor}
                              </p>
                            </div>
                            <div 
                              className="py-1.5 px-1 text-center"
                              style={{
                                backgroundColor: 'rgba(26,35,50,0.5)',
                                clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 0 100%)',
                              }}
                            >
                              <p 
                                className="text-xs uppercase tracking-wide mb-0.5"
                                style={{
                                  color: 'var(--text-muted)',
                                  fontFamily: 'Rajdhani, sans-serif',
                                  fontSize: '0.65rem',
                                }}
                              >
                                VEL
                              </p>
                              <p 
                                className="font-bold text-sm"
                                style={{
                                  color: 'var(--holo-cyan)',
                                  fontFamily: 'Rajdhani, sans-serif',
                                }}
                              >
                                {set.armor_stats.speed}
                              </p>
                            </div>
                            <div 
                              className="py-1.5 px-1 text-center"
                              style={{
                                backgroundColor: 'rgba(26,35,50,0.5)',
                                clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 0 100%)',
                              }}
                            >
                              <p 
                                className="text-xs uppercase tracking-wide mb-0.5"
                                style={{
                                  color: 'var(--text-muted)',
                                  fontFamily: 'Rajdhani, sans-serif',
                                  fontSize: '0.65rem',
                                }}
                              >
                                STA
                              </p>
                              <p 
                                className="font-bold text-sm"
                                style={{
                                  color: 'var(--holo-cyan)',
                                  fontFamily: 'Rajdhani, sans-serif',
                                }}
                              >
                                {set.armor_stats.stamina}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Custo Total e Botão */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span 
                              className="text-xs font-semibold uppercase tracking-wide"
                              style={{
                                color: 'var(--text-muted)',
                                fontFamily: 'Rajdhani, sans-serif',
                              }}
                            >
                              Custo
                            </span>
                            <span 
                              className="text-lg font-bold"
                              style={{
                                color: 'var(--democracy-gold)',
                                fontFamily: 'Rajdhani, sans-serif',
                                textShadow: '0 0 8px rgba(212,175,55,0.4)',
                              }}
                            >
                              {(set.total_cost || 0).toLocaleString('pt-BR')}{' '}
                              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                {set.source === 'pass' ? 'MED' : 'SC'}
                              </span>
                            </span>
                          </div>
                          <Link href={`/armory/sets/${set.id}`}>
                            <Button fullWidth size="sm" className="mt-1">
                              VER DETALHES
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                );
              })}
            </div>
          </>
        )}
    </div>
  );
}
