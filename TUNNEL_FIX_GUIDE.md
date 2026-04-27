# GitHub Codespace Tunnel - API Connection Fix

## Problem
When running the app via Expo tunnel QR code scan, you get **"something went wrong"** on the mobile device because:
- The app can't connect to the backend API
- Port 8000 (backend) is likely **PRIVATE** instead of PUBLIC
- The tunnel can't reach the API endpoint

## Solution Steps

### Step 1: Make Ports Public
1. **In your GitHub Codespace terminal**, run:
   ```bash
   gh codespace ports visibility 8000:public 8081:public
   ```

   Or **manually**:
   - Look for the **"Ports"** tab next to Terminal in VS Code
   - Right-click **Port 8000** → "Port Visibility" → Select **"Public"**
   - Right-click **Port 8081** → "Port Visibility" → Select **"Public"**

### Step 2: Update API Configuration
The app needs to know which tunnel URL to use. Edit [mobile/services/api.ts](mobile/services/api.ts):

```typescript
export const BASE_URL = getBackendURL();

function getBackendURL(): string {
  // For GitHub Codespaces + Tunnel
  if (process.env.EXPO_PUBLIC_BACKEND_URL) {
    return process.env.EXPO_PUBLIC_BACKEND_URL;
  }
  
  // Fallback for local development
  return "https://glorious-xylophone-69v5vx7xjqgrcxq6w-8000.app.github.dev";
}
```

### Step 3: Run with Correct Configuration
```bash
cd mobile
# Set environment variable for tunnel URL
export EXPO_PUBLIC_BACKEND_URL="https://YOUR_CODESPACE_NAME-8000.app.github.dev"

# Start Expo with tunnel
npx expo start --tunnel
```

### Step 4: Alternative - Use Direct Codespace URL (Simpler)
Instead of scanning QR code, directly visit the web URL in your phone browser:
1. Get your Codespace URL: `https://YOUR_CODESPACE_NAME-8081.app.github.dev`
2. Visit it on your phone's browser
3. The app runs in Expo Go directly

---

## Complete Working run_project.sh

Replace your [run_project.sh](../../run_project.sh) with:

```bash
#!/bin/bash

echo "======================================================"
echo "  Digital Bishi / Chit Fund + Credit Platform (Linux)"
echo "======================================================"
echo ""

# 0. Start PostgreSQL Database (Required for Codespaces)
echo "[0/2] Checking and starting PostgreSQL service..."
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL not found. Installing..."
    sudo apt-get update && sudo apt-get install -y postgresql postgresql-contrib
fi

sudo service postgresql start
echo ""

# Initialize database for Chit-fund
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'password';" || true
sudo -u postgres psql -c "ALTER USER postgres WITH SUPERUSER;" || true
sudo -u postgres psql -c "CREATE DATABASE chitfund_db;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE chitfund_db TO postgres;" || true
echo ""

# 1. Start Backend
echo "[1/2] Launching Backend (FastAPI) on port 8000..."
cd backend || exit

if [ -f "../.venv/bin/activate" ]; then
    source ../.venv/bin/activate
fi

# Start backend in background
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

sleep 3

# 2. Start Mobile
echo "[2/2] Launching Mobile (Expo)..."
cd mobile || exit

if [ -n "$CODESPACE_NAME" ]; then
    # Auto-update the API URL for tunnel
    BACKEND_URL="https://${CODESPACE_NAME}-8000.app.github.dev"
    export EXPO_PUBLIC_BACKEND_URL="$BACKEND_URL"
    
    sed -i "s|^export const BASE_URL = .*|export const BASE_URL = \"$BACKEND_URL\";|g" services/api.ts
    
    echo "===================================================================="
    echo "🌐 GITHUB CODESPACES + TUNNEL MODE"
    echo "===================================================================="
    echo "🔧 IMPORTANT: Make ports public before scanning QR!"
    echo ""
    echo "1️⃣  Make Ports Public:"
    echo "   - Click 'Ports' tab (next to Terminal)"
    echo "   - Right-click Port 8000 → Port Visibility → Public"
    echo "   - Right-click Port 8081 → Port Visibility → Public"
    echo ""
    echo "2️⃣  Option A - Scan QR Code:"
    echo "   - Scan the QR code below with Expo Go app"
    echo "   - The app will connect to: $BACKEND_URL"
    echo ""
    echo "3️⃣  Option B - Direct Web Link (Recommended):"
    echo "   - Open on phone: https://${CODESPACE_NAME}-8081.app.github.dev"
    echo "   - Tap 'Open in Expo Go'"
    echo "===================================================================="
    echo ""
    
    npx expo start -c --tunnel
else
    echo "🏠 Local development mode"
    npx expo start -c --tunnel --go
fi

# Cleanup
kill $BACKEND_PID 2>/dev/null || true
```

---

## Troubleshooting

### Still getting "something went wrong"?

1. **Check Backend is Running**
   ```bash
   curl https://YOUR_CODESPACE_NAME-8000.app.github.dev/
   ```
   Should return: `{"status":"ok","service":"Chit Fund API v1.0"}`

2. **Verify Port Visibility**
   ```bash
   gh codespace ports
   ```
   Both 8000 and 8081 should show "Public"

3. **Check Network Connection**
   ```bash
   # In Codespace terminal
   curl -v https://YOUR_CODESPACE_NAME-8000.app.github.dev/
   ```

4. **Clear Expo Cache**
   ```bash
   cd mobile
   npx expo restart --clear
   ```

5. **Enable Debug Logging in App**
   Edit [mobile/services/api.ts](mobile/services/api.ts) and add:
   ```typescript
   api.interceptors.request.use((config) => {
     console.log("📤 API Request:", config.url);
     return config;
   });
   
   api.interceptors.response.use(
     (res) => {
       console.log("✅ API Response:", res.status, res.data);
       return res;
     },
     (error) => {
       console.error("❌ API Error:", error.message, error.response?.status);
       return Promise.reject(error);
     }
   );
   ```

---

## Quick Command Checklist

```bash
# Terminal 1: Make Ports Public
gh codespace ports visibility 8000:public 8081:public

# Terminal 2: Run Project
cd /workspaces/Chit-fund
./run_project.sh

# Terminal 3: Test Backend
curl https://$CODESPACE_NAME-8000.app.github.dev/
```

---

For more help, check your backend logs for CORS or connection errors.
