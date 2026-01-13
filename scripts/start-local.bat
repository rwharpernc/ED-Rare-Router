@echo off
REM Start Script for ED Rare Router (Local Deployment - Windows)
REM 
REM This script starts both the web server and EDDN worker service
REM for local deployment on Windows.
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

REM Export rares data if needed
if not exist "data\rares.json" (
    echo [INFO] Generating rares.json...
    call npm run export:rares
)

echo.
echo [INFO] Starting services...
echo.
echo Web Server: http://localhost:4321
echo.
echo Press Ctrl+C to stop all services
echo.

REM Start web server
start "EDRR Web Server" cmd /k "npm run dev"

REM Check if ZeroMQ is available and start worker
npm list zeromq >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start "EDRR EDDN Worker" cmd /k "npm run worker"
    echo [INFO] EDDN worker started
) else (
    echo [WARN] EDDN worker skipped (ZeroMQ not available)
    echo        Install ZeroMQ to enable real-time market data
)

echo.
echo [INFO] Services started in separate windows
echo        Close the windows or press Ctrl+C in each to stop
echo.

pause
