@echo off
title Kinetix - Autonomous Local AI Video Studio
echo ===================================================
echo   KINETIX - Autonomous Local Text-to-Video Studio
echo   Developed by JOJIN JOHN
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Kinetix Backend on http://127.0.0.1:8000 ...
start "Kinetix Backend API" cmd /k "cd backend && call venv\Scripts\activate.bat && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/3] Starting Kinetix Frontend on http://localhost:3000 ...
start "Kinetix Frontend Studio" cmd /k "cd frontend && npm run dev"

timeout /t 4 /nobreak >nul

echo [3/3] Opening Kinetix Studio in your default browser...
start http://localhost:3000

echo.
echo ===================================================
echo   Kinetix is running!
echo   Studio UI: http://localhost:3000
echo   API Docs:  http://127.0.0.1:8000/docs
echo ===================================================
pause
