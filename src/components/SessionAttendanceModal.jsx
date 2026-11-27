import { useState, useEffect, useCallback } from 'react';
import { X, Users, Clock, CheckCircle, Download, RefreshCw, Calendar } from 'lucide-react';
import apiInstance, { EndPoints } from '@/api/apiInstance';
import { COLORS } from '@/theme/themeConstants';

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

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

function getEffectiveDurationSeconds(record) {
  const saved = Number(record.duration_seconds) || 0;
  if (record.left_at) {
    if (saved > 0) return saved;
    if (record.joined_at) {
      return Math.max(0, Math.floor((new Date(record.left_at) - new Date(record.joined_at)) / 1000));
    }
    return 0;
  }
  // Still in session (no left_at yet)
  const startRef = saved > 0 && record.updated_at ? record.updated_at : (record.joined_at || record.created_at);
  if (startRef) {
    const liveElapsed = Math.max(0, Math.floor((Date.now() - new Date(startRef).getTime()) / 1000));
    return saved + liveElapsed;
  }
  return saved;
}

export default function SessionAttendanceModal({ isOpen, onClose, session }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttendance = useCallback(async () => {
    if (!session?.id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiInstance.get(EndPoints.SESSION_ATTENDANCE(session.id));
      const data = Array.isArray(response.data) ? response.data : [];
      setRecords(data);
    } catch (err) {
      console.error('Failed to fetch session attendance:', err);
      setError('Failed to load attendance report.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [session?.id]);

  useEffect(() => {
    if (isOpen && session?.id) {
      fetchAttendance();
    }
  }, [isOpen, session?.id, fetchAttendance]);

  if (!isOpen || !session) return null;

  const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
  const activeCount = records.filter(r => r.joined_at && !r.left_at).length;
  const avgDuration = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + getEffectiveDurationSeconds(r), 0) / records.length)
    : 0;

  const handleExportCSV = () => {
    const headers = ['Student ID', 'Student Name', 'Email', 'Phone', 'Grade', 'Status', 'Joined Time', 'Left Time', 'Total Time Spent'];
    const rows = records.map(r => {
      const s = r.student || {};
      const secs = getEffectiveDurationSeconds(r);
      return [
        r.student_id,
        s.name || s.Name || 'Unknown',
        s.email || s.Email || '',
        s.phoneNumber || s.PhoneNumber || '',
        s.grade || s.Grade || '',
        r.status || 'present',
        r.joined_at ? new Date(r.joined_at).toISOString() : '',
        r.left_at ? new Date(r.left_at).toISOString() : 'In Session',
        formatDuration(secs),
      ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-session-${session.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold" style={{ color: COLORS.primary }}>
              Session Attendance Report
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {session.title} {session.course ? `• ${session.course}` : ''} (ID: {session.id})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAttendance}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh attendance"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            {records.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Download size={15} />
                Export CSV
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Students Attended</p>
              <p className="text-lg font-bold text-gray-900">{presentCount}</p>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Currently In Session</p>
              <p className="text-lg font-bold text-gray-900">{activeCount}</p>
            </div>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg. Time Spent</p>
              <p className="text-lg font-bold text-gray-900">{formatDuration(avgDuration)}</p>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="py-12 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
              Loading attendance records...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-600">{error}</div>
          ) : records.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Calendar size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="font-medium text-gray-700">No attendance recorded yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Student join, leave, and duration details will appear here automatically when students join this session.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Student</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Joined Time</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Left Time</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Total Time Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {records.map((record) => {
                    const student = record.student || {};
                    const name = student.name || student.Name || `Student #${record.student_id}`;
                    const email = student.email || student.Email || '';
                    const phone = student.phoneNumber || student.PhoneNumber || '';
                    const grade = student.grade || student.Grade || '';
                    const secs = getEffectiveDurationSeconds(record);
                    const inSession = Boolean(record.joined_at && !record.left_at);

                    return (
                      <tr key={record.id || record.student_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{name}</div>
                          {email && <div className="text-xs text-gray-500">{email}</div>}
                          {(phone || grade) && (
                            <div className="text-xs text-gray-400">
                              {[phone, grade ? `Grade: ${grade}` : ''].filter(Boolean).join(' • ')}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            record.status === 'present'
                              ? 'bg-green-100 text-green-700'
                              : record.status === 'late'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                          }`}>
                            {record.status || 'present'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {formatDateTime(record.joined_at || record.created_at)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {inSession ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                              In Session
                            </span>
                          ) : (
                            <span className="text-gray-700">{formatDateTime(record.left_at)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          {formatDuration(secs)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
