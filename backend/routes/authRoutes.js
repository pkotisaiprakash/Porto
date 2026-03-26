const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, forgotPassword, resetPassword, purchasePremium, updateProfile, googleAuth, googleCallback } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.post('/purchase-premium', protect, purchasePremium);
router.put('/update-profile', protect, updateProfile);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

module.exports = router;
