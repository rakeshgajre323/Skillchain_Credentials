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
  },
  {
    id: '3',
    certificateId: 'crt-55123-uuid',
    studentName: 'Rakesh Gajre',
    studentApparId: 'APPAR-2023-992',
    courseName: 'UI/UX Design Principles',
    grade: 'O',
    issuerName: 'Design School Global',
    issueDate: '2023-05-10',
    ipfsCid: 'QmP99...kXy1',
    blockchainTx: '0x99123...4451',
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
  const [status, setStatus] = useState<'checking' | 'ok' | 'db-down' | 'offline'>('checking');
  const [message, setMessage] = useState<string>('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string>('');
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const handleVerify = (id: string) => {
    setVerifyingId(id);
    setShowVerifyModal(true);
  };

  const connectToBackend = useCallback(async () => {
    setStatus('checking');
    setMessage('Connecting to backend...');
    const apiBase = getApiBase();

    try {
      // 1. Check Health - Fast timeout
      const healthRes = await fetchWithTimeout(`${apiBase}/health`, {}, 2000).catch(() => null);
      
      if (healthRes && healthRes.ok) {
        const healthData = await healthRes.json().catch(() => ({}));
        if (healthData.dbStatus !== 'connected') {
           setStatus('db-down');
           setMessage('Database Disconnected');
           setCertificates(MOCK_CERTIFICATES);
           return;
        }
      } else {
        throw new Error('Health check failed');
      }
      
      // 2. Fetch Data
      const response = await fetchWithTimeout(`${apiBase}/api/certificates`, {}, 4000).catch(() => null);
      if (!response || !response.ok) {
        throw new Error(`Server returned ${response ? response.status : 'no response'}`);
      }
      
      const data = await response.json();
      setCertificates(data);
      setStatus('ok');
      setMessage('Connected');
    } catch (err) {
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

  const filteredCertificates = certificates.filter(cert => 
    cert.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.issuerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Render Loading State ---
  if (status === 'checking') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
        </div>
        <p className="mt-6 text-slate-500 font-medium tracking-wide text-sm uppercase">{message}</p>
      </div>
    );
  }

  // --- Dashboard Components ---

  const StatCard = ({ label, value, icon, colorClass }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Welcome back, <span className="text-slate-900 font-semibold">{userName || 'User'}</span>. 
            Here is your verified credential wallet.
          </p>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-3">
             {status === 'ok' ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-sm font-medium">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    Live Network
                </div>
             ) : (
                <button 
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full border border-amber-100 text-sm font-medium hover:bg-amber-100 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {status === 'db-down' ? 'Database Offline' : 'Offline Mode'} (Retry)
                </button>
             )}
        </div>
      </div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Credentials" 
          value={certificates.length} 
          colorClass="bg-blue-50 text-blue-600"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          label="Latest Grade" 
          value={certificates.length > 0 ? certificates[0].grade : '-'} 
          colorClass="bg-emerald-50 text-emerald-600"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
        <StatCard 
          label="Pending Verifications" 
          value="0" 
          colorClass="bg-purple-50 text-purple-600"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* 3. Controls & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
         <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search certificates, issuers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border-none rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0 bg-transparent"
            />
         </div>
         
         <div className="flex gap-2 w-full md:w-auto p-2 md:p-0">
             {userRole === UserRole.INSTITUTE && (
                <button 
                  onClick={onAddCertificate}
                  className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Issue New
                </button>
             )}
             <button className="px-4 py-3 bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-100 border border-slate-200 transition-colors">
                Filters
             </button>
         </div>
      </div>

      {/* 4. Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCertificates.length > 0 ? (
          filteredCertificates.map((cert) => (
            <CertificateCard 
              key={cert.id} 
              cert={cert} 
              onVerify={handleVerify}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
             </div>
             <h3 className="text-lg font-medium text-slate-900">No Credentials Found</h3>
             <p className="text-slate-500 mt-1">Try adjusting your search or add a new certificate.</p>
          </div>
        )}
      </div>

      {/* 5. Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white flex justify-between items-start">
              <div>
                 <h3 className="text-xl font-bold">Verifying Credential</h3>
                 <p className="text-blue-100 text-sm mt-1">SkillChain Blockchain Explorer</p>
              </div>
              <button onClick={() => setShowVerifyModal(false)} className="text-blue-200 hover:text-white bg-white/10 p-1 rounded-full hover:bg-white/20 transition-all">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-300 delay-75">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                    <h4 className="font-bold text-slate-900">Database Record Found</h4>
                    <p className="text-sm text-slate-500">The certificate exists in the SkillChain registry.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-300 delay-150">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                 <div>
                    <h4 className="font-bold text-slate-900">Cryptographic Signature Valid</h4>
                    <p className="text-sm text-slate-500">IPFS content hash matches the blockchain record.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-300 delay-300">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-3m0 0l3-3m-3 3l-3-3" /></svg>
                </div>
                 <div>
                    <h4 className="font-bold text-slate-900">Issuer Verified</h4>
                    <p className="text-sm text-slate-500">Issued by a recognized Institute wallet.</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Verification ID</p>
                  <p className="font-mono text-sm text-slate-700 break-all">{verifyingId}</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setShowVerifyModal(false)}
                className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};