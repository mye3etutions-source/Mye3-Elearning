import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ShieldCheck, GraduationCap, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const GrantAccessModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [grantForm, setGrantForm] = useState({
    type: 'bundle',
    referenceId: '',
    name: '',
    board: '',
    durationDays: 30
  });

  useEffect(() => {
    if (isOpen && student) {
      if (student.isOneOnOne && student.oneOnOneCategory && student.oneOnOneCategory._id) {
        setGrantForm({
          type: 'oneonone',
          referenceId: student.oneOnOneCategory._id,
          name: student.oneOnOneCategory.name,
          board: '1-on-1',
          durationDays: 30
        });
      } else {
        setGrantForm({
          type: student.isOneOnOne ? 'oneonone' : 'bundle',
          referenceId: '',
          name: '',
          board: '',
          durationDays: 30
        });
      }
    }
  }, [isOpen, student]);

  const [bundles, setBundles] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [oneOnOneCategories, setOneOnOneCategories] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [bundleRes, subjectRes, oneOnOneRes] = await Promise.all([
            axios.get('/admin/classes'),
            axios.get('/subjects'),
            axios.get('/admin/1on1-categories')
          ]);
          
          const fetchedBundles = bundleRes.data
            .filter((v, i, a) => a.findIndex(t => t._id === v._id) === i)
            .sort((a, b) => {
              const numA = parseInt(a.className?.replace(/\D/g, '')) || 0;
              const numB = parseInt(b.className?.replace(/\D/g, '')) || 0;
              if (numA !== numB) return numA - numB;
              return (a.board || '').localeCompare(b.board || '');
            });
            
          setBundles(fetchedBundles);
          setSubjects(subjectRes.data
            .filter((v, i, a) => a.findIndex(t => t._id === v._id) === i)
            .sort((a, b) => {
              if (a.classLevel !== b.classLevel) return (a.classLevel || 0) - (b.classLevel || 0);
              return (a.name || '').localeCompare(b.name || '');
            })
          );
          setOneOnOneCategories(oneOnOneRes.data || []);

        } catch (error) {
          toast.error('Failed to load courses');
        }
      };
      fetchData();
    }
  }, [isOpen, student]);

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    if (!grantForm.referenceId) return toast.error('Please select a course');

    try {
      await axios.put(`/admin/students/assign-subscription/${student._id}`, grantForm);
      toast.success(`Access granted for ${grantForm.name}`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to grant access');
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
       <div className="relative bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
             <div className="space-y-0.5">
                <h2 className="text-base font-bold text-slate-800">Grant Course Access</h2>
                <p className="text-xs font-medium text-indigo-600">Activating for: {student.name}</p>
             </div>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <form onSubmit={handleGrantAccess} className="p-4 space-y-6">
             <div className="space-y-5">
                {/* Category Selector */}
                {!student?.isOneOnOne && (
                  <div className="grid grid-cols-3 gap-2">
                     <button 
                       type="button" 
                       onClick={() => setGrantForm({...grantForm, type: 'bundle', referenceId: '', name: ''})}
                       className={`p-2.5 rounded-lg border transition-colors font-medium text-xs md:text-sm ${grantForm.type === 'bundle' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                     >
                        Bundle (Class)
                     </button>
                     <button 
                       type="button" 
                       onClick={() => setGrantForm({...grantForm, type: 'subject', referenceId: '', name: ''})}
                       className={`p-2.5 rounded-lg border transition-colors font-medium text-xs md:text-sm ${grantForm.type === 'subject' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                     >
                        11-12 Subject
                     </button>
                     <button 
                       type="button" 
                       onClick={() => setGrantForm({...grantForm, type: 'oneonone', referenceId: '', name: ''})}
                       className={`p-2.5 rounded-lg border transition-colors font-medium text-xs md:text-sm ${grantForm.type === 'oneonone' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                     >
                        1-on-1 Category
                     </button>
                  </div>
                )}

                {/* Course Selector */}
                <div className="space-y-1">
                   <label className="text-xs font-medium text-slate-600 ml-1 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" /> Select Course
                   </label>
                   <select 
                     required
                     value={grantForm.referenceId}
                     onChange={(e) => {
                       const val = e.target.value;
                       let item;
                       if (grantForm.type === 'bundle') {
                         item = bundles.find(b => b._id === val);
                         setGrantForm({...grantForm, referenceId: val, board: item?.board || '', name: item?.className || ''});
                       } else if (grantForm.type === 'subject') {
                         item = subjects.find(s => s._id === val);
                         setGrantForm({...grantForm, referenceId: val, board: item?.board || '', name: item ? `Class ${item.classLevel} - ${item.name}` : ''});
                       } else if (grantForm.type === 'oneonone') {
                         item = oneOnOneCategories.find(c => c._id === val);
                         setGrantForm({...grantForm, referenceId: val, board: '1-on-1', name: item?.name || ''});
                       }
                     }}
                     className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 rounded-md outline-none font-medium text-sm text-slate-800 shadow-sm"
                   >
                      <option value="">Choose item...</option>
                      {grantForm.type === 'bundle' && bundles.map(b => (
                        <option key={b._id} value={b._id}>{b.className} {b.board ? `(${b.board})` : ''}</option>
                      ))}
                      {grantForm.type === 'subject' && subjects.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.name} - {parseInt(s.classLevel) === 11 ? 'Inter 1st Year' : parseInt(s.classLevel) === 12 ? 'Inter 2nd Year' : `Class ${s.classLevel}`} {s.board ? `(${s.board})` : ''}
                        </option>
                      ))}
                      {grantForm.type === 'oneonone' && oneOnOneCategories.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                   </select>
                </div>

                {/* Duration Slider/Input */}
                <div className="space-y-3">
                   <div className="flex items-center justify-between px-1">
                      <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                         <Calendar className="w-3.5 h-3.5" /> Duration (Days)
                      </label>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded text-xs font-semibold">{grantForm.durationDays} Days</span>
                   </div>
                   <input 
                     type="range" 
                     min="1" 
                     max="365" 
                     value={grantForm.durationDays}
                     onChange={(e) => setGrantForm({...grantForm, durationDays: e.target.value})}
                     className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                   />
                </div>
             </div>

             <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-md flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                   </div>
                   <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Calculated Expiry</p>
                      <p className="font-semibold text-slate-800 text-sm">
                        {new Date(Date.now() + grantForm.durationDays * 86400000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                   </div>
                </div>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                   Activate
                </button>
             </div>
          </form>
       </div>
    </div>
  );
};

export default GrantAccessModal;
