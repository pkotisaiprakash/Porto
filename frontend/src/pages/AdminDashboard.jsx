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
  const [userSort, setUserSort] = useState('newest');
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
    .filter(u => u.role !== 'admin')
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
      if (userSort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      return 0;
    });

  const [recipientSearch, setRecipientSearch] = useState('');
  const [recipientSort, setRecipientSort] = useState('name');
  const [recipientFilter, setRecipientFilter] = useState('all');

  const filteredRecipients = users
    .filter(u => u.role !== 'admin')
    .filter(u => {
      if (recipientFilter === 'all') return true;
      if (recipientFilter === 'premium') return u.isPremium;
      if (recipientFilter === 'free') return !u.isPremium;
      return true;
    })
    .filter(u => 
      u.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(recipientSearch.toLowerCase())
    )
    .sort((a, b) => {
      if (recipientSort === 'name') return a.name.localeCompare(b.name);
      if (recipientSort === 'email') return a.email.localeCompare(b.email);
      if (recipientSort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
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
  
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [mailSending, setMailSending] = useState(false);
  const [mailSuccess, setMailSuccess] = useState('');
  const [mailError, setMailError] = useState('');
  const [mailTemplates, setMailTemplates] = useState([]);
  const [selectedMailTemplate, setSelectedMailTemplate] = useState('');
  const [mailForm, setMailForm] = useState({
    subject: '',
    body: '',
    footer: '',
    primaryColor: '#4f46e5',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    footerColor: '#6b7280'
  });

  const [mailHistory, setMailHistory] = useState([]);
  const [mailHistoryLoading, setMailHistoryLoading] = useState(false);
  const [mailHistoryPagination, setMailHistoryPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [mailSearch, setMailSearch] = useState('');
  const [mailStatusFilter, setMailStatusFilter] = useState('all');
  const [mailSort, setMailSort] = useState('newest');

  const [externalEmails, setExternalEmails] = useState('');

  useEffect(() => {
    fetchData();
    fetchMailTemplates();
  }, []);

  useEffect(() => {
    if (activeTab === 'mail') {
      const loadMailHistory = async () => {
        setMailHistoryLoading(true);
        try {
          const params = {
            page: mailHistoryPagination.page,
            limit: 10,
            search: mailSearch,
            status: mailStatusFilter,
            sort: mailSort
          };
          const response = await authAPI.getMailHistory(params);
          if (response.data && response.data.mails) {
            setMailHistory(response.data.mails);
            setMailHistoryPagination(response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
          }
        } catch (err) {
          console.error('Error fetching mail history:', err);
          setMailHistory([]);
        } finally {
          setMailHistoryLoading(false);
        }
      };
      loadMailHistory();
    }
  }, [activeTab, mailHistoryPagination.page, mailSearch, mailStatusFilter, mailSort]);

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

  const fetchMailTemplates = async () => {
    try {
      const response = await authAPI.getMailTemplates();
      setMailTemplates(response.data.templates);
    } catch (err) {
      console.error('Error fetching mail templates:', err);
    }
  };

  const fetchMailHistory = async () => {
    setMailHistoryLoading(true);
    try {
      const params = {
        page: mailHistoryPagination.page,
        limit: 10,
        search: mailSearch,
        status: mailStatusFilter,
        sort: mailSort
      };
      const response = await authAPI.getMailHistory(params);
      if (response.data && response.data.mails) {
        setMailHistory(response.data.mails);
        setMailHistoryPagination(response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (err) {
      console.error('Error fetching mail history:', err);
      setMailHistory([]);
    } finally {
      setMailHistoryLoading(false);
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
        <div className="flex items-center gap-6 mb-8">
          {avatar && <img src={avatar} alt={name} className="w-24 h-24 rounded-full object-cover" />}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
            <p className="text-xl text-gray-600">{title}</p>
          </div>
        </div>
        {bio && <p className="text-gray-700 mb-6">{bio}</p>}
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

  const handleMailTemplateSelect = (e) => {
    const templateId = e.target.value;
    setSelectedMailTemplate(templateId);
    
    if (templateId) {
      const template = mailTemplates.find(t => t.id === templateId);
      if (template) {
        setMailForm({
          subject: template.subject,
          body: template.body,
          footer: template.footer,
          primaryColor: template.style?.primaryColor || '#4f46e5',
          backgroundColor: template.style?.backgroundColor || '#ffffff',
          textColor: template.style?.textColor || '#1f2937',
          footerColor: template.style?.footerColor || '#6b7280'
        });
      }
    } else {
      setMailForm({
        subject: '',
        body: '',
        footer: '',
        primaryColor: '#4f46e5',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        footerColor: '#6b7280'
      });
    }
  };

  const handleMailInputChange = (e) => {
    const { name, value } = e.target;
    setMailForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSendMail = async (e) => {
    e.preventDefault();
    setMailSending(true);
    setMailSuccess('');
    setMailError('');
    try {
      const recipientIds = selectedUsers.length > 0 ? selectedUsers : null;
      const externalEmailsArray = externalEmails.split(',').map(e => e.trim()).filter(e => e);
      const response = await authAPI.sendBulkMail({
        recipientIds,
        externalEmails: externalEmailsArray,
        subject: mailForm.subject,
        body: mailForm.body,
        footer: mailForm.footer,
        style: {
          primaryColor: mailForm.primaryColor,
          backgroundColor: mailForm.backgroundColor,
          textColor: mailForm.textColor,
          footerColor: mailForm.footerColor
        },
        templateId: selectedMailTemplate || null
      });
      setMailSuccess(response.data.message);
      setMailForm({ subject: '', body: '', footer: '', primaryColor: '#4f46e5', backgroundColor: '#ffffff', textColor: '#1f2937', footerColor: '#6b7280' });
      setSelectedUsers([]);
      setSelectedMailTemplate('');
      setExternalEmails('');
      fetchMailHistory();
    } catch (err) {
      setMailError(err.response?.data?.message || 'Failed to send mail');
    } finally {
      setMailSending(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredRecipients.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredRecipients.map(u => u.id));
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
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
            <button
              onClick={() => setActiveTab('mail')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'mail'
                  ? 'border-cyan-500 text-cyan-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Send Mail
            </button>
          </nav>
        </div>

        {activeTab === 'templates' && (
          <div className="bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Added Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modified Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modified Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
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
                              ? 'bg-green-900/50 text-green-400'
                              : 'bg-red-900/50 text-red-400'
                          }`}
                        >
                          {template.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(template.createdAt)}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{formatTime(template.createdAt)}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(template.updatedAt)}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{formatTime(template.updatedAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="px-3 py-1 text-sm text-blue-400 hover:bg-blue-900/30 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template._id)}
                            className="px-3 py-1 text-sm text-red-400 hover:bg-red-900/30 rounded"
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
            <div className="px-6 py-4 border-b border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Sort by Name</option>
                  <option value="email">Sort by Email</option>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
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
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {formatDate(user.memberSince)}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {formatTime(user.memberSince)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="px-3 py-1 text-sm text-blue-400 hover:bg-blue-900/30 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="px-3 py-1 text-sm text-red-400 hover:bg-red-900/30 rounded"
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

        {activeTab === 'mail' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Select Recipients</h3>
                  <button
                    onClick={selectAllUsers}
                    className="text-sm text-cyan-400 hover:text-cyan-300"
                  >
                    {selectedUsers.length === filteredRecipients.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Search recipients..."
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    className="px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white flex-1 min-w-[120px]"
                  />
                  <select
                    value={recipientFilter}
                    onChange={(e) => setRecipientFilter(e.target.value)}
                    className="px-2 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white"
                  >
                    <option value="all">All</option>
                    <option value="premium">Premium</option>
                    <option value="free">Free</option>
                  </select>
                  <select
                    value={recipientSort}
                    onChange={(e) => setRecipientSort(e.target.value)}
                    className="px-2 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white"
                  >
                    <option value="name">Name</option>
                    <option value="email">Email</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>

                <p className="text-sm text-gray-400 mb-4">
                  {selectedUsers.length === 0 
                    ? `Select recipients below or add external emails` 
                    : `${selectedUsers.length} member${selectedUsers.length > 1 ? 's' : ''} selected`
                  }
                </p>

                <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                  {filteredRecipients.map(user => (
                    <label
                      key={user.id}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedUsers.includes(user.id)
                          ? 'bg-cyan-900/30 border border-cyan-500'
                          : 'bg-gray-700/50 border border-transparent hover:bg-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="sr-only"
                      />
                      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-medium mr-3">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      {selectedUsers.includes(user.id) && (
                        <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </label>
                  ))}
                </div>

                <div className="border-t border-gray-700 pt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">External Emails (new recipients)</label>
                  <input
                    type="text"
                    value={externalEmails}
                    onChange={(e) => setExternalEmails(e.target.value)}
                    placeholder="email1@example.com, email2@example.com"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple emails with commas</p>
                </div>
              </div>

              <div className="lg:col-span-2 bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Compose Mail</h3>
                
                {mailSuccess && (
                  <div className="mb-6 p-4 rounded-lg bg-green-900/30 border border-green-700 text-green-400">
                    {mailSuccess}
                  </div>
                )}
                
                {mailError && (
                  <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-700 text-red-400">
                    {mailError}
                  </div>
                )}

                <form onSubmit={handleSendMail} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Quick Template</label>
                    <select
                      value={selectedMailTemplate}
                      onChange={handleMailTemplateSelect}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Select a template (optional)</option>
                      {mailTemplates.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={mailForm.subject}
                      onChange={handleMailInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Enter subject..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Message Body (HTML supported)</label>
                    <textarea
                      name="body"
                      value={mailForm.body}
                      onChange={handleMailInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Enter your message..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Footer Text</label>
                    <input
                      type="text"
                      name="footer"
                      value={mailForm.footer}
                      onChange={handleMailInputChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Enter footer text (optional)..."
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Header Color</label>
                      <input
                        type="color"
                        name="primaryColor"
                        value={mailForm.primaryColor}
                        onChange={handleMailInputChange}
                        className="w-full h-12 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Background</label>
                      <input
                        type="color"
                        name="backgroundColor"
                        value={mailForm.backgroundColor}
                        onChange={handleMailInputChange}
                        className="w-full h-12 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Text Color</label>
                      <input
                        type="color"
                        name="textColor"
                        value={mailForm.textColor}
                        onChange={handleMailInputChange}
                        className="w-full h-12 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Footer Color</label>
                      <input
                        type="color"
                        name="footerColor"
                        value={mailForm.footerColor}
                        onChange={handleMailInputChange}
                        className="w-full h-12 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={mailSending}
                      className="w-full px-6 py-3 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {mailSending ? 'Sending...' : 'Send Mail'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Mail History</h3>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search mail history..."
                  value={mailSearch}
                  onChange={(e) => setMailSearch(e.target.value)}
                  className="px-4 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white"
                />
                <select
                  value={mailStatusFilter}
                  onChange={(e) => setMailStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white"
                >
                  <option value="all">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                </select>
                <select
                  value={mailSort}
                  onChange={(e) => setMailSort(e.target.value)}
                  className="px-4 py-2 border border-gray-600 rounded-lg text-sm bg-gray-700 text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="subject">Sort by Subject</option>
                  <option value="recipients">Most Recipients</option>
                </select>
              </div>

              {mailHistoryLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
                </div>
              ) : mailHistory.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No mail history found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emails</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent By</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {mailHistory.map((mail) => (
                        <tr key={mail.id}>
                          <td className="px-6 py-4 text-white">{mail.subject}</td>
                          <td className="px-6 py-4 text-gray-400">{mail.recipientCount} recipients</td>
                          <td className="px-6 py-4 text-gray-400 text-xs">
                            {mail.recipients?.map(r => r.email).join(', ')}
                            {mail.failedRecipients?.length > 0 && (
                              <span className="text-red-400 block mt-1">Failed: {mail.failedRecipients.join(', ')}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-400">{mail.sentBy?.name || 'Admin'}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(mail.createdAt)}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{formatTime(mail.createdAt)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              mail.status === 'sent'
                                ? 'bg-green-900/50 text-green-400'
                                : 'bg-red-900/50 text-red-400'
                            }`}>
                              {mail.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {mailHistoryPagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setMailHistoryPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={mailHistoryPagination.page === 1}
                    className="px-3 py-1 bg-gray-700 text-white rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-gray-400">
                    Page {mailHistoryPagination.page} of {mailHistoryPagination.pages}
                  </span>
                  <button
                    onClick={() => setMailHistoryPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={mailHistoryPagination.page === mailHistoryPagination.pages}
                    className="px-3 py-1 bg-gray-700 text-white rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
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