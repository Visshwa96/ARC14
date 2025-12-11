import { useEffect, useState } from 'react'
import useStore from '../store/useStore'

function HabitTracker() {
  const { habits, fetchHabits, createHabit, deleteHabit, toggleHabitCompletion } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    frequency: 'daily',
    category: 'health',
  })

  useEffect(() => {
    fetchHabits()
  }, [fetchHabits])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await createHabit(newHabit)
    setNewHabit({ name: '', description: '', frequency: 'daily', category: 'health' })
    setShowForm(false)
  }

  const handleToggle = async (habitId) => {
    const today = new Date().toISOString()
    await toggleHabitCompletion(habitId, today)
  }

  const isCompletedToday = (habit) => {
    const today = new Date().toISOString().split('T')[0]
    return habit.completedDates?.some((date) => date.startsWith(today))
  }

  const categories = [
    { value: 'health', label: 'Health', icon: '💪' },
    { value: 'productivity', label: 'Productivity', icon: '⚡' },
    { value: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
    { value: 'learning', label: 'Learning', icon: '📚' },
    { value: 'social', label: 'Social', icon: '👥' },
    { value: 'other', label: 'Other', icon: '🎯' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Habit Tracker</h1>
          <p className="text-slate-400">Build better habits, one day at a time</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          {showForm ? 'Cancel' : '+ New Habit'}
        </button>
      </div>

      {/* Add Habit Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Create New Habit</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Habit Name
              </label>
              <input
                type="text"
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                className="input"
                placeholder="e.g., Morning Exercise"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={newHabit.description}
                onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                className="input"
                rows="3"
                placeholder="What does this habit involve?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Frequency
                </label>
                <select
                  value={newHabit.frequency}
                  onChange={(e) => setNewHabit({ ...newHabit, frequency: e.target.value })}
                  className="input"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={newHabit.category}
                  onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                  className="input"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              Create Habit
            </button>
          </form>
        </div>
      )}

      {/* Habits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map((habit) => {
          const completed = isCompletedToday(habit)
          const category = categories.find((c) => c.value === habit.category)

          return (
            <div
              key={habit._id}
              className={`card transition-all ${
                completed ? 'ring-2 ring-green-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{category?.icon}</span>
                    <h3 className="text-lg font-bold text-white">{habit.name}</h3>
                  </div>
                  {habit.description && (
                    <p className="text-sm text-slate-400">{habit.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  <span className="font-medium text-white">
                    {habit.completedDates?.length || 0}
                  </span>{' '}
                  days
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggle(habit._id)}
                    className={`btn ${
                      completed ? 'bg-green-600 hover:bg-green-700' : 'btn-primary'
                    }`}
                  >
                    {completed ? '✓ Done' : 'Mark Done'}
                  </button>
                  <button
                    onClick={() => deleteHabit(habit._id)}
                    className="btn bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {completed && (
                <div className="mt-4 pt-4 border-t border-slate-700 text-sm text-green-500 text-center">
                  ✓ Completed today!
                </div>
              )}
            </div>
          )
        })}
      </div>

      {habits.length === 0 && !showForm && (
        <div className="card text-center py-12">
          <p className="text-slate-500 mb-4">No habits yet. Create your first habit to get started!</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            + Create First Habit
          </button>
        </div>
      )}
    </div>
  )
}

export default HabitTracker
