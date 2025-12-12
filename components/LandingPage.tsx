import React from 'react';
import { ViewState } from '../types';

interface LandingPageProps {
  onNavigate: (view: ViewState) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight mb-6 transition-colors">
          Blockchain-Based Skill Credentialing System
        </h1>
        <p className="text-lg md:text-xl text-slate-500 dark:text-neutral-400 mb-10 max-w-3xl mx-auto leading-relaxed transition-colors">
          Securely issue, verify, and share skill credentials using blockchain technology. 
          Build trust between learners, issuers, and employers.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => onNavigate('LOGIN')}
            className="px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 transition-all text-base"
          >
            Get Started
          </button>
          <button className="px-8 py-3.5 bg-white dark:bg-transparent text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 font-semibold rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-base">
            View Credentials
          </button>
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Learner Card */}
          <div className="bg-blue-50/80 dark:bg-neutral-900 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer border border-blue-100 dark:border-neutral-800 group">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Learner</h3>
            <p className="text-slate-600 dark:text-neutral-400 mb-6 leading-relaxed">
              Access and manage your blockchain-verified certificates. Share your portfolio securely with future employers.
            </p>
            <div className="flex justify-center">
               <div className="w-full h-32 bg-blue-200/50 dark:bg-blue-900/10 rounded-lg flex items-center justify-center text-blue-400 dark:text-blue-300">
                 <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                 </svg>
               </div>
            </div>
          </div>

          {/* Issuer Card */}
          <div className="bg-green-50/80 dark:bg-neutral-900 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer border border-green-100 dark:border-neutral-800 group">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Issuer</h3>
            <p className="text-slate-600 dark:text-neutral-400 mb-6 leading-relaxed">
              Issue verifiable skill credentials securely using blockchain. Reduce fraud and streamline the verification process.
            </p>
            <div className="flex justify-center">
               <div className="w-full h-32 bg-green-200/50 dark:bg-green-900/10 rounded-lg flex items-center justify-center text-green-500 dark:text-green-400">
                 <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               </div>
            </div>
          </div>

          {/* Company Card */}
           <div className="bg-purple-50/80 dark:bg-neutral-900 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer border border-purple-100 dark:border-neutral-800 group">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Company</h3>
            <p className="text-slate-600 dark:text-neutral-400 mb-6 leading-relaxed">
              Instantly verify candidate credentials. Save time and resources on background checks with tamper-proof records.
            </p>
            <div className="flex justify-center">
               <div className="w-full h-32 bg-purple-200/50 dark:bg-purple-900/10 rounded-lg flex items-center justify-center text-purple-500 dark:text-purple-400">
                 <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-3m0 0l3-3m-3 3l-3-3" />
                 </svg>
               </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};