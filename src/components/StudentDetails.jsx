import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, BookOpen, Users, Clock, Star, ChevronLeft, GraduationCap, X } from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import apiInstance, { EndPoints } from '@/api/apiInstance';

function formatDuration(seconds) {
  const total = Math.max(0, Number(seconds) || 0);
  if (total === 0) return '0s';
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = Math.floor(total % 60);
  const parts = [];
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0) parts.push(`${mins}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  return parts.join(' ');
}

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function StudentDetails({ studentId, onBack }) {
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [studentAttendances, setStudentAttendances] = useState([]);
  const [selectedCourseForAttendance, setSelectedCourseForAttendance] = useState(null);
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
      // Fetch student details, enrolled courses, and attendance records
      const [studentResponse, coursesResponse, attendanceResponse] = await Promise.all([
        apiInstance.get(EndPoints.STUDENT_BY_ID(studentId)),
        apiInstance.get(EndPoints.COURSES_BY_STUDENT(studentId)),
        apiInstance.get(EndPoints.STUDENT_ATTENDANCE(studentId)).catch(() => ({ data: [] }))
      ]);
      setStudent(studentResponse.data);
      setCourses(coursesResponse.data || []);
      setStudentAttendances(Array.isArray(attendanceResponse.data) ? attendanceResponse.data : []);

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
                {courses.map(course => {
                  const courseRecords = studentAttendances.filter(a => {
                    const cid = a.session?.course_id ?? a.session?.CourseID;
                    return cid != null && Number(cid) === Number(course.id);
                  });
                  const attendedCount = courseRecords.filter(a => a.status === 'present' || a.status === 'late').length;
                  const totalSecs = courseRecords.reduce((sum, a) => sum + (Number(a.duration_seconds) || 0), 0);

                  return (
                  <div
                    key={course.id}
                    onClick={() => setSelectedCourseForAttendance(course)}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                    title="Click to view session-by-session attendance"
                  >
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
                    <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Attendance</span>
                      <span className="font-semibold text-indigo-700">
                        {attendedCount} {attendedCount === 1 ? 'session' : 'sessions'}
                        {totalSecs > 0 ? ` • ${formatDuration(totalSecs)}` : ''}
                      </span>
                    </div>
                  </div>
                );
                })}
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

      {/* Individual Course Attendance Modal for this Student */}
      {selectedCourseForAttendance && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedCourseForAttendance.name} — Attendance
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Student: {student?.name} ({student?.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedCourseForAttendance(null)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              {(() => {
                const records = studentAttendances.filter(a => {
                  const cid = a.session?.course_id ?? a.session?.CourseID;
                  return cid != null && Number(cid) === Number(selectedCourseForAttendance.id);
                });
                if (records.length === 0) {
                  return (
                    <div className="py-10 text-center text-gray-500 text-sm">
                      No session attendance recorded for this course yet.
                    </div>
                  );
                }
                return (
                  <div className="overflow-x-auto border border-gray-200 rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Session</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Status</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Joined Time</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Left Time</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Total Time Spent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {records.map(r => (
                          <tr key={r.id}>
                            <td className="px-4 py-2.5 font-medium text-gray-900">
                              {r.session?.title || `Session #${r.session_id}`}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 capitalize">
                                {r.status || 'present'}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">
                              {formatDateTime(r.joined_at || r.created_at)}
                            </td>
                            <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">
                              {r.joined_at && !r.left_at ? 'In Session' : formatDateTime(r.left_at)}
                            </td>
                            <td className="px-4 py-2.5 font-medium text-gray-900 whitespace-nowrap">
                              {formatDuration(r.duration_seconds)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
