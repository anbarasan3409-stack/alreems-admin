import apiInstance, { apiEndpoints } from '@/api/apiInstance';

// Helper to transform API response to match component expectations
const transformSessionResponse = (session) => {
  const now = new Date();
  const startTime = session.start_time ? new Date(session.start_time) : null;
  const endTime = session.end_time 
    ? new Date(session.end_time) 
    : (startTime ? new Date(startTime.getTime() + (session.duration || 60) * 60000) : null);

  let status = session.status || 'scheduled';
  // If the session's scheduled end time has passed and it is not currently live, it is completed
  if (endTime && !isNaN(endTime.getTime()) && now > endTime && status !== 'ongoing' && status !== 'live') {
    status = 'completed';
  }

  const enrolledStudents = session.enrolled_students ?? session.enrolledStudents ?? 0;
  const studentsAttended = session.students_attended ?? session.studentsAttended ?? 0;

  return {
    id: session.id,
    title: session.title,
    description: session.description,
    teacher: session.teacher_name,
    teacherId: session.teacher_id,
    course: session.course_name,
    courseId: session.course_id,
    scheduledDate: session.start_time,
    endTime: session.end_time || (endTime ? endTime.toISOString() : null),
    duration: session.duration,
    location: session.location,
    channelName: session.channel_name,
    whiteboardUUID: session.whiteboard_uuid,
    maxStudents: session.max_students,
    status: status,
    rawStatus: session.status,
    enrolledStudents: enrolledStudents,
    studentsAttended: studentsAttended > 0 ? studentsAttended : enrolledStudents,
    recordingUrl: session.recording_url,
    createdAt: session.created_at,
    updatedAt: session.updated_at
  };
};

const sessionServices = {
  getAllSessions: async () => {
    try {
      const response = await apiInstance.get(apiEndpoints.SESSIONS);
      return response.data.map(transformSessionResponse);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },

  getSessionById: async (id) => {
    try {
      const response = await apiInstance.get(apiEndpoints.SESSION_BY_ID(id));
      return transformSessionResponse(response.data);
    } catch (error) {
      console.error('Error fetching session by ID:', error);
      throw error;
    }
  },

  createSession: async (sessionData) => {
    try {
      const response = await apiInstance.post(apiEndpoints.SESSIONS, sessionData);
      return transformSessionResponse(response.data);
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  updateSession: async (id, sessionData) => {
    try {
      const response = await apiInstance.put(apiEndpoints.SESSION_BY_ID(id), sessionData);
      return transformSessionResponse(response.data);
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  deleteSession: async (id) => {
    try {
      const response = await apiInstance.delete(apiEndpoints.SESSION_BY_ID(id));
      return response.data;
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  },

  getUpcomingSessions: async () => {
    try {
      const response = await apiInstance.get(apiEndpoints.SESSIONS + '/upcoming');
      return response.data.map(transformSessionResponse);
    } catch (error) {
      console.error('Error fetching upcoming sessions:', error);
      throw error;
    }
  },

  getPastSessions: async () => {
    try {
      const response = await apiInstance.get(apiEndpoints.SESSIONS + '/past');
      return response.data.map(transformSessionResponse);
    } catch (error) {
      console.error('Error fetching past sessions:', error);
      throw error;
    }
  },

  startSession: async (id) => {
    try {
      const response = await apiInstance.put(apiEndpoints.SESSION_BY_ID(id), { status: 'active' });
      return transformSessionResponse(response.data);
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  },

  getSessionAttendees: async (id) => {
    // Admin backend may not have this endpoint, AgoraVideoSession will fallback to getting course students
    throw new Error('Not implemented on admin portal');
  },

  endSession: async (id) => {
    try {
      const response = await apiInstance.put(apiEndpoints.SESSION_BY_ID(id), { status: 'completed' });
      return transformSessionResponse(response.data);
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  },
};

export default sessionServices;
