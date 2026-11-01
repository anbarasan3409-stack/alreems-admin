import { useState } from 'react';
import { Search, Settings, User, LogOut, Menu, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { COLORS } from '@/theme/themeConstants';
import { useAuth } from '@/context/AuthContext';
import ToastService from '@/utils/ToastService';

export default function Topbar({ onMenuClick }) {
  const { logout, user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleProfileAction = (action) => {

    setShowProfileMenu(false);
    
    switch (action) {
      case 'profile':
        ToastService.info('Opening profile settings...');
        break;
      case 'settings':
        ToastService.info('Opening system settings...');
        break;
      case 'logout':
        // Logout toast is handled in AuthContext
        logout();
        break;
      default:
        break;
    }
  };
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button and search */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          {/* <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search students, teachers, sessions..."
              className="w-80 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 placeholder-gray-500"
            />
          </div> */}
        </div>

        {/* Right side - Notifications and profile */}
        <div className="flex items-center gap-4">
          {/* Search button for mobile */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden">
            <Search size={20} className="text-gray-600" />
          </button>

          {/* Profile menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: `linear-gradient(135deg, ${COLORS.secondary}, ${COLORS.secondary}80)` }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium" style={{ color: COLORS.text }}>{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </button>

            {/* Profile dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-medium" style={{ color: COLORS.text }}>{user?.name || 'Admin User'}</p>
                  <p className="text-sm text-gray-600">{user?.email || 'admin@alreems.com'}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => handleProfileAction('profile')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                  >
                    <User size={16} />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => handleProfileAction('settings')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                  >
                    <Settings size={16} />
                    System Settings
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button
                    onClick={() => handleProfileAction('logout')}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="mt-4 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search students, teachers, sessions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 placeholder-gray-500"
          />
        </div>
      </div>
    </div>
  );
}
