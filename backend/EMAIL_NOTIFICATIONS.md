# Email Notification System - Proctolearn

Complete guide for using the automated email notification system in Proctolearn.

## Overview

The email notification system provides:
- **Email Templates**: Pre-designed HTML templates for various notifications
- **Auto-Send Emails**: Automatic sending of emails when events occur
- **Scheduled Emails**: Queue-based system for sending emails at specific times
- **Batch Emails**: Send emails to multiple recipients simultaneously
- **Email Queue Management**: Track and manage pending emails

## Features

### 1. New Quiz Announcement Emails
Send notifications to all enrolled students when a new quiz is created.

**Email Template**:
- Quiz title, subject, and due date
- Direct link to start the quiz
- Professional formatted HTML layout

**Trigger**: Faculty/Admin publishes a new quiz

### 2. Quiz Update/Reminder Emails
Notify students about quiz modifications or schedule reminders.

**Types of Updates**:
- Deadline extensions
- Syllabus updates
- Answer key releases
- Re-attempt opportunities
- Custom messages

### 3. Content/Course Update Emails
Send announcements about course materials, grades, and important dates.

**Update Types**:
- `announcement` - General course announcements
- `material` - New study materials
- `gradeRelease` - Grades have been released
- `deadlineChange` - Meeting/deadline changes

### 4. Bulk Announcements
Admin-only feature to send announcements to institution-wide recipients.

### 5. Scheduled Email Queue
System automatically sends scheduled emails at specified times.

**Features**:
- Check queue every 60 seconds
- Automatic retry logic
- Failed email logging
- Queue status monitoring

---

## API Endpoints

### 1. Send Quiz Announcement
```
POST /api/notifications/send-quiz-announcement/:quizId
```

**Headers**:
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

**Body**:
```json
{
  "enrolledStudentIds": ["userId1", "userId2", "userId3"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Notification sent to 45 students",
  "details": {
    "success": 45,
    "failed": 0,
    "errors": []
  }
}
```

---

### 2. Schedule Quiz Reminder
```
POST /api/notifications/schedule-quiz-reminder/:quizId
```

**Body**:
```json
{
  "enrolledStudentIds": ["userId1", "userId2"],
  "reminderTime": "2026-03-15T14:30:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "message": "2 reminder emails scheduled",
  "scheduledFor": "2026-03-15T14:30:00.000Z"
}
```

---

### 3. Send Quiz Update
```
POST /api/notifications/quiz-update/:quizId
```

**Body**:
```json
{
  "enrolledStudentIds": ["userId1", "userId2"],
  "updateMessage": "The quiz deadline has been extended to March 20th. Good luck!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Update sent to 50 students",
  "details": {
    "success": 50,
    "failed": 0
  }
}
```

---

### 4. Send Content Update
```
POST /api/notifications/content-update
```

**Body**:
```json
{
  "updateType": "announcement",
  "updateDetails": {
    "title": "Course Syllabus Updated",
    "content": "The course syllabus has been updated with new learning objectives.",
    "date": "2026-03-01"
  },
  "recipientEmails": ["student1@example.com", "student2@example.com"],
  "actionUrl": "https://proctolearn.com/courses/1"
}
```

**Update Types**:
- `announcement` - General announcements
- `material` - New materials added
- `gradeRelease` - Grades are available
- `deadlineChange` - Important date changes

**Response**:
```json
{
  "success": true,
  "message": "Update sent to 30 recipients",
  "details": {
    "success": 30,
    "failed": 0,
    "errors": []
  }
}
```

---

### 5. Send Bulk Announcement (Admin Only)
```
POST /api/notifications/bulk-announcement
```

**Body**:
```json
{
  "title": "Platform Maintenance Notice",
  "message": "We will be performing scheduled maintenance on March 15th from 2-4 PM EST. The platform will be temporarily unavailable.",
  "recipientEmails": ["all-students@institution.com"],
  "actionUrl": "https://proctolearn.com/announcements/maintenance"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Announcement sent to 500 recipients",
  "details": {
    "success": 500,
    "failed": 0
  }
}
```

---

### 6. Schedule Emails
```
POST /api/notifications/schedule-emails
```

**Body**:
```json
{
  "subject": "Welcome to Course 101",
  "htmlTemplate": "<html>...</html>",
  "recipientEmails": ["student1@example.com", "student2@example.com"],
  "scheduledFor": "2026-03-20T08:00:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "message": "25 emails scheduled for 3/20/2026, 8:00 AM",
  "scheduledEmails": ["student1@example.com", "student2@example.com", ...]
}
```

---

### 7. Get Email Queue Status
```
GET /api/notifications/queue-status
```

**Response**:
```json
{
  "success": true,
  "queueStatus": {
    "total": 150,
    "pending": 45,
    "sent": 105
  }
}
```

---

### 8. Send Grades Notification
```
POST /api/notifications/grades-notification/:quizId
```

**Body**:
```json
{
  "studentIds": ["userId1", "userId2", "userId3"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Grade notification sent to 100 students",
  "details": {
    "success": 100,
    "failed": 0
  }
}
```

---

## Email Templates

### Quiz Announcement Template
```
Subject: 📝 New Quiz: [Quiz Title]

✨ Features:
- Quiz title and subject
- Due date and deadline
- Direct "Start Quiz" CTA button
- Professional gradient design
```

### Quiz Update Template
```
Subject: 🔔 Update: [Quiz Title]

✨ Features:
- Update message
- Quiz details
- "View Details" CTA button
- Green color scheme
```

### Content Update Template
```
Subject: [Icon] [Update Title]

✨ Features:
- Dynamic icons based on update type
- Detailed update information
- Color-coded by update type
- Call-to-action button
```

---

## Implementation Examples

### Example 1: Faculty Sends Quiz Announcement
```javascript
// When faculty publishes a quiz
const response = await fetch('/api/notifications/send-quiz-announcement/quizId123', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    enrolledStudentIds: arrayOfStudentIds
  })
});

const result = await response.json();
console.log(`Notified ${result.details.success} students`);
```

### Example 2: Schedule Reminder Email
```javascript
// Schedule reminder for 1 day before due date
const dueDate = new Date('2026-03-20');
const reminderDate = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);

const response = await fetch('/api/notifications/schedule-quiz-reminder/quizId123', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    enrolledStudentIds: arrayOfStudentIds,
    reminderTime: reminderDate.toISOString()
  })
});
```

### Example 3: Admin Sends System Announcement
```javascript
// Admin broadcasts platform-wide announcement
const response = await fetch('/api/notifications/bulk-announcement', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'System Upgrade Scheduled',
    message: 'We are upgrading our systems on Sunday. Expect brief downtime.',
    recipientEmails: allStudentEmails,
    actionUrl: 'https://proctolearn.com/announcements'
  })
});
```

---

## Configuration

### Environment Variables
Required settings in `.env`:

```
# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@proctolearn.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Email Queue Processor
EMAIL_QUEUE_CHECK_INTERVAL=60000  # Check every 60 seconds
```

### Email Queue Processing
The system automatically checks for and sends scheduled emails every 60 seconds.

**Queue Processor Features**:
- Automatic retry on failure
- Removes successfully sent emails from queue
- Logs all operations
- Non-blocking (runs asynchronously)

---

## Error Handling

### Common Errors

**1. SMTP Configuration Error**
```json
{
  "success": false,
  "message": "Failed to send announcement",
  "error": "connect ECONNREFUSED"
}
```
**Solution**: Verify SMTP credentials in `.env`

**2. Invalid Student IDs**
```json
{
  "success": false,
  "message": "Failed to send update",
  "errors": [
    { "email": "invalid@user", "error": "User not found" }
  ]
}
```
**Solution**: Check student IDs are valid MongoDB ObjectIds

**3. Future Date Required**
```json
{
  "success": false,
  "message": "Failed to schedule emails",
  "error": "scheduledFor must be a future time"
}
```
**Solution**: Use a date/time in the future

---

## Best Practices

1. **Batch Emails**: Send emails in batches rather than individually for efficiency
2. **Schedule Off-Peak**: Schedule important emails during low-traffic times
3. **Monitor Queue**: Regularly check queue status to ensure emails are being sent
4. **Template Testing**: Test email templates in different clients before sending
5. **Error Logging**: Keep logs of failed emails for debugging
6. **Rate Limiting**: Avoid sending too many emails too quickly
7. **Personalization**: Use student names and quiz titles for better engagement

---

## Troubleshooting

### Emails Not Being Sent
1. Check email configuration: `GET /api/notifications/queue-status`
2. Verify SMTP credentials are correct
3. Check server logs for errors
4. Ensure recipient emails are valid

### Scheduled Emails Not Processing
1. Check queue status shows pending emails
2. Verify server is running email queue processor
3. Check system time is correct
4. Review server logs

### Template Issues
1. Validate HTML syntax in templates
2. Test with sample data first
3. Check email client compatibility
4. Verify all variables are replaced

---

## Support

For issues or feature requests related to the email system:
- Check server logs: `backend/logs/email.log`
- Contact: support@proctolearn.com
- Documentation: See inline code comments in `emailService.js`
