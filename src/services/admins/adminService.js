import apiInstance, { EndPoints } from "@/api/apiInstance";

export const AdminService = {
  // Get all admins
  getAllAdmins: async () => {
    try {
      const response = await apiInstance.get(EndPoints.ADMINS);
      return response.data;
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error;
    }
  },

  // Get admin by ID
  getAdminById: async (adminId) => {
    try {
      const response = await apiInstance.get(EndPoints.ADMIN_BY_ID(adminId));
      return response.data;
    } catch (error) {
      console.error('Error fetching admin:', error);
      throw error;
    }
  },

  // Create admin
  createAdmin: async (adminData) => {
    try {
      const response = await apiInstance.post(EndPoints.ADMINS, adminData);
      return response.data;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  },

  // Update admin
  updateAdmin: async (adminId, adminData) => {
    try {
      const response = await apiInstance.put(EndPoints.ADMIN_BY_ID(adminId), adminData);
      return response.data;
    } catch (error) {
      console.error('Error updating admin:', error);
      throw error;
    }
  },

  // Delete admin
  deleteAdmin: async (adminId) => {
    try {
      const response = await apiInstance.delete(EndPoints.ADMIN_BY_ID(adminId));
      return response.data;
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw error;
    }
  }
};

export default AdminService;
