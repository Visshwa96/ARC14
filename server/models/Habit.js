import mongoose from 'mongoose'

const habitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'daily',
    },
    category: {
      type: String,
      enum: ['health', 'productivity', 'mindfulness', 'learning', 'social', 'other'],
      default: 'other',
    },
    completedDates: [
      {
        type: Date,
      },
    ],
    streak: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Calculate streak
habitSchema.methods.calculateStreak = function () {
  if (!this.completedDates || this.completedDates.length === 0) {
    return 0
  }

  const sortedDates = this.completedDates
    .map((d) => new Date(d).toISOString().split('T')[0])
    .sort()
    .reverse()

  let streak = 0
  const today = new Date().toISOString().split('T')[0]
  let currentDate = new Date(today)

  for (const dateStr of sortedDates) {
    const checkDate = currentDate.toISOString().split('T')[0]
    if (dateStr === checkDate) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  this.streak = streak
  return streak
}

const Habit = mongoose.model('Habit', habitSchema)

export default Habit
