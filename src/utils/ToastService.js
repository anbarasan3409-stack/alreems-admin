import { toast } from 'react-toastify';

// Predefined toast messages
export const ToastMessages = {
  // Authentication messages
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  LOGOUT_ERROR: 'Logout failed. Please try again.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  TOKEN_REFRESH_FAILED: 'Failed to refresh session. Please login again.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',

  // General messages
  SUCCESS: 'Operation completed successfully!',
  ERROR: 'An error occurred. Please try again.',
  WARNING: 'Warning: Please check your input.',
  INFO: 'Information updated.',

  // Student management
  STUDENT_ADDED: 'Student added successfully!',
  STUDENT_UPDATED: 'Student information updated!',
  STUDENT_DELETED: 'Student removed successfully!',
  STUDENT_NOT_FOUND: 'Student not found.',

  // Teacher management
  TEACHER_ADDED: 'Teacher added successfully!',
  TEACHER_UPDATED: 'Teacher information updated!',
  TEACHER_DELETED: 'Teacher removed successfully!',
  TEACHER_NOT_FOUND: 'Teacher not found.',

  // Course management
  COURSE_ADDED: 'Course added successfully!',
  COURSE_UPDATED: 'Course information updated!',
  COURSE_DELETED: 'Course removed successfully!',
  COURSE_NOT_FOUND: 'Course not found.',

  // Network/API messages
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
};

// Toast service class with utility methods
class ToastService {
  // Success toast
  static success(message, options = {}) {
    return toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      ...options
    });
  }

  // Error toast
  static error(message, options = {}) {
    return toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      ...options
    });
  }

  // Warning toast
  static warning(message, options = {}) {
    return toast.warning(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      ...options
    });
  }

  // Info toast
  static info(message, options = {}) {
    return toast.info(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      ...options
    });
  }

  // Promise-based toast for async operations
  static promise(promise, messages = {}) {
    const defaultMessages = {
      pending: 'Processing...',
      success: 'Operation completed successfully!',
      error: 'Operation failed. Please try again.',
      ...messages
    };

    return toast.promise(promise, {
      pending: defaultMessages.pending,
      success: defaultMessages.success,
      error: defaultMessages.error,
    }, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  }

  // Dismiss all toasts
  static dismissAll() {
    toast.dismiss();
  }

  // Dismiss specific toast by ID
  static dismiss(toastId) {
    toast.dismiss(toastId);
  }

  // Update existing toast
  static update(toastId, options) {
    toast.update(toastId, options);
  }
}

export default ToastService;
