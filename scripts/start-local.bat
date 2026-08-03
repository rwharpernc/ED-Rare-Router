@echo off
REM Start Script for ED Rare Router (Local Deployment - Windows)
REM
REM This script starts the web server for local deployment on Windows.
REM
REM Usage: scripts\start-local.bat

echo ==========================================
echo ED Rare Router - Local Deployment
echo ==========================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    echo        Please install Node.js 18+ from https://nodejs.org/
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
)

echo.
echo [INFO] Starting web server...
echo.
echo Web Server: http://localhost:4321
echo.
echo Press Ctrl+C to stop
echo.

REM Start web server
start "EDRR Web Server" cmd /k "npm run dev"

echo.
echo [INFO] Server started in a separate window
echo        Close the window or press Ctrl+C in it to stop
echo.

pause
