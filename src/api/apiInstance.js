import axios from 'axios';

const apiInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api` || 'http://localhost:9000/api',
  withCredentials: true,
});

export const EndPoints ={
    ADMIN_PROFILE: '/admin/profile',
    ADMIN_PROFILE_UPDATE: '/admin/profile/update',
    LOGOUT: '/auth/admin/logout',
    REFRESH: '/auth/admin/refresh',
    
    // Admin endpoints
    ADMINS: '/admin/admins',
    ADMIN_BY_ID: (id) => `/admin/admins/${id}`,
    
    // Student endpoints
    STUDENTS: '/admin/students',
    STUDENT_BY_ID: (id) => `/admin/students/${id}`,
    STUDENTS_BY_COURSE: (courseId) => `/admin/students/course/${courseId}`,
    COURSES_BY_STUDENT: (studentId) => `/admin/courses/student/${studentId}`,
    STUDENTS_BY_TEACHER: (teacherId) => `/admin/students/teacher/${teacherId}`,
    STUDENTS_PROFILE_STATUS: '/admin/students/profile-status',
    STUDENT_PROFILE_STATUS: (id) => `/admin/students/${id}/profile-status`,
    
    // Teacher endpoints
    TEACHERS: '/admin/teachers',
    TEACHER_BY_ID: (id) => `/admin/teachers/${id}`,
    
    // Course endpoints
    COURSES: '/admin/courses',
    COURSE_BY_ID: (id) => `/admin/courses/${id}`,
    
    // Session endpoints
    SESSIONS: '/admin/sessions',
    SESSION_BY_ID: (id) => `/admin/sessions/${id}`,
    SESSION_ATTENDANCE: (sessionId) => `/admin/attendance/session/${sessionId}`,
    COURSE_ATTENDANCE: (courseId) => `/admin/attendance/course/${courseId}`,
    STUDENT_ATTENDANCE: (studentId) => `/admin/attendance/student/${studentId}`,
    
    // Payment endpoints
    PAYMENTS: '/admin/payments',
    
    // Settings endpoints
    SYSTEM_SETTINGS: '/admin/settings',
    PAYMENT_REMINDER_SEND_NOW: '/admin/settings/payment-reminder/send-now',
    PAYMENT_REMINDER_TEST: '/admin/settings/payment-reminder/test',
    LOGIN_ACTIVITIES: '/admin/login-activities',
    
    // Analytics endpoint
    ANALYTICS: '/admin/analytics',
    
    // Stats endpoint for dashboard
    STATS: '/admin/stats',

    // Enquiries endpoints
    ENQUIRIES: '/admin/enquiries',
    ENQUIRY_BY_ID_STATUS: (id) => `/admin/enquiries/${id}/status`,
    ENQUIRY_BY_ID: (id) => `/admin/enquiries/${id}`,

    // Export endpoints
    EXPORT_STUDENTS: '/admin/export/students',
    EXPORT_ENQUIRIES: '/admin/export/enquiries',

    // Feedback endpoints
    FEEDBACKS: '/admin/feedbacks',
    FEEDBACK_TOGGLE_FEATURED: (id) => `/admin/feedbacks/${id}/toggle-featured`,
    FEEDBACK_DELETE: (id) => `/admin/feedbacks/${id}`,

    // Public feedback endpoints (no auth)
    PUBLIC_SUBMIT_FEEDBACK: '/feedbacks',
    PUBLIC_TESTIMONIALS: '/feedbacks/testimonials',
}

export const apiEndpoints = EndPoints;

export default apiInstance;