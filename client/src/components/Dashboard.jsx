import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import useStore from '../store/useStore'

function Dashboard() {
  const { habits, logs, arcCycles, fetchHabits, fetchLogs, fetchARCCycles, loading, error } = useStore()
  const [stats, setStats] = useState({
    totalHabits: 0,
    completedToday: 0,
    totalLogs: 0,
    activeARCCycles: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchHabits(),
        fetchLogs(),
        fetchARCCycles()
      ])
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  fetchData()
}, [])   // IMPORTANT: no dependencies here

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    const completedToday = habits.filter((h) =>
      h.completedDates?.some((d) => d.startsWith(today))
    ).length

    const activeARCCycles = arcCycles.filter((c) => c.status !== 'completed').length

    setStats({
      totalHabits: habits.length,
      completedToday,
      totalLogs: logs.length,
      activeARCCycles,
    })
  }, [habits, logs, arcCycles])

  const statCards = [
    { label: 'Total Habits', value: stats.totalHabits, icon: '✓', colorClass: 'text-blue-400' },
    { label: 'Completed Today', value: stats.completedToday, icon: '🎯', colorClass: 'text-green-400' },
    { label: 'Daily Logs', value: stats.totalLogs, icon: '📝', colorClass: 'text-purple-400' },
    { label: 'Active ARC Cycles', value: stats.activeARCCycles, icon: '🔄', colorClass: 'text-orange-400' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Welcome to your ARC-14 system overview</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card text-center">
          <p className="text-slate-400">Loading your data...</p>
        </div>
      )}

      {/* Error Display */}
      {!isLoading && error && (
        <div className="card bg-red-900/30 border-red-700">
          <p className="text-red-300">⚠️ Unable to connect to backend. Make sure the server is running on port 5000.</p>
          <p className="text-sm text-red-400 mt-2">Run: cd server && npm run dev</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="card">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{card.icon}</span>
              <div className={`text-4xl font-bold ${card.colorClass}`}>
                {card.value}
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">{card.label}</h3>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Habits */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Habits</h2>
          {habits.length > 0 ? (
            <div className="space-y-3">
              {habits.slice(0, 5).map((habit) => (
                <div
                  key={habit._id}
                  className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                >
                  <span className="text-white">{habit.name}</span>
                  <span className="text-sm text-slate-400">
                    {habit.completedDates?.length || 0} days
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No habits yet. Create your first habit!</p>
          )}
        </div>

        {/* Recent Logs */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Recent Logs</h2>
          {logs.length > 0 ? (
            <div className="space-y-3">
              {logs.slice(0, 5).map((log) => (
                <div
                  key={log._id}
                  className="p-3 bg-slate-700 rounded-lg"
                >
                  <div className="text-white font-medium mb-1">{log.title}</div>
                  <div className="text-sm text-slate-400">
                    {new Date(log.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No logs yet. Start logging your day!</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/habits" className="btn btn-primary text-center">Add Habit</Link>
          <Link to="/logs" className="btn btn-secondary text-center">New Log</Link>
          <Link to="/journal" className="btn btn-primary text-center">Write Journal</Link>
          <Link to="/arc-cycles" className="btn btn-secondary text-center">Start ARC Cycle</Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
