#!/bin/bash

echo "======================================================"
echo "  🔍 Expo Tunnel Diagnostics"
echo "======================================================"
echo ""

# Check 1: Expo CLI
echo "[1] Checking Expo CLI..."
if command -v npx &> /dev/null; then
    EXPO_VERSION=$(npx expo --version 2>/dev/null)
    echo "✅ Expo: $EXPO_VERSION"
else
    echo "❌ Expo CLI not found"
fi
echo ""

# Check 2: Node modules
echo "[2] Checking mobile dependencies..."
cd /workspaces/Chit-fund/mobile || exit
if [ -d "node_modules" ]; then
    COUNT=$(ls node_modules | wc -l)
    echo "✅ node_modules exists ($COUNT packages)"
else
    echo "❌ node_modules missing - run: npm install --legacy-peer-deps"
fi
echo ""

# Check 3: Expo auth
echo "[3] Checking Expo authentication..."
WHOAMI=$(npx expo whoami 2>/dev/null || echo "")
if [ -n "$WHOAMI" ]; then
    echo "✅ Logged in as: $WHOAMI"
else
    echo "⚠️  Not authenticated"
    echo "   Run: npx expo login"
fi
echo ""

# Check 4: Internet connectivity
echo "[4] Checking internet..."
if ping -q -c 1 -W 2 8.8.8.8 >/dev/null 2>&1; then
    echo "✅ Internet connection: OK"
else
    echo "❌ Internet connection: FAILED"
    echo "   Cannot reach 8.8.8.8"
fi
echo ""

# Check 5: Expo cache
echo "[5] Checking cache..."
if [ -d ".expo" ]; then
    SIZE=$(du -sh .expo 2>/dev/null | awk '{print $1}')
    echo "ℹ️  .expo cache: $SIZE"
    echo "   Run 'rm -rf .expo' to clear"
else
    echo "✅ Cache is clean"
fi
echo ""

# Check 6: Network ports
echo "[6] Checking ports..."
if command -v nc &> /dev/null; then
    for port in 8000 8081 5432; do
        if nc -z localhost $port 2>/dev/null; then
            echo "✅ Port $port: IN USE"
        else
            echo "❌ Port $port: NOT LISTENING"
        fi
    done
else
    echo "ℹ️  nc not available - skipping port check"
fi
echo ""

# Check 7: Codespace public ports
echo "[7] Checking Codespace setup..."
if [ -n "$CODESPACE_NAME" ]; then
    echo "✅ Codespace detected: $CODESPACE_NAME"
    echo "🌐 Frontend URL: https://${CODESPACE_NAME}-8081.app.github.dev"
    echo "⚙️  Backend URL: https://${CODESPACE_NAME}-8000.app.github.dev"
    echo ""
    echo "⚠️  Make sure ports are PUBLIC!"
    echo "   gh codespace ports visibility 8000:public 8081:public"
else
    echo "❌ Not in Codespace"
fi
echo ""

echo "======================================================"
echo "  🚀 QuickFix Commands"
echo "======================================================"
echo ""
echo "If tunnel fails, try these in order:"
echo ""
echo "1. Clear cache and restart:"
echo "   rm -rf .expo node_modules/.cache"
echo "   ./quick-start-mobile.sh"
echo ""
echo "2. Full reset:"
echo "   rm -rf node_modules .expo"
echo "   npm install --legacy-peer-deps"
echo "   npx expo start --tunnel --clear"
echo ""
echo "3. Use local mode (if tunnel keeps failing):"
echo "   npx expo start --local"
echo ""
echo "4. Check backend first:"
echo "   cd ../backend"
echo "   python -m uvicorn app.main:app --reload"
echo ""
