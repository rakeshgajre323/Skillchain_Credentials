import React from 'react';
import { UserRole, ViewState } from '../types';

interface NavbarProps {
  isAuthenticated: boolean;
  role?: UserRole;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, role, onNavigate, onLogout, isDarkMode, toggleTheme }) => {
  return (
    <nav className={`border-b sticky top-0 z-50 h-16 transition-colors duration-300 ${isDarkMode ? 'bg-black/90 border-neutral-800 text-white backdrop-blur-md' : 'bg-white border-slate-200 text-slate-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo Section */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate(isAuthenticated ? 'DASHBOARD' : 'LANDING')}
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>SkillChain</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-neutral-800 text-yellow-300' : 'hover:bg-slate-100 text-slate-600'}`}
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <i className="fas fa-sun text-lg"></i>
              ) : (
                <i className="fas fa-moon text-lg"></i>
              )}
            </button>

            <div className={`hidden md:flex items-center gap-2 cursor-pointer ${isDarkMode ? 'text-neutral-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              <i className="fas fa-globe"></i>
              <span className="text-sm font-medium">EN</span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-sm hidden md:block">
                  <span className="font-semibold text-indigo-500">{role}</span>
                </span>
                <button
                  onClick={onLogout}
                  className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${isDarkMode ? 'text-neutral-300 hover:text-white hover:bg-neutral-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-4">
                <button 
                  onClick={() => onNavigate('LOGIN')}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/20 text-sm font-semibold flex items-center gap-2"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};