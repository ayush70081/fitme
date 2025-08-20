// components/Sidebar.jsx

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Dumbbell,
  Utensils,
  Sparkles,
  Target,
  Lock,
  User,
  LogOut,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Workouts', icon: Dumbbell, path: '/dashboard/workouts' },
  { label: 'Smart Meals', icon: Utensils, path: '/dashboard/nutrition' },
  { label: 'Fitness AI', icon: Sparkles, path: '/dashboard/ai-coach' },
  { label: 'Analytics', icon: Target, path: '/dashboard/progress' },
  { label: 'Account & Security', icon: Lock, path: '/dashboard/settings' },
  { label: 'My Profile', icon: User, path: '/dashboard/profile' },
];

export default function Sidebar({ isExpanded = false, isMobile = false, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/');
    }
  };

  return (
    <div
      className={`
        fixed top-0 left-0 h-full z-50 bg-[#FFF8ED] border-r border-[#EADFD0] shadow-md
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-56' : 'w-16'}
        ${isMobile ? 'w-56' : ''}
        rounded-tr-2xl rounded-br-2xl overflow-hidden
      `}
    >
      <div className="h-full flex flex-col px-2">
        {/* Logo Section */}
        <div className="pt-6 pb-8 flex items-center justify-between px-2">
          {(isExpanded || isMobile) ? (
            <div className="flex-1 pl-2 text-2xl font-bold text-gray-900">
              FitMe+
            </div>
          ) : (
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold mx-auto">
              F
            </div>
          )}
          
          {/* Close button for mobile */}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 text-gray-700 hover:bg-[#F5EFE6] rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && onClose && onClose()}
                className={`
                  flex items-center relative z-10
                  transition-colors duration-200
                  ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-700 hover:bg-[#F5EFE6]'}
                  ${(isExpanded || isMobile) ? 'px-4 py-3 rounded-xl gap-3' : 'px-3 py-3 justify-center'}
                `}
              >
                {isActive && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="absolute inset-0 bg-[#F5EFE6] rounded-xl z-0"
                  />
                )}
                <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 relative z-10">
                  <Icon size={20} className={`${isActive ? 'text-gray-900' : 'text-gray-700'}`} />
                </div>
                {(isExpanded || isMobile) && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="whitespace-nowrap relative z-10"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={() => {
              setShowLogoutConfirm(true);
              isMobile && onClose && onClose();
            }}
            className={`
              flex items-center relative z-10
              transition-colors duration-200
              text-red-700 hover:bg-red-50
              ${(isExpanded || isMobile) ? 'px-4 py-3 rounded-xl gap-3' : 'px-3 py-3 justify-center'}
            `}
          >
            <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 relative z-10">
              <LogOut size={20} className="text-red-700" />
            </div>
            {(isExpanded || isMobile) && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="whitespace-nowrap relative z-10"
              >
                Logout
              </motion.span>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-auto mb-4 text-xs text-gray-500 text-center">
          {(isExpanded || isMobile) && '© 2025 FitMe+'}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Logout</h3>
            </div>
            <div className="p-4 text-sm text-gray-700">
              Are you sure you want to logout?
            </div>
            <div className="p-4 flex justify-end gap-2 border-t border-gray-100">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 