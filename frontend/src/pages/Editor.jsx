import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Editor = () => {
  const { portfolio, templates, loading, updatePortfolio, publishPortfolio, createPortfolio, fetchPortfolio, uploadResume, deleteResume } = usePortfolio();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);

  // dynamic document title depending on portfolio name
  useDocumentTitle(portfolio?.name ? `Edit – ${portfolio.name}` : 'Editor');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [parsedData, setParsedData] = useState(null); // hold parsed resume details

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    bio: '',
    avatar: '',
    location: '',
    phone: '',
    skills: [],
    education: [],
    projects: [],
    certificates: [],
    socialLinks: {
      github: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      website: ''
    },
    themeSettings: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      fontFamily: 'Inter'
    }
  });

  useEffect(() => {
    if (portfolio) {
      setFormData({
        name: portfolio.name || '',
        email: portfolio.email || '',
        title: portfolio.title || '',
        bio: portfolio.bio || '',
        avatar: portfolio.avatar || '',
        location: portfolio.location || '',
        phone: portfolio.phone || '',
        skills: portfolio.skills || [],
        education: portfolio.education || [],
        projects: portfolio.projects || [],
        certificates: portfolio.certificates || [],
        socialLinks: {
          github: portfolio.socialLinks?.github || '',
          linkedin: portfolio.socialLinks?.linkedin || '',
          twitter: portfolio.socialLinks?.twitter || '',
          instagram: portfolio.socialLinks?.instagram || '',
          website: portfolio.socialLinks?.website || ''
        },
        themeSettings: {
          primaryColor: portfolio.themeSettings?.primaryColor || '#3B82F6',
          secondaryColor: portfolio.themeSettings?.secondaryColor || '#1E40AF',
          backgroundColor: portfolio.themeSettings?.backgroundColor || '#FFFFFF',
          textColor: portfolio.themeSettings?.textColor || '#1F2937',
          fontFamily: portfolio.themeSettings?.fontFamily || 'Inter'
        }
      });
    }
  }, [portfolio]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [key]: value }
      }));
    } else if (name.startsWith('themeSettings.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        themeSettings: { ...prev.themeSettings, [key]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSkillAdd = () => {
    setFormData(prev => ({ ...prev, skills: [...prev.skills, ''] }));
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...formData.skills];
    newSkills[index] = value;
    setFormData(prev => ({ ...prev, skills: newSkills }));
  };

  const handleSkillRemove = (index) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // require template selection before uploading
    if (!portfolio?.templateId) {
      setMessage({ type: 'error', text: 'Please select a template first before uploading a resume.' });
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Please upload a PDF or Word document' });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB' });
      return;
    }

    setUploadingResume(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await uploadResume(file);
      if (result.success) {
        const parsed = result.parsedData || {};
        const hasInfo = result.parsedDataHasInfo;

        // display the parsed object in preview
        setParsedData(parsed);

        // message based on whether backend thought there was data
        if (hasInfo) {
          setMessage({ type: 'success', text: 'Resume uploaded and parsed successfully! Review and correct the details below.' });
        } else {
          // still success – parser just didn’t find any information
          setMessage({ type: 'success', text: 'Resume uploaded. No extractable details were found; please complete the form manually.' });
        }

        // also set form data directly from new portfolio (in case effect timing lags)
        if (result.portfolio) {
          setFormData({
            name: result.portfolio.name || '',
            email: result.portfolio.email || '',
            title: result.portfolio.title || '',
            bio: result.portfolio.bio || '',
            avatar: result.portfolio.avatar || '',
            location: result.portfolio.location || '',
            phone: result.portfolio.phone || '',
            skills: result.portfolio.skills || [],
            education: result.portfolio.education || [],
            projects: result.portfolio.projects || [],
            certificates: result.portfolio.certificates || [],
            socialLinks: {
              github: result.portfolio.socialLinks?.github || '',
              linkedin: result.portfolio.socialLinks?.linkedin || '',
              twitter: result.portfolio.socialLinks?.twitter || '',
              instagram: result.portfolio.socialLinks?.instagram || '',
              website: result.portfolio.socialLinks?.website || ''
            },
            themeSettings: {
              primaryColor: result.portfolio.themeSettings?.primaryColor || '#3B82F6',
              secondaryColor: result.portfolio.themeSettings?.secondaryColor || '#1E40AF',
              backgroundColor: result.portfolio.themeSettings?.backgroundColor || '#FFFFFF',
              textColor: result.portfolio.themeSettings?.textColor || '#1F2937',
              fontFamily: result.portfolio.themeSettings?.fontFamily || 'Inter'
            }
          });
        }
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload resume' });
    } finally {
      setUploadingResume(false);
      setResumeFile(null);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete the uploaded resume?')) {
      return;
    }

    setUploadingResume(true);
    try {
      const result = await deleteResume();
      if (result.success) {
        setMessage({ type: 'success', text: 'Resume deleted successfully. You can now upload a new resume.' });
        setParsedData(null);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete resume' });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleEducationAdd = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { institution: '', degree: '', field: '', startDate: '', endDate: '', description: '' }]
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...formData.education];
    newEducation[index] = { ...newEducation[index], [field]: value };
    setFormData(prev => ({ ...prev, education: newEducation }));
  };

  const handleEducationRemove = (index) => {
    setFormData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
  };

  const handleProjectAdd = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { title: '', description: '', link: '', image: '', technologies: [], startDate: '', endDate: '' }]
    }));
  };

  const handleProjectChange = (index, field, value) => {
    const newProjects = [...formData.projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setFormData(prev => ({ ...prev, projects: newProjects }));
  };

  const handleProjectRemove = (index) => {
    setFormData(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
  };

  const handleCertificateAdd = () => {
    setFormData(prev => ({
      ...prev,
      certificates: [...prev.certificates, { name: '', issuer: '', date: '', link: '' }]
    }));
  };

  const handleCertificateChange = (index, field, value) => {
    const newCertificates = [...formData.certificates];
    newCertificates[index] = { ...newCertificates[index], [field]: value };
    setFormData(prev => ({ ...prev, certificates: newCertificates }));
  };

  const handleCertificateRemove = (index) => {
    setFormData(prev => ({ ...prev, certificates: prev.certificates.filter((_, i) => i !== index) }));
  };

  const handleSave = async (publish = false) => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Clean up empty values
      const cleanedData = {
        ...formData,
        skills: formData.skills.filter(s => s.trim()),
        education: formData.education.filter(e => e.institution && e.degree),
        projects: formData.projects.filter(p => p.title),
        certificates: formData.certificates.filter(c => c.name && c.issuer),
        socialLinks: Object.fromEntries(
          Object.entries(formData.socialLinks).filter(([_, v]) => v.trim())
        )
      };

      let result;
      if (portfolio) {
        result = await updatePortfolio(cleanedData);
      } else {
        result = await createPortfolio(cleanedData);
      }

      if (result.success) {
        if (publish) {
          // client-side validation before calling API
          if (!cleanedData.name || !cleanedData.title || !cleanedData.bio) {
            setMessage({ type: 'error', text: 'Please fill in name, title and bio before publishing.' });
            setSaving(false);
            return;
          }
          const publishResult = await publishPortfolio();
          if (publishResult.success) {
            setMessage({ type: 'success', text: 'Portfolio published successfully!' });
            navigate(`/u/${user?.username}`);
          } else {
            setMessage({ type: 'error', text: publishResult.message });
          }
        } else {
          setMessage({ type: 'success', text: 'Portfolio saved successfully!' });
          await fetchPortfolio();
        }
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  };

  if (loading && !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Portfolio Editor</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Fill in your details to create your portfolio</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 px-4 py-3 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* raw parsed data preview for transparency */}
        {parsedData && Object.keys(parsedData).length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="font-medium mb-2">Parsed Resume Data</h4>
            <pre className="text-xs overflow-auto max-h-48">
              {JSON.stringify(parsedData, null, 2)}
            </pre>
          </div>
        )}

        {!portfolio?.templateId && templates.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-700">
              Please select a template first.{' '}
              <button onClick={() => navigate('/templates')} className="underline font-medium">
                Choose Template
              </button>
            </p>
          </div>
        )}

        {/* quick process steps shown once template is selected */}
        {portfolio?.templateId && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Getting Started</h3>
            <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
              <li>Select a template from the&nbsp;
                <button onClick={() => navigate('/templates')} className="underline font-medium">
                  Templates page
                </button>.
              </li>
              <li>Upload your resume (or manually enter details below).</li>
              <li>Verify parsed information appears and make any corrections.</li>
              <li>Save draft or publish when you're ready.</li>
            </ol>
          </div>
        )}

        <div className="space-y-8">
          {/* Basic Info */}
          <section className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
            
            {/* Resume Upload */}
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-800">Upload Resume</h3>
                  <p className="text-sm text-green-600">Upload PDF or Word document to auto-generate portfolio</p>
                  {portfolio?.resume && (
                    <p className="text-xs text-green-700 mt-1">Current: {portfolio.resumeOriginalName}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {portfolio?.resume && (
                    <button
                      onClick={handleDeleteResume}
                      disabled={uploadingResume}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  <label
                    className={`cursor-pointer px-4 py-2 rounded-lg transition-colors
                      ${portfolio?.templateId ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                  >
                    <span>{uploadingResume ? 'Uploading...' : 'Choose File'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                      disabled={uploadingResume || !portfolio?.templateId}
                    />
                  </label>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Full Stack Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="New York, USA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label>
                <input
                  type="text"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio *</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Skills</h2>
              <button
                onClick={handleSkillAdd}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Skill
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Skill"
                  />
                  <button
                    onClick={() => handleSkillRemove(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              {formData.skills.length === 0 && (
                <p className="text-gray-500 text-sm">Click "Add Skill" to add your skills</p>
              )}
            </div>
          </section>

          {/* Education */}
          <section className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Education</h2>
              <button
                onClick={handleEducationAdd}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Education
              </button>
            </div>
            <div className="space-y-6">
              {formData.education.map((edu, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Institution *"
                    />
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Degree *"
                    />
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Field of Study"
                    />
                    <div className="flex gap-2 w-full">
                      <input
                        type="text"
                        value={edu.startDate}
                        onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent flex-1"
                        placeholder="Start Year"
                      />
                      <input
                        type="text"
                        value={edu.endDate}
                        onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent flex-1"
                        placeholder="End Year"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleEducationRemove(index)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Projects</h2>
              <button
                onClick={handleProjectAdd}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Project
              </button>
            </div>
            <div className="space-y-6">
              {formData.projects.map((project, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Project Title *"
                    />
                    <input
                      type="text"
                      value={project.link}
                      onChange={(e) => handleProjectChange(index, 'link', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Project URL"
                    />
                    <input
                      type="text"
                      value={project.image}
                      onChange={(e) => handleProjectChange(index, 'image', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Image URL"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={project.startDate}
                        onChange={(e) => handleProjectChange(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent flex-1"
                        placeholder="Start"
                      />
                      <input
                        type="text"
                        value={project.endDate}
                        onChange={(e) => handleProjectChange(index, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent flex-1"
                        placeholder="End"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <textarea
                        value={project.description}
                        onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={2}
                        placeholder="Description"
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
            </div>
          </section>

          {/* Certificates */}
          <section className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Certificates</h2>
              <button
                onClick={handleCertificateAdd}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Certificate
              </button>
            </div>
            <div className="space-y-4">
              {formData.certificates.map((cert, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => handleCertificateChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Certificate Name *"
                    />
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => handleCertificateChange(index, 'issuer', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Issuer *"
                    />
                    <input
                      type="text"
                      value={cert.date}
                      onChange={(e) => handleCertificateChange(index, 'date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Date"
                    />
                    <input
                      type="text"
                      value={cert.link}
                      onChange={(e) => handleCertificateChange(index, 'link', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Certificate Link"
                    />
                  </div>
                  <button
                    onClick={() => handleCertificateRemove(index)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Social Links */}
          <section className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Social Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub</label>
                <input
                  type="text"
                  name="socialLinks.github"
                  value={formData.socialLinks.github}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn</label>
                <input
                  type="text"
                  name="socialLinks.linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter</label>
                <input
                  type="text"
                  name="socialLinks.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://twitter.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram</label>
                <input
                  type="text"
                  name="socialLinks.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                <input
                  type="text"
                  name="socialLinks.website"
                  value={formData.socialLinks.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </section>

          {/* Theme Settings */}
          <section className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Theme Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Color</label>
                <input
                  type="color"
                  name="themeSettings.primaryColor"
                  value={formData.themeSettings.primaryColor}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secondary Color</label>
                <input
                  type="color"
                  name="themeSettings.secondaryColor"
                  value={formData.themeSettings.secondaryColor}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background Color</label>
                <input
                  type="color"
                  name="themeSettings.backgroundColor"
                  value={formData.themeSettings.backgroundColor}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Text Color</label>
                <input
                  type="color"
                  name="themeSettings.textColor"
                  value={formData.themeSettings.textColor}
                  onChange={handleChange}
                  className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Font Family</label>
                <select
                  name="themeSettings.fontFamily"
                  value={formData.themeSettings.fontFamily}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Inter">Inter</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Playfair Display">Playfair Display</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Editor;
