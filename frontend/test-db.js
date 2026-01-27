const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

async function testConnection() {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) {
        console.error("DATABASE_URL is missing!");
        return;
    }

    // Sanitize just like in lib/db.ts
    const cleanUrl = rawUrl.replace(/&channel_binding=[^&]+/, '');

    console.log("Testing connection with pg...");

    const pool = new Pool({
        connectionString: cleanUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("Querying armory_armor image example...");
        const res = await pool.query('SELECT image FROM armory_armor LIMIT 1');
        console.log("Armor Image:", res.rows[0]);
    } catch (e) {
        console.error("Query failed:", e);
    } finally {
        await pool.end();
    }
}

testConnection();
