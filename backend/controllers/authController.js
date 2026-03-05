const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const config = require('../config/db');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpire
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, username, avatar } = req.body;

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if username is being changed and if it's already taken
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

    // Update fields
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

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    // Generate username from name by trimming all spaces
    const generatedUsername = username || name.replace(/\s+/g, '').toLowerCase();

    // Check if user exists
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

    // Create user
    const user = await User.create({
      name,
      email,
      username: generatedUsername,
      password,
      role: email === 'admin@portfolio.com' ? 'admin' : 'user'
    });

    // Generate token
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
        isPremium: user.isPremium,
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

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

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
        isPremium: user.isPremium,
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

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Get user's portfolio
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

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
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

    // Get Reset Password Token
    const resetToken = user.getResetPasswordToken();

    await user.save();

    // In production, you would send an email with the reset link
    // For now, we'll log the reset token (in development)
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    
    console.log(`Password reset requested for email: ${email}`);
    console.log(`Reset URL: ${resetUrl}`);

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

// @desc    Reset password
// @route   POST /api/auth/reset-password/:resetToken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
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

    // Set new password
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

// @desc    Purchase premium access
// @route   POST /api/auth/purchase-premium
// @access  Private
exports.purchasePremium = async (req, res) => {
  try {
    const { paymentId, plan } = req.body; // plan can be 'monthly' or 'yearly'
    
    // Validate payment amount
    const monthlyPrice = 9;
    const yearlyPrice = 99;
    
    let amount;
    let durationDays;
    
    if (plan === 'yearly') {
      amount = yearlyPrice;
      durationDays = 365; // 1 year
    } else {
      amount = monthlyPrice;
      durationDays = 30; // 1 month default
    }

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user to premium (extend by selected duration if already premium)
    const now = new Date();
    if (user.isPremium && user.premiumExpiryDate && user.premiumExpiryDate > now) {
      // Extend existing premium
      user.premiumExpiryDate = new Date(user.premiumExpiryDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    } else {
      // Activate new premium
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

