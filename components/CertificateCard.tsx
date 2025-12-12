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
    <div className="group relative bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm transition-all duration-300 flex flex-col overflow-hidden h-full hover:scale-[1.02] hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-900 transform cursor-default">
      
      {/* Decorative Top Gradient Line matching Logo Colors */}
      <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 relative z-10"></div>
      
      {/* Subtle Background Watermark / Placeholder Icon */}
      <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] dark:opacity-[0.05] pointer-events-none transform rotate-12 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110">
         <svg className="w-48 h-48 text-slate-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
         </svg>
      </div>

      <div className="p-6 flex flex-col flex-grow relative z-10">
        
        {/* Header: Issuer & Status */}
        <div className="flex justify-between items-start mb-4">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-500 dark:text-neutral-400 text-xs font-bold border border-slate-200 dark:border-neutral-700 transition-colors group-hover:bg-white dark:group-hover:bg-neutral-700">
                {cert.issuerName.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-neutral-500 font-bold">Issuer</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-neutral-300 truncate max-w-[120px]" title={cert.issuerName}>{cert.issuerName}</span>
              </div>
           </div>
           
           {cert.isValid && (
             <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900 shadow-sm">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-wide">Verified</span>
             </div>
           )}
        </div>

        {/* Main Content: Course Name */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug mb-6 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {cert.courseName}
        </h3>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 mt-auto mb-6">
          <div className="bg-slate-50 dark:bg-neutral-800/50 rounded-lg p-2.5 border border-slate-100 dark:border-neutral-800 transition-colors group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10">
             <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold uppercase block mb-0.5">Grade Achieved</span>
             <span className="text-base font-bold text-slate-800 dark:text-neutral-200">{cert.grade}</span>
          </div>
          <div className="bg-slate-50 dark:bg-neutral-800/50 rounded-lg p-2.5 border border-slate-100 dark:border-neutral-800 transition-colors group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10">
             <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold uppercase block mb-0.5">Issued On</span>
             <span className="text-sm font-semibold text-slate-700 dark:text-neutral-300">{cert.issueDate}</span>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onVerify(cert.certificateId)}
              className="flex-1 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-700 text-sm font-semibold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Verify
            </button>
            
            <button 
              onClick={handleDownload}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-neutral-800 text-slate-400 dark:text-neutral-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-blue-100 dark:hover:border-blue-800 transition-all"
              title="Download PDF"
            >
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
               </svg>
            </button>
        </div>
        
      </div>
    </div>
  );
};