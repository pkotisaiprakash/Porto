const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  description: { type: String }
}, { _id: true });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  link: { type: String },
  image: { type: String },
  technologies: [String],
  startDate: { type: String },
  endDate: { type: String }
}, { _id: true });

const certificateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  date: { type: String },
  link: { type: String }
}, { _id: true });

const experienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  description: { type: String },
  isCurrent: { type: Boolean, default: false }
}, { _id: true });

const socialLinksSchema = new mongoose.Schema({
  github: { type: String },
  linkedin: { type: String },
  twitter: { type: String },
  instagram: { type: String },
  website: { type: String },
  youtube: { type: String }
}, { _id: false });

const themeSettingsSchema = new mongoose.Schema({
  primaryColor: { type: String, default: '#3B82F6' },
  secondaryColor: { type: String, default: '#1E40AF' },
  backgroundColor: { type: String, default: '#FFFFFF' },
  textColor: { type: String, default: '#1F2937' },
  fontFamily: { type: String, default: 'Inter' }
}, { _id: false });

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  location: {
    type: String
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  skills: [{
    type: String,
    trim: true
  }],
  education: [educationSchema],
  experience: [experienceSchema],
  projects: [projectSchema],
  certificates: [certificateSchema],
  socialLinks: {
    type: socialLinksSchema,
    default: {}
  },
  themeSettings: {
    type: themeSettingsSchema,
    default: () => ({})
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  resume: {
    type: String,
    default: ''
  },
  resumeOriginalName: {
    type: String,
    default: ''
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

portfolioSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  next();
});

// Index for public portfolio lookup
portfolioSchema.index({ isPublished: 1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);
