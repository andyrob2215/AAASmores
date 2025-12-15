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
        console.log("Starting Migration...");
        
        // 1. Add payment_method to orders
        console.log("Adding payment_method column...");
        await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'cash';");
        
        // 2. Add coupon_code to orders
        console.log("Adding coupon_code column...");
        await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);");

        // 3. Add default cash_unlock_code to site_config
        console.log("Adding default cash_unlock_code...");
        await pool.query("INSERT INTO site_config (config_key, config_value) VALUES ('cash_unlock_code', 'familycash') ON CONFLICT (config_key) DO NOTHING;");

        console.log("Migration Successfully Completed.");
    } catch (e) {
        console.error("Migration Failed:", e);
    } finally {
        pool.end();
    }
};

migrate();