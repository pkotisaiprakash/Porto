const Template = require('../models/Template');

// @desc    Get all templates
// @route   GET /api/templates
// @access  Public
exports.getTemplates = async (req, res) => {
  try {
    const templates = await Template.find({ isActive: true })
      .select('-layoutConfig')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: templates.length,
      templates
    });
  } catch (error) {
    console.error('GetTemplates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all templates for admin
// @route   GET /api/templates/admin
// @access  Private/Admin
exports.getAdminTemplates = async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: templates.length,
      templates
    });
  } catch (error) {
    console.error('GetAdminTemplates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single template
// @route   GET /api/templates/:id
// @access  Public
exports.getTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('GetTemplate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create template
// @route   POST /api/templates
// @access  Private/Admin
exports.createTemplate = async (req, res) => {
  try {
    const template = await Template.create(req.body);

    res.status(201).json({
      success: true,
      template
    });
  } catch (error) {
    console.error('CreateTemplate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update template
// @route   PUT /api/templates/:id
// @access  Private/Admin
exports.updateTemplate = async (req, res) => {
  try {
    let template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    template = await Template.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('UpdateTemplate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete template
// @route   DELETE /api/templates/:id
// @access  Private/Admin
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    await template.deleteOne();

    res.json({
      success: true,
      message: 'Template deleted'
    });
  } catch (error) {
    console.error('DeleteTemplate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Toggle template active status
// @route   PUT /api/templates/:id/toggle
// @access  Private/Admin
exports.toggleTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    template.isActive = !template.isActive;
    await template.save();

    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('ToggleTemplate error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
