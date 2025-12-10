import React, { useState } from 'react';
import { getApiBase } from '../utils/api';
import { UserRole, User } from '../types';

interface VerifyOtpProps {
  userId: string;
  email: string;
  onVerified: (token: string, user: User) => void;
  onCancel: () => void;
}

export const VerifyOtp: React.FC<VerifyOtpProps> = ({ userId, email, onVerified, onCancel }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const apiBase = getApiBase();
    try {
      const res = await fetch(`${apiBase}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      onVerified(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendStatus('Sending...');
    const apiBase = getApiBase();
    try {
      const res = await fetch(`${apiBase}/api/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error();
      setResendStatus('Code sent!');
      setTimeout(() => setResendStatus(''), 3000);
    } catch {
      setResendStatus('Failed to send.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 w-full max-w-md mx-auto">
      <div className="w-full space-y-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
        <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900">Verify your Email</h2>
        <p className="text-sm text-slate-600">
          We sent a verification code to <strong>{email}</strong>.<br/>
          Enter the code below to activate your account.
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 p-2 rounded text-sm border border-red-200">{error}</div>
        )}

        <form onSubmit={handleVerify} className="space-y-6 mt-4">
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g,''))}
            className="block w-full text-center text-3xl tracking-widest font-mono border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 py-3"
            placeholder="000000"
            required
          />

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>

        <div className="text-sm text-slate-500 mt-4">
          Didn't receive code?{' '}
          <button onClick={handleResend} className="font-medium text-indigo-600 hover:text-indigo-500">
            {resendStatus || 'Resend OTP'}
          </button>
        </div>
        
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 underline mt-2">
            Back to login
        </button>
      </div>
    </div>
  );
};