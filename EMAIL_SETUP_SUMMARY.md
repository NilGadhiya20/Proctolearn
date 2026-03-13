# Email Setup & Forgot Password - Implementation Summary

## ✅ Everything That's Been Done

### 1. **Backend Changes**

#### **Updated Files:**

1. **backend/.env** 
   - Added your email: `nilgadhiya20@gmail.com`
   - Added password reset configuration

2. **backend/src/models/User.js**
   - Added `passwordResetToken` field (stores hashed reset token)
   - Added `passwordResetExpires` field (stores when token expires)

3. **backend/src/controllers/authController.js**
   - Added import for `crypto` module (for generating secure tokens)
   - Added import for `sendPasswordResetEmail` function
   - **Added 2 new functions:**
     - `forgotPassword()` - Handles "I forgot my password" request
     - `resetPassword()` - Handles actual password reset

4. **backend/src/routes/authRoutes.js**
   - Added import for the 2 new functions
   - Added 2 new routes:
     - `POST /api/auth/forgot-password`
     - `POST /api/auth/reset-password`

5. **backend/src/utils/emailService.js** (Already existed!)
   - Has `sendPasswordResetEmail()` function ready to use

---

## 🔧 What You Need to Do

### **CRITICAL STEP: Get App Password from Gmail**

Gmail requires special passwords for apps. Follow these exact steps:

**Step 1: Go to Google Account**
- Visit: https://myaccount.google.com
- (You must be logged into nilgadhiya20@gmail.com)

**Step 2: Click Security**
- In left sidebar, find "Security"
- Click it

**Step 3: Find App passwords**
- Scroll down to "App passwords"
- (You might need to enter password again)

**Step 4: Create App Password**
- Select "Mail" from dropdown
- Select "Windows Computer" (or your OS)
- Click "Generate"
- Copy the 16-character password displayed

**Step 5: Update .env**
- Open: `backend/.env`
- Find: `SMTP_PASSWORD=`
- Paste your 16-character password

```env
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
```

**Step 6: Restart Backend**
- Stop your backend server (Ctrl + C)
- Run: `npm start`

---

## 📝 How to Use the Forgot Password Feature

### **Frontend Flow (What users do):**

1. User goes to login page
2. Clicks "Forgot Password" link
3. Enters email address
4. Clicks "Send Reset Link"
5. Checks email (check spam folder if needed!)
6. Clicks link in email
7. Enters new password
8. Clicks "Reset Password"
9. Redirected back to login
10. Logs in with new password ✅

### **API Calls (What happens behind the scenes):**

**Endpoint 1: Request Password Reset**
```javascript
// Frontend code
const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});

// Expected Response
{
  "success": true,
  "message": "If an account exists with this email, a password reset link will be sent"
}
```

**Endpoint 2: Reset Password**
```javascript
// Frontend code
const response = await fetch('http://localhost:5000/api/auth/reset-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'abc123...', // from URL
    email: 'user@example.com',
    newPassword: 'newpass123',
    confirmPassword: 'newpass123'
  })
});

// Expected Response
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password."
}
```

---

## 🧪 Testing Instructions

### **Test 1: Request Password Reset**

Using **Postman** or **curl**:

```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "nilgadhiya20@gmail.com"}'
```

**Expected:**
- You get an email from noreply
- Email contains reset link with token

### **Test 2: Check Your Email**

- Open inbox for nilgadhiya20@gmail.com
- Look for email with subject: "Password Reset Request - Proctolearn"
- Copy the reset link from the email

### **Test 3: Reset Password**

```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "paste_token_from_url_here",
    "email": "nilgadhiya20@gmail.com",
    "newPassword": "newpass123",
    "confirmPassword": "newpass123"
  }'
```

**Expected:**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password."
}
```

### **Test 4: Login with New Password**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nilgadhiya20@gmail.com",
    "password": "newpass123"
  }'
```

**Expected:** Login successful with tokens! ✅

---

## 🎨 Frontend Pages to Create (Optional)

If you want a nice UI, add these pages:

### **Pages to Create:**

1. `frontend/src/pages/ForgotPassword.jsx`
2. `frontend/src/pages/ResetPassword.jsx`

(Complete code provided in `FORGOT_PASSWORD_GUIDE.md`)

### **Add Navigation:**

Update your Login page to add links:
```jsx
<Button onClick={() => navigate('/forgot-password')}>
  Forgot Password?
</Button>
```

---

## 🔐 Security Features Explained

| Feature | Why? |
|---------|------|
| **Token Hashing** | Even if database is hacked, hackers get hashed token, not the real one |
| **1 Hour Expiry** | Old tokens become useless after 1 hour |
| **One-Time Use** | Token is deleted after password reset |
| **Email Verification** | Only person with email access can reset password |
| **Password Hashing** | Actual password never stored in plain text |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **No email received** | Check spam folder, verify Gmail App Password is correct |
| **"Invalid App Password"** | Generate new one from Google Account settings |
| **Email still not working** | Make sure `SMTP_USER` and `EMAIL_FROM` match in `.env` |
| **Token expired error** | Token only lasts 1 hour, request new reset link |
| **"Invalid or expired token"** | Token was already used or expired, request reset again |

---

## 📚 Files Modified/Created

```
backend/
├── .env (✏️ UPDATED)
├── src/
│   ├── models/User.js (✏️ UPDATED - Added reset fields)
│   ├── controllers/authController.js (✏️ UPDATED - Added 2 functions)
│   └── routes/authRoutes.js (✏️ UPDATED - Added 2 routes)
│   └── utils/emailService.js (✅ Already has sendPasswordResetEmail)

frontend/
├── src/pages/ForgotPassword.jsx (📝 OPTIONAL - Create this)
└── src/pages/ResetPassword.jsx (📝 OPTIONAL - Create this)

Root/
└── FORGOT_PASSWORD_GUIDE.md (📖 For reference)
```

---

## 🎯 Next Steps

1. ✅ **Generate Gmail App Password** (MOST IMPORTANT!)
2. ✅ **Update .env file** with the App Password
3. ✅ **Restart backend server**
4. ✅ **Test the API** using Postman or curl
5. ✅ **Create frontend pages** (optional but recommended)
6. ✅ **Add navigation links** from login page

---

## 💬 Example Email (What Users Will Receive)

**Subject:** Password Reset Request - Proctolearn

**Body:**
```
Hi Neel,

You requested a password reset. Click the link below to reset your password:

[Reset Password Button/Link]

Or copy this link: 
http://localhost:3000/reset-password?token=abc123...&email=nilgadhiya20@gmail.com

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

---
Proctolearn Team
```

---

## ✨ You're All Set!

You now have a complete, secure forgot password system! 🎉

**Email:** Works with nilgadhiya20@gmail.com ✅
**Security:** Industry-standard practices ✅
**Beginner-friendly:** Easy to understand and test ✅

**Any Questions?** Refer back to FORGOT_PASSWORD_GUIDE.md!
