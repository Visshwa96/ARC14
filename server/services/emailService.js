import sgMail from '@sendgrid/mail'
import ScheduledTask from '../models/ScheduledTask.js'

// SendGrid configuration
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Send task reminder email
export const sendTaskReminder = async (task, recipientEmail) => {
  try {
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDER_EMAIL) {
      console.warn('Email credentials not configured. Skipping email notification.')
      return { success: false, message: 'Email not configured' }
    }

    // Additional safety check - don't send if already sent
    if (task.emailSent) {
      console.warn(`⚠️ Email already sent for task: ${task.title} (ID: ${task._id})`)
      return { success: false, message: 'Email already sent' }
    }

    console.log(`📧 Preparing to send email for task: ${task.title} (ID: ${task._id})`)

    const scheduledDateTime = new Date(task.scheduledDate)
    const [hours, minutes] = task.scheduledTime.split(':')
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes))

    const formattedDate = scheduledDateTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const formattedTime = scheduledDateTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })

    const priorityEmoji = {
      low: '🟢',
      medium: '🟡',
      high: '🔴'
    }

    const categoryEmoji = {
      work: '💼',
      personal: '👤',
      health: '💪',
      learning: '📚',
      social: '👥'
    }

    const mailOptions = {
      from: process.env.SENDER_EMAIL,  // Simple string format
      to: recipientEmail,
      subject: `⏰ Reminder: ${task.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 30px 20px;
            }
            .task-title {
              font-size: 22px;
              font-weight: bold;
              color: #333;
              margin-bottom: 15px;
            }
            .task-details {
              background-color: #f8f9fa;
              border-left: 4px solid #667eea;
              padding: 15px;
              margin: 20px 0;
            }
            .detail-row {
              margin: 10px 0;
              font-size: 16px;
              color: #555;
            }
            .detail-label {
              font-weight: bold;
              color: #333;
            }
            .description {
              background-color: #fff9e6;
              border-radius: 5px;
              padding: 15px;
              margin: 20px 0;
              font-size: 15px;
              color: #555;
            }
            .points-info {
              background-color: #e8f5e9;
              border-radius: 5px;
              padding: 15px;
              margin: 20px 0;
              text-align: center;
            }
            .points-title {
              font-weight: bold;
              color: #2e7d32;
              font-size: 18px;
              margin-bottom: 10px;
            }
            .points-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
              margin-top: 10px;
              text-align: left;
              font-size: 14px;
              color: #333;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #777;
              font-size: 14px;
            }
            .emoji {
              font-size: 20px;
              margin-right: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Scheduled Task Reminder</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">ARC-14 System</p>
            </div>
            
            <div class="content">
              <div class="task-title">
                ${categoryEmoji[task.category]} ${task.title}
              </div>
              
              <div class="task-details">
                <div class="detail-row">
                  <span class="detail-label">📅 Date:</span> ${formattedDate}
                </div>
                <div class="detail-row">
                  <span class="detail-label">🕐 Time:</span> ${formattedTime}
                </div>
                <div class="detail-row">
                  <span class="detail-label">Priority:</span> ${priorityEmoji[task.priority]} ${task.priority.toUpperCase()}
                </div>
                <div class="detail-row">
                  <span class="detail-label">Category:</span> ${task.category}
                </div>
              </div>
              
              ${task.description ? `
                <div class="description">
                  <strong>📝 Description:</strong><br/>
                  ${task.description}
                </div>
              ` : ''}
              
              <div class="points-info">
                <div class="points-title">🎯 Punctuality Points System</div>
                <p style="margin: 10px 0; color: #666;">Complete your task on time to earn maximum points!</p>
                <div class="points-grid">
                  <div>✅ 5+ min early: <strong>10 points</strong></div>
                  <div>✅ On time (±5 min): <strong>8 points</strong></div>
                  <div>⚠️ 5-15 min late: <strong>5 points</strong></div>
                  <div>⚠️ 15-30 min late: <strong>3 points</strong></div>
                  <div>❌ 30+ min late: <strong>1 point</strong></div>
                  <div>❌ Missed (2+ hrs): <strong>0 points</strong></div>
                </div>
              </div>
              
              <p style="text-align: center; margin-top: 30px; color: #555;">
                Complete this task in the ARC-14 app to track your progress and earn points!
              </p>
            </div>
            
            <div class="footer">
              <p>This is an automated reminder from your ARC-14 Task Scheduler</p>
              <p style="margin-top: 10px;">Stay focused, stay consistent! 💪</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    const msg = {
      to: recipientEmail,
      from: process.env.SENDER_EMAIL,
      subject: `⏰ Reminder: ${task.title}`,
      html: mailOptions.html
    }

    const response = await sgMail.send(msg)
    
    console.log(`✅ Email sent successfully to ${recipientEmail} for task: ${task.title}`)
    
    return {
      success: true,
      messageId: response[0].headers['x-message-id'],
      recipient: recipientEmail
    }
  } catch (error) {
    console.error(`❌ Error sending email for task ${task.title}:`, error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// Check and send reminders for pending tasks
export const checkAndSendReminders = async (recipientEmail) => {
  try {
    const now = new Date()
    const reminderWindow = new Date(now.getTime() + 30 * 60000) // 30 minutes ahead

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 SCHEDULED TASKS CHECK')
    console.log(`🕐 Current Time: ${now.toLocaleTimeString('en-US', { hour12: false })}`)
    console.log(`📅 Date: ${now.toLocaleDateString('en-US')}`)
    console.log(`⏰ Reminder Window: Next 30 minutes (until ${reminderWindow.toLocaleTimeString('en-US', { hour12: false })})`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Find all pending tasks that haven't been emailed yet
    const allPendingTasks = await ScheduledTask.find({
      status: 'pending',
      emailSent: false
    }).sort({ scheduledDate: 1, scheduledTime: 1 })

    console.log(`📊 Total Pending Tasks (not yet emailed): ${allPendingTasks.length}\n`)

    if (allPendingTasks.length === 0) {
      console.log('✅ No pending tasks scheduled\n')
      return {
        success: true,
        count: 0,
        tasks: []
      }
    }

    // Log all pending tasks with their scheduled times
    console.log('📝 ALL PENDING TASKS:')
    allPendingTasks.forEach((task, index) => {
      const scheduledDateTime = new Date(task.scheduledDate)
      const [hours, minutes] = task.scheduledTime.split(':')
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes))
      
      const timeUntil = Math.round((scheduledDateTime - now) / 60000) // minutes
      const status = timeUntil <= 30 && timeUntil >= 0 ? '🔔 DUE FOR REMINDER' : '⏳ SCHEDULED'
      
      console.log(`  ${index + 1}. [${status}] ${task.title}`)
      console.log(`     ├─ Scheduled: ${scheduledDateTime.toLocaleString('en-US')}`)
      console.log(`     ├─ Time until: ${timeUntil} minutes`)
      console.log(`     ├─ Priority: ${task.priority.toUpperCase()}`)
      console.log(`     └─ Category: ${task.category}`)
    })
    console.log('')

    // Filter tasks within the reminder window
    const tasksInReminderWindow = []
    const tasksNotYetDue = []

    for (const task of allPendingTasks) {
      const scheduledDateTime = new Date(task.scheduledDate)
      const [hours, minutes] = task.scheduledTime.split(':')
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes))

      // Check if task is within reminder window
      if (scheduledDateTime >= now && scheduledDateTime <= reminderWindow) {
        tasksInReminderWindow.push(task)
      } else if (scheduledDateTime > reminderWindow) {
        tasksNotYetDue.push(task)
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔔 REMINDER WINDOW ANALYSIS:')
    console.log(`  ✉️  Tasks to send email: ${tasksInReminderWindow.length}`)
    console.log(`  ⏳ Tasks not yet due: ${tasksNotYetDue.length}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    if (tasksInReminderWindow.length === 0) {
      console.log('✅ No tasks due for reminder at this time\n')
      return {
        success: true,
        count: 0,
        tasks: []
      }
    }

    // Send reminders for tasks in the window
    console.log('📧 SENDING EMAIL REMINDERS:\n')
    const remindersSent = []
    const remindersFailed = []

    for (const task of tasksInReminderWindow) {
      const scheduledDateTime = new Date(task.scheduledDate)
      const [hours, minutes] = task.scheduledTime.split(':')
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes))

      console.log(`📮 Sending reminder for: "${task.title}"`)
      console.log(`   ├─ Scheduled at: ${scheduledDateTime.toLocaleTimeString('en-US', { hour12: false })}`)
      console.log(`   ├─ Email to: ${recipientEmail || process.env.GMAIL_USER}`)
      
      const result = await sendTaskReminder(task, recipientEmail || process.env.GMAIL_USER)
      
      if (result.success) {
        task.emailSent = true
        task.emailSentAt = new Date()
        await task.save()
        remindersSent.push(task)
        console.log(`   └─ ✅ Email sent successfully (ID: ${result.messageId?.substring(0, 20)}...)\n`)
      } else {
        remindersFailed.push({ task, error: result.error })
        console.log(`   └─ ❌ Failed to send email: ${result.error}\n`)
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 SUMMARY:')
    console.log(`  ✅ Emails sent successfully: ${remindersSent.length}`)
    console.log(`  ❌ Emails failed: ${remindersFailed.length}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    return {
      success: true,
      count: remindersSent.length,
      tasks: remindersSent,
      failed: remindersFailed
    }
  } catch (error) {
    console.error('❌ Error in checkAndSendReminders:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Send test email
export const sendTestEmail = async (recipientEmail) => {
  try {
    console.log(`📧 sendTestEmail called for: ${recipientEmail}`)
    
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDER_EMAIL) {
      console.log('❌ Email credentials not configured')
      throw new Error('Email credentials not configured')
    }

    console.log('✅ SendGrid credentials found, preparing message...')

    const msg = {
      to: recipientEmail,
      from: process.env.SENDER_EMAIL,  // Simple string format
      subject: '✅ ARC-14 Email Service Test',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #667eea;">✅ Email Service Active!</h2>
          <p>Your ARC-14 email notification service is configured correctly.</p>
          <p>You will receive reminders for your scheduled tasks at the specified times.</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">This is a test email from ARC-14 Task Scheduler (via SendGrid)</p>
        </div>
      `
    }

    console.log('📤 Sending email via SendGrid HTTP API...')
    const response = await sgMail.send(msg)
    console.log(`✅ Email sent successfully! MessageId: ${response[0].headers['x-message-id']}`)
    
    return {
      success: true,
      messageId: response[0].headers['x-message-id'],
      message: 'Test email sent successfully'
    }
  } catch (error) {
    console.log(`❌ Error in sendTestEmail: ${error.message}`)
    return {
      success: false,
      error: error.message
    }
  }
}
