# AAASmores Project Instructions

## Overview
This project consists of a React frontend (`src/`) and a Node.js/Express backend (`backend/`). It is designed to run on an Unraid server via Docker.

## Directory Structure
- `src/`: Frontend React source code.
- `backend/`: Backend Node.js source code, database schema, and Dockerfile.
- `unraid_stuff/`: Local mirror of server directories (e.g., `www/` for frontend build, `appdata/` for backend persistence).
- `dist/`: Generated frontend build artifacts.

## Deployment Instructions

### 1. Frontend Deployment
The frontend is a static site served from the `unraid_stuff/www` directory (which is synced to the server via external means or mounted path).

**Steps:**
1.  **Build:** Run the Vite build command.
    ```powershell
    npm run build
    ```
2.  **Deploy:** Copy the contents of `dist/` to `unraid_stuff/www/`.
    ```powershell
    Remove-Item -Path "unraid_stuff/www/*" -Recurse -Force
    Copy-Item -Path "dist/*" -Destination "unraid_stuff/www" -Recurse -Force
    ```

### 2. Backend Deployment
The backend runs as a Docker container on the Unraid server. Source files must be transferred to the server and the image rebuilt.

**Server Details:**
- **IP:** `192.168.1.123`
- **Path:** `/mnt/user/appdata/aaasmores`
- **Container Name:** `aaasmores-backend`

**Steps:**
1.  **Sync Local Mirror:** Copy latest backend files to local `unraid_stuff/appdata/`.
    ```powershell
    Copy-Item -Path "backend/server.js" -Destination "unraid_stuff/appdata/server.js" -Force
    Copy-Item -Path "backend/schema.sql" -Destination "unraid_stuff/appdata/schema.sql" -Force
    # Copy other files as needed (package.json, Dockerfile)
    ```
2.  **Transfer to Server:** Use `pscp` to upload files to the Unraid server.
    ```powershell
    pscp -pw "YOUR_PASSWORD" -hostkey "SHA256:HTlLbSFKHG9hfpiWgn8ynwv0F+pcPhDiNZGPwjnuPSo" "backend/server.js" "backend/schema.sql" "root@192.168.1.123:/mnt/user/appdata/aaasmores/"
    ```
3.  **Rebuild Container:** Execute the rebuild logic on the server via `plink`.
    
    *Create a script `rebuild_backend.sh` locally:*
    ```bash
    #!/bin/bash
    APP_DIR="/mnt/user/appdata/aaasmores"
    CONTAINER_NAME="aaasmores-backend"
    IMAGE_NAME="aaasmores-api"
    PORT="3001"
    TIMEZONE="America/Chicago"

    if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then docker stop $CONTAINER_NAME; fi
    if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then docker rm $CONTAINER_NAME; fi
    
    cd $APP_DIR
    docker build -t $IMAGE_NAME:latest .
    docker run -d --name $CONTAINER_NAME -e TZ=$TIMEZONE -p $PORT:3001 -v "$APP_DIR/uploads:/app/uploads" --restart unless-stopped $IMAGE_NAME:latest
    ```

    *Transfer and Run:*
    ```powershell
    pscp -pw "YOUR_PASSWORD" -hostkey "SHA256:HTlLbSFKHG9hfpiWgn8ynwv0F+pcPhDiNZGPwjnuPSo" "rebuild_backend.sh" "root@192.168.1.123:/tmp/"
    plink -ssh -pw "YOUR_PASSWORD" -hostkey "SHA256:HTlLbSFKHG9hfpiWgn8ynwv0F+pcPhDiNZGPwjnuPSo" "root@192.168.1.123" "bash /tmp/rebuild_backend.sh"
    ```

### 3. Database Migrations
If the database schema changes (e.g., adding columns), you must run a migration script inside the container or against the Postgres DB directly. `schema.sql` is only run on FIRST initialization.

**Example (Node.js script):**
1.  Create `backend/migrate.js` (see project files for example).
2.  Transfer to server: `pscp ... backend/migrate.js root@...:/tmp/`
3.  Execute inside container:
    ```powershell
    plink ... "docker cp /tmp/migrate.js aaasmores-backend:/app/migrate.js && docker exec aaasmores-backend node migrate.js"
    ```

## Notes
- **Cash Unlock Code:** Configurable in Admin Dashboard > Settings. Defaults to `familycash`.
- **SSH Host Key:** `SHA256:HTlLbSFKHG9hfpiWgn8ynwv0F+pcPhDiNZGPwjnuPSo`
- **Dependencies:** Requires `Putty` installed on Windows (`plink`, `pscp`).
