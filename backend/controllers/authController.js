const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const MailHistory = require('../models/MailHistory');
const config = require('../config/db');
const { sendOTPEmail, sendPasswordResetEmail, sendBulkMail } = require('../utils/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

const pendingRegistrations = new Map();

exports.sendRegisterOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    const otpExpire = Date.now() + 10 * 60 * 1000;

    pendingRegistrations.set(email, {
      otp: otpHash,
      otpExpire,
      email,
      createdAt: Date.now()
    });

    await sendOTPEmail(email, otp);

    res.json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    console.error('Send register OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.verifyRegisterOTP = async (req, res) => {
  try {
    const { email, otp, name, username, password } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const pending = pendingRegistrations.get(email);
    if (!pending) {
      return res.status(400).json({
        success: false,
        message: 'No OTP request found. Please request OTP first'
      });
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    if (pending.otp !== otpHash || pending.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      pendingRegistrations.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const generatedUsername = username || (name || email).replace(/\s+/g, '').toLowerCase();

    const user = await User.create({
      name: name || email.split('@')[0],
      email,
      username: generatedUsername,
      password,
      role: email === 'admin@portfolio.com' ? 'admin' : 'user',
      isEmailVerified: true
    });

    pendingRegistrations.delete(email);

    const token = generateToken(user._id);
    console.log('verifyRegisterOTP - User created:', user.email, 'Token generated:', token ? 'yes' : 'no');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isPremium: user.isPremium,
        premiumExpiryDate: user.premiumExpiryDate,
        memberSince: user.memberSince
      }
    });
  } catch (error) {
    console.error('Verify register OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, username, avatar } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
      user.username = username;
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        isPremium: user.isPremium,
        premiumExpiryDate: user.premiumExpiryDate,
        memberSince: user.memberSince
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    const generatedUsername = username || name.replace(/\s+/g, '').toLowerCase();

    const existingUser = await User.findOne({
      $or: [{ email }, { username: generatedUsername }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    const user = await User.create({
      name,
      email,
      username: generatedUsername,
      password,
      role: email === 'admin@portfolio.com' ? 'admin' : 'user',
      isEmailVerified: false
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isPremium: user.isPremium,
        premiumExpiryDate: user.premiumExpiryDate,
        memberSince: user.memberSince
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    const otp = user.generateOTP();
    await user.save();

    await sendOTPEmail(email, otp);

    res.json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    const otpHash = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');

    const user = await User.findOne({
      email,
      otp: otpHash,
      otpExpire: { $gt: Date.now() }
    }).select('+otp +otpExpire');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

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
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isPremium: user.isPremium,
        premiumExpiryDate: user.premiumExpiryDate,
        memberSince: user.memberSince
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    console.log('getMe - req.user:', req.user);
    const user = await User.findById(req.user.id);

    const portfolio = await Portfolio.findOne({ userId: req.user.id });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isPremium: user.isPremium,
        premiumExpiryDate: user.premiumExpiryDate,
        memberSince: user.memberSince
      },
      portfolio: portfolio ? {
        id: portfolio._id,
        isPublished: portfolio.isPublished,
        hasTemplate: !!portfolio.templateId
      } : null
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    
    await sendPasswordResetEmail(email, resetUrl);

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

exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

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

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.purchasePremium = async (req, res) => {
  try {
    const { paymentId, plan } = req.body;
    
    const monthlyPrice = 9;
    const yearlyPrice = 99;
    
    let amount;
    let durationDays;
    
    if (plan === 'yearly') {
      amount = yearlyPrice;
      durationDays = 365;
    } else {
      amount = monthlyPrice;
      durationDays = 30;
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const now = new Date();
    if (user.isPremium && user.premiumExpiryDate && user.premiumExpiryDate > now) {
      user.premiumExpiryDate = new Date(user.premiumExpiryDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    } else {
      user.isPremium = true;
      user.premiumExpiryDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    }

    await user.save();

    res.json({
      success: true,
      message: plan === 'yearly' ? 'Premium activated for 1 year!' : 'Premium activated for 1 month!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        isPremium: user.isPremium,
        premiumExpiryDate: user.premiumExpiryDate,
        memberSince: user.memberSince
      }
    });
  } catch (error) {
    console.error('Purchase premium error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.googleAuth = (req, res, next) => {
  console.log('Google Auth: Initiating OAuth flow');
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Google OAuth not configured: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing');
    return res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file.'
    });
  }

  const passport = require('passport');
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

exports.googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }
    
    const token = generateToken(req.user._id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isPremium: user.isPremium,
        memberSince: user.memberSince
      }))
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, username, role, isPremium } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email;
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already in use'
        });
      }
      user.username = username;
    }

    if (name) user.name = name;
    if (role && req.user.role === 'admin') user.role = role;
    if (typeof isPremium === 'boolean') user.isPremium = isPremium;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isPremium: user.isPremium,
        memberSince: user.memberSince
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await Portfolio.deleteMany({ userId });
    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.sendBulkMail = async (req, res) => {
  try {
    const { recipientIds, subject, body, footer, style, templateId, externalEmails } = req.body;

    if (!subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Subject and body are required'
      });
    }

    let users = [];
    const hasInternalUsers = Array.isArray(recipientIds) && recipientIds.length > 0;
    const hasExternalEmails = Array.isArray(externalEmails) && externalEmails.length > 0;
    
    if (hasInternalUsers) {
      users = await User.find({ _id: { $in: recipientIds } });
    } else if (!hasExternalEmails && recipientIds === null) {
      users = await User.find({ role: { $ne: 'admin' } });
    } else {
      users = [];
    }

    let allRecipients = users.map(u => ({ email: u.email, name: u.name }));

    if (externalEmails && externalEmails.length > 0) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      const validExternalEmails = externalEmails.filter(e => emailRegex.test(e.trim()));
      validExternalEmails.forEach(email => {
        if (!allRecipients.find(r => r.email.toLowerCase() === email.toLowerCase())) {
          allRecipients.push({ email: email.trim(), name: '' });
        }
      });
    }

    if (allRecipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recipients found'
      });
    }

    const recipientEmails = allRecipients.map(r => r.email);
    const result = await sendBulkMail(recipientEmails, subject, body, footer, style);

    const failedCount = result.results ? result.results.filter(r => r.status === 'failed').length : 0;
    const overallStatus = failedCount > 0 ? 'failed' : 'sent';
    const failedEmails = result.results ? result.results.filter(r => r.status === 'failed').map(r => r.email) : [];

    await MailHistory.create({
      subject,
      body,
      footer,
      style: style || {},
      templateId: templateId || null,
      recipientCount: allRecipients.length,
      recipients: allRecipients,
      sentBy: req.user.id,
      status: overallStatus,
      failedRecipients: failedEmails
    });

    if (failedCount > 0) {
      return res.json({
        success: true,
        message: `Mail sent. ${failedCount} recipient(s) failed: ${failedEmails.join(', ')}`,
        recipientCount: allRecipients.length,
        failedCount,
        failedEmails
      });
    }

    res.json({
      success: true,
      message: `Mail sent to ${allRecipients.length} recipients`,
      recipientCount: allRecipients.length
    });
  } catch (error) {
    console.error('Send bulk mail error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getMailHistory = async (req, res) => {
  try {
    const { search, status, sort, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    if (sort === 'subject') sortOption = { subject: 1 };
    if (sort === 'recipients') sortOption = { recipientCount: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const mails = await MailHistory.find(query)
      .populate('sentBy', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MailHistory.countDocuments(query);

    res.json({
      success: true,
      mails: mails.map(m => ({
        id: m._id,
        subject: m.subject,
        body: m.body,
        footer: m.footer,
        style: m.style,
        templateId: m.templateId,
        recipientCount: m.recipientCount,
        recipients: m.recipients,
        sentBy: m.sentBy ? { name: m.sentBy.name, email: m.sentBy.email } : null,
        status: m.status,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get mail history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};