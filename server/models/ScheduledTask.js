import mongoose from 'mongoose'

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
    type: String, // Format: "HH:MM" (24-hour)
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v)
      },
      message: 'Time must be in HH:MM format (24-hour)'
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
