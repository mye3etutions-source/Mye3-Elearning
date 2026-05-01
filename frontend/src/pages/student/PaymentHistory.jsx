import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Search, 
  Download, 
  Receipt,
  AlertCircle,
  X,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';

const PaymentHistory = () => {
  const { userInfo } = useSelector((state) => state.auth);
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
    <div className="space-y-6 p-6 md:p-8 animate-pulse bg-slate-50 min-h-screen">
       <div className="h-24 bg-slate-200 rounded-2xl" />
       <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-200 rounded-xl" />)}
       </div>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 pb-20 p-4 md:p-6 lg:px-8 bg-slate-50 min-h-screen">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 mx-auto md:mx-0">
               <Receipt className="w-6 h-6" />
            </div>
            <div>
               <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                  Payment History
               </h1>
               <p className="text-sm text-slate-500 mt-1">
                  Manage your transaction records.
               </p>
            </div>
         </div>
         
         <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
               type="text"
               placeholder="Search transactions..."
               className="w-full pl-9 pr-4 py-2.5 bg-slate-100 rounded-lg border border-transparent focus:border-indigo-300 focus:bg-white focus:outline-none text-sm transition-colors"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm space-y-4">
           <CreditCard className="w-12 h-12 text-slate-300 mx-auto" />
           <h3 className="text-lg font-bold text-slate-700">No Payment Records Found</h3>
           <p className="text-sm text-slate-500">You haven't made any transactions yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-5">Package Details</div>
              <div className="col-span-3 text-center">Status</div>
              <div className="col-span-3 text-right">Amount</div>
              <div className="col-span-1"></div>
           </div>
           
           <div className="divide-y divide-slate-100">
             {filteredTransactions.map((t, i) => (
               <motion.div
                 key={t._id}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: i * 0.05 }}
                 onClick={() => setSelectedTx(t)}
                 className="flex flex-col md:grid md:grid-cols-12 items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
               >
                  <div className="col-span-5 flex items-center gap-4 w-full">
                     <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                        t.status === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                     }`}>
                        <Receipt className="w-5 h-5" />
                     </div>
                     <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{t.packageName}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{new Date(t.date || t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                     </div>
                  </div>

                  <div className="col-span-3 w-full md:w-auto flex justify-between md:justify-center items-center">
                     <span className="md:hidden text-xs text-slate-500 font-medium">Status</span>
                     <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${t.status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                        {t.status === 'success' ? 'SUCCESS' : 'FAILED'}
                     </span>
                  </div>
                  
                  <div className="col-span-3 w-full md:w-auto flex justify-between md:justify-end items-center text-right">
                     <span className="md:hidden text-xs text-slate-500 font-medium">Amount</span>
                     <p className="text-base font-bold text-slate-800">₹{t.amount?.toLocaleString()}</p>
                  </div>
                  
                  <div className="col-span-1 hidden md:flex justify-end">
                     <div className="p-2 text-slate-400 group-hover:text-indigo-600 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                     </div>
                  </div>
               </motion.div>
             ))}
           </div>
        </div>
      )}

      {/* SUPPORT PANEL */}
      <div className="p-6 md:p-8 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
               <AlertCircle className="w-6 h-6" />
            </div>
            <div>
               <h4 className="text-lg font-bold text-slate-800">Payment Issues?</h4>
               <p className="text-sm text-slate-600 mt-1">If access was not granted after a successful payment, let us know.</p>
            </div>
         </div>
         <button 
           onClick={async () => {
             const msg = `Hi Mye3 Support, I have a payment issue. Name: ${userInfo?.name}, Email: ${userInfo?.email}`;
             
             // Also send to admin dashboard
             try {
               await axios.post('/inquiries', {
                 name: userInfo?.name,
                 email: userInfo?.email,
                 mobile: userInfo?.mobile || '9912671666',
                 message: 'PAYMENT ISSUE: Student is requesting support regarding course access/payment.',
                 source: 'Payment Support',
                 role: 'Student'
               });
               toast.success('Support request recorded');
             } catch (err) {
               console.error("Failed to record inquiry");
             }

             window.open(`https://wa.me/919912671666?text=${encodeURIComponent(msg)}`, '_blank');
           }}
           className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors shadow-sm"
         >
            Raise Support Ticket
         </button>
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedTx(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-semibold mb-2">
                     Transaction Details
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 leading-tight pr-4">{selectedTx.packageName}</h3>
                </div>
                <button onClick={() => setSelectedTx(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                       <p className="text-xs font-semibold text-slate-500">Reference ID</p>
                       <p className="text-sm font-bold text-slate-800 truncate">#{selectedTx._id?.slice(-8)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                       <p className="text-xs font-semibold text-slate-500">Amount Paid</p>
                       <p className="text-lg font-bold text-emerald-600">₹{selectedTx.amount?.toLocaleString()}</p>
                    </div>
                 </div>
                 
                 <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                       <p className="text-xs font-semibold text-emerald-800">Verified Payment</p>
                       <p className="text-[10px] text-emerald-600 mt-0.5">Processed securely.</p>
                    </div>
                 </div>
                 
                 <button 
                  onClick={() => toast.success('Syncing with billing system...')}
                  className="w-full py-3 bg-slate-900 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors shadow-sm"
                 >
                   Download Receipt <Download className="w-4 h-4" />
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
