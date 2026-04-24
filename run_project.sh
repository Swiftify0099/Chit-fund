#!/bin/bash

echo "======================================================"
echo "  Digital Bishi / Chit Fund + Credit Platform (Linux)"
echo "======================================================"
echo ""

# 0. Start PostgreSQL Database (Required for Codespaces)
echo "[0/2] Checking and starting PostgreSQL service..."
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
echo "[1/2] Launching Backend (FastAPI) on port 8000..."
cd backend || exit
# Activate the virtual environment located in the project root
if [ -f "../.venv/bin/activate" ]; then
    source ../.venv/bin/activate
fi
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# 2. Start Mobile in foreground
echo "[2/2] Launching Mobile (Expo)..."
echo "===================================================================="
echo "⚠️ NOTE FOR CODESPACES: The QR code below WILL NOT WORK directly!"
echo "1. Go to the 'Ports' tab in VS Code and set port 8081 to 'Public'."
echo "2. Best way to connect: Run 'npx expo login' in your terminal,"
echo "   log into Expo Go on your phone, and open it from the app!"
echo "===================================================================="
echo ""

cd mobile || exit
npx expo start -c

# Cleanup backend when expo is stopped (Ctrl+C)
kill $BACKEND_PID