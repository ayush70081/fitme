// components/DashboardLayout.jsx

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Hidden on mobile by default */}
      <div 
        className={`hidden md:block ${mobileMenuOpen ? 'block' : 'hidden'} md:block`}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        <Sidebar 
          isExpanded={sidebarExpanded} 
          isMobile={false}
          onClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative">
            <Sidebar 
              isExpanded={true} 
              isMobile={true}
              onClose={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <div 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          sidebarExpanded ? 'md:ml-56' : 'md:ml-16'
        } ml-0`}
      >
        {/* Mobile Header */}
        <div className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            FitMe<span className="text-pink-400">+</span>
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="h-full overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 