#!/bin/bash

echo "======================================================"
echo "  🚀 Quick Start - Expo Only (No Backend)"
echo "======================================================"
echo ""

cd /workspaces/Chit-fund/mobile || exit

echo "🔄 Cleaning cache..."
rm -rf .expo node_modules/.cache

echo "⚙️  Setting up environment..."
export SKIP_DEBUGGER_SHELL=1
export EXPO_NO_CLIENT_ENV_VARS=1

# Get Codespace name if available
if [ -n "$CODESPACE_NAME" ]; then
    echo "📍 Codespace: $CODESPACE_NAME"
    export EXPO_PUBLIC_BACKEND_URL="https://${CODESPACE_NAME}-8000.app.github.dev"
    echo "🌐 Frontend: https://${CODESPACE_NAME}-8081.app.github.dev"
fi

echo ""
echo "======================================================"
echo "  🌐 CONNECTION OPTIONS"
echo "======================================================"
echo ""
echo "⚠️  IMPORTANT: Make these ports PUBLIC first!"
echo ""
echo "In VS Code - Click 'Ports' tab:"
echo "  • Port 8000 → Right-click → Port Visibility → Public"
echo "  • Port 8081 → Right-click → Port Visibility → Public"
echo ""
echo "======================================================"
echo ""

echo "🔄 Starting Expo with Tunnel..."
echo ""

# Start with tunnel mode
npx expo start --tunnel --clear

echo ""
echo "Connection lost. To reconnect:"
echo "  ./quick-start-mobile.sh"
