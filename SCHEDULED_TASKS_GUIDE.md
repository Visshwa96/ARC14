# ⏰ Scheduled Tasks Feature - Complete Guide

## Overview

The Scheduled Tasks feature allows you to plan your day ahead by scheduling tasks with specific times. The system rewards punctuality with points and sends email reminders to help you stay on track.

## Key Features

- ✅ Schedule tasks with date and time
- 📧 Email reminders 30 minutes before task time
- 🎯 Punctuality-based point system (0-10 points)
- 📊 Statistics tracking (completion rate, average score)
- 🔔 Automatic missed task detection
- 📱 Mobile-friendly interface

## Punctuality Point System

### How Points Are Calculated

When you complete a task, points are awarded based on how close you were to the scheduled time:

| Timing | Points | Status |
|--------|--------|--------|
| 5+ minutes early | **10 points** | 🟢 Excellent |
| On time (±5 minutes) | **8 points** | 🟢 Great |
| 5-15 minutes late | **5 points** | 🟡 Good |
| 15-30 minutes late | **3 points** | 🟡 Acceptable |
| 30+ minutes late | **1 point** | 🔴 Needs Work |
| Missed (2+ hours late) | **0 points** | 🔴 Missed |

### Example Scenarios

**Scenario 1: Early Bird** 🌅
- Scheduled: 9:00 AM
- Completed: 8:50 AM
- Result: **10 points** (10 minutes early)

**Scenario 2: Right On Time** ⏰
- Scheduled: 9:00 AM
- Completed: 9:02 AM
- Result: **8 points** (within 5-minute window)

**Scenario 3: Slightly Late** ⚠️
- Scheduled: 9:00 AM
- Completed: 9:12 AM
- Result: **5 points** (12 minutes late)

**Scenario 4: Missed** ❌
- Scheduled: 9:00 AM
- No completion by 11:00 AM
- Result: **0 points** (auto-marked as missed)

## Using the Feature

### 1. Scheduling a Task

1. Navigate to **Scheduled Tasks** from the sidebar
2. Fill in the task form:
   - **Title**: Brief task name (e.g., "Team Meeting")
   - **Description**: Optional details
   - **Date**: Select from today onwards
   - **Time**: Use 24-hour format (HH:MM)
   - **Category**: Work, Personal, Health, Learning, or Social
   - **Priority**: Low, Medium, or High
3. Click **Schedule Task**

### 2. Setting Up Email Notifications

**First Time Setup:**
1. You'll see an email setup card at the top
2. Enter your email address
3. Click **Save Email**

**Configure Backend (One-time):**
1. Follow [GMAIL_SETUP.md](./GMAIL_SETUP.md) to get your Gmail App Password
2. Update `server/.env` with your credentials
3. Restart the backend server

### 3. Completing a Task

1. View your scheduled tasks list
2. Click **✅ Complete** button on the pending task
3. Points are automatically calculated based on completion time
4. View your earned points in the task card

### 4. Filtering Tasks

Use the filter buttons to view:
- **Upcoming**: Tasks scheduled for today and future
- **All**: Every task you've created
- **Pending**: Not yet completed
- **Completed**: Finished tasks with points
- **Missed**: Tasks that weren't completed on time

### 5. Editing and Deleting

- **Edit**: Click ✏️ button to modify pending tasks
- **Delete**: Click 🗑️ button to remove any task

## API Endpoints

### Get All Scheduled Tasks
```http
GET /api/scheduled-tasks
Query Parameters:
  - status: pending|completed|missed
  - date: YYYY-MM-DD
  - upcoming: true
```

### Get Single Task
```http
GET /api/scheduled-tasks/:id
```

### Create Task
```http
POST /api/scheduled-tasks
Body: {
  "title": "Morning Workout",
  "description": "30 minutes cardio",
  "scheduledDate": "2024-12-12",
  "scheduledTime": "07:00",
  "priority": "high",
  "category": "health"
}
```

### Update Task
```http
PUT /api/scheduled-tasks/:id
Body: {
  "title": "Updated title",
  "scheduledTime": "08:00"
}
```

### Complete Task
```http
PUT /api/scheduled-tasks/:id/complete
Response: {
  "status": "completed",
  "completedAt": "2024-12-12T07:05:00.000Z",
  "punctualityPoints": 8
}
```

### Delete Task
```http
DELETE /api/scheduled-tasks/:id
```

### Get Statistics
```http
GET /api/scheduled-tasks/stats/summary
Response: {
  "totalTasks": 50,
  "completedTasks": 42,
  "missedTasks": 3,
  "pendingTasks": 5,
  "averagePunctualityScore": 7.8,
  "totalPointsEarned": 328,
  "completionRate": 84
}
```

## MongoDB Schema

```javascript
{
  title: String (required),
  description: String,
  scheduledDate: Date (required),
  scheduledTime: String (HH:MM format, required),
  status: 'pending' | 'completed' | 'missed',
  completedAt: Date,
  punctualityPoints: Number (0-10),
  emailSent: Boolean,
  emailSentAt: Date,
  priority: 'low' | 'medium' | 'high',
  category: 'work' | 'personal' | 'health' | 'learning' | 'social',
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## Tips for Maximizing Points

1. **Schedule Realistically**: Don't overpack your day
2. **Add Buffer Time**: Account for unexpected delays
3. **Set Reminders Early**: Use the 30-minute email to prepare
4. **Complete Early**: Aim to finish tasks before the scheduled time
5. **Review Weekly**: Check your completion rate and adjust habits

## Gamification Strategy

### Daily Goals
- Complete all tasks on time: **80+ points**
- Maintain >90% completion rate
- Average score above 7.0

### Weekly Challenges
- Zero missed tasks in a week
- Score 10 points on at least 5 tasks
- Complete 35+ tasks in a week

### Level System (Suggested)
- Beginner: 0-100 points
- Intermediate: 101-500 points
- Advanced: 501-1000 points
- Expert: 1000+ points

## Best Practices

### ✅ Do's
- Schedule important tasks in your peak productivity hours
- Use descriptive titles for quick recognition
- Set appropriate priorities
- Review and adjust your schedule nightly

### ❌ Don'ts
- Don't schedule tasks back-to-back (leave transition time)
- Don't mark tasks complete dishonestly (defeats the purpose)
- Don't ignore the email reminders
- Don't overload yourself with too many high-priority tasks

## Troubleshooting

### Not Receiving Email Reminders
1. Check your email setup in the app
2. Verify `.env` configuration
3. Ensure backend server is running
4. Check spam/junk folder

### Tasks Auto-Marked as Missed
- This happens 2 hours after the scheduled time
- Complete tasks within the 2-hour window to earn points

### Points Seem Wrong
- Points are calculated at completion time, not scheduled time
- System uses your device's current time
- Check the calculation logic in `ScheduledTask.js`

## Future Enhancements

Planned features for upcoming versions:
- 🔔 Browser push notifications
- 📱 Mobile app with local notifications
- 🤝 Team task sharing and collaboration
- 📈 Advanced analytics and charts
- 🏆 Achievements and badges system
- 🔁 Recurring scheduled tasks
- ⚡ Quick-add task templates

## Sample Data

Insert test data to try the feature:

```javascript
[
  {
    "title": "Morning Standup Meeting",
    "description": "Daily team sync at 9 AM",
    "scheduledDate": "2024-12-12",
    "scheduledTime": "09:00",
    "priority": "high",
    "category": "work"
  },
  {
    "title": "Gym Workout",
    "description": "Cardio and strength training",
    "scheduledDate": "2024-12-12",
    "scheduledTime": "18:00",
    "priority": "medium",
    "category": "health"
  },
  {
    "title": "Read Book Chapter",
    "description": "Atomic Habits - Chapter 5",
    "scheduledDate": "2024-12-12",
    "scheduledTime": "21:00",
    "priority": "low",
    "category": "learning"
  }
]
```

---

For email setup instructions, see [GMAIL_SETUP.md](./GMAIL_SETUP.md)

For general setup, see [README.md](./README.md)
