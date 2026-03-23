import { pool } from './lib/db';

async function test() {
    try {
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log("TABLES: " + res.rows.map(r => r.table_name).join(', '));
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

test();
