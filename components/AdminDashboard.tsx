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
     return <div className="flex justify-center py-20 min-h-[60vh] items-center"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full"></div></div>;
  }

  if (!stats) return <div className="text-center py-20 text-slate-500 dark:text-neutral-400">Failed to load statistics. Check backend connection.</div>;

  const roleData = [
    { name: 'Students', value: stats.roles.students, fill: '#6366f1' },
    { name: 'Institutes', value: stats.roles.institutes, fill: '#10b981' },
    { name: 'Companies', value: stats.roles.companies, fill: '#8b5cf6' },
  ];

  const KpiCard = ({ title, value, colorClass }: { title: string, value: number, colorClass: string }) => (
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all duration-300">
      <p className="text-sm font-medium text-slate-500 dark:text-neutral-400 uppercase tracking-wider">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${colorClass}`}>{value}</p>
    </div>
  );

  // Custom tooltip for dark mode compatibility
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-3 rounded-lg shadow-lg">
          <p className="label font-bold text-slate-900 dark:text-white mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.fill }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-8">Admin Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <KpiCard title="Total Users" value={stats.totalUsers} colorClass="text-indigo-600 dark:text-indigo-400" />
        <KpiCard title="Certificates Issued" value={stats.totalCertificates} colorClass="text-blue-600 dark:text-blue-400" />
        <KpiCard title="Active Institutes" value={stats.roles.institutes} colorClass="text-emerald-600 dark:text-emerald-400" />
        <KpiCard title="Partner Companies" value={stats.roles.companies} colorClass="text-purple-600 dark:text-purple-400" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Distribution Chart */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">User Distribution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-neutral-800" />
                <XAxis dataKey="name" stroke="#64748b" className="dark:text-neutral-500" />
                <YAxis stroke="#64748b" className="dark:text-neutral-500" />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                <Bar dataKey="value" name="Count" radius={[4, 4, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Weekly Activity</h3>
          <div className="h-80 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={stats.recentActivity}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-neutral-800" />
                 <XAxis dataKey="name" stroke="#64748b" className="dark:text-neutral-500" />
                 <YAxis stroke="#64748b" className="dark:text-neutral-500" />
                 <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                 <Legend wrapperStyle={{ paddingTop: '20px' }} />
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