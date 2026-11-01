import apiInstance, { EndPoints } from "@/api/apiInstance";

export const StudentService = {
  // Get all students
  getAllStudents: async () => {
    try {
      const response = await apiInstance.get(EndPoints.STUDENTS);
      return response.data;
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  // Create student
  createStudent: async (studentData) => {
    try {
      const response = await apiInstance.post(EndPoints.STUDENTS, studentData);
      return response.data;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  // Get student by ID
  getStudentById: async (studentId) => {
    try {
      const response = await apiInstance.get(EndPoints.STUDENT_BY_ID(studentId));
      return response.data;
    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  },

  // Update student
  updateStudent: async (studentId, studentData) => {
    try {
      const response = await apiInstance.put(EndPoints.STUDENT_BY_ID(studentId), studentData);
      return response.data;
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  // Delete student
  deleteStudent: async (studentId) => {
    try {
      const response = await apiInstance.delete(EndPoints.STUDENT_BY_ID(studentId));
      return response.data;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  // Get students by course
  getStudentsByCourse: async (courseId) => {
    try {
      const response = await apiInstance.get(EndPoints.STUDENTS_BY_COURSE(courseId));
      return response.data;
    } catch (error) {
      console.error('Error fetching students by course:', error);
      throw error;
    }
  },

  // Get students by teacher
  getStudentsByTeacher: async (teacherId) => {
    try {
      const response = await apiInstance.get(EndPoints.STUDENTS_BY_TEACHER(teacherId));
      return response.data;
    } catch (error) {
      console.error('Error fetching students by teacher:', error);
      throw error;
    }
  }
};

export default StudentService;
