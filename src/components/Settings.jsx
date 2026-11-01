'use client';
import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Shield,
  Save,
  Edit,
  Camera,
  RefreshCw,
  Trash2,
  Plus,
  X,
  BellRing
} from 'lucide-react';
import { useSettings, useAdminProfile } from '@/hooks/settingsHooks';
import { useAuth } from '@/context/AuthContext';
import ToastService from '@/utils/ToastService';
import { COLORS } from '@/theme/themeConstants';
import { AdminService } from '@/services/admins/adminService';
import StatsService from '@/services/stats/statsService';
import PaymentReminderSettings from '@/components/PaymentReminderSettings';

export default function Settings() {
  const { user } = useAuth();
  const {
    settings,
    loading: settingsLoading,
    actionLoading,
    updateSettings,
    toggleStudentRegistration,
    toggleTeacherRegistration,
    triggerRemindersNow,
    sendTestEmail
  } = useSettings();

  const {
    profile,
    loading: profileLoading,
    updateProfile,
    setProfile
  } = useAdminProfile();

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phoneNumber: '',
    address: '',
  });

  // Admin management state
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: ''
  });

  const [stats, setStats] = useState({ totalStudents: 0, totalTeachers: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch stats for profile tab
  useEffect(() => {
    if (activeTab === 'profile') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const data = await StatsService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Admin Profile', icon: UserCheck },
    { id: 'reminders', label: 'Payment Reminders', icon: BellRing },
    { id: 'admins', label: 'Admin Management', icon: Users },
  ];

  // Fetch all admins
  useEffect(() => {
    if (activeTab === 'admins') {
      fetchAdmins();
    }
  }, [activeTab]);

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const data = await AdminService.getAllAdmins();
      setAdmins(data);
    } catch (error) {
      ToastService.error('Failed to fetch admins');
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleAddAdmin = async () => {
    try {
      await AdminService.createAdmin(adminForm);
      ToastService.success('Admin added successfully!');
      setShowAddAdminModal(false);
      setAdminForm({ name: '', email: '', phoneNumber: '', address: '' });
      fetchAdmins();
    } catch (error) {
      ToastService.error('Failed to add admin');
    }
  };

  const handleEditAdmin = async () => {
    try {
      await AdminService.updateAdmin(selectedAdmin.ID, adminForm);
      ToastService.success('Admin updated successfully!');
      setSelectedAdmin(null);
      setShowAddAdminModal(false);
      setAdminForm({ name: '', email: '', phoneNumber: '', address: '' });
      fetchAdmins();
    } catch (error) {
      ToastService.error('Failed to update admin');
    }
  };

  const handleDeleteAdmin = async () => {
    try {
      await AdminService.deleteAdmin(selectedAdmin.ID);
      ToastService.success('Admin deleted successfully!');
      setShowDeleteModal(false);
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (error) {
      ToastService.error('Failed to delete admin');
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setAdminForm({
      name: admin.Name,
      email: admin.Email,
      phoneNumber: admin.PhoneNumber || '',
      address: admin.Address || ''
    });
    setShowAddAdminModal(true);
  };

  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowAddAdminModal(false);
    setShowDeleteModal(false);
    setSelectedAdmin(null);
    setAdminForm({ name: '', email: '', phoneNumber: '', address: '' });
  };

  const handleProfileUpdate = async () => {
    try {
      await updateProfile(profileForm);
      setIsEditingProfile(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleProfileCancel = () => {
    setProfileForm({
      name: user?.name || '',
      phoneNumber: '',
      address: '',
    });
    setIsEditingProfile(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (action) => {
    switch (action) {
      case 'login':
        return <div className="w-4 h-4 bg-green-500 rounded-full"></div>;
      case 'logout':
        return <div className="w-4 h-4 bg-gray-500 rounded-full"></div>;
      case 'failed_login':
        return <div className="w-4 h-4 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full"></div>;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>Settings</h1>
        <p className="text-gray-600">Manage admin profile, payment reminder schedulers, registrations, and administrators</p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white  text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Admin Profile */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-6" style={{ color: COLORS.primary }}>Registration Control</h2>

              {/* Student Registration */}
              <div className="flex items-center justify-between p-6 border border-gray-200 rounded-lg mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Student Registration</h3>
                    <p className="text-sm text-gray-600">Allow new students to register accounts</p>
                  </div>
                </div>
                <button
                  onClick={toggleStudentRegistration}
                  disabled={settingsLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.studentRegistrationEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.studentRegistrationEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* Teacher Registration */}
              <div className="flex items-center justify-between p-6 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Teacher Registration</h3>
                    <p className="text-sm text-gray-600">Allow new teachers to register accounts</p>
                  </div>
                </div>
                <button
                  onClick={toggleTeacherRegistration}
                  disabled={settingsLoading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.teacherRegistrationEnabled ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.teacherRegistrationEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            {/* Registration Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-900">
                      {loadingStats ? '...' : stats.totalStudents.toLocaleString()}
                    </p>
                    <p className="text-sm text-blue-700">Total Students</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-900">
                      {loadingStats ? '...' : stats.totalTeachers.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-700">Total Teachers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: COLORS.primary }}>Admin Profile</h2>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit size={16} />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                    {user?.name ? (
                      <span className="text-2xl font-bold text-gray-600">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    ) : (
                      <UserCheck className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  {isEditingProfile && (
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                      <Camera size={16} className="text-white" />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user?.name || 'Admin User'}</h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <p className="text-sm text-gray-500">Administrator</p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>
                    Full Name
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 text-gray-900">{user?.name || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>
                    Email Address
                  </label>
                  <p className="px-3 py-2 text-gray-500 bg-gray-50 rounded-lg">{user?.email || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>
                    Phone Number
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="tel"
                      value={profileForm.phoneNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  ) : (
                    <p className="px-3 py-2 text-gray-900">Not set</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text }}>
                    Address
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City, State, Country"
                    />
                  ) : (
                    <p className="px-3 py-2 text-gray-900">Not set</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isEditingProfile && (
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleProfileCancel}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProfileUpdate}
                    disabled={profileLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {profileLoading ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Reminders */}
        {activeTab === 'reminders' && (
          <PaymentReminderSettings
            settings={settings}
            loading={settingsLoading}
            actionLoading={actionLoading}
            updateSettings={updateSettings}
            triggerRemindersNow={triggerRemindersNow}
            sendTestEmail={sendTestEmail}
          />
        )}

        {/* Admin Management */}
        {activeTab === 'admins' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: COLORS.primary }}>Admin Management</h2>
              <button
                onClick={() => setShowAddAdminModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Add Admin
              </button>
            </div>

            {loadingAdmins ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw size={24} className="animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="space-y-4">
                {admins.map((admin) => (
                  <div key={admin.ID} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">
                          {admin.Name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{admin.Name}</h3>
                        <p className="text-sm text-gray-600">{admin.Email}</p>
                        {admin.PhoneNumber && (
                          <p className="text-xs text-gray-500">{admin.PhoneNumber}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(admin)}
                        disabled={admin.ID === user?.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={admin.ID === user?.id ? "You cannot delete yourself" : "Delete admin"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}

                {admins.length === 0 && (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No admins found</h3>
                    <p className="text-gray-500">Add your first admin to get started.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold" style={{ color: COLORS.primary }}>
                {selectedAdmin ? 'Edit Admin' : 'Add New Admin'}
              </h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-black font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Email</label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                  disabled={selectedAdmin !== null}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={adminForm.phoneNumber}
                  onChange={(e) => setAdminForm({ ...adminForm, phoneNumber: e.target.value })}
                  className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Address</label>
                <input
                  type="text"
                  value={adminForm.address}
                  onChange={(e) => setAdminForm({ ...adminForm, address: e.target.value })}
                  className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City, State, Country"
                />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={selectedAdmin ? handleEditAdmin : handleAddAdmin}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {selectedAdmin ? 'Update' : 'Add'} Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Admin</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{selectedAdmin.Name}</strong>? This will permanently remove their admin access.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAdmin}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
