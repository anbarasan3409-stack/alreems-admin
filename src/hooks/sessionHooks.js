import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import sessionServices from '@/services/sessions/sessionServices';
import ToastService from '@/utils/ToastService';

export const useSessionManagement = () => {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  // Fetch all sessions
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await sessionServices.getAllSessions();
      setSessions(data || []);
      
      // Separate upcoming and past sessions
      const now = new Date();
      const isUpcoming = (session) => {
        if (!session) return false;
        if (session.status === 'completed' || session.status === 'cancelled') return false;
        if (session.status === 'ongoing' || session.status === 'live') return true;
        const endTime = new Date(session.endTime || session.scheduledDate);
        return !isNaN(endTime.getTime()) && endTime > now;
      };
      
      const upcoming = (data || []).filter(isUpcoming);
      const past = (data || []).filter(session => !isUpcoming(session));
      
      setUpcomingSessions(upcoming);
      setPastSessions(past);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
      setError('Failed to load sessions. Please try again.');
      ToastService.error('Failed to load sessions. Please refresh the page.');
      setSessions([]);
      setUpcomingSessions([]);
      setPastSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Add session
  const handleAddSession = async (sessionData) => {
    try {
      // Transform frontend data to backend format
      const transformedData = {
        title: sessionData.title,
        description: sessionData.description,
        teacher_id: parseInt(sessionData.teacher_id),
        course_id: sessionData.course_id ? parseInt(sessionData.course_id) : 0, // Optional
        start_time: sessionData.scheduledDate,
        end_time: new Date(new Date(sessionData.scheduledDate).getTime() + (sessionData.duration * 60000)).toISOString(),
        location: sessionData.location || '',
        max_students: sessionData.maxStudents || 30,
        status: sessionData.status || 'active'
      };

      const newSession = await sessionServices.createSession(transformedData);
      setSessions(prevSessions => [...prevSessions, newSession]);
      
      // Update upcoming/past sessions
      const now = new Date();
      const isUpcoming = (session) => {
        if (!session) return false;
        if (session.status === 'completed' || session.status === 'cancelled') return false;
        if (session.status === 'ongoing' || session.status === 'live') return true;
        const endTime = new Date(session.endTime || session.scheduledDate);
        return !isNaN(endTime.getTime()) && endTime > now;
      };

      if (isUpcoming(newSession)) {
        setUpcomingSessions(prev => [...prev, newSession]);
      } else {
        setPastSessions(prev => [...prev, newSession]);
      }
      
      ToastService.success('Session created successfully!');
      setIsAddModalOpen(false);
      return newSession;
    } catch (error) {
      console.error('Add session failed:', error);
      ToastService.error('Failed to create session. Please try again.');
      throw error;
    }
  };

  // Edit session
  const handleEditSession = async (sessionData) => {
    try {
      // Transform frontend data to backend format
      const transformedData = {
        title: sessionData.title,
        description: sessionData.description,
        teacher_id: parseInt(sessionData.teacher) || parseInt(sessionData.teacher_id) || selectedSession.teacher_id,
        course_id: parseInt(sessionData.course) || parseInt(sessionData.course_id) || selectedSession.course_id,
        start_time: sessionData.scheduledDate || sessionData.start_time,
        end_time: sessionData.scheduledDate ? 
          new Date(new Date(sessionData.scheduledDate).getTime() + ((sessionData.duration || 60) * 60000)).toISOString() :
          sessionData.end_time,
        location: sessionData.location || '',
        max_students: sessionData.maxStudents || sessionData.max_students || 30,
        status: sessionData.status || 'active'
      };

      const updatedSession = await sessionServices.updateSession(selectedSession.id, transformedData);
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === selectedSession.id ? updatedSession : session
        )
      );
      
      // Update upcoming/past sessions
      const isUpcomingEdit = (session) => {
        if (!session) return false;
        if (session.status === 'completed' || session.status === 'cancelled') return false;
        if (session.status === 'ongoing' || session.status === 'live') return true;
        const endTime = new Date(session.endTime || session.scheduledDate);
        return !isNaN(endTime.getTime()) && endTime > new Date();
      };
      
      setUpcomingSessions(prev => 
        (prev || []).map(session => 
          session.id === selectedSession.id ? updatedSession : session
        ).filter(isUpcomingEdit)
      );
      setPastSessions(prev => 
        (prev || []).map(session => 
          session.id === selectedSession.id ? updatedSession : session
        ).filter(session => !isUpcomingEdit(session))
      );
      
      ToastService.success('Session updated successfully!');
      setIsEditModalOpen(false);
      setSelectedSession(null);
      return updatedSession;
    } catch (error) {
      console.error('Edit session failed:', error);
      ToastService.error('Failed to update session. Please try again.');
      throw error;
    }
  };

  // Delete session
  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      await sessionServices.deleteSession(sessionToDelete.id);
      setSessions(prevSessions => 
        (prevSessions || []).filter(session => session.id !== sessionToDelete.id)
      );
      setUpcomingSessions(prev => 
        (prev || []).filter(session => session.id !== sessionToDelete.id)
      );
      setPastSessions(prev => 
        (prev || []).filter(session => session.id !== sessionToDelete.id)
      );
      
      ToastService.success('Session deleted successfully!');
      setIsDeleteModalOpen(false);
      setSessionToDelete(null);
    } catch (error) {
      console.error('Delete session failed:', error);
      ToastService.error('Failed to delete session. Please try again.');
    }
  };

  // Start session
  const handleStartSession = async (sessionId) => {
    try {
      await sessionServices.startSession(sessionId);
      ToastService.success('Session started successfully!');
      router.push(`/dashboard/session/${sessionId}`);
    } catch (error) {
      console.error('Start session failed:', error);
      ToastService.error('Failed to start session. Please try again.');
    }
  };

  // End session
  const handleEndSession = async (sessionId) => {
    try {
      await sessionServices.endSession(sessionId);
      ToastService.success('Session ended successfully!');
      fetchSessions(); // Refresh sessions to get updated status
    } catch (error) {
      console.error('End session failed:', error);
      ToastService.error('Failed to end session. Please try again.');
    }
  };

  // Modal handlers
  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const openEditModal = (session) => {
    setSelectedSession(session);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedSession(null);
  };

  const openDeleteModal = (session) => {
    setSessionToDelete(session);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSessionToDelete(null);
  };

  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'ongoing':
        return 'bg-green-100 text-green-700';
      case 'completed':
        return 'bg-gray-100 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Invalid Date';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid Date';
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return {
    // State
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

    // Handlers
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
    fetchSessions,

    // Utilities
    getStatusColor,
    formatDate,
    formatTime,
  };
};
