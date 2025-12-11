import mongoose from 'mongoose'

const journalSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: ['personal', 'work', 'goals', 'gratitude', 'reflection', 'ideas'],
      default: 'personal',
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

// Text search index
journalSchema.index({ title: 'text', content: 'text' })

const Journal = mongoose.model('Journal', journalSchema)

export default Journal
