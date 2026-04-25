import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Settings, 
  Loader2, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  X,
  Plus,
  Trash2,
  Globe,
  IndianRupee,
  LayoutGrid,
  ShieldCheck,
  Zap
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const BOARDS = ['AP Board', 'TS Board', 'CBSE', 'ICSE'];

const PricingManagement = () => {
  const [juniorClasses, setJuniorClasses] = useState([]);
  const [seniorSubjects, setSeniorSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  
  const [activeBoard, setActiveBoard] = useState('AP Board');
  
  // Local state for pricing edits before syncing
  const [editPricing, setEditPricing] = useState({});

  const fetchData = async () => {
    try {
      const [resClasses, resSubjects] = await Promise.all([
        axios.get('/admin/classes'),
        axios.get('/admin/subjects')
      ]);
      setJuniorClasses(resClasses.data);
      setSeniorSubjects(resSubjects.data);
      
      // Initialize edit state keyed by class _id
      const initialPricing = {};
      resClasses.data.forEach(c => {
         initialPricing[c._id] = { ...c.pricing };
      });
      setEditPricing(initialPricing);
      setLoading(false);
    } catch (error) {
      toast.error('Data error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdatePriceBoard = async (classId, isJunior = true, customPayload = null) => {
    const loadingToast = toast.loading(`Saving pricing for ${activeBoard}...`);
    try {
      if (isJunior) {
         const rawPricing = editPricing[classId];
         // Convert empty strings or non-numbers to 0 before saving
         const pricing = {
            oneMonth: Number(rawPricing?.oneMonth) || 0,
            threeMonths: Number(rawPricing?.threeMonths) || 0,
            sixMonths: Number(rawPricing?.sixMonths) || 0,
            twelveMonths: Number(rawPricing?.twelveMonths) || 0,
         };
         const payload = customPayload || { pricing, board: activeBoard };
         await axios.put(`/admin/classes/${classId}`, payload);
      }
      toast.success('Saved successfully!', { id: loadingToast });
      fetchData();
    } catch (error) { 
      const msg = error.response?.data?.message || 'Save failed';
      toast.error(msg, { id: loadingToast }); 
    }
  };

  const handleUpdateSubjectPriceBoard = async (subjectId, pricing) => {
     const loadingToast = toast.loading(`Saving subject for ${activeBoard}...`);
     try {
        await axios.put(`/admin/subjects/${subjectId}`, { pricing });
        toast.success('Subject saved!', { id: loadingToast });
        fetchData();
     } catch (e) { 
        const msg = e.response?.data?.message || 'Save failed';
        toast.error(msg, { id: loadingToast }); 
     }
  };

  const handleDeleteSubjectBoard = async (subjectId) => {
     if(!window.confirm(`Are you sure you want to delete this subject for ${activeBoard}?`)) return;
     const loadingToast = toast.loading('Deleting...');
     try {
        await axios.delete(`/admin/subjects/${subjectId}`);
        toast.success('Subject deleted', { id: loadingToast });
        fetchData();
     } catch (e) { 
        const msg = e.response?.data?.message || 'Failed to delete';
        toast.error(msg, { id: loadingToast }); 
     }
  };

  const handleInitializeBoard = async () => {
    const loadingToast = toast.loading(`Initializing ${activeBoard} classes and subjects...`);
    try {
      // 1. Initialize Junior Classes (6-10)
      const classNames = ['Class 6','Class 7','Class 8','Class 9','Class 10'];
      const juniorPromises = classNames.map(className =>
        axios.post('/admin/classes', {
          className,
          board: activeBoard,
          pricing: { oneMonth: 0, threeMonths: 0, sixMonths: 0, twelveMonths: 0 },
          subjects: []
        })
      );

      // 2. Initialize Senior Subjects (11 & 12)
      const commonSubjects = ['Maths', 'Physics', 'Chemistry', 'Biology', 'Commerce', 'Accounts', 'Economics'];
      const seniorPromises = [];
      [11, 12].forEach(level => {
        commonSubjects.forEach(name => {
          seniorPromises.push(
            axios.post('/admin/subjects', {
              name,
              classLevel: level,
              board: activeBoard,
              pricing: { oneMonth: 0, threeMonths: 0, sixMonths: 0, twelveMonths: 0 }
            })
          );
        });
      });

      await Promise.all([...juniorPromises, ...seniorPromises]);
      
      toast.success(`${activeBoard} fully initialized!`, { id: loadingToast });
      fetchData();
    } catch (e) {
      toast.error('Initialization failed: ' + (e.response?.data?.message || e.message), { id: loadingToast });
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
       <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  const currentJuniorClasses = juniorClasses.filter(c => c.board === activeBoard);
  const currentSeniorSubjects = seniorSubjects.filter(c => c.board === activeBoard);

  const uniqueJuniorNames = [...new Set(currentJuniorClasses.map(c => c.className))].sort((a,b) => {
     return (parseInt(a.replace(/\D/g, ''))||0) - (parseInt(b.replace(/\D/g, ''))||0);
  });

  return (
    <div className="min-h-screen bg-slate-50/50 px-2 py-2 md:px-4 md:py-4 space-y-4 max-w-5xl mx-auto font-sans animate-in fade-in duration-300 text-sm">
      <Toaster position="top-right" />
      
      {/* PROFESSIONAL HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3 px-4 rounded-lg shadow-sm border border-slate-200">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow shadow-indigo-200">
               <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
               <h1 className="text-lg font-bold text-slate-800 leading-none">Fees Center</h1>
               <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> Independent Board Pricing
               </p>
            </div>
         </div>

         {/* BOARD TABS */}
         <div className="flex p-1 bg-slate-100 rounded-lg shadow-inner">
            {BOARDS.map(board => (
               <button
                  key={board}
                  onClick={() => setActiveBoard(board)}
                  className={`px-3 md:px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                     activeBoard === board 
                     ? 'bg-white text-indigo-700 shadow-sm' 
                     : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                  }`}
               >
                  {board === 'AP Board' ? 'AP' : board === 'TS Board' ? 'TS' : board}
               </button>
            ))}
         </div>

         <div className="flex items-center gap-3">
            <div className="bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 flex flex-col items-end hidden md:flex">
               <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">Classes Loaded</span>
               <span className="text-sm font-bold text-slate-800">{uniqueJuniorNames.length + 2} Grades</span>
            </div>
         </div>
      </div>

      {/* JUNIOR CLASSES SECTION */}
      <div className="space-y-2">
         <div className="flex items-center gap-2 px-1">
            <LayoutGrid className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">Junior Grades (6th - 10th)</h2>
         </div>

         {uniqueJuniorNames.length === 0 && currentSeniorSubjects.length === 0 && (
           <div className="bg-white border border-dashed border-indigo-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-center">
             <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
               <LayoutGrid className="w-6 h-6 text-indigo-400" />
             </div>
             <div>
               <h3 className="font-bold text-slate-700 text-sm">{activeBoard} has no classes</h3>
               <p className="text-slate-400 text-xs mt-1">Initialize Class 6 to 10 for this board</p>
             </div>
             <button
               onClick={handleInitializeBoard}
               className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
             >
               <Plus className="w-3.5 h-3.5" /> Initialize {activeBoard} Classes
             </button>
           </div>
         )}
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
            {uniqueJuniorNames.map((name) => {
              const grade = currentJuniorClasses.find(c => c.className === name);
              if (!grade) return null;
              const classId = grade._id;
              const isExpanded = expandedId === name;
              
              return (
                <div key={name} className={`bg-white rounded-lg border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors group overflow-hidden ${isExpanded ? 'ring-1 ring-indigo-100' : ''}`}>
                   <div className="p-3">
                      {/* CARD HEADER */}
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                               {parseInt(name.replace(/\D/g, ''))||'J'}
                            </div>
                            <div className="flex flex-col">
                               <h3 className="text-sm font-bold text-slate-800 leading-tight">{name}</h3>
                               <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">Master Bundle</span>
                            </div>
                         </div>
                         <button onClick={() => setExpandedId(isExpanded ? null : name)} className={`p-1.5 rounded-md transition-colors ${isExpanded ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                         </button>
                      </div>
                   </div>

                   {/* PRICING AND SUBJECT DRAWER */}
                   <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-slate-50 border-t border-slate-100 overflow-hidden">
                           <div className="p-3 space-y-3">
                              {/* 2X2 PRICING GRID */}
                              <div className="grid grid-cols-2 gap-2">
                                 {[
                                    { k: 'oneMonth', l: 'Monthly' },
                                    { k: 'threeMonths', l: 'Quarterly' },
                                    { k: 'sixMonths', l: 'Half-Yearly' },
                                    { k: 'twelveMonths', l: 'Annually' }
                                 ].map(t => (
                                    <div key={t.k} className="bg-white p-2 rounded-md border border-slate-200 hover:border-indigo-300 transition-colors shadow-sm">
                                       <div className="text-[9px] font-medium text-slate-500 uppercase tracking-wide mb-1 px-1">{t.l}</div>
                                       <div className="relative">
                                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-xs">₹</span>
                                          <input 
                                             type="number"
                                             value={editPricing[classId]?.[t.k] ?? ''}
                                             onFocus={(e) => { if(e.target.value === '0') e.target.value = ''; }}
                                             onChange={(e) => setEditPricing({ ...editPricing, [classId]: { ...editPricing[classId], [t.k]: e.target.value } })}
                                             className="w-full bg-slate-50 border border-slate-200 rounded pl-5 pr-2 py-1 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500/30"
                                          />
                                       </div>
                                    </div>
                                 ))}
                              </div>

                              {/* SAVE SYNC BUTTON */}
                              <button 
                                 onClick={() => handleUpdatePriceBoard(classId)}
                                 className="w-full py-2 bg-slate-800 text-white rounded-md font-medium text-xs shadow-sm hover:bg-indigo-600 transition-colors flex items-center justify-center gap-1.5"
                              >
                                 <CheckCircle2 className="w-3.5 h-3.5" /> Save Pricing
                              </button>

                              {/* SUBJECTS LIST */}
                              <div className="pt-2 border-t border-slate-200">
                                 <h4 className="text-[9px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2 px-1">
                                    <BookOpen className="w-3 h-3 text-indigo-500" /> Subjects
                                 </h4>
                                 <div className="flex flex-wrap gap-1.5">
                                    {(grade.subjects || []).map((sub, idx) => (
                                      <div key={idx} className="bg-white px-2 py-1 rounded border border-slate-200 shadow-sm flex items-center gap-1.5 group">
                                         <span className="text-[10px] font-medium text-slate-700">{sub.name}</span>
                                         <button onClick={() => { const up = grade.subjects.filter((_,i)=>i!==idx); handleUpdatePriceBoard(classId, true, { subjects: up }); }} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                            <X className="w-3 h-3" />
                                         </button>
                                      </div>
                                    ))}
                                    {/* Compact Inline Add */}
                                    <div className="flex items-center bg-white border border-dashed border-indigo-300 rounded px-1">
                                       <input id={`new-sn-${classId}`} type="text" placeholder="Add..." className="bg-transparent px-1 py-1 text-[10px] font-medium outline-none w-16" />
                                       <button onClick={async () => {
                                          const subName = document.getElementById(`new-sn-${classId}`).value;
                                          if(!subName) return;
                                          const up = [...(grade.subjects||[]), {name:subName, singleSubjectPrice:0}];
                                          await handleUpdatePriceBoard(classId, true, { subjects: up });
                                          document.getElementById(`new-sn-${classId}`).value = '';
                                       }} className="p-0.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><Plus className="w-3 h-3" /></button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>
              );
            })}
         </div>
      </div>

      {/* SENIOR CLASSES SECTION (INTER) */}
      <div className="space-y-3 pt-2">
         <div className="flex items-center gap-2 px-1">
            <Globe className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">Inter Sections (11th & 12th)</h2>
         </div>
         
         <div className="grid grid-cols-1 gap-3 items-start">
            {[11, 12].map(level => {
               const isExpanded = expandedId === `senior-${level}`;
               const subjectsRaw = currentSeniorSubjects.filter(s => s.classLevel === level);
               
               const uniqueSubjects = [];
               const seenNames = new Set();
               subjectsRaw.forEach(s => {
                  if (!seenNames.has(s.name)) {
                     seenNames.add(s.name);
                     uniqueSubjects.push(s);
                  }
               });
               
               return (
                 <div key={level} className={`bg-white rounded-lg border border-slate-200 shadow-sm transition-colors ${isExpanded ? 'border-indigo-200 ring-1 ring-indigo-50' : ''}`}>
                    <div className="p-4 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-800 rounded-md flex items-center justify-center text-white font-bold text-lg shadow-sm">
                             {level === 11 ? '1st' : '2nd'}
                          </div>
                          <div className="flex flex-col">
                             <h3 className="text-base font-bold text-slate-800 leading-tight">{level === 11 ? 'Inter 1st Year' : 'Inter 2nd Year'}</h3>
                             <p className="text-[9px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">Independent Subjects</p>
                          </div>
                       </div>
                       <button onClick={() => setExpandedId(isExpanded ? null : `senior-${level}`)} className={`p-2 rounded-md transition-colors ${isExpanded ? 'bg-slate-100 text-slate-800' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                       </button>
                    </div>

                    <AnimatePresence>
                       {isExpanded && (
                         <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-slate-50 border-t border-slate-100">
                            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                               {uniqueSubjects.map((sub) => (
                                 <div key={sub._id} className="bg-white border border-slate-200 rounded-md p-2 hover:border-indigo-300 transition-colors shadow-sm group space-y-2">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                       <h4 className="text-xs font-extrabold text-slate-800 truncate pr-2">{sub.name}</h4>
                                       <button onClick={() => handleDeleteSubjectBoard(sub._id)} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Delete">
                                          <Trash2 className="w-3.5 h-3.5"/>
                                       </button>
                                    </div>
                                    <div className="flex items-center gap-1">
                                       {[
                                          { k: 'oneMonth', l: 'Monthly' },
                                          { k: 'threeMonths', l: 'Quarterly' },
                                          { k: 'sixMonths', l: 'Half-Yearly' },
                                          { k: 'twelveMonths', l: 'Annually' }
                                       ].map(t => (
                                          <div key={t.k} className="flex-1">
                                             <div className="text-[8px] text-center font-bold text-slate-400 mb-0.5">{t.l}</div>
                                             <input 
                                                type="number"
                                                defaultValue={sub.pricing?.[t.k] || 0}
                                                id={`si-${sub._id}-${t.k}`}
                                                className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-1 text-[11px] font-semibold outline-none focus:border-indigo-400 text-center text-slate-700"
                                             />
                                          </div>
                                       ))}
                                    </div>
                                    <button 
                                       onClick={() => {
                                          const pricing = {
                                             oneMonth: Number(document.getElementById(`si-${sub._id}-oneMonth`).value),
                                             threeMonths: Number(document.getElementById(`si-${sub._id}-threeMonths`).value),
                                             sixMonths: Number(document.getElementById(`si-${sub._id}-sixMonths`).value),
                                             twelveMonths: Number(document.getElementById(`si-${sub._id}-twelveMonths`).value)
                                          };
                                          handleUpdateSubjectPriceBoard(sub._id, pricing);
                                       }}
                                       className="w-full py-1.5 bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white rounded font-bold text-[10px] uppercase tracking-wider transition-colors"
                                    >
                                       Update Price
                                    </button>
                                 </div>
                               ))}

                               {/* SENIOR ADD SUBJECT */}
                               <div className="bg-white border border-dashed border-indigo-200 rounded-md p-3 flex flex-col items-center justify-center gap-2.5 hover:bg-indigo-50/50 transition-colors shadow-sm">
                                  <div className="text-center">
                                     <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">Add New Subject</h5>
                                  </div>
                                  <div className="flex w-full gap-1.5">
                                     <input id={`new-si-${level}`} type="text" placeholder="Name..." className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs font-semibold outline-none focus:border-indigo-400" />
                                     <button 
                                        onClick={async () => {
                                           const name = document.getElementById(`new-si-${level}`).value;
                                           if(!name) return;
                                           await axios.post('/admin/subjects', { name, classLevel: level, board: activeBoard, pricing: {oneMonth:0, threeMonths:0, sixMonths:0, twelveMonths:0} });
                                           fetchData();
                                           document.getElementById(`new-si-${level}`).value = '';
                                        }}
                                        className="px-3 py-1.5 bg-indigo-600 text-white rounded font-bold text-xs hover:bg-indigo-700 transition-colors shadow-sm"
                                     >
                                        Add
                                     </button>
                                  </div>
                               </div>
                            </div>
                         </motion.div>
                       )}
                    </AnimatePresence>
                 </div>
               );
            })}
         </div>
      </div>
    </div>
  );
};

export default PricingManagement;
