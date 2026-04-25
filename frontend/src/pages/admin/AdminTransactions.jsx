import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  Clock,
  Loader2,
  User,
  X,
  Receipt,
  Calendar,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Hash
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Modern dense look

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get('/admin/transactions');
        setTransactions(res.data);
      } catch (err) {
        toast.error('Failed to load platform transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(t => 
    t.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.studentId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 px-2 md:px-0 max-w-6xl mx-auto pb-10">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
         <div className="space-y-0.5">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Fee Payments</h1>
            <p className="text-sm font-medium text-slate-500">Monitor all course purchases and subscription records.</p>
         </div>
         
         <div className="relative group w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by student or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-md w-full sm:w-64 outline-none font-medium text-slate-700 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm text-sm"
            />
         </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
           <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="py-12 bg-white border border-slate-200 rounded-lg text-center space-y-3 shadow-sm">
           <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6 text-slate-300" />
           </div>
           <div className="space-y-1">
              <p className="text-slate-500 font-medium text-sm">No payment records match your search</p>
           </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left whitespace-nowrap min-w-[700px]">
                 <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr className="text-sm font-semibold text-slate-600">
                       <th className="px-5 py-3">Student Info</th>
                       <th className="px-5 py-3">Course Detail</th>
                       <th className="px-5 py-3">Amount Paid</th>
                       <th className="px-5 py-3">Date</th>
                       <th className="px-5 py-3 text-center">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {currentItems.map((t, i) => (
                      <motion.tr 
                        key={t._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedTx(t)}
                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer align-middle"
                      >
                         <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors shrink-0">
                                  <User className="w-4 h-4" />
                               </div>
                               <div>
                                  <p className="font-semibold text-slate-800 leading-tight text-sm">{t.studentId?.name || 'Manual Grant'}</p>
                                  <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[150px]">{t.studentId?.email}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-5 py-4">
                            <div className="flex flex-col gap-1">
                               <p className="font-semibold text-slate-800 text-sm">{t.packageName}</p>
                               <span className="text-[10px] font-semibold text-slate-500 uppercase px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded self-start">
                                  {t.type}
                               </span>
                            </div>
                         </td>
                         <td className="px-5 py-4">
                            <span className="text-sm font-semibold text-slate-800">₹{t.amount.toLocaleString('en-IN')}</span>
                         </td>
                         <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-slate-500">
                               <Clock className="w-3.5 h-3.5 text-slate-400" />
                               <span className="font-medium text-sm">{new Date(t.date || t.createdAt).toLocaleDateString('en-GB')}</span>
                            </div>
                         </td>
                         <td className="px-5 py-4 text-center">
                            {t.status === 'success' ? (
                               <span className="inline-flex items-center justify-center px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold border border-emerald-200">
                                  Verified
                               </span>
                            ) : (
                               <span className="inline-flex items-center justify-center px-2 py-0.5 bg-rose-50 text-rose-700 rounded text-xs font-semibold border border-rose-200">
                                  {t.status}
                               </span>
                            )}
                         </td>
                      </motion.tr>
                    ))}
                 </tbody>
              </table>
           </div>           {/* PAGINATION CONTROLS */}
           {totalPages > 1 && (
             <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between gap-4">
               <p className="text-xs text-slate-500">
                  Showing <span className="font-medium text-slate-800">{indexOfFirstItem + 1}</span> to <span className="font-medium text-slate-800">{Math.min(indexOfLastItem, filteredTransactions.length)}</span> of <span className="font-medium text-slate-800">{filteredTransactions.length}</span>
               </p>
               
               <div className="flex items-center gap-1">
                 <button
                   onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                   disabled={currentPage === 1}
                   className="p-1 rounded text-slate-400 hover:bg-white hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                 >
                   <ChevronLeft className="w-4 h-4" />
                 </button>

                 <div className="flex items-center gap-0.5">
                   {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
                      if (totalPages > 5 && Math.abs(pg - currentPage) > 1 && pg !== 1 && pg !== totalPages) return pg === 2 || pg === totalPages - 1 ? <span key={pg} className="text-slate-300 mx-1 text-xs">...</span> : null;
                      return (
                        <button
                          key={pg}
                          onClick={() => setCurrentPage(pg)}
                          className={`w-6 h-6 rounded text-xs font-medium transition-colors ${currentPage === pg ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'}`}
                        >
                          {pg}
                        </button>
                      );
                   })}
                 </div>

                 <button
                   onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                   disabled={currentPage === totalPages}
                   className="p-1 rounded text-slate-400 hover:bg-white hover:text-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                 >
                   <ChevronRight className="w-4 h-4" />
                 </button>
               </div>
             </div>
           )}
        </div>
      )}

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedTx && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTx(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-0 m-auto w-full max-w-lg h-fit bg-white rounded-xl shadow-xl z-[101] overflow-hidden flex flex-col"
            >
               <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-md flex items-center justify-center shrink-0">
                        <Receipt className="w-5 h-5" />
                     </div>
                     <div>
                        <h2 className="text-base font-bold text-slate-800">{selectedTx.packageName}</h2>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Payment Verification</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedTx(null)} className="text-slate-400 hover:text-slate-800 transition-colors">
                     <X className="w-5 h-5" />
                  </button>
               </div>

               <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><User className="w-3 h-3"/> Student</p>
                        <p className="text-sm font-semibold text-slate-800">{selectedTx.studentId?.name || 'Manual Access'}</p>
                     </div>
                     <div className="space-y-1 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-3 h-3"/> Date & Time</p>
                        <p className="text-sm font-semibold text-slate-800">{new Date(selectedTx.date || selectedTx.createdAt).toLocaleString('en-GB')}</p>
                     </div>
                     <div className="col-span-2 space-y-1 p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><Hash className="w-3 h-3"/> Transaction ID</p>
                        <p className="text-sm font-mono text-slate-800 truncate">{selectedTx._id}</p>
                     </div>
                     <div className="col-span-2 space-y-1 p-4 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between">
                        <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5"><IndianRupee className="w-3 h-3"/> Amount Transacted</p>
                        <p className="text-xl font-bold text-emerald-700">₹{selectedTx.amount.toLocaleString('en-IN')}</p>
                     </div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-3">
                     <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                     <p className="text-xs font-medium text-slate-600">This payment record is verified and synchronized with platform logic.</p>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTransactions;
