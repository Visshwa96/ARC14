import { useEffect, useState } from 'react'
import useStore from '../store/useStore'

function Journal() {
  const { journals, fetchJournals, createJournal, updateJournal, deleteJournal } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editingJournal, setEditingJournal] = useState(null)
  const [selectedJournal, setSelectedJournal] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'personal',
    tags: '',
  })

  useEffect(() => {
    fetchJournals()
  }, [fetchJournals])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const journalData = {
      ...formData,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
    }

    if (editingJournal) {
      await updateJournal(editingJournal._id, journalData)
      setEditingJournal(null)
    } else {
      await createJournal(journalData)
    }

    setFormData({
      title: '',
      content: '',
      category: 'personal',
      tags: '',
    })
    setShowForm(false)
  }

  const handleEdit = (journal) => {
    setEditingJournal(journal)
    setFormData({
      title: journal.title,
      content: journal.content,
      category: journal.category || 'personal',
      tags: journal.tags?.join(', ') || '',
    })
    setShowForm(true)
    setSelectedJournal(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingJournal(null)
    setFormData({
      title: '',
      content: '',
      category: 'personal',
      tags: '',
    })
  }

  const categories = [
    { value: 'personal', label: 'Personal', icon: '👤' },
    { value: 'work', label: 'Work', icon: '💼' },
    { value: 'goals', label: 'Goals', icon: '🎯' },
    { value: 'gratitude', label: 'Gratitude', icon: '🙏' },
    { value: 'reflection', label: 'Reflection', icon: '🤔' },
    { value: 'ideas', label: 'Ideas', icon: '💡' },
  ]

  const sortedJournals = [...journals].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Journal</h1>
          <p className="text-slate-400">Your personal space for thoughts and reflections</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '+ New Entry'}
        </button>
      </div>

      {/* Journal Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">
            {editingJournal ? 'Edit Entry' : 'New Journal Entry'}
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
                placeholder="Give your entry a title..."
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
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="input"
                rows="12"
                placeholder="Write your thoughts..."
                required
              />
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
                placeholder="growth, insights, planning"
              />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary flex-1">
                {editingJournal ? 'Update Entry' : 'Save Entry'}
              </button>
              <button type="button" onClick={handleCancel} className="btn bg-slate-700">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Journal Viewer */}
      {selectedJournal && !showForm && (
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">
                  {categories.find((c) => c.value === selectedJournal.category)?.icon}
                </span>
                <h2 className="text-2xl font-bold text-white">{selectedJournal.title}</h2>
              </div>
              <p className="text-sm text-slate-400">
                {new Date(selectedJournal.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(selectedJournal)}
                className="btn bg-blue-600 hover:bg-blue-700 text-white"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  deleteJournal(selectedJournal._id)
                  setSelectedJournal(null)
                }}
                className="btn bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedJournal(null)}
                className="btn bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              {selectedJournal.content}
            </p>
          </div>

          {selectedJournal.tags && selectedJournal.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-6 pt-4 border-t border-slate-700">
              {selectedJournal.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-slate-700 rounded-full text-sm text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Journal List */}
      {!selectedJournal && !showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedJournals.map((journal) => {
            const category = categories.find((c) => c.value === journal.category)
            const preview = journal.content.slice(0, 150) + (journal.content.length > 150 ? '...' : '')

            return (
              <div
                key={journal._id}
                onClick={() => setSelectedJournal(journal)}
                className="card cursor-pointer hover:ring-2 hover:ring-arc-primary transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{category?.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white line-clamp-1">
                      {journal.title}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {new Date(journal.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-400 line-clamp-3 mb-3">{preview}</p>

                {journal.tags && journal.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap pt-3 border-t border-slate-700">
                    {journal.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                    {journal.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs text-slate-500">
                        +{journal.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {journals.length === 0 && !showForm && (
        <div className="card text-center py-12">
          <p className="text-slate-500 mb-4">Your journal is empty. Start writing!</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            + Create First Entry
          </button>
        </div>
      )}
    </div>
  )
}

export default Journal
