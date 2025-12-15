-- 1. Reviews/Feedback Table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255),
    rating INTEGER,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) DEFAULT 'Smore', -- 'Smore', 'Drink', 'Side'
    image_url TEXT,
    manual_availability BOOLEAN DEFAULT TRUE,
    is_visible BOOLEAN DEFAULT TRUE,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 2a. Ingredients Table
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    is_in_stock BOOLEAN DEFAULT TRUE
);

-- 2b. Menu Recipes (Junction Table with Quantity)
CREATE TABLE IF NOT EXISTS menu_recipes (
    menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
    ingredient_id INTEGER REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    PRIMARY KEY (menu_item_id, ingredient_id)
);

-- 3. Discount Codes Table
CREATE TABLE IF NOT EXISTS discount_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL, -- percent, flat
    value DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    unlocks_cash BOOLEAN DEFAULT false
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled', 'awaiting_payment'
    payment_status VARCHAR(20) DEFAULT 'unpaid', -- 'unpaid', 'paid'
    payment_method VARCHAR(50) DEFAULT 'cash', -- 'cash', 'cashapp', 'venmo', 'cashinperson'
    coupon_code VARCHAR(50),
    notes TEXT,
    tip_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    picked_up BOOLEAN DEFAULT false,
    discount_code_id INTEGER,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    delivery_type VARCHAR(20) DEFAULT 'pickup',
    delivery_location VARCHAR(255),
    completed_at TIMESTAMP
);

-- 5. Order Items (Linking orders to menu items)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id),
    quantity INTEGER NOT NULL,
    item_price_at_time DECIMAL(10, 2) NOT NULL,
    customization_details TEXT
);

-- 6. Admin Configuration
CREATE TABLE IF NOT EXISTS site_config (
    config_key VARCHAR(50) PRIMARY KEY,
    config_value TEXT
);

-- 7. Staff Users
CREATE TABLE IF NOT EXISTS staff_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Storing hashed passwords
    role VARCHAR(20) DEFAULT 'admin'
);

-- SEED DATA (Initial Config)
INSERT INTO site_config (config_key, config_value) VALUES
('deliveries_enabled', 'true'),
('cash_unlock_code', 'familycash')
ON CONFLICT DO NOTHING;

-- SEED DATA (Initial Admin User)
-- Password is 'admin123'
INSERT INTO staff_users (username, password) VALUES 
('admin', 'admin123') ON CONFLICT DO NOTHING;