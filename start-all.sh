#!/bin/bash

# Mood AI - Start All Services Script
echo "🚀 Starting Mood AI Application..."

# Create MongoDB data directory
mkdir -p /tmp/mongodb

# Start MongoDB in background
echo "📊 Starting MongoDB..."
mongod --dbpath /tmp/mongodb --logpath /tmp/mongodb.log --fork
sleep 2

# Check if MongoDB started successfully
if pgrep mongod > /dev/null; then
    echo "✅ MongoDB started successfully"
else
    echo "❌ MongoDB failed to start"
    exit 1
fi

# Start backend server in background
echo "🔧 Starting Backend Server..."
cd /workspaces/skills-copilot-codespaces-vscode
npm start &
BACKEND_PID=$!
sleep 3

# Start frontend server in background
echo "🖥️  Starting Frontend Server..."
cd /workspaces/skills-copilot-codespaces-vscode/frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 All services are starting up!"
echo "📊 MongoDB: Running on port 27017"
echo "🔧 Backend API: https://congenial-space-acorn-4j946xwxgpqxc7qw5-3000.app.github.dev"
echo "🖥️  Frontend App: https://congenial-space-acorn-4j946xwxgpqxc7qw5-3001.app.github.dev"
echo ""
echo "💡 Press Ctrl+C to stop all services"

# Wait for user interrupt
trap 'echo "🛑 Stopping all services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; pkill mongod 2>/dev/null; echo "✅ All services stopped"; exit 0' INT

# Keep script running
wait