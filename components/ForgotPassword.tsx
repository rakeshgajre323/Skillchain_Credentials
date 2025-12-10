import React, { useState } from 'react';
import { getApiBase } from '../utils/api';

interface ForgotPasswordProps {
  onCancel: () => void;
  onCodeSent: (email: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onCancel, onCodeSent }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const apiBase = getApiBase();
    try {
      const res = await fetch(`${apiBase}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // We always proceed to code entry to prevent email enumeration, 
      // unless server throws a 500 error.
      if (res.status >= 500) {
        throw new Error('Server error, please try again later.');
      }
      
      onCodeSent(email);

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
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Reset Password</h2>
            <p className="mt-2 text-sm text-slate-600">Enter your email to receive a reset code.</p>
        </div>
        
        {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
                {error}
            </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
                {isLoading ? 'Sending...' : 'Send Code'}
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};