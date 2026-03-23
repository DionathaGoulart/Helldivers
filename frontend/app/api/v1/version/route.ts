import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get the latest updated_at from a reliable primary table
    const result = await pool.query(`SELECT MAX(updated_at) as last_update FROM armory_armor`);

    const lastUpdate = result.rows[0]?.last_update;
    
    // Fallback if no data or column doesn't exist
    const version = lastUpdate 
      ? new Date(lastUpdate).toISOString() 
      : new Date().toISOString(); 

    return NextResponse.json({ updated_at: version });
  } catch (error: any) {
    console.error('[API] /api/v1/version FAILED:', error);
    
    // Return a valid fallback to prevent app crash
    return NextResponse.json({ 
      updated_at: new Date().toISOString().split('T')[0]
    });
  }
}
