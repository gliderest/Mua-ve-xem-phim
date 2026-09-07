@echo off
title CINÉRA - Web Prototype
cd /d "%~dp0"

echo ============================================
echo   CINERA - Cinema Ticket Booking Web
echo   (Prototype frontend - khong can database)
echo ============================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
  echo [LOI] Khong tim thay Node.js. Hay cai Node.js truoc:
  echo       https://nodejs.org  (ban LTS)
  pause
  exit /b 1
)

if not exist node_modules (
  echo Dang cai dependencies lan dau, xin doi...
  call npm install
)

echo.
echo Dang khoi dong web... trinh duyet se tu mo:
echo    http://localhost:5173
echo Nhan Ctrl+C de dung.
echo.
start "" http://localhost:5173
call npm run dev:web