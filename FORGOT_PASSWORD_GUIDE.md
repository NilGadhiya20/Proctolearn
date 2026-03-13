# Forgot Password Flow - Complete Guide for Beginners

## What We Did (Simple Explanation for a 7-year-old 😊)

Imagine you forgot your password to a game. Here's what happens:

1. **You ask for help**: You tell the website "Hey! I forgot my password!"
2. **Website checks**: The website checks if you have an account and saves a special secret code
3. **Email sent**: The website sends you an email with a "magic link" 
4. **You click link**: You click the link in the email
5. **New password**: You type a new password
6. **Done!**: You're now logged in with your new password! 🎉

---

## Step-by-Step Setup Instructions

### ✅ What We've Already Done:

1. ✅ Installed nodemailer (the email sender)
2. ✅ Updated `.env` file with your email (`nilgadhiya20@gmail.com`)
3. ✅ Added password reset fields to User Model
4. ✅ Created forgot password and reset password functions in auth controller
5. ✅ Added routes for forgot password and reset password

### ⚠️ What You Still Need to Do:

#### **STEP 1: Get App Password from Gmail** 🔑

Since we're using Gmail (`nilgadhiya20@gmail.com`), you need to create an "App Password":

**Steps:**
1. Go to: https://myaccount.google.com/
2. Click **Security** (left sidebar)
3. Scroll down to **App passwords** 
4. Select: **Mail** and **Windows Computer**
5. Copy the 16-character password
6. Paste it in `.env` file:
   ```
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   ```

> **Why?** Gmail requires special passwords for apps for security!

---

#### **STEP 2: Update `.env` File**

Open `backend/.env` and make sure it looks like this:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=nilgadhiya20@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx    <-- Paste your 16-char password
EMAIL_FROM=nilgadhiya20@gmail.com
```

---

#### **STEP 3: Create Frontend Forgot Password Page** (Optional but recommended)

Create a new file: `frontend/src/pages/ForgotPassword.jsx`

```jsx
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Card, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/forgot-password',
        { email }
      );

      setMessage('Check your email for password reset link!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', pt: 4 }}>
      <Card sx={{ maxWidth: 400, p: 3 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          Forgot Password?
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <Button 
            fullWidth 
            variant="contained" 
            color="primary"
            type="submit"
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <Button 
            fullWidth 
            variant="text"
            onClick={() => navigate('/login')}
          >
            Back to Login
          </Button>
        </form>
      </Card>
    </Box>
  );
};

export default ForgotPassword;
```

---

#### **STEP 4: Create Reset Password Page** (Optional but recommended)

Create: `frontend/src/pages/ResetPassword.jsx`

```jsx
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Card, Alert } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/reset-password',
        { token, email, newPassword, confirmPassword }
      );

      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Alert severity="error">Invalid password reset link</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', pt: 4 }}>
      <Card sx={{ maxWidth: 400, p: 3 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          Reset Password
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            sx={{ mb: 2 }}
          />

          <Button 
            fullWidth 
            variant="contained" 
            color="primary"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </Card>
    </Box>
  );
};

export default ResetPassword;
```

---

## API Endpoints (What to use when making requests)

### 1️⃣ **Request Password Reset**
```
POST /api/auth/forgot-password
Body: { "email": "nilgadhiya20@gmail.com" }
Response: { "success": true, "message": "Email sent..." }
```

### 2️⃣ **Reset Password**
```
POST /api/auth/reset-password
Body: { 
  "token": "abc123...",
  "email": "nilgadhiya20@gmail.com",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
Response: { "success": true, "message": "Password reset successfully" }
```

---

## How It Works (Technical Explanation for Beginners)

### Timeline:

```
1. User clicks "Forgot Password" → ForgotPassword.jsx page
2. User enters email → API call to POST /forgot-password
3. Backend finds user → Generates random token
4. Backend sends email → Email includes reset link with token
5. User gets email → Contains link with token + email
6. User clicks link → Redirects to ResetPassword.jsx
7. User enters new password → API call to POST /reset-password
8. Backend validates token → Checks if token matches and not expired
9. Backend updates password → New password is hashed and saved
10. User can login → New password works! ✅
```

---

## Security Features (Why this is safe)

✅ **Token Expires in 1 hour** - Bad people can't use old links

✅ **Token is Hashed** - Even if database is hacked, token is encrypted

✅ **Password is Hashed** - We never store actual passwords

✅ **One-time Use** - Token is deleted after use

✅ **Email Verification** - Only person with email access can reset password

---

## Testing Checklist

- [ ] Gmail App Password is set in `.env`
- [ ] Backend restarted after `.env` change
- [ ] Can call `/forgot-password` endpoint
- [ ] Receive email successfully  
- [ ] Reset link works
- [ ] Can set new password
- [ ] Can login with new password

---

## Common Questions (FAQ)

### Q: I don't receive the email?
**A:** Check spam folder! If still nothing:
- Verify Gmail App Password is correct
- Make sure `SMTP_USER` and `EMAIL_FROM` match your email
- Restart backend server

### Q: How long is the reset link valid?
**A:** 1 hour from when requested

### Q: Can I use the same reset link twice?
**A:** No! Link is deleted after first use for security

### Q: What if I didn't request the password reset?
**A:** Ignore the email. Link will expire in 1 hour.

---

## Next Steps

1. Generate Gmail App Password (detailed above)
2. Update `.env` file
3. Restart backend server
4. Test by requesting password reset
5. Add ForgotPassword and ResetPassword pages to your frontend
6. Add links to them from Login page

**You're all set! 🚀**
