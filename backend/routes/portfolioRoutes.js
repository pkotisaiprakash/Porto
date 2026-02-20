const express = require('express');
const router = express.Router();
const {
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  publishPortfolio,
  unpublishPortfolio,
  getPublicPortfolio,
  getAdminStats,
  uploadResume,
  deleteResume
} = require('../controllers/portfolioController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Protected routes (must come before /:username to avoid conflicts)
router.get('/', protect, getPortfolio);
router.post('/', protect, createPortfolio);
router.put('/', protect, updatePortfolio);
router.delete('/', protect, deletePortfolio);
router.put('/publish', protect, publishPortfolio);
router.put('/unpublish', protect, unpublishPortfolio);

// Resume upload with parsing
router.post('/resume', protect, upload.single('resume'), uploadResume);

// Delete resume
router.delete('/resume', protect, deleteResume);

// Admin routes
router.get('/admin/stats', protect, admin, getAdminStats);

// Public route (must be last)
router.get('/:username', getPublicPortfolio);

module.exports = router;
