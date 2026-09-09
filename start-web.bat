@echo off
title CINEGA - Cinema Ticket System
cd /d "%~dp0"

echo ============================================
echo   CINEGA - Cinema Ticket Booking System
echo   (Backend :3000 + Web :5173)
echo ============================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo [LOI] Khong tim thay Node.js. Cai Node.js truoc: https://nodejs.org
  pause
  exit /b 1
)

if not exist node_modules (
  echo Dang cai dependencies lan dau, xin doi...
  call npm install
)

echo.
echo Dang khoi dong BACKEND (port 3000)...
start "CINEGA Backend" /min cmd /c "npm run dev:backend"

echo Dang khoi dong WEB (port 5173)... trinh duyet tu dong mo.
echo   Backend: http://localhost:3000/health
echo   Web:     http://localhost:5173
echo Nhan Ctrl+C trong cua so Web de dung.
echo.
start "" http://localhost:5173
call npm run dev:web