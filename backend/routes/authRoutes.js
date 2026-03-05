const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, forgotPassword, resetPassword, purchasePremium, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.post('/purchase-premium', protect, purchasePremium);
router.put('/update-profile', protect, updateProfile);

module.exports = router;
