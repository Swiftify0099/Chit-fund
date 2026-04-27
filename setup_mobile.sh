#!/bin/bash

echo "==============================================="
echo "  React Native DevTools Fix + Reinstall"
echo "==============================================="
echo ""

cd /workspaces/Chit-fund/mobile || exit

# Set environment variable to disable problematic debugger
export SKIP_DEBUGGER_SHELL=1

echo "[1/3] Installing dependencies..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo ""
echo "[2/3] Clearing Expo cache..."
npx expo-cli@latest prebuild --clean || npx expo prebuild --clean

echo ""
echo "[3/3] Ready to run!"
echo ""
echo "✅ You can now run:"
echo "   cd /workspaces/Chit-fund"
echo "   ./run_project.sh"
echo ""
echo "If you still get errors, try:"
echo "   npx expo start --tunnel --clear"
