import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, CheckCircle, Clock, Calendar as CalendarIcon, FileText, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

const months = [
    { val: 1, label: 'January' }, { val: 2, label: 'February' }, { val: 3, label: 'March' },
    { val: 4, label: 'April' }, { val: 5, label: 'May' }, { val: 6, label: 'June' },
    { val: 7, label: 'July' }, { val: 8, label: 'August' }, { val: 9, label: 'September' },
    { val: 10, label: 'October' }, { val: 11, label: 'November' }, { val: 12, label: 'December' }
];

const TeacherEarnings = () => {
    const [earningsData, setEarningsData] = useState({
        pendingAmount: 0,
        unpaidSessionsCount: 0,
        unpaidSessions: [],
        history: []
    });
    const [viewMode, setViewMode] = useState('pending'); // 'pending' or 'history'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const { data } = await axios.get('/teacher/earnings');
                setEarningsData(data);
            } catch (error) {
                toast.error('Failed to load earnings data');
            } finally {
                setLoading(false);
            }
        };
        fetchEarnings();
    }, []);

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#002147] border-t-transparent rounded-full"></div>
        </div>
    );

    const paidAmount = earningsData.history.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalEarned = earningsData.pendingAmount + paidAmount;

    return (
        <div className="space-y-6 animate-in fade-in duration-300 px-2 md:px-0 max-w-6xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-0.5">
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">My Earnings</h1>
                    <p className="text-slate-500 font-medium text-xs">Track your class-wise earnings and payout history</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                     <div className="w-14 h-14 bg-slate-50 text-slate-800 rounded-xl flex items-center justify-center border border-slate-200">
                        <Wallet className="w-6 h-6" />
                     </div>
                     <div>
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Lifetime Earned</p>
                         <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{totalEarned}</p>
                     </div>
                 </div>
                 <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                     <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center border border-orange-100">
                        <Clock className="w-6 h-6" />
                     </div>
                     <div>
                         <p className="text-[10px] font-black uppercase text-orange-400 tracking-widest leading-none mb-1">Unpaid Balance</p>
                         <p className="text-2xl font-black text-orange-600 tracking-tighter">₹{earningsData.pendingAmount}</p>
                     </div>
                 </div>
                 <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                     <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                        <CheckCircle className="w-6 h-6" />
                     </div>
                     <div>
                         <p className="text-[10px] font-black uppercase text-emerald-500 tracking-widest leading-none mb-1">Total Paid</p>
                         <p className="text-2xl font-black text-emerald-600 tracking-tighter">₹{paidAmount}</p>
                     </div>
                 </div>
            </div>

            {/* Content Area */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
                    <div className="flex gap-2 bg-white border border-slate-200 p-1 rounded-xl w-full md:w-auto">
                        <button 
                            onClick={() => setViewMode('pending')}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                                viewMode === 'pending' 
                                ? 'bg-[#f16126] text-white shadow-sm' 
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            Pending Classes
                        </button>
                        <button 
                            onClick={() => setViewMode('history')}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                                viewMode === 'history' 
                                ? 'bg-[#002147] text-white shadow-sm' 
                                : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            Payout History
                        </button>
                    </div>
                </div>

                <div className="p-0">
                    {viewMode === 'pending' && (
                        <div>
                            {earningsData.unpaidSessions.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                                    <BookOpen className="w-12 h-12 opacity-50 mb-3" />
                                    <span className="text-sm font-bold">No unpaid classes found.</span>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <tr>
                                                <th className="px-6 py-4">Date & Time</th>
                                                <th className="px-6 py-4">Class Details</th>
                                                <th className="px-6 py-4">Duration</th>
                                                <th className="px-6 py-4 text-right">Earned</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                            {earningsData.unpaidSessions.map(session => {
                                                const start = new Date(session.startTime);
                                                const end = new Date(session.endTime);
                                                const durationMins = Math.round((end - start) / 60000);
                                                
                                                return (
                                                    <tr key={session._id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-900">{start.toLocaleDateString('en-GB')}</div>
                                                            <div className="text-xs text-slate-500">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-[#002147]">{session.title}</div>
                                                            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mt-1">
                                                                {session.subjectName} • {session.classLevel}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold">
                                                                {durationMins} mins
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className="text-lg font-black text-orange-600">₹{session.priceApplied}</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {viewMode === 'history' && (
                        <div>
                            {earningsData.history.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                                    <FileText className="w-12 h-12 opacity-50 mb-3" />
                                    <span className="text-sm font-bold">No payout history found.</span>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <tr>
                                                <th className="px-6 py-4">Date Settled</th>
                                                <th className="px-6 py-4">Classes</th>
                                                <th className="px-6 py-4">Payment Info</th>
                                                <th className="px-6 py-4 text-right">Amount Paid</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                                            {earningsData.history.map(payout => {
                                                const d = new Date(payout.createdAt);
                                                return (
                                                    <tr key={payout._id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-slate-900 flex items-center gap-2">
                                                                <CalendarIcon className="w-4 h-4 text-slate-400" />
                                                                {d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-bold text-[#002147]">{payout.sessionIds?.length || 0} classes</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="w-max px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded">
                                                                    {payout.paymentMode || 'Paid'}
                                                                </span>
                                                                {payout.transactionId && (
                                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">TXN: {payout.transactionId}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <span className="text-lg font-black text-emerald-600">₹{payout.totalAmount}</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherEarnings;
