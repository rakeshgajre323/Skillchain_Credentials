import React from 'react';
import { Certificate } from '../types';

interface CertificateCardProps {
  cert: Certificate;
  onVerify: (id: string) => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ cert, onVerify }) => {
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cert.ipfsCid) {
      alert("No IPFS CID available for this certificate.");
      return;
    }
    const safeFilename = cert.courseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const gatewayUrl = `https://dweb.link/ipfs/${cert.ipfsCid}?filename=${safeFilename}.pdf`;
    window.open(gatewayUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden h-full">
      
      {/* Decorative Top Gradient Line matching Logo Colors */}
      <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500"></div>

      <div className="p-6 flex flex-col flex-grow">
        
        {/* Header: Issuer & Status */}
        <div className="flex justify-between items-start mb-4">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold border border-slate-200">
                {cert.issuerName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Issuer</span>
                <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]" title={cert.issuerName}>{cert.issuerName}</span>
              </div>
           </div>
           
           {cert.isValid && (
             <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 shadow-sm">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-wide">Verified</span>
             </div>
           )}
        </div>

        {/* Main Content: Course Name */}
        <h3 className="text-xl font-bold text-slate-900 leading-snug mb-6 group-hover:text-blue-600 transition-colors line-clamp-2">
          {cert.courseName}
        </h3>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 mt-auto mb-6">
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
             <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Grade Achieved</span>
             <span className="text-base font-bold text-slate-800">{cert.grade}</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
             <span className="text-[10px] text-slate-400 font-bold uppercase block mb-0.5">Issued On</span>
             <span className="text-sm font-semibold text-slate-700">{cert.issueDate}</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button 
              onClick={() => onVerify(cert.certificateId)}
              className="flex-1 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 text-sm font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Verify
            </button>
            
            <button 
              onClick={handleDownload}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 border border-transparent hover:border-blue-100 transition-all"
              title="Download PDF"
            >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
               </svg>
            </button>
        </div>
        
      </div>
      
      {/* Hover visual accent */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/10 rounded-2xl pointer-events-none transition-colors"></div>
    </div>
  );
};