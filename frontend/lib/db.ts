import { Pool } from 'pg';

// Debug Logging
const rawUrl = process.env.DATABASE_URL;

if (!rawUrl) {
    throw new Error('DATABASE_URL is not defined');
}

// Sanitize URL if needed, but pg usually handles standard connection strings well
// keeping it clean just in case
const cleanUrl = rawUrl.replace(/&channel_binding=[^&]+/, '');

// Create a singleton pool instance
let pool: Pool;

// Typescript global for caching pool in dev
declare global {
    var postgresPool: Pool | undefined;
}

if (process.env.NODE_ENV === 'production') {
    pool = new Pool({
        connectionString: cleanUrl,
        ssl: {
            rejectUnauthorized: false // Often needed for Neon/Cloud hostings if certificates aren't perfect
        }
    });
} else {
    // In development, verify if we already have a pool to prevent exhaustion during hot reloads
    if (!global.postgresPool) {
        global.postgresPool = new Pool({
            connectionString: cleanUrl,
            ssl: {
                rejectUnauthorized: false // Relax SSL for development ease with Neon
            }
        });
    }
    pool = global.postgresPool;
}

export { pool };
