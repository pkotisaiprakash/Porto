const express = require('express');
const router = express.Router();
const {
  getTemplates,
  getAdminTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplate
} = require('../controllers/templateController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getTemplates);
router.get('/:id', getTemplate);

// Admin routes
router.get('/admin/all', protect, admin, getAdminTemplates);
router.post('/', protect, admin, createTemplate);
router.put('/:id', protect, admin, updateTemplate);
router.delete('/:id', protect, admin, deleteTemplate);
router.put('/:id/toggle', protect, admin, toggleTemplate);

module.exports = router;
