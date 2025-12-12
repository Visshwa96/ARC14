# 📧 Gmail Setup for Email Notifications

## Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/security
2. Under "Signing in to Google", select **2-Step Verification**
3. Click **Get Started** and follow the steps to enable it

## Step 2: Create App Password

1. Go to App Passwords: https://myaccount.google.com/apppasswords
   - (If you don't see this option, make sure 2-Step Verification is enabled)
2. Select **Mail** from the "Select app" dropdown
3. Select **Windows Computer** (or your device) from the "Select device" dropdown
4. Click **Generate**
5. Copy the **16-character password** that appears

## Step 3: Configure ARC-14

1. Open `server/.env` file
2. Update the email credentials:

```env
GMAIL_USER=your.actual.email@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

**Note:** Remove the spaces from the app password when pasting (e.g., `abcdefghijklmnop`)

## Step 4: Set Your Email in the App

1. Run the ARC-14 application
2. Navigate to **Scheduled Tasks** page
3. Enter your email address in the notification setup card
4. Click **Save Email**

## How Email Notifications Work

- **Timing:** You'll receive an email reminder **30 minutes before** each scheduled task
- **One-time:** Each task sends only ONE email (won't spam you)
- **Automatic:** Emails are sent automatically when tasks are due
- **Content:** Includes task details, time, priority, and punctuality point system

## Testing the Email Service

You can test if email is working correctly using the API:

```bash
POST http://localhost:5000/api/scheduled-tasks/test-email
Content-Type: application/json

{
  "email": "your.email@gmail.com"
}
```

## Troubleshooting

### "Email not configured" warning
- Make sure you've set `GMAIL_USER` and `GMAIL_APP_PASSWORD` in `.env`
- Restart the backend server after updating `.env`

### Not receiving emails
- Check spam/junk folder
- Verify the app password is correct (16 characters, no spaces)
- Ensure 2-Step Verification is enabled on your Google account
- Check that your Gmail account is not blocked or suspended

### "Invalid credentials" error
- The app password may have been revoked
- Generate a new app password following Step 2
- Update `.env` with the new password

## Security Notes

- **Never commit `.env` to git** - it's already in `.gitignore`
- App passwords are safer than using your actual Gmail password
- You can revoke app passwords anytime at https://myaccount.google.com/apppasswords
- Each app password is unique and tied to one application

## Alternative: Using Other Email Providers

If you prefer not to use Gmail, you can modify `server/services/emailService.js`:

### Outlook/Hotmail
```javascript
service: 'hotmail',
auth: {
  user: process.env.OUTLOOK_USER,
  pass: process.env.OUTLOOK_PASSWORD
}
```

### Custom SMTP
```javascript
host: 'smtp.your-email-provider.com',
port: 587,
secure: false,
auth: {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASSWORD
}
```

---

Need help? Check the [main README](../README.md) or create an issue on GitHub.
