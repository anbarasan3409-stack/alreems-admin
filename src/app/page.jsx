'use client';
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { COLORS } from "@/theme/themeConstants";

export default function Home() {
  const { isAuthenticated, loading, justLoggedOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect if user just logged out, unless we're in callback
    const isCallbackFlow = typeof window !== 'undefined' && 
                          (window.location.search.includes('callback') || 
                           document.referrer.includes('/auth/callback'));
    
    if (!loading && isAuthenticated && (!justLoggedOut || isCallbackFlow)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, justLoggedOut, router]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: COLORS.background }}>
        <div className="bg-white rounded-3xl shadow-card p-8 flex flex-col items-center gap-6 min-w-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: COLORS.primary }}></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && !justLoggedOut) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: COLORS.background }}>
      <div className="bg-white rounded-3xl shadow-card p-8 flex flex-col items-center gap-6 min-w-[400px] border border-gray-200">
        <Image
          src="/assets/logo.png"
          alt="Al Reems Logo"
          width={120}
          height={70}
          className="mb-4"
        />
        <h1 className="text-3xl font-bold text-center" style={{ color: COLORS.primary }}>
          Alreems Admin Portal
        </h1>
        <p className="text-base text-gray-700 text-center mb-4 max-w-sm">
          Secure access to your administration dashboard and manage the platform with ease.
        </p>
        <a
          href={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/auth/admin/google/login`}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full font-semibold text-lg shadow-card transition-colors hover:opacity-90"
          style={{ backgroundColor: COLORS.secondary, color: COLORS.background }}
        >
          <Image src="/assets/icons/google.png" alt="Google" width={24} height={24} />
          Sign in with Google
        </a>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg w-full">
          <p className="text-sm text-blue-800 text-center">
          Admin access required. All login attempts are monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
