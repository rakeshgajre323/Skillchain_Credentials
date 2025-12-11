import React, { useState, useEffect } from 'react';
import { UserRole, User } from '../types';
import { getApiBase } from '../utils/api';

interface LoginFormProps {
  onLoginSuccess: (user: User, token: string) => void;
  onPendingVerification: (userId: string, email: string) => void;
  onCancel: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
  isDarkMode: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onLoginSuccess, 
  onPendingVerification, 
  onCancel, 
  onSwitchToSignup,
  onForgotPassword,
  isDarkMode
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Backend Status State
  const [backendStatus, setBackendStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  // Check Backend Health on Mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const apiBase = getApiBase();
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 2000); // Fast timeout check
        
        const res = await fetch(`${apiBase}/health`, { signal: controller.signal }).catch(() => null);
        clearTimeout(id);
        
        if (res && res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.dbStatus === 'connected') {
            setBackendStatus('ok');
          } else {
            setBackendStatus('error');
          }
        } else {
          setBackendStatus('error');
        }
      } catch (err) {
        setBackendStatus('error');
      }
    };
    checkHealth();
  }, []);

  const performMockLogin = (providerOrMethod: string) => {
    setIsLoading(true);
    // Short delay to make it feel responsive but process 'fake' work
    setTimeout(() => {
      // Mock User Data based on selected role
      const mockUser: User = {
        id: `demo-${Date.now()}`,
        name: email ? email.split('@')[0] : `Demo ${providerOrMethod} User`,
        email: email || `demo.${providerOrMethod.toLowerCase().replace(/\s/g, '')}@example.com`,
        role: selectedRole,
        status: 'active',
        // Add specific fields to prevent dashboard crashes
        ...(selectedRole === UserRole.STUDENT && { apparId: 'APPAR-DEMO-001' }),
        ...(selectedRole === UserRole.INSTITUTE && { recognitionNumber: 'REC-DEMO-001' }),
      };
      
      const mockToken = `mock-jwt-token-${Date.now()}`;
      
      if (rememberMe) {
        localStorage.setItem('skillchain_token', mockToken);
        localStorage.setItem('skillchain_user', JSON.stringify(mockUser));
      }

      setIsLoading(false);
      onLoginSuccess(mockUser, mockToken);
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Fast-track: If we already know backend is down, skip network attempt
    if (backendStatus === 'error') {
      performMockLogin('Offline Auto-Fallback');
      return;
    }

    const apiBase = getApiBase();
    try {
      // Try to connect to backend with strict timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s max for login

      let res;
      try {
        res = await fetch(`${apiBase}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          signal: controller.signal
        });
      } catch (networkErr) {
        // Network error / Timeout -> Offline Mode
        clearTimeout(timeoutId);
        console.warn('Network login failed, switching to demo:', networkErr);
        setBackendStatus('error');
        performMockLogin('Offline');
        return;
      }
      clearTimeout(timeoutId);

      const data = await res.json().catch(() => null);
      
      if (!res.ok || !data) {
        if (res.status === 403 && data?.status === 'pending') {
           onPendingVerification(data.userId, email);
           return;
        }
        
        // If 401/400, it's a real auth error. 
        // If 404/500/502/503/504, it's a server issue -> Offline Mode
        if (res.status >= 500 || res.status === 404) {
             setBackendStatus('error');
             performMockLogin('Offline');
             return;
        }
        
        throw new Error(data?.message || 'Login failed');
      }

      if (data.user.role !== selectedRole && data.user.role !== UserRole.ADMIN) {
        throw new Error(`Account found, but it is not a ${selectedRole} account. Please switch tabs.`);
      }

      if (rememberMe) {
        localStorage.setItem('skillchain_token', data.token);
        localStorage.setItem('skillchain_user', JSON.stringify(data.user));
      }

      onLoginSuccess(data.user, data.token);

    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    performMockLogin(provider);
  };

  const getRoleTabClass = (role: UserRole) => {
    const isActive = selectedRole === role;
    if (isDarkMode) {
      return isActive 
        ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
        : 'text-slate-400 hover:text-white hover:bg-white/5';
    } else {
      return isActive
        ? 'bg-black text-white shadow-lg'
        : 'text-slate-500 hover:text-black hover:bg-slate-100';
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      
      <div className={`w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row transition-all duration-300 ${isDarkMode ? 'bg-slate-800/50 border border-slate-700' : 'bg-white border border-slate-100'}`}>
        
        <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-[600px] bg-black group overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1000&auto=format&fit=crop" 
            alt="Futuristic Robot" 
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
          
          <div className="absolute top-8 left-8 right-8 z-10">
             <div className="flex gap-4 text-white/70 text-xs font-medium tracking-wider uppercase">
                <span className="hover:text-white cursor-pointer" onClick={onCancel}>Home</span>
                <span className="hover:text-white cursor-pointer">About</span>
                <span className="hover:text-white cursor-pointer">Blog</span>
                <span className="hover:text-white cursor-pointer">Contact</span>
             </div>
          </div>

          <div className="absolute bottom-12 left-8 right-8 z-10">
            <h2 className="text-4xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
              Unlock Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Digital Potential</span>
            </h2>
            <p className="text-slate-300 text-sm max-w-md">
              Secure, blockchain-verified credentials for the next generation of professionals.
            </p>
          </div>
        </div>

        <div className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative ${isDarkMode ? 'bg-slate-900/95' : 'bg-white'}`}>
          
          <div className="absolute top-6 right-8 flex gap-4 text-xs font-medium opacity-60">
             <span>English <i className="fas fa-chevron-down ml-1"></i></span>
          </div>

          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-8">
               <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Hello ! <br/> Welcome Back</h1>
               <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Please login to continue to your dashboard</p>
            </div>
            
            {backendStatus === 'error' && (
              <div className="mb-6 p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-xs flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2">
                   <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                   </svg>
                   <span className="font-semibold">Backend Unreachable</span>
                </div>
                <p>Connection to server failed. You can proceed in offline demo mode.</p>
                <button 
                  type="button"
                  onClick={() => performMockLogin('Manual Offline')}
                  disabled={isLoading}
                  className="mt-1 w-full py-2 bg-orange-100 hover:bg-orange-200 text-orange-900 rounded font-bold transition-colors disabled:opacity-70 disabled:cursor-wait flex justify-center"
                >
                  {isLoading ? 'Entering Offline Mode...' : 'Enter Offline Mode'}
                </button>
              </div>
            )}

            <div className={`flex p-1 rounded-xl mb-8 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              {[UserRole.STUDENT, UserRole.INSTITUTE, UserRole.COMPANY].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${getRoleTabClass(role)}`}
                >
                  {role}
                </button>
              ))}
            </div>

            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm text-center animate-pulse">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                  <i className="far fa-envelope"></i>
                </div>
                <input
                  type="email"
                  required
                  placeholder="Enter Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:bg-slate-800 focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-black focus:shadow-md'
                  }`}
                />
              </div>

              <div className="relative group">
                 <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                  <i className="fas fa-lock"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-11 pr-11 py-3.5 rounded-xl border outline-none transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:bg-slate-800 focus:border-indigo-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-black focus:shadow-md'
                  }`}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-slate-400 hover:text-indigo-500 transition-colors"
                >
                  <i className={`far ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                </button>
              </div>

              <div className="flex justify-between items-center">
                 <label className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="hidden peer"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                       isDarkMode 
                         ? 'border-slate-600 bg-slate-800 peer-checked:bg-white peer-checked:border-white' 
                         : 'border-slate-300 bg-white peer-checked:bg-black peer-checked:border-black'
                    }`}>
                        {rememberMe && <i className={`fas fa-check text-[10px] ${isDarkMode ? 'text-black' : 'text-white'}`}></i>}
                    </div>
                    <span className={`ml-2 text-xs font-medium select-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Remember Me</span>
                 </label>

                <button 
                  type="button" 
                  onClick={onForgotPassword}
                  className={`text-xs font-medium transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black'}`}
                >
                  Recover Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 transform active:scale-95 shadow-lg ${
                  isDarkMode 
                    ? 'bg-white text-black hover:bg-slate-200 shadow-white/10' 
                    : 'bg-black text-white hover:bg-slate-800 shadow-black/20'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-spinner fa-spin"></i> Processing...
                  </span>
                ) : 'Sign In'}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className={`px-2 ${isDarkMode ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-400'}`}>
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                 <button 
                   type="button" 
                   onClick={() => handleSocialLogin('Google')}
                   className={`w-14 h-14 rounded-xl border flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 active:scale-95 ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-800'}`}
                 >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                 </button>
                 <button 
                   type="button" 
                   onClick={() => handleSocialLogin('Apple')}
                   className={`w-14 h-14 rounded-xl border flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 active:scale-95 ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-800'}`}
                 >
                    <i className="fab fa-apple"></i>
                 </button>
                 <button 
                    type="button" 
                    onClick={() => handleSocialLogin('Facebook')}
                    className={`w-14 h-14 rounded-xl border flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 active:scale-95 ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-blue-500' : 'border-slate-200 hover:bg-slate-50 text-blue-600'}`}
                 >
                    <i className="fab fa-facebook-f"></i>
                 </button>
              </div>

              <div className={`text-center text-xs mt-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Don't have an account? 
                <button onClick={onSwitchToSignup} className={`font-bold ml-1 hover:underline ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Create Account!
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};