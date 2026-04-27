#!/bin/bash

echo "======================================================"
echo "  Expo Tunnel Mode Setup (GitHub Codespace)"
echo "======================================================"
echo ""

cd mobile || exit

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[1] Installing dependencies..."
    npm install
    echo ""
fi

echo "[2] Starting Expo with TUNNEL mode..."
echo ""
echo "⏳ Initializing tunnel connection..."
echo "Once started, you'll see a QR code."
echo "📱 Scan it with Expo Go app on your phone."
echo ""
echo "======================================================"
echo ""

# Start Expo with tunnel mode (fastest for Codespace)
npx expo start --tunnel --clear

# Note: Remove '--go' flag if it causes issues
# Alternative: Use --local for LAN connection (slower in Codespace)
