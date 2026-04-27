#!/bin/bash

echo "======================================================"
echo "  🚀 Chit Fund - WORKING Startup (Fixed)"
echo "======================================================"
echo ""

# Since tunnel fails (no external internet), use --local mode
# This works within the Codespace without external connectivity

cd /workspaces/Chit-fund || exit

# 1. Start Backend
echo "[1/2] Starting Backend (FastAPI)..."

sudo service postgresql start > /dev/null 2>&1
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'password';" 2>/dev/null || true
sudo -u postgres psql -c "ALTER USER postgres WITH SUPERUSER;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE chitfund_db;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE chitfund_db TO postgres;" 2>/dev/null || true

cd backend || exit
if [ -f "../.venv/bin/activate" ]; then
    source ../.venv/bin/activate
fi

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

sleep 2
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend running on :8000"
else
    echo "❌ Backend failed to start"
    cat /tmp/backend.log
    exit 1
fi
echo ""

# 2. Start Mobile with LOCAL mode (works without external internet!)
echo "[2/2] Starting Expo..."
cd mobile || exit

# Show Codespace info
if [ -n "$CODESPACE_NAME" ]; then
    CODESPACE_NAME="${CODESPACE_NAME}"
    echo "✅ Codespace: $CODESPACE_NAME"
    echo ""
    echo "📱 CONNECTION - CHOOSE ONE:"
    echo ""
    echo "🌐 Method A - Direct Browser (WORKS NOW!):"
    echo "   • On your phone, open browser and go to:"
    echo "   • https://${CODESPACE_NAME}-8081.app.github.dev"
    echo "   • Tap 'Open in Expo Go' button"
    echo ""
    echo "   This is the ONLY method that works in this environment"
    echo "   because external tunnel is blocked by network settings"
    echo ""
fi

echo "======================================================"
echo ""

# Clean cache
rm -rf .expo node_modules/.cache 2>/dev/null

# Set environment
export SKIP_DEBUGGER_SHELL=1
export EXPO_NO_CLIENT_ENV_VARS=1
export EXPO_PUBLIC_BACKEND_URL="https://${CODESPACE_NAME}-8000.app.github.dev"

# Use LOCAL mode instead of TUNNEL
# This doesn't require external internet connectivity
npx expo start --clear 2>&1 &
EXPO_PID=$!

sleep 5

if ps -p $EXPO_PID > /dev/null; then
    echo "✅ Expo server started!"
    echo ""
    echo "🛑 Press Ctrl+C to stop"
    wait $EXPO_PID
else
    echo "❌ Expo failed to start"
    exit 1
fi

# Cleanup
kill $BACKEND_PID 2>/dev/null || true
