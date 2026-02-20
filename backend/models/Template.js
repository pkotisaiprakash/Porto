const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Template description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  previewImage: {
    type: String,
    required: [true, 'Preview image is required']
  },
  thumbnail: {
    type: String,
    default: ''
  },
  layoutConfig: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['minimal', 'modern', 'creative', 'professional', 'neon', 'colorful', 'animated'],
    default: 'modern'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

templateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Template', templateSchema);
