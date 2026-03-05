const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('./config/db');
const Template = require('./models/Template');
const Portfolio = require('./models/Portfolio');
const { protect } = require('./middleware/authMiddleware');
const resumeParser = require('./utils/resumeParser');

// Route imports
const authRoutes = require('./routes/authRoutes');
const templateRoutes = require('./routes/templateRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(config.mongoURI)
  .then(() => {
    console.log('MongoDB connected successfully');
    seedTemplates();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/portfolio', portfolioRoutes);

// uploads directory is created by upload middleware when needed
const upload = require('./middleware/uploadMiddleware');

// static path for uploaded files (same directory used by uploadMiddleware)
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Portfolio Builder API is running' });
});

// Admin: Force reseed templates
app.post('/api/admin/reseed-templates', async (req, res) => {
  try {
    // Delete existing templates
    await Template.deleteMany({});
    
    // Re-seed templates
    const defaultTemplates = [
      // Free Templates (First 5)
      {
        name: 'Minimal',
        description: 'A clean, minimalist template perfect for showcasing your core skills and projects with elegant simplicity.',
        previewImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
        category: 'minimal',
        isActive: true,
        isPremium: false,
        layoutConfig: { headerStyle: 'centered', heroStyle: 'simple', projectsLayout: 'grid', font: 'Inter' }
      },
      {
        name: 'Modern',
        description: 'A contemporary template with bold typography, gradient accents, and responsive layouts.',
        previewImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
        category: 'modern',
        isActive: true,
        isPremium: false,
        layoutConfig: { headerStyle: 'sticky', heroStyle: 'full', projectsLayout: 'cards', font: 'Poppins' }
      },
      {
        name: 'Professional',
        description: 'A formal template ideal for corporate professionals, emphasizing credibility and expertise.',
        previewImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
        category: 'professional',
        isActive: true,
        isPremium: false,
        layoutConfig: { headerStyle: 'classic', heroStyle: 'boxed', projectsLayout: 'list', font: 'Roboto' }
      },
      {
        name: 'Creative',
        description: 'An expressive template designed for creative professionals with unique visual elements.',
        previewImage: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop',
        category: 'creative',
        isActive: true,
        isPremium: false,
        layoutConfig: { headerStyle: 'transparent', heroStyle: 'split', projectsLayout: 'masonry', font: 'Playfair Display' }
      },
      {
        name: 'Simple',
        description: 'A straightforward, easy-to-use template perfect for beginners starting their portfolio journey.',
        previewImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop',
        category: 'minimal',
        isActive: true,
        isPremium: false,
        layoutConfig: { headerStyle: 'simple', heroStyle: 'basic', projectsLayout: 'grid', font: 'Inter' }
      },
      // Premium Templates
      {
        name: 'Neon Pro',
        description: 'A cyberpunk-inspired premium template with glowing neon effects, perfect for developers and tech enthusiasts.',
        previewImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop',
        category: 'neon',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'floating', heroStyle: 'glow', projectsLayout: 'cards', font: 'Inter' }
      },
      {
        name: 'Elegant',
        description: 'A sophisticated premium template with refined aesthetics for luxury brands and high-end professionals.',
        previewImage: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=300&fit=crop',
        category: 'modern',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'elegant', heroStyle: 'luxury', projectsLayout: 'showcase', font: 'Playfair Display' }
      },
      {
        name: 'Gradient',
        description: 'A vibrant premium template featuring stunning gradient backgrounds and modern design elements.',
        previewImage: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&h=300&fit=crop',
        category: 'colorful',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'gradient', heroStyle: 'colorful', projectsLayout: 'cards', font: 'Poppins' }
      },
      {
        name: 'Portfolio Elite',
        description: 'An elite premium template designed for senior professionals with extensive project showcases.',
        previewImage: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop',
        category: 'professional',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'premium', heroStyle: 'showcase', projectsLayout: 'gallery', font: 'Montserrat' }
      },
      {
        name: 'Tech Innovator',
        description: 'A cutting-edge premium template for tech innovators and startup founders with dynamic sections.',
        previewImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
        category: 'neon',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'tech', heroStyle: 'innovative', projectsLayout: 'timeline', font: 'Inter' }
      },
      {
        name: 'Artisan',
        description: 'A handcrafted premium template perfect for artisans, designers, and creative entrepreneurs.',
        previewImage: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=300&fit=crop',
        category: 'creative',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'artisan', heroStyle: 'showcase', projectsLayout: 'masonry', font: 'Lora' }
      },
      {
        name: 'Executive',
        description: 'A premium executive template for C-suite professionals, directors, and senior management.',
        previewImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
        category: 'professional',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'executive', heroStyle: 'corporate', projectsLayout: 'featured', font: 'Merriweather' }
      },
      {
        name: 'Startup',
        description: 'An energetic premium template for startups, founders, and entrepreneurs building the future.',
        previewImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop',
        category: 'modern',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'startup', heroStyle: 'bold', projectsLayout: 'cards', font: 'Poppins' }
      },
      {
        name: 'Freelancer',
        description: 'A premium template designed for freelancers to showcase services, portfolio, and client testimonials.',
        previewImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
        category: 'creative',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'freelance', heroStyle: 'personal', projectsLayout: 'grid', font: 'Open Sans' }
      }
    ];
    
    await Template.insertMany(defaultTemplates);
    
    res.json({ success: true, message: 'Templates reseeded successfully', count: defaultTemplates.length });
  } catch (error) {
    console.error('Reseed error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Seed default templates
async function seedTemplates() {
  const count = await Template.countDocuments();
  if (count === 0) {
    const defaultTemplates = [
      // Free Templates (First 5)
      {
        name: 'Minimal',
        description: 'A clean, minimalist template perfect for showcasing your core skills and projects with elegant simplicity.',
        previewImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
        category: 'minimal',
        isActive: true,
        isPremium: false,
        layoutConfig: { headerStyle: 'centered', heroStyle: 'simple', projectsLayout: 'grid', font: 'Inter' }
      },
      {
        name: 'Modern',
        description: 'A contemporary template with bold typography, gradient accents, and responsive layouts.',
        previewImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
        category: 'modern',
        isActive: true,
        isPremium: false,
        layoutConfig: { headerStyle: 'sticky', heroStyle: 'full', projectsLayout: 'cards', font: 'Poppins' }
      },
      {
        name: 'Professional',
        description: 'A formal template ideal for corporate professionals, emphasizing credibility and expertise.',
        previewImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
        category: 'professional',
        isActive: true,
        isPremium: false,
        layoutConfig: { headerStyle: 'classic', heroStyle: 'boxed', projectsLayout: 'list', font: 'Roboto' }
      },
      {
        name: 'Creative',
        description: 'An expressive template designed for creative professionals with unique visual elements.',
        previewImage: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400&h=300&fit=crop',
        category: 'creative',
        isActive: true,
        isPremium: false,
        layoutConfig: { headerStyle: 'transparent', heroStyle: 'split', projectsLayout: 'masonry', font: 'Playfair Display' }
      },
      {
        name: 'Simple',
        description: 'A straightforward, easy-to-use template perfect for beginners starting their portfolio journey.',
        previewImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop',
        category: 'minimal',
        isActive: true,
        isPremium: false,
        layoutConfig: { headerStyle: 'simple', heroStyle: 'basic', projectsLayout: 'grid', font: 'Inter' }
      },
      // Premium Templates
      {
        name: 'Neon Pro',
        description: 'A cyberpunk-inspired premium template with glowing neon effects, perfect for developers and tech enthusiasts.',
        previewImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop',
        category: 'neon',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'floating', heroStyle: 'glow', projectsLayout: 'cards', font: 'Inter' }
      },
      {
        name: 'Elegant',
        description: 'A sophisticated premium template with refined aesthetics for luxury brands and high-end professionals.',
        previewImage: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=300&fit=crop',
        category: 'modern',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'elegant', heroStyle: 'luxury', projectsLayout: 'showcase', font: 'Playfair Display' }
      },
      {
        name: 'Gradient',
        description: 'A vibrant premium template featuring stunning gradient backgrounds and modern design elements.',
        previewImage: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&h=300&fit=crop',
        category: 'colorful',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'gradient', heroStyle: 'colorful', projectsLayout: 'cards', font: 'Poppins' }
      },
      {
        name: 'Portfolio Elite',
        description: 'An elite premium template designed for senior professionals with extensive project showcases.',
        previewImage: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop',
        category: 'professional',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'premium', heroStyle: 'showcase', projectsLayout: 'gallery', font: 'Montserrat' }
      },
      {
        name: 'Tech Innovator',
        description: 'A cutting-edge premium template for tech innovators and startup founders with dynamic sections.',
        previewImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
        category: 'neon',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'tech', heroStyle: 'innovative', projectsLayout: 'timeline', font: 'Inter' }
      },
      {
        name: 'Artisan',
        description: 'A handcrafted premium template perfect for artisans, designers, and creative entrepreneurs.',
        previewImage: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&h=300&fit=crop',
        category: 'creative',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'artisan', heroStyle: 'showcase', projectsLayout: 'masonry', font: 'Lora' }
      },
      {
        name: 'Executive',
        description: 'A premium executive template for C-suite professionals, directors, and senior management.',
        previewImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
        category: 'professional',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'executive', heroStyle: 'corporate', projectsLayout: 'featured', font: 'Merriweather' }
      },
      {
        name: 'Startup',
        description: 'An energetic premium template for startups, founders, and entrepreneurs building the future.',
        previewImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop',
        category: 'modern',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'startup', heroStyle: 'bold', projectsLayout: 'cards', font: 'Poppins' }
      },
      {
        name: 'Freelancer',
        description: 'A premium template designed for freelancers to showcase services, portfolio, and client testimonials.',
        previewImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
        category: 'creative',
        isActive: true,
        isPremium: true,
        layoutConfig: { headerStyle: 'freelance', heroStyle: 'personal', projectsLayout: 'grid', font: 'Open Sans' }
      }
    ];

    await Template.insertMany(defaultTemplates);
    console.log('Default templates seeded successfully');
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = config.port;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
  console.log(`Server accessible at http://localhost:${PORT} or http://<your-ip>:${PORT}`);
});

module.exports = app;
