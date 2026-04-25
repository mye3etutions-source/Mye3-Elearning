import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserPlus, Calendar, ShieldCheck, MoreVertical, CreditCard, Loader2, Save, X, Clock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubId, setSelectedSubId] = useState('');
  const [newExpiryDate, setNewExpiryDate] = useState('');

  const fetchStudents = async () => {
    try {
      const { data } = await axios.get('/admin/students');
      setStudents(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch students');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleExtend = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/admin/students/${selectedStudent._id}/extend`, {
        subscriptionId: selectedSubId,
        newExpiryDate
      });
      toast.success('Subscription extended successfully!');
      setShowExtendModal(false);
      fetchStudents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to extend');
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 px-2 md:px-0 max-w-6xl mx-auto animate-in fade-in duration-300">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
         <div className="space-y-1">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Student Administration</h1>
            <p className="text-sm font-medium text-slate-500">Monitor enrollments and manage subscription cycles</p>
         </div>
         <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-md font-medium shadow-sm hover:bg-slate-50 transition-colors text-sm w-full sm:w-auto">
               <CreditCard className="w-4 h-4 text-indigo-600" /> Recent Payments
            </button>
            <button className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md font-medium shadow-sm hover:bg-indigo-700 transition-colors text-sm w-full sm:w-auto">
               <UserPlus className="w-4 h-4" /> Grant Access
            </button>
         </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
               <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-sm font-semibold text-slate-600">
                     <th className="px-5 py-3">Student Details</th>
                     <th className="px-5 py-3">Active Subscriptions</th>
                     <th className="px-5 py-3">Recent Status</th>
                     <th className="px-5 py-3 text-right">Access Control</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {students.length === 0 ? (
                    <tr>
                       <td colSpan="4" className="px-5 py-12 text-center text-slate-400">
                          <p className="font-medium text-sm">No students currently enrolled.</p>
                       </td>
                    </tr>
                  ) : students.map(student => (
                    <tr key={student._id} className="hover:bg-slate-50/50 transition-colors group align-top">
                       <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                                {student.name.charAt(0)}
                             </div>
                             <div>
                                <p className="font-semibold text-base text-slate-800 leading-tight">{student.name}</p>
                                <p className="text-sm text-slate-500 mt-0.5">{student.email}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-5 py-4">
                          <div className="space-y-2 max-w-sm">
                             {student.activeSubscriptions?.length > 0 ? student.activeSubscriptions.map((sub, i) => (
                               <div key={i} className="flex flex-col gap-1.5 p-2.5 bg-slate-50 rounded-md border border-slate-200 shadow-sm">
                                  <div className="flex items-center justify-between gap-4">
                                     <span className="text-xs font-semibold uppercase text-indigo-700 tracking-wide">{sub.type} Access</span>
                                     <button 
                                       onClick={() => {
                                         setSelectedStudent(student);
                                         setSelectedSubId(sub._id);
                                         setNewExpiryDate(new Date(sub.expiryDate).toISOString().split('T')[0]);
                                         setShowExtendModal(true);
                                       }}
                                       className="text-xs font-medium bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-sm"
                                     >
                                       Extend
                                     </button>
                                  </div>
                                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100 w-full text-slate-600">
                                     <Clock className="w-3.5 h-3.5" />
                                     <span className="text-sm font-medium">Expires: {new Date(sub.expiryDate).toLocaleDateString()}</span>
                                  </div>
                               </div>
                             )) : (
                               <span className="text-sm text-slate-400 italic">No active subscriptions</span>
                             )}
                          </div>
                       </td>
                       <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide border ${
                            student.activeSubscriptions?.length > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}>
                             {student.activeSubscriptions?.length > 0 ? 'Active' : 'Inactive'}
                          </span>
                       </td>
                       <td className="px-5 py-4 text-right">
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-md text-sm font-medium hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100">
                             <X className="w-4 h-4" /> Revoke
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* EXTEND MODAL */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                 <h2 className="text-base font-bold text-slate-800">Extend Access</h2>
                 <button onClick={() => setShowExtendModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-5 h-5" /></button>
              </div>
              
              <form onSubmit={handleExtend} className="p-4 space-y-5">
                 <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg space-y-1">
                    <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Selected Student</p>
                    <p className="text-sm font-bold text-indigo-900">{selectedStudent?.name}</p>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5 ml-1">
                       <Calendar className="w-4 h-4 text-slate-400" /> New Expiry Date
                    </label>
                    <input 
                       required
                       type="date"
                       value={newExpiryDate}
                       onChange={(e) => setNewExpiryDate(e.target.value)}
                       className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-md outline-none font-medium text-sm text-slate-800 shadow-sm transition-colors"
                    />
                 </div>

                 <div className="pt-2">
                    <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-md font-medium text-sm shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                       <Save className="w-4 h-4" /> Confirm Extension
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
