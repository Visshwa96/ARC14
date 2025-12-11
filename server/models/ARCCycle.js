import mongoose from 'mongoose'

const arcCycleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
    },
    reflection: {
      type: String,
      default: '',
    },
    correction: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'reflecting', 'correcting', 'completed'],
      default: 'active',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    insights: [
      {
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
)

// Method to check if cycle is complete
arcCycleSchema.methods.isComplete = function () {
  return this.action && this.reflection && this.correction
}

const ARCCycle = mongoose.model('ARCCycle', arcCycleSchema)

export default ARCCycle
