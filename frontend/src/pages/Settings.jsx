import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User,
  Download,
  Trash2,
  ChevronRight,
  Shield,
  FileDown,
  AlertTriangle,
  Settings as SettingsIcon,
  HelpCircle
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { authAPI, userAPI } from '../services/api';
import DeleteAccountModal from '../components/DeleteAccountModal';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';

const Settings = () => {
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { showToast } = useToast();
  const dispatch = useDispatch();

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Change Password functionality removed per request

  const handleDeleteAccount = async (currentPassword) => {
    try {
      await userAPI.deleteAccount(currentPassword);
      showToast({ type: 'success', message: 'Account deleted successfully' });
      // logout and redirect
      await dispatch(logoutUser());
      window.location.href = '/';
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete account';
      throw new Error(msg);
    }
  };

  const ToggleSwitch = ({ enabled, onToggle, label, description }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h4 className="text-base font-semibold text-gray-900">{label}</h4>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
          enabled ? 'bg-black' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SettingCard = ({ icon: Icon, title, description, children, className = "" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-gray-600" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
          {children}
        </div>
      </div>
    </motion.div>
  );

  const ActionButton = ({ onClick, variant = "primary", icon: Icon, children, className = "" }) => {
    const baseClasses = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
    
    const variantClasses = {
      primary: "bg-black text-white hover:bg-black focus:ring-black",
      secondary: "bg-[#FFF8ED] text-gray-900 hover:bg-[#F5EFE6] focus:ring-black border border-[#EADFD0]",
      danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500",
      outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-black"
    };

    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {Icon && <Icon className="w-4 h-4" />}
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF7F2' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-6 h-6 text-gray-900" />
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600">Manage your account security and preferences.</p>
        </motion.div>

        {/* Settings Grid */}
        <div className="space-y-6">

          {/* Password Recovery */}
          <SettingCard
            icon={HelpCircle}
            title="Password Recovery"
            description="Reset your password if you've forgotten it or need assistance"
          >
            <div className="space-y-6">
              {/* Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900">Forgot Password</h4>
                  <p className="text-sm text-gray-500 mt-1">Reset your password via email if you can't remember it</p>
                </div>
                <ActionButton 
                  variant="secondary" 
                  icon={HelpCircle}
                  onClick={() => window.location.href = '/forgot-password?from=settings'}
                >
                  Reset Password
                </ActionButton>
              </div>
            </div>
          </SettingCard>

          {/* Danger Zone */}
          <SettingCard
            icon={AlertTriangle}
            title="Danger Zone"
            description="Irreversible actions that will permanently affect your account"
            className="border-red-200 bg-red-50/30"
          >
            <div className="bg-white rounded-lg border border-red-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-red-900">Delete Account</h4>
                  <p className="text-sm text-red-600 mt-1">Permanently delete your account and all associated data. This action cannot be undone.</p>
                </div>
                <ActionButton variant="danger" icon={Trash2} onClick={() => setIsDeleteModalOpen(true)}>
                  Delete Account
                </ActionButton>
              </div>
            </div>
          </SettingCard>
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500">
            Need help with your account? <a href="#" className="text-black hover:opacity-80 font-medium">Contact Support</a>
          </p>
        </motion.div>
      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteAccount}
      />
    </div>
  );
};

export default Settings;