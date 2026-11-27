'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import AgoraVideoSession from '@/components/AgoraVideoSession';
import sessionServices from '@/services/sessions/sessionServices';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId;
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        const response = await sessionServices.getSessionById(sessionId);
        const sessionData = response?.session || response;
        setSession(sessionData);
      } catch (err) {
        setError(err.error || err.message || 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionDetails();
    }
  }, [sessionId]);

  const sessionStatus = String(session?.status || session?.Status || '').toLowerCase();
  const isSessionEnded = session && (sessionStatus === 'completed' || sessionStatus === 'cancelled');

  useEffect(() => {
    if (!isSessionEnded) return;
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
    return () => clearTimeout(timer);
  }, [isSessionEnded, router]);

  const handleLeaveSession = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            style={{ backgroundColor: '#2563eb' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white mb-4">Session not found</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            style={{ backgroundColor: '#2563eb' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isSessionEnded) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">The Session has been completed</h2>
          <p className="text-gray-400 text-sm mb-6">
            Redirecting you back to the dashboard automatically...
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors cursor-pointer"
            style={{ backgroundColor: '#2563eb' }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const teacherName = session.teacher?.name || session.Teacher?.Name || session.teacher_name || session.TeacherName || '';
  const teacherId = session.teacher_id || session.TeacherID || session.teacher?.id;

  return (
    <AgoraVideoSession 
      sessionId={sessionId}
      channelName={session.channelName || session.channel_name || session.ChannelName}
      courseId={session.courseId || session.course_id || session.CourseID}
      userRole="admin"
      teacherName={teacherName}
      teacherId={teacherId}
      onLeave={handleLeaveSession}
      sessionTitle={session.title || session.Title}
    />
  );
}
