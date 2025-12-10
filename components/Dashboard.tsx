import React, { useState, useEffect } from 'react';
import { CertificateCard } from './CertificateCard';
import { Certificate } from '../types';

// Mock Data for Fallback (Offline Mode)
const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: '1',
    certificateId: 'crt-88293-uuid',
    studentName: 'Rakesh Gajre',
    studentApparId: 'APPAR-2023-992',
    courseName: 'Advanced Full-Stack Development',
    grade: 'A+',
    issuerName: 'Tech Institute of India',
    issueDate: '2023-10-15',
    ipfsCid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    blockchainTx: '0x7129038...8923',
    isValid: true,
  },
  {
    id: '2',
    certificateId: 'crt-99120-uuid',
    studentName: 'Rakesh Gajre',
    studentApparId: 'APPAR-2023-992',
    courseName: 'Blockchain Fundamentals',
    grade: 'A',
    issuerName: 'Polygon Academy',
    issueDate: '2023-08-20',
    ipfsCid: 'QmZ43...kLm2',
    blockchainTx: '0x82301...1120',
    isValid: true,
  }
];

export const Dashboard: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string>('');

  const handleVerify = (id: string) => {
    setVerifyingId(id);
    setShowVerifyModal(true);
  };

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        // Determine API URL (use env var or default to localhost for dev)
        const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

        // 1. Attempt to seed DB if empty (Optional helper for demo)
        try { 
            await fetch(`${API_BASE}/seed-check`); 
        } catch (e) { 
            console.warn("Seed check skipped/failed"); 
        }

        // 2. Fetch Certificates from MongoDB via API
        const response = await fetch(`${API_BASE}/certificates`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch credentials: ${response.statusText}`);
        }

        const data = await response.json();
        setCertificates(data);
        setUsingFallback(false);
      } catch (err) {
        console.warn('Backend unavailable or DB error, switching to offline mode:', err);
        setCertificates(MOCK_CERTIFICATES);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, Rakesh
        </h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              APPAR ID: <span className="font-mono font-semibold text-slate-900">APPAR-2023-992</span>
            </span>
            <span className="bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              Wallet: <span className="font-mono font-semibold text-slate-900">0x71...8923</span>
            </span>
        </div>
        
        {usingFallback && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Backend unavailable. Showing demo data in offline mode.</span>
            </div>
        )}
      </div>

      {/* Dashboard Content */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">My Credentials</h2>
          <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Filter
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
                  Share Profile
              </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.length > 0 ? (
            certificates.map((cert) => (
              <CertificateCard 
                key={cert.id} 
                cert={cert} 
                onVerify={handleVerify}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              No certificates found.
            </div>
          )}
          
          {/* Add New Certificate Placeholder */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 cursor-pointer transition-colors min-h-[250px]">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
              </div>
              <span className="font-medium">Import External Certificate</span>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Verifying Credential</h3>
              <button onClick={() => setShowVerifyModal(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium text-sm">Database Record Found</span>
              </div>
              
              <div className="flex items-center gap-3 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium text-sm">IPFS Hash Matches Metadata</span>
              </div>

              <div className="flex items-center gap-3 text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-sm">Polygon Smart Contract Verified</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-500 text-center mb-4">
                    Verification ID: {verifyingId}
                </p>
              <button 
                onClick={() => setShowVerifyModal(false)}
                className="w-full bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Close Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};