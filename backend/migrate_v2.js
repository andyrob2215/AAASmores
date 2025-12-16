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
        console.log("Starting Migration V2...");
        
        // Add phone_number column
        console.log("Adding phone_number column to orders...");
        await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);");

        console.log("Migration V2 Successfully Completed.");
    } catch (e) {
        console.error("Migration V2 Failed:", e);
    } finally {
        pool.end();
    }
};

migrate();