import React, { useEffect, useState } from 'react';
import { Certificate } from '../types';
import { getApiBase } from '../utils/api';

interface VerificationPageProps {
  certificateId: string;
  onNavigateHome: () => void;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({ certificateId, onNavigateHome }) => {
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const apiBase = getApiBase();
        const res = await fetch(`${apiBase}/api/certificates/${certificateId}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error('Certificate not found');
          throw new Error('Failed to verify certificate');
        }
        const data = await res.json();
        setCert(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (certificateId) {
      fetchCert();
    }
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
          <p className="text-slate-500 dark:text-neutral-400 font-medium">Verifying Credentials on Blockchain...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Navbar Placeholder / Back Home */}
      <div className="w-full max-w-3xl mb-8 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onNavigateHome}>
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
           </div>
           <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">SkillChain</span>
        </div>
        <button onClick={onNavigateHome} className="text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-white transition-colors">
          Back to Home
        </button>
      </div>

      {error ? (
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8 text-center border border-red-100 dark:border-red-900/30">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verification Failed</h2>
          <p className="text-slate-500 dark:text-neutral-400 mb-6">{error}</p>
          <div className="bg-slate-50 dark:bg-neutral-800 p-3 rounded-lg border border-slate-100 dark:border-neutral-700 text-xs font-mono text-slate-400 break-all">
             ID: {certificateId}
          </div>
        </div>
      ) : cert ? (
        <div className="max-w-3xl w-full bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-neutral-800">
          {/* Header Status */}
          <div className="bg-emerald-500 text-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                 <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                 </svg>
               </div>
               <div>
                 <h1 className="text-xl font-bold">Verified Credential</h1>
                 <p className="text-emerald-100 text-xs uppercase tracking-wider font-medium">Blockchain Secured</p>
               </div>
             </div>
             <div className="text-right hidden sm:block">
               <p className="text-emerald-100 text-xs">Verification ID</p>
               <p className="font-mono font-bold">{cert.certificateId}</p>
             </div>
          </div>

          <div className="p-8">
            {/* Main Content */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
               {/* Certificate Preview */}
               <div className="w-full md:w-1/3 flex-shrink-0">
                  <div className="aspect-[3/4] rounded-xl bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 overflow-hidden relative shadow-inner">
                    {cert.imageUrl ? (
                      <img src={cert.imageUrl} className="w-full h-full object-cover" alt="Certificate" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center flex-col p-4 text-center">
                        <svg className="w-16 h-16 text-slate-300 dark:text-neutral-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-xs text-slate-400 font-medium">Preview Unavailable</span>
                      </div>
                    )}
                  </div>
               </div>

               {/* Details */}
               <div className="flex-1 space-y-6 w-full">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                      {cert.courseName}
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-neutral-400">
                      Issued to <span className="font-bold text-slate-900 dark:text-white">{cert.studentName}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-100 dark:border-neutral-800">
                        <p className="text-xs text-slate-500 dark:text-neutral-500 uppercase font-bold tracking-wider mb-1">Issuer</p>
                        <p className="font-semibold text-slate-800 dark:text-neutral-200">{cert.issuerName}</p>
                     </div>
                     <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-100 dark:border-neutral-800">
                        <p className="text-xs text-slate-500 dark:text-neutral-500 uppercase font-bold tracking-wider mb-1">Issue Date</p>
                        <p className="font-semibold text-slate-800 dark:text-neutral-200">{cert.issueDate}</p>
                     </div>
                     <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-100 dark:border-neutral-800">
                        <p className="text-xs text-slate-500 dark:text-neutral-500 uppercase font-bold tracking-wider mb-1">Grade</p>
                        <p className="font-semibold text-slate-800 dark:text-neutral-200">{cert.grade}</p>
                     </div>
                     <div className="p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-100 dark:border-neutral-800">
                        <p className="text-xs text-slate-500 dark:text-neutral-500 uppercase font-bold tracking-wider mb-1">Student ID</p>
                        <p className="font-semibold text-slate-800 dark:text-neutral-200">{cert.studentApparId}</p>
                     </div>
                  </div>

                  {/* Blockchain Data */}
                  <div className="space-y-3 pt-2">
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase">Blockchain Transaction Hash</span>
                       </div>
                       <div className="bg-slate-100 dark:bg-neutral-800 p-2.5 rounded-lg text-xs font-mono text-slate-600 dark:text-neutral-400 break-all border border-slate-200 dark:border-neutral-700">
                         {cert.blockchainTx}
                       </div>
                     </div>
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          <span className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase">IPFS Asset Hash</span>
                       </div>
                       <div className="bg-slate-100 dark:bg-neutral-800 p-2.5 rounded-lg text-xs font-mono text-slate-600 dark:text-neutral-400 break-all border border-slate-200 dark:border-neutral-700">
                         {cert.ipfsCid}
                       </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="px-8 py-4 bg-slate-50 dark:bg-neutral-800/50 border-t border-slate-100 dark:border-neutral-800 flex justify-center">
             <a 
               href="#" 
               onClick={(e) => { e.preventDefault(); alert("Verification JSON download simulation"); }}
               className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
             >
               <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               Download Verification Proof
             </a>
          </div>
        </div>
      ) : null}
    </div>
  );
};