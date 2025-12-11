import { useEffect, useState } from 'react'
import useStore from '../store/useStore'

function ARCCycles() {
  const { arcCycles, fetchARCCycles, createARCCycle, updateARCCycle, deleteARCCycle, evaluateMirror14 } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editingCycle, setEditingCycle] = useState(null)
  const [selectedCycle, setSelectedCycle] = useState(null)
  const [mirror14Result, setMirror14Result] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    action: '',
    reflection: '',
    correction: '',
    status: 'active',
    priority: 'medium',
  })

  useEffect(() => {
    fetchARCCycles()
  }, [fetchARCCycles])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (editingCycle) {
      await updateARCCycle(editingCycle._id, formData)
      setEditingCycle(null)
    } else {
      await createARCCycle(formData)
    }

    setFormData({
      title: '',
      action: '',
      reflection: '',
      correction: '',
      status: 'active',
      priority: 'medium',
    })
    setShowForm(false)
  }

  const handleEdit = (cycle) => {
    setEditingCycle(cycle)
    setFormData({
      title: cycle.title,
      action: cycle.action,
      reflection: cycle.reflection || '',
      correction: cycle.correction || '',
      status: cycle.status,
      priority: cycle.priority || 'medium',
    })
    setShowForm(true)
    setSelectedCycle(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCycle(null)
    setFormData({
      title: '',
      action: '',
      reflection: '',
      correction: '',
      status: 'active',
      priority: 'medium',
    })
  }

  const handleMirror14Evaluate = async (cycle) => {
    const result = await evaluateMirror14({
      action: cycle.action,
      reflection: cycle.reflection,
      correction: cycle.correction,
    })
    setMirror14Result(result)
  }

  const statusColors = {
    active: 'bg-blue-600',
    reflecting: 'bg-yellow-600',
    correcting: 'bg-orange-600',
    completed: 'bg-green-600',
  }

  const priorityColors = {
    low: 'bg-slate-600',
    medium: 'bg-blue-600',
    high: 'bg-red-600',
  }

  const sortedCycles = [...arcCycles].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">ARC Cycles</h1>
          <p className="text-slate-400">Action → Reflection → Correction framework</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '+ New Cycle'}
        </button>
      </div>

      {/* ARC Cycle Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">
            {editingCycle ? 'Edit ARC Cycle' : 'Create New ARC Cycle'}
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
                placeholder="e.g., Improve Morning Routine"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <span className="text-blue-400">Action</span> - What did you do?
              </label>
              <textarea
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                className="input"
                rows="4"
                placeholder="Describe the action you took..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <span className="text-yellow-400">Reflection</span> - What did you learn?
              </label>
              <textarea
                value={formData.reflection}
                onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
                className="input"
                rows="4"
                placeholder="Reflect on the results and insights..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <span className="text-green-400">Correction</span> - What will you change?
              </label>
              <textarea
                value={formData.correction}
                onChange={(e) => setFormData({ ...formData, correction: e.target.value })}
                className="input"
                rows="4"
                placeholder="Describe how you'll improve next time..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input"
                >
                  <option value="active">Active</option>
                  <option value="reflecting">Reflecting</option>
                  <option value="correcting">Correcting</option>
                  <option value="completed">Completed</option>
                </select>
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
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary flex-1">
                {editingCycle ? 'Update Cycle' : 'Create Cycle'}
              </button>
              <button type="button" onClick={handleCancel} className="btn bg-slate-700">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mirror-14 Results */}
      {mirror14Result && (
        <div className="card bg-gradient-to-br from-purple-900/50 to-blue-900/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">🔮 Mirror-14 Evaluation</h2>
            <button
              onClick={() => setMirror14Result(null)}
              className="btn bg-slate-700 text-sm"
            >
              Close
            </button>
          </div>
          <div className="space-y-3 text-slate-200">
            <p><strong>Insight:</strong> {mirror14Result.insight}</p>
            <p><strong>Score:</strong> {mirror14Result.score}/10</p>
            <div>
              <strong>Recommendations:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {mirror14Result.recommendations?.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Cycle Viewer */}
      {selectedCycle && !showForm && (
        <div className="card">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[selectedCycle.status]} text-white`}>
                  {selectedCycle.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[selectedCycle.priority]} text-white`}>
                  {selectedCycle.priority} priority
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">{selectedCycle.title}</h2>
              <p className="text-sm text-slate-400 mt-1">
                Created {new Date(selectedCycle.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleMirror14Evaluate(selectedCycle)}
                className="btn btn-secondary"
              >
                🔮 Evaluate
              </button>
              <button
                onClick={() => handleEdit(selectedCycle)}
                className="btn bg-blue-600 hover:bg-blue-700 text-white"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  deleteARCCycle(selectedCycle._id)
                  setSelectedCycle(null)
                }}
                className="btn bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedCycle(null)}
                className="btn bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-700">
              <h3 className="text-lg font-bold text-blue-400 mb-2">💪 Action</h3>
              <p className="text-slate-300 whitespace-pre-wrap">{selectedCycle.action}</p>
            </div>

            {selectedCycle.reflection && (
              <div className="p-4 bg-yellow-900/30 rounded-lg border border-yellow-700">
                <h3 className="text-lg font-bold text-yellow-400 mb-2">🤔 Reflection</h3>
                <p className="text-slate-300 whitespace-pre-wrap">{selectedCycle.reflection}</p>
              </div>
            )}

            {selectedCycle.correction && (
              <div className="p-4 bg-green-900/30 rounded-lg border border-green-700">
                <h3 className="text-lg font-bold text-green-400 mb-2">✨ Correction</h3>
                <p className="text-slate-300 whitespace-pre-wrap">{selectedCycle.correction}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cycles List */}
      {!selectedCycle && !showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedCycles.map((cycle) => (
            <div
              key={cycle._id}
              onClick={() => setSelectedCycle(cycle)}
              className="card cursor-pointer hover:ring-2 hover:ring-arc-primary transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[cycle.status]} text-white`}>
                    {cycle.status}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[cycle.priority]} text-white`}>
                    {cycle.priority}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{cycle.title}</h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-blue-400">💪</span>
                  <p className="text-slate-400 line-clamp-2">{cycle.action}</p>
                </div>
                {cycle.reflection && (
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400">🤔</span>
                    <p className="text-slate-400 line-clamp-2">{cycle.reflection}</p>
                  </div>
                )}
                {cycle.correction && (
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✨</span>
                    <p className="text-slate-400 line-clamp-2">{cycle.correction}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700 text-xs text-slate-500">
                {new Date(cycle.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {arcCycles.length === 0 && !showForm && (
        <div className="card text-center py-12">
          <p className="text-slate-500 mb-4">No ARC cycles yet. Start your first cycle!</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            + Create First Cycle
          </button>
        </div>
      )}
    </div>
  )
}

export default ARCCycles
