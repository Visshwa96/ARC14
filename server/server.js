import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

// Import routes
import habitRoutes from './routes/habitRoutes.js'
import logRoutes from './routes/logRoutes.js'
import journalRoutes from './routes/journalRoutes.js'
import arcCycleRoutes from './routes/arcCycleRoutes.js'
import mirror14Routes from './routes/mirror14Routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/habits', habitRoutes)
app.use('/api/logs', logRoutes)
app.use('/api/journals', journalRoutes)
app.use('/api/arc-cycles', arcCycleRoutes)
app.use('/api/mirror14', mirror14Routes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ARC-14 API is running' })
})

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  })

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

export default app
