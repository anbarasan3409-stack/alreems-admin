import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, BookOpen, Building, FileText, Users } from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import teacherServices from '@/services/teachers/teacherServices';
import { CourseService } from '@/services/courses/courseServices';

export default function EditSessionModal({ isOpen, onClose, onSubmit, session }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    teacher_id: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    maxStudents: 30,
    location: '',
    status: 'scheduled',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusOptions = ['scheduled', 'active', 'ongoing', 'completed', 'cancelled'];

  // Fetch teachers and courses when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [teachersResponse, coursesResponse] = await Promise.all([
        teacherServices.getAllTeachers(),
        CourseService.getAllCourses()
      ]);
      setTeachers(teachersResponse || []);
      setCourses(coursesResponse || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setTeachers([]);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Populate form with session data when session changes
  useEffect(() => {
    if (session && isOpen) {
      // Parse start_time (backend field) or scheduledDate
      const rawDate = session.start_time || session.scheduledDate || session.StartTime;
      const sessionDate = rawDate ? new Date(rawDate) : new Date();

      // Duration: compute from start_time/end_time if available
      let duration = session.duration || session.Duration || 60;
      const endRaw = session.end_time || session.EndTime;
      if (endRaw && rawDate) {
        const diffMs = new Date(endRaw) - new Date(rawDate);
        if (diffMs > 0) duration = Math.round(diffMs / 60000);
      }

      setFormData({
        title: session.title || session.Title || '',
        description: session.description || session.Description || '',
        course_id: String(session.course_id || session.CourseID || ''),
        teacher_id: String(session.teacher_id || session.TeacherID || ''),
        scheduledDate: sessionDate.toISOString().split('T')[0],
        scheduledTime: sessionDate.toTimeString().slice(0, 5),
        duration,
        maxStudents: session.max_students || session.maxStudents || session.MaxStudents || 30,
        location: session.location || session.Location || '',
        status: session.status || session.Status || 'scheduled',
      });
    }
  }, [session, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Session title is required';
    if (!formData.teacher_id) newErrors.teacher_id = 'Please select a teacher';
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Date is required';
    if (!formData.scheduledTime) newErrors.scheduledTime = 'Time is required';
    if (!formData.duration || formData.duration < 1) newErrors.duration = 'Duration must be greater than 0';
    if (!formData.maxStudents || formData.maxStudents < 1) newErrors.maxStudents = 'Max students must be at least 1';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const sessionData = {
        ...formData,
        scheduledDate: new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString(),
      };
      delete sessionData.scheduledTime;
      await onSubmit(sessionData);
    } catch (error) {
      console.error('Failed to update session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      course_id: '',
      teacher_id: '',
      scheduledDate: '',
      scheduledTime: '',
      duration: 60,
      maxStudents: 30,
      location: '',
      status: 'scheduled',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: COLORS.primary }}>
              Edit Session
            </h2>
            {session && (
              <p className="text-sm text-gray-500 mt-1">ID: {session.id}</p>
            )}
          </div>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-158px)]">
          {/* Session Details */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Session Details</h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-2" />
                  Session Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Advanced Mathematics - Calculus"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-900"
                  placeholder="Brief description of the session..."
                />
              </div>

              {/* Course and Teacher */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen size={16} className="inline mr-2" />
                    Course
                  </label>
                  <select
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${errors.course_id ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Course (Optional)</option>
                    {courses.map((course, index) => (
                      <option key={`course-${course.ID || index}`} value={String(course.ID)}>
                        {course.Name}
                      </option>
                    ))}
                  </select>
                  {errors.course_id && <p className="text-red-500 text-sm mt-1">{errors.course_id}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User size={16} className="inline mr-2" />
                    Teacher *
                  </label>
                  <select
                    name="teacher_id"
                    value={formData.teacher_id}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${errors.teacher_id ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher, index) => (
                      <option key={`teacher-${teacher.id || index}`} value={String(teacher.id)}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                  {errors.teacher_id && <p className="text-red-500 text-sm mt-1">{errors.teacher_id}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule & Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Schedule &amp; Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Date *
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${errors.scheduledDate ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.scheduledDate && <p className="text-red-500 text-sm mt-1">{errors.scheduledDate}</p>}
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock size={16} className="inline mr-2" />
                  Time *
                </label>
                <input
                  type="time"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${errors.scheduledTime ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.scheduledTime && <p className="text-red-500 text-sm mt-1">{errors.scheduledTime}</p>}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  max="300"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
              </div>

              {/* Max Students */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users size={16} className="inline mr-2" />
                  Max Students *
                </label>
                <input
                  type="number"
                  name="maxStudents"
                  value={formData.maxStudents}
                  onChange={handleInputChange}
                  min="1"
                  max="200"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-900 ${errors.maxStudents ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.maxStudents && <p className="text-red-500 text-sm mt-1">{errors.maxStudents}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building size={16} className="inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Room 101, Online"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-900"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-gray-900"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || loading}
            className="px-6 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: COLORS.secondary }}
          >
            {isSubmitting ? 'Updating...' : 'Update Session'}
          </button>
        </div>
      </div>
    </div>
  );
}
