/**
 * EXEMPLO DE USO DO SISTEMA DE INTERNACIONALIZAÇÃO (i18n)
 * 
 * Este arquivo mostra como usar as funções de tradução nos componentes.
 * 
 * O sistema detecta automaticamente o idioma do usuário (pt-BR ou en)
 * e retorna o texto apropriado baseado na disponibilidade de tradução.
 */

import { getTranslatedName, getTranslatedDescription, getTranslatedEffect } from './i18n';
import type { Armor, Helmet, Cape, ArmorSet, Passive, BattlePass } from './types/armory';

// ============================================================================
// EXEMPLO 1: Exibir nome de uma armadura
// ============================================================================

function ArmorCard({ armor }: { armor: Armor }) {
  // ✅ CORRETO: Usa a função getTranslatedName
  return (
    <div>
      <h3>{getTranslatedName(armor)}</h3>
      {/* Se o usuário for pt-BR e existir name_pt_br, usa name_pt_br */}
      {/* Caso contrário, usa armor.name */}
    </div>
  );
  
  // ❌ INCORRETO: Não usar diretamente
  // <h3>{armor.name}</h3>
}

// ============================================================================
// EXEMPLO 2: Exibir nome de capacete ou capa
// ============================================================================

function HelmetCard({ helmet }: { helmet: Helmet }) {
  return <h3>{getTranslatedName(helmet)}</h3>;
}

function CapeCard({ cape }: { cape: Cape }) {
  return <h3>{getTranslatedName(cape)}</h3>;
}

// ============================================================================
// EXEMPLO 3: Exibir nome de set
// ============================================================================

function SetCard({ set }: { set: ArmorSet }) {
  return <h3>{getTranslatedName(set)}</h3>;
}

// ============================================================================
// EXEMPLO 4: Exibir passiva (nome, descrição e efeito)
// ============================================================================

function PassiveCard({ passive }: { passive: Passive }) {
  return (
    <div>
      <h4>{getTranslatedName(passive)}</h4>
      <p>{getTranslatedDescription(passive)}</p>
      <p>{getTranslatedEffect(passive)}</p>
    </div>
  );
}

// ============================================================================
// EXEMPLO 5: Exibir nome de passe de batalha
// ============================================================================

function PassCard({ pass }: { pass: BattlePass }) {
  return <h3>{getTranslatedName(pass)}</h3>;
}

// ============================================================================
// EXEMPLO 6: Exibir nome de passiva dentro de uma armadura
// ============================================================================

function ArmorWithPassive({ armor }: { armor: Armor }) {
  return (
    <div>
      <h3>{getTranslatedName(armor)}</h3>
      {armor.passive_detail && (
        <div>
          <p>Passiva: {getTranslatedName(armor.passive_detail)}</p>
          <p>Efeito: {getTranslatedEffect(armor.passive_detail)}</p>
          <p>Descrição: {getTranslatedDescription(armor.passive_detail)}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXEMPLO 7: Exibir nome de passe dentro de uma armadura
// ============================================================================

function ArmorWithPass({ armor }: { armor: Armor }) {
  return (
    <div>
      <h3>{getTranslatedName(armor)}</h3>
      {armor.pass_detail && (
        <p>Passe: {getTranslatedName(armor.pass_detail)}</p>
      )}
    </div>
  );
}

// ============================================================================
// EXEMPLO 8: Exibir set completo com todos os itens
// ============================================================================

function SetDetails({ set }: { set: ArmorSet }) {
  return (
    <div>
      <h2>{getTranslatedName(set)}</h2>
      
      <div>
        <h3>Capacete: {getTranslatedName(set.helmet_detail)}</h3>
        <h3>Armadura: {getTranslatedName(set.armor_detail)}</h3>
        <h3>Capa: {getTranslatedName(set.cape_detail)}</h3>
      </div>
      
      {set.passive_detail && (
        <div>
          <h4>Passiva: {getTranslatedName(set.passive_detail)}</h4>
          <p>{getTranslatedEffect(set.passive_detail)}</p>
        </div>
      )}
      
      {set.pass_detail && (
        <p>Passe: {getTranslatedName(set.pass_detail)}</p>
      )}
    </div>
  );
}

// ============================================================================
// NOTAS IMPORTANTES
// ============================================================================

/**
 * 1. O sistema detecta automaticamente o idioma do navegador do usuário
 * 2. Se o idioma for português (pt, pt-BR, pt-PT), usa os campos _pt_br
 * 3. Caso contrário, usa os campos originais em inglês
 * 4. Se o campo _pt_br não existir ou estiver vazio, usa o campo original
 * 5. As funções são type-safe e funcionam com todos os tipos de armory
 */

