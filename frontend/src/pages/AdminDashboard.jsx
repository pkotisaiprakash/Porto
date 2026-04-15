import { useState, useEffect } from 'react';
import { portfolioAPI, templateAPI, authAPI } from '../services/api';
import useDocumentTitle from '../hooks/useDocumentTitle';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('templates');

  const [templateSearch, setTemplateSearch] = useState('');
  const [templateSort, setTemplateSort] = useState('name');
  const [templateFilter, setTemplateFilter] = useState('all');

  const [userSearch, setUserSearch] = useState('');
  const [userSort, setUserSort] = useState('name');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userPremiumFilter, setUserPremiumFilter] = useState('all');

  useDocumentTitle('Admin Dashboard');

  const filteredTemplates = templates
    .filter(t => {
      if (templateFilter === 'all') return true;
      if (templateFilter === 'active') return t.isActive;
      if (templateFilter === 'inactive') return !t.isActive;
      return true;
    })
    .filter(t => t.name.toLowerCase().includes(templateSearch.toLowerCase()))
    .sort((a, b) => {
      if (templateSort === 'name') return a.name.localeCompare(b.name);
      if (templateSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (templateSort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  const filteredUsers = users
    .filter(u => {
      if (userRoleFilter === 'all') return true;
      return u.role === userRoleFilter;
    })
    .filter(u => {
      if (userPremiumFilter === 'all') return true;
      if (userPremiumFilter === 'premium') return u.isPremium;
      if (userPremiumFilter === 'free') return !u.isPremium;
      return true;
    })
    .filter(u => 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase())
    )
    .sort((a, b) => {
      if (userSort === 'name') return a.name.localeCompare(b.name);
      if (userSort === 'email') return a.email.localeCompare(b.email);
      if (userSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });

  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    description: '',
    previewImage: '',
    category: 'modern',
    code: '',
    isActive: true
  });
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    username: '',
    role: 'user',
    isPremium: false
  });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '', id: null, name: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, templatesRes, usersRes] = await Promise.all([
        portfolioAPI.getAdminStats(),
        templateAPI.getAdmin(),
        authAPI.getAllUsers()
      ]);
      setStats(statsRes.data.stats);
      setTemplates(templatesRes.data.templates);
      setUsers(usersRes.data.users);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTemplateFormData({
      ...templateFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleUserInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'role' && value === 'admin') {
      setUserFormData({
        ...userFormData,
        role: value,
        isPremium: false
      });
    } else {
      setUserFormData({
        ...userFormData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await templateAPI.update(editingTemplate._id, templateFormData);
      } else {
        await templateAPI.create(templateFormData);
      }
      setShowTemplateModal(false);
      setEditingTemplate(null);
      setTemplateFormData({ name: '', description: '', previewImage: '', category: 'modern', code: '', isActive: true });
      fetchData();
    } catch (err) {
      console.error('Error saving template:', err);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await authAPI.updateUser(editingUser.id, userFormData);
      }
      setShowUserModal(false);
      setEditingUser(null);
      setUserFormData({ name: '', email: '', username: '', role: 'user', isPremium: false });
      fetchData();
    } catch (err) {
      console.error('Error saving user:', err);
    }
  };

  const defaultTemplateCode = `const Template = ({ data }) => {
  const { name, title, bio, avatar, location, phone, email, website, skills = [], education = [], experience = [], projects = [], certificates = [], socialLinks = {} } = data;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-6 mb-8">
          {avatar && <img src={avatar} alt={name} className="w-24 h-24 rounded-full object-cover" />}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
            <p className="text-xl text-gray-600">{title}</p>
          </div>
        </div>
        
        {/* Bio */}
        {bio && <p className="text-gray-700 mb-6">{bio}</p>}
        
        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">{skill}</span>
              ))}
            </div>
          </div>
        )}
        
        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Experience</h2>
            {experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <h3 className="font-semibold text-gray-900">{exp.company}</h3>
                <p className="text-gray-600">{exp.position} | {exp.startDate} - {exp.endDate}</p>
                <p className="text-gray-700 mt-1">{exp.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Template;`;

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateFormData({
      name: template.name,
      description: template.description,
      previewImage: template.previewImage,
      category: template.category,
      code: template.code || defaultTemplateCode,
      isActive: template.isActive
    });
    setShowTemplateModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      isPremium: user.role === 'admin' ? false : user.isPremium
    });
    setShowUserModal(true);
  };

  const handleDeleteTemplate = async (id) => {
    const template = templates.find(t => t._id === id);
    setDeleteConfirm({
      show: true,
      type: 'template',
      id,
      name: template?.name || 'this template'
    });
  };

  const handleDeleteUser = async (id) => {
    const user = users.find(u => u.id === id);
    setDeleteConfirm({
      show: true,
      type: 'user',
      id,
      name: user?.name || 'this user'
    });
  };

  const confirmDelete = async () => {
    try {
      if (deleteConfirm.type === 'template') {
        await templateAPI.delete(deleteConfirm.id);
      } else if (deleteConfirm.type === 'user') {
        await authAPI.deleteUser(deleteConfirm.id);
      }
      setDeleteConfirm({ show: false, type: '', id: null, name: '' });
      fetchData();
    } catch (err) {
      console.error('Error deleting:', err);
      alert('Failed to delete. ' + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleTemplate = async (id) => {
    try {
      await templateAPI.toggle(id);
      fetchData();
    } catch (err) {
      console.error('Error toggling template:', err);
    }
  };

  const openCreateTemplateModal = () => {
    setEditingTemplate(null);
    setTemplateFormData({ name: '', description: '', previewImage: '', category: 'modern', code: defaultTemplateCode, isActive: true });
    setShowTemplateModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage your platform</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Users</p>
                <p className="mt-1 text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-900/50">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Total Portfolios</p>
                <p className="mt-1 text-3xl font-bold text-white">{stats?.totalPortfolios || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-green-900/50">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Published</p>
                <p className="mt-1 text-3xl font-bold text-white">{stats?.publishedPortfolios || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-900/50">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Templates</p>
                <p className="mt-1 text-3xl font-bold text-white">{stats?.activeTemplates || 0}/{stats?.totalTemplates || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-900/50">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'templates'
                  ? 'border-cyan-500 text-cyan-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Templates
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-cyan-500 text-cyan-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Members
            </button>
          </nav>
        </div>

        {activeTab === 'templates' && (
          <div className="bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">Template Management</h2>
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white"
                />
                <select
                  value={templateFilter}
                  onChange={(e) => setTemplateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={templateSort}
                  onChange={(e) => setTemplateSort(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white"
                >
                  <option value="name">Sort by Name</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
                <button
                  onClick={openCreateTemplateModal}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Add Template
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTemplates.map((template) => (
                    <tr key={template._id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
                            <img src={template.previewImage} alt={template.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{template.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{template.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs capitalize">
                          {template.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleTemplate(template._id)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            template.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {template.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template._id)}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-semibold text-white">Member Management</h2>
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Search members..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white"
                />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
                <select
                  value={userPremiumFilter}
                  onChange={(e) => setUserPremiumFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white"
                >
                  <option value="all">All Plans</option>
                  <option value="premium">Premium</option>
                  <option value="free">Free</option>
                </select>
                <select
                  value={userSort}
                  onChange={(e) => setUserSort(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white"
                >
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premium</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">{user.name}</p>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-purple-900/50 text-purple-400'
                            : 'bg-gray-700 text-gray-400'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.isPremium
                            ? 'bg-yellow-900/50 text-yellow-400'
                            : 'bg-gray-700 text-gray-500'
                        }`}>
                          {user.isPremium ? 'Premium' : 'Free'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showTemplateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[95vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-4">
                {editingTemplate ? 'Edit Template' : 'Add New Template'}
              </h3>
              <form onSubmit={handleTemplateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={templateFormData.name}
                    onChange={handleTemplateInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={templateFormData.description}
                    onChange={handleTemplateInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Template Code (React JSX)</label>
                  <textarea
                    name="code"
                    value={templateFormData.code}
                    onChange={handleTemplateInputChange}
                    required
                    rows={15}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                    placeholder="Enter template React code..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Preview Image URL</label>
                  <input
                    type="text"
                    name="previewImage"
                    value={templateFormData.previewImage}
                    onChange={handleTemplateInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <select
                    name="category"
                    value={templateFormData.category}
                    onChange={handleTemplateInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="minimal">Minimal</option>
                    <option value="modern">Modern</option>
                    <option value="creative">Creative</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="templateIsActive"
                    checked={templateFormData.isActive}
                    onChange={handleTemplateInputChange}
                    className="rounded border-gray-600 bg-gray-700"
                  />
                  <label htmlFor="templateIsActive" className="text-sm text-gray-300">Active</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                  >
                    {editingTemplate ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showUserModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold text-white mb-4">Edit User</h3>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={userFormData.name}
                    onChange={handleUserInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={userFormData.email}
                    onChange={handleUserInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={userFormData.username}
                    onChange={handleUserInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                  <select
                    name="role"
                    value={userFormData.role}
                    onChange={handleUserInputChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPremium"
                    id="userIsPremium"
                    checked={userFormData.isPremium}
                    onChange={handleUserInputChange}
                    disabled={userFormData.role === 'admin'}
                    className="rounded border-gray-600 bg-gray-700 disabled:opacity-50"
                  />
                  <label htmlFor="userIsPremium" className={`text-sm ${userFormData.role === 'admin' ? 'text-gray-500' : 'text-gray-300'}`}>
                    {userFormData.role === 'admin' ? 'Premium (Admin has full access)' : 'Premium'}
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {deleteConfirm.show && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-white mb-2">Confirm Delete</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete {deleteConfirm.type === 'user' ? 'user' : 'template'}: <strong className="text-white">{deleteConfirm.name}</strong>?
                {deleteConfirm.type === 'user' && ' This will also delete their portfolio.'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm({ show: false, type: '', id: null, name: '' })}
                  className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;