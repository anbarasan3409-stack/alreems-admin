import { useState, useEffect } from 'react';
import { X, User, BookOpen, Banknote, Calendar, CreditCard, Hash, CheckCircle, AlertCircle } from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import { StudentService } from '@/services/students/studentServices';
import { CourseService } from '@/services/courses/courseServices';

export default function AddPaymentModal({ isOpen, onClose, onSubmit }) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    amount: '',
    method: 'Cash',
    status: 'completed',
    paymentDate: today,
    transactionId: '',
  });

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchOptions = async () => {
      try {
        setLoadingData(true);
        const [studentsData, coursesData] = await Promise.all([
          StudentService.getAllStudents().catch(() => []),
          CourseService.getAllCourses().catch(() => []),
        ]);
        if (isMounted) {
          setStudents(Array.isArray(studentsData) ? studentsData : []);
          setCourses(Array.isArray(coursesData) ? coursesData : []);
        }
      } catch (err) {
        console.error('Failed to load students or courses for payment modal:', err);
      } finally {
        if (isMounted) {
          setLoadingData(false);
        }
      }
    };

    fetchOptions();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    const selectedCourse = courses.find(c => String(c.ID || c.id) === String(courseId));
    const cPrice = selectedCourse ? (selectedCourse.Price !== undefined ? selectedCourse.Price : selectedCourse.price) : undefined;

    setFormData(prev => ({
      ...prev,
      courseId,
      amount: cPrice !== undefined && cPrice !== null && cPrice !== '' ? String(cPrice) : prev.amount
    }));

    if (errors.courseId) {
      setErrors(prev => ({ ...prev, courseId: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.studentId) {
      newErrors.studentId = 'Please select a student';
    }

    if (!formData.courseId) {
      newErrors.courseId = 'Please select a course';
    }

    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) < 0) {
      newErrors.amount = 'Please enter a valid amount (0 or greater)';
    }

    if (!formData.method) {
      newErrors.method = 'Payment method is required';
    }

    if (!formData.status) {
      newErrors.status = 'Payment status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        studentId: Number(formData.studentId),
        courseId: Number(formData.courseId),
        amount: parseFloat(formData.amount),
        method: formData.method,
        status: formData.status,
        paymentDate: formData.paymentDate || today,
        transactionId: formData.transactionId.trim() || undefined,
      };

      const success = await onSubmit(payload);
      if (success) {
        setFormData({
          studentId: '',
          courseId: '',
          amount: '',
          method: 'Cash',
          status: 'completed',
          paymentDate: today,
          transactionId: '',
        });
        setErrors({});
        onClose();
      }
    } catch (error) {
      console.error('Failed to submit payment record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl my-8 relative flex flex-col max-h-[90vh] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: COLORS.text }}>Add Payment Record</h2>
            <p className="text-gray-500 text-sm mt-1">Manually record a payment transaction for a student</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4">
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <User size={16} className="text-gray-500" />
                  Student *
                </span>
              </label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                disabled={loadingData}
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 bg-white ${
                  errors.studentId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">{loadingData ? 'Loading students...' : 'Select a student'}</option>
                {students.map((student) => {
                  const sId = student.ID || student.id;
                  const sName = student.Name || student.name || 'Student';
                  const sEmail = student.Email || student.email || '';
                  const emailPart = sEmail ? ` (${sEmail})` : '';
                  return (
                    <option key={sId} value={sId}>
                      {sName}{emailPart} - ID #{sId}
                    </option>
                  );
                })}
              </select>
              {errors.studentId && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.studentId}
                </p>
              )}
            </div>

            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={16} className="text-gray-500" />
                  Course *
                </span>
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleCourseChange}
                disabled={loadingData}
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 bg-white ${
                  errors.courseId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">{loadingData ? 'Loading courses...' : 'Select a course'}</option>
                {courses.map((course) => {
                  const cId = course.ID || course.id;
                  const cName = course.Name || course.name || 'Unnamed Course';
                  const cCode = course.Code || course.code || '';
                  const cPrice = course.Price !== undefined ? course.Price : course.price;
                  const codePart = cCode ? ` (${cCode})` : '';
                  const pricePart = cPrice !== undefined && cPrice !== null && cPrice !== '' ? ` - ${cPrice} AED` : '';
                  return (
                    <option key={cId} value={cId}>
                      {cName}{codePart}{pricePart}
                    </option>
                  );
                })}
              </select>
              {errors.courseId && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.courseId}
                </p>
              )}
            </div>

            {/* Amount & Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Banknote size={16} className="text-gray-500" />
                    Amount (AED) *
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="amount"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className={`w-full pl-3 pr-14 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 pointer-events-none">
                    AED
                  </span>
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.amount}
                  </p>
                )}
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-gray-500" />
                    Payment Date *
                  </span>
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 bg-white"
                />
              </div>
            </div>

            {/* Payment Method & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <CreditCard size={16} className="text-gray-500" />
                    Payment Method *
                  </span>
                </label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Stripe">Stripe</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={16} className="text-gray-500" />
                    Status *
                  </span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Transaction / Reference ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <span className="flex items-center gap-1.5">
                  <Hash size={16} className="text-gray-500" />
                  Transaction / Reference ID (Optional)
                </span>
              </label>
              <input
                type="text"
                name="transactionId"
                placeholder="Leave blank to auto-generate (e.g. MANUAL-...)"
                value={formData.transactionId}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 placeholder-gray-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Receipt number, bank transfer reference, or cheque number
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-sm"
              style={{ background: `linear-gradient(to right, ${COLORS.primary}, ${COLORS.secondary})` }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <span>Add Record</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
