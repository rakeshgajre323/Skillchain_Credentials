import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import { Certificate } from '../types';

interface CertificateCardProps {
  cert: Certificate;
  onVerify: (id: string) => void;
  onUpdate: (updatedCert: Certificate) => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ cert, onVerify, onUpdate }) => {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedIssuer, setEditedIssuer] = useState(cert.issuerName);

  // Sync local state if prop changes
  useEffect(() => {
    setEditedIssuer(cert.issuerName);
  }, [cert.issuerName]);

  useEffect(() => {
    if (isExpanded && !qrCodeDataUrl) {
      const verificationUrl = `${window.location.origin}/verify/${cert.certificateId}`;
      QRCode.toDataURL(verificationUrl, { width: 150, margin: 1 })
        .then(url => setQrCodeDataUrl(url))
        .catch(err => console.error("QR Gen Error", err));
    }
  }, [isExpanded, cert.certificateId, qrCodeDataUrl]);

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDownloadModal(true);
  };

  const confirmDownload = () => {
    if (!cert.ipfsCid) {
      alert("No IPFS CID available for this certificate.");
      setShowDownloadModal(false);
      return;
    }
    const safeFilename = cert.courseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const gatewayUrl = `https://dweb.link/ipfs/${cert.ipfsCid}?filename=${safeFilename}.pdf`;
    window.open(gatewayUrl, '_blank', 'noopener,noreferrer');
    setShowDownloadModal(false);
  };

  const cancelDownload = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowDownloadModal(false);
  };

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent verifying when clicking expand
    setIsExpanded(!isExpanded);
  };

  const handleSaveIssuer = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate({ ...cert, issuerName: editedIssuer });
    setIsEditing(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedIssuer(cert.issuerName);
    setIsEditing(false);
  };

  return (
    <>
      <div className={`group relative bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm transition-all duration-300 flex flex-col overflow-hidden h-full hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-900 transform cursor-default ${isExpanded ? 'ring-2 ring-blue-500/20' : ''}`}>
        
        {cert.imageUrl ? (
          // --- With Custom Image ---
          <div className="h-40 w-full relative overflow-hidden bg-slate-100 dark:bg-neutral-800">
             <img 
               src={cert.imageUrl} 
               alt={cert.courseName}
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
             <div className="absolute bottom-3 left-4 right-4">
                <div className="flex items-center gap-2">
                   <div className="bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-slate-900">
                     {cert.grade} Grade
                   </div>
                   {cert.isValid && (
                     <div className="text-emerald-400 text-xs flex items-center gap-1 font-medium">
                        <i className="fas fa-check-circle"></i> Verified
                     </div>
                   )}
                </div>
             </div>
          </div>
        ) : (
          // --- Without Image (Default Placeholder / Gradient) ---
          <>
            <div className="h-2 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 relative z-10"></div>
            <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] dark:opacity-[0.05] pointer-events-none transform rotate-12 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110">
               <svg className="w-48 h-48 text-slate-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
               </svg>
            </div>
          </>
        )}

        <div className="p-6 flex flex-col flex-grow relative z-10">
          
          {/* Header: Issuer (Editable) */}
          <div className="flex justify-between items-start mb-3">
             <div className="flex items-center gap-2 w-full">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-500 dark:text-neutral-400 text-xs font-bold border border-slate-200 dark:border-neutral-700 transition-colors group-hover:bg-white dark:group-hover:bg-neutral-700 shrink-0">
                  {cert.issuerName.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col w-full mr-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-neutral-500 font-bold">Issuer</span>
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1 w-full">
                      <input 
                        type="text" 
                        value={editedIssuer}
                        onChange={(e) => setEditedIssuer(e.target.value)}
                        className="flex-1 min-w-0 text-xs p-1.5 rounded border border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                      />
                      <button onClick={handleSaveIssuer} className="p-1 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors" title="Save">
                        <i className="fas fa-check"></i>
                      </button>
                      <button onClick={handleCancelEdit} className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Cancel">
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group/edit relative">
                      <span className="text-xs font-semibold text-slate-700 dark:text-neutral-300 truncate max-w-[140px]" title={cert.issuerName}>
                        {cert.issuerName}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                        className="text-slate-400 hover:text-blue-500 transition-colors p-1"
                        aria-label="Edit Issuer"
                        title="Edit Issuer Name"
                      >
                        <i className="fas fa-pencil-alt text-[10px]"></i>
                      </button>
                    </div>
                  )}
                </div>
             </div>
             
             {!cert.imageUrl && cert.isValid && (
               <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900 shadow-sm shrink-0">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-wide">Verified</span>
               </div>
             )}
          </div>

          {/* Main Content: Course Name */}
          <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
            {cert.courseName}
          </h3>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 mt-auto mb-6">
            {!cert.imageUrl && (
               <div className="bg-slate-50 dark:bg-neutral-800/50 rounded-lg p-2.5 border border-slate-100 dark:border-neutral-800 transition-colors group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10">
                 <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-bold uppercase block mb-0.5">Grade Achieved</span>
                 <span className="text-base font-bold text-slate-800 dark:text-neutral-200">{cert.grade}</span>
               </div>
            )}
            <div className={`${cert.imageUrl ? 'col-span-2' : ''} bg-slate-50 dark:bg-neutral-800/50 rounded-lg p-2.5 border border-slate-100 dark:border-neutral-800 transition-colors group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10`}>
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
                onClick={handleDownloadClick}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-neutral-800 text-slate-400 dark:text-neutral-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-blue-100 dark:hover:border-blue-800 transition-all"
                title="Download PDF"
              >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                 </svg>
              </button>

              <button 
                onClick={toggleExpanded}
                className={`w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-neutral-800 text-slate-400 dark:text-neutral-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-blue-100 dark:hover:border-blue-800 transition-all ${isExpanded ? 'bg-blue-50 text-blue-600 rotate-180' : ''}`}
                title="View Details"
              >
                 <svg className="w-5 h-5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                 </svg>
              </button>
          </div>
        </div>
        
        {/* Expandable Details Section */}
        <div className={`bg-slate-50 dark:bg-neutral-900/50 border-t border-slate-100 dark:border-neutral-800 overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
               <div>
                 <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-neutral-500 tracking-wider">Blockchain Transaction</span>
                 <p className="text-xs font-mono text-slate-600 dark:text-neutral-400 break-all bg-white dark:bg-neutral-800 p-2 rounded mt-1 border border-slate-200 dark:border-neutral-700">
                   {cert.blockchainTx}
                 </p>
               </div>
               <div>
                 <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-neutral-500 tracking-wider">IPFS Content Hash</span>
                 <p className="text-xs font-mono text-slate-600 dark:text-neutral-400 break-all bg-white dark:bg-neutral-800 p-2 rounded mt-1 border border-slate-200 dark:border-neutral-700">
                   {cert.ipfsCid}
                 </p>
               </div>
               <div>
                 <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-neutral-500 tracking-wider">Student APPAR ID</span>
                 <p className="text-sm font-semibold text-slate-700 dark:text-neutral-300 mt-0.5">
                   {cert.studentApparId}
                 </p>
               </div>
             </div>
             
             <div className="flex flex-col items-center justify-center bg-white dark:bg-neutral-800 rounded-xl p-4 border border-slate-200 dark:border-neutral-700">
               <span className="text-xs font-bold text-slate-500 dark:text-neutral-400 mb-3">Verification QR Code</span>
               {qrCodeDataUrl ? (
                 <img src={qrCodeDataUrl} alt="Verification QR" className="w-32 h-32 rounded-lg" />
               ) : (
                 <div className="w-32 h-32 bg-slate-100 dark:bg-neutral-700 animate-pulse rounded-lg"></div>
               )}
               <p className="text-[10px] text-center text-slate-400 mt-2 max-w-[150px]">
                 Scan to verify authenticity on SkillChain
               </p>
             </div>
          </div>
        </div>

      </div>

      {/* Confirmation Modal Portal */}
      {showDownloadModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={cancelDownload}>
          <div 
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-neutral-800 p-6 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
               <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-blue-400">
                 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                 </svg>
               </div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Download Verified Certificate?</h3>
               <p className="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">
                 You are about to download the cryptographically signed asset directly from IPFS. This file contains the blockchain verification metadata required for off-chain validation.
               </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={cancelDownload}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDownload}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-colors"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};