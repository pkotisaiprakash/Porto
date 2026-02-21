import { useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

// Default preview data for resume templates
const defaultResumeData = {
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/johndoe',
  github: 'github.com/johndoe',
  portfolio: 'johndoe.dev',
  summary: 'Passionate Full Stack Developer with 5+ years of experience building scalable web applications and intuitive user interfaces. Skilled in modern JavaScript frameworks, cloud technologies, and agile methodologies.',
  skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB', 'AWS', 'TypeScript', 'GraphQL', 'Docker', 'Git'],
  education: [
    { institution: 'Stanford University', degree: 'M.S.', field: 'Computer Science', startDate: '2019', endDate: '2021', grade: '3.9 GPA' },
    { institution: 'UC Berkeley', degree: 'B.S.', field: 'Computer Science', startDate: '2015', endDate: '2019', grade: '3.8 GPA' }
  ],
  experience: [
    { company: 'Tech Corp', position: 'Senior Software Engineer', location: 'San Francisco, CA', startDate: '2021', endDate: 'Present', description: 'Lead development of microservices architecture serving 1M+ users. Mentored junior developers and implemented CI/CD pipelines.', isCurrent: true },
    { company: 'StartupXYZ', position: 'Software Developer', location: 'Palo Alto, CA', startDate: '2019', endDate: '2021', description: 'Built responsive web applications using React and Node.js. Reduced page load times by 40%.', isCurrent: false }
  ],
  projects: [
    { name: 'E-Commerce Platform', description: 'Full-stack e-commerce platform with real-time inventory management', technologies: 'React, Node.js, MongoDB, Stripe', link: 'https://github.com/johndoe/ecommerce', startDate: '2023', endDate: '2023' },
    { name: 'AI Chatbot', description: 'AI-powered chatbot using NLP and machine learning', technologies: 'Python, TensorFlow, FastAPI', link: 'https://github.com/johndoe/chatbot', startDate: '2022', endDate: '2022' }
  ],
  certifications: [
    { name: 'AWS Solutions Architect Professional', issuer: 'Amazon Web Services', date: '2023', link: '' },
    { name: 'Google Cloud Professional Developer', issuer: 'Google', date: '2022', link: '' }
  ]
};

const ResumeBuilder = () => {
  useDocumentTitle('Resume Builder - Porto');
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    portfolio: '',
    summary: '',
    skills: [],
    skillInput: '',
    education: [],
    experience: [],
    projects: [],
    certifications: []
  });
  
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [activeSection, setActiveSection] = useState('personal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false); // Toggle for preview with default data
  
  const templates = [
    { id: 'classic', name: 'Classic', description: 'Traditional resume style' },
    { id: 'modern', name: 'Modern', description: 'Clean with accent colors' },
    { id: 'minimal', name: 'Minimal', description: 'Simple and elegant' },
    { id: 'doubleColumn', name: 'Double Column', description: 'Two-column layout' },
    { id: 'leftSidebar', name: 'Left Sidebar', description: 'Sidebar on left' },
    { id: 'rightSidebar', name: 'Right Sidebar', description: 'Sidebar on right' },
    { id: 'executive', name: 'Executive', description: 'Corporate and formal' },
    { id: 'technical', name: 'Technical', description: 'Technical-focused' },
    { id: 'creative', name: 'Creative', description: 'Eye-catching design' },
    { id: 'academic', name: 'Academic', description: 'Formal academic style' }
  ];
  
  const sections = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'skills', label: 'Skills' },
    { id: 'education', label: 'Education' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'certifications', label: 'Certifications' }
  ];

  // Get data based on mode (preview or edit)
  const getDisplayData = () => {
    if (isPreviewMode) {
      return defaultResumeData;
    }
    return formData;
  };

  const displayData = getDisplayData();
  
  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSkillAdd = () => {
    if (formData.skillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.skillInput.trim()],
        skillInput: ''
      }));
    }
  };
  
  const handleSkillRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };
  
  const handleEducationAdd = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        grade: ''
      }]
    }));
  };
  
  const handleEducationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };
  
  const handleEducationRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };
  
  const handleExperienceAdd = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        position: '',
        location: '',
        startDate: '',
        endDate: '',
        description: '',
        isCurrent: false
      }]
    }));
  };
  
  const handleExperienceChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };
  
  const handleExperienceRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };
  
  const handleProjectAdd = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        name: '',
        description: '',
        technologies: '',
        link: '',
        startDate: '',
        endDate: ''
      }]
    }));
  };
  
  const handleProjectChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.map((proj, i) => 
        i === index ? { ...proj, [field]: value } : proj
      )
    }));
  };
  
  const handleProjectRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };
  
  const handleCertificationAdd = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        name: '',
        issuer: '',
        date: '',
        link: ''
      }]
    }));
  };
  
  const handleCertificationChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };
  
  const handleCertificationRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };
  
  // Generate PDF
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById('resume-preview');
      
      // Find the parent container
      const parentElement = element.parentElement;
      const originalParentStyle = parentElement.style.cssText;
      
      // Store original inline styles to restore later
      const originalTransform = element.style.transform;
      const originalWidth = element.style.width;
      const originalMinWidth = element.style.minWidth;
      const originalMaxWidth = element.style.maxWidth;
      const originalHeight = element.style.height;
      const originalMinHeight = element.style.minHeight;
      const originalMarginBottom = element.style.marginBottom;
      
      // Reset parent container styles to not interfere with layout
      parentElement.style.display = 'block';
      parentElement.style.overflow = 'visible';
      
      // Remove transform and reset dimensions for PDF generation
      element.style.transform = 'none';
      element.style.maxWidth = 'none';
      element.style.width = 'auto';
      element.style.minWidth = 'auto';
      element.style.height = 'auto';
      element.style.minHeight = 'auto';
      element.style.marginBottom = '0';
      
      // Handle dark mode for PDF generation - force light mode
      const htmlElement = document.documentElement;
      const hadDarkClass = htmlElement.classList.contains('dark');
      htmlElement.classList.remove('dark');
      
      // Force light mode styles on the resume preview element
      element.classList.add('pdf-mode');
      
      // Wait for styles to apply and layout to recalculate
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Ensure the cloned element has correct styles
          const clonedElement = clonedDoc.getElementById('resume-preview');
          if (clonedElement) {
            // Reset parent container styles in cloned document
            const clonedParent = clonedElement.parentElement;
            if (clonedParent) {
              clonedParent.style.display = 'block';
              clonedParent.style.overflow = 'visible';
            }
            
            clonedElement.style.transform = 'none';
            clonedElement.style.maxWidth = 'none';
            clonedElement.style.width = 'auto';
            clonedElement.style.minWidth = 'auto';
            clonedElement.style.height = 'auto';
            clonedElement.style.minHeight = 'auto';
            clonedElement.style.marginBottom = '0';
          }
          // Remove dark mode from cloned document
          clonedDoc.documentElement.classList.remove('dark');
        }
      });
      
      // Restore original styles
      element.style.transform = originalTransform;
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      element.style.minWidth = originalMinWidth;
      element.style.height = originalHeight;
      element.style.minHeight = originalMinHeight;
      element.style.marginBottom = originalMarginBottom;
      element.classList.remove('pdf-mode');
      
      // Restore parent styles
      parentElement.style.cssText = originalParentStyle;
      
      // Restore dark mode if it was present
      if (hadDarkClass) {
        htmlElement.classList.add('dark');
      }
      
      // Create PDF with A4 size
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Add margins (10mm on each side)
      const marginLeft = 10;
      const marginRight = 10;
      const marginTop = 10;
      const marginBottom = 10;
      
      const availableWidth = pdfWidth - marginLeft - marginRight;
      const availableHeight = pdfHeight - marginTop - marginBottom;
      
      // Calculate dimensions to fit within margins while maintaining aspect ratio
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Scale to fit within available space
      const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
      const finalWidth = imgWidth * scale;
      const finalHeight = imgHeight * scale;
      
      // Center the image horizontally within margins
      const imgX = marginLeft + (availableWidth - finalWidth) / 2;
      const imgY = marginTop;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, finalWidth, finalHeight);
      pdf.save(`${displayData.fullName || 'resume'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Render form section
  const renderSection = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="City, Country"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>LinkedIn</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>GitHub</label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Portfolio Website</label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="https://yourportfolio.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Professional Summary</label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Write a brief summary about yourself, your skills, and career objectives..."
                />
              </div>
            </div>
          </div>
        );
        
      case 'skills':
        return (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Skills</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.skillInput}
                onChange={(e) => setFormData(prev => ({ ...prev, skillInput: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleSkillAdd()}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                placeholder="Add a skill (e.g., JavaScript, React, Python)"
              />
              <button
                onClick={handleSkillAdd}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-600 rounded-full text-sm dark:text-white"
                >
                  {skill}
                  <button
                    onClick={() => handleSkillRemove(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {formData.skills.length === 0 && (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Add your technical and professional skills</p>
            )}
          </div>
        );
        
      case 'education':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Education</h3>
              <button
                onClick={handleEducationAdd}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Education
              </button>
            </div>
            {formData.education.map((edu, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="Institution *"
                  />
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="Degree (e.g., B.Tech, M.Sc) *"
                  />
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="Field of Study"
                  />
                  <input
                    type="text"
                    value={edu.grade}
                    onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="Grade/GPA"
                  />
                  <input
                    type="text"
                    value={edu.startDate}
                    onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="Start Date (e.g., 2020)"
                  />
                  <input
                    type="text"
                    value={edu.endDate}
                    onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="End Date (e.g., 2024 or Present)"
                  />
                </div>
                <button
                  onClick={() => handleEducationRemove(index)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            {formData.education.length === 0 && (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Click "Add Education" to add your educational background</p>
            )}
          </div>
        );
        
      case 'experience':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Experience</h3>
              <button
                onClick={handleExperienceAdd}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Experience
              </button>
            </div>
            {formData.experience.map((exp, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="Company *"
                  />
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="Position/Title *"
                  />
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="Location"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                      className="w-full flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                      placeholder="Start Date"
                    />
                    <input
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                      className="w-full flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                      placeholder="End Date"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={exp.isCurrent}
                        onChange={(e) => handleExperienceChange(index, 'isCurrent', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      I currently work here
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <textarea
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleExperienceRemove(index)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            {formData.experience.length === 0 && (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Click "Add Experience" to add your work experience</p>
            )}
          </div>
        );
        
      case 'projects':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Projects</h3>
              <button
                onClick={handleProjectAdd}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Project
              </button>
            </div>
            {formData.projects.map((project, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="Project Name *"
                  />
                  <input
                    type="url"
                    value={project.link}
                    onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="Project Link (GitHub, Live Demo)"
                  />
                  <input
                    type="text"
                    value={project.technologies}
                    onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="Technologies Used (e.g., React, Node.js)"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={project.startDate}
                      onChange={(e) => handleProjectChange(index, 'startDate', e.target.value)}
                      className="w-full flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                      placeholder="Start"
                    />
                    <input
                      type="text"
                      value={project.endDate}
                      onChange={(e) => handleProjectChange(index, 'endDate', e.target.value)}
                      className="w-full flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                      placeholder="End"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <textarea
                      value={project.description}
                      onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                      placeholder="Project Description..."
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleProjectRemove(index)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            {formData.projects.length === 0 && (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Click "Add Project" to showcase your projects</p>
            )}
          </div>
        );
        
      case 'certifications':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Certifications</h3>
              <button
                onClick={handleCertificationAdd}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Certification
              </button>
            </div>
            {formData.certifications.map((cert, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="Certification Name *"
                  />
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => handleCertificationChange(index, 'issuer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="Issuing Organization *"
                  />
                  <input
                    type="text"
                    value={cert.date}
                    onChange={(e) => handleCertificationChange(index, 'date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="Date (e.g., Jan 2024)"
                  />
                  <input
                    type="url"
                    value={cert.link}
                    onChange={(e) => handleCertificationChange(index, 'link', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                    placeholder="Certificate Link"
                  />
                </div>
                <button
                  onClick={() => handleCertificationRemove(index)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            {formData.certifications.length === 0 && (
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Click "Add Certification" to add your certifications</p>
            )}
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Template-specific render functions
  const renderClassicTemplate = (data) => (
    <div className="font-serif">
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">{data.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap justify-center gap-3 mt-2 text-sm text-gray-700">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>| {data.phone}</span>}
          {data.location && <span>| {data.location}</span>}
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-1 text-sm text-gray-600">
          {data.linkedin && <span>{data.linkedin}</span>}
          {data.github && <span>| {data.github}</span>}
          {data.portfolio && <span>| {data.portfolio}</span>}
        </div>
      </div>
      
      {data.summary && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-400 pb-1 mb-2 uppercase">Summary</h2>
          <p className="text-sm text-gray-700">{data.summary}</p>
        </div>
      )}
      
      {data.skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-400 pb-1 mb-2 uppercase">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-gray-200 text-sm rounded">{skill}</span>
            ))}
          </div>
        </div>
      )}
      
      {data.education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-400 pb-1 mb-2 uppercase">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">{edu.degree} {edu.field && `in ${edu.field}`}</span>
                <span className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</span>
              </div>
              <div className="text-gray-700">{edu.institution}</div>
              {edu.grade && <div className="text-sm text-gray-600">Grade: {edu.grade}</div>}
            </div>
          ))}
        </div>
      )}
      
      {data.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-400 pb-1 mb-2 uppercase">Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between">
                <span className="font-semibold">{exp.position}</span>
                <span className="text-sm text-gray-600">{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</span>
              </div>
              <div className="text-gray-700">{exp.company} {exp.location && `(${exp.location})`}</div>
              {exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      
      {data.projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-400 pb-1 mb-2 uppercase">Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">{project.name}</span>
                {project.link && <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">View Project</a>}
              </div>
              {project.technologies && <div className="text-sm text-gray-600">Technologies: {project.technologies}</div>}
              {project.description && <p className="text-sm text-gray-600">{project.description}</p>}
            </div>
          ))}
        </div>
      )}
      
      {data.certifications.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-400 pb-1 mb-2 uppercase">Certifications</h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">{cert.name}</span>
                {cert.date && <span className="text-sm text-gray-600">{cert.date}</span>}
              </div>
              <div className="text-gray-700">{cert.issuer}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderModernTemplate = (data) => (
    <div className="font-sans">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
            {data.fullName?.charAt(0) || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{data.fullName || 'Your Name'}</h1>
            <p className="text-blue-100">Full Stack Developer</p>
            <div className="flex flex-wrap gap-3 mt-2 text-sm text-blue-100">
              {data.email && <span>✉ {data.email}</span>}
              {data.phone && <span>📱 {data.phone}</span>}
              {data.location && <span>📍 {data.location}</span>}
            </div>
          </div>
        </div>
      </div>
      
      {data.summary && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-blue-700 mb-2">About Me</h2>
          <p className="text-sm text-gray-700">{data.summary}</p>
        </div>
      )}
      
      {data.skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-blue-700 mb-2">Technical Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">{skill}</span>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          {data.experience.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-blue-700 mb-2">Experience</h2>
              {data.experience.map((exp, index) => (
                <div key={index} className="mb-3">
                  <div className="font-semibold text-gray-900">{exp.position}</div>
                  <div className="text-sm text-blue-600">{exp.company}</div>
                  <div className="text-xs text-gray-500">{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</div>
                  {exp.description && <p className="text-xs text-gray-600 mt-1">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {data.education.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-blue-700 mb-2">Education</h2>
              {data.education.map((edu, index) => (
                <div key={index} className="mb-2">
                  <div className="font-semibold text-gray-900">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                  <div className="text-sm text-blue-600">{edu.institution}</div>
                  <div className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</div>
                </div>
              ))}
            </div>
          )}
          
          {data.certifications.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-blue-700 mb-2">Certifications</h2>
              {data.certifications.map((cert, index) => (
                <div key={index} className="mb-2">
                  <div className="font-semibold text-sm text-gray-900">{cert.name}</div>
                  <div className="text-xs text-gray-500">{cert.issuer} - {cert.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {data.projects.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-blue-700 mb-2">Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
              <div className="font-semibold text-gray-900">{project.name}</div>
              {project.technologies && <div className="text-xs text-blue-600">{project.technologies}</div>}
              {project.description && <p className="text-xs text-gray-600">{project.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMinimalTemplate = (data) => (
    <div className="font-sans">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-light text-gray-900 tracking-widest uppercase">{data.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap justify-center gap-2 mt-2 text-xs text-gray-500 tracking-wide">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>• {data.phone}</span>}
          {data.location && <span>• {data.location}</span>}
        </div>
      </div>
      
      {data.summary && (
        <div className="mb-4 text-center">
          <p className="text-sm text-gray-600 italic max-w-lg mx-auto">{data.summary}</p>
        </div>
      )}
      
      {data.skills.length > 0 && (
        <div className="mb-4 text-center">
          <div className="flex flex-wrap justify-center gap-2">
            {data.skills.map((skill, index) => (
              <span key={index} className="text-xs text-gray-500 border border-gray-300 px-2 py-1">{skill}</span>
            ))}
          </div>
        </div>
      )}
      
      <div className="border-t border-gray-200 pt-4">
        {data.experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-light uppercase tracking-widest text-gray-400 mb-2">Experience</h2>
            {data.experience.map((exp, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-medium text-gray-800">{exp.position}</span>
                  <span className="text-xs text-gray-400">{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</span>
                </div>
                <div className="text-sm text-gray-600">{exp.company}</div>
              </div>
            ))}
          </div>
        )}
        
        {data.education.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-light uppercase tracking-widest text-gray-400 mb-2">Education</h2>
            {data.education.map((edu, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between items-baseline">
                  <span className="font-medium text-gray-800">{edu.degree} {edu.field && `in ${edu.field}`}</span>
                  <span className="text-xs text-gray-400">{edu.endDate}</span>
                </div>
                <div className="text-sm text-gray-600">{edu.institution}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderDoubleColumnTemplate = (data) => (
    <div className="font-sans">
      <div className="grid grid-cols-3 gap-4">
        {/* Left Sidebar */}
        <div className="col-span-1 bg-gray-800 text-white p-4">
          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            {data.fullName?.charAt(0) || '?'}
          </div>
          <h1 className="text-lg font-bold text-center mb-2">{data.fullName || 'Your Name'}</h1>
          <p className="text-gray-400 text-xs text-center mb-4">Full Stack Developer</p>
          
          <div className="space-y-2 text-xs">
            {data.email && <div className="break-all">✉ {data.email}</div>}
            {data.phone && <div>📱 {data.phone}</div>}
            {data.location && <div>📍 {data.location}</div>}
          </div>
          
          {data.skills.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-bold mb-2 border-b border-gray-600 pb-1">Skills</h2>
              <div className="flex flex-wrap gap-1">
                {data.skills.map((skill, index) => (
                  <span key={index} className="text-xs bg-gray-700 px-2 py-1 rounded">{skill}</span>
                ))}
              </div>
            </div>
          )}
          
          {data.certifications.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-bold mb-2 border-b border-gray-600 pb-1">Certifications</h2>
              {data.certifications.map((cert, index) => (
                <div key={index} className="mb-2 text-xs">
                  <div className="font-medium">{cert.name}</div>
                  <div className="text-gray-400">{cert.issuer}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <div className="col-span-2 p-4">
          {data.summary && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Summary</h2>
              <p className="text-sm text-gray-700">{data.summary}</p>
            </div>
          )}
          
          {data.experience.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Experience</h2>
              {data.experience.map((exp, index) => (
                <div key={index} className="mb-3">
                  <div className="font-semibold text-gray-900">{exp.position}</div>
                  <div className="text-sm text-gray-600">{exp.company} {exp.location && `| ${exp.location}`}</div>
                  <div className="text-xs text-gray-500">{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</div>
                  {exp.description && <p className="text-xs text-gray-600 mt-1">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
          
          {data.education.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Education</h2>
              {data.education.map((edu, index) => (
                <div key={index} className="mb-2">
                  <div className="font-semibold text-gray-900">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                  <div className="text-sm text-gray-600">{edu.institution}</div>
                  <div className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</div>
                </div>
              ))}
            </div>
          )}
          
          {data.projects.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Projects</h2>
              {data.projects.map((project, index) => (
                <div key={index} className="mb-2">
                  <div className="font-semibold text-gray-900">{project.name}</div>
                  {project.technologies && <div className="text-xs text-gray-600">{project.technologies}</div>}
                  {project.description && <p className="text-xs text-gray-600">{project.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLeftSidebarTemplate = (data) => (
    <div className="font-sans">
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-1/3 bg-indigo-900 text-white p-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold mx-auto mb-4">
            {data.fullName?.charAt(0) || '?'}
          </div>
          <h1 className="text-xl font-bold text-center mb-1">{data.fullName || 'Your Name'}</h1>
          <p className="text-indigo-300 text-xs text-center mb-6">Professional Title</p>
          
          <div className="space-y-3 text-xs mb-6">
            {data.email && <div className="flex items-center gap-2"><span>✉</span><span>{data.email}</span></div>}
            {data.phone && <div className="flex items-center gap-2"><span>📱</span><span>{data.phone}</span></div>}
            {data.location && <div className="flex items-center gap-2"><span>📍</span><span>{data.location}</span></div>}
            {data.linkedin && <div className="flex items-center gap-2"><span>🔗</span><span>{data.linkedin}</span></div>}
            {data.github && <div className="flex items-center gap-2"><span>🐙</span><span>{data.github}</span></div>}
          </div>
          
          {data.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold mb-3">Skills</h2>
              <div className="space-y-2">
                {data.skills.map((skill, index) => (
                  <div key={index} className="bg-indigo-800 px-2 py-1 text-xs rounded">{skill}</div>
                ))}
              </div>
            </div>
          )}
          
          {data.education.length > 0 && (
            <div>
              <h2 className="text-sm font-bold mb-3">Education</h2>
              {data.education.map((edu, index) => (
                <div key={index} className="mb-3">
                  <div className="font-medium text-sm">{edu.degree}</div>
                  <div className="text-indigo-300 text-xs">{edu.institution}</div>
                  <div className="text-indigo-400 text-xs">{edu.startDate} - {edu.endDate}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Main Content */}
        <div className="w-2/3 p-4 bg-white">
          {data.summary && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-indigo-900 mb-2">Professional Summary</h2>
              <p className="text-sm text-gray-700">{data.summary}</p>
            </div>
          )}
          
          {data.experience.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-indigo-900 mb-2">Work Experience</h2>
              {data.experience.map((exp, index) => (
                <div key={index} className="mb-3 border-l-2 border-indigo-200 pl-3">
                  <div className="font-semibold text-gray-900">{exp.position}</div>
                  <div className="text-sm text-indigo-600">{exp.company}</div>
                  <div className="text-xs text-gray-500">{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</div>
                  {exp.description && <p className="text-xs text-gray-600 mt-1">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
          
          {data.projects.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-indigo-900 mb-2">Projects</h2>
              {data.projects.map((project, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-900">{project.name}</div>
                  {project.technologies && <div className="text-xs text-indigo-600">{project.technologies}</div>}
                  {project.description && <p className="text-xs text-gray-600">{project.description}</p>}
                </div>
              ))}
            </div>
          )}
          
          {data.certifications.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-indigo-900 mb-2">Certifications</h2>
              {data.certifications.map((cert, index) => (
                <div key={index} className="mb-2">
                  <div className="font-medium text-sm text-gray-900">{cert.name}</div>
                  <div className="text-xs text-gray-500">{cert.issuer} | {cert.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRightSidebarTemplate = (data) => (
    <div className="font-sans">
      <div className="flex">
        {/* Main Content */}
        <div className="w-2/3 p-4 bg-white">
          {data.summary && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-emerald-900 mb-2">Professional Summary</h2>
              <p className="text-sm text-gray-700">{data.summary}</p>
            </div>
          )}
          
          {data.experience.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-emerald-900 mb-2">Work Experience</h2>
              {data.experience.map((exp, index) => (
                <div key={index} className="mb-3 border-l-2 border-emerald-200 pl-3">
                  <div className="font-semibold text-gray-900">{exp.position}</div>
                  <div className="text-sm text-emerald-600">{exp.company}</div>
                  <div className="text-xs text-gray-500">{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</div>
                  {exp.description && <p className="text-xs text-gray-600 mt-1">{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
          
          {data.education.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-emerald-900 mb-2">Education</h2>
              {data.education.map((edu, index) => (
                <div key={index} className="mb-2">
                  <div className="font-semibold text-gray-900">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                  <div className="text-sm text-emerald-600">{edu.institution}</div>
                  <div className="text-xs text-gray-500">{edu.startDate} - {edu.endDate}</div>
                </div>
              ))}
            </div>
          )}
          
          {data.projects.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-bold text-emerald-900 mb-2">Projects</h2>
              {data.projects.map((project, index) => (
                <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-900">{project.name}</div>
                  {project.technologies && <div className="text-xs text-emerald-600">{project.technologies}</div>}
                  {project.description && <p className="text-xs text-gray-600">{project.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Right Sidebar */}
        <div className="w-1/3 bg-emerald-900 text-white p-4">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold mx-auto mb-4">
            {data.fullName?.charAt(0) || '?'}
          </div>
          <h1 className="text-xl font-bold text-center mb-1">{data.fullName || 'Your Name'}</h1>
          <p className="text-emerald-300 text-xs text-center mb-6">Professional Title</p>
          
          <div className="space-y-3 text-xs mb-6">
            {data.email && <div className="flex items-center gap-2"><span>✉</span><span>{data.email}</span></div>}
            {data.phone && <div className="flex items-center gap-2"><span>📱</span><span>{data.phone}</span></div>}
            {data.location && <div className="flex items-center gap-2"><span>📍</span><span>{data.location}</span></div>}
            {data.linkedin && <div className="flex items-center gap-2"><span>🔗</span><span>{data.linkedin}</span></div>}
            {data.github && <div className="flex items-center gap-2"><span>🐙</span><span>{data.github}</span></div>}
          </div>
          
          {data.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-bold mb-3">Skills</h2>
              <div className="space-y-2">
                {data.skills.map((skill, index) => (
                  <div key={index} className="bg-emerald-800 px-2 py-1 text-xs rounded">{skill}</div>
                ))}
              </div>
            </div>
          )}
          
          {data.certifications.length > 0 && (
            <div>
              <h2 className="text-sm font-bold mb-3">Certifications</h2>
              {data.certifications.map((cert, index) => (
                <div key={index} className="mb-3">
                  <div className="font-medium text-sm">{cert.name}</div>
                  <div className="text-emerald-300 text-xs">{cert.issuer}</div>
                  <div className="text-emerald-400 text-xs">{cert.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderExecutiveTemplate = (data) => (
    <div className="font-serif">
      <div className="bg-slate-900 text-white p-6 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wider">{data.fullName || 'Your Name'}</h1>
            <p className="text-slate-300 text-sm">Executive Professional</p>
          </div>
          <div className="text-right text-xs">
            {data.email && <div>{data.email}</div>}
            {data.phone && <div>{data.phone}</div>}
            {data.location && <div>{data.location}</div>}
          </div>
        </div>
      </div>
      
      {data.summary && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-900 pb-1 mb-2">Executive Summary</h2>
          <p className="text-sm text-gray-700">{data.summary}</p>
        </div>
      )}
      
      {data.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-900 pb-1 mb-2">Professional Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">{exp.position}</span>
                <span className="text-sm text-gray-600">{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</span>
              </div>
              <div className="font-semibold text-slate-700">{exp.company}{exp.location && `, ${exp.location}`}</div>
              {exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      
      {data.education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-900 pb-1 mb-2">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">{edu.degree} {edu.field && `in ${edu.field}`}</span>
                <span className="text-sm text-gray-600">{edu.endDate}</span>
              </div>
              <div className="text-gray-700">{edu.institution}</div>
              {edu.grade && <div className="text-sm text-gray-600">Grade: {edu.grade}</div>}
            </div>
          ))}
        </div>
      )}
      
      {data.skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b-2 border-slate-900 pb-1 mb-2">Core Competencies</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-slate-100 text-slate-800 text-sm font-medium rounded">{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTechnicalTemplate = (data) => (
    <div className="font-mono">
      <div className="bg-gray-900 text-green-400 p-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded bg-green-500/20 flex items-center justify-center text-2xl font-bold">
            {data.fullName?.charAt(0) || '?'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{data.fullName || 'Your Name'}</h1>
            <p className="text-green-400 text-sm">&lt;Full Stack Developer /&gt;</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-green-500">
              {data.email && <span>{data.email}</span>}
              {data.phone && <span>{data.phone}</span>}
              {data.location && <span>{data.location}</span>}
            </div>
          </div>
        </div>
      </div>
      
      {data.summary && (
        <div className="mb-3">
          <h2 className="text-sm font-bold text-green-600 mb-1">// About</h2>
          <p className="text-xs text-gray-700">{data.summary}</p>
        </div>
      )}
      
      {data.skills.length > 0 && (
        <div className="mb-3">
          <h2 className="text-sm font-bold text-green-600 mb-1">// Skills</h2>
          <div className="flex flex-wrap gap-1">
            {data.skills.map((skill, index) => (
              <span key={index} className="text-xs bg-gray-800 text-green-400 px-2 py-0.5 rounded">{skill}</span>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          {data.experience.length > 0 && (
            <div className="mb-3">
              <h2 className="text-sm font-bold text-green-600 mb-1">// Experience</h2>
              {data.experience.map((exp, index) => (
                <div key={index} className="mb-2 text-xs">
                  <div className="text-gray-900 font-bold">{exp.position}</div>
                  <div className="text-green-600">{exp.company}</div>
                  <div className="text-gray-500">{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {data.education.length > 0 && (
            <div className="mb-3">
              <h2 className="text-sm font-bold text-green-600 mb-1">// Education</h2>
              {data.education.map((edu, index) => (
                <div key={index} className="mb-2 text-xs">
                  <div className="text-gray-900 font-bold">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                  <div className="text-green-600">{edu.institution}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {data.projects.length > 0 && (
        <div className="mb-3">
          <h2 className="text-sm font-bold text-green-600 mb-1">// Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="mb-1 text-xs">
              <div className="text-gray-900 font-bold">{project.name}</div>
              {project.technologies && <div className="text-green-600 text-xs">{project.technologies}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreativeTemplate = (data) => (
    <div className="font-sans">
      <div className="relative bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 p-6 mb-4">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="20" cy="20" r="15" fill="white"/>
            <circle cx="80" cy="30" r="20" fill="white"/>
            <circle cx="50" cy="80" r="25" fill="white"/>
          </svg>
        </div>
        <div className="relative text-center text-white">
          <div className="w-24 h-24 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
            {data.fullName?.charAt(0) || '?'}
          </div>
          <h1 className="text-3xl font-bold mb-1">{data.fullName || 'Your Name'}</h1>
          <p className="text-white/80">Creative Developer</p>
          <div className="flex flex-wrap justify-center gap-3 mt-3 text-xs">
            {data.email && <span>✉ {data.email}</span>}
            {data.phone && <span>📱 {data.phone}</span>}
            {data.location && <span>📍 {data.location}</span>}
          </div>
        </div>
      </div>
      
      {data.summary && (
        <div className="mb-4 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
          <p className="text-sm text-gray-700">{data.summary}</p>
        </div>
      )}
      
      {data.skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-center mb-2 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">My Superpowers</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {data.skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 text-white text-sm font-medium rounded-full shadow-md" 
                style={{backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#fd79a8'][index % 6]}}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {data.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-2 p-3 rounded-lg border-l-4" 
              style={{borderColor: ['#ff6b6b', '#4ecdc4', '#45b7d1'][index % 3]}}>
              <div className="font-semibold text-gray-900">{exp.position}</div>
              <div className="text-sm text-gray-600">{exp.company}</div>
              <div className="text-xs text-gray-500">{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</div>
            </div>
          ))}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          {data.education.length > 0 && (
            <div className="mb-3">
              <h2 className="text-sm font-bold text-gray-900 mb-2">Education</h2>
              {data.education.map((edu, index) => (
                <div key={index} className="mb-2">
                  <div className="font-medium text-sm text-gray-900">{edu.degree} {edu.field && `in ${edu.field}`}</div>
                  <div className="text-xs text-gray-600">{edu.institution}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          {data.projects.length > 0 && (
            <div className="mb-3">
              <h2 className="text-sm font-bold text-gray-900 mb-2">Projects</h2>
              {data.projects.map((project, index) => (
                <div key={index} className="mb-2">
                  <div className="font-medium text-sm text-gray-900">{project.name}</div>
                  {project.technologies && <div className="text-xs text-pink-600">{project.technologies}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAcademicTemplate = (data) => (
    <div className="font-serif">
      <div className="text-center border-b-4 border-gray-800 pb-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{data.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap justify-center gap-3 mt-2 text-sm text-gray-600">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>| {data.phone}</span>}
          {data.location && <span>| {data.location}</span>}
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-1 text-sm text-gray-500">
          {data.linkedin && <span>{data.linkedin}</span>}
          {data.github && <span>| {data.github}</span>}
          {data.portfolio && <span>| {data.portfolio}</span>}
        </div>
      </div>
      
      {data.summary && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-400 pb-1 mb-2">Abstract</h2>
          <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}
      
      {data.education.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-400 pb-1 mb-2">Academic Background</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between">
                <span className="font-semibold">{edu.degree} {edu.field && `in ${edu.field}`}</span>
                <span className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</span>
              </div>
              <div className="text-gray-700 italic">{edu.institution}</div>
              {edu.grade && <div className="text-sm text-gray-600">Grade: {edu.grade}</div>}
            </div>
          ))}
        </div>
      )}
      
      {data.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-400 pb-1 mb-2">Research & Professional Experience</h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between">
                <span className="font-semibold">{exp.position}</span>
                <span className="text-sm text-gray-600">{exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}</span>
              </div>
              <div className="text-gray-700">{exp.company}{exp.location && `, ${exp.location}`}</div>
              {exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      
      {data.skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-400 pb-1 mb-2">Areas of Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-sm">{skill}</span>
            ))}
          </div>
        </div>
      )}
      
      {data.publications && data.publications.length > 0 && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-wider border-b border-gray-400 pb-1 mb-2">Publications</h2>
          {data.publications.map((pub, index) => (
            <div key={index} className="mb-2 text-sm">
              <div className="font-medium">{pub.title}</div>
              <div className="text-gray-600">{pub.journal}, {pub.year}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render resume preview based on selected template
  const renderResumePreview = () => {
    const templateStyles = {
      classic: 'font-serif',
      modern: 'font-sans',
      minimal: 'font-sans',
      doubleColumn: '',
      leftSidebar: '',
      rightSidebar: '',
      executive: 'font-serif',
      technical: 'font-mono',
      creative: '',
      academic: 'font-serif'
    };

    const renderTemplate = () => {
      switch (selectedTemplate) {
        case 'classic': return renderClassicTemplate(displayData);
        case 'modern': return renderModernTemplate(displayData);
        case 'minimal': return renderMinimalTemplate(displayData);
        case 'doubleColumn': return renderDoubleColumnTemplate(displayData);
        case 'leftSidebar': return renderLeftSidebarTemplate(displayData);
        case 'rightSidebar': return renderRightSidebarTemplate(displayData);
        case 'executive': return renderExecutiveTemplate(displayData);
        case 'technical': return renderTechnicalTemplate(displayData);
        case 'creative': return renderCreativeTemplate(displayData);
        case 'academic': return renderAcademicTemplate(displayData);
        default: return renderClassicTemplate(displayData);
      }
    };

    return (
      <div className="w-full overflow-x-auto flex justify-center p-2 sm:p-4">
        <div id="resume-preview" className="resume-a4 shadow-lg bg-white">
          {renderTemplate()}
        </div>
      </div>
    );
  };
  
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Resume Builder</h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Create professional resumes and download as PDF</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Form */}
          <div className={`lg:col-span-1 rounded-xl shadow-sm p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Preview Toggle */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Preview Mode</h3>
                <button
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPreviewMode ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPreviewMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {isPreviewMode ? 'Showing sample resume' : 'Showing your entered data'}
              </p>
            </div>
            
            {/* Template Selection */}
            <div className="mb-6">
              <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Select Template</h3>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {templates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-2 text-xs rounded-lg border-2 transition-colors text-left ${
                      selectedTemplate === template.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{template.description}</div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Section Navigation - Hide in preview mode */}
            {!isPreviewMode && (
              <>
                <div className="mb-6">
                  <h3 className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sections</h3>
                  <div className="space-y-1">
                    {sections.map(section => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === section.id
                            ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {section.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Generate Button */}
                <button
                  onClick={generatePDF}
                  disabled={isGenerating || (!formData.fullName && !isPreviewMode)}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  {isGenerating ? 'Generating PDF...' : 'Download PDF'}
                </button>
              </>
            )}
            
            {/* Download button for preview mode */}
            {isPreviewMode && (
              <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
              >
                {isGenerating ? 'Generating PDF...' : 'Download Sample PDF'}
              </button>
            )}
          </div>
          
          {/* Right Panel - Preview */}
          <div className="lg:col-span-2">
            {/* Show form in edit mode, preview in preview mode */}
            {!isPreviewMode && (
              <div className={`rounded-xl shadow-sm p-6 mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {renderSection()}
              </div>
            )}
            
            {/* Resume Preview */}
            <div className="mt-8">
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isPreviewMode ? 'Template Preview (Sample Data)' : 'Resume Preview'}
              </h3>
              {renderResumePreview()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
