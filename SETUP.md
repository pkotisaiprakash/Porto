# Environment Setup Guide

This guide walks you through setting up Google OAuth and Email (SMTP) for the Portfolio Builder application.

---

## Table of Contents

1. [Google OAuth Setup](#google-oauth-setup)
2. [Email (SMTP) Setup](#email-smtp-setup)
3. [Environment Variables Configuration](#environment-variables-configuration)
4. [Testing the Integration](#testing-the-integration)

---

## Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown in the top-left corner
3. Click "New Project"
4. Enter a name (e.g., "Portfolio Builder") and click "Create"
5. Wait for the project to be created

### Step 2: Configure OAuth Consent Screen

1. In your project, go to **APIs & Services** > **OAuth consent screen**
2. Select **External** (or Internal if using a Google Workspace)
3. Fill in the required fields:
   - **App name**: Portfolio Builder
   - **User support email**: Your email address
   - **Developer contact email**: Your email address
4. Click "Save and Continue"
5. On "Scopes" page, click "Save and Continue" (no additional scopes needed)
6. On "Test users" page, add your email as a test user (required for development)
7. Click "Save and Continue" then "Back to dashboard"

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click "Create Credentials" > **OAuth client ID**
3. Select **Web application** as the application type
4. Configure:
   - **Name**: Portfolio Builder Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173`
     - `http://localhost:3000`
     - Your production URL (if deployed)
   - **Authorized redirect URIs**:
     - `http://localhost:5000/api/auth/google/callback`
     - Your production callback URL (e.g., `https://your-domain.com/api/auth/google/callback`)
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**
   
---

## Email (SMTP) Setup

### Option 1: Gmail (App Password)

**Note**: Gmail requires an App Password, not your regular password.

1. Go to your Google Account
2. Click **Security** (left sidebar)
3. Under "How you sign in to Google," enable **2-Step Verification**
4. After enabling 2SV, go to **App passwords**
   - Search for "App passwords" in the search bar if you don't see it
5. Create a new app password:
   - **Select app**: Mail
   - **Select device**: Other (custom name like "Portfolio Builder")
6. Copy the 16-character password shown

### Option 2: Other Email Providers

For other SMTP services (SendGrid, Mailgun, Outlook, etc.):

1. Log into your email provider's dashboard
2. Navigate to SMTP settings or API keys
3. Create new credentials with:
   - **SMTP Host**: smtp.provider.com
   - **SMTP Port**: 587 (TLS) or 465 (SSL)
   - **Username**: Your email or API key
   - **Password**: Your password or API key

---

## Environment Variables Configuration

### Step 1: Create `.env` File

In the `backend/` directory, create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

### Step 2: Configure All Variables

Edit the `.env` file and fill in these values:

```env
# ===================
# MongoDB Connection
# ===================
MONGO_URI=mongodb://localhost:27017/portfolio-builder

# ===================
# JWT Configuration
# ===================
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRE=7d

# ===================
# Server Configuration
# ===================
PORT=5000
NODE_ENV=development

# ===================
# Email (SMTP) Configuration
# ===================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=Portfolio Builder

# ===================
# Google OAuth Configuration
# ===================
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# ===================
# Frontend URL
# ===================
FRONTEND_URL=http://localhost:5173
```

---

## Testing the Integration

### 1. Test Google OAuth

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open `http://localhost:5173`
4. Click "Continue with Google" on the Login or Register page
5. You should be redirected to Google for authentication
6. After successful auth, you'll be redirected back to the app

### 2. Test Email (OTP & Password Reset)

**Development Mode**: Emails are logged to console (check terminal)

**Production Mode**: 

1. Set `NODE_ENV=production` in `.env`
2. Restart the server
3. Test:
   - Register a new account
   - Use "Forgot Password" to request a reset link
   - Check your email for the OTP or reset link

### 3. Verify Email Was Sent

Check the backend terminal for:
```
OTP Email would be sent to: user@example.com
OTP Code: 123456
```

Or in production mode:
```
Password Reset Email sent: <message-id>
```

---

## Troubleshooting

### Google OAuth Errors

| Error | Solution |
|-------|----------|
| "invalid_client" | Check GOOGLE_CLIENT_ID is correct |
| "redirect_uri_mismatch" | Add your callback URL in Google Console |
| "access_denied" | Add your email as test user in OAuth consent |

### Email Errors

| Error | Solution |
|-------|----------|
| "Invalid login" | Use App Password, not regular password |
| "Connection timeout" | Check SMTP_HOST and SMTP_PORT |
| "ENOTFOUND" | Verify SMTP_HOST is correct |

### Common Issues

1. **Emails not sending in development**: This is normal - check console logs for OTPs
2. **Google button not redirecting**: Ensure VITE_API_URL matches your backend URL
3. **CORS errors**: Ensure FRONTEND_URL is set correctly

---

## Security Notes

- Never commit `.env` file to version control
- Use strong JWT_SECRET in production
- Rotate App Passwords periodically
- Restrict OAuth authorized domains in production
- Use HTTPS in production

---

## Quick Reference

| Variable | Where to Get |
|----------|--------------|
| GOOGLE_CLIENT_ID | Google Cloud Console > Credentials > OAuth Client |
| GOOGLE_CLIENT_SECRET | Google Cloud Console > Credentials > OAuth Client |
| SMTP_USERNAME | Your email address |
| SMTP_PASSWORD | Gmail App Password (16 chars) |