'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthCallback() {
  const { checkAuthStatus, isAuthenticated, loading, clearLogoutState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {

        
        // Clear logout flag since we're in a successful login callback
        clearLogoutState();

        
        // Small delay to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Force check auth status
        await checkAuthStatus();
        
      } catch (error) {
        console.error('Auth callback error:', error);
        router.push('/');
      }
    };

    handleCallback();
  }, [checkAuthStatus, router, clearLogoutState]);

  useEffect(() => {

    if (!loading) {
      if (isAuthenticated) {

        router.push('/dashboard');
      } else {

        router.push('/');
      }
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
        <p className="mt-2 text-sm text-gray-500">
          Loading: {loading.toString()}, Authenticated: {isAuthenticated.toString()}
        </p>
      </div>
    </div>
  );
}
