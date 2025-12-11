import { NavLink } from 'react-router-dom'

function Sidebar() {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/habits', label: 'Habits', icon: '✓' },
    { path: '/logs', label: 'Daily Logs', icon: '📝' },
    { path: '/journal', label: 'Journal', icon: '📖' },
    { path: '/arc-cycles', label: 'ARC Cycles', icon: '🔄' },
  ]

  return (
    <aside className="w-64 bg-slate-800 border-r border-slate-700 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          ARC-14
        </h1>
        <p className="text-xs text-slate-500 mt-1">Mirror-14 System</p>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-arc-primary text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-slate-700">
        <div className="text-xs text-slate-600">
          <div>Offline Mode</div>
          <div className="mt-1 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Connected</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
