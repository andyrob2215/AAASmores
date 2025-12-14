# Gemini Agent Memory - AAASmores Project

**Date:** Saturday, December 13, 2025
**Current Directory:** `C:\Users\andyr\Desktop\aaasmored`

## Project Status
This is a React frontend for the "AAASmores" ordering system.
- **Frontend:** React + Vite + Tailwind.
- **Deployment:** Builds to `dist/`, then contents are copied to `unraid_stuff/www`.
- **Backend:** Running separately (likely Dockerized on Unraid).

## Recent Changes (Session: Dec 13, 2025)
1.  **Hero Section:**
    -   Updated text to: `"FIRE. CHOCOLATE. GOOD TIMES."` with specific formatting.
    -   Restored to the user's preferred version after a revert attempt.
2.  **UI Fixes:**
    -   **Footer:** Removed `pointer-events-none` so the hidden "Staff Only" button is clickable on hover.
3.  **Feature Logic (Customizations):**
    -   Modified `AAASmores.jsx` to distinguish between "Standard" and "Custom" orders.
    -   Added helper `parseCustomization(str)`.
    -   Updated `CustomizationModal` to only prepend `"CUSTOM: "` if the ingredient counts differ from the base recipe.
    -   Updated `CartView`, `AdminDashboard`, and `OrderDetailsModal` to parse this string.
    -   **Result:** Standard items show ingredients *without* the "CUSTOM" tag; modified items show the tag.

## Pending Tasks
-   **GitHub Integration:**
    -   Goal: Upload current code to `https://github.com/andyrob2215/AAASmores`.
    -   **Status:** BLOCKED. The `git` command is not recognized in the current terminal session.
    -   **Action Required:** User is restarting the terminal/installing Git to fix the PATH issue.

## Instructions for Next Session
1.  Verify `git` is working by running `git --version`.
2.  Initialize the repository (if needed).
3.  Commit all current files.
4.  Add remote `https://github.com/andyrob2215/AAASmores`.
5.  Push to main/master.
