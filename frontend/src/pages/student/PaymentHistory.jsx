import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Search, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Loader2,
  AlertCircle,
  X,
  Receipt,
  Calendar,
  Hash,
  IndianRupee,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const PaymentHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { data } = await axios.get('/student/transactions');
        setTransactions(data || []);
      } catch (err) {
        toast.error('Failed to fetch transaction history');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(t => 
    t.packageName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="space-y-8 p-6 md:p-10 animate-pulse">
       <div className="h-32 bg-slate-100 rounded-[40px]" />
       <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 rounded-3xl" />)}
       </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 p-4 md:p-6 lg:p-10 bg-[#f8fbff]/50 min-h-screen">
      <Toaster position="top-right" />

      {/* COMPACT PREMIUM HEADER */}
      <div className="bg-[#002147] p-8 md:p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#f16126] rounded-full -mr-32 -mt-32 blur-[80px] opacity-10" />
         <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-4 text-center lg:text-left">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/5 backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 text-[#f16126]" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-100">Financial Ledger</span>
               </div>
               <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                  BILLING <span className="text-[#f16126] not-italic">HISTORY</span>
               </h1>
               <p className="text-indigo-200/60 font-bold italic text-xs md:text-sm uppercase tracking-widest leading-none">
                  Manage your enrollments and transaction records.
               </p>
            </div>
            
            <div className="relative w-full lg:w-96 group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#f16126] transition-colors" />
               <input
                  type="text"
                  placeholder="SEARCH TRANSACTIONS..."
                  className="w-full pl-14 pr-8 py-5 bg-white text-[#002147] rounded-3xl border-2 border-transparent focus:border-[#f16126] focus:outline-none text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-black/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="py-32 text-center space-y-6">
           <div className="w-20 h-20 bg-white border border-slate-100 text-slate-200 rounded-[30px] flex items-center justify-center mx-auto shadow-sm">
              <CreditCard className="w-10 h-10" />
           </div>
           <h3 className="text-xl font-black text-[#002147] uppercase italic tracking-tighter">No Payment Records Found</h3>
        </div>
      ) : (
        <div className="space-y-4">
           {filteredTransactions.map((t, i) => (
             <motion.div
               key={t._id}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: i * 0.05 }}
               onClick={() => setSelectedTx(t)}
               className="bg-white p-6 md:p-8 rounded-[36px] border border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group"
             >
                <div className="flex items-center gap-6 w-full md:w-auto">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                      t.status === 'success' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'
                   }`}>
                      <Receipt className="w-6 h-6" />
                   </div>
                   <div className="min-w-0">
                      <p className="text-[9px] font-black text-[#f16126] uppercase tracking-[0.2em] italic mb-1">{new Date(t.date || t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      <h4 className="text-lg md:text-xl font-black text-[#002147] uppercase italic tracking-tighter group-hover:text-indigo-600 transition-colors truncate max-w-[200px] md:max-w-md">{t.packageName}</h4>
                   </div>
                </div>

                <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end">
                   <div className="text-left md:text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                      <span className={`text-[10px] font-black uppercase italic ${t.status === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {t.status === 'success' ? 'SUCCESS' : 'FAILED'}
                      </span>
                   </div>
                   <div className="text-left md:text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Amount</p>
                      <p className="text-xl font-black text-[#002147] italic">₹{t.amount?.toLocaleString()}</p>
                   </div>
                   <div className="hidden md:flex w-12 h-12 bg-slate-50 rounded-2xl items-center justify-center text-slate-300 group-hover:bg-[#002147] group-hover:text-white transition-all">
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      )}

      {/* SUPPORT PANEL */}
      <div className="p-8 md:p-12 bg-[#002147] rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden text-white border-b-8 border-indigo-600/20">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#f16126] rounded-full -mr-32 -mt-32 opacity-10" />
         <div className="flex items-center gap-8 relative z-10 flex-col md:flex-row text-center md:text-left">
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-[#f16126] shadow-xl">
               <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
               <h4 className="text-2xl font-black italic uppercase tracking-tighter">Payment Issues?</h4>
               <p className="text-indigo-200/60 font-bold italic text-xs md:text-sm uppercase tracking-widest">If access was not granted after successful payment.</p>
            </div>
         </div>
         <button className="w-full md:w-auto px-12 py-5 bg-[#f16126] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-white hover:text-[#002147] transition-all active:scale-95 relative z-10">Raise Support Ticket</button>
      </div>

      {/* DETAIL MODAL (CLEANER) */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4 backdrop-blur-3xl bg-[#002147]/70" onClick={() => setSelectedTx(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-[48px] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#002147] p-10 text-white relative border-b-8 border-[#f16126]">
                <button onClick={() => setSelectedTx(null)} className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-[#f16126] transition-all"><X className="w-6 h-6" /></button>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 text-indigo-300">Transaction Details</p>
                <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter truncate">{selectedTx.packageName}</h3>
              </div>
              <div className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 rounded-[32px] space-y-1">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reference ID</p>
                       <p className="text-[11px] font-black text-[#002147] truncate uppercase tracking-tighter italic">#{selectedTx._id?.slice(-8)}</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[32px] space-y-1">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Amount Paid</p>
                       <p className="text-xl font-black text-emerald-600 italic">₹{selectedTx.amount?.toLocaleString()}</p>
                    </div>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-[32px] flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#002147] text-white rounded-xl flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
                    <div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verified Payment</p>
                       <p className="text-xs font-black text-[#002147] italic uppercase">Secured Gateway Alpha</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => toast.success('Syncing with billing system...')}
                  className="w-full bg-[#002147] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-[#f16126] transition-all shadow-xl active:scale-95"
                 >
                   DOWNLOAD RECEIPT <Download className="w-5 h-5" />
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentHistory;
