# Mail Integration Documentation

## Overview

This document provides a comprehensive explanation of the mail integration system for:
1. **Password Reset** - Sending reset links via email
2. **Registration OTP Verification** - Verifying user email during registration

---

## Table of Contents

1. [Current Implementation](#current-implementation)
2. [Architecture Overview](#architecture-overview)
3. [Password Reset Flow](#password-reset-flow)
4. [Registration OTP Verification Flow](#registration-otp-verification-flow)
5. [Email Service Setup](#email-service-setup)
6. [Implementation Guide](#implementation-guide)
7. [Security Considerations](#security-considerations)
8. [Testing Guide](#testing-guide)

---

## Current Implementation

### Password Reset (Existing)

The current system already has a partial password reset implementation:

| Component | Details |
|-----------|---------|
| **Token Generation** | 20-byte random hex string using `crypto.randomBytes(20)` |
| **Token Hashing** | SHA-256 hash stored in database |
| **Token Expiry** | 10 minutes |
| **Token Storage** | `resetPasswordToken` and `resetPasswordExpire` fields in User model |
| **Frontend** | [`ForgotPassword.jsx`](frontend/src/pages/ForgotPassword.jsx) and [`ResetPassword.jsx`](frontend/src/pages/ResetPassword.jsx) |
| **Backend** | [`authController.js`](backend/controllers/authController.js) functions: `forgotPassword` and `resetPassword` |

### Registration (Current - No OTP)

Currently, users are registered directly without email verification:

```javascript
// Current registration flow in authController.js (line 75-128)
exports.register = async (req, res) => {
  // Creates user immediately without OTP verification
  const user = await User.create({
    name,
    email,
    username: generatedUsername,
    password,
    role: email === 'admin@portfolio.com' ? 'admin' : 'user'
  });
  // Returns token immediately
};
```

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MAIL SYSTEM ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐     ┌──────────────┐     ┌─────────────────────────┐  │
│  │   Frontend  │────▶│   Backend    │────▶│      Email Service     │  │
│  │   (React)   │◀────│   (Node.js)  │◀────│    (Nodemailer)        │  │
│  └─────────────┘     └──────────────┘     └─────────────────────────┘  │
│         │                   │                        │                  │
│         │                   │                        │                  │
│  ┌─────────────┐     ┌──────────────┐     ┌─────────────────────────┐  │
│  │  - Login    │     │  - Express  │     │  - Gmail/SMTP          │  │
│  │  - Register │     │  - MongoDB  │     │  - SendGrid             │  │
│  │  - Forgot   │     │  - JWT      │     │  - Mailgun              │  │
│  │    Password │     │  - Crypto   │     │  - AWS SES              │  │
│  └─────────────┘     └──────────────┘     └─────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Database Schema Updates Required

```javascript
// User Model additions for OTP verification
{
  // Existing fields for password reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  // New fields for OTP verification
  otp: String,              // Hashed OTP code
  otpExpire: Date,          // OTP expiration time
  isEmailVerified: Boolean, // Email verification status
  verificationToken: String // Email verification token
}
```

---

## Password Reset Flow

### Complete Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       PASSWORD RESET FLOW                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. USER REQUESTS RESET                                                  │
│  ┌──────────┐     ┌─────────────┐     ┌──────────────┐                   │
│  │  User    │────▶│  Forgot     │────▶│  Find User  │                   │
│  │ enters  │     │  Password   │     │  by Email   │                   │
│  │  email  │     │  Page       │     │              │                   │
│  └──────────┘     └─────────────┘     └──────────────┘                   │
│                                              │                           │
│                                              ▼                           │
│  2. TOKEN GENERATION                ┌──────────────┐                   │
│  ┌─────────────┐                     │  User Found │                   │
│  │ Generate   │─────────────────────▶│  ?          │                   │
│  │ 20-byte    │                     └──────────────┘                   │
│  │ random     │                           │                             │
│  │ token      │                     Yes   │   No                        │
│  └─────────────┘                     ┌────┴────┐                        │
│                                      ▼         ▼                        │
│  3. TOKEN STORAGE              ┌──────────┐ ┌─────────────┐            │
│  ┌─────────────┐               │ Hash     │ │ Return     │            │
│  │ SHA-256    │───────────────▶│ Token &  │ │ Success    │            │
│  │ hash token  │               │ Store in │ │ (Generic   │            │
│  │             │               │ DB +     │ │ Message)   │            │
│  │ Set 10min  │               │ Expire   │ └─────────────┘            │
│  │ expiry     │               └──────────┘                             │
│  └─────────────┘                     │                                 │
│                                       ▼                                 │
│  4. SEND EMAIL               ┌──────────────────┐                      │
│  ┌─────────────┐             │ Send Reset Link  │                      │
│  │ Create      │─────────────▶│ via Email        │                      │
│  │ email with │             │ Service          │                      │
│  │ reset URL  │             └──────────────────┘                      │
│  └─────────────┘                           │                            │
│                                              │                            │
│  5. USER CLICKS LINK              ┌──────────┴─────┐                   │
│  ┌──────────┐                     │  Password      │                   │
│  │ User     │─────────────────────▶│  Reset Page    │                   │
│  │ clicks   │                     └────────────────┘                   │
│  │ link     │                           │                              │
│  │ from     │                           ▼                              │
│  │ email    │              ┌────────────────────────┐                  │
│  └──────────┘              │ Validate Token:        │                  │
│                            │ 1. Hash input token   │                  │
│                            │ 2. Find user by hash   │                  │
│                            │ 3. Check expiry       │                  │
│                            └────────────────────────┘                  │
│                                              │                         │
│                            ┌─────────────────┴────────────┐             │
│                            ▼                              ▼             │
│                     ┌────────────┐               ┌─────────────┐      │
│                     │ Valid      │               │ Invalid/    │      │
│                     │ Token      │               │ Expired     │      │
│                     └─────┬──────┘               └─────────────┘      │
│                           │                                              │
│                           ▼                                              │
│  6. RESET PASSWORD                                        │             │
│  ┌─────────────┐                                           │             │
│  │ Update      │───────────────────────────────────────────┘             │
│  │ password    │                                                       │
│  │ (bcrypt)    │                                                       │
│  │ Clear token │                                                       │
│  │ fields      │                                                       │
│  └─────────────┘                                                       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Backend Implementation Details

#### Step 1: User Requests Password Reset

```javascript
// backend/controllers/authController.js - forgotPassword function

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  // 1. Find user by email
  const user = await User.findOne({ email });

  // 2. Return generic message (security: don't reveal if email exists)
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // 3. Generate reset token
  const resetToken = user.getResetPasswordToken(); // Defined in User model

  // 4. Save user with hashed token and expiry
  await user.save();

  // 5. Create reset URL
  const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

  // 6. TODO: Send email (currently just logs)
  console.log(`Password reset requested for email: ${email}`);
  console.log(`Reset URL: ${resetUrl}`);
  
  // In production, call email service here:
  // await sendPasswordResetEmail(email, resetUrl);
};
```

#### Step 2: Token Generation in User Model

```javascript
// backend/models/User.js - getResetPasswordToken method

userSchema.methods.getResetPasswordToken = function() {
  // 1. Generate 20-byte random token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // 2. Hash token with SHA-256 for storage
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // 3. Set expiry to 10 minutes
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  // Return plain token (sent to user's email)
  return resetToken;
};
```

#### Step 3: Reset Password Endpoint

```javascript
// backend/controllers/authController.js - resetPassword function

exports.resetPassword = async (req, res) => {
  // 1. Hash the token from URL
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  // 2. Find user with matching token and valid expiry
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  // 3. Set new password (will be hashed by pre-save middleware)
  user.password = req.body.password;
  
  // 4. Clear token fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  // 5. Save user
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password has been reset successfully'
  });
};
```

---

## Registration OTP Verification Flow

### Complete Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                  REGISTRATION OTP VERIFICATION FLOW                       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. USER FILLS REGISTRATION FORM                                        │
│  ┌─────────────┐     ┌─────────────┐     ┌──────────────┐              │
│  │ Name        │     │ Validate    │     │ Check if     │              │
│  │ Email       │────▶│ Input       │────▶│ Email/        │              │
│  │ Password    │     │             │     │ Username     │              │
│  └─────────────┘     └─────────────┘     │ Exists       │              │
│                                           └──────────────┘              │
│                                                  │                       │
│                                                  ▼                       │
│  2. CREATE UNVERIFIED USER              ┌──────────────┐               │
│  ┌─────────────┐                         │ Email Exists │               │
│  │ Create user │─────────────────────────▶│ ?            │               │
│  │ with        │                         └──────────────┘              │
│  │ isEmailVer- │                              │                           │
│  │ ified=false│                        Yes   │   No                      │
│  │             │                        ┌─────┴──────┐                 │
│  │ Generate    │                        ▼            ▼                  │
│  │ 6-digit OTP │                   ┌──────────┐ ┌───────────┐           │
│  │             │                   │ Return   │ │ Continue  │           │
│  └─────────────┘                   │ Error    │ │ Flow      │           │
│                                     └──────────┘ └───────────┘           │
│                                           │                                │
│                                           ▼                                │
│  3. STORE OTP                    ┌─────────────────┐                     │
│  ┌─────────────┐                 │ Hash OTP with   │                     │
│  │ Generate    │────────────────▶│ SHA-256         │                     │
│  │ 6-digit     │                 │ Store in DB     │                     │
│  │ numeric OTP │                 │ Set 5-min       │                     │
│  └─────────────┘                 │ expiry          │                     │
│                                   └─────────────────┘                     │
│                                           │                               │
│                                           ▼                               │
│  4. SEND OTP EMAIL               ┌──────────────────┐                    │
│  ┌─────────────┐                 │ Compose Email    │                    │
│  │ Call email  │────────────────▶│ with OTP         │                    │
│  │ service     │                 │ Send via SMTP    │                    │
│  └─────────────┘                 └──────────────────┘                    │
│                                           │                              │
│                                           ▼                              │
│  5. RETURN TO FRONTEND            ┌──────────────────┐                  │
│  ┌─────────────┐                 │ Return success   │                  │
│  │ Send        │◀────────────────│ message + temp   │                  │
│  │ response    │                 │ token            │                  │
│  │ to frontend │                 └──────────────────┘                  │
│  └─────────────┘                           │                            │
│                                                │                         │
│  6. USER ENTERS OTP                  ┌─────────┴─────────┐              │
│  ┌──────────┐                          │  Verify OTP Page │              │
│  │ User     │─────────────────────────▶│                  │              │
│  │ enters   │                          └──────────────────┘              │
│  │ 6-digit  │                                   │                          │
│  │ OTP      │                                   ▼                         │
│  └──────────┘                    ┌────────────────────────┐              │
│                                   │ Validate OTP:         │              │
│                                   │ 1. Hash input OTP     │              │
│                                   │ 2. Compare with DB    │              │
│                                   │ 3. Check expiry       │              │
│                                   └────────────────────────┘              │
│                                         │                                 │
│                         ┌───────────────┴───────────────┐                │
│                         ▼                               ▼                 │
│                  ┌────────────┐                  ┌────────────┐           │
│                  │ Valid OTP  │                  │ Invalid    │           │
│                  └─────┬──────┘                  └────────────┘           │
│                        │                                                 │
│                        ▼                                                 │
│  7. COMPLETE REGISTRATION                                                 │
│  ┌─────────────┐                                                        │
│  │ Set         │                                                        │
│  │ isEmailVer- │                                                        │
│  │ ified=true  │                                                        │
│  │ Clear OTP  │                                                        │
│  │ Generate   │                                                        │
│  │ JWT token  │                                                        │
│  │ Return     │                                                        │
│  │ auth       │                                                        │
│  │ response  │                                                        │
│  └─────────────┘                                                        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### API Endpoints Required

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Initial registration, sends OTP | Public |
| POST | `/api/auth/verify-otp` | Verify OTP and complete registration | Public |
| POST | `/api/auth/resend-otp` | Resend OTP to same email | Public |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| POST | `/api/auth/reset-password/:token` | Reset password with token | Public |

---

## Email Service Setup

### Option 1: Using Nodemailer with Gmail

```bash
# Install nodemailer
npm install nodemailer
```

```javascript
// backend/utils/emailService.js

const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // App password, not regular password
    }
  });
};

// Send email helper
const sendEmail = async (to, subject, html) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Porto" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
```

### Option 2: Using SendGrid

```bash
# Install sendgrid
npm install @sendgrid/mail
```

```javascript
// backend/utils/emailService.js

const sgMail = require('@sendgrid/mail');

// Set API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM,
      subject,
      html
    };

    await sgMail.send(msg);
    console.log('Email sent successfully');
    return { success: true };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
```

### Environment Variables Required

```env
# .env file

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com

# Or for SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
```

---

## Implementation Guide

### Step 1: Update User Model

```javascript
// backend/models/User.js

const userSchema = new mongoose.Schema({
  // ... existing fields
  
  // Password reset fields (already exist)
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  },
  
  // OTP verification fields (new)
  otp: {
    type: String,
    select: false
  },
  otpExpire: {
    type: Date,
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate OTP method
userSchema.methods.generateOTP = function() {
  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash OTP for storage
  this.otp = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');
  
  // Set expiry to 5 minutes
  this.otpExpire = Date.now() + 5 * 60 * 1000;
  
  return otp; // Return plain OTP to send via email
};

// Verify OTP method
userSchema.methods.verifyOTP = function(enteredOTP) {
  // Hash entered OTP
  const hashedOTP = crypto
    .createHash('sha256')
    .update(enteredOTP)
    .digest('hex');
  
  // Check if OTP matches and not expired
  return this.otp === hashedOTP && this.otpExpire > Date.now();
};

// Clear OTP method
userSchema.methods.clearOTP = function() {
  this.otp = undefined;
  this.otpExpire = undefined;
};

module.exports = mongoose.model('User', userSchema);
```

### Step 2: Create Email Templates

```javascript
// backend/utils/emailTemplates.js

const getPasswordResetEmail = (resetUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: linear-gradient(to right, #06b6d4, #8b5cf6);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          margin: 20px 0;
        }
        .footer { font-size: 12px; color: #666; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <a href="${resetUrl}" class="button">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Porto. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const getOTPEmail = (otp, name) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .otp-code {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          color: #8b5cf6;
          text-align: center;
          padding: 20px;
          background: #f3f4f6;
          border-radius: 8px;
          margin: 20px 0;
        }
        .footer { font-size: 12px; color: #666; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Verify Your Email</h2>
        <p>Hi ${name},</p>
        <p>Your verification code is:</p>
        <div class="otp-code">${otp}</div>
        <p>This code will expire in 5 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Porto. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getPasswordResetEmail,
  getOTPEmail
};
```

### Step 3: Update Auth Controller

```javascript
// backend/controllers/authController.js additions

const { sendEmail } = require('../utils/emailService');
const { getPasswordResetEmail, getOTPEmail } = require('../utils/emailTemplates');

// @desc    Register user (Step 1 - Send OTP)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Create unverified user
    const user = await User.create({
      name,
      email,
      username: username || name.replace(/\s+/g, '').toLowerCase(),
      password,
      isEmailVerified: false
    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    await sendEmail(
      email,
      'Verify Your Email - Porto',
      getOTPEmail(otp, name)
    );

    // Return success (don't send token yet)
    res.status(201).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      requiresVerification: true
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Verify OTP and complete registration
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user with OTP
    const user = await User.findOne({ email }).select('+otp +otpExpire');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request'
      });
    }

    // Verify OTP
    if (!user.verifyOTP(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.clearOTP();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    await sendEmail(
      email,
      'Verify Your Email - Porto',
      getOTPEmail(otp, user.name)
    );

    res.json({
      success: true,
      message: 'OTP resent to your email'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Forgot password (Updated with email sending)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always return success (don't reveal if email exists)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    await sendEmail(
      email,
      'Password Reset - Porto',
      getPasswordResetEmail(resetUrl)
    );

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
```

### Step 4: Add Routes

```javascript
// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  logout, 
  forgotPassword, 
  resetPassword, 
  purchasePremium, 
  updateProfile,
  verifyOTP,
  resendOTP
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.post('/purchase-premium', protect, purchasePremium);
router.put('/update-profile', protect, updateProfile);

module.exports = router;
```

### Step 5: Update Frontend

#### Register Page Updates

```jsx
// frontend/src/pages/Register.jsx (modified)

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useDocumentTitle('Register');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      // Step 1: Register and get OTP
      const response = await authAPI.register({
        name: formData.name,
        email: formData.email,
        username: formData.name.replace(/\s+/g, '').toLowerCase(),
        password: formData.password
      });

      if (response.data.success) {
        setStep(2); // Move to OTP verification
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.verifyOTP({
        email: formData.email,
        otp: otp
      });

      if (response.data.success) {
        // Store token and redirect
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      await authAPI.resendOTP({ email: formData.email });
      alert('OTP resent successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {step === 1 ? (
        // Registration Form
        <form onSubmit={handleSubmit}>
          {/* ... form fields ... */}
        </form>
      ) : (
        // OTP Verification
        <div className="otp-verification">
          <h2>Verify Your Email</h2>
          <p>Enter the 6-digit code sent to {formData.email}</p>
          
          <form onSubmit={handleVerifyOTP}>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
          
          <button onClick={handleResendOTP} disabled={loading}>
            Resend OTP
          </button>
          
          <Link to="/register">Change email</Link>
        </div>
      )}
    </div>
  );
};

export default Register;
```

#### API Service Updates

```javascript
// frontend/src/services/api.js additions

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (email) => api.post('/auth/resend-otp', email),
  login: (data) => api.post('/auth/login', data),
  // ... other methods
};
```

---

## Security Considerations

### 1. Token Security

| Security Measure | Implementation |
|-----------------|----------------|
| **Hash tokens** | Use SHA-256 to hash tokens before storing in database |
| **Short expiry** | OTP: 5 minutes, Reset: 10 minutes |
| **One-time use** | Clear tokens after successful use |
| **Secure generation** | Use `crypto.randomBytes()` for token generation |

### 2. Email Security

| Security Measure | Implementation |
|-----------------|----------------|
| **HTTPS** | Use HTTPS in production |
| **Environment variables** | Store credentials in `.env` |
| **Generic messages** | Don't reveal if email exists |
| **Rate limiting** | Limit OTP resend attempts |

### 3. Rate Limiting Implementation

```javascript
// backend/middleware/rateLimiter.js

const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests' }
});

// OTP rate limiter
const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit to 3 OTP requests per windowMs
  message: { success: false, message: 'Too many OTP requests. Try again later.' }
});

// Apply to routes
router.post('/register', otpLimiter, register);
router.post('/verify-otp', otpLimiter, verifyOTP);
router.post('/resend-otp', otpLimiter, resendOTP);
router.post('/forgot-password', otpLimiter, forgotPassword);
```

---

## Testing Guide

### Testing Password Reset

1. **Request Reset**
   ```bash
   curl -X POST http://localhost:5000/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

2. **Check Console**
   ```
   Password reset requested for email: test@example.com
   Reset URL: http://localhost:5173/reset-password/<token>
   ```

3. **Reset Password**
   ```bash
   curl -X POST http://localhost:5000/api/auth/reset-password/<token> \
     -H "Content-Type: application/json" \
     -d '{"password": "newpassword123"}'
   ```

### Testing OTP Verification

1. **Register (Get OTP)**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name": "Test User", "email": "test@example.com", "password": "password123"}'
   ```

2. **Verify OTP**
   ```bash
   curl -X POST http://localhost:5000/api/auth/verify-otp \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "otp": "123456"}'
   ```

3. **Resend OTP**
   ```bash
   curl -X POST http://localhost:5000/api/auth/resend-otp \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com"}'
   ```

---

## Production Checklist

Before deploying to production, ensure:

- [ ] Email service configured (Gmail App Password or SendGrid)
- [ ] Environment variables set in production
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Generic error messages (don't reveal user existence)
- [ ] Token expiry times appropriate for use case
- [ ] Frontend URL configured in backend environment
- [ ] Email templates customized with production domain

---

## Summary

This document covers the complete mail integration system:

1. **Password Reset**: Uses cryptographically secure tokens with 10-minute expiry
2. **OTP Verification**: Uses 6-digit numeric codes with 5-minute expiry
3. **Email Service**: Nodemailer or SendGrid for sending emails
4. **Security**: Token hashing, rate limiting, generic messages

The current codebase has the foundation for password reset but needs email sending implementation. The registration flow currently doesn't have OTP verification and needs to be added following this guide.
