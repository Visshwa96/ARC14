import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import cron from 'node-cron'

// Import routes
import habitRoutes from './routes/habitRoutes.js'
import logRoutes from './routes/logRoutes.js'
import journalRoutes from './routes/journalRoutes.js'
import arcCycleRoutes from './routes/arcCycleRoutes.js'
import mirror14Routes from './routes/mirror14Routes.js'
import scheduledTaskRoutes from './routes/scheduledTaskRoutes.js'

// Import services
import { checkAndSendReminders } from './services/emailService.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware - CORS configuration for Vercel deployments
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : []

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    // Log the origin for debugging
    console.log(`🌐 CORS Request from: ${origin}`)
    
    // Check if origin is allowed or matches Vercel pattern
    const isVercel = origin.includes('.vercel.app')
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1')
    const isInAllowedList = allowedOrigins.some(allowed => 
      allowed === '*' || origin === allowed
    )
    
    if (isVercel || isLocalhost || isInAllowedList || allowedOrigins.includes('*')) {
      console.log(`✅ CORS: Allowed`)
      callback(null, true)
    } else {
      console.log(`❌ CORS: Blocked`)
      // Don't throw error, just reject with false
      callback(null, false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight for 10 minutes
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check endpoint for monitoring
app.get('/', (req, res) => {
  res.json({ 
    status: 'running', 
    message: 'ARC14 Backend API',
    timestamp: new Date().toISOString()
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() })
})

// Routes
app.use('/api/habits', habitRoutes)
app.use('/api/logs', logRoutes)
app.use('/api/journals', journalRoutes)
app.use('/api/arc-cycles', arcCycleRoutes)
app.use('/api/mirror14', mirror14Routes)
app.use('/api/scheduled-tasks', scheduledTaskRoutes)

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
      
      // Start cron job for email reminders - runs every 5 minutes
      cron.schedule('*/5 * * * *', async () => {
        try {
          const result = await checkAndSendReminders()
          
          if (result.count > 0) {
            console.log(`\n🎉 Successfully sent ${result.count} reminder email(s)\n`)
          }
        } catch (error) {
          console.error(`\n❌ Error in scheduled reminder check:`, error.message, '\n')
        }
      })
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📧 Email Reminder Scheduler: ACTIVE')
      console.log('⏰ Check Frequency: Every 5 minutes')
      console.log('📬 Sends reminders: 30 minutes before task')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
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
