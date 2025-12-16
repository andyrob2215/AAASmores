const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'admin',
    host: process.env.DB_HOST || '192.168.1.123',
    database: process.env.DB_NAME || 'AAASmores',
    password: process.env.DB_PASSWORD || 'gateway2',
    port: process.env.DB_PORT || 5432,
});

const migrate = async () => {
    try {
        console.log("Starting Migration V3 (GPS Columns)...");
        await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS gps_lat DOUBLE PRECISION;");
        await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS gps_lng DOUBLE PRECISION;");
        console.log("Migration V3 Successfully Completed.");
    } catch (e) {
        console.error("Migration V3 Failed:", e);
    } finally {
        pool.end();
    }
};

migrate();