import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { templateAPI } from '../services/api';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [templates, setTemplates] = useState([]);

  // set document title
  useDocumentTitle('Home');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await templateAPI.getAll();
      if (response.data.success) {
        setTemplates(response.data.templates);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  // set document title
  useDocumentTitle('Home');

  const handleMouseMove = (e) => {
    setMousePosition({
      x: (e.clientX / window.innerWidth) * 20,
      y: (e.clientY / window.innerHeight) * 20
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden" onMouseMove={handleMouseMove}>
      {/* Animated Background with Neon Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Neon Orbs */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-30 animate-pulse"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            filter: 'blur(60px)'
          }}
        />
        <div 
          className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full opacity-30 animate-pulse"
          style={{
            background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)',
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
            filter: 'blur(60px)',
            animationDelay: '1s'
          }}
        />
        <div 
          className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full opacity-25 animate-pulse"
          style={{
            background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
            transform: `translate(${-mousePosition.x * 0.8}px, ${mousePosition.y * 0.8}px)`,
            filter: 'blur(50px)',
            animationDelay: '0.5s'
          }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" 
          style={{
            backgroundImage: 'linear-gradient(#8b5cf6 1px, transparent 1px), linear-gradient(90deg, #8b5cf6 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center">
            {/* Animated Title */}
            <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                Build Your
              </span>
              <br />
              <span className="relative">
                <span className="relative z-10 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Dream Portfolio
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent blur-xl opacity-50">
                  Dream Portfolio
                </span>
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Create stunning portfolios in minutes with{' '}
              <span className="text-cyan-400 font-semibold">neon-powered</span>{' '}
              templates. Choose, customize, and shine.
            </p>
            
            {/* Animated Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-semibold overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative flex items-center gap-2">
                      <span>Get Started Free</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                    {/* Glow effect */}
                    <span className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-500 blur-lg opacity-30 group-hover:opacity-60 transition-opacity"></span>
                  </Link>
                  
                  <Link
                    to="/login"
                    className="group px-8 py-4 border-2 border-cyan-500/50 rounded-xl font-semibold text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign In
                    </span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-semibold overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center gap-2">
                    <span>Go to Dashboard</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 animate-slideUp">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  Everything you need
                </span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 animate-fadeIn">Powerful features to showcase your work</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  icon: '🎨',
                  title: 'Beautiful Templates',
                  desc: 'Choose from 7 stunning templates including Neon, Colorful & Animated',
                  color: 'from-cyan-400 to-cyan-600'
                },
                {
                  icon: '📄',
                  title: 'Resume Builder',
                  desc: 'Create professional resumes with multiple templates and export to PDF',
                  color: 'from-green-400 to-green-600'
                },
                {
                  icon: '✏️',
                  title: 'Easy Editor',
                  desc: 'Simple drag-and-drop to customize your portfolio',
                  color: 'from-purple-400 to-purple-600'
                },
                {
                  icon: '🚀',
                  title: 'Share Anywhere',
                  desc: 'Get a unique URL to share with employers',
                  color: 'from-pink-400 to-pink-600'
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className={`group p-8 rounded-2xl bg-gray-800/50 border border-gray-700 hover:border-gray-500 transition-all duration-300 hover:-translate-y-2 animate-slideUp`}
                  style={{ animationDelay: `${index * 0.2}s`, animationFillMode: 'both' }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-gray-300 dark:text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Templates Preview */}
        <div className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                  Professional Templates
                </span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400">Hand-crafted neon designs for every profession</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {templates.length > 0 ? (
                templates.map((template, index) => (
                  <Link
                    to="/templates"
                    key={template._id}
                    className={`bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl overflow-hidden hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300 hover:-translate-y-2 border-2 border-cyan-500/30 group`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="aspect-video relative overflow-hidden bg-black/20">
                      <img
                        src={template.previewImage}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white">{template.name}</h3>
                      <p className="text-xs text-gray-300 mt-1">{template.category}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <>
                  {[
                    { name: 'Minimal', color: 'from-gray-600 to-gray-800', borderColor: 'border-cyan-500/30' },
                    { name: 'Modern', color: 'from-cyan-600 to-purple-700', borderColor: 'border-purple-500/30' },
                    { name: 'Creative', color: 'from-pink-600 to-purple-700', borderColor: 'border-pink-500/30' },
                    { name: 'Professional', color: 'from-purple-600 to-gray-700', borderColor: 'border-cyan-500/30' }
                  ].map((template, index) => (
                    <div
                      key={index}
                      className={`bg-gradient-to-br ${template.color} rounded-2xl overflow-hidden hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all duration-300 hover:-translate-y-2 ${template.borderColor} border-2`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="aspect-video bg-black/20 relative">
                        <div className="absolute inset-0 flex flex-col justify-center items-start px-4 space-y-2">
                          <div className="w-3/4 h-2 bg-white/50 rounded"></div>
                          <div className="w-1/2 h-2 bg-white/50 rounded"></div>
                          <div className="w-2/3 h-2 bg-white/50 rounded"></div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white">{template.name}</h3>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/templates"
                className="inline-block px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-semibold hover:from-cyan-400 hover:to-purple-500 transition-all duration-300"
              >
                View All Templates
              </Link>
            </div>
          </div>
        </div>

        {/* Resume Builder Section */}
        <div className="py-24 bg-gradient-to-r from-green-900/50 via-emerald-900/50 to-teal-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="relative">
                  {/* Mock Resume Builder Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-2xl">
                        📄
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Resume Builder</h3>
                        <p className="text-sm text-gray-500">Create & Export to PDF</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                    <div className="mt-6 flex justify-center">
                      <span className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium">Download PDF</span>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 hidden md:block">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-2xl animate-bounce">
                      ➡️
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 md:order-2">
                <div className="inline-block px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold mb-4">
                  ✨ Standout Feature
                </div>
                <h2 className="text-4xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Build Professional Resumes
                  </span>
                  <br />
                  <span className="text-white">in Minutes</span>
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                  Create stunning resumes with our easy-to-use builder. Choose from multiple templates, customize your content, and download as PDF instantly.
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    '✓ 4 Professional Templates',
                    '✓ Easy Drag & Drop Interface',
                    '✓ Export to PDF Instantly',
                    '✓ Customizable Sections'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-300">
                      <span className="text-green-400">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/resume-builder"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-semibold hover:from-green-400 hover:to-emerald-500 transition-all duration-300"
                >
                  <span>Start Building Resume</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Resume to Portfolio Section */}
        <div className="py-24 bg-gradient-to-r from-green-900/50 via-emerald-900/50 to-teal-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="relative">
                  {/* Mock Resume Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-2xl">
                        📄
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Resume</h3>
                        <p className="text-sm text-gray-500">PDF, DOC, or DOCX</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    </div>
                    <div className="mt-6 flex items-center justify-center">
                      <span className="text-3xl">⬇️</span>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 hidden md:block">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-2xl animate-bounce">
                      ➡️
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 md:order-2">
                <div className="inline-block px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold mb-4">
                  🚀 New Feature
                </div>
                <h2 className="text-4xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Transform Your Resume
                  </span>
                  <br />
                  <span className="text-white">Into a Portfolio</span>
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                  Simply upload your resume and let Porto automatically extract your information to create a stunning professional portfolio. It's that easy!
                </p>
                <ul className="space-y-4 mb-8">
                  {[
                    '✓ Upload PDF, DOC, or DOCX files',
                    '✓ Auto-extract name, education & experience',
                    '✓ Match with perfect template',
                    '✓ Publish in seconds'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-300">
                      <span className="text-green-400">{item}</span>
                    </li>
                  ))}
                </ul>
                {!isAuthenticated && (
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl font-semibold hover:from-green-400 hover:to-emerald-500 transition-all duration-300"
                  >
                    <span>Upload Resume Now</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="py-24 bg-gray-200/30 dark:bg-black/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 animate-slideUp">
                <span className="bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  How It Works
                </span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 animate-fadeIn">Create your portfolio in 3 simple steps</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Sign Up', desc: 'Create your free account in seconds', icon: '👤' },
                { step: '02', title: 'Upload Resume', desc: 'Upload your resume and we auto-generate your portfolio', icon: '📄' },
                { step: '03', title: 'Choose Template', desc: 'Pick from 7 stunning templates', icon: '🎯' },
                { step: '04', title: 'Publish & Share', desc: 'Get your unique URL and share with employers', icon: '🚀' }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="relative p-8 rounded-2xl bg-gray-800/30 border border-gray-700/50 hover:border-pink-500/50 transition-all duration-500 group animate-slideUp"
                  style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'both' }}
                >
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 flex items-center justify-center text-xl font-bold text-white group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <div className="text-4xl mb-4 mt-2">{item.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-24 bg-gradient-to-b from-transparent to-purple-900/20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to shine?</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              Join thousands of students who have built their portfolios with us.
            </p>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-semibold hover:from-cyan-400 hover:to-purple-500 transition-all duration-300"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-semibold hover:from-cyan-400 hover:to-purple-500 transition-all duration-300"
              >
                Create Your Portfolio Now
              </Link>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-50 dark:bg-black py-12 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
                Porto
              </p>
              <p className="text-gray-500">© 2026 Porto. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
