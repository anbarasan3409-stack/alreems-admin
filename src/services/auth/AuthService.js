import apiInstance, { EndPoints } from "@/api/apiInstance";

export const AuthService = {
  getAdminProfile: async () => {
    try {
      const response = await apiInstance.get(EndPoints.ADMIN_PROFILE);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
}; 

