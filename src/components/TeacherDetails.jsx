import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, BookOpen, Building, MapPin, Calendar, Award, Users, Clock, Star, ChevronLeft } from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import apiInstance, { EndPoints } from '@/api/apiInstance';

export default function TeacherDetails({ teacherId, onBack }) {
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (teacherId) {
      fetchTeacherDetails();
    }
  }, [teacherId]);

  const fetchTeacherDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch teacher details
      const teacherResponse = await apiInstance.get(EndPoints.TEACHER_BY_ID(teacherId));
      setTeacher(teacherResponse.data);

      // Fetch courses taught by this teacher
      const coursesResponse = await apiInstance.get(EndPoints.COURSES);
      const teacherCourses = (coursesResponse.data || []).filter(course => course.TeacherID === teacherId);
      setCourses(teacherCourses);

      // Fetch students taught by this teacher
      const studentsResponse = await apiInstance.get(EndPoints.STUDENTS_BY_TEACHER(teacherId));
      setStudents(studentsResponse.data || []);

    } catch (err) {
      console.error('Failed to fetch teacher details:', err);
      setError('Failed to load teacher details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} size={16} className="text-yellow-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" size={16} className="text-yellow-400 fill-current opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} size={16} className="text-gray-300" />
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: COLORS.secondary }}></div>
          <span className="ml-2 text-gray-900">Loading teacher details...</span>
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
            Back to Teachers List
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
          Back to Teachers List
        </button>
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>
          Teacher Details
        </h1>
        <p className="text-black">Detailed information about {teacher?.name}</p>
      </div>

      {teacher && (
        <div className="space-y-8">
          {/* Teacher Basic Information */}
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
                <Award size={20} style={{ color: COLORS.secondary }} />
                <div>
                  <p className="text-sm text-gray-600">Designation</p>
                  <p className="font-medium text-black">{teacher.designation}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={20} style={{ color: COLORS.secondary }} />
                <div>
                  <p className="text-sm text-gray-600">Joining Date</p>
                  <p className="font-medium text-black">{new Date(teacher.joiningDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={20} style={{ color: COLORS.secondary }} />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-black">{teacher.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Star size={20} style={{ color: COLORS.secondary }} />
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <div className="flex items-center gap-1">
                    {renderStars(teacher.rating || 0)}
                    <span className="font-medium ml-1 text-black">({teacher.rating || 0}/5.0)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Qualifications</p>
                <p className="font-medium text-black">{teacher.qualifications}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Experience</p>
                <p className="font-medium text-black">{teacher.experience} years</p>
              </div>
            </div>
          </div>

          {/* Courses Taught */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
              <BookOpen size={24} style={{ color: COLORS.secondary }} />
              Courses Taught ({courses.length})
            </h3>
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(course => (
                  <div key={course.ID} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-black truncate">{course.Name}</h4>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-2">
                        {course.Credits} credits
                      </span>
                    </div>
                    <p className="text-sm text-black mb-2">Code: {course.Code}</p>
                    {course.Description && (
                      <p className="text-sm text-black line-clamp-2">{course.Description}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-black">
                <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                <p>No courses assigned to this teacher yet.</p>
              </div>
            )}
          </div>

          {/* Students Enrolled */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
              <Users size={24} style={{ color: COLORS.secondary }} />
              Students ({students.length})
            </h3>
            {students.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
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
                          {student.courseName || 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            student.status === 'active' ? 'bg-green-100 text-green-700' :
                            student.status === 'inactive' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {student.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-black">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No students enrolled in this teacher's courses yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
