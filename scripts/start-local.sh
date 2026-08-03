#!/bin/bash

# Start Script for ED Rare Router (Local Deployment)
#
# This script starts the web server for local deployment.
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

# Start the web server
if [ "$USE_PM2" = true ]; then
    echo ""
    echo "🚀 Starting web server with PM2..."
    echo ""

    pm2 start npm --name "edrr-web" -- run dev

    echo ""
    echo "✅ Server started!"
    echo ""
    echo "Web Server: http://localhost:4321"
    echo ""
    echo "PM2 Commands:"
    echo "  pm2 status    - View service status"
    echo "  pm2 logs      - View logs"
    echo "  pm2 stop all  - Stop the server"
    echo "  pm2 restart all - Restart the server"
    echo ""
else
    echo ""
    echo "🚀 Starting web server in foreground..."
    echo ""
    echo "Web Server: http://localhost:4321"
    echo ""
    echo "Press Ctrl+C to stop"
    echo ""

    npm run dev
fi
