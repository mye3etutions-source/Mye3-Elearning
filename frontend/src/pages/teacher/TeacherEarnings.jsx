import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, CheckCircle, Clock, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TeacherEarnings = () => {
    const [earnings, setEarnings] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [payRates, setPayRates] = useState({ rateA: 0, rateB: 0 });
    const [viewMode, setViewMode] = useState('monthly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [earnRes, sessRes, profRes] = await Promise.all([
                    axios.get('/teacher/earnings'),
                    axios.get('/teacher/live-sessions'),
                    axios.get('/auth/profile')
                ]);
                setEarnings(earnRes.data);
                setSessions(sessRes.data || []);
                setPayRates(profRes.data?.payRates || { rateA: 0, rateB: 0 });
                setLoading(false);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load data');
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    const getSessionRate = (level) => {
        const cl = (level || '').toLowerCase();
        if (cl.includes('11') || cl.includes('12') || cl.includes('inter')) return payRates.rateB;
        return payRates.rateA;
    };

    const getMonday = (d) => {
        const dt = new Date(d);
        const day = dt.getDay(), diff = dt.getDate() - day + (day === 0 ? -6:1);
        dt.setDate(diff);
        return dt;
    };

    const buildGroupedData = (groupType) => {
        const obj = sessions.reduce((acc, s) => {
            const dateRef = s.endTime || s.startTime;
            if (!dateRef) return acc;
            
            let key, dateObj;
            if (groupType === 'daily') {
                dateObj = new Date(dateRef);
                key = dateObj.toLocaleDateString('en-GB');
            } else {
                dateObj = getMonday(dateRef);
                key = "Week of " + dateObj.toLocaleDateString('en-GB');
            }

            if (!acc[key]) acc[key] = { date: key, dateObj, sessions: 0, amount: 0, details: [] };
            acc[key].sessions += 1;
            acc[key].amount += s.status === 'ended' ? getSessionRate(s.classLevel) : 0;
            acc[key].details.push(s);
            return acc;
        }, {});
        return Object.values(obj).sort((a, b) => b.dateObj - a.dateObj);
    };

    const dailyEarnings = buildGroupedData('daily');
    const weeklyEarnings = buildGroupedData('weekly');

    const months = [
        { val: 1, label: 'January' }, { val: 2, label: 'February' }, { val: 3, label: 'March' },
        { val: 4, label: 'April' }, { val: 5, label: 'May' }, { val: 6, label: 'June' },
        { val: 7, label: 'July' }, { val: 8, label: 'August' }, { val: 9, label: 'September' },
        { val: 10, label: 'October' }, { val: 11, label: 'November' }, { val: 12, label: 'December' }
    ];

    if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;

    const totalEarned = earnings.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const paidAmount = earnings.filter(e => e.status === 'Paid').reduce((acc, curr) => acc + curr.totalAmount, 0);
    const pendingAmount = earnings.filter(e => e.status === 'Pending').reduce((acc, curr) => acc + curr.totalAmount, 0);

    return (
        <div className="space-y-8 animate-in fade-in p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#002147] tracking-tighter uppercase italic">My Earnings</h1>
                    <p className="text-sm font-bold text-slate-500 mt-1">Track your monthly payouts and transaction history</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-xl">
                     <div className="w-16 h-16 bg-slate-50 text-slate-800 rounded-2xl flex items-center justify-center border border-slate-200">
                        <DollarSign className="w-8 h-8" />
                     </div>
                     <div>
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Lifetime Earned</p>
                         <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{totalEarned}</p>
                     </div>
                 </div>
                 <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-xl border-t-4 border-t-rose-500">
                     <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                        <Clock className="w-8 h-8" />
                     </div>
                     <div>
                         <p className="text-[10px] font-black uppercase text-rose-400 tracking-widest leading-none mb-1">Total Pending</p>
                         <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{pendingAmount}</p>
                     </div>
                 </div>
                 <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-xl border-t-4 border-t-emerald-500">
                     <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <CheckCircle className="w-8 h-8" />
                     </div>
                     <div>
                         <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest leading-none mb-1">Total Paid</p>
                         <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{paidAmount}</p>
                     </div>
                 </div>
            </div>

            <div className="bg-white border rounded-[40px] overflow-hidden shadow-sm">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter">Earnings & Schedule</h2>
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                        <button 
                            onClick={() => setViewMode('monthly')}
                            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-colors ${viewMode === 'monthly' ? 'bg-[#002147] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Monthly
                        </button>
                        <button 
                            onClick={() => setViewMode('weekly')}
                            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-colors ${viewMode === 'weekly' ? 'bg-[#f16126] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Weekly
                        </button>
                        <button 
                            onClick={() => setViewMode('daily')}
                            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-colors ${viewMode === 'daily' ? 'bg-[#f16126] text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Day-Wise
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto p-4">
                    <table className="w-full text-left text-sm">
                        <thead className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                            <tr>
                                <th className="px-6 py-4">{viewMode === 'monthly' ? 'Billing Month' : (viewMode === 'weekly' ? 'Week Index' : 'Date')}</th>
                                <th className="px-6 py-4">Classes Logged & Details</th>
                                <th className="px-6 py-4">Total Amount</th>
                                {viewMode === 'monthly' && <th className="px-6 py-4">Status & Details</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600 font-bold">
                            {viewMode === 'monthly' ? (
                                earnings.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-full"><FileText className="w-8 h-8 text-slate-300" /></div>
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">No Earnings Generated Yet</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : earnings.map(e => (
                                    <tr key={e._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><CalendarIcon className="w-5 h-5" /></div>
                                                <span className="text-sm font-black text-[#002147] uppercase italic">{months.find(m => m.val === e.month)?.label} {e.year}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 font-bold text-slate-500">{e.totalSessions} sessions</td>
                                        <td className="px-6 py-6 text-xl font-black text-slate-900 tracking-tighter">₹{e.totalAmount}</td>
                                        <td className="px-6 py-6">
                                            {e.status === 'Paid' ? (
                                                <div className="flex flex-col items-start">
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Paid</span>
                                                    <span className="text-[10px] text-slate-400 font-black mt-1.5 uppercase tracking-widest">TRX: {e.transactionId || 'N/A'}</span>
                                                </div>
                                            ) : (
                                                <span className="px-3 py-1 bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> Pending</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                (viewMode === 'daily' ? dailyEarnings : weeklyEarnings).length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-full"><CalendarIcon className="w-8 h-8 text-slate-300" /></div>
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">No Sessions Yet</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (viewMode === 'daily' ? dailyEarnings : weeklyEarnings).map((d, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-6 align-top font-black text-slate-800 pt-8">{d.date}</td>
                                        <td className="px-6 py-6 align-top">
                                            <div className="font-black text-slate-800 text-sm mb-3 bg-slate-100 w-max px-3 py-1 rounded-md">{d.sessions} Total Sessions</div>
                                            <div className="space-y-2 grid grid-cols-1 max-w-lg">
                                                {d.details.map((s, idx) => (
                                                    <div key={s._id || idx} className={`p-3 rounded-xl border ${s.status === 'ended' ? 'bg-emerald-50/50 border-emerald-100' : s.status === 'live' ? 'bg-rose-50 border-rose-200 shadow-sm' : 'bg-white border-slate-200'}`}>
                                                        <div className="flex justify-between items-start mb-1.5">
                                                            <span className="font-black text-[#002147]">{s.title}</span>
                                                            <span className={`text-[9px] px-2 py-1 uppercase tracking-widest font-black rounded-lg ${s.status === 'ended' ? 'text-emerald-700 bg-emerald-100' : s.status === 'live' ? 'text-rose-700 bg-rose-200 animate-pulse' : 'text-slate-500 bg-slate-100'}`}>
                                                                {s.status}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs font-bold text-slate-500 flex items-center gap-2">
                                                            <span className="text-[#f16126]">{s.subjectName}</span>
                                                            <span>• {new Date(s.endTime || s.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 align-top pt-8 text-xl font-black text-emerald-600 tracking-tighter">
                                            {d.amount > 0 ? `₹${d.amount}` : <span className="text-sm text-slate-400">Scheduled</span>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherEarnings;
