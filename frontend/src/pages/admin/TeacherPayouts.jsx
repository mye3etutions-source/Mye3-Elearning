import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, DollarSign, Calendar as CalendarIcon, CheckCircle, Clock, AlertCircle, FileText, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

const months = [
    { val: 1, label: 'January' }, { val: 2, label: 'February' }, { val: 3, label: 'March' },
    { val: 4, label: 'April' }, { val: 5, label: 'May' }, { val: 6, label: 'June' },
    { val: 7, label: 'July' }, { val: 8, label: 'August' }, { val: 9, label: 'September' },
    { val: 10, label: 'October' }, { val: 11, label: 'November' }, { val: 12, label: 'December' }
];

const TeacherPayouts = () => {
    const [teachers, setTeachers] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [calcMonth, setCalcMonth] = useState(new Date().getMonth() + 1);
    const [calcYear, setCalcYear] = useState(new Date().getFullYear());
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [calculating, setCalculating] = useState(false);
    const [payModal, setPayModal] = useState({ show: false, payoutId: null, txnId: '' });

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [teacherRes, payoutRes] = await Promise.all([
                axios.get('/admin/teachers-list'),
                axios.get('/admin/payroll')
            ]);
            setTeachers(teacherRes.data || []);
            setPayouts(payoutRes.data || []);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCalculate = async () => {
        setCalculating(true);
        try {
            await axios.post('/admin/payroll/calculate', { month: calcMonth, year: calcYear });
            toast.success(`Calculated payouts for ${months.find(m => m.val === calcMonth)?.label} ${calcYear}`);
            fetchAll();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Calculation failed');
        } finally {
            setCalculating(false);
        }
    };

    const handleMarkPaid = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/admin/payroll/${payModal.payoutId}/pay`, { transactionId: payModal.txnId });
            toast.success('Marked as Paid successfully!');
            setPayModal({ show: false, payoutId: null, txnId: '' });
            fetchAll();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return (
        <div className="p-8 flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
        </div>
    );

    // Merge: for each teacher, find their payout for the selected filter month/year
    const rows = teachers.map(teacher => {
        const payout = payouts.find(p =>
            String(p.teacherId?._id || p.teacherId) === String(teacher._id) &&
            p.month === filterMonth &&
            p.year === filterYear
        );
        return { teacher, payout };
    });

    const pendingAmount = payouts.filter(p => p.status === 'Pending').reduce((acc, curr) => acc + curr.totalAmount, 0);
    const paidAmount = payouts.filter(p => p.status === 'Paid').reduce((acc, curr) => acc + curr.totalAmount, 0);

    return (
        <div className="space-y-6 animate-in fade-in p-6 bg-slate-50 min-h-screen">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Teacher Payroll</h1>
                <p className="text-sm font-bold text-slate-500 mt-1">Manage and calculate monthly faculty payouts</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[18px] flex items-center justify-center"><DollarSign className="w-7 h-7" /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Pending</p>
                        <p className="text-2xl font-black text-slate-900">₹{pendingAmount}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-[18px] flex items-center justify-center"><CheckCircle className="w-7 h-7" /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Paid</p>
                        <p className="text-2xl font-black text-slate-900">₹{paidAmount}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Calculate Payouts</p>
                    <div className="flex gap-2">
                        <select value={calcMonth} onChange={e => setCalcMonth(Number(e.target.value))} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-sm font-bold outline-none">
                            {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                        </select>
                        <input type="number" value={calcYear} onChange={e => setCalcYear(Number(e.target.value))} className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-sm font-bold outline-none" />
                        <button onClick={handleCalculate} disabled={calculating} className={`w-12 h-[38px] bg-[#002147] text-white rounded-xl flex items-center justify-center hover:bg-[#f16126] transition-colors ${calculating ? 'opacity-50' : ''}`}>
                            <Calculator className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Row */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4 shadow-sm">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">View Month:</span>
                <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none">
                    {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
                </select>
                <input type="number" value={filterYear} onChange={e => setFilterYear(Number(e.target.value))} className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold outline-none" />
                <span className="text-xs font-bold text-slate-400">{teachers.length} teachers shown</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-[#002147]">Monthly Ledger</h2>
                    <span className="text-xs font-bold text-slate-400">{months.find(m => m.val === filterMonth)?.label} {filterYear}</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 text-[10px] uppercase tracking-widest font-black text-slate-400 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Teacher</th>
                                <th className="px-6 py-4">Rate A / Rate B</th>
                                <th className="px-6 py-4">Sessions (hrs)</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">No teachers found</span>
                                    </td>
                                </tr>
                            ) : rows.map(({ teacher, payout }) => (
                                <tr key={teacher._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-black text-sm">
                                                {teacher.name?.charAt(0) || <User className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900">{teacher.name}</p>
                                                <p className="text-[10px] text-slate-400">{teacher.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-black text-slate-500">6-10: <span className="text-indigo-600">₹{teacher.payRates?.rateA || 0}/class</span></span>
                                            <span className="text-[10px] font-black text-slate-500">11-12: <span className="text-orange-600">₹{teacher.payRates?.rateB || 0}/class</span></span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {payout ? (
                                            <span className="font-bold">{payout.totalSessions} sessions ({payout.totalHours} hrs)</span>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 font-bold italic">Not calculated</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-black text-slate-900">
                                        {payout ? `₹${payout.totalAmount}` : '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {payout ? (
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                payout.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {payout.status}
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-400">
                                                No Data
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {payout?.status === 'Pending' ? (
                                            <button
                                                onClick={() => setPayModal({ show: true, payoutId: payout._id, txnId: '' })}
                                                className="px-4 py-2 bg-indigo-50 text-indigo-700 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-600 hover:text-white transition-colors"
                                            >
                                                Mark Paid
                                            </button>
                                        ) : payout?.status === 'Paid' ? (
                                            <span className="text-[10px] font-bold text-slate-400">ID: {payout.transactionId}</span>
                                        ) : (
                                            <span className="text-[10px] text-slate-300 font-bold">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {payModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative">
                        <button onClick={() => setPayModal({ show: false, payoutId: null, txnId: '' })} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900">✕</button>
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">Record Payment</h3>
                        <p className="text-xs font-bold text-slate-500 mb-6">Enter the bank transaction ID to mark this payout as paid.</p>
                        <form onSubmit={handleMarkPaid} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Transaction ID</label>
                                <input
                                    type="text"
                                    required
                                    value={payModal.txnId}
                                    onChange={e => setPayModal(m => ({ ...m, txnId: e.target.value }))}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-600"
                                    placeholder="TXN..."
                                />
                            </div>
                            <button type="submit" className="w-full bg-[#002147] text-white rounded-xl py-3 font-black text-xs uppercase tracking-widest hover:bg-[#f16126] transition-colors">
                                Confirm Payment
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherPayouts;
