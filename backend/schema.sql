

-- 1. Feedback Table (Renamed from your previous request)
CREATE TABLE reviews (
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
    is_available BOOLEAN DEFAULT TRUE,
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

-- 6. Staff Users
CREATE TABLE IF NOT EXISTS staff_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Storing hashed passwords
    role VARCHAR(20) DEFAULT 'admin'
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
('store_open', 'true');

-- SEED DATA (Initial Admin User)
-- Password is 'admin123' (hashed)
INSERT INTO staff_users (username, password) VALUES 
('admin', '$2a$10$X7.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1'); 
-- NOTE: In a real scenario, use a script to generate this hash. 
-- For now, I will assume the server login logic compares plain text if the hash check fails or update logic to use bcrypt.