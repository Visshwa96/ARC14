# ARC-14 Fullstack System

A comprehensive fullstack application for personal development through habit tracking, daily logging, journaling, and the ARC (Action-Reflection-Correction) cycle framework with Mirror-14 rule engine.

## 🎯 Features

### Core Functionality
- **Boot Screen**: Animated loading sequence with system initialization
- **Dashboard**: Real-time overview of all activities and statistics
- **Habit Tracker**: Create, track, and maintain daily habits with streak counting
- **Daily Logs**: Document daily activities with mood and energy tracking
- **Journal**: Personal journaling system with categories and tags
- **ARC Cycles**: Structured Action-Reflection-Correction framework
- **Mirror-14 Engine**: AI-powered rule-based evaluation system

### Technical Features
- ✅ Fully offline-capable with local MongoDB
- ✅ Real-time updates with Zustand state management
- ✅ Responsive design with TailwindCSS
- ✅ RESTful API with Express
- ✅ MongoDB for persistent storage
- ✅ React Router for seamless navigation

## 📁 Project Structure

```
arc14/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── BootScreen.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── HabitTracker.jsx
│   │   │   ├── DailyLogs.jsx
│   │   │   ├── Journal.jsx
│   │   │   ├── ARCCycles.jsx
│   │   │   ├── Layout.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── store/          # Zustand store
│   │   │   └── useStore.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── server/                 # Node.js Backend
    ├── models/             # MongoDB schemas
    │   ├── Habit.js
    │   ├── DailyLog.js
    │   ├── Journal.js
    │   └── ARCCycle.js
    ├── routes/             # API routes
    │   ├── habitRoutes.js
    │   ├── logRoutes.js
    │   ├── journalRoutes.js
    │   ├── arcCycleRoutes.js
    │   └── mirror14Routes.js
    ├── server.js
    ├── package.json
    └── .env
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local installation)
- npm or yarn

### Backend Setup

```powershell
cd server
npm install
# Start MongoDB locally first
npm run dev
```

### Frontend Setup

```powershell
cd client
npm install
npm run dev
```

### Environment Variables

Create `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/arc14
NODE_ENV=development
```

## Commands

### Client
```powershell
cd client
npm install -D tailwindcss postcss autoprefixer
npm install zustand react-router-dom axios
npx tailwindcss init -p
npm run dev          # Start development server
npm run build        # Build for production
```

### Server
```powershell
cd server
npm init -y
npm install express mongoose dotenv cors
npm install -D nodemon
npm run dev          # Start with nodemon
npm start            # Start production server
```

## API Endpoints

- `GET/POST /api/habits` - Manage habits
- `GET/POST /api/logs` - Daily logs
- `GET/POST /api/journals` - Journal entries
- `GET/POST /api/arc-cycles` - ARC cycles
- `POST /api/mirror14/evaluate` - Mirror-14 rule evaluation

## License

MIT
