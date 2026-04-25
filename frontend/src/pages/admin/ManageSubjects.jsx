import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Save, IndianRupee, Loader2, BookOpen, User, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    classLevel: '11',
    board: 'TS Board',
    pricing: { oneMonth: 0, threeMonths: 0, sixMonths: 0, twelveMonths: 0 },
    teacherName: ''
  });

  const fetchSubjects = async () => {
    try {
      const { data } = await axios.get('/subjects');
      setSubjects(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load subjects');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/subjects/${editingId}`, formData);
        toast.success(`${formData.name} updated successfully!`);
      } else {
        await axios.post('/subjects', formData);
        toast.success(`${formData.name} added to Class ${formData.classLevel}!`);
      }
      resetForm();
      fetchSubjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      try {
        await axios.delete(`/subjects/${id}`);
        toast.success(`${name} deleted`);
        fetchSubjects();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const openEditModal = (sub) => {
    setEditingId(sub._id);
    setFormData({
      name: sub.name,
      classLevel: sub.classLevel.toString(),
      board: sub.board || 'TS Board',
      pricing: sub.pricing || { oneMonth: 0, threeMonths: 0, sixMonths: 0, twelveMonths: 0 },
      teacherName: sub.teacherName === 'Not Assigned' ? '' : sub.teacherName
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', classLevel: '11', board: 'TS Board', pricing: { oneMonth: 0, threeMonths: 0, sixMonths: 0, twelveMonths: 0 }, teacherName: '' });
    setEditingId(null);
    setIsModalOpen(false);
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Subject Management</h1>
            <p className="text-slate-500 font-bold flex items-center gap-2">
               Inter 1st & 2nd Year Specialized Individual Subscriptions
            </p>
         </div>
         <button 
           onClick={() => setIsModalOpen(true)}
           className="flex items-center justify-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-[24px] font-black shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all"
         >
            <Plus className="w-6 h-6" /> Add New Subject
         </button>
      </div>

      {/* Main Content Area */}
      {subjects.length === 0 ? (
        <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-100 p-20 flex flex-col items-center justify-center text-center space-y-6">
           <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
              <BookOpen className="w-12 h-12" />
           </div>
           <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800">No subjects found</h3>
              <p className="text-slate-400 font-bold max-w-xs mx-auto">Start by adding your first specialized subject for Class 11 or 12.</p>
           </div>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="text-indigo-600 font-black hover:underline"
           >
              Create Subject Now
           </button>
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                 <tr className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">
                    <th className="px-8 py-7">Subject Info</th>
                    <th className="px-8 py-7">Year & Board</th>
                    <th className="px-8 py-7">Tiered Pricing (₹)</th>
                    <th className="px-8 py-7">Assigned Teacher</th>
                    <th className="px-8 py-7 text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {subjects.map(sub => (
                   <tr key={sub._id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-7">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                               {sub.name.charAt(0)}
                            </div>
                            <span className="font-black text-slate-900 text-lg">{sub.name}</span>
                         </div>
                      </td>
                      <td className="px-8 py-7">
                         <div className="space-y-1">
                            <span className={`px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${Number(sub.classLevel) === 11 ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                               {Number(sub.classLevel) === 11 ? 'Inter 1st Year' : 'Inter 2nd Year'}
                            </span>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-1 px-1">{sub.board || 'TS Board'}</p>
                         </div>
                      </td>
                      <td className="px-8 py-7">
                         <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-[10px] font-bold text-slate-500 w-32 uppercase tracking-tighter">
                            <div className="flex justify-between"><span>1m:</span> <b className="text-slate-900">₹{sub.pricing?.oneMonth || 0}</b></div>
                            <div className="flex justify-between"><span>3m:</span> <b className="text-slate-900">₹{sub.pricing?.threeMonths || 0}</b></div>
                            <div className="flex justify-between"><span>6m:</span> <b className="text-slate-900">₹{sub.pricing?.sixMonths || 0}</b></div>
                            <div className="flex justify-between"><span>12m:</span> <b className="text-slate-900">₹{sub.pricing?.twelveMonths || 0}</b></div>
                         </div>
                      </td>
                      <td className="px-8 py-7">
                         <div className="flex items-center gap-3">
                            <User className="w-4 h-4 text-slate-300" />
                            <span className={`text-xs font-bold ${sub.teacherName === 'Not Assigned' ? 'text-slate-300 italic' : 'text-slate-600'}`}>
                               {sub.teacherName}
                            </span>
                         </div>
                      </td>
                      <td className="px-8 py-7">
                         <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => openEditModal(sub)}
                              className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                            >
                               <Edit2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(sub._id, sub.name)}
                              className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"
                            >
                               <Trash2 className="w-5 h-5" />
                            </button>
                         </div>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
             onClick={resetForm}
           ></div>
           
           {/* Modal Body */}
           <div className="relative bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/20">
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                 <h2 className="text-3xl font-black text-slate-900">{editingId ? 'Update Subject' : 'Add New Subject'}</h2>
                 <button onClick={resetForm} className="p-2 text-slate-300 hover:text-slate-600 transition-all"><X className="w-8 h-8" /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2 underline decoration-indigo-500 decoration-2 underline-offset-4">Subject Name</label>
                    <input 
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Physics"
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-3xl outline-none font-bold text-slate-900 transition-all"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2 underline decoration-indigo-500 decoration-2 underline-offset-4">Academic Year</label>
                       <select 
                         value={formData.classLevel}
                         onChange={(e) => setFormData({...formData, classLevel: e.target.value})}
                         className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-3xl outline-none font-bold text-slate-900 appearance-none cursor-pointer transition-all"
                       >
                          <option value="11">Inter 1st Year (11)</option>
                          <option value="12">Inter 2nd Year (12)</option>
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2 underline decoration-indigo-500 decoration-2 underline-offset-4">Educational Board</label>
                       <select 
                         value={formData.board}
                         onChange={(e) => setFormData({...formData, board: e.target.value})}
                         className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-3xl outline-none font-bold text-slate-900 appearance-none cursor-pointer transition-all"
                       >
                          <option value="TS Board">TS Board</option>
                          <option value="AP Board">AP Board</option>
                          <option value="CBSE">CBSE</option>
                          <option value="ICSE">ICSE</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2 underline decoration-indigo-500 decoration-2 underline-offset-4">Tiered Pricing (₹)</label>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                       <input type="number" placeholder="1 Month" required className="px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-bold" value={formData.pricing.oneMonth} onChange={e => setFormData({...formData, pricing: {...formData.pricing, oneMonth: e.target.value}})} />
                       <input type="number" placeholder="3 Months" required className="px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-bold" value={formData.pricing.threeMonths} onChange={e => setFormData({...formData, pricing: {...formData.pricing, threeMonths: e.target.value}})} />
                       <input type="number" placeholder="6 Months" required className="px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-bold" value={formData.pricing.sixMonths} onChange={e => setFormData({...formData, pricing: {...formData.pricing, sixMonths: e.target.value}})} />
                       <input type="number" placeholder="12 Months" required className="px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-bold" value={formData.pricing.twelveMonths} onChange={e => setFormData({...formData, pricing: {...formData.pricing, twelveMonths: e.target.value}})} />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2 underline decoration-indigo-500 decoration-2 underline-offset-4">Assign Teacher Name (Optional)</label>
                    <input 
                      type="text"
                      value={formData.teacherName}
                      onChange={(e) => setFormData({...formData, teacherName: e.target.value})}
                      placeholder="e.g. Dr. Emily Watson"
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-3xl outline-none font-bold text-slate-900 transition-all"
                    />
                 </div>

                 <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[28px] font-black text-xl shadow-2xl shadow-indigo-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 mt-6">
                    <Save className="w-8 h-8" /> {editingId ? 'Save Changes' : 'Confirm Subject'}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubjects;
