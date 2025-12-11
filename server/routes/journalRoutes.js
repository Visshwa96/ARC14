import express from 'express'
import Journal from '../models/Journal.js'

const router = express.Router()

// Get all journals
router.get('/', async (req, res) => {
  try {
    const { category, search, tags } = req.query
    let query = {}

    // Filter by category
    if (category) {
      query.category = category
    }

    // Filter by tags
    if (tags) {
      query.tags = { $in: tags.split(',') }
    }

    let journals

    // Text search
    if (search) {
      journals = await Journal.find(
        { $text: { $search: search }, ...query },
        { score: { $meta: 'textScore' } }
      ).sort({ score: { $meta: 'textScore' } })
    } else {
      journals = await Journal.find(query).sort({ createdAt: -1 })
    }

    res.json(journals)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single journal
router.get('/:id', async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id)
    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' })
    }
    res.json(journal)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create journal
router.post('/', async (req, res) => {
  try {
    const journal = new Journal(req.body)
    await journal.save()
    res.status(201).json(journal)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Update journal
router.put('/:id', async (req, res) => {
  try {
    const journal = await Journal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' })
    }
    res.json(journal)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Delete journal
router.delete('/:id', async (req, res) => {
  try {
    const journal = await Journal.findByIdAndDelete(req.params.id)
    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' })
    }
    res.json({ message: 'Journal deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get category statistics
router.get('/stats/categories', async (req, res) => {
  try {
    const categoryStats = await Journal.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ])
    res.json(categoryStats)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
