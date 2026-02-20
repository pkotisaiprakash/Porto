const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const Template = require('../models/Template');
const path = require('path');
const fs = require('fs');

// @desc    Get user portfolio
// @route   GET /api/portfolio
// @access  Private
exports.getPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user.id })
      .populate('templateId', 'name previewImage category');

    if (!portfolio) {
      return res.json({
        success: true,
        portfolio: null
      });
    }

    res.json({
      success: true,
      portfolio
    });
  } catch (error) {
    console.error('GetPortfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create portfolio
// @route   POST /api/portfolio
// @access  Private
exports.createPortfolio = async (req, res) => {
  try {
    // Check if portfolio already exists
    const existingPortfolio = await Portfolio.findOne({ userId: req.user.id });

    if (existingPortfolio) {
      return res.status(400).json({
        success: false,
        message: 'Portfolio already exists. Use update instead.'
      });
    }

    const portfolio = await Portfolio.create({
      ...req.body,
      userId: req.user.id
    });

    // Populate templateId if present
    let populatedPortfolio = await Portfolio.findById(portfolio._id).populate('templateId', 'name previewImage category');

    res.status(201).json({
      success: true,
      portfolio: populatedPortfolio
    });
  } catch (error) {
    console.error('CreatePortfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update portfolio
// @route   PUT /api/portfolio
// @access  Private
exports.updatePortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user.id });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    portfolio = await Portfolio.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('templateId', 'name previewImage category');

    res.json({
      success: true,
      portfolio
    });
  } catch (error) {
    console.error('UpdatePortfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete portfolio
// @route   DELETE /api/portfolio
// @access  Private
exports.deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOneAndDelete({ userId: req.user.id });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    res.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
  } catch (error) {
    console.error('DeletePortfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Publish portfolio
// @route   PUT /api/portfolio/publish
// @access  Private
exports.publishPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user.id });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Validate required fields
    if (!portfolio.name || !portfolio.title || !portfolio.bio) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in required fields (name, title, bio) before publishing'
      });
    }

    portfolio.isPublished = true;
    portfolio.publishedAt = Date.now();
    await portfolio.save();

    res.json({
      success: true,
      message: 'Portfolio published successfully',
      portfolio
    });
  } catch (error) {
    console.error('PublishPortfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Unpublish portfolio
// @route   PUT /api/portfolio/unpublish
// @access  Private
exports.unpublishPortfolio = async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user.id });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    portfolio.isPublished = false;
    portfolio.publishedAt = null;
    await portfolio.save();

    res.json({
      success: true,
      message: 'Portfolio unpublished',
      portfolio
    });
  } catch (error) {
    console.error('UnpublishPortfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get public portfolio by username
// @route   GET /api/portfolio/:username
// @access  Public
exports.getPublicPortfolio = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const portfolio = await Portfolio.findOne({
      userId: user._id,
      isPublished: true
    }).populate('templateId', 'name layoutConfig category');

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found or not published'
      });
    }

    res.json({
      success: true,
      portfolio: {
        ...portfolio.toObject(),
        user: {
          name: user.name,
          username: user.username
        }
      }
    });
  } catch (error) {
    console.error('GetPublicPortfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Upload resume with parsing
// @route   POST /api/portfolio/resume
// @access  Private
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const filePath = require('path').join(__dirname, '../uploads', req.file.filename);
    let parsedData = {};

    try {
      parsedData = await require('../utils/resumeParser').parseResume(filePath, req.file.originalname);
      console.log('Parsed resume data:', JSON.stringify(parsedData, null, 2));
    } catch (parseError) {
      console.error('Resume parsing error:', parseError);
      parsedData = {}; // Continue with empty data, user can fill manually
    }

    // If parsed data is empty or invalid, that's okay - user will fill manually
    if (!parsedData || typeof parsedData !== 'object') {
      parsedData = {};
    }

    let portfolio = await Portfolio.findOne({ userId: req.user.id });

    if (!portfolio) {
      // no portfolio exists yet; create new using parsed data
      // Filter education to only include entries with valid degree (required by schema)
      const filteredEducation = (parsedData.education || []).filter(edu => 
        edu.degree && edu.degree.trim()
      );
      
      portfolio = await Portfolio.create({
        userId: req.user.id,
        name: parsedData.name || '',
        title: parsedData.title || '',
        bio: parsedData.bio || '',
        email: parsedData.email || '',
        phone: parsedData.phone || '',
        skills: parsedData.skills || [],
        education: filteredEducation,
        experience: parsedData.experience || [],
        resume: `/uploads/${req.file.filename}`,
        resumeOriginalName: req.file.originalname
      });
    } else {
      // update existing portfolio with new resume - always update with new values
      portfolio.resume = `/uploads/${req.file.filename}`;
      portfolio.resumeOriginalName = req.file.originalname;

      // Always overwrite with new parsed values (don't preserve old values)
      // Only keep old values if new parsed data is completely empty
      if (parsedData.name && parsedData.name.trim()) {
        portfolio.name = parsedData.name;
      }
      if (parsedData.title && parsedData.title.trim()) {
        portfolio.title = parsedData.title;
      }
      if (parsedData.bio && parsedData.bio.trim()) {
        portfolio.bio = parsedData.bio;
      }
      if (parsedData.email && parsedData.email.trim()) {
        portfolio.email = parsedData.email;
      }
      if (parsedData.phone && parsedData.phone.trim()) {
        portfolio.phone = parsedData.phone;
      }
      if (parsedData.skills && Array.isArray(parsedData.skills) && parsedData.skills.length > 0) {
        portfolio.skills = parsedData.skills;
      }
      if (parsedData.education && Array.isArray(parsedData.education) && parsedData.education.length > 0) {
        // Filter out education entries - only keep those with valid degree (required by schema)
        portfolio.education = parsedData.education.filter(edu => 
          edu.degree && edu.degree.trim()
        );
      }
      if (parsedData.experience && Array.isArray(parsedData.experience) && parsedData.experience.length > 0) {
        portfolio.experience = parsedData.experience;
      }

      await portfolio.save();
    }

    // determine if any meaningful info was found in parsedData
    // Consider it has info if we got skills, education, experience OR at least name/email/phone
    const hasSkills = parsedData.skills && parsedData.skills.length > 0;
    const hasEducation = parsedData.education && parsedData.education.length > 0;
    const hasExperience = parsedData.experience && parsedData.experience.length > 0;
    const hasBasicInfo = (parsedData.name && parsedData.name.trim()) || 
                         (parsedData.email && parsedData.email.trim()) || 
                         (parsedData.phone && parsedData.phone.trim()) ||
                         (parsedData.title && parsedData.title.trim());
    
    const hasInfo = hasSkills || hasEducation || hasExperience || hasBasicInfo;

    res.json({
      success: true,
      message: 'Resume uploaded and parsed successfully!',
      portfolio,
      parsedData,
      parsedDataHasInfo: !!hasInfo
    });
  } catch (error) {
    console.error('Resume upload controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get admin stats
// @route   GET /api/portfolio/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalPortfolios = await Portfolio.countDocuments();
    const publishedPortfolios = await Portfolio.countDocuments({ isPublished: true });
    const totalTemplates = await Template.countDocuments();
    const activeTemplates = await Template.countDocuments({ isActive: true });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPortfolios,
        publishedPortfolios,
        totalTemplates,
        activeTemplates
      }
    });
  } catch (error) {
    console.error('GetAdminStats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete resume from portfolio
// @route   DELETE /api/portfolio/resume
// @access  Private
exports.deleteResume = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ userId: req.user.id });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    // Delete the resume file from disk if it exists
    if (portfolio.resume) {
      const filePath = path.join(__dirname, '..', portfolio.resume);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Remove resume fields from portfolio
    portfolio.resume = undefined;
    portfolio.resumeOriginalName = undefined;

    // Optionally reset other parsed fields too (commented out - user can decide)
    // portfolio.name = '';
    // portfolio.email = '';
    // portfolio.phone = '';
    // portfolio.title = '';
    // portfolio.bio = '';
    // portfolio.skills = [];
    // portfolio.education = [];
    // portfolio.experience = [];

    await portfolio.save();

    res.json({
      success: true,
      message: 'Resume deleted successfully',
      portfolio
    });
  } catch (error) {
    console.error('DeleteResume error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
