const TemplateRenderer = ({ portfolio, template, isPreview = false }) => {
  // Default preview data
  const defaultData = {
    name: 'John Doe',
    title: 'Full Stack Developer & UI/UX Designer',
    bio: 'Passionate Full Stack Developer with 5+ years of experience building scalable web applications and intuitive user interfaces. I love turning complex problems into elegant solutions.',
    avatar: '',
    location: 'San Francisco, CA',
    phone: '+1 (555) 123-4567',
    email: 'john.doe@example.com',
    website: 'https://johndoe.dev',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB', 'AWS', 'TypeScript', 'GraphQL', 'Docker', 'Kubernetes'],
    education: [
      { degree: 'Master of Science in Computer Science', institution: 'Stanford University', field: 'Artificial Intelligence', startDate: '2019', endDate: '2021' },
      { degree: 'Bachelor of Science in Computer Science', institution: 'UC Berkeley', field: 'Computer Science', startDate: '2015', endDate: '2019' }
    ],
    experience: [
      { title: 'Senior Software Engineer', company: 'Tech Corp', location: 'San Francisco, CA', startDate: '2021', endDate: 'Present', description: 'Lead development of microservices architecture serving 1M+ users' },
      { title: 'Software Developer', company: 'StartupXYZ', location: 'Palo Alto, CA', startDate: '2019', endDate: '2021', description: 'Built responsive web applications using React and Node.js' }
    ],
    internships: [
      { title: 'Web Development Intern', company: 'StartupXYZ', location: 'Palo Alto, CA', startDate: '2018', endDate: '2019', description: 'Assisted with building front‑end features using React and collaborated with design team.' }
    ],
    projects: [
      { title: 'E-Commerce Platform', description: 'Built a full-stack e-commerce platform with real-time inventory management', technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'], link: 'https://example.com' },
      { title: 'AI Chatbot', description: 'Developed an AI-powered chatbot using NLP and machine learning', technologies: ['Python', 'TensorFlow', 'FastAPI'], link: 'https://example.com' },
      { title: 'Task Management App', description: 'Created a collaborative task management tool with real-time updates', technologies: ['Vue.js', 'Firebase', 'Tailwind CSS'], link: 'https://example.com' }
    ],
    certificates: [
      { name: 'AWS Solutions Architect Professional', issuer: 'Amazon Web Services', date: '2023' },
      { name: 'Google Cloud Professional Developer', issuer: 'Google', date: '2022' },
      { name: 'Meta Front-End Developer Certificate', issuer: 'Meta', date: '2021' }
    ],
    socialLinks: {
      github: 'https://github.com/johndoe',
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://twitter.com/johndoe',
      instagram: 'https://instagram.com/johndoe'
    }
  };

  const data = isPreview ? defaultData : (portfolio || {});
  const { name, title, bio, avatar, location, phone, email, website, skills = [], education = [], experience = [], internships = [], projects = [], certificates = [], socialLinks = {}, themeSettings = {} } = data;
  
  const theme = {
    primary: themeSettings?.primaryColor || '#3B82F6',
    secondary: themeSettings?.secondaryColor || '#1E40AF',
    background: themeSettings?.backgroundColor || '#FFFFFF',
    text: themeSettings?.textColor || '#1F2937',
    font: themeSettings?.fontFamily || 'Inter'
  };

  const templateCategory = template?.category || 'minimal';

  // Minimal Template - Clean and Simple
  if (templateCategory === 'minimal') {
    return (
      <div className="min-h-screen template-minimal animate-fadeIn" style={{ backgroundColor: theme.background, fontFamily: theme.font }}>
        <div className="max-w-4xl mx-auto px-6 py-16">
          <header className="text-center mb-16 animate-slideUp">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gray-200 overflow-hidden shadow-lg animate-scaleIn">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400 font-light">
                  {name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <h1 className="text-4xl font-light mb-2 tracking-tight" style={{ color: theme.text }}>{name}</h1>
            <p className="text-xl text-gray-500 mb-4 font-light">{title}</p>
            {location && <p className="text-gray-400 text-sm">{location}</p>}
          </header>

          {bio && (
            <section className="mb-12">
              <p className="text-lg text-gray-600 leading-relaxed text-center max-w-2xl mx-auto font-light">{bio}</p>
            </section>
          )}

          {skills.length > 0 && (
            <section className="mb-12 animate-slideUp">
              <h2 className="text-lg font-medium mb-4 text-center uppercase tracking-widest text-gray-400">Skills</h2>
              <div className="flex flex-wrap justify-center gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: theme.primary + '20', color: theme.primary }}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {internships.length > 0 && (
            <section className="mb-12 animate-slideLeft">
              <h2 className="text-lg font-medium mb-6 text-center uppercase tracking-widest text-gray-400">Internships</h2>
              <div className="space-y-4">
                {internships.map((intern, index) => (
                  <div key={index} className="text-center">
                    <h3 className="text-base font-medium" style={{ color: theme.text }}>{intern.title} @ {intern.company}</h3>
                    <p className="text-gray-500 text-sm">{intern.location} ({intern.startDate} - {intern.endDate || 'Present'})</p>
                    {intern.description && <p className="text-gray-400 text-xs mt-1">{intern.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {experience.length > 0 && (
            <section className="mb-12 animate-slideLeft">
              <h2 className="text-lg font-medium mb-6 text-center uppercase tracking-widest text-gray-400">Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, index) => (
                  <div key={index} className="text-center">
                    <h3 className="text-base font-medium" style={{ color: theme.text }}>{exp.title} @ {exp.company}</h3>
                    <p className="text-gray-500 text-sm">{exp.location} ({exp.startDate} - {exp.endDate || 'Present'})</p>
                    {exp.description && <p className="text-gray-400 text-xs mt-1">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section className="mb-12 animate-slideDown">
              <h2 className="text-lg font-medium mb-6 text-center uppercase tracking-widest text-gray-400">Education</h2>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index} className="text-center">
                    <h3 className="text-base font-medium" style={{ color: theme.text }}>{edu.degree}</h3>
                    <p className="text-gray-500 text-sm">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section className="mb-12 animate-slideRight">
              <h2 className="text-lg font-medium mb-6 text-center uppercase tracking-widest text-gray-400">Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project, index) => (
                  <div key={index} className="p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-medium mb-1" style={{ color: theme.text }}>{project.title}</h3>
                    <p className="text-xs text-gray-500">{project.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {certificates.length > 0 && (
            <section className="mb-12 animate-bounce">
              <h2 className="text-lg font-medium mb-6 text-center uppercase tracking-widest text-gray-400">Certificates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert, index) => (
                  <div key={index} className="p-4 border border-gray-100 rounded-lg">
                    <h3 className="text-sm font-medium" style={{ color: theme.text }}>{cert.name}</h3>
                    <p className="text-xs text-gray-500">{cert.issuer} — {cert.date}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // Modern Template - Bold and Colorful
  if (templateCategory === 'modern') {
    return (
      <div className="min-h-screen template-modern" style={{ backgroundColor: theme.background, fontFamily: theme.font }}>
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, ' + theme.primary + ' 0%, ' + theme.secondary + ' 100%)' }}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white dark:bg-gray-700 rounded-full mix-blend-overlay filter blur-3xl"></div>
          </div>
          <div className="max-w-6xl mx-auto px-6 py-20 relative">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-40 h-40 rounded-2xl bg-white/20 dark:bg-gray-700/20 backdrop-blur-sm overflow-hidden shadow-2xl ring-4 ring-white/30 dark:ring-gray-600/30">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl text-white font-bold">
                    {name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-5xl font-bold text-white mb-2">{name}</h1>
                <p className="text-xl text-white/90 mb-4">{title}</p>
                {location && <span className="text-white/80">📍 {location}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {bio && (
            <section className="mb-12">
              <div className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-2xl shadow-lg p-8 border-l-4" style={{ borderColor: theme.primary }}>
                <h2 className="text-2xl font-bold mb-4" style={{ color: theme.text }}>About Me</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{bio}</p>
              </div>
            </section>
          )}

          {skills.length > 0 && (
            <section className="mb-12 animate-slideUp">
              <h2 className="text-2xl font-bold mb-6" style={{ color: theme.text }}>Skills</h2>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <span key={index} className="px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:scale-105 transition-transform" style={{ backgroundColor: theme.primary, color: 'white' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {internships.length > 0 && (
            <section className="mb-12 animate-slideLeft">
              <h2 className="text-2xl font-bold mb-6" style={{ color: theme.text }}>Internships</h2>
              <div className="space-y-4">
                {internships.map((intern, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold" style={{ color: theme.text }}>{intern.title} @ {intern.company}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{intern.location} ({intern.startDate} - {intern.endDate || 'Present'})</p>
                    {intern.description && <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{intern.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {experience.length > 0 && (
            <section className="mb-12 animate-slideLeft">
              <h2 className="text-2xl font-bold mb-6" style={{ color: theme.text }}>Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm">
                    <h3 className="font-semibold" style={{ color: theme.text }}>{exp.title} @ {exp.company}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{exp.location} ({exp.startDate} - {exp.endDate || 'Present'})</p>
                    {exp.description && <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section className="mb-12 animate-slideRight">
              <h2 className="text-2xl font-bold mb-6" style={{ color: theme.text }}>Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-1">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: theme.text }}>{project.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{project.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {certificates.length > 0 && (
            <section className="mb-12 animate-bounce">
              <h2 className="text-2xl font-bold mb-6" style={{ color: theme.text }}>Certificates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 dark:text-gray-100 p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium" style={{ color: theme.text }}>{cert.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{cert.issuer} — {cert.date}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // Creative Template - Expressive and Unique
  if (templateCategory === 'creative') {
    return (
      <div className="min-h-screen template-creative" style={{ backgroundColor: '#0f0f0f', fontFamily: theme.font }}>
        <div className="relative">
          <div className="absolute inset-0" style={{ 
            background: 'radial-gradient(circle at 20% 50%, ' + theme.primary + '20 0%, transparent 50%), radial-gradient(circle at 80% 30%, ' + theme.secondary + '20 0%, transparent 50%)'
          }}></div>
          
          <div className="max-w-6xl mx-auto px-6 py-20 relative">
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="relative">
                <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500" 
                     style={{ background: 'linear-gradient(135deg, ' + theme.primary + ', ' + theme.secondary + ')' }}>
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl text-white font-bold">
                      {name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-center md:text-left">
                <p className="text-sm uppercase tracking-widest mb-2" style={{ color: theme.primary }}>Portfolio</p>
                <h1 className="text-6xl font-bold text-white mb-2">{name}</h1>
                <p className="text-2xl text-gray-400 mb-4">{title}</p>
                <p className="text-gray-500 max-w-md">{bio}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {skills.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
                <span className="text-3xl">⚡</span> Skills
              </h2>
              <div className="flex flex-wrap gap-4">
                {skills.map((skill, index) => (
                  <span key={index} className="px-6 py-3 rounded-full text-sm font-medium hover:scale-110 transition-transform cursor-default" style={{ 
                    background: 'linear-gradient(135deg, ' + theme.primary + '40, ' + theme.secondary + '40)',
                    color: 'white',
                    border: '1px solid ' + theme.primary + '60'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {internships.length > 0 && (
            <section className="mb-16 animate-slideLeft">
              <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
                <span className="text-3xl">🎓</span> Internships
              </h2>
              <div className="space-y-4">
                {internships.map((intern, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-gray-800 text-white">
                    <h3 className="font-semibold">{intern.title} @ {intern.company}</h3>
                    <p className="text-sm text-gray-400">{intern.location} ({intern.startDate} - {intern.endDate || 'Present'})</p>
                    {intern.description && <p className="text-xs mt-1 text-gray-300">{intern.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
          {projects.length > 0 && (
            <section className="mb-16 animate-slideRight">
              <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
                <span className="text-3xl">🚀</span> Projects
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, index) => (
                  <div key={index} className="p-6 rounded-2xl hover:scale-[1.02] transition-all duration-300" style={{ background: 'linear-gradient(135deg, ' + theme.primary + '10, ' + theme.secondary + '10)' }}>
                    <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                    <p className="text-gray-400 mb-4">{project.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {experience.length > 0 && (
            <section className="mb-16 animate-slideLeft">
              <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
                <span className="text-3xl">💼</span> Experience
              </h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-gray-800 text-white">
                    <h3 className="font-semibold">{exp.title} @ {exp.company}</h3>
                    <p className="text-sm text-gray-400">{exp.location} ({exp.startDate} - {exp.endDate || 'Present'})</p>
                    {exp.description && <p className="text-xs mt-1 text-gray-300">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {certificates.length > 0 && (
            <section className="mb-16 animate-bounce">
              <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-3">
                <span className="text-3xl">📜</span> Certifications
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-gray-800 text-white">
                    <h3 className="font-medium">{cert.name}</h3>
                    <p className="text-sm text-gray-400">{cert.issuer} — {cert.date}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // Professional Template - Corporate and Formal
  if (templateCategory === 'professional') {
    return (
      <div className="min-h-screen template-professional" style={{ backgroundColor: '#f8f9fa', fontFamily: 'Roboto, sans-serif' }}>
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden" style={{ backgroundColor: theme.primary }}>
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl text-white font-bold">
                      {name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: theme.text }}>{name}</h1>
                  <p className="text-gray-600">{title}</p>
                </div>
              </div>
              {location && <p className="text-sm text-gray-500">📍 {location}</p>}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12">
          {bio && (
            <section className="mb-10 bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4" style={{ color: theme.primary }}>Professional Summary</h2>
              <p className="text-gray-700 leading-relaxed">{bio}</p>
            </section>
          )}

          {skills.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4" style={{ color: theme.primary }}>Core Competencies</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {skills.map((skill, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-100 shadow-sm">
                    {skill}
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section className="mb-10 animate-slideDown">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4" style={{ color: theme.primary }}>Education</h2>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-sm p-4">
                    <h3 className="font-semibold" style={{ color: theme.text }}>{edu.degree}</h3>
                    <p className="text-gray-600">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {internships.length > 0 && (
            <section className="mb-10 animate-slideLeft">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4" style={{ color: theme.primary }}>Internships</h2>
              <div className="space-y-4">
                {internships.map((intern, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-sm p-4">
                    <h3 className="font-semibold" style={{ color: theme.text }}>{intern.title} @ {intern.company}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{intern.location} ({intern.startDate} - {intern.endDate || 'Present'})</p>
                    {intern.description && <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{intern.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {experience.length > 0 && (
            <section className="mb-10 animate-slideLeft">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4" style={{ color: theme.primary }}>Professional Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-sm p-4">
                    <h3 className="font-semibold" style={{ color: theme.text }}>{exp.title} @ {exp.company}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{exp.location} ({exp.startDate} - {exp.endDate || 'Present'})</p>
                    {exp.description && <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section className="mb-10 animate-slideRight">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4" style={{ color: theme.primary }}>Selected Projects</h2>
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-sm p-4">
                    <h3 className="font-semibold" style={{ color: theme.text }}>{proj.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {certificates.length > 0 && (
            <section className="mb-10 animate-bounce">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4" style={{ color: theme.primary }}>Certifications</h2>
              <div className="space-y-4">
                {certificates.map((cert, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-lg shadow-sm p-4">
                    <h3 className="font-medium" style={{ color: theme.text }}>{cert.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{cert.issuer} — {cert.date}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <footer className="bg-white dark:bg-gray-800 shadow-sm mt-auto py-6">
          <div className="max-w-5xl mx-auto px-6 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} {name}. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

  // Neon Template - Glowing and Cyberpunk
  if (templateCategory === 'neon') {
    return (
      <div className="min-h-screen template-neon" style={{ backgroundColor: '#0a0a0f', fontFamily: theme.font }}>
        <div className="relative overflow-hidden">
          {/* Animated background glows */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500 rounded-full filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          <div className="max-w-5xl mx-auto px-6 py-20 relative">
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-36 h-36 mx-auto rounded-full overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.5)] border-4 border-cyan-400">
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl text-white font-bold bg-gradient-to-br from-cyan-400 to-fuchsia-500">
                      {name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
              </div>
              <h1 className="text-5xl font-bold text-white mb-2 tracking-wider" style={{ textShadow: '0 0 10px rgba(6,182,212,0.8), 0 0 20px rgba(6,182,212,0.6)' }}>{name}</h1>
              <p className="text-xl text-cyan-300 mb-4 font-light">{title}</p>
              {location && <p className="text-fuchsia-400">📍 {location}</p>}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12">
          {bio && (
            <section className="mb-12">
              <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/30">
                <h2 className="text-2xl font-bold mb-4 text-cyan-400">About Me</h2>
                <p className="text-gray-300 leading-relaxed">{bio}</p>
              </div>
            </section>
          )}

          {skills.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-fuchsia-400 flex items-center gap-3">
                <span className="animate-spin">⚡</span> Skills
              </h2>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <span key={index} className="px-5 py-2 rounded-full text-sm font-medium bg-gray-900 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-300 hover:scale-105">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {experience.length > 0 && (
            <section className="mb-12 animate-slideLeft">
              <h2 className="text-2xl font-bold mb-6 text-cyan-400">Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="bg-gray-900/60 rounded-lg p-4 border-l-4 border-cyan-500 hover:bg-gray-800/80 transition-colors">
                    <h3 className="font-semibold text-white">{exp.title} @ {exp.company}</h3>
                    <p className="text-cyan-400 text-sm">{exp.location} ({exp.startDate} - {exp.endDate || 'Present'})</p>
                    {exp.description && <p className="text-gray-400 text-xs mt-2">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section className="mb-12 animate-slideRight">
              <h2 className="text-2xl font-bold mb-6 text-fuchsia-400">Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, index) => (
                  <div key={index} className="bg-gray-900/60 rounded-xl p-6 border border-fuchsia-500/30 hover:border-fuchsia-500 hover:shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all duration-300 group">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-fuchsia-400 transition-colors">{project.title}</h3>
                    <p className="text-gray-400">{project.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section className="mb-12 animate-slideDown">
              <h2 className="text-2xl font-bold mb-6 text-cyan-400">Education</h2>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index} className="bg-gray-900/60 rounded-lg p-4 border border-cyan-500/30">
                    <h3 className="font-semibold text-white">{edu.degree}</h3>
                    <p className="text-cyan-400 text-sm">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {certificates.length > 0 && (
            <section className="mb-12 animate-bounce">
              <h2 className="text-2xl font-bold mb-6 text-fuchsia-400">Certifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert, idx) => (
                  <div key={idx} className="bg-gray-900/60 rounded-lg p-4 border border-fuchsia-500/30">
                    <h3 className="font-medium text-white">{cert.name}</h3>
                    <p className="text-fuchsia-400 text-sm">{cert.issuer} — {cert.date}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <footer className="py-6 text-center">
          <p className="text-gray-500 text-sm">© {new Date().getFullYear()} {name} | Built with Porto</p>
        </footer>
      </div>
    );
  }

  // Colorful Template - Vibrant and Fun
  if (templateCategory === 'colorful') {
    return (
      <div className="min-h-screen template-colorful" style={{ backgroundColor: '#fff5f5', fontFamily: theme.font }}>
        <div className="relative" style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)' }}>
          <div className="absolute inset-0 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="20" cy="20" r="15" fill="#ffffff" opacity="0.3"/>
              <circle cx="80" cy="30" r="20" fill="#ffffff" opacity="0.2"/>
              <circle cx="50" cy="80" r="25" fill="#ffffff" opacity="0.25"/>
            </svg>
          </div>
          <div className="max-w-5xl mx-auto px-6 py-16 relative">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white dark:bg-gray-700 shadow-2xl ring-4 ring-white dark:ring-gray-600">
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                    {name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">{name}</h1>
              <p className="text-xl text-white/90 mb-4">{title}</p>
              {location && <p className="text-white/80 font-medium">📍 {location}</p>}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12 -mt-8 relative">
          {bio && (
            <section className="mb-12">
              <div className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-2xl shadow-lg p-8 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">✨ About Me</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{bio}</p>
              </div>
            </section>
          )}

          {skills.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center">My Superpowers 🦸</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {skills.map((skill, index) => (
                  <span key={index} className="px-6 py-3 rounded-full text-sm font-bold text-white shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300" style={{ backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe'][index % 8] }}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {experience.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#4ecdc4' }}>💼 Experience</h2>
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-5 shadow-md hover:shadow-xl transition-shadow border-l-4" style={{ borderColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'][idx % 4] }}>
                    <h3 className="font-bold text-gray-800">{exp.title} @ {exp.company}</h3>
                    <p className="text-gray-500 text-sm">{exp.location} ({exp.startDate} - {exp.endDate || 'Present'})</p>
                    {exp.description && <p className="text-gray-600 text-xs mt-2">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#ff6b6b' }}>🚀 Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                    <div className="h-2" style={{ backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'][index % 4] }}></div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-2" style={{ color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'][index % 4] }}>{project.title}</h3>
                      <p className="text-gray-600">{project.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#45b7d1' }}>🎓 Education</h2>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 dark:text-gray-100 rounded-xl p-5 shadow-md">
                    <h3 className="font-bold text-gray-800">{edu.degree}</h3>
                    <p className="text-gray-500">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {certificates.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#a29bfe' }}>🏆 Certifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border-2 border-pink-200">
                    <h3 className="font-bold text-gray-800">{cert.name}</h3>
                    <p className="text-gray-500 text-sm">{cert.issuer} — {cert.date}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <footer className="py-8 text-center text-white" style={{ background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)' }}>
          <p className="font-medium">Made with ❤️ by {name}</p>
        </footer>
      </div>
    );
  }

  // Animated Template - Best Animation
  if (templateCategory === 'animated') {
    return (
      <div className="min-h-screen template-animated" style={{ backgroundColor: '#0f172a', fontFamily: theme.font }}>
        {/* Animated background particles */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
        </div>

        <div className="relative z-10">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center px-6">
              <div className="mb-8 relative">
                <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1 animate-spin-slow">
                  <div className="w-full h-full rounded-full bg-gray-900 overflow-hidden">
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white bg-gradient-to-br from-blue-500 to-pink-500">
                        {name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <h1 className="text-6xl font-bold text-white mb-4 animate-bounce">{name}</h1>
              <p className="text-2xl text-gray-300 mb-6 animate-fadeIn">{title}</p>
              <p className="text-gray-400 animate-slideUp">{bio}</p>
              {location && <p className="text-gray-500 mt-4 animate-pulse">📍 {location}</p>}
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6 py-20">
            {skills.length > 0 && (
              <section className="mb-20">
                <h2 className="text-4xl font-bold text-center text-white mb-10 animate-slideLeft">Skills</h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {skills.map((skill, index) => (
                    <span key={index} 
                      className="px-6 py-3 rounded-full text-lg font-bold text-white animate-spin" 
                      style={{ 
                        background: `linear-gradient(${index * 45}deg, hsl(${index * 40}, 80%, 60%), hsl(${index * 40 + 60}, 80%, 60%))`,
                        animationDelay: `${index * 0.1}s`,
                        boxShadow: `0 0 20px hsl(${index * 40}, 80%, 60%, 0.5)`
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {experience.length > 0 && (
              <section className="mb-20">
                <h2 className="text-4xl font-bold text-center text-white mb-10 animate-slideRight">Experience</h2>
                <div className="space-y-6">
                  {experience.map((exp, idx) => (
                    <div key={idx} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] animate-slideUp">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{exp.title}</h3>
                          <p className="text-purple-400">{exp.company}</p>
                          <p className="text-gray-400 text-sm">{exp.location} ({exp.startDate} - {exp.endDate || 'Present'})</p>
                        </div>
                      </div>
                      {exp.description && <p className="text-gray-300 mt-4">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {projects.length > 0 && (
              <section className="mb-20">
                <h2 className="text-4xl font-bold text-center text-white mb-10 animate-bounce">Projects</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {projects.map((project, index) => (
                    <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 hover:border-cyan-500 transition-all duration-500 hover:scale-105 group">
                      <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-pulse"></div>
                      <div className="p-6">
                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">{project.title}</h3>
                        <p className="text-gray-400">{project.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {education.length > 0 && (
              <section className="mb-20">
                <h2 className="text-4xl font-bold text-center text-white mb-10 animate-slideDown">Education</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {education.map((edu, index) => (
                    <div key={index} className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-pink-500 transition-all duration-300 animate-fadeIn">
                      <h3 className="text-xl font-bold text-white">{edu.degree}</h3>
                      <p className="text-pink-400">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {certificates.length > 0 && (
              <section className="mb-20">
                <h2 className="text-4xl font-bold text-center text-white mb-10 animate-pulse">Certificates</h2>
                <div className="flex flex-wrap justify-center gap-6">
                  {certificates.map((cert, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-transparent hover:border-yellow-400 transition-all duration-300 hover:rotate-3 min-w-64">
                      <h3 className="text-lg font-bold text-white">{cert.name}</h3>
                      <p className="text-yellow-400">{cert.issuer}</p>
                      <p className="text-gray-500 text-sm">{cert.date}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <footer className="py-8 text-center">
            <p className="text-gray-500 animate-pulse">✨ {name} © {new Date().getFullYear()}</p>
          </footer>
        </div>
      </div>
    );
  }

  return null;
};

export default TemplateRenderer;
