import mongoose from 'mongoose'

// Helper function to convert 12-hour time to 24-hour format
function convertTo24Hour(timeStr) {
  // Check if already in 24-hour format
  if (/^([01]\d|2[0-3]):([0-5]\d)$/.test(timeStr)) {
    return timeStr
  }
  
  // Parse 12-hour format (e.g., "09:30 AM" or "2:45 PM")
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) {
    throw new Error('Invalid time format. Use HH:MM AM/PM')
  }
  
  let hours = parseInt(match[1])
  const minutes = match[2]
  const period = match[3].toUpperCase()
  
  // Convert to 24-hour format
  if (period === 'PM' && hours !== 12) {
    hours += 12
  } else if (period === 'AM' && hours === 12) {
    hours = 0
  }
  
  return `${String(hours).padStart(2, '0')}:${minutes}`
}

// Helper function to convert 24-hour time to 12-hour format with AM/PM
function convertTo12Hour(timeStr) {
  const [hours24, minutes] = timeStr.split(':')
  let hours = parseInt(hours24)
  const period = hours >= 12 ? 'PM' : 'AM'
  
  if (hours === 0) {
    hours = 12
  } else if (hours > 12) {
    hours -= 12
  }
  
  return `${hours}:${minutes} ${period}`
}

const scheduledTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String, // Format: "HH:MM AM/PM" or "HH:MM" (24-hour)
    required: true,
    validate: {
      validator: function(v) {
        // Accept both 12-hour (with AM/PM) and 24-hour format
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v) || /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.test(v)
      },
      message: 'Time must be in HH:MM AM/PM or HH:MM format (24-hour)'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'missed'],
    default: 'pending'
  },
  completedAt: {
    type: Date
  },
  punctualityPoints: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'health', 'learning', 'social'],
    default: 'personal'
  }
}, {
  timestamps: true
})

// Pre-save hook to convert 12-hour format to 24-hour format for storage
scheduledTaskSchema.pre('save', function(next) {
  if (this.isModified('scheduledTime')) {
    try {
      this.scheduledTime = convertTo24Hour(this.scheduledTime)
    } catch (error) {
      return next(error)
    }
  }
  next()
})

// Method to get time in 12-hour format
scheduledTaskSchema.methods.getTime12Hour = function() {
  return convertTo12Hour(this.scheduledTime)
}

// Index for querying by date and status
scheduledTaskSchema.index({ scheduledDate: 1, status: 1 })
scheduledTaskSchema.index({ status: 1, emailSent: 1 })

// Method to calculate punctuality points based on completion time
scheduledTaskSchema.methods.calculatePunctuality = function() {
  if (!this.completedAt || this.status !== 'completed') {
    return 0
  }

  const scheduledDateTime = new Date(this.scheduledDate)
  const [hours, minutes] = this.scheduledTime.split(':')
  scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

  const completedDateTime = new Date(this.completedAt)
  const diffMinutes = Math.floor((completedDateTime - scheduledDateTime) / (1000 * 60))

  // Point system based on punctuality
  if (diffMinutes <= -5) {
    // Completed 5+ minutes early
    return 10
  } else if (diffMinutes <= 5) {
    // Completed within 5 minutes (on time)
    return 8
  } else if (diffMinutes <= 15) {
    // 5-15 minutes late
    return 5
  } else if (diffMinutes <= 30) {
    // 15-30 minutes late
    return 3
  } else {
    // More than 30 minutes late
    return 1
  }
}

// Method to check if task should be marked as missed
scheduledTaskSchema.methods.checkIfMissed = function() {
  if (this.status !== 'pending') {
    return false
  }

  const scheduledDateTime = new Date(this.scheduledDate)
  const [hours, minutes] = this.scheduledTime.split(':')
  scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

  const now = new Date()
  const diffHours = (now - scheduledDateTime) / (1000 * 60 * 60)

  // Mark as missed if more than 2 hours past scheduled time
  if (diffHours > 2) {
    this.status = 'missed'
    this.punctualityPoints = 0
    return true
  }

  return false
}

// Virtual for formatted scheduled datetime
scheduledTaskSchema.virtual('formattedScheduledTime').get(function() {
  const date = new Date(this.scheduledDate)
  return `${date.toLocaleDateString()} ${this.scheduledTime}`
})

const ScheduledTask = mongoose.model('ScheduledTask', scheduledTaskSchema)

export default ScheduledTask
export { convertTo24Hour, convertTo12Hour }
