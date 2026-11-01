'use client';
import { useState, useEffect } from 'react';
import { BookOpen, TrendingUp, Users, Shield, CheckCircle, Settings } from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import StatsService from '@/services/stats/statsService';

export default function DashboardContent() {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalCourses: 0,
    totalStudents: 0,
    totalAdmins: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await StatsService.getStats();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Teachers',
      value: loading ? '...' : stats.totalTeachers.toString(),
      icon: Users,
      color: COLORS.secondary,
      change: 'Active teachers',
      changeType: 'neutral'
    },
    {
      title: 'Active Courses',
      value: loading ? '...' : stats.totalCourses.toString(),
      icon: BookOpen,
      color: COLORS.primary,
      change: 'Total courses',
      changeType: 'neutral'
    },
    {
      title: 'Total Students',
      value: loading ? '...' : stats.totalStudents.toLocaleString(),
      icon: TrendingUp,
      color: '#4CAF50',
      change: 'Enrolled students',
      changeType: 'neutral'
    },
    {
      title: 'Total Admins',
      value: loading ? '...' : stats.totalAdmins.toString(),
      icon: Shield,
      color: '#FF9800',
      change: 'System administrators',
      changeType: 'neutral'
    }
  ];

  const recentActivities = [
    {
      type: 'teacher',
      message: 'New teacher John Smith joined the platform',
      time: '2 hours ago',
      icon: Users
    },
    {
      type: 'course',
      message: 'Advanced Mathematics course created',
      time: '4 hours ago',
      icon: BookOpen
    },
    {
      type: 'system',
      message: 'System backup completed successfully',
      time: '6 hours ago',
      icon: CheckCircle
    },
    {
      type: 'student',
      message: '500+ students enrolled this week',
      time: '1 day ago',
      icon: TrendingUp
    },
    {
      type: 'maintenance',
      message: 'Scheduled maintenance completed',
      time: '2 days ago',
      icon: Settings
    }
  ];

  const systemAlerts = [
    {
      type: 'info',
      message: 'Server maintenance scheduled for tonight',
      time: '3 hours from now',
      priority: 'low'
    },
    {
      type: 'warning',
      message: 'High traffic detected on Mathematics courses',
      time: '1 hour ago',
      priority: 'medium'
    },
    {
      type: 'success',
      message: 'All systems operating normally',
      time: '30 minutes ago',
      priority: 'low'
    }
  ];

  const getAlertColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.primary }}>Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your platform management.</p>
      </div>

      {/* Stats Cards */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading statistics</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={fetchStats}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}
      
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
                    'bg-blue-100 text-blue-700'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold mb-1" style={{ color: COLORS.text }}>
                  {loading ? (
                    <span className="inline-block animate-pulse">...</span>
                  ) : (
                    stat.value
                  )}
                </p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
