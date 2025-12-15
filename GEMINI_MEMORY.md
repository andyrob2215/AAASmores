# Gemini Agent Memory - AAASmores Project

**Date:** Sunday, December 14, 2025
**Current Directory:** `C:\Users\andyr\Desktop\aaasmored`

## Project Status
This is a React frontend for the "AAASmores" ordering system.
- **Frontend:** React + Vite + Tailwind.
- **Deployment:** Builds to `dist/`, then contents are copied to `unraid_stuff/www`.
- **Backend:** Running separately (likely Dockerized on Unraid).

## Recent Changes (Session: Dec 14, 2025)
1.  **Payment & Order Workflow Overhaul:**
    -   **Digital Payments (Venmo/Cash App):**
        -   Added buttons for Venmo and Cash App in `CartView`.
        -   Orders placed with these methods default to `payment_status: 'unpaid'` and `status: 'awaiting_payment'`.
        -   In Admin Dashboard, these appear in a new **"Unpaid / Review"** column (Left).
        -   Admins can click "Paid" (moves order to Active/Cooking) or "Delete".
    -   **Cash Payments:**
        -   Added a "Cash Unlock Code" mechanism to prevent unauthorized cash orders.
        -   Default code: `familycash` (configurable in Admin Settings).
        -   Cash orders go immediately to "Active / Cooking" but are marked `payment_status: 'unpaid'`.
        -   Added a "Mark Paid" ($) button to active cash orders to track collection without resetting order status.
2.  **Admin Dashboard Improvements:**
    -   **Split View:** "Active" tab now has two columns: "Unpaid / Review" vs "Active / Cooking".
    -   **Settings:** Added UI to view and update the `cash_unlock_code`.
    -   **UI Fixes:** Resolved `ReferenceError: App is not defined` and other component ordering issues by ensuring dependency components (`OrderDetailsModal`, `StorefrontQueueDisplay`) are defined before `AdminDashboard`.
3.  **Backend Enhancements:**
    -   **Schema:** Added `payment_method` and `coupon_code` columns to `orders` table. Added `cash_unlock_code` to `site_config`.
    -   **Migration:** Created and ran a migration script (`migrate.js`) to update the live PostgreSQL database schema on Unraid.
    -   **API:** Updated `POST /api/orders` to handle new payment logic and statuses. Updated `GET /api/admin/dashboard` to return `awaitingPayment` list.
4.  **Deployment:**
    -   Synced local backend files (`server.js`, `schema.sql`) to Unraid (`/mnt/user/appdata/aaasmores`).
    -   Rebuilt backend container on Unraid.
    -   Rebuilt frontend (`npm run build`) and deployed to `unraid_stuff/www`.

## Completed Tasks
-   **GitHub Integration:**
    -   Goal: Upload current code to `https://github.com/andyrob2215/AAASmores`.
    -   Initialized repository.
    -   Committed all current files.
    -   Added remote `https://github.com/andyrob2215/AAASmores`.
    -   Pushed to master branch.
-   **Admin Dashboard Enhancements:**
    -   Fetch full order details on history click.
    -   Two-column layout for Active orders (Unpaid vs Active).
    -   Configurable Cash Unlock Code.

## Instructions for Next Session
No specific instructions for the next session at this time.