#!/bin/bash

# Quick fix for tunnel QR code scanning issues

echo "==============================================="
echo "  Quick Tunnel Fix"
echo "==============================================="
echo ""

if [ -z "$CODESPACE_NAME" ]; then
    echo "❌ Not in GitHub Codespace."
    exit 1
fi

echo "📍 Codespace: $CODESPACE_NAME"
echo ""

# Make ports public
echo "[1/2] Making ports PUBLIC..."
echo "Running: gh codespace ports visibility 8000:public 8081:public"
gh codespace ports visibility 8000:public 8081:public

if [ $? -eq 0 ]; then
    echo "✅ Ports set to PUBLIC"
else
    echo "⚠️  Could not set ports. Try manually:"
    echo "   1. Click Ports tab"
    echo "   2. Right-click Port 8000 → Visibility → Public"
    echo "   3. Right-click Port 8081 → Visibility → Public"
fi

echo ""
echo "[2/2] Testing connectivity..."
echo ""

# Test backend
BACKEND_URL="https://${CODESPACE_NAME}-8000.app.github.dev"
echo "Testing backend: $BACKEND_URL"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/" 2>&1)
STATUS=$(echo "$RESPONSE" | tail -n1)

if [[ "$STATUS" == "200" ]]; then
    echo "✅ Backend is accessible!"
elif [[ "$STATUS" == "000" ]]; then
    echo "❌ Cannot reach backend - port might still be private"
else
    echo "❓ Backend returned status: $STATUS"
fi

echo ""
echo "==============================================="
echo ""
echo "✅ To run the app:"
echo "1. Run: ./run_project.sh"
echo "2. On your phone, open:"
echo "   https://${CODESPACE_NAME}-8081.app.github.dev"
echo "3. Tap 'Open in Expo Go'"
echo ""
echo "Or scan the QR code that appears in terminal."
