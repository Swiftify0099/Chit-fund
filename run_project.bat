@echo off
setlocal

echo ======================================================
echo   Digital Bishi / Chit Fund + Credit Platform
echo ======================================================
echo.

:: Check if backend venv exists
if not exist "backend\venv\Scripts\python.exe" (
    echo [ERROR] Backend virtual environment not found in backend\venv
    echo Please run 'cd backend && python -m venv venv' first.
    pause
    exit /b
)

:: 1. Start Backend in a new window
echo [1/2] Launching Backend (FastAPI)...
start "Chit Fund Backend" cmd /k "cd backend && venv\Scripts\python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: 2. Start Mobile in a new window
echo [2/2] Launching Mobile (Expo)...
start "Chit Fund Mobile" cmd /k "cd mobile && npx expo start -c --tunnel --go"

echo.
echo ======================================================
echo Both systems are starting in separate windows.
echo.
echo [Backend] http://localhost:8000/docs
echo [Mobile]  Follow the instructions in the Expo window.
echo ======================================================
echo.
pause
