import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { LoginForm } from './components/LoginForm';
import { UserRole, ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole | undefined>(undefined);

  const handleLogin = (userRole: UserRole) => {
    setIsAuthenticated(true);
    setRole(userRole);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRole(undefined);
    setCurrentView('LANDING');
  };

  const handleNavigate = (view: ViewState) => {
      // Prevent accessing dashboard if not authenticated
      if (view === 'DASHBOARD' && !isAuthenticated) {
          setCurrentView('LOGIN');
          return;
      }
      setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar 
        isAuthenticated={isAuthenticated} 
        role={role} 
        onNavigate={handleNavigate}
        onLogout={handleLogout} 
      />

      <main className="flex-grow w-full">
        {currentView === 'LANDING' && (
            <LandingPage onNavigate={handleNavigate} />
        )}

        {currentView === 'LOGIN' && (
            <LoginForm 
                onLogin={handleLogin} 
                onCancel={() => setCurrentView('LANDING')} 
            />
        )}

        {currentView === 'DASHBOARD' && (
            <Dashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                <p>&copy; 2024 SkillChain Credentials. All rights reserved.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-indigo-600 transition-colors">Contact Support</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;