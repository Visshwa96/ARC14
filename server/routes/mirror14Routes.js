import express from 'express'

const router = express.Router()

// Mirror-14 Rule Engine
// Simple rule-based evaluation system

const evaluateARCCycle = (action, reflection, correction) => {
  const rules = []
  let score = 5 // Base score

  // Rule 1: Check if all fields are present
  if (action && reflection && correction) {
    score += 2
    rules.push('Complete ARC cycle')
  }

  // Rule 2: Check action length (detailed action)
  if (action && action.length > 50) {
    score += 1
    rules.push('Detailed action description')
  }

  // Rule 3: Check for specific keywords in reflection
  const reflectionKeywords = ['learned', 'realized', 'discovered', 'understood', 'insight']
  if (reflection && reflectionKeywords.some((keyword) => reflection.toLowerCase().includes(keyword))) {
    score += 1
    rules.push('Meaningful reflection detected')
  }

  // Rule 4: Check for action words in correction
  const actionKeywords = ['will', 'plan', 'next', 'improve', 'change', 'implement']
  if (correction && actionKeywords.some((keyword) => correction.toLowerCase().includes(keyword))) {
    score += 1
    rules.push('Action-oriented correction')
  }

  // Rule 5: Check for negative patterns
  const negativeKeywords = ['failed', 'impossible', 'can\'t', 'unable', 'never']
  if (reflection && negativeKeywords.some((keyword) => reflection.toLowerCase().includes(keyword))) {
    score -= 1
    rules.push('⚠️ Negative language detected - consider reframing')
  }

  return { score: Math.min(Math.max(score, 1), 10), matchedRules: rules }
}

const generateRecommendations = (score, matchedRules, action, reflection, correction) => {
  const recommendations = []

  if (score < 5) {
    recommendations.push('Consider providing more detail in your ARC cycle')
  }

  if (!reflection || reflection.length < 30) {
    recommendations.push('Expand your reflection with deeper insights')
  }

  if (!correction || correction.length < 30) {
    recommendations.push('Be more specific about your corrections and improvements')
  }

  if (matchedRules.includes('⚠️ Negative language detected - consider reframing')) {
    recommendations.push('Try to reframe challenges as opportunities for growth')
  }

  if (score >= 8) {
    recommendations.push('Excellent ARC cycle! Consider implementing these learnings')
  }

  if (!matchedRules.includes('Action-oriented correction')) {
    recommendations.push('Make your correction more actionable with specific steps')
  }

  return recommendations
}

const generateInsight = (score, action, reflection, correction) => {
  if (score >= 8) {
    return 'Your ARC cycle demonstrates strong self-awareness and actionable planning. You\'re on track for meaningful growth.'
  } else if (score >= 6) {
    return 'Good progress on your ARC cycle. Focus on making your reflections and corrections more specific to maximize learning.'
  } else if (score >= 4) {
    return 'Your ARC cycle has a solid foundation. Consider adding more depth to your reflection and correction phases.'
  } else {
    return 'This ARC cycle needs more development. Take time to reflect deeply and plan specific corrective actions.'
  }
}

// Evaluate endpoint
router.post('/evaluate', async (req, res) => {
  try {
    const { action, reflection, correction } = req.body

    if (!action) {
      return res.status(400).json({ error: 'Action is required for evaluation' })
    }

    const { score, matchedRules } = evaluateARCCycle(action, reflection, correction)
    const recommendations = generateRecommendations(score, matchedRules, action, reflection, correction)
    const insight = generateInsight(score, action, reflection, correction)

    res.json({
      score,
      insight,
      matchedRules,
      recommendations,
      evaluatedAt: new Date(),
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get rule information
router.get('/rules', (req, res) => {
  const rules = [
    {
      id: 1,
      name: 'Completeness',
      description: 'Rewards complete ARC cycles with all three components',
      weight: 2,
    },
    {
      id: 2,
      name: 'Detail Quality',
      description: 'Evaluates the depth and detail in action descriptions',
      weight: 1,
    },
    {
      id: 3,
      name: 'Reflective Keywords',
      description: 'Detects meaningful reflection indicators',
      weight: 1,
    },
    {
      id: 4,
      name: 'Action-Oriented',
      description: 'Identifies forward-looking, actionable corrections',
      weight: 1,
    },
    {
      id: 5,
      name: 'Language Patterns',
      description: 'Analyzes language for growth-oriented mindset',
      weight: -1,
    },
  ]

  res.json({
    name: 'Mirror-14 Rule Engine',
    version: '1.0',
    description: 'Simple rule-based evaluation system for ARC cycles',
    rules,
  })
})

export default router
