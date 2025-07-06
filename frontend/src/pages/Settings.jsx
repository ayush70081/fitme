import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User,
  Download,
  Trash2,
  ChevronRight,
  Shield,
  Key,
  FileDown,
  AlertTriangle,
  Settings as SettingsIcon
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { authAPI, userAPI } from '../services/api';
import PasswordChangeModal from '../components/PasswordChangeModal';
import DeleteAccountModal from '../components/DeleteAccountModal';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../store/authSlice';

const Settings = () => {
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { showToast } = useToast();
  const dispatch = useDispatch();

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePasswordChange = async (passwordData) => {
    try {
      const response = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword
      });

      showToast({
        type: 'success',
        message: 'Password updated successfully!'
      });

      setIsPasswordModalOpen(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update password';
      throw new Error(errorMessage);
    }
  };

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
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
          enabled ? 'bg-pink-500' : 'bg-gray-200'
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
      primary: "bg-pink-500 text-white hover:bg-pink-600 focus:ring-pink-500",
      secondary: "bg-blue-50 text-blue-600 hover:bg-blue-100 focus:ring-blue-500",
      danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500",
      outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-4 h-4 text-pink-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600">Manage your account security and preferences.</p>
        </motion.div>

        {/* Settings Grid */}
        <div className="space-y-6">
          {/* Security Settings */}
          <SettingCard
            icon={Shield}
            title="Security"
            description="Protect your account with additional security measures"
          >
            <div className="space-y-6">
              {/* Two-Factor Authentication */}
              <ToggleSwitch
                enabled={settings.twoFactorAuth}
                onToggle={(value) => handleSettingChange('twoFactorAuth', value)}
                label="Two-Factor Authentication"
                description="Add an extra layer of security to your account with SMS or app-based verification"
              />
              
              <hr className="border-gray-200" />
              
              {/* Change Password */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900">Password</h4>
                  <p className="text-sm text-gray-500 mt-1">Update your account password regularly for security</p>
                </div>
                <ActionButton 
                  variant="outline" 
                  icon={Key}
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  Change Password
                </ActionButton>
              </div>
            </div>
          </SettingCard>

          {/* Data Management */}
          <SettingCard
            icon={FileDown}
            title="Data Management"
            description="Control your personal data and account information"
          >
            <div className="space-y-6">
              {/* Export Data */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900">Export Your Data</h4>
                  <p className="text-sm text-gray-500 mt-1">Download a copy of all your fitness data, workouts, and progress</p>
                </div>
                <ActionButton variant="secondary" icon={Download}>
                  Export Data
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
            Need help with your account? <a href="#" className="text-pink-600 hover:text-pink-700 font-medium">Contact Support</a>
          </p>
        </motion.div>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordChange}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteAccount}
      />
    </div>
  );
};

export default Settings;