

-- 1. Feedback Table (Renamed from your previous request)
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    feedback TEXT NOT NULL,
    rating INTEGER DEFAULT 5,
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
    is_available BOOLEAN DEFAULT TRUE
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Order Items (Linking orders to menu items)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER REFERENCES menu_items(id),
    quantity INTEGER NOT NULL,
    item_price_at_time DECIMAL(10, 2) NOT NULL
);

-- 5. Admin Configuration
CREATE TABLE IF NOT EXISTS site_config (
    config_key VARCHAR(50) PRIMARY KEY,
    config_value TEXT
);

-- SEED DATA (Initial Menu based on your JSON)
INSERT INTO menu_items (name, description, price, category) VALUES
('Classic', 'Classic please! Marshmallow slightly browned, Graham Cracker, Milk Chocolate.', 3.00, 'Smore'),
('The Ashley', 'White chocolate, white chocolate Kit Kats. (Allergy Safe: No Dark Choc)', 4.50, 'Smore'),
('The Aunt Mimi', 'Salted Caramel coconut with shortbread cookies.', 5.00, 'Smore'),
('The Abby (Coco)', 'Coconut cookies with marshmallow fluff and white chocolate chips.', 4.50, 'Smore'),
('The Abby (B-Day)', 'Birthday cake Kit Kat, golden Oreo, and rainbow sprinkles.', 5.00, 'Smore'),
('The Abby (Mint)', 'Mint Oreos base, marshmallow fluff, crushed thin Oreos, chocolate chips.', 5.00, 'Smore'),
('White Choco Reese''s', 'Graham cracker with White Chocolate Reese''s cup.', 4.00, 'Smore');

-- SEED DATA (Initial Config)
INSERT INTO site_config (config_key, config_value) VALUES
('store_open', 'true'),
('admin_password', 'gateway2'); -- Change this in production!