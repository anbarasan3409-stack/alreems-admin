import { useState, useEffect } from 'react';
import SettingsService from '@/services/settings/settingsService';
import ToastService from '@/utils/ToastService';

export const useSettings = () => {
  const [settings, setSettings] = useState({
    studentRegistrationEnabled: true,
    teacherRegistrationEnabled: true,
    enabled: false,
    scheduleType: 'monthly',
    dayOfMonth: 1,
    specificDate: '',
    sendHour: 9,
    sendMinute: 0,
    emailSubject: 'Payment Reminder: Upcoming Course Tuition Fee - Al Reems Academy',
    customMessage: '',
    lastRunAt: null,
    lastRunStatus: '',
    activeEnrollmentsCount: 0,
    activeStudentsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SettingsService.getSystemSettings();
      setSettings(data);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError('Failed to load settings. Please try again.');
      ToastService.error('Failed to load settings. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings) => {
    try {
      setLoading(true);
      const updatedSettings = await SettingsService.updateSystemSettings(newSettings);
      setSettings(updatedSettings);
      ToastService.success('Settings updated successfully!');
      return updatedSettings;
    } catch (err) {
      console.error('Failed to update settings:', err);
      ToastService.error('Failed to update settings. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentRegistration = async () => {
    const newValue = !settings.studentRegistrationEnabled;
    await updateSettings({
      ...settings,
      studentRegistrationEnabled: newValue,
    });
  };

  const toggleTeacherRegistration = async () => {
    const newValue = !settings.teacherRegistrationEnabled;
    await updateSettings({
      ...settings,
      teacherRegistrationEnabled: newValue,
    });
  };

  const triggerRemindersNow = async () => {
    try {
      setActionLoading(true);
      const res = await SettingsService.sendPaymentRemindersNow();
      ToastService.success(res.message || 'Payment reminders sent successfully!');
      await fetchSettings();
      return res;
    } catch (err) {
      const errMsg = err?.response?.data?.error || 'Failed to trigger payment reminders';
      ToastService.error(errMsg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const sendTestEmail = async (email) => {
    try {
      setActionLoading(true);
      const res = await SettingsService.sendTestPaymentReminder(email);
      ToastService.success(res.message || 'Test reminder sent successfully!');
      return res;
    } catch (err) {
      const errMsg = err?.response?.data?.error || 'Failed to send test email';
      ToastService.error(errMsg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    settings,
    loading,
    actionLoading,
    error,
    updateSettings,
    refetchSettings: fetchSettings,
    toggleStudentRegistration,
    toggleTeacherRegistration,
    triggerRemindersNow,
    sendTestEmail,
  };
};

export const useLoginActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const activitiesPerPage = 20;

  const fetchActivities = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data = await SettingsService.getLoginActivities(page, activitiesPerPage);
      setActivities(data.activities || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(page);
    } catch (err) {
      console.error('Failed to fetch login activities:', err);
      setError('Failed to load login activities. Please try again.');
      ToastService.error('Failed to load login activities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handlePageChange = (page) => {
    fetchActivities(page);
  };

  return {
    activities,
    loading,
    error,
    currentPage,
    totalPages,
    activitiesPerPage,
    fetchActivities,
    handlePageChange,
  };
};

export const useAdminProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    profilePicture: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedProfile = await SettingsService.updateAdminProfile(profileData);
      setProfile(updatedProfile);
      ToastService.success('Profile updated successfully!');
      return updatedProfile;
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
      ToastService.error('Failed to update profile. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    setProfile,
  };
};
