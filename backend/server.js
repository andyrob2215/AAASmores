const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const port = 3001;

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production';

const pool = new Pool({
    user: process.env.DB_USER || 'admin',
    host: process.env.DB_HOST || '192.168.1.123',
    database: process.env.DB_NAME || 'AAASmores',
    password: process.env.DB_PASSWORD || 'gateway2',
    port: process.env.DB_PORT || 5432,
});

// --- DB INIT ---
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(255),
                rating INTEGER,
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("DB: Reviews table ensured.");
    } catch (err) {
        console.error("DB Init Error:", err);
    }
};
initDb();

app.use(cors());
app.use(bodyParser.json());

// --- FILE UPLOAD SETUP ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const upload = multer({ storage: storage });

app.use('/api/uploads', express.static(uploadDir));

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.sendStatus(401); // Unauthorized

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden
        req.user = user;
        next();
    });
};

// --- HELPERS ---
const getSalesTotal = async (interval) => {
    const query = `SELECT SUM(total_price) as total FROM orders WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '${interval}'`;
    const res = await pool.query(query);
    return res.rows[0].total || 0;
};

// --- PUBLIC ROUTES ---
app.get('/api/menu', async (req, res) => {
    try {
        const query = `
            SELECT m.*, 
            (
                SELECT json_agg(json_build_object('id', i.id, 'name', i.name, 'qty', mr.quantity))
                FROM menu_recipes mr
                JOIN ingredients i ON mr.ingredient_id = i.id
                WHERE mr.menu_item_id = m.id
            ) as recipe_ingredients,
            CASE 
                WHEN EXISTS (
                    SELECT 1 FROM menu_recipes mr
                    JOIN ingredients i ON mr.ingredient_id = i.id
                    WHERE mr.menu_item_id = m.id AND i.is_in_stock = false
                ) THEN false 
                ELSE m.manual_availability 
            END as is_available
            FROM menu_items m
            WHERE m.is_deleted = false AND m.is_visible = true
            ORDER BY m.id ASC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/ingredients', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM ingredients WHERE is_in_stock = true ORDER BY name ASC");
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/queue', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, customer_name, created_at, status, picked_up, delivery_type, delivery_location
            FROM orders 
            WHERE status = 'pending' OR (status = 'completed' AND picked_up = false)
            ORDER BY created_at ASC
        `);
        res.json(result.rows);
    } catch (err) { 
        console.error(err);
        res.json([]); 
    }
});

app.get('/api/reviews', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 50');
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/reviews', async (req, res) => {
    const { name, rating, comment } = req.body;
    try {
        await pool.query('INSERT INTO reviews (customer_name, rating, comment) VALUES ($1, $2, $3)', [name, rating, comment]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/config', async (req, res) => {
    try {
        await pool.query("CREATE TABLE IF NOT EXISTS site_config (config_key VARCHAR(50) PRIMARY KEY, config_value TEXT)");
        const result = await pool.query("SELECT * FROM site_config");
        const config = result.rows.reduce((acc, row) => {
            acc[row.config_key] = row.config_value;
            return acc;
        }, {});
        
        // Defaults
        if (config.deliveries_enabled === undefined) config.deliveries_enabled = 'true';
        if (config.cash_unlock_code === undefined) config.cash_unlock_code = 'familycash';
        
        // Parse booleans
        const response = {
            deliveries_enabled: config.deliveries_enabled === 'true',
            cash_unlock_code: config.cash_unlock_code,
            hero_background_url: config.hero_background_url || null,
            hero_background_type: config.hero_background_type || null
        };
        res.json(response);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// Protected Config Route
app.post('/api/config', authenticateToken, async (req, res) => {
    const { deliveries_enabled, cash_unlock_code } = req.body;
    try {
        if (deliveries_enabled !== undefined) {
            await pool.query("INSERT INTO site_config (config_key, config_value) VALUES ('deliveries_enabled', $1) ON CONFLICT (config_key) DO UPDATE SET config_value = $1", [String(deliveries_enabled)]);
        }
        if (cash_unlock_code !== undefined) {
            await pool.query("INSERT INTO site_config (config_key, config_value) VALUES ('cash_unlock_code', $1) ON CONFLICT (config_key) DO UPDATE SET config_value = $1", [String(cash_unlock_code)]);
        }
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/config/background', authenticateToken, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const fileUrl = `/uploads/${req.file.filename}`;
    const fileType = req.file.mimetype.startsWith('video') ? 'video' : 'image';

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query("INSERT INTO site_config (config_key, config_value) VALUES ('hero_background_url', $1) ON CONFLICT (config_key) DO UPDATE SET config_value = $1", [fileUrl]);
        await client.query("INSERT INTO site_config (config_key, config_value) VALUES ('hero_background_type', $1) ON CONFLICT (config_key) DO UPDATE SET config_value = $1", [fileType]);
        await client.query('COMMIT');
        res.json({ success: true, url: fileUrl, type: fileType });
    } catch (e) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: e.message });
    } finally {
        client.release();
    }
});

app.post('/api/discounts/validate', async (req, res) => {
    const { code } = req.body;
    try {
        const result = await pool.query("SELECT * FROM discount_codes WHERE code = $1 AND is_active = true", [code.toUpperCase()]);
        if (result.rows.length > 0) res.json({ valid: true, discount: result.rows[0] });
        else res.json({ valid: false });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/unpaid', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT * FROM orders 
            WHERE status = 'awaiting_payment'
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/orders/:id/payment-method', async (req, res) => {
    const { id } = req.params;
    const { paymentMethod } = req.body;
    try {
        // Logic to update status based on new method, but strictly for unpaid/active transitions
        let statusUpdate = "";
        if (['cashapp', 'venmo', 'paypal'].includes(paymentMethod)) {
            statusUpdate = ", status = CASE WHEN status = 'pending' THEN 'awaiting_payment' ELSE status END";
        } else if (paymentMethod === 'cash') {
            statusUpdate = ", status = CASE WHEN status = 'awaiting_payment' THEN 'pending' ELSE status END";
        }

        await pool.query(`UPDATE orders SET payment_method = $1 ${statusUpdate} WHERE id = $2`, [paymentMethod, id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/orders', async (req, res) => {
    console.log('Incoming order:', req.body);
    const { customerName, items, total, notes, tip, discountCodeId, discountAmount, deliveryType, deliveryLocation, paymentMethod, couponCode, unlockCode, phoneNumber, gpsLat, gpsLng } = req.body;

    let orderPaymentStatus = 'unpaid'; 
    let orderStatus = 'pending'; 
    
    let appliedDiscountCodeId = discountCodeId; 
    let calculatedDiscountAmount = discountAmount;
    let validatedCouponCode = null;

    // Fetch config for cash unlock code
    const configRes = await pool.query("SELECT config_value FROM site_config WHERE config_key = 'cash_unlock_code'");
    const cashUnlockCode = configRes.rows.length > 0 ? configRes.rows[0].config_value : 'familycash';

    // 1. Discount Logic (couponCode)
    if (couponCode) {
        const discountRes = await pool.query("SELECT * FROM discount_codes WHERE code = $1 AND is_active = true", [couponCode.toUpperCase()]);
        if (discountRes.rows.length > 0) {
            const discount = discountRes.rows[0];
            appliedDiscountCodeId = discount.id;
            validatedCouponCode = couponCode.toUpperCase();
            
            if (discount.type === 'percent') {
                calculatedDiscountAmount = total * (discount.value / 100);
            } else if (discount.type === 'flat') {
                calculatedDiscountAmount = discount.value;
            }
        } 
    }

    // 2. Payment Method Logic (unlockCode for Cash)
    if (['cashapp', 'venmo', 'paypal'].includes(paymentMethod)) {
        orderStatus = 'awaiting_payment';
    } else if (paymentMethod === 'cash') {
        // Check unlockCode specifically
        if (!unlockCode || unlockCode.toLowerCase() !== cashUnlockCode.toLowerCase()) {
             return res.status(403).json({ error: 'Cash payment not authorized without valid unlock code.' });
        }
        orderStatus = 'pending';
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const orderRes = await client.query(
            'INSERT INTO orders (customer_name, total_price, notes, tip_amount, discount_code_id, discount_amount, delivery_type, delivery_location, payment_method, coupon_code, payment_status, status, phone_number, gps_lat, gps_lng) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id',
            [customerName, total, notes, tip || 0, appliedDiscountCodeId || null, calculatedDiscountAmount || 0, deliveryType, deliveryLocation, paymentMethod || 'cash', validatedCouponCode || null, orderPaymentStatus, orderStatus, phoneNumber || null, gpsLat || null, gpsLng || null]
        );
        const orderId = orderRes.rows[0].id;
        for (const item of items) {
            await client.query(
                'INSERT INTO order_items (order_id, menu_item_id, quantity, item_price_at_time, customization_details) VALUES ($1, $2, $3, $4, $5)',
                [orderId, item.id, item.quantity, item.price, item.customization || null]
            );
        }
        await client.query('COMMIT');
        res.json({ success: true, orderId });
    } catch (e) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: e.message });
    } finally { client.release(); }
});

app.post('/api/feedback', async (req, res) => {
    const { name, feedback } = req.body;
    try { await pool.query('INSERT INTO feedback (name, feedback) VALUES ($1, $2)', [name, feedback]); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM staff_users WHERE username = $1', [username]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            // Compare hashed password (if it starts with $2, it's bcrypt, otherwise fallback to plaintext for migration)
            const match = user.password.startsWith('$2') 
                ? await bcrypt.compare(password, user.password)
                : user.password === password;

            if (match) {
                const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
                res.json({ success: true, token, user: { username: user.username } });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- ADMIN DASHBOARD (PROTECTED) ---
app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
    try {
        const awaitingPayment = await pool.query(`
            SELECT o.*, json_agg(json_build_object('name', m.name, 'qty', oi.quantity, 'custom', oi.customization_details)) as items 
            FROM orders o 
            JOIN order_items oi ON o.id = oi.order_id 
            JOIN menu_items m ON oi.menu_item_id = m.id 
            WHERE o.status = 'awaiting_payment'
            GROUP BY o.id ORDER BY o.created_at ASC
        `);

        const pending = await pool.query(`
            SELECT o.*, json_agg(json_build_object('name', m.name, 'qty', oi.quantity, 'custom', oi.customization_details)) as items 
            FROM orders o 
            JOIN order_items oi ON o.id = oi.order_id 
            JOIN menu_items m ON oi.menu_item_id = m.id 
            WHERE o.status = 'pending' OR (o.status = 'completed' AND o.picked_up = false)
            GROUP BY o.id ORDER BY 
                CASE WHEN o.status = 'completed' THEN 1 ELSE 2 END ASC, 
                o.created_at ASC
        `);
        const history = await pool.query(`
            SELECT o.*, json_agg(json_build_object('name', m.name, 'qty', oi.quantity, 'custom', oi.customization_details)) as items
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN menu_items m ON oi.menu_item_id = m.id
            WHERE o.status = 'cancelled' OR (o.status = 'completed' AND o.picked_up = true)
            GROUP BY o.id
            ORDER BY o.created_at DESC
            LIMIT 50
        `);
        const ingredients = await pool.query('SELECT * FROM ingredients ORDER BY name ASC');
        const menuItems = await pool.query('SELECT * FROM menu_items WHERE is_deleted = false ORDER BY id ASC');
        const recipes = await pool.query('SELECT * FROM menu_recipes');
        const discounts = await pool.query('SELECT * FROM discount_codes ORDER BY id ASC');
        const configRes = await pool.query("SELECT * FROM site_config");
        const config = configRes.rows.reduce((acc, row) => { acc[row.config_key] = row.config_value; return acc; }, {});
        
        const deliveryEnabled = config.deliveries_enabled === 'true';
        const cashUnlockCode = config.cash_unlock_code || 'familycash';

        const salesToday = await getSalesTotal('1 DAY');
        const salesWeek = await getSalesTotal('1 WEEK');
        const salesMonth = await getSalesTotal('1 MONTH');
        const salesAllTime = await pool.query("SELECT SUM(total_price) as total FROM orders WHERE status = 'completed'");

        res.json({
            awaitingPayment: awaitingPayment.rows,
            pending: pending.rows,
            history: history.rows,
            ingredients: ingredients.rows,
            menuItems: menuItems.rows,
            recipes: recipes.rows,
            discounts: discounts.rows,
            deliveryEnabled,
            cashUnlockCode,
            sales: { today: salesToday, week: salesWeek, month: salesMonth, total: salesAllTime.rows[0].total || 0 }
        });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/orders/:id/status', authenticateToken, async (req, res) => {
    const { status } = req.body; const { id } = req.params;
    try { await pool.query("UPDATE orders SET status = $1::text, completed_at = CASE WHEN $1::text = 'completed' THEN NOW() ELSE completed_at END WHERE id = $2", [status, id]); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/orders/:id/pickup', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try { await pool.query("UPDATE orders SET picked_up = true WHERE id = $1", [id]); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/orders/:id/delete', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query("UPDATE orders SET status = 'cancelled' WHERE id = $1", [id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/orders/:id/mark-paid', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        // Only move to 'pending' if it was 'awaiting_payment'. Otherwise preserve status (e.g. 'completed').
        await pool.query("UPDATE orders SET payment_status = 'paid', status = CASE WHEN status = 'awaiting_payment' THEN 'pending' ELSE status END WHERE id = $1", [id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/ingredients/:id/toggle', authenticateToken, async (req, res) => {
    try { await pool.query('UPDATE ingredients SET is_in_stock = $1 WHERE id = $2', [req.body.inStock, req.params.id]); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- MENU MANAGEMENT (PROTECTED) ---
app.post('/api/menu', authenticateToken, upload.single('image'), async (req, res) => {
    const { name, description, price, category, ingredientIds, manual_availability, is_visible } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    let ingredients = [];
    if (ingredientIds) { 
        try { 
            ingredients = JSON.parse(ingredientIds); 
            // Normalize: If it's just [1, 2], convert to [{id:1, qty:1}, {id:2, qty:1}]
            if (ingredients.length > 0 && typeof ingredients[0] !== 'object') {
                ingredients = ingredients.map(id => ({ id, qty: 1 }));
            }
        } catch(e) { 
            ingredients = []; 
        } 
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const resItem = await client.query(
            'INSERT INTO menu_items (name, description, price, category, image_url, manual_availability, is_visible) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [name, description, price, category, imageUrl, manual_availability || true, is_visible || true]
        );
        const newItemId = resItem.rows[0].id;
        if (ingredients.length > 0) {
            for (const item of ingredients) {
                await client.query('INSERT INTO menu_recipes (menu_item_id, ingredient_id, quantity) VALUES ($1, $2, $3)', [newItemId, item.id, item.qty || 1]);
            }
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ error: e.message }); } finally { client.release(); }
});

app.put('/api/menu/:id', authenticateToken, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, manual_availability, is_visible, ingredientIds } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    let ingredients = [];
    if (ingredientIds) { 
        try { 
            ingredients = JSON.parse(ingredientIds); 
            if (ingredients.length > 0 && typeof ingredients[0] !== 'object') {
                ingredients = ingredients.map(id => ({ id, qty: 1 }));
            }
        } catch(e) { 
            ingredients = []; 
        } 
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        let updateQuery = 'UPDATE menu_items SET name=$1, description=$2, price=$3, category=$4, manual_availability=$5, is_visible=$6';
        let params = [name, description, price, category, manual_availability, is_visible];
        
        if (imageUrl) {
             updateQuery += ', image_url=$7 WHERE id=$8';
             params.push(imageUrl, id);
        } else {
             updateQuery += ' WHERE id=$7';
             params.push(id);
        }
        
        await client.query(updateQuery, params);

        if (ingredientIds) {
            await client.query('DELETE FROM menu_recipes WHERE menu_item_id = $1', [id]);
            for (const item of ingredients) {
                await client.query('INSERT INTO menu_recipes (menu_item_id, ingredient_id, quantity) VALUES ($1, $2, $3)', [id, item.id, item.qty || 1]);
            }
        }
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ error: e.message }); } finally { client.release(); }
});

app.delete('/api/menu/:id', authenticateToken, async (req, res) => { try { await pool.query('UPDATE menu_items SET is_deleted = true WHERE id = $1', [req.params.id]); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); } });

app.post('/api/ingredients', authenticateToken, async (req, res) => { try { await pool.query('INSERT INTO ingredients (name) VALUES ($1)', [req.body.name]); res.json({success:true}); } catch (e) { res.status(500).json({error:e.message}); } });
app.delete('/api/ingredients/:id', authenticateToken, async (req, res) => { try { await pool.query('DELETE FROM ingredients WHERE id = $1', [req.params.id]); res.json({success:true}); } catch (e) { res.status(500).json({error:e.message}); } });
app.post('/api/discounts', authenticateToken, async (req, res) => { const { code, type, value } = req.body; try { await pool.query('INSERT INTO discount_codes (code, type, value) VALUES ($1, $2, $3)', [code.toUpperCase(), type, value]); res.json({success:true}); } catch (e) { res.status(500).json({error:e.message}); } });
app.delete('/api/discounts/:id', authenticateToken, async (req, res) => { try { await pool.query('DELETE FROM discount_codes WHERE id = $1', [req.params.id]); res.json({success:true}); } catch (e) { res.status(500).json({error:e.message}); } });

app.listen(port, () => { console.log(`AAASmores Backend v6.0.2 running on port ${port}`); });