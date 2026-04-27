#!/bin/bash

echo "==============================================="
echo "  Chit-Fund Tunnel Troubleshooter"
echo "==============================================="
echo ""

# Check if in Codespace
if [ -z "$CODESPACE_NAME" ]; then
    echo "❌ Not in GitHub Codespace. This script is for Codespace debugging."
    exit 1
fi

CODESPACE_NAME="${CODESPACE_NAME}"
BACKEND_URL="https://${CODESPACE_NAME}-8000.app.github.dev"
FRONTEND_URL="https://${CODESPACE_NAME}-8081.app.github.dev"

echo "📍 Codespace: $CODESPACE_NAME"
echo ""

# 1. Check port visibility
echo "[1/4] Checking Port Visibility..."
if command -v gh &> /dev/null; then
    echo "Running: gh codespace ports"
    gh codespace ports
    echo ""
else
    echo "⚠️  GitHub CLI not found. Cannot check ports."
    echo "Please manually check Ports tab for 8000 and 8081 visibility."
    echo ""
fi

# 2. Test backend connectivity
echo "[2/4] Testing Backend Connectivity..."
echo "Testing: $BACKEND_URL"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/")
STATUS=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$STATUS" = "200" ]; then
    echo "✅ Backend is reachable!"
    echo "Response: $BODY"
else
    echo "❌ Backend returned status: $STATUS"
    echo "Response: $BODY"
    if [ "$STATUS" = "000" ]; then
        echo "💡 Tip: Ensure Port 8000 is PUBLIC in Ports tab"
    fi
fi
echo ""

# 3. Test frontend connectivity
echo "[3/4] Testing Frontend Connectivity..."
echo "Testing: $FRONTEND_URL"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")

if [ "$STATUS" = "200" ]; then
    echo "✅ Frontend is reachable!"
else
    echo "❌ Frontend returned status: $STATUS"
    if [ "$STATUS" = "000" ]; then
        echo "💡 Tip: Ensure Port 8081 is PUBLIC in Ports tab"
    fi
fi
echo ""

# 4. Check backend logs
echo "[4/4] Recent Backend Logs..."
echo "Checking for uvicorn or Python errors..."
if pgrep -f "uvicorn" > /dev/null; then
    echo "✅ Backend process is running"
else
    echo "❌ Backend process is NOT running"
    echo "💡 Tip: Run './run_project.sh' to start the backend"
fi
echo ""

# Summary
echo "==============================================="
echo "  Summary & Next Steps"
echo "==============================================="
echo ""
echo "If tests passed:"
echo "1. Open on phone: $FRONTEND_URL"
echo "2. Tap 'Open in Expo Go'"
echo "3. Login with credentials"
echo ""
echo "If tests failed:"
echo "1. Check Ports tab - ensure 8000 & 8081 are PUBLIC"
echo "2. Run: gh codespace ports visibility 8000:public 8081:public"
echo "3. Restart: ./run_project.sh"
echo ""
echo "For more help, see: TUNNEL_FIX_GUIDE.md"
