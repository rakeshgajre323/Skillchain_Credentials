import React, { useState } from 'react';
import { getApiBase } from '../utils/api';

interface AddCertificateFormProps {
  issuerName: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export const AddCertificateForm: React.FC<AddCertificateFormProps> = ({ issuerName, onCancel, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    studentName: '',
    studentApparId: '',
    courseName: '',
    grade: '',
    issueDate: new Date().toISOString().split('T')[0],
    ipfsCid: '',
    blockchainTx: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/certificates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          issuerName,
          isValid: true,
          // Generate a UUID-like string if not provided (mock)
          certificateId: `crt-${Date.now()}`
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create certificate');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Issue New Certificate</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Student Name</label>
              <input type="text" name="studentName" required value={formData.studentName} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">APPAR ID</label>
              <input type="text" name="studentApparId" required value={formData.studentApparId} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="APPAR-202X-..." />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Course / Qualification Name</label>
              <input type="text" name="courseName" required value={formData.courseName} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Grade / Score</label>
              <input type="text" name="grade" required value={formData.grade} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date of Issue</label>
              <input type="date" name="issueDate" required value={formData.issueDate} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">IPFS CID (Content Hash)</label>
              <input type="text" name="ipfsCid" required value={formData.ipfsCid} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono" placeholder="Qm..." />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Blockchain Transaction Hash</label>
              <input type="text" name="blockchainTx" required value={formData.blockchainTx} onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono" placeholder="0x..." />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onCancel} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Certificate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};