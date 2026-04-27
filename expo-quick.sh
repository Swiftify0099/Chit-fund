#!/bin/bash

echo "======================================================"
echo "  ⚡ Quick Start - Expo Only"
echo "======================================================"
echo ""

cd /workspaces/Chit-fund/mobile || exit

# Get Codespace name
CODESPACE_NAME="${CODESPACE_NAME:-glorious-xylophone-69v5vx7xjqgrcxq6w}"

echo "Clearing cache..."
rm -rf .expo node_modules/.cache

echo "Setting up..."
export SKIP_DEBUGGER_SHELL=1
export EXPO_NO_CLIENT_ENV_VARS=1

echo ""
echo "Starting Expo on port 8081..."
echo ""
echo "📱 Open on your phone:"
echo "   https://${CODESPACE_NAME}-8081.app.github.dev"
echo ""
echo "Then tap 'Open in Expo Go' button"
echo ""
echo "======================================================"
echo ""

npx expo start --clear
