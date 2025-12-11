import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { LoginForm } from './components/LoginForm';
import { SignUpForm } from './components/SignUpForm';
import { VerifyOtp } from './components/VerifyOtp';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';
import { AddCertificateForm } from './components/AddCertificateForm';
import { AdminDashboard } from './components/AdminDashboard';
import { UserRole, ViewState, User } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Temporary state for auth flows
  const [pendingUserId, setPendingUserId] = useState<string>('');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [resetEmail, setResetEmail] = useState<string>('');

  const isAuthenticated = !!token;

  // Handle Theme Toggle
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Apply Dark Mode class and Check for Persisted Session on Mount
  useEffect(() => {
    // Theme logic
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Check LocalStorage for Remember Me
  useEffect(() => {
    const storedToken = localStorage.getItem('skillchain_token');
    const storedUser = localStorage.getItem('skillchain_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setCurrentView('DASHBOARD');
      } catch (e) {
        console.error("Failed to parse stored user data");
        localStorage.removeItem('skillchain_token');
        localStorage.removeItem('skillchain_user');
      }
    }
  }, []);

  const handleLoginSuccess = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    setCurrentView('DASHBOARD');
  };

  const handlePendingVerification = (userId: string, email: string) => {
    setPendingUserId(userId);
    setPendingEmail(email);
    setCurrentView('VERIFY_OTP');
  };

  const handleSignUpSuccess = (userId: string, email: string) => {
    setPendingUserId(userId);
    setPendingEmail(email);
    setCurrentView('VERIFY_OTP');
  };

  const handleVerified = (authToken: string, userData: User) => {
    setToken(authToken);
    setUser(userData);
    setCurrentView('DASHBOARD');
    
    // If they were verifying, we might want to persist if they chose remember me previously,
    // but typically verification happens once. We'll default to session-only here unless manually added.
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    // Clear persistent storage
    localStorage.removeItem('skillchain_token');
    localStorage.removeItem('skillchain_user');
    setCurrentView('LANDING');
  };

  const handleNavigate = (view: ViewState) => {
      if (view === 'DASHBOARD' && !isAuthenticated) {
          setCurrentView('LOGIN');
          return;
      }
      setCurrentView(view);
  };

  const handleForgotPassword = () => {
    setCurrentView('FORGOT_PASSWORD');
  };

  const handleResetCodeSent = (email: string) => {
    setResetEmail(email);
    setCurrentView('RESET_PASSWORD');
  };

  const handlePasswordResetSuccess = () => {
    setCurrentView('LOGIN');
    alert("Password reset successfully. Please login with your new password.");
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar 
        isAuthenticated={isAuthenticated} 
        role={user?.role} 
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <main className="flex-grow w-full flex flex-col">
        {currentView === 'LANDING' && (
            <LandingPage onNavigate={handleNavigate} />
        )}

        {currentView === 'LOGIN' && (
            <LoginForm 
                onLoginSuccess={handleLoginSuccess}
                onPendingVerification={handlePendingVerification}
                onCancel={() => setCurrentView('LANDING')} 
                onSwitchToSignup={() => setCurrentView('SIGNUP')}
                onForgotPassword={handleForgotPassword}
                isDarkMode={isDarkMode}
            />
        )}

        {currentView === 'SIGNUP' && (
            <SignUpForm
                onSuccess={handleSignUpSuccess}
                onCancel={() => setCurrentView('LANDING')}
                onSwitchToLogin={() => setCurrentView('LOGIN')}
                isDarkMode={isDarkMode}
            />
        )}

        {currentView === 'VERIFY_OTP' && (
            <VerifyOtp
                userId={pendingUserId}
                email={pendingEmail}
                onVerified={handleVerified}
                onCancel={() => setCurrentView('LOGIN')}
            />
        )}

        {currentView === 'FORGOT_PASSWORD' && (
            <ForgotPassword
                onCodeSent={handleResetCodeSent}
                onCancel={() => setCurrentView('LOGIN')}
            />
        )}

        {currentView === 'RESET_PASSWORD' && (
            <ResetPassword
                email={resetEmail}
                onSuccess={handlePasswordResetSuccess}
                onCancel={() => setCurrentView('LOGIN')}
            />
        )}

        {currentView === 'ADD_CERTIFICATE' && (
          <AddCertificateForm
            issuerName={user?.name || 'Unknown Institute'}
            onCancel={() => setCurrentView('DASHBOARD')}
            onSuccess={() => setCurrentView('DASHBOARD')}
          />
        )}

        {currentView === 'DASHBOARD' && (
            user?.role === UserRole.ADMIN ? (
              <AdminDashboard />
            ) : (
              <Dashboard 
                userRole={user?.role}
                userName={user?.name}
                onAddCertificate={() => setCurrentView('ADD_CERTIFICATE')}
              />
            )
        )}
      </main>

      {/* Footer - Hide on Login/Signup to match the "App like" feel of the design */}
      {currentView !== 'LOGIN' && currentView !== 'SIGNUP' && (
        <footer className={`border-t mt-auto transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center text-sm">
                  <p>&copy; 2024 SkillChain Credentials. All rights reserved.</p>
                  <div className="flex gap-6 mt-4 md:mt-0">
                      <a href="#" className="hover:text-indigo-500 transition-colors">Privacy Policy</a>
                      <a href="#" className="hover:text-indigo-500 transition-colors">Terms of Service</a>
                      <a href="#" className="hover:text-indigo-500 transition-colors">Contact Support</a>
                  </div>
              </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;