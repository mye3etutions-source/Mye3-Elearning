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
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  
  const [editPricing, setEditPricing] = useState({});
  const [oneOnOneCategories, setOneOnOneCategories] = useState([]);
  const [newOneOnOneCategory, setNewOneOnOneCategory] = useState({ name: '', oneMonth: 0, threeMonths: 0, sixMonths: 0, twelveMonths: 0 });

  const fetchData = async () => {
    try {
      const [resClasses, resSubjects, resOneOnOne] = await Promise.all([
        axios.get('/admin/classes'),
        axios.get('/admin/subjects'),
        axios.get('/admin/1on1-categories')
      ]);
      setJuniorClasses(resClasses.data);
      setSeniorSubjects(resSubjects.data);
      setOneOnOneCategories(resOneOnOne.data || []);
      
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

  const handleAddOneOnOneCategory = async () => {
    if (!newOneOnOneCategory.name) return toast.error('Category Name is required');
    const loadingToast = toast.loading('Adding 1-on-1 category...');
    try {
      await axios.post('/admin/1on1-categories', {
        name: newOneOnOneCategory.name,
        pricing: {
          oneMonth: Number(newOneOnOneCategory.oneMonth) || 0,
          threeMonths: Number(newOneOnOneCategory.threeMonths) || 0,
          sixMonths: Number(newOneOnOneCategory.sixMonths) || 0,
          twelveMonths: Number(newOneOnOneCategory.twelveMonths) || 0,
        }
      });
      toast.success('Category added successfully!', { id: loadingToast });
      setNewOneOnOneCategory({ name: '', oneMonth: 0, threeMonths: 0, sixMonths: 0, twelveMonths: 0 });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add category', { id: loadingToast });
    }
  };

  const handleUpdateOneOnOneCategory = async (id, pricingPayload) => {
    const loadingToast = toast.loading('Updating 1-on-1 pricing...');
    try {
      await axios.put(`/admin/1on1-categories/${id}`, { pricing: pricingPayload });
      toast.success('Pricing updated successfully!', { id: loadingToast });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Save failed', { id: loadingToast });
    }
  };

  const handleDeleteOneOnOneCategory = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    const loadingToast = toast.loading('Deleting category...');
    try {
      await axios.delete(`/admin/1on1-categories/${id}`);
      toast.success('Category deleted!', { id: loadingToast });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed', { id: loadingToast });
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

  const handleDeleteClass = async (classId, className) => {
     if(!window.confirm(`Are you sure you want to delete ${className} for ${activeBoard}?`)) return;
     const loadingToast = toast.loading(`Deleting ${className}...`);
     try {
        await axios.delete(`/admin/classes/${classId}`);
        toast.success(`${className} deleted!`, { id: loadingToast });
        fetchData();
     } catch (e) {
        const msg = e.response?.data?.message || 'Failed to delete class';
        toast.error(msg, { id: loadingToast });
     }
  };

  const handleAddClass = async () => {
    const trimmed = newClassName.trim();
    if (!trimmed) return toast.error('Class name cannot be empty');
    const loadingToast = toast.loading(`Adding ${trimmed}...`);
    try {
      await axios.post('/admin/classes', {
        className: trimmed,
        board: activeBoard,
        pricing: { oneMonth: 0, threeMonths: 0, sixMonths: 0, twelveMonths: 0 },
        subjects: []
      });
      toast.success(`${trimmed} added for ${activeBoard}!`, { id: loadingToast });
      setNewClassName('');
      setShowAddClassModal(false);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to add class', { id: loadingToast });
    }
  };

  const handleInitializeBoard = async () => {
    const loadingToast = toast.loading(`Initializing ${activeBoard} classes and subjects...`);
    try {
      // 1. Initialize Junior Classes (6-10) using dynamic class names from existing data or defaults
      const existingClassNames = [...new Set(juniorClasses.map(c => c.className))].filter(Boolean);
      const classNames = existingClassNames.length > 0
        ? existingClassNames
        : ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
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

  const currentSeniorSubjects = seniorSubjects.filter(c => c.board === activeBoard);

  // Junior class NAMES come from ALL boards (global structure), pricing is per active board
  const allJuniorNames = [...new Set(juniorClasses.filter(c => c.className !== '1-on-1').map(c => c.className))].sort((a,b) => {
     return (parseInt(a.replace(/\D/g, ''))||0) - (parseInt(b.replace(/\D/g, ''))||0);
  });
  const uniqueJuniorNames = allJuniorNames;

  // Find the record for active board per class (may be null if not initialized for this board)
  const getGradeForBoard = (name) => juniorClasses.find(c => c.className === name && c.board === activeBoard);

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
            <button
               onClick={() => setActiveBoard('1-on-1')}
               className={`px-3 md:px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  activeBoard === '1-on-1' 
                  ? 'bg-white text-indigo-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
               }`}
            >
               1-on-1
            </button>
         </div>

         <div className="flex items-center gap-3">
            {activeBoard !== '1-on-1' ? (
               <div className="bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 flex flex-col items-end hidden md:flex">
                  <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">Classes Loaded</span>
                  <span className="text-sm font-bold text-slate-800">{uniqueJuniorNames.length + 2} Grades</span>
               </div>
            ) : (
               <div className="bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 flex flex-col items-end hidden md:flex">
                  <span className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">Mode</span>
                  <span className="text-sm font-bold text-slate-800">1-on-1 Pricing</span>
               </div>
            )}
         </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeBoard}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeBoard !== '1-on-1' ? (
             <div className="space-y-4">
            {/* JUNIOR CLASSES SECTION */}
            <div className="space-y-2">
               <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-800">
                      {(() => {
                        const nums = uniqueJuniorNames.map(n => parseInt(n.replace(/\D/g, '')) || 0).filter(n => n > 0);
                        if (nums.length === 0) return 'Junior Grades';
                        const min = Math.min(...nums);
                        const max = Math.max(...nums);
                        return min === max ? `Junior Grades (${min}th)` : `Junior Grades (${min}th - ${max}th)`;
                      })()}
                    </h2>
                  </div>
                  {activeBoard !== '1-on-1' && (
                    <button
                      onClick={() => setShowAddClassModal(true)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-colors shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Class
                    </button>
                  )}
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
               
               <div className="grid grid-cols-1 gap-3 items-start">
                  {uniqueJuniorNames.map((name) => {
                    const grade = getGradeForBoard(name);
                    const classId = grade?._id;
                    const isExpanded = expandedId === name;
                    
                    return (
                      <div key={name} className={`bg-white rounded-lg border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors group overflow-hidden ${isExpanded ? 'ring-1 ring-indigo-100' : ''}`}>
                         <div 
                           className="p-3 cursor-pointer select-none"
                           onClick={() => setExpandedId(isExpanded ? null : name)}
                         >
                            <div className="flex items-center w-full">
                               <div className="flex items-center gap-3 w-1/3">
                                  <div className="w-8 h-8 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                     {parseInt(name.replace(/\D/g, ''))||'J'}
                                  </div>
                                  <div className="flex flex-col">
                                     <h3 className="text-sm font-bold text-slate-800 leading-tight">{name}</h3>
                                     <span className={`text-[9px] font-medium uppercase tracking-wider mt-0.5 ${grade ? 'text-slate-500' : 'text-amber-500'}`}>
                                       {grade ? 'Master Bundle' : `Not set for ${activeBoard}`}
                                     </span>
                                  </div>
                               </div>

                               <div className="flex-1 flex justify-center">
                                  {!isExpanded && grade?.pricing && (
                                     <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
                                        <div className="flex flex-col items-center">
                                           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Monthly</span>
                                           <span>₹{grade.pricing.oneMonth || 0}</span>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200"></div>
                                        <div className="flex flex-col items-center">
                                           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Quarterly</span>
                                           <span>₹{grade.pricing.threeMonths || 0}</span>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200"></div>
                                        <div className="flex flex-col items-center">
                                           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Half-Yearly</span>
                                           <span>₹{grade.pricing.sixMonths || 0}</span>
                                        </div>
                                        <div className="w-px h-8 bg-slate-200"></div>
                                        <div className="flex flex-col items-center">
                                           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Annually</span>
                                           <span>₹{grade.pricing.twelveMonths || 0}</span>
                                        </div>
                                     </div>
                                  )}
                               </div>

                               <div className="w-1/3 flex justify-end items-center gap-2">
                                  {grade && (
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); handleDeleteClass(classId, name); }}
                                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                      title="Delete Class"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  <div className={`p-1.5 rounded-md transition-colors ${isExpanded ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
                                     <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                  </div>
                               </div>
                            </div>
                         </div>

                         <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-slate-50 border-t border-slate-100 overflow-hidden">
                                 <div className="p-3 space-y-3">
                                   {!grade ? (
                                     <div className="flex flex-col items-center gap-3 py-4 text-center">
                                       <p className="text-xs text-slate-500"><b>{name}</b> not initialized for <b>{activeBoard}</b>.</p>
                                       <button
                                         onClick={async () => {
                                           await axios.post('/admin/classes', { className: name, board: activeBoard, pricing: { oneMonth: 0, threeMonths: 0, sixMonths: 0, twelveMonths: 0 }, subjects: [] });
                                           fetchData();
                                         }}
                                         className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                                       >
                                         <Plus className="w-3.5 h-3.5" /> Initialize for {activeBoard}
                                       </button>
                                     </div>
                                   ) : (
                                     <>
                                     <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
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
                                                    type="text" 
                                                    value={editPricing[classId]?.[t.k] ?? ''} 
                                                    onFocus={(e) => { if(e.target.value === '0') setEditPricing({ ...editPricing, [classId]: { ...editPricing[classId], [t.k]: '' } }); }} 
                                                    onChange={(e) => {
                                                       const val = e.target.value;
                                                       if (val === '' || /^[0-9\b]+$/.test(val)) {
                                                         setEditPricing({ ...editPricing, [classId]: { ...editPricing[classId], [t.k]: val } });
                                                       }
                                                    }} 
                                                    className="w-full bg-slate-50 border border-slate-200 rounded pl-5 pr-2 py-1 text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500/30" 
                                                 />
                                              </div>
                                           </div>
                                        ))}
                                     </div>
                                     <button onClick={() => handleUpdatePriceBoard(classId)} className="w-full py-2 bg-slate-800 text-white rounded-md font-medium text-xs shadow-sm hover:bg-indigo-600 transition-colors flex items-center justify-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Save Pricing
                                     </button>
                                     <div className="pt-2 border-t border-slate-200">
                                        <h4 className="text-[9px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2 px-1"><BookOpen className="w-3 h-3 text-indigo-500" /> Subjects</h4>
                                        <div className="flex flex-wrap gap-2">
                                           {(grade.subjects || []).map((sub, idx) => (
                                             <div key={idx} className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 group hover:border-indigo-400 transition-all hover:shadow-md">
                                                <span className="text-xs font-bold text-slate-700">{sub.name}</span>
                                                <button onClick={() => { const up = grade.subjects.filter((_,i)=>i!==idx); handleUpdatePriceBoard(classId, true, { subjects: up }); }} className="text-slate-300 hover:text-red-500 transition-colors">
                                                   <X className="w-3.5 h-3.5" />
                                                </button>
                                             </div>
                                           ))}
                                           <div className="flex items-center bg-white border-2 border-dashed border-indigo-200 rounded-lg px-2 hover:border-indigo-400 transition-colors">
                                              <input 
                                                 id={'new-sn-' + classId} 
                                                 type="text" 
                                                 placeholder="New Subject..." 
                                                 className="bg-transparent px-2 py-1.5 text-xs font-bold outline-none w-28 placeholder:text-slate-300" 
                                              />
                                              <button 
                                                 onClick={async () => { 
                                                    const subName = document.getElementById('new-sn-' + classId).value; 
                                                    if(!subName) return; 
                                                    const up = [...(grade.subjects||[]), {name:subName, singleSubjectPrice:0}]; 
                                                    await handleUpdatePriceBoard(classId, true, { subjects: up }); 
                                                    document.getElementById('new-sn-' + classId).value = ''; 
                                                 }} 
                                                 className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                              >
                                                 <Plus className="w-4 h-4" />
                                              </button>
                                           </div>
                                        </div>
                                     </div>
                                     </>
                                   )}
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
                                                       type="text"
                                                       defaultValue={sub.pricing?.[t.k] || 0}
                                                       id={'si-' + sub._id + '-' + t.k}
                                                       onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                                                       className="w-full bg-slate-50 border border-slate-200 rounded px-1 py-1 text-[11px] font-semibold outline-none focus:border-indigo-400 text-center text-slate-700"
                                                    />
                                                </div>
                                             ))}
                                          </div>
                                          <button 
                                             onClick={() => {
                                                const pricing = {
                                                   oneMonth: Number(document.getElementById('si-' + sub._id + '-oneMonth').value),
                                                   threeMonths: Number(document.getElementById('si-' + sub._id + '-threeMonths').value),
                                                   sixMonths: Number(document.getElementById('si-' + sub._id + '-sixMonths').value),
                                                   twelveMonths: Number(document.getElementById('si-' + sub._id + '-twelveMonths').value)
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
                                           <input id={'new-si-' + level} type="text" placeholder="Name..." className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs font-semibold outline-none focus:border-indigo-400" />
                                           <button 
                                              onClick={async () => {
                                                 const name = document.getElementById('new-si-' + level).value;
                                                 if(!name) return;
                                                 await axios.post('/admin/subjects', { name, classLevel: level, board: activeBoard, pricing: {oneMonth:0, threeMonths:0, sixMonths:0, twelveMonths:0} });
                                                 fetchData();
                                                 document.getElementById('new-si-' + level).value = '';
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
      ) : (
         /* 1-on-1 PERSONAL TRAINING SECTION */
         <div className="space-y-4 pt-2 animate-in fade-in">
            <div className="flex items-center gap-2 px-1 pb-2">
               <IndianRupee className="w-4 h-4 text-indigo-600" />
               <h2 className="text-sm font-bold text-slate-800">1-on-1 Personal Classes / Categories</h2>
            </div>
            
            {/* ADD NEW CATEGORY ACCORDION */}
            <div className={`bg-white rounded-xl border shadow-sm group hover:border-indigo-300 transition-colors overflow-hidden ${expandedId === 'CREATE_NEW' ? 'border-indigo-200 ring-1 ring-indigo-100' : 'border-slate-200'}`}>
               <div 
                 className="flex items-center justify-between p-4 cursor-pointer select-none"
                 onClick={() => setExpandedId(expandedId === 'CREATE_NEW' ? null : 'CREATE_NEW')}
               >
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-lg flex items-center justify-center shadow-sm">
                        <Plus className="w-5 h-5" />
                     </div>
                     <div>
                        <h3 className="text-sm font-black text-indigo-900 tracking-wide">Create New Category</h3>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">Add a new 1-on-1 subject</p>
                     </div>
                  </div>
                  <div className={`p-2 rounded-md transition-colors ${expandedId === 'CREATE_NEW' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}>
                     <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${expandedId === 'CREATE_NEW' ? 'rotate-180' : ''}`} />
                  </div>
               </div>
               
               <AnimatePresence>
                 {expandedId === 'CREATE_NEW' && (
                   <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     transition={{ duration: 0.2 }}
                     className="overflow-hidden"
                   >
                     <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                        <div className="space-y-4 pt-2">
                           <div className="flex items-center gap-3 w-full max-w-sm">
                              <input 
                                type="text" 
                                placeholder="e.g. Class 10, Music, Art" 
                                value={newOneOnOneCategory.name}
                                onChange={(e) => setNewOneOnOneCategory({...newOneOnOneCategory, name: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-indigo-400 placeholder:text-slate-300" 
                              />
                           </div>
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {[
                                 { k: 'oneMonth', l: 'Monthly' },
                                 { k: 'threeMonths', l: 'Quarterly' },
                                 { k: 'sixMonths', l: 'Half-Yearly' },
                                 { k: 'twelveMonths', l: 'Annually' }
                              ].map(t => (
                                 <div key={t.k} className="bg-slate-50 p-2 rounded-lg border border-slate-100 shadow-inner">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 px-1">{t.l}</div>
                                    <div className="relative">
                                       <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                        <input 
                                          type="text" 
                                          value={newOneOnOneCategory[t.k] || ''} 
                                          onChange={(e) => {
                                             const val = e.target.value;
                                             if (val === '' || /^[0-9\b]+$/.test(val)) {
                                               setNewOneOnOneCategory({ ...newOneOnOneCategory, [t.k]: val });
                                             }
                                          }} 
                                          className="w-full bg-white border border-slate-200 rounded pl-6 pr-2 py-1.5 text-sm font-black outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-700" 
                                       />
                                    </div>
                                 </div>
                              ))}
                           </div>
                           <button onClick={handleAddOneOnOneCategory} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-black text-xs shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 mt-2">
                              <Plus className="w-4 h-4" /> Add Category & Pricing
                           </button>
                        </div>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* EXISTING CATEGORIES */}
            <div className="space-y-4 mt-6">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 border-b border-slate-200 pb-2">Active Categories</h3>
              {oneOnOneCategories.length === 0 && (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-slate-300">
                  <p className="text-sm font-bold text-slate-400">No 1-on-1 categories created yet.</p>
                </div>
              )}
              {oneOnOneCategories.map(cat => {
                const isExpanded = expandedId === cat._id;
                return (
                <div key={cat._id} className={`bg-white rounded-xl border border-slate-200 shadow-sm group hover:border-slate-300 transition-colors overflow-hidden ${isExpanded ? 'ring-1 ring-indigo-100' : ''}`}>
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer select-none"
                    onClick={() => setExpandedId(isExpanded ? null : cat._id)}
                  >
                     <div className="w-1/3 flex items-center gap-2">
                        <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                           {cat.name}
                           {!cat.isActive && <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] rounded uppercase tracking-wider">Inactive</span>}
                        </h4>
                     </div>

                     <div className="flex-1 flex justify-center">
                        {!isExpanded && (
                           <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
                              <div className="flex flex-col items-center">
                                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Monthly</span>
                                 <span>₹{cat.pricing?.oneMonth || 0}</span>
                              </div>
                              <div className="w-px h-8 bg-slate-200"></div>
                              <div className="flex flex-col items-center">
                                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Quarterly</span>
                                 <span>₹{cat.pricing?.threeMonths || 0}</span>
                              </div>
                              <div className="w-px h-8 bg-slate-200"></div>
                              <div className="flex flex-col items-center">
                                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Half-Yearly</span>
                                 <span>₹{cat.pricing?.sixMonths || 0}</span>
                              </div>
                              <div className="w-px h-8 bg-slate-200"></div>
                              <div className="flex flex-col items-center">
                                 <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Annually</span>
                                 <span>₹{cat.pricing?.twelveMonths || 0}</span>
                              </div>
                           </div>
                        )}
                     </div>

                     <div className="w-1/3 flex items-center justify-end gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteOneOnOneCategory(cat._id); }} 
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                        <div className={`p-1.5 rounded-md transition-colors ${isExpanded ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100 border border-transparent hover:border-slate-200'}`}>
                           <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                     </div>
                  </div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                         <div className="p-4 pt-0 space-y-4 border-t border-slate-100 mt-2">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
                               {[
                                  { k: 'oneMonth', l: 'Monthly' },
                                  { k: 'threeMonths', l: 'Quarterly' },
                                  { k: 'sixMonths', l: 'Half-Yearly' },
                                  { k: 'twelveMonths', l: 'Annually' }
                               ].map(t => (
                                  <div key={t.k} className="relative">
                                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 px-1">{t.l}</div>
                                     <span className="absolute left-2 top-[26px] text-slate-400 font-bold text-sm">₹</span>
                                     <input 
                                        id={`cat-${cat._id}-${t.k}`}
                                        type="text" 
                                        defaultValue={cat.pricing?.[t.k] || 0}
                                        onKeyPress={(e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); }}
                                        className="w-full bg-slate-50 border border-slate-200 rounded pl-6 pr-2 py-1.5 text-sm font-black outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-700" 
                                     />
                                  </div>
                               ))}
                            </div>
                            <button 
                               onClick={() => {
                                  const payload = {
                                     oneMonth: Number(document.getElementById(`cat-${cat._id}-oneMonth`).value),
                                     threeMonths: Number(document.getElementById(`cat-${cat._id}-threeMonths`).value),
                                     sixMonths: Number(document.getElementById(`cat-${cat._id}-sixMonths`).value),
                                     twelveMonths: Number(document.getElementById(`cat-${cat._id}-twelveMonths`).value)
                                  };
                                  handleUpdateOneOnOneCategory(cat._id, payload);
                               }}
                               className="w-full py-2 bg-slate-50 text-slate-600 hover:bg-slate-800 hover:text-white border border-slate-200 hover:border-slate-800 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
                            >
                               <CheckCircle2 className="w-3.5 h-3.5" /> Update Category Pricing
                            </button>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                );
              })}
            </div>
             </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ADD CLASS MODAL */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setShowAddClassModal(false); setNewClassName(''); }} />
          <div className="relative bg-white rounded-xl w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800">Add New Class</h2>
                <p className="text-xs text-slate-500 mt-0.5">For <span className="font-semibold text-indigo-600">{activeBoard}</span></p>
              </div>
              <button onClick={() => { setShowAddClassModal(false); setNewClassName(''); }} className="text-slate-400 hover:text-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Class Name</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddClass()}
                  placeholder="e.g. Class 1, Class 11, Degree..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-md outline-none font-medium text-sm text-slate-800 transition-colors shadow-sm"
                  autoFocus
                />
                <p className="text-[10px] text-slate-400 ml-1">Any class name — DB lo store avutundi</p>
              </div>
              <button
                onClick={handleAddClass}
                className="w-full py-2 bg-indigo-600 text-white rounded-md font-medium text-sm shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingManagement;
