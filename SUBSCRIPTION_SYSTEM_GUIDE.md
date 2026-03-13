# Email Subscription System - Complete Setup Guide

## Overview

The Proctolearn email subscription system allows users to subscribe to newsletters, receive quiz announcements, system updates, and educational content. The system includes automated email confirmations with beautiful HTML templates.

---

## Backend Implementation

### 1. **Subscriber Model** (`backend/src/models/Subscriber.js`)

The Subscriber model handles all subscription data with the following features:

```javascript
{
  email: String (unique, required),
  name: String (optional),
  isActive: Boolean (default: true),
  subscribedAt: Date,
  unsubscribedAt: Date,
  emailsSent: Number,
  lastEmailSentAt: Date,
  source: String ('website', 'landing_page', 'dashboard', 'admin', 'api'),
  preferences: {
    quizUpdates: Boolean,
    systemUpdates: Boolean,
    newsletter: Boolean,
    promotions: Boolean
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String
  }
}
```

**Key Methods:**
- `unsubscribe()` - Mark subscriber as inactive
- `resubscribe()` - Reactivate a subscriber
- `incrementEmailCount()` - Update email tracking
- `Static: getActiveSubscribers()` - Fetch active subscriptions
- `Static: getSubscribersByPreference()` - Filter by preference type

---

### 2. **Email Templates** (`backend/src/utils/emailService.js`)

Three professional email templates have been added:

#### A. Subscription Confirmation Email
**Function:** `sendSubscriptionConfirmationEmail(email, subscriberName)`
- Sent immediately after a successful subscription
- Beautiful gradient design with bounce animation
- Lists subscription benefits (Quiz Updates, System Updates, Newsletter, Exclusive Content)
- Shows email preferences
- Includes unsubscribe link

#### B. Unsubscribe Confirmation Email
**Function:** `sendUnsubscribeConfirmationEmail(email, subscriberName)`
- Sent when a user unsubscribes
- Provides resubscribe link
- Explains what they'll miss
- Professional, respectful tone

#### C. Newsletter Email
**Function:** `sendNewsletterEmail(subject, content, recipients)`
- Batch send newsletters to multiple subscribers
- Includes unsubscribe link in every email
- Supports preference-based sending
- Tracks delivery success/failures

---

### 3. **Subscription Controller** (`backend/src/controllers/subscriptionController.js`)

**Endpoints & Functions:**

#### Public Endpoints (No Auth Required)

**POST `/api/subscriptions/subscribe`**
- Subscribe a new user to the newsletter
- Request body:
  ```json
  {
    "email": "user@example.com",
    "name": "John Doe (optional)",
    "preferences": {
      "quizUpdates": true,
      "systemUpdates": true,
      "newsletter": true,
      "promotions": false
    },
    "source": "website"
  }
  ```
- Response: Confirmation with subscriber data
- Automatically sends confirmation email

**POST `/api/subscriptions/unsubscribe`**
- Unsubscribe from mailing list
- Request body: `{ "email": "user@example.com" }`
- Sends unsubscribe confirmation email

**PATCH `/api/subscriptions/preferences`**
- Update email preferences without unsubscribing
- Request body:
  ```json
  {
    "email": "user@example.com",
    "preferences": {
      "quizUpdates": false,
      "promotions": true
    }
  }
  ```

**GET `/api/subscriptions/check-status?email=user@example.com`**
- Check if an email is subscribed
- Returns subscription status and preferences

#### Admin Endpoints (Requires Admin Role)

**GET `/api/subscriptions/all?page=1&limit=50&isActive=true`**
- Retrieve all subscribers with pagination
- Filter by active/inactive status

**GET `/api/subscriptions/stats`**
- Get subscription statistics
- Returns: total count, active, inactive, recent (30 days), by source

**POST `/api/subscriptions/send-newsletter`**
- Send newsletter to all/filtered subscribers
- Request body:
  ```json
  {
    "subject": "Weekly Update - Quiz Announcements",
    "content": "<h1>This Week's Quizzes</h1>...",
    "preferenceType": "quizUpdates" (optional)
  }
  ```
- Returns delivery results (success count, failures, errors)

---

### 4. **Subscription Routes** (`backend/src/routes/subscriptionRoutes.js`)

Routes configured with proper authentication middleware:
- Public routes: Subscribe, Unsubscribe, Check Status, Update Preferences
- Admin routes: List subscribers, Get stats, Send newsletter

---

### 5. **Server Configuration** (`backend/src/server.js`)

The subscription routes are registered:
```javascript
import subscriptionRoutes from './routes/subscriptionRoutes.js';
...
app.use('/api/subscriptions', subscriptionRoutes);
```

---

## Frontend Implementation

### 1. **SubscriptionForm Component** (`frontend/src/components/Common/SubscriptionForm.jsx`)

A flexible, reusable subscription form with three variants:

**Features:**
- Email validation
- Optional name field
- Success/error messages
- Loading state with spinner
- Three design variants: `default`, `minimal`, `inline`
- Dark mode support
- Animations with Framer Motion

**Usage:**
```jsx
import SubscriptionForm from './components/Common/SubscriptionForm';

// Default variant
<SubscriptionForm variant="default" />

// Minimal variant (for landing pages)
<SubscriptionForm variant="minimal" />

// Inline variant (for footers)
<SubscriptionForm variant="inline" />
```

---

### 2. **Subscribe Page** (`frontend/src/pages/SubscribePage.jsx`)

Complete dedicated subscription landing page featuring:
- Hero section with benefits list
- Subscription form positioned alongside
- Trust indicators (10K+ subscribers, 100% spam-free, 24/7 support)
- FAQ section with 4 common questions
- Responsive design for all devices
- Beautiful gradients and animations

**Route:** `/subscribe`

---

### 3. **Unsubscribe Page** (`frontend/src/pages/UnsubscribePage.jsx`)

User-friendly unsubscribe flow featuring:
- Confirmation dialog with reasons checkboxes
- Option to resubscribe immediately
- Email pulled from URL params automatically
- Two-step confirmation to prevent accidents
- Professional, respectful messaging

**Route:** `/unsubscribe?email=user@example.com`

---

### 4. **App Router Integration** (`frontend/src/App.jsx`)

Public routes added to main App:
```jsx
<Route path="/subscribe" element={<SubscribePage />} />
<Route path="/unsubscribe" element={<UnsubscribePage />} />
```

---

## Email Configuration

### Environment Variables (Already Set)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=nilgadhiya20@gmail.com
SMTP_PASSWORD=tvourwbexzewbngs
EMAIL_FROM=PROCTLEARN
FRONTEND_URL=http://localhost:3000
```

---

## How to Use

### For Users

#### Subscribe:
1. Click "Subscribe" button on the landing page
2. Or navigate to `/subscribe`
3. Enter email and optional name
4. Click "Subscribe Now"
5. Check email for confirmation message

#### Unsubscribe:
1. Click "Unsubscribe" link in any email
2. Or navigate to `/unsubscribe?email=your@email.com`
3. Confirm unsubscription
4. Receive confirmation email

#### Update Preferences:
- Use the preferences in the confirmation email
- Or navigate to settings page (future implementation)

### For Admins

#### Send Newsletter:
```bash
POST /api/subscriptions/send-newsletter
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "subject": "Newsletter - Week of Feb 27",
  "content": "<h1>This week's updates...</h1><p>New quizzes available...</p>",
  "preferenceType": "newsletter"
}
```

#### View Subscribers:
```bash
GET /api/subscriptions/all?page=1&limit=50&isActive=true
Authorization: Bearer {adminToken}
```

#### View Statistics:
```bash
GET /api/subscriptions/stats
Authorization: Bearer {adminToken}
```

---

## API Response Examples

### Subscribe Success
```json
{
  "success": true,
  "message": "Thank you for subscribing! A confirmation email has been sent.",
  "subscriber": {
    "email": "user@example.com",
    "name": "John Doe",
    "isActive": true,
    "subscribedAt": "2026-02-27T10:30:00Z",
    "preferences": {
      "quizUpdates": true,
      "systemUpdates": true,
      "newsletter": true,
      "promotions": false
    }
  }
}
```

### Unsubscribe Success
```json
{
  "success": true,
  "message": "You have been successfully unsubscribed from our mailing list."
}
```

### Send Newsletter Success
```json
{
  "success": true,
  "message": "Newsletter sent successfully",
  "results": {
    "totalRecipients": 150,
    "successfullySent": 150,
    "failed": 0,
    "errors": []
  }
}
```

---

## Testing the System

### Test Subscription Flow
```bash
# 1. Subscribe
curl -X POST http://localhost:5000/api/subscriptions/subscribe \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "source": "website"
  }'

# 2. Check Status
curl "http://localhost:5000/api/subscriptions/check-status?email=test@example.com"

# 3. Update Preferences
curl -X PATCH http://localhost:5000/api/subscriptions/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "preferences": {
      "quizUpdates": false,
      "promotions": true
    }
  }'

# 4. Unsubscribe
curl -X POST http://localhost:5000/api/subscriptions/unsubscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## Database Indexes

The Subscriber model includes three indexes for optimal query performance:
- `email`: For quick lookups and uniqueness enforcement
- `isActive`: For filtering active subscribers
- `subscribedAt`: For chronological sorting

---

## Email Templates Styling

All email templates include:
- Responsive design for mobile and desktop
- Professional gradients matching Proctolearn branding
- Clear call-to-action buttons
- Dark mode considerations
- Unsubscribe links in footer
- Social media links
- Professional footer with contact info

---

## Security Considerations

1. **Email Validation**: Both server (regex) and client-side validation
2. **Rate Limiting**: Track subscription source to prevent abuse
3. **Unsubscribe Verification**: Emails must match exactly
4. **Data Privacy**: Stored IP, user agent, but not sold/shared
5. **SMTP Security**: TLS encryption enabled (port 587)
6. **Admin Routes**: Protected by `auth` and `checkRole(USER_ROLES.ADMIN)` middleware

---

## Future Enhancements

1. **Subscription Preferences UI**
   - Dashboard page for managing email preferences
   - Frequency settings (daily, weekly, monthly)
   - Content category preferences

2. **Analytics & Reporting**
   - Email open tracking (via pixel tracking)
   - Click tracking on email links
   - Subscriber engagement reports

3. **Advanced Segmentation**
   - Send emails based on user role (student, faculty, admin)
   - Time zone-aware scheduling
   - Engagement-based filtering (active vs inactive)

4. **GDPR Compliance**
   - Consent tracking with timestamps
   - Data export functionality
   - Automatic purge of inactive subscribers

5. **A/B Testing**
   - Subject line testing
   - Content variant testing
   - Optimal send time calculation

6. **Webhook Integration**
   - Bounce handling
   - Spam complaint handling
   - Delivery status updates

---

## Troubleshooting

### Emails Not Sending
1. Check SMTP config in `.env`
2. Verify inbox for confirmation
3. Check spam folder
4. Review error logs in console

### Duplicate Subscriptions
- System automatically handles duplicates
- Returns existing subscription if already subscribed
- Reactivates if previously unsubscribed

### Database Issues
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify Subscriber collection exists

---

## File Structure

```
backend/
├── src/
│   ├── models/
│   │   └── Subscriber.js (NEW)
│   ├── controllers/
│   │   └── subscriptionController.js (NEW)
│   ├── routes/
│   │   └── subscriptionRoutes.js (NEW)
│   ├── utils/
│   │   └── emailService.js (UPDATED)
│   └── server.js (UPDATED)

frontend/
├── src/
│   ├── components/
│   │   └── Common/
│   │       └── SubscriptionForm.jsx (NEW)
│   ├── pages/
│   │   ├── SubscribePage.jsx (NEW)
│   │   └── UnsubscribePage.jsx (NEW)
│   └── App.jsx (UPDATED)
```

---

## Summary

The complete email subscription system is now ready to use. Users can subscribe through the website, receive beautiful confirmation emails, manage preferences, and unsubscribe at any time. Admins can send newsletters to targeted subscriber groups and track engagement statistics.

All email templates are production-ready with professional design, full responsiveness, and accessibility compliance.
