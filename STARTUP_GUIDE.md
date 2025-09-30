# 🧠 Mood AI - Complete Startup Guide

## 🚀 Quick Start Commands

### Option 1: Start All Services with One Command (Recommended)
```bash
cd /workspaces/skills-copilot-codespaces-vscode
npm run start-all
```

### Option 2: Using the Shell Script
```bash
cd /workspaces/skills-copilot-codespaces-vscode
./start-all.sh
```

### Option 3: Using Concurrently (Development Mode)
```bash
cd /workspaces/skills-copilot-codespaces-vscode
npm run dev-all
```

## 🛠️ Manual Setup Commands

### 1. Install Dependencies
```bash
npm run setup
```

### 2. Start Services Individually

**Start MongoDB:**
```bash
npm run start-mongo
```

**Start Backend Server:**
```bash
npm run start-backend
```

**Start Frontend Server:**
```bash
npm run start-frontend
```

## 🌐 Application URLs

- **Frontend (React App):** https://congenial-space-acorn-4j946xwxgpqxc7qw5-3001.app.github.dev
- **Backend API:** https://congenial-space-acorn-4j946xwxgpqxc7qw5-3000.app.github.dev
- **MongoDB:** localhost:27017

## 📋 Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run start-all` | Start all services (MongoDB + Backend + Frontend) |
| `npm run dev-all` | Start all services in development mode |
| `npm run setup` | Install all dependencies for backend and frontend |
| `npm run start-mongo` | Start MongoDB only |
| `npm run start-backend` | Start backend server only |
| `npm run start-frontend` | Start React frontend only |
| `npm start` | Start backend server only |
| `npm run dev` | Start backend with nodemon (auto-restart) |
| `npm test` | Run backend tests |

## 🧪 Demo Credentials

Use these credentials to test the application:

**Demo User 1:**
- Username: `demo_user`
- Email: `demo@moodai.com`
- Password: `DemoPass123!`

**Demo User 2:**
- Username: `test_user`
- Email: `test@moodai.com`
- Password: `TestPass123!`

## 🛑 Stopping Services

To stop all services:
- If using `start-all.sh`: Press `Ctrl+C`
- If running manually: Use `Ctrl+C` in each terminal

## ✨ Features Available

- ✅ User Registration & Authentication
- ✅ Daily Mood Logging with Notes
- ✅ AI-Powered Sentiment Analysis
- ✅ Personalized Mood Recommendations
- ✅ Interactive Analytics Dashboard
- ✅ AI Chat Support
- ✅ Profile Management
- ✅ Secure Data Encryption

## 🔧 Troubleshooting

**MongoDB Connection Issues:**
```bash
# Kill any existing MongoDB processes
pkill mongod
# Restart MongoDB
npm run start-mongo
```

**Port Conflicts:**
```bash
# Kill processes on specific ports
pkill -f "node server.js"
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

**Full Reset:**
```bash
# Stop all processes and restart
pkill mongod
pkill node
npm run start-all
```