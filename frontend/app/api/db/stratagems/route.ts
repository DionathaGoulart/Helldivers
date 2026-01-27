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

const departmentMap: Record<string, string> = {
  'Patriotic Administration Center': 'Centro de Administração Patriótica',
  'Orbital Cannons': 'Canhões Orbitais',
  'Hangar': 'Hangar',
  'Bridge': 'Ponte',
  'Engineering Bay': 'Baia de Engenharia',
  'Robotics Workshop': 'Oficina de Robótica',
};

// Fallback helper in case of new departments or mismatched keys
const getDepartmentDisplay = (dept: string) => {
  return departmentMap[dept] || dept;
};

export async function GET() {
  // console.log('[API] /api/db/stratagems hit');
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        name_pt_br, 
        department,
        icon, 
        codex, 
        cooldown, 
        cost, 
        unlock_level,
        description,
        description_pt_br,
        has_backpack,
        is_tertiary_weapon,
        is_mecha,
        is_turret,
        is_vehicle
      FROM stratagems_stratagem
      ORDER BY name ASC
    `);
    // console.log('[API] /api/db/stratagems success, rows:', result.rowCount);

    const formatted = result.rows.map((row: any) => ({
      ...row,
      department_display: getDepartmentDisplay(row.department),
      icon: formatImage(row.icon),
      image: formatImage(row.icon)
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('[API] /api/db/stratagems FAILED:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
