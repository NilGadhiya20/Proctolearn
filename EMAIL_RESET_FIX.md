# Password Reset Email Fix

## What Was Fixed

### 1. **Enhanced Email Service Configuration** (`emailService.js`)
- Added `requireTLS: true` to ensure TLS encryption is properly enforced
- Added `parseInt()` for port configuration to prevent string/number mismatch
- Enabled logging and debug mode for better error diagnosis
- Improved error logging with detailed error information including error code, response, and command

### 2. **Better Error Reporting** (`authController.js`)
- Enhanced `forgotPassword` endpoint error handling
- Added detailed logging of email errors for debugging
- Improved error messages sent to frontend
- Added new `testEmailConfiguration` endpoint for email verification

### 3. **New Test Email Endpoint** 
- Added `/auth/test-email` POST endpoint to test email configuration
- Helps verify SMTP credentials are working correctly

## Current Email Configuration

Your `.env` file has:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=nilgadhiya20@gmail.com
SMTP_PASSWORD=tvourwbexzewbngs
EMAIL_FROM=nilgadhiya20@gmail.com
FRONTEND_URL=http://localhost:3000
```

## How to Test

### Method 1: Using the Test Email Endpoint
Send a POST request to:
```
http://localhost:5000/api/auth/test-email
```

Body:
```json
{
  "testEmail": "your-test-email@example.com"
}
```

### Method 2: Using Frontend Console
Open browser DevTools and test directly from your forgot password page.

## Troubleshooting

### Issue 1: "Failed to send reset email"

**Solution A: Check Gmail App Password**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Generate an App Password (not your regular password)
4. Update `SMTP_PASSWORD` in `.env`
5. Restart backend server

**Solution B: Enable "Less secure apps"** (Not recommended but works)
1. Go to [Google Security Settings](https://myaccount.google.com/lesssecureapps)
2. Enable "Allow less secure apps"

### Issue 2: Connection Timeout

Add connection timeout configuration to `.env`:
```
SMTP_CONNECTION_TIMEOUT=5000
```

Then update `emailService.js`:
```javascript
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  requireTLS: true,
  connectionTimeout: parseInt(process.env.SMTP_CONNECTION_TIMEOUT || 5000),
  socketTimeout: 5000,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
```

### Issue 3: Check Server Logs

After attempting to reset password, check your backend console for detailed error messages:
```
Email sending error details: {
  message: "...",
  code: "...",
  response: "...",
  command: "..."
}
```

## Common Gmail Issues

1. **Error: Invalid login credentials**
   - Make sure you're using an App Password, not your Google password
   - Verify email address is correct (case-sensitive in some cases)

2. **Error: SMTP connection failed**
   - Verify your internet connection
   - Check if port 587 is not blocked by firewall
   - Try port 465 with `secure: true` instead (alternate configuration)

3. **Error: Authentication failed**
   - Confirm 2-Step Verification is enabled
   - Generate a fresh App Password
   - Wait a few minutes after generating before using

## Alternative SMTP Configuration (If Gmail fails)

If Gmail continues to fail, try these alternatives:

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxx
```

### AWS SES
```env
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

### Outlook/Microsoft 365
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-app-password
```

## Testing Steps

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test Email Configuration**
   ```bash
   curl -X POST http://localhost:5000/api/auth/test-email \
     -H "Content-Type: application/json" \
     -d '{"testEmail":"your-email@example.com"}'
   ```

3. **Check for Email in Inbox/Spam**
   - Look in your inbox
   - Check spam folder
   - Check promotions tab (for Gmail)

4. **Verify in Logs**
   - Check backend console for "Password reset email sent successfully"
   - Note the messageId in the logs

## If Still Not Working

1. **Enable verbose logging** in backend
2. Check firewall/antivirus blocking port 587
3. Verify MongoDB connection is working
4. Ensure user email exists in database
5. Check `.env` file has no extra spaces or special characters

## Next Steps

After fixing:
1. Test with a real account
2. Try the forgot password flow end-to-end
3. Verify reset link works in the email
4. Confirm password can be reset successfully
5. Test login with new password
