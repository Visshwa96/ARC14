import { useEffect, useState } from 'react'
import useStore from '../store/useStore'

function DailyLogs() {
  const { logs, fetchLogs, createLog, updateLog, deleteLog } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editingLog, setEditingLog] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    mood: 'neutral',
    energy: 5,
    tags: '',
  })

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const logData = {
      ...formData,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
    }

    if (editingLog) {
      await updateLog(editingLog._id, logData)
      setEditingLog(null)
    } else {
      await createLog(logData)
    }

    setFormData({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      mood: 'neutral',
      energy: 5,
      tags: '',
    })
    setShowForm(false)
  }

  const handleEdit = (log) => {
    setEditingLog(log)
    setFormData({
      title: log.title,
      content: log.content,
      date: new Date(log.date).toISOString().split('T')[0],
      mood: log.mood || 'neutral',
      energy: log.energy || 5,
      tags: log.tags?.join(', ') || '',
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingLog(null)
    setFormData({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      mood: 'neutral',
      energy: 5,
      tags: '',
    })
  }

  const moodEmojis = {
    great: '😄',
    good: '🙂',
    neutral: '😐',
    bad: '😔',
    terrible: '😢',
  }

  const sortedLogs = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Daily Logs</h1>
          <p className="text-slate-400">Track your daily activities and reflections</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '+ New Log'}
        </button>
      </div>

      {/* Log Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">
            {editingLog ? 'Edit Log' : 'Create New Log'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="input"
                placeholder="e.g., Productive Monday"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="input"
                rows="6"
                placeholder="What happened today? What did you learn?"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Mood
                </label>
                <select
                  value={formData.mood}
                  onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                  className="input"
                >
                  <option value="great">😄 Great</option>
                  <option value="good">🙂 Good</option>
                  <option value="neutral">😐 Neutral</option>
                  <option value="bad">😔 Bad</option>
                  <option value="terrible">😢 Terrible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Energy Level: {formData.energy}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.energy}
                  onChange={(e) => setFormData({ ...formData, energy: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="input"
                placeholder="work, exercise, family"
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary flex-1">
                {editingLog ? 'Update Log' : 'Create Log'}
              </button>
              <button type="button" onClick={handleCancel} className="btn bg-slate-700">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Logs List */}
      <div className="space-y-4">
        {sortedLogs.map((log) => (
          <div key={log._id} className="card hover:ring-2 hover:ring-arc-primary transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{moodEmojis[log.mood] || '😐'}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{log.title}</h3>
                    <p className="text-sm text-slate-400">
                      {new Date(log.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(log)}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteLog(log._id)}
                  className="btn bg-red-600 hover:bg-red-700 text-white text-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            <p className="text-slate-300 whitespace-pre-wrap mb-3">{log.content}</p>

            <div className="flex items-center gap-4 pt-3 border-t border-slate-700">
              <div className="text-sm text-slate-400">
                Energy: <span className="text-white font-medium">{log.energy}/10</span>
              </div>
              {log.tags && log.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {log.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {logs.length === 0 && !showForm && (
        <div className="card text-center py-12">
          <p className="text-slate-500 mb-4">No logs yet. Start documenting your day!</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            + Create First Log
          </button>
        </div>
      )}
    </div>
  )
}

export default DailyLogs
