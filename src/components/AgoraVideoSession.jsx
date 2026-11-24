import { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Monitor, 
  Users, 
  Settings,
  MessageSquare,
  Volume2,
  VolumeX,
  Clock,
  PenTool,
  Shield
} from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import dynamic from 'next/dynamic';

// Import Agora RTC SDK dynamically to avoid SSR issues
const AgoraRTC = dynamic(
  () => import('agora-rtc-sdk-ng').then(mod => mod.default),
  { ssr: false }
);

// Import Whiteboard wrapper with complete client-side isolation
const WhiteboardWrapper = dynamic(
  () => import('./WhiteboardWrapper'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading whiteboard...</p>
        </div>
      </div>
    )
  }
);

// Import services
import { agoraTokenService } from '@/services/agoraTokenService';
import sessionServices from '@/services/sessions/sessionServices';
import CourseService from '@/services/courses/courseServices';
import { StudentService } from '@/services/students/studentServices';
import apiInstance from '@/api/apiInstance';

const AgoraVideoSession = ({ 
  sessionId, 
  channelName, 
  courseId,
  teacherName: propTeacherName,
  teacherId: propTeacherId,
  userRole = 'admin',
  onLeave,
  sessionTitle
}) => {
  // State management
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [client, setClient] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState(new Map());
  const [studentNames, setStudentNames] = useState(new Map()); // Map of UID or student ID to student name
  const [studentList, setStudentList] = useState([]);
  const [userRoles, setUserRoles] = useState(new Map()); // Map of UID to 'teacher' | 'admin' | 'student'
  const [resolvedTeacherName, setResolvedTeacherName] = useState(propTeacherName || '');
  const [resolvedTeacherId, setResolvedTeacherId] = useState(propTeacherId || null);
  
  // Refs
  const localVideoRef = useRef(null);
  const clientRef = useRef(null); // Use ref for client to avoid closure issues in event handlers
  const dataStreamIdRef = useRef(null);
  const allWbStrokesRef = useRef([]);
  
  // Control states
  const [isVideoEnabled, setIsVideoEnabled] = useState(false); // Default OFF
  const [isAudioEnabled, setIsAudioEnabled] = useState(false); // Default OFF
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [volume, setVolume] = useState(50);
  const [videoReady, setVideoReady] = useState(false);
  
  // Whiteboard states
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [whiteboardRoomUUID, setWhiteboardRoomUUID] = useState(null);
  const [whiteboardToken, setWhiteboardToken] = useState(null);
  const [loadingWhiteboard, setLoadingWhiteboard] = useState(false);
  const showWhiteboardRef = useRef(false);
  const whiteboardRoomUUIDRef = useRef(null);
  showWhiteboardRef.current = showWhiteboard;
  whiteboardRoomUUIDRef.current = whiteboardRoomUUID;
  
  // Force video playback on user interaction
  const forceVideoPlayback = async () => {
    if (localVideoRef.current && localVideoTrack) {
      try {
        const videoElement = localVideoRef.current;
        videoElement.muted = true;
        videoElement.autoplay = true;
        videoElement.playsInline = true;

        const playPromise = localVideoTrack.play(videoElement);
        playPromise.then(() => {
          setVideoReady(true);
        }).catch((error) => {
        });
      } catch (error) {
      }
    }
  };
  
  // Fallback: try to play video whenever both element and track are available
  useEffect(() => {
    if (localVideoRef.current && localVideoTrack && !videoReady) {
      const attemptPlayback = async () => {
        try {
          const videoElement = localVideoRef.current;
          if (videoElement) {
            videoElement.muted = true;
            videoElement.autoplay = true;
            videoElement.playsInline = true;
            
            await localVideoTrack.play(videoElement);
            setVideoReady(true);
          }
        } catch (error) {
        }
      };
      
      setTimeout(attemptPlayback, 500);
    }
  }, [localVideoRef.current, localVideoTrack, videoReady]);

  // Ensure video element is ready when component mounts
  useEffect(() => {
    if (localVideoRef.current && isJoined && localVideoTrack) {
      try {
        const videoElement = localVideoRef.current;
        videoElement.muted = true;
        videoElement.autoplay = true;
        videoElement.playsInline = true;

        const playPromise = localVideoTrack.play(videoElement);
        playPromise.then(() => {
          setVideoReady(true);
        }).catch((playError) => {
          setTimeout(() => {
            if (localVideoRef.current && localVideoTrack) {
              localVideoTrack.play(localVideoRef.current).catch(() => {});
            }
          }, 1000);
        });
      } catch (error) {
      }
    }
  }, [isJoined, localVideoTrack]);

  // Fetch session details, teacher info, and students
  useEffect(() => {
    const fetchSessionStudents = async () => {
      try {
        let students = [];
        let resolvedCourseId = courseId;
        
        // 1. Resolve session details, teacher, and courseId if not provided
        try {
          const session = await sessionServices.getSessionById(sessionId);
          const sessionData = session?.session || session;
          if (!resolvedCourseId) {
            resolvedCourseId = sessionData?.courseId || sessionData?.course_id || sessionData?.CourseID;
          }
          const tName = sessionData?.teacher?.name || sessionData?.Teacher?.Name || sessionData?.teacher_name || sessionData?.TeacherName;
          if (tName) setResolvedTeacherName(tName);
          const tId = sessionData?.teacher_id || sessionData?.TeacherID || sessionData?.teacher?.id;
          if (tId) setResolvedTeacherId(tId);
        } catch (sessionError) {
          console.warn('Error fetching session details in admin:', sessionError);
        }

        // 2. Fetch enrolled students for this course
        if (resolvedCourseId) {
          try {
            const courseStudents = await CourseService.getCourseStudents(resolvedCourseId);
            students = Array.isArray(courseStudents) ? courseStudents : (courseStudents?.students || []);
          } catch (courseError) {
            console.warn('Error fetching course students:', courseError);
          }
        }

        // 3. Fallback: Fetch all students if course students list is empty
        if (!students || students.length === 0) {
          try {
            const allStudents = await StudentService.getAllStudents();
            students = Array.isArray(allStudents) ? allStudents : (allStudents?.students || []);
          } catch (allErr) {
            console.warn('Error fetching all students:', allErr);
          }
        }
        
        // 4. Map student names by ID (numeric and string) and by index
        if (students && students.length > 0) {
          setStudentList(students);
          setStudentNames(prev => {
            const namesMap = new Map(prev);
            students.forEach((student, index) => {
              const displayName = student.name || student.Name || student.first_name || student.FirstName || student.email || `Student #${index + 1}`;
              namesMap.set(index, displayName);
              if (student.id) {
                namesMap.set(student.id, displayName);
                namesMap.set(Number(student.id), displayName);
                namesMap.set(String(student.id), displayName);
              }
            });
            return namesMap;
          });
        }
      } catch (error) {
        console.warn('Could not fetch students for session:', error);
      }
    };

    if (sessionId) {
      fetchSessionStudents();
    }
  }, [sessionId, courseId]);

  // Handle page reload/navigation to cleanup Agora session
  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      try {
        if (localVideoTrack) {
          localVideoTrack.close();
        }
        if (localAudioTrack) {
          localAudioTrack.close();
        }
        if (clientRef.current) {
          clientRef.current.leave();
          clientRef.current.removeAllListeners();
        }
      } catch (error) {
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [localVideoTrack, localAudioTrack]);

  // Initialize Agora SDK
  useEffect(() => {
    let isMounted = true;
    
    const initializeAgora = async () => {
      try {
        const AgoraRTCModule = await import('agora-rtc-sdk-ng');
        const AgoraRTC = AgoraRTCModule.default;
        
        if (!isMounted) return;
        await initializeAgoraSession(AgoraRTC);
      } catch (error) {
        if (isMounted) {
          setError('Failed to load video SDK. Please refresh and try again.');
          setIsLoading(false);
        }
      }
    };

    initializeAgora();
    
    return () => {
      isMounted = false;
      const cleanup = async () => {
        try {
          if (localVideoTrack) {
            localVideoTrack.close();
          }
          if (localAudioTrack) {
            localAudioTrack.close();
          }
          if (clientRef.current) {
            await clientRef.current.leave();
            clientRef.current.removeAllListeners();
            clientRef.current = null;
          }
        } catch (error) {
        }
      };
      cleanup();
    };
  }, []);

  const initializeAgoraSession = async (AgoraRTC) => {
    if (!AgoraRTC) return;

    try {
      setIsLoading(true);
      setError(null);

      const effectiveAppId = await agoraTokenService.getAppId();
      if (!effectiveAppId || effectiveAppId === 'your_agora_app_id_here') {
        throw new Error('Agora App ID is not configured. Please set NEXT_PUBLIC_AGORA_APP_ID.');
      }

      const effectiveChannelName = channelName || `session_${sessionId}`;
      const token = await agoraTokenService.generateToken(effectiveChannelName, userRole);
      const uid = Math.floor(Math.random() * 1000000);

      let agoraClient;
      try {
        agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      } catch (clientError) {
        agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'h264' });
      }

      // Event listeners
      agoraClient.on('user-published', handleUserPublished);
      agoraClient.on('user-unpublished', handleUserUnpublished);
      agoraClient.on('user-joined', handleUserJoined);
      agoraClient.on('user-left', handleUserLeft);
      agoraClient.on('stream-message', (senderUid, data) => {
        try {
          const text = typeof data === 'string' ? data : new TextDecoder().decode(data);
          const info = JSON.parse(text);

          // Role query from peer: answer with admin role
          if (info?.type === 'discover_roles' || info?.type === 'role_query') {
            broadcastStreamMsg({
              type: 'user_role',
              role: 'admin',
              uid: uid,
              name: 'Administrator'
            });
          }

          // User role declaration
          if (info?.type === 'user_role') {
            if (info.uid && info.role) {
              setUserRoles(prev => {
                const next = new Map(prev);
                next.set(info.uid, info.role);
                next.set(Number(info.uid), info.role);
                next.set(String(info.uid), info.role);
                return next;
              });
              if (info.name) {
                setStudentNames(prev => {
                  const next = new Map(prev);
                  next.set(info.uid, info.name);
                  next.set(Number(info.uid), info.name);
                  next.set(String(info.uid), info.name);
                  return next;
                });
              }
              if (info.role === 'teacher' && info.name) {
                setResolvedTeacherName(info.name);
              }
            }
          }

          // Whiteboard sync request
          if (info?.type === 'wb' && info?.a === 'req') {
            if (showWhiteboardRef.current) {
              broadcastStreamMsg({ type: 'wb', a: 'v', show: true, room: whiteboardRoomUUIDRef.current });
              if (allWbStrokesRef.current.length > 0) {
                const strokes = allWbStrokesRef.current;
                for (let i = 0; i < strokes.length; i += 15) {
                  const batch = strokes.slice(i, i + 15);
                  broadcastStreamMsg({ type: 'wb', a: 'sync', strokes: batch });
                }
              }
            }
          }

          // Student profile broadcast
          if (info?.type === 'student_info') {
            setUserRoles(prev => {
              const next = new Map(prev);
              next.set(senderUid, 'student');
              next.set(Number(senderUid), 'student');
              next.set(String(senderUid), 'student');
              if (info.uid) {
                next.set(info.uid, 'student');
                next.set(Number(info.uid), 'student');
              }
              return next;
            });
          }

          const name = info?.name || info?.studentName;
          if (name) {
            setStudentNames(prev => {
              const next = new Map(prev);
              next.set(senderUid, name);
              next.set(Number(senderUid), name);
              next.set(String(senderUid), name);
              if (info.uid) {
                next.set(info.uid, name);
                next.set(Number(info.uid), name);
                next.set(String(info.uid), name);
              }
              if (info.studentId) {
                next.set(info.studentId, name);
                next.set(Number(info.studentId), name);
                next.set(String(info.studentId), name);
              }
              return next;
            });
          }
        } catch (e) {
          console.warn('Error decoding stream message in admin:', e);
        }
      });

      setClient(agoraClient);
      clientRef.current = agoraClient;

      await agoraClient.join(effectiveAppId, effectiveChannelName, token, uid);
      setIsJoined(true);

      // Publish local audio/video tracks (created in disabled state)
      await createAndPublishTracks(agoraClient);

      // Broadcast Admin role to channel and query who else is there
      const broadcastAdminPresence = async () => {
        try {
          const current = clientRef.current;
          if (!current) return;
          const payload = JSON.stringify({
            type: 'user_role',
            role: 'admin',
            uid: uid,
            name: 'Administrator'
          });
          await current.sendStreamMessage(payload);
          await current.sendStreamMessage(JSON.stringify({ type: 'role_query' }));
        } catch (e) {
          console.warn('Failed to broadcast admin presence:', e);
        }
      };

      broadcastAdminPresence();
      setTimeout(broadcastAdminPresence, 1500);
      setTimeout(broadcastAdminPresence, 4000);

    } catch (err) {
      if (err.code === 'CAN_NOT_GET_GATEWAY_SERVER' || err.message?.includes('dynamic use static key')) {
        setError(`🔧 Authentication Setup Required: Agora Certificate disabled in Console.`);
      } else if (err.code === 'INVALID_APP_ID') {
        setError('Invalid App ID. Please check your NEXT_PUBLIC_AGORA_APP_ID environment variable.');
      } else {
        setError(`Connection failed: ${err.message || 'Unknown error'}.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createAndPublishTracks = async (agoraClient) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera/microphone access.');
      }

      const AgoraRTCModule = await import('agora-rtc-sdk-ng');
      const AgoraRTC = AgoraRTCModule.default;

      const [videoTrack, audioTrack] = await Promise.all([
        AgoraRTC.createCameraVideoTrack({
          encoderConfig: {
            width: 640,
            height: 480,
            frameRate: 15,
            bitrateMin: 400,
            bitrateMax: 1000,
          }
        }),
        AgoraRTC.createMicrophoneAudioTrack({
          encoderConfig: "music_standard",
        })
      ]);

      setLocalVideoTrack(videoTrack);
      setLocalAudioTrack(audioTrack);

      await agoraClient.publish([videoTrack, audioTrack]);

      // Admin starts with camera and mic disabled
      await videoTrack.setEnabled(false);
      await audioTrack.setEnabled(false);

    } catch (error) {
      console.warn('Admin local track creation note:', error.message);
    }
  };

  // Event handlers
  const handleUserPublished = async (user, mediaType) => {
    try {
      const currentClient = clientRef.current;
      if (!currentClient) return;
      
      await currentClient.subscribe(user, mediaType);
      
      setRemoteUsers(prev => {
        const newMap = new Map(prev);
        const existingUser = newMap.get(user.uid) || { uid: user.uid, hasVideo: false, hasAudio: false };
        
        if (mediaType === 'video') {
          existingUser.videoTrack = user.videoTrack;
          existingUser.hasVideo = true;
        } else if (mediaType === 'audio') {
          existingUser.audioTrack = user.audioTrack;
          existingUser.hasAudio = true;
          user.audioTrack.play();
        }
        
        newMap.set(user.uid, existingUser);
        return newMap;
      });

      // Play video track into corresponding DOM element
      if (mediaType === 'video' && user.videoTrack) {
        setTimeout(() => {
          const videoContainer = document.getElementById(`remote-video-${user.uid}`);
          if (videoContainer) {
            videoContainer.innerHTML = '';
            user.videoTrack.play(videoContainer);
          } else {
            setTimeout(() => {
              const retryContainer = document.getElementById(`remote-video-${user.uid}`);
              if (retryContainer) {
                retryContainer.innerHTML = '';
                user.videoTrack.play(retryContainer);
              }
            }, 500);
          }
        }, 200);
      }
    } catch (error) {
      console.error('Error handling user published in admin:', error);
    }
  };

  const handleUserUnpublished = (user, mediaType) => {
    setRemoteUsers(prev => {
      const newMap = new Map(prev);
      const existingUser = newMap.get(user.uid);
      if (existingUser) {
        if (mediaType === 'video') {
          existingUser.videoTrack = null;
          existingUser.hasVideo = false;
        } else if (mediaType === 'audio') {
          existingUser.audioTrack = null;
          existingUser.hasAudio = false;
        }
        newMap.set(user.uid, existingUser);
      }
      return newMap;
    });
  };

  const handleUserJoined = (user) => {
    setRemoteUsers(prev => {
      const newMap = new Map(prev);
      if (!newMap.has(user.uid)) {
        newMap.set(user.uid, { uid: user.uid, hasVideo: false, hasAudio: false });
      }
      return newMap;
    });

    // Query new user's role
    broadcastStreamMsg({ type: 'role_query' });
  };

  const handleUserLeft = (user) => {
    setRemoteUsers(prev => {
      const newMap = new Map(prev);
      if (newMap.has(user.uid)) {
        newMap.delete(user.uid);
      }
      return newMap;
    });
  };

  // Control functions
  const toggleVideo = async () => {
    if (localVideoTrack) {
      if (isVideoEnabled) {
        await localVideoTrack.setEnabled(false);
        setIsVideoEnabled(false);
      } else {
        await localVideoTrack.setEnabled(true);
        setIsVideoEnabled(true);
      }
    }
  };

  const toggleAudio = async () => {
    if (localAudioTrack) {
      if (isAudioEnabled) {
        await localAudioTrack.setEnabled(false);
        setIsAudioEnabled(false);
      } else {
        await localAudioTrack.setEnabled(true);
        setIsAudioEnabled(true);
      }
    }
  };

  const startScreenShare = async () => {
    try {
      const AgoraRTCModule = await import('agora-rtc-sdk-ng');
      const AgoraRTC = AgoraRTCModule.default;
      
      const screenTrack = await AgoraRTC.createScreenVideoTrack({
        encoderConfig: "1080p_1",
      });
      
      const currentClient = clientRef.current;
      if (!currentClient) return;
      
      if (localVideoTrack) {
        await currentClient.unpublish(localVideoTrack);
        localVideoTrack.close();
      }
      
      await currentClient.publish(screenTrack);
      
      if (localVideoRef.current) {
        screenTrack.play(localVideoRef.current);
      }
      
      setLocalVideoTrack(screenTrack);
      setIsScreenSharing(true);
      setIsVideoEnabled(true);
      
      screenTrack.on('track-ended', () => {
        stopScreenShare();
      });
    } catch (error) {
      setIsScreenSharing(false);
      alert('Failed to start screen sharing. Please try again.');
    }
  };

  const stopScreenShare = async () => {
    try {
      const currentClient = clientRef.current;
      if (!currentClient) return;
      
      if (localVideoTrack) {
        await currentClient.unpublish(localVideoTrack);
        localVideoTrack.close();
      }
      
      const AgoraRTCModule = await import('agora-rtc-sdk-ng');
      const AgoraRTC = AgoraRTCModule.default;
      
      const newVideoTrack = await AgoraRTC.createCameraVideoTrack({
        encoderConfig: {
          width: 640,
          height: 480,
          frameRate: 15,
          bitrateMin: 400,
          bitrateMax: 1000,
        }
      });
      
      await currentClient.publish(newVideoTrack);
      await newVideoTrack.setEnabled(false);
      
      setLocalVideoTrack(newVideoTrack);
      setIsScreenSharing(false);
      setIsVideoEnabled(false);
      
      if (localVideoRef.current) {
        try {
          await newVideoTrack.play(localVideoRef.current);
        } catch (playError) {}
      }
    } catch (error) {
      setIsScreenSharing(false);
      alert('Failed to stop screen sharing. Please refresh the page.');
    }
  };

  const broadcastStreamMsg = async (msgObj) => {
    try {
      const current = clientRef.current;
      if (!current) return;
      const payload = JSON.stringify(msgObj);
      await current.sendStreamMessage(payload);
    } catch (err) {
      console.warn('Failed to broadcast stream message:', err);
    }
  };

  // Whiteboard functions
  const toggleWhiteboard = async () => {
    if (showWhiteboard) {
      setShowWhiteboard(false);
      broadcastStreamMsg({ type: 'wb', a: 'v', show: false });
    } else {
      await fetchWhiteboardToken();
    }
  };

  const fetchWhiteboardToken = async () => {
    try {
      setLoadingWhiteboard(true);
      
      let room = `session-${sessionId}`;
      let token = 'mock-token';
      try {
        const response = await apiInstance.get('/admin/whiteboard-token', {
          params: { sessionId, role: 'admin' }
        });
        if (response?.data?.roomUUID) {
          room = response.data.roomUUID;
          token = response.data.roomToken || 'token';
        }
      } catch (apiErr) {
        console.warn('Whiteboard backend token fetch failed, falling back to session room:', apiErr);
      }

      setWhiteboardRoomUUID(room);
      setWhiteboardToken(token);
      setShowWhiteboard(true);
      setLoadingWhiteboard(false);
      broadcastStreamMsg({ type: 'wb', a: 'v', show: true, room: room });

      if (allWbStrokesRef.current.length > 0) {
        const strokes = allWbStrokesRef.current;
        for (let i = 0; i < strokes.length; i += 20) {
          const batch = strokes.slice(i, i + 20);
          broadcastStreamMsg({ type: 'wb', a: 'sync', strokes: batch });
        }
      }
    } catch (error) {
      console.error('Error opening whiteboard:', error);
      setLoadingWhiteboard(false);
    }
  };

  const handleWhiteboardStroke = (stroke) => {
    if (allWbStrokesRef.current.length > 3500) {
      allWbStrokesRef.current.shift();
    }
    allWbStrokesRef.current.push(stroke);

    if (stroke.a === 's') {
      broadcastStreamMsg({ type: 'wb', a: 'v', show: true, room: whiteboardRoomUUIDRef.current });
    }
    broadcastStreamMsg({ type: 'wb', ...stroke });
  };

  const handleWhiteboardClear = () => {
    allWbStrokesRef.current = [];
    broadcastStreamMsg({ type: 'wb', a: 'c' });
  };

  // Student Remote Control Functions
  const handleToggleStudentAudio = async (targetUid, hasAudio) => {
    if (!hasAudio) return;
    try {
      await broadcastStreamMsg({
        type: 'teacher_control',
        action: 'mute_audio',
        targetUid: targetUid
      });

      setRemoteUsers(prev => {
        const next = new Map(prev);
        const user = next.get(targetUid) || next.get(Number(targetUid)) || next.get(String(targetUid));
        if (user) {
          user.hasAudio = false;
          if (user.audioTrack) {
            try { user.audioTrack.stop(); } catch (e) {}
          }
        }
        return next;
      });
    } catch (err) {
      console.error('Failed to mute student audio:', err);
    }
  };

  const handleToggleStudentVideo = async (targetUid, hasVideo) => {
    if (!hasVideo) return;
    try {
      await broadcastStreamMsg({
        type: 'teacher_control',
        action: 'mute_video',
        targetUid: targetUid
      });

      setRemoteUsers(prev => {
        const next = new Map(prev);
        const user = next.get(targetUid) || next.get(Number(targetUid)) || next.get(String(targetUid));
        if (user) {
          user.hasVideo = false;
          if (user.videoTrack) {
            try { user.videoTrack.stop(); } catch (e) {}
          }
        }
        return next;
      });
    } catch (err) {
      console.error('Failed to turn off student video:', err);
    }
  };

  const handleMuteAllStudents = async () => {
    try {
      await broadcastStreamMsg({
        type: 'teacher_control',
        action: 'mute_all_audio'
      });

      setRemoteUsers(prev => {
        const next = new Map(prev);
        next.forEach(user => {
          user.hasAudio = false;
          if (user.audioTrack) {
            try { user.audioTrack.stop(); } catch (e) {}
          }
        });
        return next;
      });
    } catch (err) {
      console.error('Failed to mute all students:', err);
    }
  };

  const leaveSession = async () => {
    try {
      if (sessionId) {
        try {
          await sessionServices.updateSession(sessionId, { status: 'completed' });
        } catch (e) {
          console.warn('Could not auto-mark session as completed:', e);
        }
      }

      if (localVideoTrack) {
        localVideoTrack.close();
      }
      if (localAudioTrack) {
        localAudioTrack.close();
      }
      if (client) {
        await client.leave();
      }
      
      setIsJoined(false);
      setRemoteUsers(new Map());
      clientRef.current = null;
      
      if (onLeave) {
        onLeave();
      }
    } catch (error) {
    }
  };

  // Determine role of each remote user
  const getRoleForUser = (user) => {
    const uid = user.uid;
    const recorded = userRoles.get(uid) || userRoles.get(Number(uid)) || userRoles.get(String(uid));
    if (recorded) return recorded;

    // Check teacher ID match
    if (resolvedTeacherId && (Number(uid) === Number(resolvedTeacherId) || String(uid) === String(resolvedTeacherId))) {
      return 'teacher';
    }

    // Check teacher Name match
    const name = studentNames.get(uid) || studentNames.get(Number(uid)) || studentNames.get(String(uid));
    if (resolvedTeacherName && name && name.toLowerCase().trim() === resolvedTeacherName.toLowerCase().trim()) {
      return 'teacher';
    }

    // Heuristic: If this user did not send student_info and is not in studentList, treat as Teacher
    const isKnownStudent = studentList.some(s => Number(s.id) === Number(uid) || String(s.id) === String(uid));
    if (!isKnownStudent && (!userRoles.has(uid) || userRoles.get(uid) !== 'student')) {
      return 'teacher';
    }

    return 'student';
  };

  // Partition remote users into Teacher, Admins, and Students
  const remoteUsersArray = Array.from(remoteUsers.values());
  const remoteTeacher = remoteUsersArray.find(u => getRoleForUser(u) === 'teacher');
  const remoteAdmins = remoteUsersArray.filter(u => getRoleForUser(u) === 'admin' && (!remoteTeacher || u.uid !== remoteTeacher.uid));
  const remoteStudents = remoteUsersArray.filter(u => getRoleForUser(u) === 'student' && (!remoteTeacher || u.uid !== remoteTeacher.uid));

  // Teacher display name & initials
  const teacherDisplayName = studentNames.get(remoteTeacher?.uid) || resolvedTeacherName || 'Instructor';
  const teacherInitials = teacherDisplayName
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'T';

  // Ensure teacher video plays into main stage whenever remoteTeacher or its video track changes
  useEffect(() => {
    if (remoteTeacher && remoteTeacher.hasVideo && remoteTeacher.videoTrack) {
      const timer = setTimeout(() => {
        const container = document.getElementById(`remote-video-${remoteTeacher.uid}`);
        if (container) {
          container.innerHTML = '';
          remoteTeacher.videoTrack.play(container);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [remoteTeacher?.uid, remoteTeacher?.hasVideo, remoteTeacher?.videoTrack]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Joining Session as Admin...</h3>
            <p className="text-gray-600">Connecting to session monitor</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhoneOff className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h3>
            <p className="text-gray-600 mb-6 text-sm">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={onLeave}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold" style={{ color: COLORS.primary }}>
              {sessionTitle || 'Live Teaching Session'}
            </h1>
            <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <Shield size={12} />
              Admin Observer Mode
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Channel: {channelName} • Instructor: <span className="font-semibold text-gray-800">{resolvedTeacherName || 'Assigned Teacher'}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1.5 font-medium">
              <Users size={16} />
              {remoteUsers.size + 1} participants
            </span>
            <span className="text-green-600 font-medium">
              • {remoteStudents.length} {remoteStudents.length === 1 ? 'student' : 'students'} connected
            </span>
            {remoteTeacher ? (
              <span className="text-purple-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                Teacher Online
              </span>
            ) : (
              <span className="text-amber-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Teacher Not in Session
              </span>
            )}
          </div>
          
          <button
            onClick={leaveSession}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
          >
            <PhoneOff size={16} />
            Leave Session
          </button>
        </div>
      </div>

      {/* Main Video Area & Sidebar */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Main Stage (Shows Teacher's Stream or Whiteboard) */}
        <div className="flex-1 relative bg-black overflow-hidden flex flex-col min-h-0">
          {/* Whiteboard Overlay */}
          {showWhiteboard && (
            <div className="absolute inset-0 z-30 bg-white">
              <WhiteboardWrapper
                roomUUID={whiteboardRoomUUID || `session-${sessionId}`}
                roomToken={whiteboardToken || 'token'}
                isHost={true}
                onClose={toggleWhiteboard}
                onStroke={handleWhiteboardStroke}
                onClear={handleWhiteboardClear}
                initialStrokes={allWbStrokesRef.current}
              />
            </div>
          )}

          {/* Teacher Stream (Primary Video on Stage) */}
          {remoteTeacher ? (
            <div className="w-full h-full relative bg-gray-950 flex items-center justify-center">
              <div 
                id={`remote-video-${remoteTeacher.uid}`}
                className="w-full h-full bg-gray-950 relative"
              />
              
              {!remoteTeacher.hasVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-purple-600/30 border border-purple-500/40 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users size={36} className="text-purple-300" />
                    </div>
                    <p className="text-lg font-semibold">{teacherDisplayName}</p>
                    <p className="text-xs text-gray-400 mt-1">Instructor camera is off</p>
                  </div>
                </div>
              )}

              {/* Stage Teacher Badge */}
              <div className="absolute bottom-6 left-6 bg-black/70 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-2.5 z-10 border border-gray-700/60">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <span className="font-semibold">{teacherDisplayName}</span>
                <span className="bg-purple-600/80 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Instructor</span>
                <div className="flex items-center gap-1.5 pl-1.5 border-l border-gray-700">
                  {remoteTeacher.hasAudio ? (
                    <Mic size={13} className="text-green-400" />
                  ) : (
                    <MicOff size={13} className="text-red-400" />
                  )}
                  {remoteTeacher.hasVideo ? (
                    <Video size={13} className="text-green-400" />
                  ) : (
                    <VideoOff size={13} className="text-gray-400" />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-950 text-white">
              <div className="text-center p-8 max-w-md">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
                  <Users size={40} className="text-purple-400 opacity-70" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                  Waiting for Instructor {resolvedTeacherName ? `(${resolvedTeacherName})` : ''}
                </h3>
                <p className="text-sm text-gray-400">
                  The live instructor camera and whiteboard will appear here once the teacher enters the classroom.
                </p>
              </div>
            </div>
          )}

          {/* Admin PiP Video (Bottom-Right, shown when Admin turns on camera) */}
          {isVideoEnabled && (
            <div className="absolute bottom-6 right-6 w-56 h-40 bg-gray-900 rounded-xl overflow-hidden shadow-2xl border-2 border-purple-500 z-20">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                muted
                autoPlay
                playsInline
              />
              <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-xs text-purple-300 font-semibold">
                You (Admin)
              </div>
            </div>
          )}

          {/* Admin Badge (Top Left of Stage) */}
          <div className="absolute top-6 left-6 bg-gradient-to-r from-purple-700 to-indigo-700 text-white px-4 py-2 rounded-xl backdrop-blur-sm shadow-lg flex items-center gap-2 z-10">
            <Shield size={16} className="text-purple-200" />
            <span className="font-semibold text-sm">You (Admin)</span>
            <span className="text-[10px] bg-black/30 text-purple-200 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
              Observing
            </span>
            {isScreenSharing && (
              <span className="text-xs text-green-300 flex items-center gap-1 ml-2">
                <Monitor size={12} />
                Screen Sharing
              </span>
            )}
          </div>
          
          {/* Session ID Badge (Top Right of Stage) */}
          <div className="absolute top-6 right-6 bg-black/70 text-white px-3.5 py-1.5 rounded-xl backdrop-blur-sm text-xs z-10 border border-gray-800">
            <span className="text-gray-400 mr-1.5">Session ID:</span>
            <span className="font-mono font-bold text-purple-300">{sessionId}</span>
          </div>
        </div>

        {/* Right Sidebar - Categorized Participants */}
        <div className="w-96 bg-gradient-to-b from-gray-800 to-gray-900 p-5 flex flex-col overflow-hidden border-l border-gray-700 flex-shrink-0">
          {/* Sidebar Header */}
          <div className="mb-4 flex items-center justify-between pb-3 border-b border-gray-700">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <Users size={18} className="text-blue-400" />
              Participants
            </h3>
            <span className="bg-blue-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
              {remoteUsers.size + 1}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {/* 1. INSTRUCTOR SECTION */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs uppercase tracking-wider text-purple-300 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  Instructor
                </h4>
                {remoteTeacher && (
                  <span className="text-[11px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full font-semibold">
                    Live
                  </span>
                )}
              </div>

              {remoteTeacher ? (
                <div className="bg-gray-700/80 rounded-xl p-3 border border-purple-500/40 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-9 h-9 min-w-[36px] bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase shadow">
                        {teacherInitials}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-white font-semibold text-sm truncate max-w-[170px]" title={teacherDisplayName}>
                          {teacherDisplayName}
                        </p>
                        <span className="text-xs text-purple-300 font-mono">Teacher ID: {String(remoteTeacher.uid).slice(-4)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className={`p-1.5 rounded-lg text-xs ${
                        remoteTeacher.hasAudio ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`} title={remoteTeacher.hasAudio ? 'Audio Live' : 'Muted'}>
                        {remoteTeacher.hasAudio ? <Mic size={14} /> : <MicOff size={14} />}
                      </div>
                      <div className={`p-1.5 rounded-lg text-xs ${
                        remoteTeacher.hasVideo ? 'bg-green-500/20 text-green-300' : 'bg-gray-600 text-gray-400'
                      }`} title={remoteTeacher.hasVideo ? 'Camera Live' : 'Camera Off'}>
                        {remoteTeacher.hasVideo ? <Video size={14} /> : <VideoOff size={14} />}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800/80 rounded-xl p-3 border border-dashed border-gray-600 text-gray-400 text-xs flex items-center gap-2">
                  <Users size={16} className="text-gray-500" />
                  <span>Instructor ({resolvedTeacherName || 'Teacher'}) has not joined yet</span>
                </div>
              )}
            </div>

            {/* 2. STUDENTS SECTION */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs uppercase tracking-wider text-blue-300 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  Students ({remoteStudents.length})
                </h4>
                {remoteStudents.length > 0 && (
                  <button
                    onClick={handleMuteAllStudents}
                    className="flex items-center gap-1 px-2.5 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer"
                    title="Mute all students"
                  >
                    <VolumeX size={12} />
                    <span>Mute All</span>
                  </button>
                )}
              </div>

              {remoteStudents.length === 0 ? (
                <div className="text-gray-400 text-center py-8 bg-gray-800/40 rounded-xl border border-gray-700/40">
                  <Users size={28} className="text-gray-500 mx-auto mb-2" />
                  <p className="text-xs font-medium">No students connected yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {remoteStudents.map((user, studentIdx) => {
                    const studentName = 
                      studentNames.get(user.uid) || 
                      studentNames.get(Number(user.uid)) || 
                      studentNames.get(String(user.uid)) || 
                      (studentList[studentIdx] ? (studentList[studentIdx].name || studentList[studentIdx].Name) : null) || 
                      studentNames.get(studentIdx) || 
                      `Student #${studentIdx + 1}`;

                    const initials = studentName
                      .replace(/[^a-zA-Z0-9 ]/g, '')
                      .trim()
                      .split(' ')
                      .filter(Boolean)
                      .map(w => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase() || `S${studentIdx + 1}`;

                    return (
                      <div 
                        key={user.uid} 
                        className="bg-gray-700 rounded-xl overflow-hidden hover:bg-gray-650 transition-all duration-200 shadow-sm"
                      >
                        <div className="w-full h-44 bg-gray-900 relative">
                          <div 
                            id={`remote-video-${user.uid}`}
                            className="w-full h-full bg-gray-900 relative"
                          />
                          
                          {!user.hasVideo && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-800">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-1.5">
                                  <Users size={24} className="text-gray-500" />
                                </div>
                                <p className="text-[11px]">Camera off</p>
                              </div>
                            </div>
                          )}
                          
                          <div className="absolute top-2.5 left-2.5 bg-blue-600 text-white px-2 py-0.5 rounded text-[11px] font-bold z-10">
                            #{studentIdx + 1}
                          </div>
                          
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white z-10">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                            <span>Live</span>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-gradient-to-r from-gray-700 to-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-white font-semibold flex items-center gap-2 overflow-hidden">
                              <div className="w-7 h-7 min-w-[28px] bg-blue-500 rounded-full flex items-center justify-center text-[11px] font-bold text-white uppercase">
                                {initials}
                              </div>
                              <span className="truncate max-w-[170px] text-xs" title={studentName}>{studentName}</span>
                            </div>
                            <span className="text-[11px] text-gray-400 font-mono">ID: {String(user.uid).slice(-4)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleToggleStudentAudio(user.uid, user.hasAudio)}
                              disabled={!user.hasAudio}
                              className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded text-xs font-semibold transition ${
                                user.hasAudio 
                                  ? 'bg-red-500/20 text-red-300 hover:bg-red-600 hover:text-white border border-red-500/40 cursor-pointer' 
                                  : 'bg-gray-800 text-gray-500 border border-gray-700/60 cursor-not-allowed opacity-75'
                              }`}
                              title={user.hasAudio ? `Mute ${studentName}` : `${studentName} is muted`}
                            >
                              {user.hasAudio ? <Mic size={13} className="text-green-400" /> : <MicOff size={13} className="text-red-400" />}
                              <span>{user.hasAudio ? 'Mute Mic' : 'Muted'}</span>
                            </button>
                            
                            <button
                              onClick={() => handleToggleStudentVideo(user.uid, user.hasVideo)}
                              disabled={!user.hasVideo}
                              className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded text-xs font-semibold transition ${
                                user.hasVideo 
                                  ? 'bg-red-500/20 text-red-300 hover:bg-red-600 hover:text-white border border-red-500/40 cursor-pointer' 
                                  : 'bg-gray-800 text-gray-500 border border-gray-700/60 cursor-not-allowed opacity-75'
                              }`}
                              title={user.hasVideo ? `Turn off ${studentName}'s camera` : `${studentName}'s camera is off`}
                            >
                              {user.hasVideo ? <Video size={13} className="text-green-400" /> : <VideoOff size={13} className="text-gray-400" />}
                              <span>{user.hasVideo ? 'Cam Off' : 'Cam Off'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. OTHER ADMINS (IF ANY) */}
            {remoteAdmins.length > 0 && (
              <div className="pt-2 border-t border-gray-700/60">
                <h4 className="text-[11px] uppercase tracking-wider text-purple-300 font-bold mb-2">
                  Other Observers ({remoteAdmins.length})
                </h4>
                {remoteAdmins.map(admin => (
                  <div key={admin.uid} className="bg-purple-900/30 border border-purple-500/40 rounded-xl p-2.5 flex items-center justify-between text-xs text-purple-200">
                    <span className="font-semibold">Administrator</span>
                    <span className="text-[10px] font-mono text-purple-300">ID: {String(admin.uid).slice(-4)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Bottom Controls Bar */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-850 to-gray-900 px-8 py-4 border-t border-gray-850 flex-shrink-0">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-white">
            <Clock size={16} className="text-purple-400" />
            <span className="text-sm font-medium">{sessionTitle || 'Teaching Session'}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAudio}
              className={`p-3.5 rounded-xl transition-all ${
                isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              }`}
              title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
            >
              {isAudioEnabled ? <Mic size={20} className="text-white" /> : <MicOff size={20} className="text-white" />}
            </button>

            <button
              onClick={toggleVideo}
              className={`p-3.5 rounded-xl transition-all ${
                isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              }`}
              title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
            >
              {isVideoEnabled ? <Video size={20} className="text-white" /> : <VideoOff size={20} className="text-white" />}
            </button>

            <button
              onClick={isScreenSharing ? stopScreenShare : startScreenShare}
              className={`p-3.5 rounded-xl transition-all ${
                isScreenSharing ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
            >
              <Monitor size={20} className="text-white" />
            </button>

            <button
              onClick={toggleWhiteboard}
              disabled={loadingWhiteboard}
              className={`p-3.5 rounded-xl transition-all ${
                showWhiteboard ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'
              } ${loadingWhiteboard ? 'opacity-50' : ''}`}
              title={showWhiteboard ? 'Hide whiteboard' : 'Show whiteboard'}
            >
              {loadingWhiteboard ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <PenTool size={20} className="text-white" />
              )}
            </button>

            <button
              onClick={leaveSession}
              className="flex items-center gap-2 px-5 py-3.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold shadow-md ml-2"
            >
              <PhoneOff size={18} />
              <span>Leave</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-white">
            <Users size={16} className="text-blue-400" />
            <span className="text-sm font-semibold">{remoteStudents.length} Students</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgoraVideoSession;
