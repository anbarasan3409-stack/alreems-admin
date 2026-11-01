import apiInstance, { EndPoints } from "@/api/apiInstance";

export const StatsService = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      const response = await apiInstance.get(EndPoints.STATS);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
};

export default StatsService;
