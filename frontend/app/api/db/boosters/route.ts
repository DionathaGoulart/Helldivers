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

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        name_pt_br, 
        icon, 
        description,
        description_pt_br,
        cost
      FROM booster_booster
      ORDER BY name ASC
    `);

    const formatted = result.rows.map((row: any) => ({
      ...row,
      icon: formatImage(row.icon),
      image: formatImage(row.icon)
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
