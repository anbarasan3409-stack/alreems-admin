import apiInstance, { EndPoints } from "@/api/apiInstance";

const apiEndpoints = EndPoints;

const teacherServices = {
  getAllTeachers: async () => {
    try {
      const response = await apiInstance.get(apiEndpoints.TEACHERS);
      return response.data;
    } catch (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }
  },

  getTeacherById: async (id) => {
    try {
      const response = await apiInstance.get(apiEndpoints.TEACHER_BY_ID(id));
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher by ID:', error);
      throw error;
    }
  },

  createTeacher: async (teacherData) => {
    try {
      const response = await apiInstance.post(apiEndpoints.TEACHERS, teacherData);
      return response.data;
    } catch (error) {
      console.error('Error creating teacher:', error);
      throw error;
    }
  },

  updateTeacher: async (id, teacherData) => {
    try {
      const response = await apiInstance.put(apiEndpoints.TEACHER_BY_ID(id), teacherData);
      return response.data;
    } catch (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }
  },

  deleteTeacher: async (id) => {
    try {
      const response = await apiInstance.delete(apiEndpoints.TEACHER_BY_ID(id));
      return response.data;
    } catch (error) {
      console.error('Error deleting teacher:', error);
      throw error;
    }
  },
};

export { teacherServices };
export default teacherServices;
