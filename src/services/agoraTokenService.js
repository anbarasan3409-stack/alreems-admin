import apiInstance from '@/api/apiInstance';

export const agoraTokenService = {
  // Get Agora App ID with backend API fallback
  getAppId: async () => {
    const envAppId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    if (envAppId && envAppId !== 'your_agora_app_id_here') {
      return envAppId;
    }

    try {
      const response = await apiInstance.get('/admin/agora/app-id');
      if (response.data && response.data.appId && response.data.appId !== 'YOUR_AGORA_APP_ID') {
        return response.data.appId;
      }
    } catch (error) {
      console.warn('Failed to fetch Agora App ID from backend:', error);
    }

    return envAppId || '6065f596110e4a77b311d3316f33a6f2';
  },

  // Generate token for joining a channel as an admin
  generateToken: async (channelName, userRole = 'host') => {
    try {
      try {
        // Admin token endpoint is a GET request to /api/admin/rtc-token
        const response = await apiInstance.get('/admin/rtc-token', {
          params: {
            channelName,
            uid: 0,
            role: userRole === 'host' ? 'teacher' : 'student' // Admin usually takes teacher/host role
          }
        });
        
        if (response.data && response.data.token) {
          return response.data.token;
        }
      } catch (error) {
        console.error('Error fetching admin RTC token:', error);
      }
      // Fallback to null token for development or when server token fails
      // This works when App Certificate is not enabled in Agora Console
      return null;
      
    } catch (error) {
      return null;
    }
  },

  // Validate Agora App ID
  validateAppId: () => {
    if (typeof window === 'undefined') return false; // SSR safety
    
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    if (!appId || appId === 'your_agora_app_id_here') {
      return false;
    }
    
    return true;
  },

  // Check if App Certificate is enabled (for debugging)
  checkAppCertificate: async (channelName) => {
    // This is a diagnostic function to help troubleshoot
  }
};

export default agoraTokenService;
