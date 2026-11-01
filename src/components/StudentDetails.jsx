import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, BookOpen, Users, Clock, Star, ChevronLeft, GraduationCap } from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import apiInstance, { EndPoints } from '@/api/apiInstance';

export default function StudentDetails({ studentId, onBack }) {
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch student details
      const studentResponse = await apiInstance.get(EndPoints.STUDENT_BY_ID(studentId));
      setStudent(studentResponse.data);

      // Fetch courses enrolled by this student
      const coursesResponse = await apiInstance.get(EndPoints.COURSES_BY_STUDENT(studentId));
      setCourses(coursesResponse.data || []);

    } catch (err) {
      console.error('Failed to fetch student details:', err);
      setError('Failed to load student details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: COLORS.secondary }}></div>
          <span className="ml-2 text-black">Loading student details...</span>
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
            Back to Students List
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
          Back to Students List
        </button>
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>
          Student Details
        </h1>
        <p className="text-black">Detailed information about {student?.name}</p>
      </div>

      {student && (
        <div className="space-y-8">
          {/* Student Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
              <User size={24} style={{ color: COLORS.secondary }} />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <User size={20} style={{ color: COLORS.secondary }} />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium text-black">{student.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={20} style={{ color: COLORS.secondary }} />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-black">{student.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} style={{ color: COLORS.secondary }} />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-black">{student.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={20} style={{ color: COLORS.secondary }} />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-black">{student.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={20} style={{ color: COLORS.secondary }} />
                <div>
                  <p className="text-sm text-gray-600">Joined Date</p>
                  <p className="font-medium text-black">{new Date(student.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={20} style={{ color: COLORS.secondary }} />
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="font-medium text-black">
                    {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : 'Never logged in'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Enrolled */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
              <BookOpen size={24} style={{ color: COLORS.secondary }} />
              Courses Enrolled ({courses.length})
            </h3>
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(course => (
                  <div key={course.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-black truncate">{course.name}</h4>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-2">
                        {course.credits} credits
                      </span>
                    </div>
                    <p className="text-sm text-black mb-2">Code: {course.code}</p>
                    <p className="text-sm text-black mb-2">Teacher: {course.teacherName}</p>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Enrolled: {new Date(course.enrollmentDate).toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded-full ${
                        course.status === 'active' ? 'bg-green-100 text-green-700' :
                        course.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        course.status === 'dropped' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-black">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p>No courses enrolled by this student yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
