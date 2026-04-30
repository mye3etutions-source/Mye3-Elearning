import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, CheckCircle, Clock, AlertCircle, FileText, User, CreditCard, Wallet, BookOpen, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import TeacherProfile from './TeacherProfile';

const TeacherPayouts = () => {
    const [payrollData, setPayrollData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingProfile, setViewingProfile] = useState(null); // Teacher object for detailed view
    
    // Settlement Modal State
    const [settleModal, setSettleModal] = useState({ 
        show: false, 
        teacherId: null, 
        teacherName: '',
        sessionIds: [], 
        totalAmount: 0,
        paymentMode: 'Online', // Online or Cash
        transactionId: '',
        note: ''
    });

    useEffect(() => {
        fetchPayroll();
    }, []);

    const fetchPayroll = async () => {
        try {
            const { data } = await axios.get('/admin/teacher-payroll');
            setPayrollData(data || []);
        } catch (error) {
            toast.error('Failed to load payroll data');
        } finally {
            setLoading(false);
        }
    };

    const handleSettle = async (e) => {
        e.preventDefault();
        if (settleModal.paymentMode === 'Online' && !settleModal.transactionId) {
            return toast.error('Transaction ID is required for Online payments');
        }

        const loadingToast = toast.loading('Recording settlement...');
        try {
            await axios.post('/admin/teacher-payroll/settle', { 
                teacherId: settleModal.teacherId,
                sessionIds: settleModal.sessionIds,
                totalAmount: settleModal.totalAmount,
                paymentMode: settleModal.paymentMode,
                transactionId: settleModal.transactionId,
                note: settleModal.note
            });
            toast.success('Payment settled successfully!', { id: loadingToast });
            setSettleModal({ show: false, teacherId: null, teacherName: '', sessionIds: [], totalAmount: 0, paymentMode: 'Online', transactionId: '', note: '' });
            fetchPayroll(); // Refresh
        } catch (error) {
            toast.error('Failed to settle payment', { id: loadingToast });
        }
    };

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#002147] border-t-transparent rounded-full"></div>
        </div>
    );

    if (viewingProfile) {
        return <TeacherProfile teacher={viewingProfile} onBack={() => setViewingProfile(null)} />;
    }

    const totalPending = payrollData.reduce((acc, curr) => acc + curr.pendingAmount, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-300 px-2 md:px-0 max-w-6xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-0.5">
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Teacher Payroll</h1>
                    <p className="text-slate-500 font-medium text-xs">Manage class-wise earnings and settlements</p>
                </div>
                
                <div className="bg-white px-4 py-2 rounded-xl border border-rose-100 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
                        <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Outstanding</p>
                        <p className="text-lg font-black text-slate-900">₹{totalPending}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Teacher / Faculty</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Unpaid Balance</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Paid</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Classes</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {payrollData.map((data) => {
                            const { teacher, pendingAmount, unpaidSessionsCount, history } = data;
                            const totalPaid = history
                                .filter(p => p.status === 'Paid' || p.status === 'Settled')
                                .reduce((acc, curr) => acc + curr.totalAmount, 0);
                            
                            return (
                                <tr key={teacher._id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#002147] text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-blue-900/10">
                                                {teacher.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{teacher.name}</span>
                                                <span className="text-[10px] font-medium text-slate-400">{teacher.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-lg font-black text-orange-600">₹{pendingAmount}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-lg font-black text-emerald-600">₹{totalPaid}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full w-fit">
                                            <BookOpen className="w-3 h-3 text-slate-400" />
                                            <span className="text-[10px] font-bold text-slate-600">{unpaidSessionsCount} Pending</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => setViewingProfile(teacher)}
                                                className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-[#002147] hover:text-white transition-all border border-slate-200"
                                                title="View Detailed Profile"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                disabled={pendingAmount === 0}
                                                onClick={() => setSettleModal({
                                                    show: true,
                                                    teacherId: teacher._id,
                                                    teacherName: teacher.name,
                                                    sessionIds: data.unpaidSessions.map(s => s._id),
                                                    totalAmount: pendingAmount,
                                                    paymentMode: 'Online',
                                                    transactionId: '',
                                                    note: ''
                                                })}
                                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    pendingAmount > 0 
                                                    ? 'bg-[#002147] text-white hover:bg-[#f16126] shadow-md hover:shadow-orange-600/20' 
                                                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                                }`}
                                            >
                                                Settle Payment
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {payrollData.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-30">
                                        <FileText className="w-12 h-12" />
                                        <p className="text-sm font-bold uppercase tracking-widest">No faculty data available</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* SETTLE MODAL */}
            {settleModal.show && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Settle Payment</h3>
                                <p className="text-xs font-medium text-slate-500">For <span className="text-[#002147] font-bold">{settleModal.teacherName}</span></p>
                            </div>
                            <button onClick={() => setSettleModal(m => ({...m, show: false}))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">✕</button>
                        </div>
                        
                        <div className="p-6 bg-orange-50 border-b border-orange-100 text-center">
                            <span className="text-xs font-bold text-orange-600/70 uppercase tracking-widest block mb-1">Total Settlement Amount</span>
                            <span className="text-4xl font-black text-orange-600">₹{settleModal.totalAmount}</span>
                            <span className="text-xs font-medium text-orange-800/60 mt-1 block">For {settleModal.sessionIds.length} completed classes</span>
                        </div>

                        <form onSubmit={handleSettle} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 ml-1">Payment Mode</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSettleModal(m => ({...m, paymentMode: 'Online'}))}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-xs transition-all ${
                                            settleModal.paymentMode === 'Online'
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        <CreditCard className="w-4 h-4" /> Online Payment
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSettleModal(m => ({...m, paymentMode: 'Cash'}))}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-xs transition-all ${
                                            settleModal.paymentMode === 'Cash'
                                            ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        <Wallet className="w-4 h-4" /> Cash Handover
                                    </button>
                                </div>
                            </div>

                            {settleModal.paymentMode === 'Online' && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-600 ml-1">Transaction ID <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        value={settleModal.transactionId}
                                        onChange={e => setSettleModal(m => ({ ...m, transactionId: e.target.value }))}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-600 transition-colors"
                                        placeholder="e.g. TXN123456789"
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-600 ml-1">Notes / Remarks (Optional)</label>
                                <textarea
                                    value={settleModal.note}
                                    onChange={e => setSettleModal(m => ({ ...m, note: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-600 transition-colors resize-none h-20"
                                    placeholder="Any internal notes about this payment..."
                                />
                            </div>

                            <button type="submit" className="w-full bg-[#002147] text-white rounded-xl py-3 font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-slate-200 mt-2">
                                Confirm Settlement
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherPayouts;
