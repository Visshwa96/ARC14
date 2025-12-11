# Quick Start Guide

## Step 1: Install Dependencies

### Backend
```powershell
cd server
npm install
```

### Frontend
```powershell
cd client
npm install
```

## Step 2: Start MongoDB

```powershell
# Start MongoDB service (Windows)
net start MongoDB

# Or if MongoDB isn't installed as a service
mongod
```

## Step 3: Start the Application

### Terminal 1 - Backend
```powershell
cd server
npm run dev
```
✅ Backend running on http://localhost:5000

### Terminal 2 - Frontend
```powershell
cd client
npm run dev
```
✅ Frontend running on http://localhost:5173

## Step 4: Open in Browser

Navigate to: **http://localhost:5173**

You'll see:
1. Boot screen (3 seconds)
2. Dashboard with empty state
3. Ready to create habits, logs, journals, and ARC cycles!

## Quick Feature Tour

### Create Your First Habit
1. Click "Habits" in sidebar
2. Click "+ New Habit"
3. Fill in details
4. Track daily!

### Log Your Day
1. Click "Daily Logs"
2. Click "+ New Log"
3. Document your day

### Start an ARC Cycle
1. Click "ARC Cycles"
2. Click "+ New Cycle"
3. Describe Action, Reflection, Correction
4. Click "🔮 Evaluate" for Mirror-14 insights

Enjoy your ARC-14 system! 🚀
