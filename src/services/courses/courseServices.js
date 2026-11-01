import apiInstance, { EndPoints } from "@/api/apiInstance";

export const CourseService = {
  // Get all courses
  getAllCourses: async () => {
    try {
      const response = await apiInstance.get(EndPoints.COURSES);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get course by ID
  getCourseById: async (courseId) => {
    try {
      const response = await apiInstance.get(EndPoints.COURSE_BY_ID(courseId));
      return response.data;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  },

  getCourseStudents: async (courseId) => {
    try {
      const response = await apiInstance.get(EndPoints.STUDENTS_BY_COURSE(courseId));
      return response.data;
    } catch (error) {
      console.error('Error fetching course students:', error);
      return [];
    }
  },

  // Create new course
  createCourse: async (courseData) => {
    try {
      const response = await apiInstance.post(EndPoints.COURSES, courseData);
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  // Update course
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await apiInstance.put(EndPoints.COURSE_BY_ID(courseId), courseData);
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  // Delete course
  deleteCourse: async (courseId) => {
    try {
      const response = await apiInstance.delete(EndPoints.COURSE_BY_ID(courseId));
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  }
};

export default CourseService;
