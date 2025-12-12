import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import BootScreen from './components/BootScreen'
import Dashboard from './components/Dashboard'
import HabitTracker from './components/HabitTracker'
import DailyLogs from './components/DailyLogs'
import Journal from './components/Journal'
import ARCCycles from './components/ARCCycles'
import ScheduledTasks from './components/ScheduledTasks'
import Layout from './components/Layout'

function App() {
  const [isBooting, setIsBooting] = useState(true)

  useEffect(() => {
    // Simulate boot sequence
    const timer = setTimeout(() => {
      setIsBooting(false)
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [])

  if (isBooting) {
    return <BootScreen />
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="habits" element={<HabitTracker />} />
        <Route path="logs" element={<DailyLogs />} />
        <Route path="journal" element={<Journal />} />
        <Route path="arc-cycles" element={<ARCCycles />} />
        <Route path="scheduled-tasks" element={<ScheduledTasks />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
