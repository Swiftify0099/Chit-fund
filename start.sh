#!/bin/bash

echo "======================================================"
echo "  🚀 Chit Fund - Complete Startup Script"
echo "======================================================"
echo ""

# Enable error tracking
set -e

# 0. Check System
echo "[0/4] Checking system..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL not found. Installing..."
    sudo apt-get update && sudo apt-get install -y postgresql postgresql-contrib > /dev/null 2>&1
fi

echo "✅ PostgreSQL found"
echo ""

# 1. Start Database
echo "[1/4] Starting PostgreSQL..."
sudo service postgresql start > /dev/null 2>&1
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'password';" 2>/dev/null || true
sudo -u postgres psql -c "ALTER USER postgres WITH SUPERUSER;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE chitfund_db;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE chitfund_db TO postgres;" 2>/dev/null || true
echo "✅ PostgreSQL running on port 5432"
echo ""

# 2. Start Backend
echo "[2/4] Starting Backend (FastAPI)..."
cd backend || exit
if [ -f "../.venv/bin/activate" ]; then
    source ../.venv/bin/activate
fi

# Start backend quietly in background
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
sleep 3
if ! nc -z localhost 8000 2>/dev/null; then
    echo "⚠️  Backend not responding on port 8000"
    cat /tmp/backend.log | tail -5
    exit 1
fi
echo "✅ FastAPI running on port 8000"
echo ""

# 3. Prepare Mobile
echo "[3/4] Preparing Mobile App..."
cd mobile || exit

# Show codespace info if available
if [ -n "$CODESPACE_NAME" ]; then
    echo "📍 GitHub Codespace: $CODESPACE_NAME"
    echo "🌐 Frontend: https://${CODESPACE_NAME}-8081.app.github.dev"
    echo "⚙️  Backend: https://${CODESPACE_NAME}-8000.app.github.dev"
    echo ""
fi

echo ""
echo "======================================================"
echo "  📱 CONNECTION OPTIONS"
echo "======================================================"
echo ""
echo "⚠️  BEFORE STARTING: Make ports PUBLIC!"
echo ""
echo "1️⃣  Via VS Code Ports Tab:"
echo "   • Right-click Port 8000 → Port Visibility → Public"
echo "   • Right-click Port 8081 → Port Visibility → Public"
echo ""
echo "2️⃣  Via Terminal:"
echo "   • gh codespace ports visibility 8000:public 8081:public"
echo ""
echo "======================================================"
echo ""

# 4. Start Mobile with better error handling
echo "[4/4] Starting Expo..."
echo ""

# Set environment variables
export SKIP_DEBUGGER_SHELL=1
export EXPO_NO_CLIENT_ENV_VARS=1
export EXPO_PUBLIC_BACKEND_URL="https://${CODESPACE_NAME}-8000.app.github.dev"

# Try tunnel mode first, with fallback to local
echo "🔄 Starting Expo with Tunnel mode..."
echo "   (This may take 1-2 minutes on first run)"
echo ""

npx expo start --tunnel --clear 2>&1 &
EXPO_PID=$!

# Wait a bit and check if it's working
sleep 10

if ps -p $EXPO_PID > /dev/null; then
    echo "✅ Expo started successfully!"
    echo ""
    echo "📱 Mobile Connection Instructions:"
    echo ""
    echo "Option A - Direct Browser (Fastest):"
    echo "  1. Open phone browser"
    echo "  2. Visit: https://${CODESPACE_NAME}-8081.app.github.dev"
    echo "  3. Tap 'Open in Expo Go'"
    echo ""
    echo "Option B - Scan QR Code:"
    echo "  1. Open Expo Go app on phone"
    echo "  2. Tap 'Scan QR code'"
    echo "  3. Scan the code displayed above"
    echo ""
    echo "🛑 To stop: Press Ctrl+C"
    echo ""
    
    # Wait for user to stop
    wait $EXPO_PID
else
    echo "❌ Expo failed to start"
    echo ""
    echo "🔧 Troubleshooting - Try one of these:"
    echo ""
    echo "1. Clear and retry:"
    echo "   cd mobile && rm -rf .expo node_modules/.cache"
    echo "   ../start.sh"
    echo ""
    echo "2. Use local mode instead:"
    echo "   npx expo start --local"
    echo ""
    echo "3. Check logs:"
    echo "   tail -50 /tmp/expo.log"
    exit 1
fi

# Cleanup on exit
echo ""
echo "Shutting down services..."
kill $BACKEND_PID 2>/dev/null || true
echo "✅ Done"
