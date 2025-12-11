import express from 'express'
import ARCCycle from '../models/ARCCycle.js'

const router = express.Router()

// Get all ARC cycles
router.get('/', async (req, res) => {
  try {
    const { status, priority } = req.query
    let query = {}

    if (status) {
      query.status = status
    }

    if (priority) {
      query.priority = priority
    }

    const cycles = await ARCCycle.find(query).sort({ createdAt: -1 })
    res.json(cycles)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single ARC cycle
router.get('/:id', async (req, res) => {
  try {
    const cycle = await ARCCycle.findById(req.params.id)
    if (!cycle) {
      return res.status(404).json({ error: 'ARC cycle not found' })
    }
    res.json(cycle)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create ARC cycle
router.post('/', async (req, res) => {
  try {
    const cycle = new ARCCycle(req.body)
    await cycle.save()
    res.status(201).json(cycle)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update ARC cycle
router.put('/:id', async (req, res) => {
  try {
    const cycle = await ARCCycle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!cycle) {
      return res.status(404).json({ error: 'ARC cycle not found' })
    }

    // Auto-update status based on completion
    if (cycle.isComplete() && cycle.status !== 'completed') {
      cycle.status = 'completed'
      await cycle.save()
    }

    res.json(cycle)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete ARC cycle
router.delete('/:id', async (req, res) => {
  try {
    const cycle = await ARCCycle.findByIdAndDelete(req.params.id)
    if (!cycle) {
      return res.status(404).json({ error: 'ARC cycle not found' })
    }
    res.json({ message: 'ARC cycle deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Add insight to ARC cycle
router.post('/:id/insights', async (req, res) => {
  try {
    const cycle = await ARCCycle.findById(req.params.id)
    if (!cycle) {
      return res.status(404).json({ error: 'ARC cycle not found' })
    }

    const { text } = req.body
    if (!text) {
      return res.status(400).json({ error: 'Insight text is required' })
    }

    cycle.insights.push({ text })
    await cycle.save()

    res.json(cycle)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Get status statistics
router.get('/stats/status', async (req, res) => {
  try {
    const statusStats = await ARCCycle.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ])
    res.json(statusStats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
