# Gemini Agent Memory - AAASmores Project

**Date:** Tuesday, December 16, 2025
**Current Directory:** `C:\Users\andyr\Desktop\aaasmored`

## Project Status
This is a React frontend for the "AAASmores" ordering system.
- **Frontend:** React + Vite + Tailwind.
- **Deployment:** Builds to `dist/`, then contents are copied to `unraid_stuff/www`.
- **Backend:** Running separately (likely Dockerized on Unraid).

## Recent Changes (Session: Dec 16, 2025)
1.  **Admin Dashboard - Discounts Tab:**
    -   **Implemented:** Added a fully functional 'Discounts' tab to the Admin Dashboard.
    -   **Functionality:** Allows admins to create new discount codes (Percent or Flat amount) and delete existing ones.
    -   **UI:** Styled the tab for mobile responsiveness, stacking the add form on smaller screens.
    -   **Fix:** Resolved an issue where the discounts page was blank by adding the missing rendering logic.

2.  **Delivery Option Enhancements:**
    -   **Site Number Requirement:** Made the "Campsite Number" field strictly required for delivery orders. It is no longer disabled when GPS is set.
    -   **GPS Optional but Encouraged:** Updated the UI to clearly label GPS location as recommended but optional. Added encouraging text explaining its benefit for drivers.
    -   **Validation:** Updated form submission logic to enforce the site number requirement.

3.  **UI/UX Improvements:**
    -   **Mobile Navigation:** Fixed an issue where the Admin Dashboard tabs would overflow/squish on mobile devices by adding horizontal scrolling and preventing text wrapping.
    -   **Styling:** Improved the visual layout of the discounts management section.

## Recent Changes (Session: Dec 14, 2025)
1.  **Payment & Order Workflow Overhaul:**
    -   **Digital Payments (Venmo/Cash App/PayPal):**
        -   Added PayPal support.
        -   Digital orders default to `payment_status: 'unpaid'` and `status: 'awaiting_payment'`.
        -   **"Pay" Tab:** Added a public view to list unpaid orders so customers can complete payment if they navigate away.
        -   **Success View:** Shows dynamic payment links (`paypal.me`, `venmo.com`, `cash.app`) and hides the "CASH" prompt for digital orders.
    -   **Cash Payments:**
        -   Secured by "Cash Unlock Code" (default: `familycash`).
        -   Cash orders go to "Active" immediately but are marked `unpaid`.
    -   **Coupon Stacking:**
        -   Refactored `CartView` and Backend `POST /api/orders` to support applying a Discount Code *and* a Cash Unlock Code simultaneously.
        -   `unlockCode` authorizes cash payment; `couponCode` applies the discount.

2.  **Delivery Enhancements:**
    -   **Phone Number:** Added required phone number field for delivery orders (validated to 10 digits).
    -   **GPS Location:** Added "Use Current GPS" button to `CartView` using browser Geolocation API.
        -   Captures `gps_lat` and `gps_lng`.
        -   Admin Dashboard displays a "Open Exact Location" link (Google Maps) for these orders.

3.  **UI/UX Improvements:**
    -   **Dynamic Queue ETA:** `QueueBoard` and `StorefrontQueueDisplay` now calculate ETA dynamically: `(Index * 4) + Max(0, 4 - TimeSinceFirstOrder)`.
    -   **Fun Messages:** Zero wait time displays fun flare messages like "Roasting perfection!".
    -   **Admin Dashboard:**
        -   Split view for "Unpaid/Review" vs "Active/Cooking".
        -   Displays Phone Number and GPS links.
    -   **Fixes:** Resolved component `ReferenceError`s by restructuring `src/AAASmores.jsx`.

4.  **Backend Enhancements:**
    -   **Schema:** Added `phone_number`, `gps_lat`, `gps_lng` to `orders` table (via migrations V2 and V3).
    -   **API:**
        -   `GET /api/unpaid`: Returns only `awaiting_payment` orders.
        -   `PUT /api/orders/:id/payment-method`: Allows updating payment method from the "Pay" tab.
        -   `POST /api/orders`: Handles new fields (`unlockCode`, `gpsLat`, etc.).

5.  **Deployment:**
    -   Synced local backend files to Unraid.
    -   Rebuilt backend container.
    -   Rebuilt frontend and deployed to `unraid_stuff/www`.

## Deployment Instructions

### 1. Frontend Deployment
The frontend is a static site served from the `unraid_stuff/www` directory.

**Steps:**
1.  **Build:** `npm run build`
2.  **Deploy:**
    ```powershell
    Remove-Item -Path "unraid_stuff/www/*" -Recurse -Force
    Copy-Item -Path "dist/*" -Destination "unraid_stuff/www" -Recurse -Force
    ```

### 2. Backend Deployment
**Server:** 192.168.1.123 (`/mnt/user/appdata/aaasmores`)

**Steps:**
1.  **Sync:** Copy `backend/server.js` and `backend/schema.sql` to `unraid_stuff/appdata/`.
2.  **Transfer:** Use `pscp` to upload to server.
3.  **Rebuild:** Run the docker build/run commands on the server (via `plink` or script).

### 3. Database Migrations
Migrations are run manually using Node.js scripts transferred to the server.
- `migrate_v2.js`: Adds `phone_number`.
- `migrate_v3.js`: Adds `gps_lat`, `gps_lng`.

**Command:**
```powershell
plink ... "docker cp /tmp/migrate_v3.js aaasmores-backend:/app/migrate_v3.js && docker exec aaasmores-backend node migrate_v3.js"
```