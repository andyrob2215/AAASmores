# AAASmores Project Evaluation

**Date:** December 13, 2025
**Scope:** Frontend (React) & Backend (Node.js/PostgreSQL)

## 1. Security Vulnerabilities (CRITICAL)

### A. Unprotected Admin API
- **Issue:** The backend routes under `/api/admin/` (dashboard data) and `/api/menu` (create/delete items) have **zero authentication checks**.
- **Risk:** Anyone can curl `/api/admin/dashboard` to see all sales data, customer names, and revenue. Anyone can send a DELETE request to `/api/menu/:id` to wipe the menu.
- **Fix:** Implement Middleware to verify a session or JWT token for all administrative routes.

### B. Insecure Authentication
- **Issue:** The frontend stores "auth" as a simple boolean in `localStorage`. There is no token exchange. The backend checks passwords in plain text (or the table doesn't exist in the provided schema).
- **Risk:** "Logging in" on the frontend creates no secure session. A user can simply edit their local storage to gain access to the *UI* (though the API is open anyway).
- **Fix:** Use `bcrypt` to hash passwords. Issue a JWT upon login. Require this JWT in the `Authorization` header for admin requests.

### C. Hardcoded Secrets
- **Issue:** `server.js` contains the database password `gateway2` and potentially other config values.
- **Risk:** If the code is shared or exposed (like in this repo), credentials are compromised.
- **Fix:** Use `dotenv` (`.env` file) to store secrets. Add `.env` to `.gitignore`.

### D. Unrestricted File Uploads
- **Issue:** `multer` allows any file extension.
- **Risk:** An attacker could upload a PHP shell or executable.
- **Fix:** Add a file filter to `multer` to allow only `image/jpeg`, `image/png`, and `image/webp`.

### E. Database Schema Gaps
- **Issue:** `schema.sql` does not create the `staff_users` table referenced in `server.js` login logic.
- **Risk:** Login will likely fail or rely on a table that was created manually and is not versioned.

## 2. Robustness & Architecture

### A. Polling vs. WebSockets
- **Current:** The frontend polls (`useInterval`) every 5 seconds.
- **Issue:** Does not scale well with hundreds of users (fairground scenario). Creates lag in the kitchen view.
- **Recommendation:** Implement **Socket.io** for real-time order injection and status updates.

### B. Data Integrity
- **Issue:** No validation on `siteNumber` or `customerName`.
- **Recommendation:** Enforce max lengths and sanitized inputs to prevent DB errors or injection attempts.

### C. Performance
- **Issue:** The dashboard queries *all* sales data for totals on every request.
- **Recommendation:** Add database indexes on `orders(created_at)` and `orders(status)`.

## 3. "Nice to Have" Features

### Campground Specific
- **Site Verification:** Table of valid campsites to prevent delivery errors.
- **Scheduled Delivery:** Allow users to pick a time slot.
- **SMS Status:** Text customer when "Out for Delivery".

### Single-Point Sales (Fairs)
- **Kiosk Mode:** Route `/kiosk` that disables navigation away from the ordering flow and auto-resets after inactivity.
- **Thermal Printing:** Backend integration with ESC/POS printers for kitchen tickets.
- **Offline PWA:** Cache the menu so the app loads even with spotty fairground Wi-Fi.

## 4. Recommended Roadmap

1.  **IMMEDIATE:** Fix API Security (Middleware + JWT).
2.  **IMMEDIATE:** Externalize Secrets (`.env`).
3.  **High:** Add file upload validation.
4.  **Medium:** Move from Polling to WebSockets.
5.  **Low:** Add Kiosk Mode and SMS features.
