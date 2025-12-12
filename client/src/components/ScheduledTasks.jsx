import { useEffect, useState } from 'react'
import axios from 'axios'
import useStore from '../store/useStore'

const API_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api')

function ScheduledTasks() {
  const { scheduledTasks, fetchScheduledTasks, createScheduledTask, updateScheduledTask, completeScheduledTask, deleteScheduledTask, fetchTaskStats, loading, error } = useStore()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'medium',
    category: 'personal'
  })
  
  const [timeInput, setTimeInput] = useState({
    hour: '12',
    minute: '00',
    period: 'PM'
  })
  
  const [filter, setFilter] = useState('upcoming')
  const [stats, setStats] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '')
  const [showEmailSetup, setShowEmailSetup] = useState(!localStorage.getItem('userEmail'))
  const [emailTestStatus, setEmailTestStatus] = useState(null)
  const [testingEmail, setTestingEmail] = useState(false)
  const [schedulingConfig, setSchedulingConfig] = useState(null)

  useEffect(() => {
    loadTasks()
    loadStats()
    loadSchedulingConfig()
  }, [filter])

  const loadSchedulingConfig = async () => {
    try {
      const response = await axios.get(`${API_URL}/scheduled-tasks/config/scheduling-window`)
      setSchedulingConfig(response.data)
    } catch (error) {
      console.error('Failed to load scheduling config:', error)
    }
  }

  const loadTasks = async () => {
    const filters = {}
    if (filter === 'upcoming') filters.upcoming = 'true'
    else if (filter !== 'all') filters.status = filter
    
    await fetchScheduledTasks(filters)
  }

  const loadStats = async () => {
    const data = await fetchTaskStats()
    setStats(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Combine time input into scheduledTime format
    const formattedTime = `${timeInput.hour}:${timeInput.minute} ${timeInput.period}`
    const submitData = { ...formData, scheduledTime: formattedTime }
    
    if (editingId) {
      await updateScheduledTask(editingId, submitData)
      setEditingId(null)
    } else {
      await createScheduledTask(submitData)
    }
    
    resetForm()
    loadTasks()
    loadStats()
  }

  const handleEdit = (task) => {
    // Parse scheduledTime from "7:30 PM" format
    const timeMatch = task.scheduledTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (timeMatch) {
      setTimeInput({
        hour: timeMatch[1],
        minute: timeMatch[2],
        period: timeMatch[3].toUpperCase()
      })
    }
    
    setFormData({
      title: task.title,
      description: task.description || '',
      scheduledDate: new Date(task.scheduledDate).toISOString().split('T')[0],
      scheduledTime: task.scheduledTime,
      priority: task.priority,
      category: task.category
    })
    setEditingId(task._id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleComplete = async (id) => {
    await completeScheduledTask(id)
    loadTasks()
    loadStats()
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteScheduledTask(id)
      loadTasks()
      loadStats()
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      scheduledDate: '',
      scheduledTime: '',
      priority: 'medium',
      category: 'personal'
    })
    setTimeInput({
      hour: '12',
      minute: '00',
      period: 'PM'
    })
    setEditingId(null)
  }

  const saveEmail = () => {
    if (userEmail) {
      localStorage.setItem('userEmail', userEmail)
      setShowEmailSetup(false)
      setEmailTestStatus(null)
    }
  }

  const testEmail = async () => {
    if (!userEmail) {
      alert('Please enter your email first')
      return
    }

    setTestingEmail(true)
    setEmailTestStatus(null)

    try {
      // Add timeout to prevent infinite pending state
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 120 second timeout (email can be slow on free tier)

      const response = await axios.post(`${API_URL}/scheduled-tasks/test-email`, { 
        email: userEmail 
      }, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      setEmailTestStatus({ 
        type: 'success', 
        message: 'Test email sent! Check your inbox (and spam folder).' 
      })
    } catch (error) {
      if (error.name === 'CanceledError') {
        setEmailTestStatus({ 
          type: 'error', 
          message: 'Request timed out. Please check your connection and try again.' 
        })
      } else {
        setEmailTestStatus({ 
          type: 'error', 
          message: error.response?.data?.error || 'Failed to send test email. Check server logs.' 
        })
      }
    } finally {
      setTestingEmail(false)
    }
  }

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  const formatDateTime = (date, time) => {
    const d = new Date(date)
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    return `${dateStr} at ${time}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'missed': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getPriorityEmoji = (priority) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  const getCategoryEmoji = (category) => {
    switch (category) {
      case 'work': return '💼'
      case 'personal': return '👤'
      case 'health': return '💪'
      case 'learning': return '📚'
      case 'social': return '👥'
      default: return '📌'
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">⏰ Scheduled Tasks</h1>
        <p className="text-slate-400">Schedule tasks ahead and earn points for punctuality</p>
      </div>

      {/* Email Setup Card - Always visible */}
      <div className="card bg-blue-900/30 border-blue-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold">📧 Email Notifications</h3>
          {userEmail && !showEmailSetup && (
            <button 
              onClick={() => setShowEmailSetup(true)} 
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              ✏️ Edit Email
            </button>
          )}
        </div>
        
        {showEmailSetup ? (
          <>
            <p className="text-slate-400 text-sm mb-4">
              Enter your email to receive reminders 30 minutes before each scheduled task
            </p>
            <div className="flex gap-3 mb-3">
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your.email@gmail.com"
                className="input flex-1"
              />
              <button onClick={saveEmail} className="btn btn-primary">
                Save Email
              </button>
              <button 
                onClick={testEmail} 
                className="btn btn-secondary"
                disabled={testingEmail || !userEmail}
              >
                {testingEmail ? '📤 Sending...' : '🧪 Test Email'}
              </button>
            </div>
            {emailTestStatus && (
              <div className={`text-sm p-3 rounded ${
                emailTestStatus.type === 'success' 
                  ? 'bg-green-900/30 text-green-300 border border-green-700' 
                  : 'bg-red-900/30 text-red-300 border border-red-700'
              }`}>
                {emailTestStatus.message}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-slate-400">Current email:</span>
              <span className="text-white font-medium">{userEmail}</span>
            </div>
            <button 
              onClick={testEmail} 
              className="btn btn-secondary"
              disabled={testingEmail}
            >
              {testingEmail ? '📤 Sending...' : '🧪 Send Test Email'}
            </button>
            {emailTestStatus && (
              <div className={`text-sm p-3 rounded mt-3 ${
                emailTestStatus.type === 'success' 
                  ? 'bg-green-900/30 text-green-300 border border-green-700' 
                  : 'bg-red-900/30 text-red-300 border border-red-700'
              }`}>
                {emailTestStatus.message}
              </div>
            )}
          </>
        )}
      </div>

      {/* Scheduling Window Info */}
      {schedulingConfig && (
        <div className={`card border-2 ${
          schedulingConfig.currentStatus.canSchedule 
            ? 'bg-green-900/20 border-green-600' 
            : 'bg-red-900/20 border-red-600'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">
                {schedulingConfig.currentStatus.canSchedule ? '✅ Scheduling OPEN' : '🔒 Scheduling CLOSED'}
              </h3>
              <div className="space-y-2 text-sm">
                <p className="text-slate-300">
                  <span className="font-semibold">⏰ Can Schedule:</span> Anytime before {schedulingConfig.schedulingWindow.cutoffTime}
                </p>
                <p className="text-slate-300">
                  <span className="font-semibold">🕐 Current Time:</span> {schedulingConfig.currentStatus.currentTime}
                </p>
                <p className="text-slate-300">
                  <span className="font-semibold">📅 Can Plan For:</span> {schedulingConfig.rules.minimumTaskDateFormatted} ({schedulingConfig.rules.minimumTaskDescription})
                </p>
              </div>
              
              {/* Early Completion Bonus Message */}
              {schedulingConfig.earlyCompletionBonus?.active && (
                <div className="mt-3 p-3 bg-green-900/30 border border-green-600 rounded text-sm">
                  <strong>🎉 EARLY COMPLETION BONUS!</strong>
                  <p className="mt-1">{schedulingConfig.earlyCompletionBonus.message}</p>
                </div>
              )}
              
              {!schedulingConfig.currentStatus.canSchedule && (
                <div className="mt-3 p-3 bg-red-900/30 border border-red-700 rounded text-sm">
                  <strong>🔒 Scheduling Closed:</strong> Task planning has ended for today. You can only complete existing tasks now to earn points. Come back tomorrow before {schedulingConfig.schedulingWindow.cutoffTime} to schedule new tasks!
                </div>
              )}
              
              {schedulingConfig.currentStatus.canSchedule && schedulingConfig.earlyCompletionBonus && !schedulingConfig.earlyCompletionBonus.active && schedulingConfig.earlyCompletionBonus.tomorrowTasksCount > 0 && (
                <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded text-sm">
                  <strong>💡 Tip:</strong> {schedulingConfig.earlyCompletionBonus.message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-2xl font-bold text-blue-400">{stats.totalTasks}</div>
            <div className="text-sm text-slate-400">Total Tasks</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-green-400">{stats.totalPointsEarned}</div>
            <div className="text-sm text-slate-400">Points Earned</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-purple-400">{stats.averagePunctualityScore.toFixed(1)}</div>
            <div className="text-sm text-slate-400">Avg Score</div>
          </div>
          <div className="card">
            <div className="text-2xl font-bold text-orange-400">{stats.completionRate}%</div>
            <div className="text-sm text-slate-400">Completion Rate</div>
          </div>
        </div>
      )}

      {/* Create/Edit Task Form */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">
          {editingId ? '✏️ Edit Task' : '➕ Schedule New Task'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Team meeting, Gym workout"
                className="input"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
              >
                <option value="work">💼 Work</option>
                <option value="personal">👤 Personal</option>
                <option value="health">💪 Health</option>
                <option value="learning">📚 Learning</option>
                <option value="social">👥 Social</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details about this task..."
              className="input"
              rows="3"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date * {schedulingConfig && !schedulingConfig.rules.canCreateTasksForToday && (
                  <span className="text-xs text-orange-400">(Tomorrow or later)</span>
                )}
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                min={schedulingConfig?.rules.minimumTaskDate || getTodayDate()}
                className="input"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Time *
              </label>
              <div className="flex gap-2">
                {/* Hour */}
                <select
                  value={timeInput.hour}
                  onChange={(e) => setTimeInput({ ...timeInput, hour: e.target.value })}
                  className="input flex-1"
                  required
                >
                  <option value="">Hour</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                
                {/* Minute */}
                <select
                  value={timeInput.minute}
                  onChange={(e) => setTimeInput({ ...timeInput, minute: e.target.value })}
                  className="input flex-1"
                  required
                >
                  <option value="">Min</option>
                  {['00', '15', '30', '45'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                
                {/* AM/PM */}
                <select
                  value={timeInput.period}
                  onChange={(e) => setTimeInput({ ...timeInput, period: e.target.value })}
                  className="input flex-1"
                  required
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input"
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🔴 High</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!editingId && schedulingConfig && !schedulingConfig.currentStatus.canCreateTasks}
            >
              {editingId ? 'Update Task' : 'Schedule Task'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel Edit
              </button>
            )}
            {!editingId && schedulingConfig && !schedulingConfig.currentStatus.canCreateTasks && (
              <span className="text-red-400 text-sm flex items-center">
                🔒 Task scheduling has closed for today. Available before {schedulingConfig.schedulingWindow.cutoffTime} tomorrow!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Point System Info */}
      <div className="card bg-gradient-to-r from-purple-900/30 to-blue-900/30">
        <h3 className="text-lg font-bold mb-3">🎯 Punctuality Point System</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-bold text-green-400">✅ Excellent</div>
            <div className="text-slate-400">5+ min early: 10 pts</div>
            <div className="text-slate-400">On time (±5 min): 8 pts</div>
          </div>
          <div>
            <div className="font-bold text-yellow-400">⚠️ Acceptable</div>
            <div className="text-slate-400">5-15 min late: 5 pts</div>
            <div className="text-slate-400">15-30 min late: 3 pts</div>
          </div>
          <div>
            <div className="font-bold text-red-400">❌ Needs Improvement</div>
            <div className="text-slate-400">30+ min late: 1 pt</div>
            <div className="text-slate-400">Missed (2+ hrs): 0 pts</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['upcoming', 'all', 'pending', 'completed', 'missed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card text-center">
            <p className="text-slate-400">Loading tasks...</p>
          </div>
        ) : scheduledTasks.length === 0 ? (
          <div className="card text-center">
            <p className="text-slate-400">No tasks found. Schedule your first task above!</p>
          </div>
        ) : (
          scheduledTasks.map((task) => (
            <div key={task._id} className="card hover:border-purple-500 transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{getCategoryEmoji(task.category)}</span>
                    <h3 className="text-lg font-bold text-white">{task.title}</h3>
                    <span>{getPriorityEmoji(task.priority)}</span>
                    <span className={`text-sm px-2 py-1 rounded ${getStatusColor(task.status)} bg-slate-700`}>
                      {task.status}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-slate-400 text-sm mb-2">{task.description}</p>
                  )}
                  
                  <div className="text-sm text-slate-500">
                    📅 {formatDateTime(task.scheduledDate, task.scheduledTime)}
                  </div>
                  
                  {task.status === 'completed' && (
                    <div className="mt-2 inline-flex items-center gap-2 bg-green-900/30 border border-green-700 rounded px-3 py-1">
                      <span className="text-green-400 font-bold">
                        🎯 {task.punctualityPoints} points
                      </span>
                      <span className="text-slate-400 text-sm">
                        • Completed {new Date(task.completedAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {task.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleComplete(task._id)}
                        className="btn btn-primary text-sm"
                        title="Mark as completed"
                      >
                        ✅ Complete
                      </button>
                      <button
                        onClick={() => handleEdit(task)}
                        className="btn btn-secondary text-sm"
                        title={schedulingConfig && !schedulingConfig.currentStatus.canModifyTasks 
                          ? "Can only edit during scheduling window" 
                          : "Edit task"}
                        disabled={schedulingConfig && !schedulingConfig.currentStatus.canModifyTasks}
                      >
                        ✏️
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="btn bg-red-600 hover:bg-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    title={schedulingConfig && !schedulingConfig.currentStatus.canDeleteTasks 
                      ? "Can only delete during scheduling window" 
                      : "Delete task"}
                    disabled={schedulingConfig && !schedulingConfig.currentStatus.canDeleteTasks}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {error && (
        <div className="card bg-red-900/30 border-red-700">
          <p className="text-red-300">⚠️ {error}</p>
        </div>
      )}
    </div>
  )
}

export default ScheduledTasks
