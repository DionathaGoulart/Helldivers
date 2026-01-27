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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let result;

    if (type === 'primary') {
      result = await pool.query(`
        SELECT 
          id, 
          name, 
          name_pt_br, 
          image, 
          damage_value, 
          damage_type, 
          max_penetration, 
          weapon_type,
          source, 
          cost
        FROM weaponry_primaryweapon
        ORDER BY name ASC
      `);
    } else if (type === 'secondary') {
      result = await pool.query(`
        SELECT 
          id, 
          name, 
          name_pt_br, 
          image, 
          damage_value, 
          damage_type, 
          max_penetration, 
          weapon_type,
          source, 
          cost
        FROM weaponry_secondaryweapon
        ORDER BY name ASC
      `);
    } else if (type === 'throwable') {
      result = await pool.query(`
        SELECT 
          id, 
          name, 
          name_pt_br, 
          image, 
          damage_value, 
          damage_type, 
          max_penetration, 
          weapon_type,
          source, 
          cost
        FROM weaponry_throwable
        ORDER BY name ASC
      `);
    } else {
      return NextResponse.json({ error: 'Missing or invalid type parameter' }, { status: 400 });
    }

    // Apply formatting
    const formatted = result.rows.map((row: any) => ({
      ...row,
      image: formatImage(row.image)
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('Database Error:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
