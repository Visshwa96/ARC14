import express from 'express'
import Habit from '../models/Habit.js'

const router = express.Router()

// Get all habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find().sort({ createdAt: -1 })
    res.json(habits)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single habit
router.get('/:id', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id)
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }
    res.json(habit)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create habit
router.post('/', async (req, res) => {
  try {
    const habit = new Habit(req.body)
    await habit.save()
    res.status(201).json(habit)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update habit
router.put('/:id', async (req, res) => {
  try {
    const habit = await Habit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }
    res.json(habit)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete habit
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findByIdAndDelete(req.params.id)
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }
    res.json({ message: 'Habit deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Toggle habit completion
router.post('/:id/toggle', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id)
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    const { date } = req.body
    const targetDate = date ? new Date(date) : new Date()
    const dateString = targetDate.toISOString().split('T')[0]

    // Check if already completed on this date
    const existingIndex = habit.completedDates.findIndex(
      (d) => new Date(d).toISOString().split('T')[0] === dateString
    )

    if (existingIndex >= 0) {
      // Remove completion
      habit.completedDates.splice(existingIndex, 1)
    } else {
      // Add completion
      habit.completedDates.push(targetDate)
    }

    habit.calculateStreak()
    await habit.save()

    res.json(habit)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get habit statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id)
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    const totalCompletions = habit.completedDates.length
    const currentStreak = habit.calculateStreak()

    // Calculate completion rate for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentCompletions = habit.completedDates.filter(
      (date) => new Date(date) >= thirtyDaysAgo
    ).length

    const completionRate = (recentCompletions / 30) * 100

    res.json({
      totalCompletions,
      currentStreak,
      recentCompletions,
      completionRate: completionRate.toFixed(1),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
