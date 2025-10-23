#!/bin/bash
# Script to start Admin Panel

echo "🚀 Starting MASER Admin Panel..."
cd /app/admin-panel

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    yarn install
fi

# Start admin panel
echo "✅ Starting on port 3001..."
PORT=3001 yarn start
