import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Users, IndianRupee, BookOpen, Clock, Activity, Calendar, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import io from 'socket.io-client';

const getSocketUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace('/api', '').replace(/\/$/, '');
  }
  return `${window.location.protocol}//${window.location.hostname}:5000`;
};

const socket = io(getSocketUrl(), {
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000
});

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/admin/stats');
        setStatsData(data);
        setLoading(false);
      } catch (error) {
        console.error('DASHBOARD ERROR:', error);
        setLoading(false);
      }
    };
    fetchStats();

    // Real-time updates via Socket.io
    socket.on('live-session-update', () => {
      console.log('Admin Dashboard: Live session update received, re-fetching...');
      fetchStats();
    });

    socket.on('admin-stats-update', () => {
      console.log('Admin Dashboard: Global stats update, re-fetching...');
      fetchStats();
    });

    // The Universal Fix for Recharts dimension warnings:
    const timer = setTimeout(() => setIsChartReady(true), 150);
    return () => {
      clearTimeout(timer);
      socket.off('live-session-update');
      socket.off('admin-stats-update');
    };
  }, []);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  const stats = [
    { label: 'Total Revenue', value: statsData?.totalRevenue ? `₹${Number(statsData.totalRevenue).toLocaleString('en-IN')}` : '₹0', icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50', path: '/admin/transactions' },
    { label: 'Total Students', value: statsData?.totalStudents?.toString() || '0', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', path: '/admin/students' },
    { label: 'Active Teachers', value: statsData?.totalTeachers?.toString() || '0', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', path: '/admin/teachers' },
    { label: 'Live Now', value: statsData?.liveSessionsCount?.toString() || '0', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-50', path: '/admin/live-monitor' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
         <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Executive Overview</h1>
            <p className="text-slate-500 font-bold">Real-time performance metrics and institutional health</p>
         </div>
         <div className="flex items-center gap-3 text-sm font-bold text-slate-400 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
         </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link 
              key={idx} 
              to={stat.path}
              className="premium-card bg-white p-8 flex items-center gap-6 border-none shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] group hover:scale-[1.02] transition-all"
            >
              <div className={`w-16 h-16 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform`}>
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Feature Quick Access for Students (Addressing user's concern about visibility) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Link to="/admin/students" className="premium-card p-8 bg-indigo-600 text-white flex items-center justify-between group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-all"></div>
            <div className="relative z-10 flex items-center gap-6">
               <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Users className="w-7 h-7" />
               </div>
               <div>
                  <h3 className="text-xl font-black">Student Management</h3>
                  <p className="text-xs font-bold text-indigo-100">Enroll students & manage manual subscriptions</p>
               </div>
            </div>
            <ArrowRight className="relative z-10 w-6 h-6 group-hover:translate-x-2 transition-transform" />
         </Link>
         
         <Link to="/admin/teachers" className="premium-card p-8 bg-slate-900 text-white flex items-center justify-between group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-all"></div>
            <div className="relative z-10 flex items-center gap-6">
               <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-amber-400">
                  <Activity className="w-7 h-7" />
               </div>
               <div>
                  <h3 className="text-xl font-black">Faculty Hub</h3>
                  <p className="text-xs font-bold text-slate-400">Assign subjects & audit teacher permissions</p>
               </div>
            </div>
            <ArrowRight className="relative z-10 w-6 h-6 group-hover:translate-x-2 transition-transform" />
         </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
          
          {/* Revenue Chart Placeholder */}
          <div className="premium-card p-8 bg-white">
             <div className="flex items-center justify-between mb-10">
                <div>
                   <h2 className="text-xl font-black text-slate-900">Revenue Growth</h2>
                   <p className="text-xs font-bold text-slate-400">Monthly breakdown of student subscriptions</p>
                </div>
                <div className="flex gap-2">
                   {['Week', 'Month', 'Year'].map(t => (
                     <button key={t} className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${t === 'Month' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>{t}</button>
                   ))}
                </div>
             </div>
             <div className="h-72 w-full mt-6 overflow-hidden">
                {(isChartReady && statsData?.revenueChartData) ? (
                   <ResponsiveContainer width="100%" height={280}>
                      <AreaChart 
                        data={statsData.revenueChartData} 
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                         <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                               <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                               <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                            </linearGradient>
                         </defs>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis 
                           dataKey="name" 
                           axisLine={false} 
                           tickLine={false} 
                           tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}}
                           dy={10}
                         />
                         <YAxis 
                           axisLine={false} 
                           tickLine={false} 
                           tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}}
                           tickFormatter={(val) => `₹${val}`}
                         />
                         <Tooltip 
                           contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold'}}
                         />
                         <Area 
                           type="monotone" 
                           dataKey="revenue" 
                           stroke="#4f46e5" 
                           strokeWidth={4}
                           fillOpacity={1} 
                           fill="url(#colorRev)" 
                         />
                      </AreaChart>
                   </ResponsiveContainer>
                ) : (
                   <div className="h-full w-full flex items-center justify-center bg-slate-50 rounded-3xl animate-pulse">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center">Optimizing Analytics Hub...</p>
                   </div>
                )}
             </div>
          </div>

          <div className="premium-card overflow-hidden bg-white">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Recent Transactions</h2>
              <Link to="/admin/transactions" className="text-xs font-black text-indigo-600 hover:underline px-4 py-2 bg-indigo-50 rounded-xl transition-all">View All</Link>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                   <tr>
                     <th className="px-8 py-5">Student Name</th>
                     <th className="px-8 py-5">Package</th>
                     <th className="px-8 py-5">Amount</th>
                     <th className="px-8 py-5">Status</th>
                     <th className="px-8 py-5">Date</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm border-t border-slate-50 divide-y divide-slate-50">
                    {statsData?.recentTransactions?.length > 0 ? statsData.recentTransactions.map((txn, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-all group">
                        <td className="px-8 py-5 font-black text-slate-900">{txn.name}</td>
                        <td className="px-8 py-5 text-slate-600 font-bold uppercase tracking-tight">{txn.packageName}</td>
                        <td className="px-8 py-5 font-black text-slate-900">{txn.amount}</td>
                        <td className="px-8 py-5">
                           <span className={`px-3 py-1 text-[10px] font-black rounded-lg tracking-wider ${txn.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                              {txn.status}
                           </span>
                        </td>
                        <td className="px-8 py-5 text-slate-400 font-bold lowercase tracking-tight">
                           {new Date(txn.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-8 py-20 text-center italic font-bold text-slate-300">No recent activity detected</td>
                      </tr>
                    )}
                 </tbody>
               </table>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 space-y-10">
           {/* Ongoing Live Class Widget */}
           <div className="premium-card p-8 bg-slate-900 text-white border-none shadow-[0_30px_60px_-15px_rgba(79,70,229,0.3)] min-h-[400px]">
              <div className="flex items-center justify-between mb-10">
                 <div className="flex items-center gap-3">
                    <Activity className="text-indigo-400 w-6 h-6 animate-pulse" />
                    <h2 className="text-xl font-black tracking-tight uppercase">Live Hub</h2>
                 </div>
                 <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-black rounded-lg backdrop-blur-md">{statsData?.activeSessions?.length || 0} ACTIVE</span>
              </div>
              
              <div className="space-y-6">
                  {statsData?.activeSessions?.length > 0 ? statsData.activeSessions.map((c, i) => (
                     <div key={i} className="p-6 bg-white/5 rounded-3xl border border-indigo-500/30 text-indigo-400 space-y-4 hover:bg-white/10 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start">
                           <p className="font-black text-lg group-hover:text-white transition-colors uppercase tracking-tight">{c.title}</p>
                           <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                        </div>
                        <div className="space-y-2">
                           <p className="text-xs font-bold text-white/50">Tutor: {c.teacherId?.name}</p>
                           <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-white/10 rounded-md text-[9px] font-black tracking-widest uppercase">{c.subjectName}</span>
                              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest underline decoration-indigo-500 decoration-2 underline-offset-4">Join Session</span>
                           </div>
                        </div>
                     </div>
                  )) : (
                     <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 opacity-30">
                        <Activity className="w-10 h-10 mx-auto mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No Sessions Live</p>
                     </div>
                  )}
                  <Link 
                    to="/admin/live-monitor"
                    className="w-full py-5 text-[10px] flex items-center justify-center font-black uppercase tracking-widest border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-white/60 hover:text-white"
                  >
                    Audit Active Sessions
                  </Link>
              </div>
           </div>

           {/* Quick Stats Summary */}
           <div className="premium-card p-8 bg-indigo-600 text-white border-none overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <div className="relative z-10 space-y-4">
                 <h3 className="text-lg font-black italic">"Education is the most powerful weapon"</h3>
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black">M</div>
                    <p className="text-xs font-bold text-white/70">Daily Insight by Mye3 AI</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
