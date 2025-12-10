import React, { useState } from 'react';
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
  
  // Temporary state for auth flows
  const [pendingUserId, setPendingUserId] = useState<string>('');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [resetEmail, setResetEmail] = useState<string>('');

  const isAuthenticated = !!token;

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
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
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

  // Forgot Password Flow
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar 
        isAuthenticated={isAuthenticated} 
        role={user?.role} 
        onNavigate={handleNavigate}
        onLogout={handleLogout} 
      />

      <main className="flex-grow w-full">
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
            />
        )}

        {currentView === 'SIGNUP' && (
            <SignUpForm
                onSuccess={handleSignUpSuccess}
                onCancel={() => setCurrentView('LANDING')}
                onSwitchToLogin={() => setCurrentView('LOGIN')}
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