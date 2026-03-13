# Email Notification System - Quick Setup Guide

## What's New

✅ **Automated Email Templates** - 7+ pre-built email templates  
✅ **Quiz Announcements** - Auto-send when new quizzes are published  
✅ **Email Queue System** - Schedule emails to send at specific times  
✅ **Batch Email Sending** - Send to multiple recipients simultaneously  
✅ **Update Notifications** - Content, grade, and deadline updates  
✅ **Admin Bulk Announcements** - Institution-wide messaging  

---

## Quick Start

### 1. Verify Email Configuration
Check that your `.env` file contains:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@proctolearn.com
FRONTEND_URL=http://localhost:3000
```

### 2. Start the Backend
```bash
cd backend
npm start
```

You should see:
```
✓ Email service configured correctly
✓ Email queue processor started (checks every 60 seconds)
```

### 3. Test Email Sending
Call any notification endpoint:
```bash
curl -X POST http://localhost:5000/api/notifications/send-quiz-announcement/quizId \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "enrolledStudentIds": ["userId1", "userId2"]
  }'
```

---

## File Structure

```
backend/
├── src/
│   ├── utils/
│   │   └── emailService.js          [NEW] Core email templates & sending
│   ├── services/
│   │   └── emailNotificationService.js [NEW] Notification logic
│   ├── controllers/
│   │   └── notificationController.js   [NEW] API endpoints
│   ├── routes/
│   │   └── notificationRoutes.js       [NEW] Route definitions
│   └── server.js                       [UPDATED] Added notification routes
├── EMAIL_NOTIFICATIONS.md             [NEW] Complete documentation
└── QUICK_SETUP.md                     [NEW] This file
```

---

## API Endpoints

### Send Quiz Announcement
```
POST /api/notifications/send-quiz-announcement/:quizId
Body: { enrolledStudentIds: [...] }
```

### Schedule Quiz Reminder
```
POST /api/notifications/schedule-quiz-reminder/:quizId
Body: { enrolledStudentIds: [...], reminderTime: "2026-03-20T08:00:00Z" }
```

### Send Quiz Update
```
POST /api/notifications/quiz-update/:quizId
Body: { enrolledStudentIds: [...], updateMessage: "..." }
```

### Send Content Update
```
POST /api/notifications/content-update
Body: {
  updateType: "announcement|material|gradeRelease|deadlineChange",
  updateDetails: {...},
  recipientEmails: [...],
  actionUrl: "..."
}
```

### Bulk Announcement (Admin Only)
```
POST /api/notifications/bulk-announcement
Body: {
  title: "...",
  message: "...",
  recipientEmails: [...],
  actionUrl: "..."
}
```

### Schedule Emails
```
POST /api/notifications/schedule-emails
Body: {
  subject: "...",
  htmlTemplate: "...",
  recipientEmails: [...],
  scheduledFor: "2026-03-20T08:00:00Z"
}
```

### Check Queue Status
```
GET /api/notifications/queue-status
```

### Send Grades Notification
```
POST /api/notifications/grades-notification/:quizId
Body: { studentIds: [...] }
```

---

## Email Flow

### When Faculty Creates Quiz
```
1. Faculty clicks "Publish Quiz"
2. Quiz saved to database
3. Endpoint: POST /api/notifications/send-quiz-announcement/:quizId
4. System fetches enrolled students
5. Personalized emails sent to each student
6. Notification shows count sent/failed
```

### Scheduled Email Flow
```
1. Call: POST /api/notifications/schedule-emails
2. Email added to queue with scheduled time
3. Email Queue Processor (runs every 60 seconds):
   - Checks for emails scheduled for now or earlier
   - Sends via SMTP
   - Marks as sent/failed
   - Removes from queue or retries
4. User can check status: GET /api/notifications/queue-status
```

---

## Email Templates

### 1. New Quiz Announcement 📝
- Quiz title, subject, due date
- "Start Quiz Now" button
- 2 color gradient (blue/purple)

### 2. Quiz Update 🔔
- Custom update message
- Quiz details
- "View Details" button
- Green color scheme

### 3. Content Updates 📢
- Dynamic icons by type
- Announcement, Materials, Grades, Deadlines
- Customizable details
- Color-coded templates

### 4. Grades Released 📊
- Quiz title and subject
- Link to grades
- Orange color scheme

### 5. Deadline Change ⏰
- New deadline date
- Time remaining
- Call-to-action button
- Red color scheme

### 6. General Announcement 📢
- Custom title and message
- Action link
- Professional formatting

### 7. Welcome Email 🎉
- Role-specific content
- Features list
- Institution info
- Quick start guide

---

## Important Notes

### Email Queue Processing
- Runs automatically every 60 seconds
- Checks for emails scheduled to send
- Non-blocking (async)
- Failed emails are retried
- Must keep server running for scheduled emails to send

### Bulk Emails
- Admin-only feature
- Use for institution-wide announcements
- Can send to hundreds of recipients
- Subject and custom HTML template
- Supports variable replacement ({{name}}, {{email}})

### Batch Sending
- Efficient for 10+ recipients
- Logs all successes/failures
- Returns detailed results
- Can retry failed sends

---

## Testing

### Test Email Configuration
```bash
curl http://localhost:5000/api/health
```

### Test Sending to Single Student
```bash
curl -X POST http://localhost:5000/api/notifications/quiz-update/quizId \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "enrolledStudentIds": ["userId"],
    "updateMessage": "Test message"
  }'
```

### Monitor Queue
```bash
# Check every 60 seconds from another terminal
watch 'curl -H "Authorization: Bearer {token}" http://localhost:5000/api/notifications/queue-status'
```

---

## Troubleshooting

### Issue: "Email service configuration failed"
**Solution**: Check SMTP credentials in `.env` file

### Issue: Emails not being sent
**Solution**: 
1. Check server is running
2. Verify recipient emails are valid
3. Check `GET /api/notifications/queue-status`
4. Review server console logs

### Issue: Scheduled emails not sending
**Solution**:
1. Ensure server is running continuously
2. Check email queue processor started message on startup
3. Verify `scheduledFor` is a future time
4. Check system time is correct

### Issue: Invalid MongoDB IDs
**Solution**: Use ObjectId format for student IDs (e.g., "507f1f77bcf86cd799439011")

---

## Next Steps

1. **Integrate into Quiz Creation**: Auto-send announcement when faculty creates new quiz
2. **Add Dashboard Widget**: Show email queue status to admins
3. **Email Analytics**: Track opens, clicks, bounces
4. **Subscription Management**: Let students choose email frequency
5. **SMS Notifications**: Add SMS as backup channel
6. **Webhook Integrations**: Send to external systems

---

## Support

Full documentation: See `EMAIL_NOTIFICATIONS.md`
API Reference: All endpoints documented with examples
Code Comments: Inline documentation in source files

For help:
- Check logs: `npm start`
- Read: `backend/EMAIL_NOTIFICATIONS.md`
- Test: Use curl or Postman
- Debug: Add console logs to emailService.js
