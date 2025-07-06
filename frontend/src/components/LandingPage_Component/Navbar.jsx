// components/Navbar.jsx

import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { Link } from 'react-scroll';
import { Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, User, LogOut, Settings, ChevronDown } from 'lucide-react';

const navItems = ['home', 'why us', 'features','plans' ,'FAQs'];

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const tabRefs = useRef({});
  const profileDropdownRef = useRef(null);
  const [underlineProps, setUnderlineProps] = useState({ left: 0, width: 0 });
  const { isAuthenticated, user, logout } = useAuth();

  // Update underline position when activeTab changes
  useLayoutEffect(() => {
    const current = tabRefs.current[activeTab];
    if (current) {
      const { offsetLeft, offsetWidth } = current;
      setUnderlineProps({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeTab]);

  // Scroll handler to update activeTab based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 70; // Adjust 70 to your navbar height + offset

      let currentSection = activeTab;

      for (const section of navItems) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            currentSection = section;
            break;
          }
        }
      }

      if (currentSection !== activeTab) {
        setActiveTab(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Call it initially to set active tab on page load
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeTab]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
      {/* Logo */}
          <motion.div 
            className="flex items-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
              FitMe<span className="text-pink-500">+</span>
      </div>
          </motion.div>

          {/* Desktop Nav Tabs */}
          <div className="hidden lg:flex items-center">
            <div className="relative flex gap-8 text-sm font-medium">
        {/* Animated Underline */}
        <motion.div
                className="absolute bottom-0 h-[3px] bg-gradient-to-r from-pink-400 to-pink-600 rounded-full"
          animate={underlineProps}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ position: 'absolute' }}
        />

        {navItems.map((item) => (
          <div
            key={item}
            ref={(el) => (tabRefs.current[item] = el)}
                  className="relative px-3 py-2"
          >
            <Link
              to={item}
              smooth={true}
              duration={50}
              offset={-60}
                    onClick={() => setActiveTab(item)}
                    onSetActive={() => setActiveTab(item)}
                    className={`cursor-pointer capitalize transition-all duration-300 ${
                      activeTab === item 
                        ? 'text-pink-600 font-semibold' 
                        : 'text-gray-600 hover:text-pink-500'
                    }`}
            >
              {item}
            </Link>
          </div>
        ))}
            </div>
      </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-4">
        {isAuthenticated ? (
              <div className="flex items-center gap-4">
            <RouterLink 
              to="/dashboard" 
                  className="flex items-center gap-2 text-gray-700 hover:text-pink-600 font-medium transition-colors duration-200"
            >
                  <User className="w-4 h-4" />
              Dashboard
            </RouterLink>
                
                {/* Profile Dropdown */}
                <div className="relative" ref={profileDropdownRef}>
                  <motion.button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-md"
                  >
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                      {getUserInitials(user?.name)}
                    </div>
                    <span className="hidden sm:block">{user?.name?.split(' ')[0] || 'User'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                              {getUserInitials(user?.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{user?.name}</p>
                              <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <RouterLink 
                            to="/dashboard/profile" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200"
                          >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                          </RouterLink>
                          
                          <RouterLink 
                            to="/dashboard/settings" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors duration-200"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </RouterLink>

                          <div className="border-t border-gray-100 mt-2 pt-2">
              <button 
                              onClick={() => {
                                logout();
                                setIsProfileDropdownOpen(false);
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                              <LogOut className="w-4 h-4" />
                              <span>Logout</span>
              </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <RouterLink 
                  to="/login" 
                  className="text-gray-700 hover:text-pink-600 font-medium transition-colors duration-200"
                >
                  Login
                </RouterLink>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RouterLink 
                    to="/register" 
                    className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 transition-all duration-200 shadow-md"
                  >
                    Register
                  </RouterLink>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-pink-600 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{
            height: isMobileMenuOpen ? 'auto' : 0,
            opacity: isMobileMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="lg:hidden overflow-hidden"
        >
          <div className="py-4 space-y-4 border-t border-gray-100">
            {/* Mobile Nav Items */}
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item}
                  to={item}
                  smooth={true}
                  duration={50}
                  offset={-60}
                  onClick={() => {
                    setActiveTab(item);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block px-4 py-2 rounded-lg capitalize transition-all duration-200 ${
                    activeTab === item 
                      ? 'bg-pink-50 text-pink-600 font-semibold' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-pink-500'
                  }`}
                >
                  {item}
                </Link>
              ))}
            </div>

            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                        {getUserInitials(user?.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <RouterLink 
                    to="/dashboard" 
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-pink-600 font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </RouterLink>

                  <RouterLink 
                    to="/dashboard/profile" 
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-pink-600 font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </RouterLink>

                  <RouterLink 
                    to="/dashboard/settings" 
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-pink-600 font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </RouterLink>

                  <button 
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
          </>
        ) : (
                <div className="space-y-2">
            <RouterLink 
              to="/login" 
                    className="block px-4 py-2 text-gray-700 hover:text-pink-600 font-medium transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </RouterLink>
            <RouterLink 
              to="/register" 
                    className="block w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-pink-700 transition-all duration-200 text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
            >
              Register
            </RouterLink>
                </div>
        )}
            </div>
          </div>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar;
