@echo off
setlocal
echo ==========================================
echo STRATOS AI - SYSTEM INITIALIZER
echo ==========================================

:: 1. Check for .env file
if not exist .env (
    echo [!] No .env file found. Creating from .env.example...
    copy .env.example .env
    echo [!] PLEASE EDIT THE .env FILE WITH YOUR API KEYS BEFORE RUNNING!
    pause
)

:: 2. Start Backend (Force Python 3.12 - required for pydantic/fastapi)
echo [1/2] Launching Backend (FastAPI)...
start cmd /k "cd backend && py -3.10 -m pip install --prefer-binary -r requirements.txt && py -3.10 main.py"

:: 3. Start Frontend
echo [2/2] Launching Frontend (Next.js)...
start cmd /k "cd frontend && npm install --legacy-peer-deps && npm run dev"

echo ==========================================
echo System is starting! 
echo 1. Backend: http://localhost:8000
echo 2. Frontend: http://localhost:3000
echo ==========================================
pause
