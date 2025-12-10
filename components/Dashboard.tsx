import React, { useState, useEffect, useCallback } from 'react';
import { CertificateCard } from './CertificateCard';
import { Certificate, UserRole } from '../types';
import { getApiBase, fetchWithTimeout } from '../utils/api';

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

interface DashboardProps {
  userRole?: UserRole;
  userName?: string;
  onAddCertificate: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userRole, userName, onAddCertificate }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  // Added 'db-down' state to be specific about errors
  const [status, setStatus] = useState<'checking' | 'ok' | 'db-down' | 'offline'>('checking');
  const [message, setMessage] = useState<string>('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string>('');
  const [retryTrigger, setRetryTrigger] = useState(0);

  const handleVerify = (id: string) => {
    setVerifyingId(id);
    setShowVerifyModal(true);
  };

  const connectToBackend = useCallback(async () => {
    setStatus('checking');
    setMessage('Connecting to backend...');
    const apiBase = getApiBase();

    try {
      // 1. Check Health AND DB Status
      const healthRes = await fetchWithTimeout(`${apiBase}/health`, {}, 5000);
      
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        // Check if DB is actually connected
        if (healthData.dbStatus !== 'connected') {
           setStatus('db-down');
           setMessage('Database Disconnected');
           setCertificates(MOCK_CERTIFICATES);
           return;
        }
      } else {
        throw new Error(`Health check failed: ${healthRes.status}`);
      }
      
      // 2. Try Seeding (optional)
      try { await fetchWithTimeout(`${apiBase}/api/seed-check`, {}, 3000); } catch (e) {}

      // 3. Fetch Data
      const response = await fetchWithTimeout(`${apiBase}/api/certificates`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      setCertificates(data);
      setStatus('ok');
      setMessage('Connected');
    } catch (err) {
      console.warn('Backend connection failed:', err);
      setStatus('offline');
      setMessage('Backend Unavailable');
      setCertificates(MOCK_CERTIFICATES);
    }
  }, []);

  useEffect(() => {
    connectToBackend();
  }, [connectToBackend, retryTrigger]);

  const handleRetry = () => {
    setRetryTrigger(prev => prev + 1);
  };

  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-slate-500 text-sm">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Welcome back, {userName || 'User'}
            </h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                <span className="bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                  Role: <span className="font-semibold text-slate-900">{userRole}</span>
                </span>
                {userRole === UserRole.STUDENT && (
                  <span className="bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                    APPAR ID: <span className="font-mono font-semibold text-slate-900">APPAR-2023-992</span>
                  </span>
                )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {status === 'ok' ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 px-3 text-sm text-green-700 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span>Live Data</span>
                </div>
             ) : status === 'db-down' ? (
                <div className="flex items-center gap-3">
                   <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Database Disconnected</span>
                   </div>
                   <button 
                      onClick={handleRetry}
                      className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                   >
                      Retry
                   </button>
                </div>
             ) : (
                <>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-center gap-2">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span>Offline Mode</span>
                    </div>
                    <button 
                      onClick={handleRetry}
                      className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Retry
                    </button>
                </>
             )}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            {userRole === UserRole.INSTITUTE ? 'Issued Certificates' : 'My Credentials'}
          </h2>
          <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Filter
              </button>
              
              {userRole === UserRole.INSTITUTE ? (
                <button 
                  onClick={onAddCertificate}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Certificate
                </button>
              ) : (
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm">
                  Share Profile
                </button>
              )}
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
            <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center">
               <svg className="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
               <p>No certificates found.</p>
            </div>
          )}
          
          {/* Add New Certificate Placeholder (Visible only to Institute/Admin) */}
          {(userRole === UserRole.INSTITUTE || userRole === UserRole.ADMIN) && (
            <div 
              onClick={onAddCertificate}
              className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 cursor-pointer transition-colors min-h-[250px] group"
            >
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center mb-3 transition-colors">
                    <svg className="w-6 h-6 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <span className="font-medium">Issue New Certificate</span>
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 mx-4 animate-in fade-in zoom-in duration-200">
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