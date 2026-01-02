import { create } from 'zustand'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Debug: Log API URL on load
console.log('🔗 API URL:', API_URL)
console.log('🌍 Environment:', import.meta.env.MODE)

const useStore = create((set, get) => ({
  // State
  habits: [],
  logs: [],
  journals: [],
  arcCycles: [],
  loading: false,
  error: null,

  // Habits
  fetchHabits: async () => {
    set({ loading: true, error: null })
    try {
      const response = await axios.get(`${API_URL}/habits`)
      set({ habits: response.data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createHabit: async (habit) => {
    try {
      const response = await axios.post(`${API_URL}/habits`, habit)
      set((state) => ({ habits: [...state.habits, response.data] }))
    } catch (error) {
      set({ error: error.message })
    }
  },

  updateHabit: async (id, updates) => {
    try {
      const response = await axios.put(`${API_URL}/habits/${id}`, updates)
      set((state) => ({
        habits: state.habits.map((h) => (h._id === id ? response.data : h)),
      }))
    } catch (error) {
      set({ error: error.message })
    }
  },

  deleteHabit: async (id) => {
    try {
      await axios.delete(`${API_URL}/habits/${id}`)
      set((state) => ({
        habits: state.habits.filter((h) => h._id !== id),
      }))
    } catch (error) {
      set({ error: error.message })
    }
  },

  toggleHabitCompletion: async (id, date) => {
    try {
      const response = await axios.post(`${API_URL}/habits/${id}/toggle`, { date })
      set((state) => ({
        habits: state.habits.map((h) => (h._id === id ? response.data : h)),
      }))
    } catch (error) {
      set({ error: error.message })
    }
  },

  // Daily Logs
  fetchLogs: async () => {
    set({ loading: true })
    try {
      const response = await axios.get(`${API_URL}/logs`)
      set({ logs: response.data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createLog: async (log) => {
    try {
      const response = await axios.post(`${API_URL}/logs`, log)
      set((state) => ({ logs: [...state.logs, response.data] }))
    } catch (error) {
      set({ error: error.message })
    }
  },

  updateLog: async (id, updates) => {
    try {
      const response = await axios.put(`${API_URL}/logs/${id}`, updates)
      set((state) => ({
        logs: state.logs.map((l) => (l._id === id ? response.data : l)),
      }))
    } catch (error) {
      set({ error: error.message })
    }
  },

  deleteLog: async (id) => {
    try {
      await axios.delete(`${API_URL}/logs/${id}`)
      set((state) => ({
        logs: state.logs.filter((l) => l._id !== id),
      }))
    } catch (error) {
      set({ error: error.message })
    }
  },

  // Journal Entries
  fetchJournals: async () => {
    set({ loading: true })
    try {
      const response = await axios.get(`${API_URL}/journals`)
      set({ journals: response.data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createJournal: async (journal) => {
    try {
      const response = await axios.post(`${API_URL}/journals`, journal)
      set((state) => ({ journals: [...state.journals, response.data] }))
    } catch (error) {
      set({ error: error.message })
    }
  },

  updateJournal: async (id, updates) => {
    try {
      const response = await axios.put(`${API_URL}/journals/${id}`, updates)
      set((state) => ({
        journals: state.journals.map((j) => (j._id === id ? response.data : j)),
      }))
    } catch (error) {
      set({ error: error.message })
    }
  },

  deleteJournal: async (id) => {
    try {
      await axios.delete(`${API_URL}/journals/${id}`)
      set((state) => ({
        journals: state.journals.filter((j) => j._id !== id),
      }))
    } catch (error) {
      set({ error: error.message })
    }
  },

  // ARC Cycles
  fetchARCCycles: async () => {
    set({ loading: true })
    try {
      const response = await axios.get(`${API_URL}/arc-cycles`)
      set({ arcCycles: response.data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createARCCycle: async (cycle) => {
    try {
      const response = await axios.post(`${API_URL}/arc-cycles`, cycle)
      set((state) => ({ arcCycles: [...state.arcCycles, response.data] }))
    } catch (error) {
      set({ error: error.message })
    }
  },

  updateARCCycle: async (id, updates) => {
    try {
      const response = await axios.put(`${API_URL}/arc-cycles/${id}`, updates)
      set((state) => ({
        arcCycles: state.arcCycles.map((c) => (c._id === id ? response.data : c)),
      }))
    } catch (error) {
      set({ error: error.message })
    }
  },

  deleteARCCycle: async (id) => {
    try {
      await axios.delete(`${API_URL}/arc-cycles/${id}`)
      set((state) => ({
        arcCycles: state.arcCycles.filter((c) => c._id !== id),
      }))
    } catch (error) {
      set({ error: error.message })
    }
  },

  // Mirror-14 Evaluation
  evaluateMirror14: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/mirror14/evaluate`, data)
      return response.data
    } catch (error) {
      set({ error: error.message })
      return null
    }
  },

  // Scheduled Tasks
  scheduledTasks: [],
  
  fetchScheduledTasks: async (filters = {}) => {
    set({ loading: true, error: null })
    try {
      const params = new URLSearchParams(filters)
      const response = await axios.get(`${API_URL}/scheduled-tasks?${params}`)
      set({ scheduledTasks: response.data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  createScheduledTask: async (task) => {
    try {
      const response = await axios.post(`${API_URL}/scheduled-tasks`, task)
      set((state) => ({ 
        scheduledTasks: [...state.scheduledTasks, response.data] 
      }))
      return response.data
    } catch (error) {
      set({ error: error.message })
      return null
    }
  },

  updateScheduledTask: async (id, updates) => {
    try {
      const response = await axios.put(`${API_URL}/scheduled-tasks/${id}`, updates)
      set((state) => ({
        scheduledTasks: state.scheduledTasks.map((t) => 
          t._id === id ? response.data : t
        ),
      }))
      return response.data
    } catch (error) {
      set({ error: error.message })
      return null
    }
  },

  completeScheduledTask: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/scheduled-tasks/${id}/complete`)
      set((state) => ({
        scheduledTasks: state.scheduledTasks.map((t) => 
          t._id === id ? response.data : t
        ),
      }))
      return response.data
    } catch (error) {
      set({ error: error.message })
      return null
    }
  },

  deleteScheduledTask: async (id) => {
    try {
      await axios.delete(`${API_URL}/scheduled-tasks/${id}`)
      set((state) => ({
        scheduledTasks: state.scheduledTasks.filter((t) => t._id !== id),
      }))
    } catch (error) {
      set({ error: error.message })
    }
  },

  fetchTaskStats: async () => {
    try {
      const response = await axios.get(`${API_URL}/scheduled-tasks/stats/summary`)
      return response.data
    } catch (error) {
      set({ error: error.message })
      return null
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));

export default useStore
