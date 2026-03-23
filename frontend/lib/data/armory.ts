import { pool } from '@/lib/db';
import type { Armor, Helmet, Cape, ArmorSet, Passive, BattlePass, Booster, Stratagem } from '@/lib/types/armory';
import type { AnyWeapon, WeaponCategory } from '@/lib/types/weaponry';

const formatImage = (path: string | null): string | undefined => {
  if (!path) return undefined;

  // Strip backend base URLs if present (dirty data)
  let cleanPath = path.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?/, '');

  // Clean up potential double slashes
  if (cleanPath.startsWith('media/')) cleanPath = `/${cleanPath}`;

  // If it's a relative path (not starting with /media/ or http), prepend /media/
  if (!cleanPath.startsWith('/media/') && !cleanPath.startsWith('http')) {
    return `/media/${cleanPath}`;
  }

  return cleanPath;
};

const mapCategory = {
  'light': 'Leve',
  'medium': 'Médio',
  'heavy': 'Pesado',
} as const;

export async function getArmorsData(): Promise<Armor[]> {
  const result = await pool.query(`
    SELECT 
      a.id, a.name, a.name_pt_br, a.category, a.image, a.armor, a.speed, a.stamina, a.passive_id, a.source, a.cost, a.created_at,
      p.id as p_id, p.name as p_name, p.name_pt_br as p_name_pt_br, p.description as p_description, p.description_pt_br as p_description_pt_br, p.effect as p_effect, p.effect_pt_br as p_effect_pt_br, p.image as p_image
    FROM armory_armor a
    LEFT JOIN armory_passive p ON a.passive_id = p.id
    ORDER BY a.name ASC
  `);

  return result.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    name_pt_br: row.name_pt_br,
    category: row.category,
    category_display: mapCategory[row.category as keyof typeof mapCategory] || row.category,
    image: formatImage(row.image),
    armor: row.armor,
    armor_display: row.armor?.toString() || 'N/A',
    speed: row.speed,
    speed_display: row.speed?.toString() || 'N/A',
    stamina: row.stamina,
    stamina_display: row.stamina?.toString() || 'N/A',
    passive: row.passive_id,
    source: row.source,
    source_display: row.source === 'pass' ? 'Passe' : 'Super Loja',
    cost: row.cost,
    cost_currency: row.source === 'pass' ? 'Medalhas' : 'Supercréditos',
    passive_detail: row.p_id ? {
      id: row.p_id,
      name: row.p_name,
      name_pt_br: row.p_name_pt_br,
      description: row.p_description,
      description_pt_br: row.p_description_pt_br,
      effect: row.p_effect,
      effect_pt_br: row.p_effect_pt_br,
      image: formatImage(row.p_image)
    } : undefined
  }));
}

export async function getHelmetsData(): Promise<Helmet[]> {
  const result = await pool.query(`
    SELECT id, name, name_pt_br, image, source, cost, created_at
    FROM armory_helmet
    ORDER BY name ASC
  `);
  return result.rows.map((row: any) => ({
    ...row,
    image: formatImage(row.image),
    cost_currency: row.source === 'pass' ? 'Medalhas' : 'Supercréditos',
    armor: 100,
    speed: 100,
    stamina: 100,
  }));
}

export async function getCapesData(): Promise<Cape[]> {
  const result = await pool.query(`
    SELECT id, name, name_pt_br, image, source, cost, created_at
    FROM armory_cape
    ORDER BY name ASC
  `);
  return result.rows.map((row: any) => ({
    ...row,
    image: formatImage(row.image),
    cost_currency: row.source === 'pass' ? 'Medalhas' : 'Supercréditos',
    armor: 100,
    speed: 100,
    stamina: 100,
  }));
}

export async function getSetsData(): Promise<ArmorSet[]> {
  const sets = await pool.query(`
    SELECT 
        s.id, s.name, s.name_pt_br, s.image,
        h.id as h_id, h.name as h_name, h.image as h_image,
        a.id as a_id, a.name as a_name, a.image as a_image,
        a.armor, a.speed, a.stamina, a.cost as armor_cost, a.category, a.source,
        p.id as p_id, p.name as p_name, p.name_pt_br as p_name_pt_br, p.effect as p_effect, p.effect_pt_br as p_effect_pt_br, p.image as p_image, p.description as p_description, p.description_pt_br as p_description_pt_br,
        c.id as c_id, c.name as c_name, c.image as c_image, c.cost as cape_cost, h.cost as helmet_cost
    FROM armory_armorset s
    LEFT JOIN armory_helmet h ON s.helmet_id = h.id
    LEFT JOIN armory_armor a ON s.armor_id = a.id
    LEFT JOIN armory_passive p ON a.passive_id = p.id
    LEFT JOIN armory_cape c ON s.cape_id = c.id
    ORDER BY s.name ASC
  `);

  return sets.rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    name_pt_br: row.name_pt_br,
    image: formatImage(row.image),
    helmet: row.h_id,
    armor: row.a_id,
    cape: row.c_id,
    helmet_detail: { id: row.h_id, name: row.h_name, image: formatImage(row.h_image), cost: row.helmet_cost } as any as Helmet,
    armor_detail: { id: row.a_id, name: row.a_name, image: formatImage(row.a_image), cost: row.armor_cost } as any as Armor,
    cape_detail: (row.c_id ? { id: row.c_id, name: row.c_name, image: formatImage(row.c_image), cost: row.cape_cost } : undefined) as any as Cape,
    armor_stats: {
        armor: row.armor,
        speed: row.speed,
        stamina: row.stamina,
        category: row.category,
    },
    passive_detail: row.p_id ? {
        id: row.p_id,
        name: row.p_name,
        name_pt_br: row.p_name_pt_br,
        description: row.p_description,
        description_pt_br: row.p_description_pt_br,
        effect: row.p_effect,
        effect_pt_br: row.p_effect_pt_br,
        image: formatImage(row.p_image)
    } : undefined,
    total_cost: (row.helmet_cost || 0) + (row.armor_cost || 0) + (row.cape_cost || 0),
    source: row.source
  }));
}

export async function getPassivesData(): Promise<Passive[]> {
  const result = await pool.query(`
    SELECT id, name, name_pt_br, description, description_pt_br, effect, effect_pt_br, image
    FROM armory_passive
    ORDER BY name ASC
  `);
  return result.rows.map((row: any) => ({
    ...row,
    image: formatImage(row.image),
  }));
}

export async function getPassesData(): Promise<BattlePass[]> {
  const result = await pool.query(`
    SELECT id, name, name_pt_br, image, custo_supercreditos as cost, created_at
    FROM warbonds_warbond
    ORDER BY created_at ASC
  `);
  return result.rows.map((row: any) => ({
    ...row,
    image: formatImage(row.image),
  }));
}

export async function getSetData(id: number): Promise<ArmorSet | null> {
  const setRes = await pool.query(`
    SELECT 
        s.id, s.name, s.name_pt_br, s.image,
        h.id as h_id, h.name as h_name, h.image as h_image, h.cost as helmet_cost, h.source as h_source,
        a.id as a_id, a.name as a_name, a.image as a_image,
        a.armor, a.speed, a.stamina, a.cost as armor_cost, a.category, a.source as a_source,
        p.id as p_id, p.name as p_name, p.name_pt_br as p_name_pt_br, p.effect as p_effect, p.effect_pt_br as p_effect_pt_br, p.image as p_image, p.description as p_description, p.description_pt_br as p_description_pt_br,
        c.id as c_id, c.name as c_name, c.image as c_image, c.cost as cape_cost, c.source as c_source
    FROM armory_armorset s
    LEFT JOIN armory_helmet h ON s.helmet_id = h.id
    LEFT JOIN armory_armor a ON s.armor_id = a.id
    LEFT JOIN armory_passive p ON a.passive_id = p.id
    LEFT JOIN armory_cape c ON s.cape_id = c.id
    WHERE s.id = $1
  `, [id]);

  if (setRes.rows.length === 0) return null;
  
  const row = setRes.rows[0];
  return {
    id: row.id,
    name: row.name,
    name_pt_br: row.name_pt_br,
    image: formatImage(row.image),
    helmet: row.h_id,
    armor: row.a_id,
    cape: row.c_id,
    helmet_detail: { id: row.h_id, name: row.h_name, image: formatImage(row.h_image), cost: row.helmet_cost, cost_currency: row.h_source === 'pass' ? 'Medalhas' : 'Supercréditos' } as any as Helmet,
    armor_detail: { id: row.a_id, name: row.a_name, image: formatImage(row.a_image), cost: row.armor_cost, armor: row.armor, speed: row.speed, stamina: row.stamina, cost_currency: row.a_source === 'pass' ? 'Medalhas' : 'Supercréditos' } as any as Armor,
    cape_detail: (row.c_id ? { id: row.c_id, name: row.c_name, image: formatImage(row.c_image), cost: row.cape_cost, cost_currency: row.c_source === 'pass' ? 'Medalhas' : 'Supercréditos' } : undefined) as any as Cape,
    armor_stats: {
        armor: row.armor,
        speed: row.speed,
        stamina: row.stamina,
        category: row.category,
        category_display: mapCategory[row.category as keyof typeof mapCategory] || row.category,
    },
    passive_detail: row.p_id ? {
        id: row.p_id,
        name: row.p_name,
        name_pt_br: row.p_name_pt_br,
        description: row.p_description,
        description_pt_br: row.p_description_pt_br,
        effect: row.p_effect,
        effect_pt_br: row.p_effect_pt_br,
        image: formatImage(row.p_image)
    } : undefined,
    total_cost: (row.helmet_cost || 0) + (row.armor_cost || 0) + (row.cape_cost || 0),
    source: row.a_source
  };
}

export async function getBoostersData(): Promise<Booster[]> {
  const result = await pool.query(`
    SELECT id, name, name_pt_br, icon, description, description_pt_br, cost
    FROM booster_booster
    ORDER BY name ASC
  `);

  return result.rows.map((row: any) => ({
    ...row,
    icon: formatImage(row.icon),
    image: formatImage(row.icon)
  }));
}

const departmentMap: Record<string, string> = {
  'Patriotic Administration Center': 'Centro de Administração Patriótica',
  'Orbital Cannons': 'Canhões Orbitais',
  'Hangar': 'Hangar',
  'Bridge': 'Ponte',
  'Engineering Bay': 'Baia de Engenharia',
  'Robotics Workshop': 'Oficina de Robótica',
};

export async function getStratagemsData(): Promise<Stratagem[]> {
  const result = await pool.query(`
    SELECT 
      id, name, name_pt_br, department, icon, codex, cooldown, cost, unlock_level,
      description, description_pt_br, has_backpack, is_tertiary_weapon, is_mecha, is_turret, is_vehicle
    FROM stratagems_stratagem
    ORDER BY name ASC
  `);

  return result.rows.map((row: any) => ({
    ...row,
    department_display: departmentMap[row.department] || row.department,
    icon: formatImage(row.icon),
    image: formatImage(row.icon)
  }));
}

export async function getWeaponsData(category: WeaponCategory): Promise<AnyWeapon[]> {
  let table = '';
  if (category === 'primary') table = 'weaponry_primaryweapon';
  else if (category === 'secondary') table = 'weaponry_secondaryweapon';
  else if (category === 'throwable') table = 'weaponry_throwable';
  else throw new Error('Invalid weapon category');

  const result = await pool.query(`
    SELECT id, name, name_pt_br, image, damage_value, damage_type, max_penetration, weapon_type, source, cost
    FROM ${table}
    ORDER BY name ASC
  `);

  return result.rows.map((row: any) => ({
    ...row,
    image: formatImage(row.image)
  }));
}

