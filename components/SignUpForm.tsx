import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { getApiBase } from '../utils/api';

interface SignUpFormProps {
  onSuccess: (userId: string, email: string) => void;
  onCancel: () => void;
  onSwitchToLogin: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onCancel, onSwitchToLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  
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

      const res = await fetch(`${apiBase}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Success - Redirect to OTP verify
      onSuccess(data.userId, email);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (password.length === 0) return 'bg-slate-200';
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

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full max-w-lg mx-auto">
      <div className="w-full space-y-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
          <p className="mt-2 text-sm text-slate-600">Join SkillChain as a...</p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg">
          {[UserRole.STUDENT, UserRole.INSTITUTE, UserRole.COMPANY].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`text-xs font-medium py-2 rounded-md transition-all ${
                role === r 
                  ? 'bg-white text-indigo-700 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Common Fields */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Full Name / Organization Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} 
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} 
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700">Password</label>
             <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} 
               className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
             
             {/* Password Strength Indicator */}
             <div className="mt-2">
               <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                 <div 
                   className={`h-full transition-all duration-300 ease-out ${getStrengthColor()}`} 
                   style={{ width: getStrengthWidth() }}
                 />
               </div>
               <div className="flex justify-between mt-1">
                 <p className="text-xs text-slate-500">Min 6 characters</p>
                 {password.length > 0 && (
                   <p className={`text-xs font-medium ${
                     passwordStrength === 'weak' ? 'text-red-600' : 
                     passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-600'
                   }`}>
                     {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                   </p>
                 )}
               </div>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} 
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>

          {/* Role Specific */}
          {role === UserRole.STUDENT && (
            <div>
              <label className="block text-sm font-medium text-slate-700">APPAR ID (Optional)</label>
              <input type="text" value={apparId} onChange={e => setApparId(e.target.value)} placeholder="e.g. APPAR-2023-XYZ"
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          )}

          {role === UserRole.INSTITUTE && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700">Recognition Number</label>
                <input type="text" required value={recognitionNumber} onChange={e => setRecognitionNumber(e.target.value)} 
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Address</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} 
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
            </>
          )}

          {role === UserRole.COMPANY && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Website</label>
              <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..."
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={onCancel} className="w-1/3 py-2 px-4 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="w-2/3 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-slate-600">Already have an account? </span>
          <button onClick={onSwitchToLogin} className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};