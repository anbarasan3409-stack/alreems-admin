import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, BookOpen, Building, MapPin, Calendar, Award, Users, Clock, Star, ChevronLeft, GraduationCap } from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import apiInstance, { EndPoints } from '@/api/apiInstance';

export default function CourseDetails({ courseId, onBack }) {
  const [course, setCourse] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch course details
      const courseResponse = await apiInstance.get(EndPoints.COURSE_BY_ID(courseId));
      setCourse(courseResponse.data);

      // Fetch teacher details
      if (courseResponse.data.TeacherID) {
        const teacherResponse = await apiInstance.get(EndPoints.TEACHER_BY_ID(courseResponse.data.TeacherID));
        setTeacher(teacherResponse.data);
      }

      // Fetch students enrolled in this course
      const studentsResponse = await apiInstance.get(EndPoints.STUDENTS_BY_COURSE(courseId));
      setStudents(studentsResponse.data || []);

    } catch (err) {
      console.error('Failed to fetch course details:', err);
      setError('Failed to load course details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: COLORS.secondary }}></div>
          <span className="ml-2 text-black">Loading course details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <ArrowLeft size={48} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Details</h3>
          <p className="text-gray-700">{error}</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Back to Courses List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header with Back Button */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-900 hover:text-black hover:bg-gray-100 rounded-lg transition-colors mb-4"
        >
          <ChevronLeft size={20} />
          Back to Courses List
        </button>
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>
          Course Details
        </h1>
        <p className="text-black">Detailed information about {course?.Name}</p>
      </div>

      {course && (
        <div className="space-y-8">
          {/* Course Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
              <BookOpen size={24} style={{ color: COLORS.secondary }} />
              Course Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <BookOpen size={20} style={{ color: COLORS.secondary }} />
                <div>
                  <p className="text-sm text-gray-600">Course Name</p>
                  <p className="font-medium text-black">{course.Name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <GraduationCap size={20} style={{ color: COLORS.secondary }} />
                <div>
                  <p className="text-sm text-gray-600">Course Code</p>
                  <p className="font-medium text-black">{course.Code}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={20} style={{ color: COLORS.secondary }} />
                <div>
                  <p className="text-sm text-gray-600">Created At</p>
                  <p className="font-medium text-black">{new Date(course.CreatedAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award size={20} style={{ color: COLORS.secondary }} />
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="font-medium text-emerald-600">AED {course.Price || 0} / month</p>
                </div>
              </div>
            </div>
            {course.Description && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="font-medium text-black">{course.Description}</p>
              </div>
            )}
          </div>

          {/* Teacher Information */}
          {teacher && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
                <User size={24} style={{ color: COLORS.secondary }} />
                Course Teacher
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <User size={20} style={{ color: COLORS.secondary }} />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-black">{teacher.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={20} style={{ color: COLORS.secondary }} />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-black">{teacher.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={20} style={{ color: COLORS.secondary }} />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-black">{teacher.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen size={20} style={{ color: COLORS.secondary }} />
                  <div>
                    <p className="text-sm text-gray-600">Subject</p>
                    <p className="font-medium text-black">{teacher.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building size={20} style={{ color: COLORS.secondary }} />
                  <div>
                    <p className="text-sm text-gray-600">Department</p>
                    <p className="font-medium text-black">{teacher.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Star size={20} style={{ color: COLORS.secondary }} />
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-black">({teacher.rating || 0}/5.0)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Students Enrolled */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
              <Users size={24} style={{ color: COLORS.secondary }} />
              Enrolled Students ({students.length})
            </h3>
            {students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Enrollment Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map(student => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-xs font-medium text-blue-700">
                                {student.name?.charAt(0)?.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-black">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-black">{student.email}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-black">
                          {new Date(student.enrollmentDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            student.status === 'active' ? 'bg-green-100 text-green-700' :
                            student.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            student.status === 'dropped' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {student.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-black">
                          {student.progress || 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-black">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No students enrolled in this course yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
