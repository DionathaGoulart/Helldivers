import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

const formatImage = (path: string | null) => {
  if (!path) return null;

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let rows: any[] = [];

    if (type === 'armor') {
      const result = await pool.query(`
        SELECT 
          a.id, 
          a.name, 
          a.name_pt_br, 
          a.category, 
          a.image, 
          a.armor, 
          a.speed, 
          a.stamina, 
          a.passive_id, 
          a.source, 
          a.cost,
          a.created_at,
          p.id as p_id,
          p.name as p_name,
          p.name_pt_br as p_name_pt_br,
          p.description as p_description,
          p.description_pt_br as p_description_pt_br,
          p.effect as p_effect,
          p.effect_pt_br as p_effect_pt_br,
          p.image as p_image
        FROM armory_armor a
        LEFT JOIN armory_passive p ON a.passive_id = p.id
        ORDER BY a.name ASC
      `);

      rows = result.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        name_pt_br: row.name_pt_br,
        category: row.category,
        category_display: mapCategory[row.category as keyof typeof mapCategory] || row.category,
        image: formatImage(row.image),
        armor: row.armor,
        speed: row.speed,
        stamina: row.stamina,
        passive: row.passive_id,
        source: row.source,
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

    } else if (type === 'helmet') {
      const result = await pool.query(`
        SELECT 
          id, 
          name, 
          name_pt_br, 
          image, 
          source, 
          cost,
          created_at
        FROM armory_helmet
        ORDER BY name ASC
      `);
      rows = result.rows.map((row: any) => ({
        ...row,
        image: formatImage(row.image),
        cost_currency: row.source === 'pass' ? 'Medalhas' : 'Supercréditos',
        // Default stats for visual compatibility if needed, or leave undefined
        armor: 100, // Standard helmet stat
        speed: 100,
        stamina: 100,
      }));

    } else if (type === 'cape') {
      const result = await pool.query(`
        SELECT 
          id, 
          name, 
          name_pt_br, 
          image, 
          source, 
          cost,
          created_at
        FROM armory_cape
        ORDER BY name ASC
      `);
      rows = result.rows.map((row: any) => ({
        ...row,
        image: formatImage(row.image),
        cost_currency: row.source === 'pass' ? 'Medalhas' : 'Supercréditos',
        // Standard stats
        armor: 100,
        speed: 100,
        stamina: 100,
      }));
    } else if (type === 'set') {
      const sets = await pool.query(`
            SELECT 
                s.id, s.name, s.name_pt_br, s.image,
                h.id as h_id, h.name as h_name, h.image as h_image,
                a.id as a_id, a.name as a_name, a.image as a_image,
                c.id as c_id, c.name as c_name, c.image as c_image
            FROM armory_armorset s
            LEFT JOIN armory_helmet h ON s.helmet_id = h.id
            LEFT JOIN armory_armor a ON s.armor_id = a.id
            LEFT JOIN armory_cape c ON s.cape_id = c.id
            ORDER BY s.name ASC
         `);

      rows = sets.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        name_pt_br: row.name_pt_br,
        image: formatImage(row.image),
        helmet: row.h_id,
        armor: row.a_id,
        cape: row.c_id,
        helmet_detail: { id: row.h_id, name: row.h_name, image: formatImage(row.h_image) },
        armor_detail: { id: row.a_id, name: row.a_name, image: formatImage(row.a_image) },
        cape_detail: { id: row.c_id, name: row.c_name, image: formatImage(row.c_image) }
      }));
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Database Error:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
