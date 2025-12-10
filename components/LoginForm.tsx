import React, { useState } from 'react';
import { UserRole, User } from '../types';
import { getApiBase } from '../utils/api';

interface LoginFormProps {
  onLoginSuccess: (user: User, token: string) => void;
  onPendingVerification: (userId: string, email: string) => void;
  onCancel: () => void;
  onSwitchToSignup: () => void;
  onForgotPassword: () => void; // New prop
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onLoginSuccess, 
  onPendingVerification, 
  onCancel, 
  onSwitchToSignup,
  onForgotPassword
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const apiBase = getApiBase();
    try {
      const res = await fetch(`${apiBase}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.status === 403 && data.status === 'pending') {
         // User exists but not verified
         onPendingVerification(data.userId, email);
         return;
      }

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Success
      onLoginSuccess(data.user, data.token);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full max-w-md mx-auto">
      <div className="w-full space-y-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-slate-900">Sign in</h2>
            <p className="mt-2 text-sm text-slate-600">Welcome back to SkillChain</p>
        </div>
        
        {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
                {error}
            </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button 
                type="button" 
                onClick={onForgotPassword} 
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <div className="flex gap-4">
             <button
                type="button"
                onClick={onCancel}
                className="w-1/3 flex justify-center py-2 px-4 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-2/3 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
          </div>
        </form>

        <div className="text-center text-sm border-t border-slate-100 pt-4">
            <span className="text-slate-600">Don't have an account? </span>
            <button onClick={onSwitchToSignup} className="font-medium text-indigo-600 hover:text-indigo-500">
                Create one
            </button>
        </div>
      </div>
    </div>
  );
};