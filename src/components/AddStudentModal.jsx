import { useState } from 'react';
import { X, User, Mail, Phone, BookOpen, MapPin } from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';

export default function AddStudentModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    class: '',
    address: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (!formData.class.trim()) {
      newErrors.class = 'Class is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const success = await onSubmit(formData);
      
      if (success) {
        // Reset form
        setFormData({
          name: '',
          email: '',
          phoneNumber: '',
          class: '',
          address: '',
        });
        onClose();
      }
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white rounded-2xl w-full max-w-3xl my-8 relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: COLORS.text }}>Add New Student</h2>
            <p className="text-gray-500 text-sm mt-1">Enter student details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="addStudentForm" onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: COLORS.secondary }}>
                <User size={20} />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter student's full name"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-secondary focus:ring-secondary/20'
                    } focus:outline-none focus:ring-4 transition-all bg-gray-50/50 focus:bg-white text-gray-900 placeholder-gray-500`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="student@example.com"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-secondary focus:ring-secondary/20'
                      } focus:outline-none focus:ring-4 transition-all bg-gray-50/50 focus:bg-white text-gray-900 placeholder-gray-500`}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="+1 (234) 567-8900"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        errors.phoneNumber ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-secondary focus:ring-secondary/20'
                      } focus:outline-none focus:ring-4 transition-all bg-gray-50/50 focus:bg-white text-gray-900 placeholder-gray-500`}
                    />
                  </div>
                  {errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      placeholder="e.g. Grade 10"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        errors.class ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-secondary focus:ring-secondary/20'
                      } focus:outline-none focus:ring-4 transition-all bg-gray-50/50 focus:bg-white text-gray-900 placeholder-gray-500`}
                    />
                  </div>
                  {errors.class && <p className="mt-1 text-sm text-red-500">{errors.class}</p>}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: COLORS.secondary }}>
                <MapPin size={20} />
                Address
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter complete address"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-secondary focus:ring-4 focus:ring-secondary/20 focus:outline-none transition-all bg-gray-50/50 focus:bg-white resize-none text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50/80 rounded-b-2xl flex-shrink-0">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white hover: transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="addStudentForm"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg text-white font-medium hover:opacity-90 hover: transition-all disabled:opacity-70 flex items-center gap-2"
              style={{ background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.secondary})` }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Student'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
