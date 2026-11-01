import { Home, Calendar, Users, User, LogOut, BookOpen, Settings, GraduationCap, CreditCard, MessageSquare, Star } from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import { useAuth } from '@/context/AuthContext';
import ToastService from '@/utils/ToastService';

export default function Sidebar({ activeComponent, onMenuClick, isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home
    },
    {
      id: 'sessions',
      label: 'Session',
      icon: Calendar
    },
    {
      id: 'students',
      label: 'Students',
      icon: Users
    },
    {
      id: 'teachers',
      label: 'Teachers',
      icon: GraduationCap
    },
    {
      id: 'courses',
      label: 'Courses',
      icon: BookOpen
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: CreditCard
    },
    {
      id: 'enquiries',
      label: 'Enquiries',
      icon: MessageSquare
    },
    {
      id: 'feedbacks',
      label: 'Feedbacks',
      icon: Star
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64  border-r border-gray-200 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{ backgroundColor: COLORS.background }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-center gap-3">
            <img src="/assets/logo.png" alt="Al Reems Logo" style={{ width: 120, height: 60, objectFit: 'contain' }} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style jsx>{`
            nav::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onMenuClick(item.id);
                    onClose();
                    ToastService.info(`Opening ${item.label}...`);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium"
                  style={
                    activeComponent === item.id
                      ? {
                          backgroundColor: COLORS.secondary,
                          color: COLORS.background,
                          boxShadow: '0 4px 12px rgba(57, 73, 171, 0.15)',
                        }
                      : {
                          color: COLORS.text,
                        }
                  }
                  onMouseEnter={(e) => {
                    if (activeComponent !== item.id) {
                      e.target.style.backgroundColor = '#F9FAFB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeComponent !== item.id) {
                      e.target.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${COLORS.secondary}, rgba(57, 73, 171, 0.7))`,
                minWidth: '48px',
                minHeight: '48px'
              }}
            >
              {user?.name ? (
                <span className="text-white font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User size={20} className="text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold" style={{ color: COLORS.text }}>
                {user?.name || 'Admin User'}
              </p>
              <p
                className="text-sm truncate"
                style={{
                  color: COLORS.text,
                  maxWidth: '100%'
                }}
                title={user?.email || 'admin@alreems.com'}
              >
                {user?.email || 'admin@alreems.com'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
