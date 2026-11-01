import apiInstance, { EndPoints } from "@/api/apiInstance";

export const EnquiryService = {
  // Get all enquiries
  getAllEnquiries: async () => {
    try {
      const response = await apiInstance.get(EndPoints.ENQUIRIES);
      return response.data;
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      throw error;
    }
  },

  // Update enquiry status
  updateEnquiryStatus: async (enquiryId, status) => {
    try {
      const response = await apiInstance.put(EndPoints.ENQUIRY_BY_ID_STATUS(enquiryId), { status });
      return response.data;
    } catch (error) {
      console.error('Error updating enquiry status:', error);
      throw error;
    }
  },

  // Delete enquiry
  deleteEnquiry: async (enquiryId) => {
    try {
      const response = await apiInstance.delete(EndPoints.ENQUIRY_BY_ID(enquiryId));
      return response.data;
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      throw error;
    }
  }
};

export default EnquiryService;
