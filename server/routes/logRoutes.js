import express from 'express'
import DailyLog from '../models/DailyLog.js'

const router = express.Router()

// Get all logs
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, mood, tags } = req.query
    let query = {}

    // Filter by date range
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }

    // Filter by mood
    if (mood) {
      query.mood = mood
    }

    // Filter by tags
    if (tags) {
      query.tags = { $in: tags.split(',') }
    }

    const logs = await DailyLog.find(query).sort({ date: -1 })
    res.json(logs)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single log
router.get('/:id', async (req, res) => {
  try {
    const log = await DailyLog.findById(req.params.id)
    if (!log) {
      return res.status(404).json({ error: 'Log not found' })
    }
    res.json(log)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create log
router.post('/', async (req, res) => {
  try {
    const log = new DailyLog(req.body)
    await log.save()
    res.status(201).json(log)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update log
router.put('/:id', async (req, res) => {
  try {
    const log = await DailyLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!log) {
      return res.status(404).json({ error: 'Log not found' })
    }
    res.json(log)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete log
router.delete('/:id', async (req, res) => {
  try {
    const log = await DailyLog.findByIdAndDelete(req.params.id)
    if (!log) {
      return res.status(404).json({ error: 'Log not found' })
    }
    res.json({ message: 'Log deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get mood statistics
router.get('/stats/mood', async (req, res) => {
  try {
    const moodStats = await DailyLog.aggregate([
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 },
          avgEnergy: { $avg: '$energy' },
        },
      },
    ])
    res.json(moodStats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
