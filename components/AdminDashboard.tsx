import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getApiBase } from '../utils/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiBase = getApiBase();
        const res = await fetch(`${apiBase}/api/admin/stats`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch admin stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
     return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full"></div></div>;
  }

  if (!stats) return <div className="text-center py-20 text-slate-500">Failed to load statistics.</div>;

  const roleData = [
    { name: 'Students', value: stats.roles.students, fill: '#6366f1' },
    { name: 'Institutes', value: stats.roles.institutes, fill: '#10b981' },
    { name: 'Companies', value: stats.roles.companies, fill: '#8b5cf6' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 uppercase">Total Users</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500 uppercase">Certificates Issued</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{stats.totalCertificates}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-sm font-medium text-slate-500 uppercase">Active Institutes</p>
           <p className="text-3xl font-bold text-green-600 mt-2">{stats.roles.institutes}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <p className="text-sm font-medium text-slate-500 uppercase">Partner Companies</p>
           <p className="text-3xl font-bold text-purple-600 mt-2">{stats.roles.companies}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Distribution Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">User Distribution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Weekly Activity</h3>
          <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={stats.recentActivity}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="name" />
                 <YAxis />
                 <Tooltip />
                 <Legend />
                 <Bar dataKey="newUsers" name="New Users" fill="#6366f1" radius={[4, 4, 0, 0]} />
                 <Bar dataKey="issuedCerts" name="Issued Certificates" fill="#10b981" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};