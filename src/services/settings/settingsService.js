import apiInstance, { EndPoints } from "@/api/apiInstance";

export const SettingsService = {
  // Get system settings
  getSystemSettings: async () => {
    try {
      const response = await apiInstance.get(EndPoints.SYSTEM_SETTINGS);
      return response.data;
    } catch (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }
  },

  // Update system settings
  updateSystemSettings: async (settings) => {
    try {
      const response = await apiInstance.put(EndPoints.SYSTEM_SETTINGS, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }
  },

  // Trigger payment reminders immediately for all enrolled students
  sendPaymentRemindersNow: async () => {
    try {
      const response = await apiInstance.post(EndPoints.PAYMENT_REMINDER_SEND_NOW);
      return response.data;
    } catch (error) {
      console.error('Error sending payment reminders:', error);
      throw error;
    }
  },

  // Send preview test payment reminder email
  sendTestPaymentReminder: async (email) => {
    try {
      const response = await apiInstance.post(EndPoints.PAYMENT_REMINDER_TEST, { email });
      return response.data;
    } catch (error) {
      console.error('Error sending test payment reminder:', error);
      throw error;
    }
  },

  // Get login activities
  getLoginActivities: async (page = 1, limit = 20) => {
    try {
      const response = await apiInstance.get(`${EndPoints.LOGIN_ACTIVITIES}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching login activities:', error);
      throw error;
    }
  },

  // Update admin profile
  updateAdminProfile: async (profileData) => {
    try {
      const response = await apiInstance.put(EndPoints.ADMIN_PROFILE_UPDATE, profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating admin profile:', error);
      throw error;
    }
  }
};

export default SettingsService;
