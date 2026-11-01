import { toast } from 'react-toastify';

export const ToastService = {
  // Success messages
  success: (message, options = {}) => {
    toast.success(message, {
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
  },

  // Error messages
  error: (message, options = {}) => {
    toast.error(message, {
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
  },

  // Warning messages
  warning: (message, options = {}) => {
    toast.warning(message, {
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
  },

  // Info messages
  info: (message, options = {}) => {
    toast.info(message, {
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
  },

  // Loading/Promise based toasts
  promise: (promise, messages = {}) => {
    const defaultMessages = {
      pending: 'Processing...',
      success: 'Success!',
      error: 'Something went wrong!'
    };

    const finalMessages = { ...defaultMessages, ...messages };

    return toast.promise(promise, {
      pending: finalMessages.pending,
      success: finalMessages.success,
      error: finalMessages.error
    });
  },

  // Dismiss all toasts
  dismissAll: () => {
    toast.dismiss();
  },

  // Dismiss specific toast
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  }
};

// Predefined messages for common actions
export const ToastMessages = {
  // Authentication
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGIN_ERROR: 'Login failed. Please try again.',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  LOGOUT_ERROR: 'Logout failed. Please try again.',

  // CRUD Operations
  CREATE_SUCCESS: (item) => `${item} created successfully!`,
  UPDATE_SUCCESS: (item) => `${item} updated successfully!`,
  DELETE_SUCCESS: (item) => `${item} deleted successfully!`,
  CREATE_ERROR: (item) => `Failed to create ${item}. Please try again.`,
  UPDATE_ERROR: (item) => `Failed to update ${item}. Please try again.`,
  DELETE_ERROR: (item) => `Failed to delete ${item}. Please try again.`,

  // Data Operations
  SAVE_SUCCESS: 'Changes saved successfully!',
  SAVE_ERROR: 'Failed to save changes. Please try again.',
  LOAD_ERROR: 'Failed to load data. Please refresh the page.',

  // Network
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',

  // Validation
  VALIDATION_ERROR: 'Please check your input and try again.',
  REQUIRED_FIELD: (field) => `${field} is required.`,
  INVALID_FORMAT: (field) => `${field} format is invalid.`,
};

export default ToastService;
