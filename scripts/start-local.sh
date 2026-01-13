#!/bin/bash

# Start Script for ED Rare Router (Local Deployment)
# 
# This script starts both the web server and EDDN worker service
# for local deployment.
#
# Usage: ./scripts/start-local.sh
# Or: bash scripts/start-local.sh

set -e

echo "=========================================="
echo "ED Rare Router - Local Deployment"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "   Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if PM2 is available (optional, for better process management)
USE_PM2=false
if command -v pm2 &> /dev/null; then
    echo "✓ PM2 detected - will use PM2 for process management"
    USE_PM2=true
else
    echo "ℹ PM2 not found - will run in foreground"
    echo "  Install PM2 for better process management: npm install -g pm2"
fi

# Export rares data if needed
if [ ! -f "data/rares.json" ]; then
    echo "📝 Generating rares.json..."
    npm run export:rares
fi

# Start services
if [ "$USE_PM2" = true ]; then
    echo ""
    echo "🚀 Starting services with PM2..."
    echo ""
    
    # Start web server
    pm2 start npm --name "edrr-web" -- run dev
    
    # Start EDDN worker (if ZeroMQ is available)
    if npm list zeromq &> /dev/null 2>&1; then
        pm2 start npm --name "edrr-worker" -- run worker
        echo "✓ EDDN worker started"
    else
        echo "⚠ EDDN worker skipped (ZeroMQ not available)"
        echo "  Install ZeroMQ to enable real-time market data"
    fi
    
    echo ""
    echo "✅ Services started!"
    echo ""
    echo "Web Server: http://localhost:4321"
    echo ""
    echo "PM2 Commands:"
    echo "  pm2 status    - View service status"
    echo "  pm2 logs      - View logs"
    echo "  pm2 stop all  - Stop all services"
    echo "  pm2 restart all - Restart all services"
    echo ""
else
    echo ""
    echo "🚀 Starting services in foreground..."
    echo ""
    echo "Web Server: http://localhost:4321"
    echo ""
    echo "Press Ctrl+C to stop all services"
    echo ""
    
    # Start web server in background
    npm run dev &
    WEB_PID=$!
    
    # Start EDDN worker if available
    if npm list zeromq &> /dev/null 2>&1; then
        npm run worker &
        WORKER_PID=$!
        echo "✓ EDDN worker started (PID: $WORKER_PID)"
    else
        echo "⚠ EDDN worker skipped (ZeroMQ not available)"
    fi
    
    echo "✓ Web server started (PID: $WEB_PID)"
    echo ""
    
    # Wait for interrupt
    trap "kill $WEB_PID $WORKER_PID 2>/dev/null; exit" INT TERM
    wait
fi
