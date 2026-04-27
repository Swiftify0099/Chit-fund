#!/bin/bash

echo "======================================================"
echo "  Digital Bishi / Chit Fund + Credit Platform (Linux)"
echo "======================================================"
echo ""

# 0. Start PostgreSQL Database (Required for Codespaces)
echo "[0/4] Checking and starting PostgreSQL service..."
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL not found. Installing..."
    sudo apt-get update && sudo apt-get install -y postgresql postgresql-contrib
fi

sudo service postgresql start
echo ""

# Initialize database for Chit-fund (matches backend/.env settings)
# The '|| true' ensures the script doesn't crash if the user/db already exists on future runs
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'password';" || true
sudo -u postgres psql -c "ALTER USER postgres WITH SUPERUSER;" || true
sudo -u postgres psql -c "CREATE DATABASE chitfund_db;" || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE chitfund_db TO postgres;" || true
echo ""

# 1. Start Backend in background
echo "[1/4] Launching Backend (FastAPI) on port 8000..."
cd backend || exit
# Activate the virtual environment located in the project root
if [ -f "../.venv/bin/activate" ]; then
    source ../.venv/bin/activate
fi
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Give backend time to start
sleep 2

# 2. Check if running in GitHub Codespaces
echo "[2/4] Checking environment..."
if [ -n "$CODESPACE_NAME" ]; then
    echo "✅ GitHub Codespace detected: ${CODESPACE_NAME}"
else
    echo "ℹ️  Local development detected"
fi
echo ""

# 3. Start Mobile in foreground
echo "[3/4] Launching Mobile (Expo)..."
cd mobile || exit

if [ -n "$CODESPACE_NAME" ]; then
    # Auto-update the API URL for tunnel mode
    BACKEND_URL="https://${CODESPACE_NAME}-8000.app.github.dev"
    export EXPO_PUBLIC_BACKEND_URL="$BACKEND_URL"
    
    # Update the api.ts file with the correct Codespace URL
    sed -i "s|return \"https://.*-8000.app.github.dev\"|return \"$BACKEND_URL\"|g" services/api.ts
    
    echo ""
    echo "===================================================================="
    echo "🌐 GITHUB CODESPACES DETECTED - TUNNEL MODE"
    echo "===================================================================="
    echo ""
    echo "⚠️  REQUIRED: Make ports PUBLIC before scanning QR code!"
    echo ""
    echo "1️⃣  Make Ports Public:"
    echo "   • Click 'Ports' tab (next to Terminal tab)"
    echo "   • Right-click Port 8000 → Port Visibility → Make Public"
    echo "   • Right-click Port 8081 → Port Visibility → Make Public"
    echo ""
    echo "2️⃣  Option A - Scan QR Code (via Tunnel):"
    echo "   • Scan the QR code below with Expo Go app on your phone"
    echo "   • Backend will be accessed from: $BACKEND_URL"
    echo ""
    echo "3️⃣  Option B - Direct Browser Link (Recommended):"
    echo "   • Open on phone: https://${CODESPACE_NAME}-8081.app.github.dev"
    echo "   • Tap 'Open in Expo Go' button"
    echo "   • This is more reliable than scanning"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   • If you get 'something went wrong', check Ports are PUBLIC"
    echo "   • If still failing, restart the script after making ports public"
    echo ""
    echo "===================================================================="
    echo ""
    
    # Set environment variables to skip problematic debugger shell
    export SKIP_DEBUGGER_SHELL=1
    export EXPO_NO_CLIENT_ENV_VARS=1
    
    echo "Starting Expo with tunnel..."
    npx expo start --tunnel --clear
else
    echo ""
    echo "🏠 Running in local development mode..."
    
    export SKIP_DEBUGGER_SHELL=1
    export EXPO_NO_CLIENT_ENV_VARS=1
    
    npx expo start --tunnel --clear --go
fi

# Cleanup backend when expo is stopped (Ctrl+C)
echo ""
echo "Shutting down backend..."
kill $BACKEND_PID 2>/dev/null || true