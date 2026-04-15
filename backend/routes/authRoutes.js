const express = require('express');
const router = express.Router();
const passport = require('passport');
const { 
  register, 
  login, 
  getMe, 
  logout, 
  forgotPassword, 
  resetPassword, 
  purchasePremium, 
  updateProfile, 
  googleAuth, 
  googleCallback,
  sendOTP,
  verifyOTP,
  sendRegisterOTP,
  verifyRegisterOTP,
  getAllUsers,
  updateUser,
  deleteUser
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/register/send-otp', sendRegisterOTP);
router.post('/register/verify', verifyRegisterOTP);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.post('/purchase-premium', protect, purchasePremium);
router.put('/update-profile', protect, updateProfile);

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

router.get('/google', googleAuth);
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }), googleCallback);

router.get('/users', protect, admin, getAllUsers);
router.put('/users/:userId', protect, admin, updateUser);
router.delete('/users/:userId', protect, admin, deleteUser);

module.exports = router;