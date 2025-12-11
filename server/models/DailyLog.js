import mongoose from 'mongoose'

const dailyLogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    mood: {
      type: String,
      enum: ['great', 'good', 'neutral', 'bad', 'terrible'],
      default: 'neutral',
    },
    energy: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Index for efficient date queries
dailyLogSchema.index({ date: -1 })

const DailyLog = mongoose.model('DailyLog', dailyLogSchema)

export default DailyLog
