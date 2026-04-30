import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, User, Mail, Shield, Save, X, Loader2, BookOpen, GraduationCap, CheckCircle, ChevronLeft, ChevronRight, AlertCircle, Award, DollarSign } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import TeacherProfile from './TeacherProfile';

const TeacherManagement = () => {
   const [teachers, setTeachers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showModal, setShowModal] = useState(false);
   const [showAssignModal, setShowAssignModal] = useState(false);
   const [editingTeacher, setEditingTeacher] = useState(null);
   const [selectedTeacher, setSelectedTeacher] = useState(null);

   const [formData, setFormData] = useState({ name: '', email: '', password: '' });
   const [searchQuery, setSearchQuery] = useState('');
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 8;

   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
   const [teacherToDelete, setTeacherToDelete] = useState(null);
   const [detailedTeacher, setDetailedTeacher] = useState(null);

   // Assignment States
   const [classes, setClasses] = useState([]);
   const [selectedAssignments, setSelectedAssignments] = useState([]);
   const [assignmentSearch, setAssignmentSearch] = useState('');
   const [activeBoard, setActiveBoard] = useState(null);
   const [activeClasses, setActiveClasses] = useState([]);

   const fetchTeachers = async () => {
      try {
         const { data } = await axios.get('/admin/teachers-list');
         setTeachers(data);
         setLoading(false);
      } catch (error) {
         toast.error('Failed to fetch teachers');
         setLoading(false);
      }
   };

   const fetchClassesAndSubjects = async () => {
      try {
         const { data: bundles } = await axios.get('/admin/classes');
         const { data: subjects1112 } = await axios.get('/subjects');

         const allClasses = [
            ...bundles.map(b => ({ ...b, type: 'bundle', displayName: b.className, level: b.className, board: b.board })),
            ...subjects1112.map(s => ({ ...s, type: 'subject', displayName: s.name, level: `Class ${s.classLevel}`, board: s.board }))
         ];
         setClasses(allClasses);
      } catch (error) {
         toast.error('Failed to load classes');
      }
   };

   useEffect(() => {
      fetchTeachers();
      fetchClassesAndSubjects();
   }, []);

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         const payload = {
            name: formData.name,
            email: formData.email
         };

         if (formData.password) {
            payload.password = formData.password;
         }

         if (editingTeacher) {
            await axios.put(`/admin/users/${editingTeacher._id}`, payload);
            toast.success('Teacher updated!');
         } else {
            await axios.post('/admin/teachers', payload);
            toast.success('Teacher account created!');
         }
         setShowModal(false);
         fetchTeachers();
      } catch (error) {
         toast.error(error.response?.data?.message || 'Operation failed');
      }
   };

   const handleAssignSubmit = async (e) => {
      if (e && e.preventDefault) e.preventDefault();
      
      if (selectedAssignments.length === 0) return toast.error('Please select at least one assignment');

      // Check if current view has any selection (to satisfy user request for warning)
      if (activeBoard && activeClasses.length > 0) {
         const selectionInView = selectedAssignments.filter(a => a.board === activeBoard && activeClasses.includes(a.classLevel)).length;
         if (selectionInView === 0) {
            toast.error(`Warning: No subjects selected in ${activeBoard} - ${activeClasses.join(', ')}. Please select subjects before saving.`, { duration: 4000 });
            return;
         }
      }
      
      console.log('Final Assignments to Save:', selectedAssignments);

      // Validate that all selected assignments have a price > 0
      const invalidAssignments = selectedAssignments.filter(a => {
         const price = parseFloat(a.pricePerClass);
         return isNaN(price) || price <= 0;
      });

      if (invalidAssignments.length > 0) {
         console.warn('Blocked Save: Invalid Prices Found', invalidAssignments);
         const names = invalidAssignments.slice(0, 2).map(a => a.subjectName).join(', ');
         
         return toast.custom((t) => (
            <div className={`${t.visible ? 'animate-in fade-in zoom-in duration-300' : 'animate-out fade-out zoom-out duration-200'} max-w-md w-full bg-white shadow-2xl rounded-[24px] pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden border border-rose-100`}>
               <div className="flex-1 w-0 p-5">
                  <div className="flex items-start">
                     <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                           <AlertCircle className="w-7 h-7" />
                        </div>
                     </div>
                     <div className="ml-4 flex-1">
                        <p className="text-[13px] font-black text-slate-900 uppercase tracking-wider">Pricing Missing</p>
                        <p className="mt-1 text-xs font-bold text-slate-500 leading-relaxed italic">
                           You have <span className="text-rose-600 font-black">{invalidAssignments.length} subjects</span> that still need prices. <br/>
                           <span className="text-slate-400 text-[10px] uppercase font-black not-italic tracking-tighter">Check: {names}{invalidAssignments.length > 2 ? '...' : ''}</span>
                        </p>
                     </div>
                  </div>
               </div>
               <div className="flex flex-col border-l border-slate-100 w-24">
                  <button
                     onClick={() => toast.dismiss(t.id)}
                     className="w-full flex-1 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:text-rose-600 transition-all active:bg-slate-100"
                  >
                     Dismiss
                  </button>
               </div>
            </div>
         ), { duration: 4000 });
      }

      const loadingToast = toast.loading('Assigning subjects...');
      try {
         const { data } = await axios.put(`/admin/teachers/${selectedTeacher._id}/assign`, {
            assignments: selectedAssignments
         });
         toast.success(`Successfully assigned ${selectedAssignments.length} items to ${selectedTeacher.name}`, { id: loadingToast });
         setTeachers(prev => prev.map(t => t._id === data._id ? data : t));
         setSelectedTeacher(data);
         setSelectedAssignments([]); // Clear selection
         setShowAssignModal(false); // Close the modal
      } catch (error) {
         toast.error(error.response?.data?.message || 'Assignment failed', { id: loadingToast });
      }
   };

   const handleRemoveAssignment = async (teacherId, assignmentId) => {
      try {
         const { data } = await axios.delete(`/admin/teachers/${teacherId}/assign/${assignmentId}`);
         setTeachers(prev => prev.map(t => t._id === data._id ? data : t));
         if (selectedTeacher && selectedTeacher._id === teacherId) setSelectedTeacher(data);
         toast.success('Assignment removed');
      } catch (error) {
         toast.error('Failed to remove assignment');
      }
   };

   const handleDelete = async () => {
      if (!teacherToDelete) return;
      const loadingToast = toast.loading('Removing faculty member...');
      try {
         await axios.delete(`/admin/users/${teacherToDelete._id}`);
         toast.success(`${teacherToDelete.name} removed successfully`, { id: loadingToast });
         setShowDeleteConfirm(false);
         setTeacherToDelete(null);
         fetchTeachers();
      } catch (error) {
         toast.error(error.response?.data?.message || 'Failed to remove teacher', { id: loadingToast });
      }
   };

   const toggleAssignment = (item) => {
      const isSelected = selectedAssignments.some(a => a.classLevel === item.classLevel && a.subjectName === item.subjectName && a.board === item.board);
      if (isSelected) {
         setSelectedAssignments(prev => prev.filter(a => !(a.classLevel === item.classLevel && a.subjectName === item.subjectName && a.board === item.board)));
      } else {
         // Preserve existing price if it exists in the teacher's current assignments
         const existing = selectedTeacher?.assignedSubjects?.find(a => a.classLevel === item.classLevel && a.subjectName === item.subjectName && a.board === item.board);
         setSelectedAssignments(prev => [...prev, { ...item, pricePerClass: existing ? (existing.pricePerClass || 0) : 0 }]);
      }
   };

   const updateAssignmentPrice = (item, price) => {
      setSelectedAssignments(prev => prev.map(a =>
         (a.classLevel === item.classLevel && a.subjectName === item.subjectName && a.board === item.board)
            ? { ...a, pricePerClass: Number(price) }
            : a
      ));
   };

   // Nested grouping: { board: { classLevel: [assignments] } }
   const groupedByBoard = classes.reduce((acc, curr) => {
      const level = curr.level;
      const board = curr.board || 'TS Board';
      if (!acc[board]) acc[board] = {};
      if (!acc[board][level]) acc[board][level] = [];

      if (curr.type === 'bundle') {
         if (curr.subjects && curr.subjects.length > 0) {
            curr.subjects.forEach(sub => {
               if (sub.name) {
                  acc[board][level].push({
                     assignmentType: 'bundle',
                     classLevel: level,
                     subjectName: sub.name,
                     subjectId: sub._id,
                     board
                  });
               }
            });
         }
      } else {
         if (curr.displayName) {
            acc[board][level].push({
               assignmentType: 'subject',
               classLevel: level,
               subjectName: curr.displayName,
               subjectId: curr._id,
               board
            });
         }
      }
      return acc;
   }, {});

   // Flatten helper for selection
   const getAllItemsForBoard = (board) => Object.values(groupedByBoard[board] || {}).flat();

   const filteredTeachers = teachers.filter(t =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase())
   );

   // Pagination logic
   const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
   const indexOfLastItem = currentPage * itemsPerPage;
   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
   const currentItems = filteredTeachers.slice(indexOfFirstItem, indexOfLastItem);

   // Reset to page 1 when searching
   useEffect(() => {
      setCurrentPage(1);
   }, [searchQuery]);

   if (loading) return (
      <div className="flex h-[60vh] items-center justify-center">
         <Loader2 className="w-8 h-8 text-[#002147] animate-spin" />
      </div>
   );

   return (
      <div className="space-y-6 animate-in fade-in duration-300 px-2 md:px-0 max-w-6xl mx-auto">
         <Toaster position="top-right" />

         <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${detailedTeacher ? 'hidden' : 'pb-4 border-b border-slate-100'}`}>
            <div className="space-y-0.5">
               <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Faculty Management</h1>
               <p className="text-slate-500 font-medium text-xs">Manage academic staff and subject assignments</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
               <div className="relative group w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#002147] transition-colors" />
                  <input
                     type="text"
                     placeholder="Search faculty..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-md w-full outline-none font-medium text-slate-700 focus:ring-1 focus:ring-[#002147]/50 focus:border-[#002147] transition-all shadow-sm text-sm"
                  />
               </div>
               <button
                  onClick={() => { setEditingTeacher(null); setFormData({ name: '', email: '', password: '' }); setShowModal(true); }}
                  className="flex items-center justify-center gap-2 bg-[#002147] text-white px-4 py-1.5 rounded-md font-medium shadow-sm hover:bg-[#001a38] transition-colors text-sm w-full sm:w-auto"
               >
                  <Plus className="w-4 h-4" /> Add Teacher
               </button>
            </div>
         </div>

         {detailedTeacher ? (
            <TeacherProfile teacher={detailedTeacher} onBack={() => setDetailedTeacher(null)} />
         ) : (
            <>
               {/* Table Header */}
               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="grid grid-cols-[1fr_2fr_auto] gap-0 border-b border-slate-100 bg-slate-50/70">
                     <div className="px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Faculty Profile</div>
                     <div className="px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Assigned Subjects</div>
                     <div className="px-6 py-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Operational Controls</div>
                  </div>

                  {currentItems.length === 0 ? (
                     <div className="py-20 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-3">
                           <User className="w-12 h-12 opacity-30" />
                           <p className="font-semibold text-sm">No faculty found</p>
                        </div>
                     </div>
                  ) : currentItems.map((teacher, idx) => {
                     // Group assignedSubjects by board -> classLevel
                     const grouped = (teacher.assignedSubjects || []).reduce((acc, s) => {
                        const board = s.board || 'Unassigned';
                        const cls = s.classLevel || 'General';
                        if (!acc[board]) acc[board] = {};
                        if (!acc[board][cls]) acc[board][cls] = [];
                        acc[board][cls].push(s);
                        return acc;
                     }, {});

                     return (
                        <div
                           key={teacher._id}
                           className={`flex flex-col lg:flex-row items-start gap-4 p-6 transition-colors hover:bg-slate-50/60 ${idx < currentItems.length - 1 ? 'border-b border-slate-100' : ''}`}
                        >
                           {/* Col 1: Faculty Profile - Compact and fixed width on desktop */}
                           <div className="flex items-center gap-4 shrink-0 lg:w-[240px]">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl shrink-0 shadow-sm border border-indigo-100/50">
                                 {teacher.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                 <p
                                    className="text-[15px] font-black text-slate-900 truncate cursor-pointer hover:text-indigo-600 transition-colors"
                                    onClick={() => setDetailedTeacher(teacher)}
                                 >
                                    {teacher.name}
                                 </p>
                                 <p className="text-xs text-slate-500 font-medium truncate flex items-center gap-1.5 mt-1">
                                    <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" /> {teacher.email}
                                 </p>
                              </div>
                           </div>

                           {/* Col 2: Assigned Subjects - Flexible flow to use horizontal space */}
                           <div className="flex-1 min-w-0">
                              {Object.keys(grouped).length === 0 ? (
                                 <div className="flex items-center gap-3">
                                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] italic">No Assignments</p>
                                    <button
                                       onClick={() => {
                                          setSelectedTeacher(teacher);
                                          setSelectedAssignments([]);
                                          setShowAssignModal(true);
                                          setActiveBoard(null);
                                          setActiveClasses([]);
                                       }}
                                       className="w-8 h-8 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 hover:border-indigo-400 hover:text-indigo-500 hover:bg-white transition-all"
                                    >
                                       <Plus className="w-4 h-4" />
                                    </button>
                                 </div>
                              ) : (
                                 <div className="flex flex-wrap gap-4">
                                    {Object.entries(grouped).map(([board, classes]) => {
                                       const dotColor = {
                                          'AP BOARD': 'bg-orange-500',
                                          'TS BOARD': 'bg-blue-600',
                                          'CBSE': 'bg-purple-600',
                                          'ICSE': 'bg-purple-600',
                                       }[board.toUpperCase()] || 'bg-slate-400';

                                       return (
                                          <div key={board} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm min-w-[280px]">
                                             <p className="text-[13px] font-black uppercase tracking-[0.1em] text-slate-700 flex items-center gap-2.5 mb-5">
                                                <span className={`w-3 h-3 rounded-full ${dotColor} shadow-sm shadow-slate-200`}></span>
                                                {board}
                                             </p>
                                             <div className="space-y-6">
                                                {Object.entries(classes).map(([cls, subjects]) => (
                                                   <div key={cls} className="space-y-3">
                                                      <p className="text-xs font-black text-slate-500 flex items-center gap-2.5 uppercase tracking-[0.1em]">
                                                         <GraduationCap className="w-5 h-5 text-slate-400" />
                                                         {cls}
                                                      </p>
                                                      <div className="flex flex-wrap gap-2.5">
                                                         {subjects.map((s, i) => (
                                                            <span
                                                               key={i}
                                                               className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50/40 text-indigo-700 text-[13px] font-bold rounded-xl border border-indigo-100/50 group/tag shadow-sm hover:shadow-md hover:bg-indigo-50/80 hover:border-indigo-200/60 transition-all cursor-default"
                                                            >
                                                               <span className="flex items-center gap-2.5">
                                                                  <span className="truncate max-w-[120px]">{s.subjectName}</span>
                                                                  <span
                                                                     onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedTeacher(teacher);
                                                                        setSelectedAssignments(teacher.assignedSubjects || []);
                                                                        setShowAssignModal(true);
                                                                        setActiveBoard(s.board);
                                                                     }}
                                                                     className="flex items-center gap-1 px-2 py-0.5 bg-white border border-indigo-100 rounded-lg text-indigo-600 cursor-pointer hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm group/price"
                                                                     title="Click to edit price"
                                                                  >
                                                                     <span className="text-[11px] font-black tracking-tight">₹{s.pricePerClass || 0}</span>
                                                                     <span className="text-[9px] font-bold opacity-60 group-hover/price:opacity-100">/class</span>
                                                                  </span>
                                                               </span>
                                                               <button
                                                                  onClick={(e) => {
                                                                     e.stopPropagation();
                                                                     handleRemoveAssignment(teacher._id, s._id);
                                                                  }}
                                                                  className="text-slate-400 hover:text-rose-500 transition-colors p-1 border-l border-indigo-100/50 pl-2 ml-0.5"
                                                                  title="Remove assignment"
                                                               >
                                                                  <X className="w-3.5 h-3.5" />
                                                               </button>
                                                            </span>
                                                         ))}
                                                      </div>
                                                   </div>
                                                ))}
                                             </div>
                                          </div>
                                       );
                                    })}

                                    <button
                                       onClick={() => {
                                          setSelectedTeacher(teacher);
                                          setSelectedAssignments(teacher.assignedSubjects || []);
                                          setShowAssignModal(true);
                                          setActiveBoard(null);
                                          setActiveClasses([]);
                                       }}
                                       className="flex flex-col items-center justify-center gap-2.5 border-2 border-dashed border-slate-200 rounded-2xl p-5 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/40 hover:shadow-md transition-all group min-w-[180px]"
                                    >
                                       <Plus className="w-6 h-6 p-1 bg-slate-100 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm" />
                                       <span className="text-[10px] font-black uppercase tracking-widest text-center">Assign Subject</span>
                                    </button>
                                 </div>
                              )}
                           </div>

                           {/* Col 3: Controls - Pushed to end on desktop */}
                           <div className="flex items-center gap-2 lg:ml-auto shrink-0 pt-2 lg:pt-0">
                              <button
                                 onClick={() => {
                                    setEditingTeacher(teacher);
                                    setFormData({ name: teacher.name, email: teacher.email, password: '' });
                                    setShowModal(true);
                                 }}
                                 className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 shadow-sm border border-transparent hover:border-indigo-100 rounded-xl transition-all"
                                 title="Edit Faculty"
                              >
                                 <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                 onClick={() => { setTeacherToDelete(teacher); setShowDeleteConfirm(true); }}
                                 className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 shadow-sm border border-transparent hover:border-rose-100 rounded-xl transition-all"
                                 title="Delete Faculty"
                              >
                                 <Trash2 className="w-5 h-5" />
                              </button>
                           </div>
                        </div>
                     );
                  })}
               </div>

               {/* PAGINATION CONTROLS */}
               {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between gap-4">
                     <p className="text-xs font-bold text-slate-400">
                        Showing <span className="text-slate-800">{indexOfFirstItem + 1}</span> to <span className="text-slate-800">{Math.min(indexOfLastItem, filteredTeachers.length)}</span> of <span className="text-slate-800">{filteredTeachers.length}</span>
                     </p>

                     <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                        <button
                           onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                           disabled={currentPage === 1}
                           className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-30 transition-colors"
                        >
                           <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1">
                           {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
                              if (totalPages > 5 && Math.abs(pg - currentPage) > 1 && pg !== 1 && pg !== totalPages) return pg === 2 || pg === totalPages - 1 ? <span key={pg} className="text-slate-300 mx-1 text-xs">...</span> : null;

                              return (
                                 <button
                                    key={pg}
                                    onClick={() => setCurrentPage(pg)}
                                    className={`w-7 h-7 rounded-lg text-xs font-black transition-colors ${currentPage === pg ? 'bg-[#f16126] text-white shadow-md shadow-orange-200' : 'text-slate-500 hover:bg-slate-50'}`}
                                 >
                                    {pg}
                                 </button>
                              );
                           })}
                        </div>

                        <button
                           onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                           disabled={currentPage === totalPages}
                           className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-30 transition-colors"
                        >
                           <ChevronRight className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               )}
            </>
         )}

         {/* CREATE/EDIT MODAL */}
         {showModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 shadow-2xl">
               <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                     <h2 className="text-base font-bold text-slate-800">{editingTeacher ? 'Update Faculty' : 'New Teacher Account'}</h2>
                     <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-800"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={handleSubmit} className="p-4 space-y-4">
                     <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 ml-1">Full Name</label>
                        <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-md outline-none font-medium text-sm text-slate-800 transition-colors shadow-sm" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 ml-1">Email Address</label>
                        <input required type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-md outline-none font-medium text-sm text-slate-800 transition-colors shadow-sm" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-600 ml-1">
                           Password {editingTeacher && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}
                        </label>
                        <input
                           required={!editingTeacher}
                           type="password"
                           placeholder={editingTeacher ? "••••••••" : "Enter password"}
                           value={formData.password}
                           onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                           className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-md outline-none font-medium text-sm text-slate-800 transition-colors shadow-sm"
                        />
                     </div>
                     {/* Pay rates removed as they are now configured per-subject */}
                     <div className="pt-2">
                        <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded-md font-medium text-sm shadow-sm hover:bg-indigo-700 transition-colors">
                           {editingTeacher ? 'Save Changes' : 'Create Account'}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* FLEXIBLE ASSIGNMENT MODAL (FIXED FOR ALL CLASSES) */}
         {showAssignModal && selectedTeacher && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-[110] flex items-center justify-center p-4">
               <div className="bg-white rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 flex flex-col h-[85vh]">
                  {/* Modal Header */}
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                           <Shield className="w-6 h-6" />
                        </div>
                        <div>
                           <h2 className="text-xl font-bold text-slate-800">Assign Subjects</h2>
                           <p className="text-sm font-medium text-slate-500">Configuring curriculum for <span className="text-[#002147] font-semibold">{selectedTeacher.name}</span></p>
                        </div>
                     </div>
                     <button
                        onClick={() => setShowAssignModal(false)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                     >
                        <X className="w-6 h-6" />
                     </button>
                  </div>

                  {/* Three Column Layout Container */}
                  <div className="flex-1 flex overflow-hidden bg-slate-50/50 text-sm">

                     {/* Column 1: Boards */}
                     <div className="w-1/4 border-r border-slate-200 flex flex-col bg-white">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/30">
                           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 1: Board</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                           {Object.keys(groupedByBoard).length === 0 ? (
                              <div className="p-4 text-center text-slate-400 mt-10">
                                 <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                 <p className="text-[10px] font-bold uppercase tracking-wider">No Boards Found</p>
                              </div>
                           ) : Object.keys(groupedByBoard).map(board => {
                              const items = getAllItemsForBoard(board);
                              const selectedItems = items.filter(i => selectedAssignments.some(a => a.classLevel === i.classLevel && a.subjectName === i.subjectName && a.board === i.board));
                              const selectedInBoard = selectedItems.length;
                              const missingInBoard = selectedItems.filter(i => {
                                 const assignment = selectedAssignments.find(a => a.classLevel === i.classLevel && a.subjectName === i.subjectName && a.board === i.board);
                                 return assignment && (!assignment.pricePerClass || Number(assignment.pricePerClass) <= 0);
                              }).length;
                              const isActive = activeBoard === board;

                              return (
                                 <button
                                    key={board}
                                    onClick={() => {
                                       setActiveBoard(board);
                                       setActiveClasses([]);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                          ? 'bg-[#002147] text-white shadow-md shadow-slate-200'
                                          : 'text-slate-600 hover:bg-slate-50'
                                       }`}
                                 >
                                    <div className="flex items-center gap-3 text-left">
                                       <BookOpen className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`} />
                                       <span className="font-bold leading-tight">{board}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                       {missingInBoard > 0 && (
                                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black animate-pulse ${isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'}`}>
                                             {missingInBoard} !
                                          </span>
                                       )}
                                       {selectedInBoard > 0 && (
                                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white text-[#002147]' : 'bg-[#002147]/10 text-[#002147]'}`}>
                                             {selectedInBoard}
                                          </span>
                                       )}
                                    </div>
                                 </button>
                              );
                           })}
                        </div>
                     </div>

                     {/* Column 2: Classes */}
                     <div className="w-1/4 border-r border-slate-200 flex flex-col bg-white/50">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
                           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Step 2: Grade</h3>
                           {activeBoard && (
                              <button
                                 onClick={() => {
                                    const allBoardItems = getAllItemsForBoard(activeBoard);
                                    const allSelected = allBoardItems.every(i => selectedAssignments.some(a => a.classLevel === i.classLevel && a.subjectName === i.subjectName && a.board === i.board));
                                    if (allSelected) {
                                       setSelectedAssignments(prev => prev.filter(a => a.board !== activeBoard));
                                    } else {
                                       const newItems = allBoardItems.filter(item => !selectedAssignments.some(a => a.classLevel === item.classLevel && a.subjectName === item.subjectName && a.board === item.board));
                                       setSelectedAssignments(prev => [...prev, ...newItems]);
                                    }
                                 }}
                                 className="text-[10px] font-bold text-[#002147] hover:underline"
                              >
                                 Set All
                              </button>
                           )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                           {activeBoard && Object.keys(groupedByBoard[activeBoard] || {}).length > 0 ? (
                              Object.keys(groupedByBoard[activeBoard]).sort((a, b) => {
                                 const numA = parseInt(a.replace(/\D/g, '')) || 0;
                                 const numB = parseInt(b.replace(/\D/g, '')) || 0;
                                 return numA - numB;
                              }).map(level => {
                                 const items = groupedByBoard[activeBoard][level];
                                 const selectedItems = items.filter(i => selectedAssignments.some(a => a.classLevel === i.classLevel && a.subjectName === i.subjectName && a.board === i.board));
                                 const selectedInClass = selectedItems.length;
                                 const missingInClass = selectedItems.filter(i => {
                                    const assignment = selectedAssignments.find(a => a.classLevel === i.classLevel && a.subjectName === i.subjectName && a.board === i.board);
                                    return assignment && (!assignment.pricePerClass || Number(assignment.pricePerClass) <= 0);
                                 }).length;
                                 const isActive = activeClasses.includes(level);
                                 const isEmpty = items.length === 0;

                                 return (
                                    <button
                                       key={level}
                                       onClick={() => {
                                          setActiveClasses(prev =>
                                             prev.includes(level)
                                                ? (prev.length > 1 ? prev.filter(l => l !== level) : prev)
                                                : [...prev, level]
                                          );
                                       }}
                                       className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                             ? 'bg-slate-800 text-white shadow-md'
                                             : 'text-slate-600 hover:bg-white'
                                          }`}
                                    >
                                       <div className="flex items-center gap-3 text-left">
                                          <div className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors ${isActive ? 'bg-[#002147] border-indigo-500' : 'border-slate-300 bg-white'}`}>
                                             {isActive && <CheckCircle className="w-3 h-3 text-white" />}
                                          </div>
                                          <span className={`font-bold leading-tight ${isEmpty ? 'opacity-50' : ''}`}>{level}</span>
                                       </div>
                                       <div className="flex items-center gap-1.5">
                                          {missingInClass > 0 && (
                                             <span className={`px-2 py-0.5 rounded-full text-[9px] font-black animate-pulse ${isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600'}`}>
                                                {missingInClass} !
                                             </span>
                                          )}
                                          {selectedInClass > 0 && (
                                             <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-[#002147] text-white' : 'bg-[#002147]/10 text-[#002147]'}`}>
                                                {selectedInClass}
                                             </span>
                                          )}
                                       </div>
                                    </button>
                                 );
                              })
                           ) : (
                              <div className="p-4 text-center text-slate-400 mt-10">
                                 <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                 <p className="text-[10px] font-bold uppercase tracking-wider">Select a Board</p>
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Column 3: Subjects */}
                     <div className="flex-1 flex flex-col bg-white">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/30">
                           <div className="flex items-center gap-3 px-2">
                              <Search className="w-4 h-4 text-slate-400" />
                              <input
                                 type="text"
                                 placeholder="Search in selected grades..."
                                 value={assignmentSearch}
                                 onChange={(e) => setAssignmentSearch(e.target.value)}
                                 className="bg-transparent border-none outline-none text-sm font-medium w-full text-slate-700"
                              />
                           </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                           {!activeBoard || activeClasses.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 opacity-60">
                                 <BookOpen className="w-12 h-12" />
                                 <p className="font-medium text-center">Check grades in the middle column <br /> to view and assign subjects</p>
                              </div>
                           ) : (
                              <div className="space-y-10">
                                 {activeClasses.map(level => {
                                    const items = groupedByBoard[activeBoard][level] || [];
                                    const filteredItems = items.filter(sub => sub.subjectName.toLowerCase().includes(assignmentSearch.toLowerCase()));

                                    if (filteredItems.length === 0) {
                                       if (assignmentSearch) return null; // Hide the section if it doesn't match search
                                       return (
                                          <div key={level} className="space-y-4 py-8 border-b border-dashed border-slate-200 last:border-0 text-center">
                                             <h4 className="text-xs font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2 justify-center">
                                                <GraduationCap className="w-4 h-4 text-[#002147]" />
                                                {level}
                                             </h4>
                                             <div className="flex flex-col items-center gap-2 opacity-40">
                                                <AlertCircle className="w-6 h-6 text-slate-400" />
                                                <p className="text-xs text-slate-500 font-medium tracking-tight">No subjects added to this grade yet.<br />Please add them in Subject Management.</p>
                                             </div>
                                          </div>
                                       );
                                    }

                                    return (
                                       <div key={level} className="space-y-4">
                                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                             <h4 className="text-xs font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4 text-[#002147]" />
                                                {level}
                                             </h4>
                                             <button
                                                type="button"
                                                onClick={() => {
                                                   const allSelected = items.every(i => selectedAssignments.some(a => a.classLevel === i.classLevel && a.subjectName === i.subjectName && a.board === i.board));
                                                   if (allSelected) {
                                                      setSelectedAssignments(prev => prev.filter(a => !(a.classLevel === level && a.board === activeBoard)));
                                                   } else {
                                                      const newItems = items.filter(item => !selectedAssignments.some(a => a.classLevel === item.classLevel && a.subjectName === item.subjectName && a.board === item.board));
                                                      setSelectedAssignments(prev => [...prev, ...newItems]);
                                                   }
                                                }}
                                                className="text-[10px] font-bold text-[#002147] bg-indigo-50 px-2.5 py-1 rounded-full hover:bg-[#002147]/10 transition-colors"
                                             >
                                                Check All {level}
                                             </button>
                                          </div>
                                          <div className="grid grid-cols-2 gap-3">
                                             {filteredItems.map((item, idx) => {
                                                const isSelected = selectedAssignments.some(a => a.classLevel === item.classLevel && a.subjectName === item.subjectName && a.board === item.board);
                                                return (
                                                   <div
                                                      key={idx}
                                                      className={`group flex flex-col p-4 rounded-2xl border-2 transition-all duration-200 ${isSelected
                                                            ? 'border-indigo-600 bg-[#f16126]/5 shadow-sm'
                                                            : 'border-slate-100 hover:border-slate-200'
                                                         }`}
                                                   >
                                                      <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleAssignment(item)}>
                                                         <div className={`flex items-center gap-3 min-w-0 ${isSelected ? 'text-indigo-700' : 'text-slate-600'}`}>
                                                            <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-[#002147] text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                                                               <BookOpen className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-xs font-bold truncate leading-none mt-0.5">{item.subjectName}</span>
                                                         </div>
                                                         <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected
                                                               ? 'bg-[#002147] border-indigo-600 text-white rotate-0 scale-100'
                                                               : 'border-slate-200 rotate-90 scale-90'
                                                            }`}>
                                                            {isSelected && <CheckCircle className="w-4 h-4" />}
                                                         </div>
                                                      </div>

                                                      {isSelected && (
                                                         <div className="mt-3 pt-3 border-t border-indigo-200/40">
                                                            <div className="flex items-center justify-between mb-1">
                                                               <label className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">Price per class (₹)</label>
                                                               {(Number(selectedAssignments.find(a => a.classLevel === item.classLevel && a.subjectName === item.subjectName && a.board === item.board)?.pricePerClass) || 0) <= 0 && (
                                                                  <span className="text-[9px] font-black text-rose-500 uppercase animate-pulse">Price Required</span>
                                                               )}
                                                            </div>
                                                            <input
                                                               type="number"
                                                               min="0"
                                                               value={selectedAssignments.find(a => a.classLevel === item.classLevel && a.subjectName === item.subjectName && a.board === item.board)?.pricePerClass || 0}
                                                               onChange={(e) => updateAssignmentPrice(item, e.target.value)} onFocus={(e) => e.target.select()}
                                                               className={`w-full bg-white border ${ (Number(selectedAssignments.find(a => a.classLevel === item.classLevel && a.subjectName === item.subjectName && a.board === item.board)?.pricePerClass) || 0) <= 0 ? 'border-rose-500 ring-1 ring-rose-500' : 'border-indigo-200' } rounded p-1.5 text-xs text-slate-800 font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all`}
                                                               onClick={e => e.stopPropagation()}
                                                               placeholder="0"
                                                            />
                                                         </div>
                                                      )}
                                                   </div>
                                                );
                                             })}
                                          </div>
                                       </div>
                                    );
                                 })}

                                 {/* Global No items for search */}
                                 {assignmentSearch && activeClasses.every(level => {
                                    const items = groupedByBoard[activeBoard][level] || [];
                                    return items.filter(sub => sub.subjectName.toLowerCase().includes(assignmentSearch.toLowerCase())).length === 0;
                                 }) && (
                                       <div className="py-12 text-center text-slate-400 space-y-3">
                                          <Search className="w-12 h-12 mx-auto opacity-10" />
                                          <p className="font-medium">No subjects matching "{assignmentSearch}"</p>
                                       </div>
                                    )}
                              </div>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Selection Footer */}
                  <div className="p-6 bg-white border-t border-slate-100 shrink-0 flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Selection</span>
                           <span className="text-xl font-black text-slate-800">{selectedAssignments.length} <span className="text-slate-400 font-medium">Subjects</span></span>
                        </div>
                        <div className="h-10 w-px bg-slate-100" />
                        <div className="flex -space-x-2 overflow-hidden">
                           {selectedAssignments.slice(0, 5).map((a, i) => (
                              <div key={i} className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-[#002147] shrink-0" title={`${a.subjectName} (${a.board})`}>
                                 {a.subjectName.charAt(0)}
                              </div>
                           ))}
                           {selectedAssignments.length > 5 && (
                              <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                                 +{selectedAssignments.length - 5}
                              </div>
                           )}
                        </div>
                     </div>

                     <div className="flex items-center gap-3">
                        <button
                           onClick={() => setShowAssignModal(false)}
                           className="px-6 py-3 font-bold text-slate-500 hover:text-slate-700 transition-colors"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleAssignSubmit}
                           disabled={selectedAssignments.length === 0}
                           className="px-8 py-3 bg-[#002147] text-white rounded-xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-indigo-700 transform active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                           Confirm Assignments
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* DELETE CONFIRMATION MODAL */}
         {showDeleteConfirm && teacherToDelete && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[120] flex items-center justify-center p-4">
               <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
                  <div className="p-6 text-center space-y-4">
                     <div className="w-12 h-12 bg-red-50 text-[#f16126] rounded-full flex items-center justify-center mx-auto">
                        <Trash2 className="w-6 h-6" />
                     </div>
                     <div>
                        <h2 className="text-base font-bold text-slate-800">Remove Teacher?</h2>
                        <p className="text-sm text-slate-500 mt-1">
                           Are you sure you want to remove <span className="font-semibold text-slate-700">{teacherToDelete.name}</span>? This cannot be undone.
                        </p>
                     </div>
                     <div className="flex gap-2 pt-2">
                        <button
                           onClick={() => { setShowDeleteConfirm(false); setTeacherToDelete(null); }}
                           className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-md text-xs font-medium hover:bg-slate-50 transition-colors"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleDelete}
                           className="flex-1 py-1.5 bg-[#f16126] text-white rounded-md text-xs font-medium shadow-sm hover:bg-red-700 transition-colors"
                        >
                           Delete Account
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default TeacherManagement;
