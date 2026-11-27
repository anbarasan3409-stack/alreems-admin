import { useState } from 'react';
import { Play, Calendar, Clock, Users, Video, Plus, ChevronRight, Download, ExternalLink, BookOpen, TrendingUp, CheckCircle, X, Zap, Eye, Edit, Trash2, User, FileText, ClipboardList } from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import AddSessionModal from './AddSessionModal';
import EditSessionModal from './EditSessionModal';
import ConfirmationModal from './ConfirmationModal';
import SessionAttendanceModal from './SessionAttendanceModal';
import { useSessionManagement } from '@/hooks/sessionHooks';

export default function SessionManagement() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [attendanceSession, setAttendanceSession] = useState(null);
  
  const {
    sessions,
    upcomingSessions,
    pastSessions,
    loading,
    error,
    isAddModalOpen,
    isEditModalOpen,
    selectedSession,
    isDeleteModalOpen,
    sessionToDelete,
    handleAddSession,
    handleEditSession,
    handleDeleteSession,
    handleStartSession,
    handleEndSession,
    openAddModal,
    closeAddModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    getStatusColor,
    formatDate,
    formatTime,
  } = useSessionManagement();

  // Generate letter avatar from teacher name
  const getLetterAvatar = (name) => {
    if (!name) return 'T';
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Generate consistent color for each teacher based on their name
  const getAvatarColor = (name) => {
    const colors = [
      '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', 
      '#EF4444', '#06B6D4', '#84CC16', '#F97316',
      '#6366F1', '#EC4899', '#14B8A6', '#F59E0B'
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const statsCards = [
    {
      title: 'Total Sessions',
      value: sessions.length.toString(),
      icon: BookOpen,
      color: COLORS.secondary,
      change: `+${upcomingSessions.length} upcoming`,
      changeType: 'positive'
    },
    {
      title: 'Upcoming Sessions',
      value: upcomingSessions.length.toString(),
      icon: Calendar,
      color: COLORS.primary,
      change: 'Scheduled',
      changeType: 'neutral'
    },
    {
      title: 'Past Sessions',
      value: pastSessions.length.toString(),
      icon: Video,
      color: '#4CAF50',
      change: 'Completed',
      changeType: 'neutral'
    },
    {
      title: 'Session Recordings',
      value: pastSessions.filter(s => s.recordingUrl).length.toString(),
      icon: Play,
      color: '#FF9800',
      change: 'Available',
      changeType: 'neutral'
    }
  ];

  const handleJoinSession = (sessionId) => {
    handleStartSession(sessionId);
  };

  const handleViewSessionDetails = (sessionId) => {

  };

  const handleDownloadRecording = (recordingUrl) => {
    if (recordingUrl) {
      window.open(recordingUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>Session Management</h1>
        <p className="text-gray-600">Monitor and manage all teaching sessions across the platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon size={24} style={{ color: stat.color }} />
                </div>
                <span
                  className={`text-sm font-medium px-2 py-1 rounded-full ${
                    stat.changeType === 'positive' ? 'bg-green-100 text-green-700' :
                    stat.changeType === 'negative' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold mb-1" style={{ color: COLORS.text }}>{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'upcoming'
                  ? 'bg-white  text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming Sessions
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'past'
                  ? 'bg-white  text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Past Sessions
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors hover:"
            style={{
              backgroundColor: COLORS.secondary,
              color: COLORS.background
            }}
          >
            <Plus size={20} />
            Add New Session
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'upcoming' && (
        <div className="space-y-6">
          <div className="grid gap-4">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="bg-white rounded-xl p-6 border border-gray-200 hover: transition-">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Teacher Avatar */}
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ backgroundColor: getAvatarColor(session.teacher) }}
                      >
                        {getLetterAvatar(session.teacher)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold" style={{ color: COLORS.text }}>{session.title}</h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            ID: {session.id}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{session.course}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <User size={14} className="text-gray-500" />
                          <span className="text-sm text-gray-600">{session.teacher}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{formatDate(session.scheduledDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>{formatTime(session.scheduledDate)} ({session.duration} min)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} />
                            <span>{(session.enrolledStudents ?? session.studentsAttended) || 0}/{session.maxStudents} students</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setAttendanceSession(session)}
                        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Attendance Report"
                      >
                        <ClipboardList size={16} />
                      </button>
                      <button
                        onClick={() => setAttendanceSession(session)}
                        className="p-2 text-gray-500 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors"
                        title="View Attendance"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => openEditModal(session)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Session"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(session)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Session"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {session.status === 'completed' || session.status === 'cancelled' || (session.endTime && new Date(session.endTime) < new Date()) ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                        <CheckCircle size={14} className="text-gray-500" />
                        Completed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoinSession(session.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
                        style={{
                          backgroundColor: COLORS.primary,
                          color: COLORS.background
                        }}
                      >
                        Start Session
                        <ChevronRight size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {upcomingSessions.length === 0 && (
            <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No upcoming sessions</h3>
              <p className="text-gray-500">There are no scheduled sessions at the moment.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div className="space-y-6">
          <div className="grid gap-4">
            {pastSessions.map((session) => (
              <div key={session.id} className="bg-white rounded-xl p-6 border border-gray-200 hover: transition-">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Recording Thumbnail or Teacher Avatar */}
                      <div className="relative group cursor-pointer">
                        {session.recordingUrl ? (
                          <div className="w-20 h-12 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                            <Video size={20} className="text-gray-500" />
                          </div>
                        ) : (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                            style={{ backgroundColor: getAvatarColor(session.teacher) }}
                          >
                            {getLetterAvatar(session.teacher)}
                          </div>
                        )}
                        {session.recordingUrl && (
                          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play size={16} className="text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold" style={{ color: COLORS.text }}>{session.title}</h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            ID: {session.id}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{session.course}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <User size={14} className="text-gray-500" />
                          <span className="text-sm text-gray-600">{session.teacher}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{formatDate(session.scheduledDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>{formatTime(session.scheduledDate)} ({session.duration} min)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users size={16} />
                            <span>{(session.studentsAttended ?? session.enrolledStudents) || 0} students attended</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAttendanceSession(session)}
                        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Attendance Report"
                      >
                        <ClipboardList size={16} />
                      </button>
                      <button
                        onClick={() => setAttendanceSession(session)}
                        className="p-2 text-gray-500 hover:text-secondary hover:bg-secondary/5 rounded-lg transition-colors"
                        title="View Attendance"
                      >
                        <Eye size={16} />
                      </button>
                      {session.recordingUrl && (
                        <>
                          <button
                            onClick={() => window.open(session.recordingUrl, '_blank')}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:border-secondary hover:bg-secondary/5 transition-colors"
                          >
                            <ExternalLink size={14} />
                            Watch
                          </button>
                          <button
                            onClick={() => handleDownloadRecording(session.recordingUrl)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:border-secondary hover:bg-secondary/5 transition-colors"
                          >
                            <Download size={14} />
                            Download
                          </button>
                        </>
                      )}
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pastSessions.length === 0 && (
            <div className="bg-white rounded-xl p-12 border border-gray-200 text-center">
              <Video size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No past sessions</h3>
              <p className="text-gray-500">Completed session recordings will appear here.</p>
            </div>
          )}
        </div>
      )}


      {/* Add Session Modal */}
      <AddSessionModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSubmit={handleAddSession}
      />

      {/* Edit Session Modal */}
      <EditSessionModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSubmit={handleEditSession}
        session={selectedSession}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteSession}
        title="Delete Session"
        message={`Are you sure you want to delete "${sessionToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete Session"
        confirmStyle="danger"
      />

      {/* Session Attendance Report Modal */}
      <SessionAttendanceModal
        isOpen={Boolean(attendanceSession)}
        onClose={() => setAttendanceSession(null)}
        session={attendanceSession}
      />
    </div>
  );
}
