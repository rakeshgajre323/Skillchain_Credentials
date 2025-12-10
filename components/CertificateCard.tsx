import React from 'react';
import { Certificate } from '../types';

interface CertificateCardProps {
  cert: Certificate;
  onVerify: (id: string) => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ cert, onVerify }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 leading-tight" title={cert.courseName}>
              {cert.courseName}
            </h3>
            <p className="text-sm text-slate-500 mt-1">Issued by {cert.issuerName}</p>
          </div>
          <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cert.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {cert.isValid ? 'Verified On-Chain' : 'Pending/Invalid'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-medium">Grade</p>
            <p className="font-semibold text-slate-900">{cert.grade}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-medium">Date</p>
            <p className="font-semibold text-slate-900">{cert.issueDate}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded border border-slate-100">
            <span className="flex-shrink-0 font-bold text-slate-500">TX:</span>
            <span className="truncate flex-1" title={cert.blockchainTx}>{cert.blockchainTx}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono bg-slate-50 p-2 rounded border border-slate-100">
             <span className="flex-shrink-0 font-bold text-slate-500">IPFS:</span>
             <span className="truncate flex-1" title={cert.ipfsCid}>{cert.ipfsCid}</span>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center mt-auto">
        <button 
          onClick={() => onVerify(cert.certificateId)}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
        >
          Verify Authenticity &rarr;
        </button>
        <button 
          className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-colors"
          title="Download Certificate"
          aria-label="Download Certificate"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    </div>
  );
};