import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, BookOpen, Building, MapPin, Calendar, Award, Users, Clock, Star, ChevronLeft, GraduationCap, X } from 'lucide-react';
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

export default function CourseDetails({ courseId, onBack }) {
  const [course, setCourse] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [students, setStudents] = useState([]);
  const [courseAttendances, setCourseAttendances] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [selectedStudentForAttendance, setSelectedStudentForAttendance] = useState(null);
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

      // Fetch students enrolled in this course and course attendance in parallel
      const [studentsResponse, attendanceResponse] = await Promise.all([
        apiInstance.get(EndPoints.STUDENTS_BY_COURSE(courseId)),
        apiInstance.get(EndPoints.COURSE_ATTENDANCE(courseId)).catch(() => ({ data: { total_sessions: 0, attendances: [] } }))
      ]);
      setStudents(studentsResponse.data || []);
      setTotalSessions(attendanceResponse.data?.total_sessions || 0);
      setCourseAttendances(Array.isArray(attendanceResponse.data?.attendances) ? attendanceResponse.data.attendances : []);

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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map(student => {
                      const studentRecords = courseAttendances.filter(a => Number(a.student_id) === Number(student.id));
                      const attendedCount = studentRecords.filter(a => a.status === 'present' || a.status === 'late').length;
                      const pct = totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100) : 0;
                      const totalSecs = studentRecords.reduce((sum, a) => sum + (Number(a.duration_seconds) || 0), 0);

                      return (
                      <tr
                        key={student.id}
                        onClick={() => setSelectedStudentForAttendance(student)}
                        className="hover:bg-gray-50 cursor-pointer"
                        title="Click to view session-by-session attendance"
                      >
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
                          <span className="font-medium">{attendedCount}/{totalSessions}</span>
                          <span className="text-xs text-gray-500 ml-1">({pct}%)</span>
                          {totalSecs > 0 && (
                            <span className="text-xs text-indigo-600 ml-2">• {formatDuration(totalSecs)}</span>
                          )}
                        </td>
                      </tr>
                    );
                    })}
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

      {/* Individual Student Attendance Modal for this Course */}
      {selectedStudentForAttendance && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedStudentForAttendance.name} — Attendance
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {course?.Name} • {selectedStudentForAttendance.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForAttendance(null)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-5">
              {(() => {
                const records = courseAttendances.filter(
                  a => Number(a.student_id) === Number(selectedStudentForAttendance.id)
                );
                if (records.length === 0) {
                  return (
                    <div className="py-10 text-center text-gray-500 text-sm">
                      No attendance recorded for this student in this course yet.
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
                          <th className="px-4 py-2.5 text-left font-semibold text-gray-700">Time Spent</th>
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
