import express from 'express'
import ScheduledTask, { convertTo12Hour } from '../models/ScheduledTask.js'
import { sendTestEmail, sendTaskReminder, checkAndSendReminders } from '../services/emailService.js'

const router = express.Router()

// Get all scheduled tasks with filtering
router.get('/', async (req, res) => {
  try {
    const { status, date, upcoming } = req.query
    let query = {}

    if (status) {
      query.status = status
    }

    if (date) {
      const targetDate = new Date(date)
      const nextDay = new Date(targetDate)
      nextDay.setDate(nextDay.getDate() + 1)
      query.scheduledDate = {
        $gte: targetDate,
        $lt: nextDay
      }
    }

    if (upcoming === 'true') {
      query.scheduledDate = { $gte: new Date() }
      query.status = 'pending'
    }

    const tasks = await ScheduledTask.find(query)
      .sort({ scheduledDate: 1, scheduledTime: 1 })

    // Check and update missed tasks
    for (let task of tasks) {
      if (task.checkIfMissed()) {
        await task.save()
      }
    }

    // Convert times to 12-hour format for response
    const tasksWithFormattedTime = tasks.map(task => {
      const taskObj = task.toObject()
      taskObj.scheduledTime = convertTo12Hour(task.scheduledTime)
      return taskObj
    })

    res.json(tasksWithFormattedTime)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Test email endpoint - MUST come before /:id routes!
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const result = await sendTestEmail(email)
    
    if (result.success) {
      res.json({ 
        message: 'Test email sent successfully!', 
        details: result 
      })
    } else {
      res.status(500).json({ 
        message: 'Failed to send test email', 
        error: result.error 
      })
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error sending test email', 
      error: error.message 
    })
  }
})

// Get single scheduled task by ID
router.get('/:id', async (req, res) => {
  try {
    const task = await ScheduledTask.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    
    // Check if missed
    if (task.checkIfMissed()) {
      await task.save()
    }
    
    // Convert time to 12-hour format for response
    const taskObj = task.toObject()
    taskObj.scheduledTime = convertTo12Hour(task.scheduledTime)
    
    res.json(taskObj)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create new scheduled task
router.post('/', async (req, res) => {
  try {
    const now = new Date()
    const currentHour = now.getHours()
    
    // Get scheduling cutoff time from environment variables (default 9 PM)
    const schedulingCutoffHour = parseInt(process.env.TASK_SCHEDULING_START_HOUR) || 21
    
    // Check if current time is before cutoff (can schedule anytime before 9 PM)
    if (currentHour >= schedulingCutoffHour) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('❌ TASK CREATION BLOCKED')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`🕐 Current Time: ${now.toLocaleTimeString('en-US')}`)
      console.log(`⏰ Scheduling Cutoff: ${schedulingCutoffHour}:00`)
      console.log(`❌ Reason: Cannot schedule tasks after ${schedulingCutoffHour}:00`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      
      return res.status(403).json({ 
        message: `Tasks can only be created before ${schedulingCutoffHour}:00. Scheduling closes for the day!`,
        schedulingCutoff: `${schedulingCutoffHour}:00`,
        currentTime: now.toLocaleTimeString('en-US', { hour12: false })
      })
    }
    
    // Determine minimum date for task scheduling
    const taskDate = new Date(req.body.scheduledDate)
    taskDate.setHours(0, 0, 0, 0)
    
    // Always use actual current date (don't increment)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check which day user is trying to schedule for
    const requestedDate = new Date(taskDate)
    
    // Find which dates already have completed tasks
    const allTasks = await ScheduledTask.find({
      scheduledDate: { $gte: today }
    }).sort({ scheduledDate: 1 })
    
    // Group tasks by date
    const tasksByDate = {}
    allTasks.forEach(task => {
      const dateKey = new Date(task.scheduledDate).toISOString().split('T')[0]
      if (!tasksByDate[dateKey]) {
        tasksByDate[dateKey] = []
      }
      tasksByDate[dateKey].push(task)
    })
    
    // Find the earliest incomplete date
    let earliestIncompleteDate = null
    const sortedDates = Object.keys(tasksByDate).sort()
    
    for (const dateKey of sortedDates) {
      const dateTasks = tasksByDate[dateKey]
      const hasIncompleteTasks = dateTasks.some(t => t.status !== 'completed')
      
      if (hasIncompleteTasks) {
        earliestIncompleteDate = new Date(dateKey)
        break
      }
    }
    
    // If no incomplete tasks found, allow scheduling for tomorrow
    if (!earliestIncompleteDate) {
      earliestIncompleteDate = new Date(today)
      earliestIncompleteDate.setDate(earliestIncompleteDate.getDate() + 1)
    }
    
    // Calculate next available date (day after earliest incomplete)
    const nextAvailableDate = new Date(earliestIncompleteDate)
    nextAvailableDate.setDate(nextAvailableDate.getDate() + 1)
    
    let minimumDate = earliestIncompleteDate
    let allowedDateMessage = earliestIncompleteDate.toLocaleDateString('en-US')
    
    // Allow scheduling for the next available date or later
    if (taskDate < minimumDate) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('❌ TASK CREATION BLOCKED')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`📅 Attempted Date: ${taskDate.toLocaleDateString('en-US')}`)
      console.log(`📅 Next Scheduled Day: ${allowedDateMessage}`)
      console.log(`❌ Reason: Please schedule/complete tasks for ${allowedDateMessage} first`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      
      return res.status(403).json({ 
        message: `Please schedule or complete tasks for ${allowedDateMessage} first before planning further ahead`,
        minimumDate: minimumDate.toISOString().split('T')[0],
        attemptedDate: req.body.scheduledDate
      })
    }
    
    const task = new ScheduledTask(req.body)
    const savedTask = await task.save()
    
    // Calculate when email reminder will be sent (30 minutes before)
    const scheduledDateTime = new Date(savedTask.scheduledDate)
    const [hours, minutes] = savedTask.scheduledTime.split(':')
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes))
    
    const reminderTime = new Date(scheduledDateTime.getTime() - 30 * 60000)
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✨ NEW TASK CREATED')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📌 Title: ${savedTask.title}`)
    console.log(`📅 Date: ${scheduledDateTime.toLocaleDateString('en-US')}`)
    console.log(`🕐 Time: ${convertTo12Hour(savedTask.scheduledTime)}`)
    console.log(`🎯 Priority: ${savedTask.priority.toUpperCase()}`)
    console.log(`📁 Category: ${savedTask.category}`)
    console.log(`📧 Email Reminder: Will be sent at ${reminderTime.toLocaleString('en-US')}`)
    console.log(`⏱️  Time Until Task: ${Math.round((scheduledDateTime - now) / 60000)} minutes`)
    console.log(`✅ Created before ${schedulingCutoffHour}:00 cutoff`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // Return task with 12-hour format
    const taskResponse = savedTask.toObject()
    taskResponse.scheduledTime = convertTo12Hour(savedTask.scheduledTime)
    
    res.status(201).json(taskResponse)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update scheduled task
router.put('/:id', async (req, res) => {
  try {
    const now = new Date()
    const currentHour = now.getHours()
    const schedulingCutoffHour = parseInt(process.env.TASK_SCHEDULING_START_HOUR) || 21
    
    // Check if current time is before cutoff
    if (currentHour >= schedulingCutoffHour) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('❌ TASK UPDATE BLOCKED')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`🕐 Current Time: ${now.toLocaleTimeString('en-US')}`)
      console.log(`⏰ Scheduling Cutoff: ${schedulingCutoffHour}:00`)
      console.log(`❌ Reason: Task modifications only allowed before ${schedulingCutoffHour}:00`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      
      return res.status(403).json({ 
        message: `Tasks can only be modified before ${schedulingCutoffHour}:00`,
        schedulingCutoff: `${schedulingCutoffHour}:00`,
        currentTime: now.toLocaleTimeString('en-US', { hour12: false })
      })
    }
    
    const task = await ScheduledTask.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    const oldTitle = task.title
    const oldTime = convertTo12Hour(task.scheduledTime)
    const oldDate = new Date(task.scheduledDate).toLocaleDateString('en-US')

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'scheduledDate', 'scheduledTime', 'priority', 'category']
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field]
      }
    })

    const updatedTask = await task.save()
    
    // Log the update
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✏️  TASK UPDATED')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📌 Task: ${oldTitle}${oldTitle !== updatedTask.title ? ` → ${updatedTask.title}` : ''}`)
    
    const newTime12 = convertTo12Hour(updatedTask.scheduledTime)
    if (oldTime !== newTime12 || oldDate !== new Date(updatedTask.scheduledDate).toLocaleDateString('en-US')) {
      console.log(`📅 OLD Schedule: ${oldDate} at ${oldTime}`)
      console.log(`📅 NEW Schedule: ${new Date(updatedTask.scheduledDate).toLocaleDateString('en-US')} at ${newTime12}`)
      console.log(`📧 Email reminder will be reset (emailSent: ${updatedTask.emailSent})`)
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // Return task with 12-hour format
    const taskResponse = updatedTask.toObject()
    taskResponse.scheduledTime = convertTo12Hour(updatedTask.scheduledTime)
    
    res.json(taskResponse)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Complete a scheduled task
router.put('/:id/complete', async (req, res) => {
  try {
    const task = await ScheduledTask.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    if (task.status === 'completed') {
      return res.status(400).json({ message: 'Task already completed' })
    }

    if (task.status === 'missed') {
      return res.status(400).json({ message: 'Cannot complete a missed task' })
    }

    // Mark as completed
    task.status = 'completed'
    task.completedAt = new Date()
    task.punctualityPoints = task.calculatePunctuality()

    const completedTask = await task.save()
    
    // Calculate how early/late
    const scheduledDateTime = new Date(completedTask.scheduledDate)
    const [hours, minutes] = completedTask.scheduledTime.split(':')
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes))
    const difference = Math.round((completedTask.completedAt - scheduledDateTime) / 60000)
    
    let punctualityStatus = ''
    if (difference <= -5) punctualityStatus = '🌟 EARLY'
    else if (difference <= 5) punctualityStatus = '✅ ON TIME'
    else if (difference <= 15) punctualityStatus = '⚠️ SLIGHTLY LATE'
    else if (difference <= 30) punctualityStatus = '⚠️ LATE'
    else punctualityStatus = '❌ VERY LATE'
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ TASK COMPLETED')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📌 Task: ${completedTask.title}`)
    console.log(`🕐 Scheduled Time: ${completedTask.scheduledTime}`)
    console.log(`✅ Completed At: ${completedTask.completedAt.toLocaleTimeString('en-US')}`)
    console.log(`⏱️  Difference: ${difference > 0 ? '+' : ''}${difference} minutes`)
    console.log(`${punctualityStatus}`)
    console.log(`🎯 Points Earned: ${completedTask.punctualityPoints}/10`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    // Return task with 12-hour format
    const taskResponse = completedTask.toObject()
    taskResponse.scheduledTime = convertTo12Hour(completedTask.scheduledTime)
    
    res.json(taskResponse)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete scheduled task
router.delete('/:id', async (req, res) => {
  try {
    const now = new Date()
    const currentHour = now.getHours()
    const schedulingCutoffHour = parseInt(process.env.TASK_SCHEDULING_START_HOUR) || 21
    
    // Check if current time is before cutoff
    if (currentHour >= schedulingCutoffHour) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('❌ TASK DELETION BLOCKED')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log(`🕐 Current Time: ${now.toLocaleTimeString('en-US')}`)
      console.log(`⏰ Scheduling Cutoff: ${schedulingCutoffHour}:00`)
      console.log(`❌ Reason: Task deletion only allowed before ${schedulingCutoffHour}:00`)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
      
      return res.status(403).json({ 
        message: `Tasks can only be deleted before ${schedulingCutoffHour}:00`,
        schedulingCutoff: `${schedulingCutoffHour}:00`,
        currentTime: now.toLocaleTimeString('en-US', { hour12: false })
      })
    }
    
    const task = await ScheduledTask.findByIdAndDelete(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🗑️  TASK DELETED')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📌 Task: ${task.title}`)
    console.log(`📅 Was scheduled: ${new Date(task.scheduledDate).toLocaleDateString('en-US')} at ${task.scheduledTime}`)
    console.log(`📊 Status: ${task.status.toUpperCase()}`)
    console.log(`✅ Deleted before ${schedulingCutoffHour}:00 cutoff`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    res.json({ message: 'Task deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get statistics for scheduled tasks
router.get('/stats/summary', async (req, res) => {
  try {
    const totalTasks = await ScheduledTask.countDocuments()
    const completedTasks = await ScheduledTask.countDocuments({ status: 'completed' })
    const missedTasks = await ScheduledTask.countDocuments({ status: 'missed' })
    const pendingTasks = await ScheduledTask.countDocuments({ status: 'pending' })

    // Calculate average punctuality points
    const completedWithPoints = await ScheduledTask.find({ 
      status: 'completed',
      punctualityPoints: { $gt: 0 }
    })
    const avgPoints = completedWithPoints.length > 0
      ? completedWithPoints.reduce((sum, task) => sum + task.punctualityPoints, 0) / completedWithPoints.length
      : 0

    // Get total points earned
    const totalPoints = await ScheduledTask.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$punctualityPoints' } } }
    ])

    res.json({
      totalTasks,
      completedTasks,
      missedTasks,
      pendingTasks,
      averagePunctualityScore: Math.round(avgPoints * 10) / 10,
      totalPointsEarned: totalPoints[0]?.total || 0,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get tasks that need email reminders (for cron job)
router.get('/email/pending', async (req, res) => {
  try {
    const now = new Date()
    const reminderWindow = new Date(now.getTime() + 30 * 60000) // 30 minutes ahead

    const tasks = await ScheduledTask.find({
      status: 'pending',
      emailSent: false,
      scheduledDate: {
        $gte: now,
        $lte: reminderWindow
      }
    })

    res.json(tasks)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Mark email as sent (called by email service)
router.put('/:id/email-sent', async (req, res) => {
  try {
    const task = await ScheduledTask.findByIdAndUpdate(
      req.params.id,
      { 
        emailSent: true,
        emailSentAt: new Date()
      },
      { new: true }
    )
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }
    
    res.json(task)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Send reminder for specific task
router.post('/:id/send-reminder', async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const task = await ScheduledTask.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    const result = await sendTaskReminder(task, email)
    
    if (result.success) {
      task.emailSent = true
      task.emailSentAt = new Date()
      await task.save()
      
      res.json({ 
        message: 'Reminder sent successfully!', 
        details: result 
      })
    } else {
      res.status(500).json({ 
        message: 'Failed to send reminder', 
        error: result.error 
      })
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error sending reminder', 
      error: error.message 
    })
  }
})

// Get scheduling configuration
router.get('/config/scheduling-window', async (req, res) => {
  try {
    const schedulingCutoffHour = parseInt(process.env.TASK_SCHEDULING_START_HOUR) || 21
    
    const now = new Date()
    const currentHour = now.getHours()
    const canSchedule = currentHour < schedulingCutoffHour
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)
    
    // Check if all tomorrow's tasks are completed
    const tomorrowsTasks = await ScheduledTask.find({
      scheduledDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      }
    })
    
    const allTomorrowsTasksCompleted = tomorrowsTasks.length > 0 && 
      tomorrowsTasks.every(task => task.status === 'completed')
    
    const minimumDate = allTomorrowsTasksCompleted ? dayAfterTomorrow : tomorrow
    const allowedDateMessage = allTomorrowsTasksCompleted ? 'Day After Tomorrow' : 'Tomorrow'
    
    res.json({
      schedulingWindow: {
        cutoffHour: schedulingCutoffHour,
        cutoffTime: `${schedulingCutoffHour.toString().padStart(2, '0')}:00`,
        allowedPeriod: `00:00 - ${schedulingCutoffHour.toString().padStart(2, '0')}:00`
      },
      currentStatus: {
        currentTime: now.toLocaleTimeString('en-US', { hour12: false }),
        canSchedule: canSchedule,
        canCreateTasks: canSchedule,
        canModifyTasks: canSchedule,
        canDeleteTasks: canSchedule
      },
      rules: {
        canCreateTasksForToday: false,
        minimumTaskDate: minimumDate.toISOString().split('T')[0],
        minimumTaskDateFormatted: minimumDate.toLocaleDateString('en-US'),
        minimumTaskDescription: allowedDateMessage,
        schedulingDescription: `You can schedule tasks anytime before ${schedulingCutoffHour}:00`
      },
      earlyCompletionBonus: {
        active: allTomorrowsTasksCompleted,
        tomorrowTasksCount: tomorrowsTasks.length,
        tomorrowCompletedCount: tomorrowsTasks.filter(t => t.status === 'completed').length,
        message: allTomorrowsTasksCompleted 
          ? `🎉 Great job! All ${tomorrowsTasks.length} tasks for tomorrow are completed. You can now plan for ${allowedDateMessage}!`
          : tomorrowsTasks.length > 0 
            ? `Complete all ${tomorrowsTasks.length} tasks for tomorrow to unlock early planning.`
            : `Create and complete tasks for tomorrow to unlock early planning!`
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Test endpoint: Create hardcoded tasks for email testing
router.post('/test/create-test-tasks', async (req, res) => {
  try {
    const now = new Date()
    
    // Create tasks scheduled for TODAY with times in the next 30-60 minutes
    const testTasks = []
    
    // Task 1: 35 minutes from now
    const task1Time = new Date(now.getTime() + 35 * 60000)
    testTasks.push({
      title: 'Test Task 1 - Morning Meeting',
      description: 'This is a test task to verify email notifications',
      scheduledDate: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
      scheduledTime: `${task1Time.getHours().toString().padStart(2, '0')}:${task1Time.getMinutes().toString().padStart(2, '0')}`,
      priority: 'high',
      category: 'work',
      status: 'pending',
      emailSent: false
    })
    
    // Task 2: 40 minutes from now
    const task2Time = new Date(now.getTime() + 40 * 60000)
    testTasks.push({
      title: 'Test Task 2 - Exercise Session',
      description: 'Another test task for email verification',
      scheduledDate: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
      scheduledTime: `${task2Time.getHours().toString().padStart(2, '0')}:${task2Time.getMinutes().toString().padStart(2, '0')}`,
      priority: 'medium',
      category: 'health',
      status: 'pending',
      emailSent: false
    })
    
    // Task 3: 50 minutes from now
    const task3Time = new Date(now.getTime() + 50 * 60000)
    testTasks.push({
      title: 'Test Task 3 - Study Time',
      description: 'Final test task for email system',
      scheduledDate: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
      scheduledTime: `${task3Time.getHours().toString().padStart(2, '0')}:${task3Time.getMinutes().toString().padStart(2, '0')}`,
      priority: 'low',
      category: 'learning',
      status: 'pending',
      emailSent: false
    })
    
    const savedTasks = await ScheduledTask.insertMany(testTasks)
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🧪 TEST TASKS CREATED')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📅 Date: ${new Date().toLocaleDateString('en-US')}`)
    console.log(`🕐 Current Time: ${now.toLocaleTimeString('en-US')}`)
    console.log(`📧 These tasks will trigger emails in ~5 minutes (when within 30-min window)`)
    savedTasks.forEach((task, i) => {
      console.log(`\n${i + 1}. ${task.title}`)
      console.log(`   ⏰ Scheduled: ${task.scheduledTime}`)
      console.log(`   📧 Email will send at: ${new Date(new Date(`${task.scheduledDate.toISOString().split('T')[0]}T${task.scheduledTime}`).getTime() - 30 * 60000).toLocaleTimeString('en-US')}`)
    })
    console.log('\n✅ Wait for the cron job to send emails automatically!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    res.json({
      message: 'Test tasks created successfully! Emails will be sent automatically by the cron job.',
      currentTime: now.toLocaleTimeString('en-US'),
      tasksCreated: savedTasks.length,
      tasks: savedTasks.map(t => ({
        title: t.title,
        scheduledTime: t.scheduledTime,
        emailWillSendAt: new Date(new Date(`${t.scheduledDate.toISOString().split('T')[0]}T${t.scheduledTime}`).getTime() - 30 * 60000).toLocaleTimeString('en-US')
      })),
      note: 'Cron job runs every 5 minutes. Check your email (visshwapm@gmail.com) soon!'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Manual trigger endpoint - Force check and send reminders NOW
router.post('/test/trigger-reminders', async (req, res) => {
  try {
    console.log('\n🚨 MANUAL TRIGGER: Forcing email reminder check...\n')
    const result = await checkAndSendReminders(process.env.GMAIL_USER)
    res.json({
      message: 'Manual reminder check triggered successfully',
      result
    })
  } catch (error) {
    console.error('❌ Error in manual trigger:', error)
    res.status(500).json({ message: error.message })
  }
})

// Create single test task with custom time (bypasses validation)
router.post('/test/create-quick-task', async (req, res) => {
  try {
    const { minutesFromNow = 33 } = req.body
    
    const now = new Date()
    const scheduledDateTime = new Date(now.getTime() + minutesFromNow * 60000)
    
    const task = new ScheduledTask({
      title: `Quick Test - ${minutesFromNow}min`,
      description: 'Quick test task for immediate email testing',
      scheduledDate: scheduledDateTime,
      scheduledTime: `${String(scheduledDateTime.getHours()).padStart(2, '0')}:${String(scheduledDateTime.getMinutes()).padStart(2, '0')}`,
      priority: 'high',
      category: 'work',
      status: 'pending',
      punctualityPoints: 0,
      emailSent: false
    })
    
    await task.save()
    
    const reminderTime = new Date(scheduledDateTime.getTime() - 30 * 60000)
    
    res.json({
      message: 'Quick test task created',
      task: {
        title: task.title,
        scheduledTime: convertTo12Hour(task.scheduledTime),
        scheduledDate: scheduledDateTime.toLocaleDateString(),
        emailWillSendAt: reminderTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
