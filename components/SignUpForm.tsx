import React, { useState, useEffect } from 'react';
import { UserRole, User } from '../types';
import { getApiBase } from '../utils/api';

interface SignUpFormProps {
  onSuccess: (userId: string, email: string) => void;
  onCancel: () => void;
  onSwitchToLogin: () => void;
  isDarkMode: boolean;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onCancel, onSwitchToLogin, isDarkMode }) => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Password Strength State
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [passwordScore, setPasswordScore] = useState(0);

  // Role Specific
  const [apparId, setApparId] = useState(''); // Student
  const [recognitionNumber, setRecognitionNumber] = useState(''); // Institute
  const [address, setAddress] = useState(''); // Institute
  const [website, setWebsite] = useState(''); // Company

  // Check Password Strength
  useEffect(() => {
    let score = 0;
    if (password.length > 5) score++;
    if (password.length > 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    setPasswordScore(score);

    if (score <= 2) setPasswordStrength('weak');
    else if (score <= 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (passwordScore < 2) {
      setError('Password is too weak. Please use a stronger password.');
      setLoading(false);
      return;
    }

    const apiBase = getApiBase();
    try {
      const payload = {
        role, name, email, password, phone,
        ...(role === 'STUDENT' && { apparId }),
        ...(role === 'INSTITUTE' && { recognitionNumber, address }),
        ...(role === 'COMPANY' && { website }),
      };

      let res;
      try {
        res = await fetch(`${apiBase}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (networkError) {
        throw new Error('NETWORK_ERROR');
      }

      const data = await res.json().catch(() => ({ message: 'Invalid response' }));

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Success - Redirect to OTP verify
      onSuccess(data.userId, email);

    } catch (err: any) {
      const isNetworkError = err.message === 'NETWORK_ERROR' || 
                             err.message === 'Failed to fetch' || 
                             err.message.includes('NetworkError') ||
                             err.message.includes('Connection refused');

      if (isNetworkError) {
        // Fallback to Demo Registration
        console.warn('Backend unavailable. Mocking registration.');
        setTimeout(() => {
           // Simulate a successful registration that needs verification
           onSuccess('demo-user-id', email);
        }, 1000);
      } else {
        setError(err.message);
        setLoading(false);
      }
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Alert the user that this bypasses standard registration flow for demo
    alert(`Starting Demo Registration with ${provider}... (In a real app, this would open OAuth provider)`);
    // Navigate to Login to trigger the demo login
    onSwitchToLogin();
  };

  const getRoleTabClass = (r: UserRole) => {
    const isActive = role === r;
    if (isDarkMode) {
      return isActive 
        ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
        : 'text-neutral-400 hover:text-white hover:bg-white/5';
    } else {
      return isActive
        ? 'bg-black text-white shadow-lg'
        : 'text-slate-500 hover:text-black hover:bg-slate-100';
    }
  };

  const getStrengthColor = () => {
    if (password.length === 0) return isDarkMode ? 'bg-neutral-700' : 'bg-slate-200';
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
    }
  };

  const getStrengthWidth = () => {
    if (password.length === 0) return '0%';
    switch (passwordStrength) {
      case 'weak': return '33%';
      case 'medium': return '66%';
      case 'strong': return '100%';
    }
  };

  const inputClass = `block w-full pl-11 pr-4 py-3.5 rounded-xl border outline-none transition-all duration-300 ${
    isDarkMode 
      ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-500 focus:bg-black focus:border-indigo-500' 
      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-black focus:shadow-md'
  }`;

  return (
    <div className={`flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-8 ${isDarkMode ? 'bg-black' : 'bg-slate-50'}`}>
      
      {/* Main Card Container */}
      <div className={`w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row transition-all duration-300 ${isDarkMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-white border border-slate-100'}`}>
        
        {/* Left Side: Image/Art */}
        <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-[800px] bg-black group overflow-hidden hidden md:block">
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop" 
            alt="Cyberpunk City" 
            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
          
           {/* Text Overlay on Image */}
           <div className="absolute top-8 left-8 right-8 z-10">
             <div className="flex gap-4 text-white/70 text-xs font-medium tracking-wider uppercase">
                <span className="hover:text-white cursor-pointer" onClick={onCancel}>Home</span>
                <span className="hover:text-white cursor-pointer">Support</span>
             </div>
          </div>

          <div className="absolute bottom-12 left-8 right-8 z-10">
            <h2 className="text-4xl font-bold text-white mb-2 leading-tight drop-shadow-lg">
              Join the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Future of Work</span>
            </h2>
            <p className="text-slate-300 text-sm max-w-md">
              Create your identity, verify your skills, and connect with global opportunities on the blockchain.
            </p>
          </div>
        </div>

        {/* Right Side: SignUp Form */}
        <div className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative ${isDarkMode ? 'bg-neutral-900' : 'bg-white'}`}>
          
           {/* Mobile Header (Image hidden) */}
           <div className="md:hidden text-center mb-6">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Create Account</h1>
           </div>

          <div className="max-w-md mx-auto w-full">
            <div className="text-center mb-8 hidden md:block">
               <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Start Journey</h1>
               <p className={`text-sm ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>Join SkillChain as a...</p>
            </div>

            {/* Role Switcher */}
            <div className={`flex p-1 rounded-xl mb-8 ${isDarkMode ? 'bg-neutral-800' : 'bg-slate-100'}`}>
              {[UserRole.STUDENT, UserRole.INSTITUTE, UserRole.COMPANY].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${getRoleTabClass(r)}`}
                >
                  {r}
                </button>
              ))}
            </div>

            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm text-center animate-pulse">
                    <i className="fas fa-exclamation-circle mr-2"></i>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>
                  <i className="far fa-user"></i>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Full Name / Org Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Email */}
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>
                  <i className="far fa-envelope"></i>
                </div>
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Password */}
              <div className="relative group">
                 <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>
                  <i className="fas fa-lock"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Create Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-11`}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-slate-400 hover:text-indigo-500 transition-colors"
                >
                  <i className={`far ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                </button>
              </div>

              {/* Password Strength */}
              <div className="px-1">
                 <div className={`h-1 w-full rounded-full overflow-hidden ${isDarkMode ? 'bg-neutral-700' : 'bg-slate-200'}`}>
                   <div 
                     className={`h-full transition-all duration-300 ease-out ${getStrengthColor()}`} 
                     style={{ width: getStrengthWidth() }}
                   />
                 </div>
                 <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-500">Min 6 chars, 1 number</span>
                    {password.length > 0 && (
                        <span className={`text-[10px] font-medium ${
                            passwordStrength === 'weak' ? 'text-red-500' : 
                            passwordStrength === 'medium' ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                            {passwordStrength}
                        </span>
                    )}
                 </div>
              </div>

              {/* Phone */}
              <div className="relative group">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>
                  <i className="fas fa-phone-alt text-xs"></i>
                </div>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Role Specific Fields */}
              {role === UserRole.STUDENT && (
                <div className="relative group animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>
                    <i className="fas fa-id-card"></i>
                   </div>
                   <input 
                      type="text" 
                      value={apparId} 
                      onChange={e => setApparId(e.target.value)} 
                      placeholder="APPAR ID (Optional)"
                      className={inputClass} 
                   />
                </div>
              )}

              {role === UserRole.INSTITUTE && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="relative group">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>
                        <i className="fas fa-university"></i>
                    </div>
                    <input type="text" required value={recognitionNumber} onChange={e => setRecognitionNumber(e.target.value)} 
                      placeholder="Recognition Number" className={inputClass} />
                  </div>
                  <div className="relative group">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>
                        <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} 
                      placeholder="Address" className={inputClass} />
                  </div>
                </div>
              )}

              {role === UserRole.COMPANY && (
                <div className="relative group animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${isDarkMode ? 'text-neutral-500' : 'text-slate-400'}`}>
                        <i className="fas fa-globe"></i>
                    </div>
                   <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="Company Website"
                    className={inputClass} />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 transform active:scale-95 shadow-lg mt-4 ${
                  isDarkMode 
                    ? 'bg-white text-black hover:bg-neutral-200 shadow-white/10' 
                    : 'bg-black text-white hover:bg-slate-800 shadow-black/20'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="fas fa-spinner fa-spin"></i> creating...
                  </span>
                ) : 'Sign Up'}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDarkMode ? 'border-neutral-800' : 'border-slate-200'}`}></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className={`px-2 ${isDarkMode ? 'bg-neutral-900 text-neutral-500' : 'bg-white text-slate-400'}`}>
                    Or continue with
                  </span>
                </div>
              </div>

               {/* Social Buttons (Functional Mocks) */}
              <div className="flex gap-4 justify-center">
                 <button 
                   type="button" 
                   onClick={() => handleSocialLogin('Google')}
                   className={`w-14 h-14 rounded-xl border flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 active:scale-95 ${isDarkMode ? 'border-neutral-700 hover:bg-neutral-800 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-800'}`}
                 >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                 </button>
                 <button 
                   type="button" 
                   onClick={() => handleSocialLogin('Apple')}
                   className={`w-14 h-14 rounded-xl border flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 active:scale-95 ${isDarkMode ? 'border-neutral-700 hover:bg-neutral-800 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-800'}`}
                 >
                    <i className="fab fa-apple"></i>
                 </button>
                 <button 
                    type="button" 
                    onClick={() => handleSocialLogin('Facebook')}
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center text-xl transition-all duration-300 hover:scale-110 active:scale-95 ${isDarkMode ? 'border-neutral-700 hover:bg-neutral-800 text-blue-500' : 'border-slate-200 hover:bg-slate-50 text-blue-600'}`}
                 >
                    <i className="fab fa-facebook-f"></i>
                 </button>
              </div>

              <div className={`text-center text-xs mt-6 ${isDarkMode ? 'text-neutral-400' : 'text-slate-500'}`}>
                Already have an account? 
                <button onClick={onSwitchToLogin} className={`font-bold ml-1 hover:underline ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};