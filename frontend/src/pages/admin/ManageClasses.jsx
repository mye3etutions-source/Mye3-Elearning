import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Save, X, BookOpen, IndianRupee, Loader2, Settings, Upload, PlusCircle, Trash2, ExternalLink, FileText, ChevronRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ManageClasses = () => {
   const [classes, setClasses] = useState([]);
   const [loading, setLoading] = useState(true);
   const [editingId, setEditingId] = useState(null);
   const [newPricing, setNewPricing] = useState({ oneMonth: 0, threeMonths: 0, sixMonths: 0, twelveMonths: 0 });
   const [newBoard, setNewBoard] = useState('TS Board');

   // Manage Modal States
   const [isManageModalOpen, setIsManageModalOpen] = useState(false);
   const [selectedClass, setSelectedClass] = useState(null);
   const [activeTab, setActiveTab] = useState('subjects');
   const [newSubject, setNewSubject] = useState('');
   const [noteForm, setNoteForm] = useState({ subjectName: '', title: '' });
   const [selectedFile, setSelectedFile] = useState(null);
   const [materials, setMaterials] = useState([]);
   const [uploading, setUploading] = useState(false);
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [addClassForm, setAddClassForm] = useState({
      className: '',
      board: 'TS Board',
      pricing: { oneMonth: 0, threeMonths: 0, sixMonths: 0, twelveMonths: 0 }
   });

   const fetchClasses = async () => {
      try {
         const { data } = await axios.get('/admin/classes');
         setClasses(data);
         setLoading(false);
      } catch (error) {
         toast.error('Failed to fetch class bundles');
         setLoading(false);
      }
   };

   const fetchMaterials = async (classId) => {
      try {
         const { data } = await axios.get(`/admin/materials/${classId}`);
         setMaterials(data);
      } catch (error) {
         toast.error('Failed to load study materials');
      }
   };

   useEffect(() => {
      fetchClasses();
   }, []);

   const handleEdit = (id, currentPricing, currentBoard) => {
      setEditingId(id);
      setNewPricing(currentPricing || { oneMonth: 0, threeMonths: 0, sixMonths: 0, twelveMonths: 0 });
      setNewBoard(currentBoard || 'TS Board');
   };

   const handleSavePrice = async (id) => {
      try {
         await axios.put(`/admin/classes/${id}`, { pricing: newPricing, board: newBoard });
         toast.success('Bundle updated successfully!');
         setEditingId(null);
         fetchClasses();
      } catch (error) {
         toast.error('Update failed');
      }
   };

   const openManageModal = (cls) => {
      setSelectedClass(cls);
      setIsManageModalOpen(true);
      setActiveTab('subjects');
      fetchMaterials(cls._id);
      setNoteForm({ subjectName: cls.subjects[0] || '', title: '', fileUrl: '' });
   };

   // Subjects Logic
   const handleAddSubject = async () => {
      if (!newSubject.trim()) return;
      const updatedSubjects = [...selectedClass.subjects, newSubject.trim()];
      try {
         const { data } = await axios.put(`/admin/classes/${selectedClass._id}/subjects`, { subjects: updatedSubjects });
         setSelectedClass(data);
         setNewSubject('');
         toast.success(`${newSubject} added to the bundle!`);
         fetchClasses();
      } catch (error) {
         toast.error('Failed to add subject');
      }
   };

   const handleRemoveSubject = async (subjectToRemove) => {
      const updatedSubjects = selectedClass.subjects.filter(s => s !== subjectToRemove);
      try {
         const { data } = await axios.put(`/admin/classes/${selectedClass._id}/subjects`, { subjects: updatedSubjects });
         setSelectedClass(data);
         toast.success('Subject removed');
         fetchClasses();
      } catch (error) {
         toast.error('Failed to remove subject');
      }
   };

   // Materials Logic
   const handleUploadNote = async (e) => {
      e.preventDefault();
      if (!selectedFile) return toast.error('Please select a PDF file');

      setUploading(true);
      const formData = new FormData();
      formData.append('classId', selectedClass._id);
      formData.append('subjectName', noteForm.subjectName);
      formData.append('title', noteForm.title);
      formData.append('file', selectedFile);

      try {
         await axios.post('/admin/materials', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
         });
         toast.success('Material uploaded successfully!');
         fetchMaterials(selectedClass._id);
         setNoteForm({ ...noteForm, title: '' });
         setSelectedFile(null);
         // Reset file input
         const fileInput = document.getElementById('file-upload');
         if (fileInput) fileInput.value = '';
      } catch (error) {
         toast.error(error.response?.data?.message || 'Upload failed');
      } finally {
         setUploading(false);
      }
   };

   const handleAddClass = async (e) => {
      e.preventDefault();
      try {
         await axios.post('/admin/classes', addClassForm);
         toast.success(`${addClassForm.className} created successfully!`);
         setIsAddModalOpen(false);
         setAddClassForm({
            className: '',
            board: 'TS Board',
            pricing: { oneMonth: 0, threeMonths: 0, sixMonths: 0, twelveMonths: 0 }
         });
         fetchClasses();
      } catch (error) {
         toast.error(error.response?.data?.message || 'Failed to create class');
      }
   };

   if (loading) return (
      <div className="flex h-[60vh] items-center justify-center">
         <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
   );

   return (
      <div className="space-y-10">
         <Toaster position="top-right" />

         <div className="flex items-center justify-between">
            <div className="space-y-1">
               <h1 className="text-3xl font-black text-slate-900">Class 6-10 Management</h1>
               <p className="text-slate-500 font-bold">Configure bundle contents and study materials</p>
            </div>
            <button
               onClick={() => setIsAddModalOpen(true)}
               className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
            >
               <PlusCircle className="w-5 h-5" /> Add New Class
            </button>
         </div>

         <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr className="text-xs font-black uppercase text-slate-400 tracking-[0.2em]">
                     <th className="px-8 py-6">Grade / Bundle Name</th>
                     <th className="px-8 py-6">Board & Pricing</th>
                     <th className="px-8 py-6">Status</th>
                     <th className="px-8 py-6 text-right">Operational Controls</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {classes.map((cls) => (
                     <tr key={cls._id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-lg">
                                 {cls.className.split(' ')[1]}
                              </div>
                              <div>
                                 <p className="font-black text-slate-900">{cls.className}</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cls.subjects.length} Subjects Included</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           {editingId === cls._id ? (
                              <div className="flex flex-col gap-2">
                                 <select
                                    value={newBoard}
                                    onChange={(e) => setNewBoard(e.target.value)}
                                    className="w-full px-3 py-1 bg-slate-50 border-2 border-indigo-600 rounded-lg text-sm font-bold outline-none"
                                 >
                                    <option value="TS Board">TS Board</option>
                                    <option value="AP Board">AP Board</option>
                                    <option value="CBSE">CBSE</option>
                                    <option value="ICSE">ICSE</option>
                                 </select>
                                 <div className="grid grid-cols-2 gap-1">
                                    <input type="number" placeholder="1mo" value={newPricing.oneMonth} onChange={e => setNewPricing({ ...newPricing, oneMonth: e.target.value })} className="w-16 px-1 py-1 text-xs border rounded" />
                                    <input type="number" placeholder="3mo" value={newPricing.threeMonths} onChange={e => setNewPricing({ ...newPricing, threeMonths: e.target.value })} className="w-16 px-1 py-1 text-xs border rounded" />
                                    <input type="number" placeholder="6mo" value={newPricing.sixMonths} onChange={e => setNewPricing({ ...newPricing, sixMonths: e.target.value })} className="w-16 px-1 py-1 text-xs border rounded" />
                                    <input type="number" placeholder="12mo" value={newPricing.twelveMonths} onChange={e => setNewPricing({ ...newPricing, twelveMonths: e.target.value })} className="w-16 px-1 py-1 text-xs border rounded" />
                                 </div>
                                 <button onClick={() => handleSavePrice(cls._id)} className="w-full mt-1 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold"><Save className="w-3 h-3 inline mr-1" />Save</button>
                              </div>
                           ) : (
                              <div className="flex flex-col gap-1 text-xs text-slate-600">
                                 <span className="font-extrabold text-indigo-600 text-sm mb-1">{cls.board || 'N/A'}</span>
                                 <div className="flex justify-between w-32"><span>1 mo:</span> <b>₹{cls.pricing?.oneMonth || 0}</b></div>
                                 <div className="flex justify-between w-32"><span>3 mo:</span> <b>₹{cls.pricing?.threeMonths || 0}</b></div>
                                 <div className="flex justify-between w-32"><span>6 mo:</span> <b>₹{cls.pricing?.sixMonths || 0}</b></div>
                                 <div className="flex justify-between w-32"><span>12 mo:</span> <b>₹{cls.pricing?.twelveMonths || 0}</b></div>
                              </div>
                           )}
                        </td>
                        <td className="px-8 py-6">
                           <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-wider">Active</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex items-center justify-end gap-3">
                              <button
                                 onClick={() => handleEdit(cls._id, cls.pricing, cls.board)}
                                 className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all"
                              >
                                 <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                 onClick={() => openManageModal(cls)}
                                 className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-indigo-100"
                              >
                                 <Settings className="w-4 h-4" /> Manage Bundle
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* MANAGE MODAL */}
         {isManageModalOpen && selectedClass && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
               <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsManageModalOpen(false)}></div>
               <div className="relative bg-white rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-300">

                  {/* Modal Header */}
                  <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl">
                           {selectedClass.className.split(' ')[1]}
                        </div>
                        <div>
                           <h2 className="text-2xl font-black text-slate-900">Configuring {selectedClass.className}</h2>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Master Control Panel</p>
                        </div>
                     </div>
                     <button onClick={() => setIsManageModalOpen(false)} className="p-3 text-slate-300 hover:text-slate-900 transition-all">
                        <X className="w-8 h-8" />
                     </button>
                  </div>

                  {/* Tab Switcher */}
                  <div className="flex border-b border-slate-50 px-8">
                     <button
                        onClick={() => setActiveTab('subjects')}
                        className={`px-8 py-5 font-black text-sm uppercase tracking-widest transition-all relative ${activeTab === 'subjects' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                        Subject List
                        {activeTab === 'subjects' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600"></div>}
                     </button>
                     <button
                        onClick={() => setActiveTab('notes')}
                        className={`px-8 py-5 font-black text-sm uppercase tracking-widest transition-all relative ${activeTab === 'notes' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                     >
                        Study Materials
                        {activeTab === 'notes' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600"></div>}
                     </button>
                  </div>

                  {/* Modal Body */}
                  <div className="flex-1 overflow-y-auto p-10">
                     {activeTab === 'subjects' ? (
                        <div className="space-y-10">
                           <div className="space-y-4">
                              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Add New Subject</h3>
                              <div className="flex gap-4">
                                 <input
                                    type="text"
                                    value={newSubject}
                                    onChange={(e) => setNewSubject(e.target.value)}
                                    placeholder="e.g. Computer Science"
                                    className="flex-1 px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-bold text-slate-900 transition-all"
                                 />
                                 <button
                                    onClick={handleAddSubject}
                                    className="px-8 bg-indigo-600 text-white rounded-2xl font-black flex items-center gap-2"
                                 >
                                    <PlusCircle className="w-5 h-5" /> Add
                                 </button>
                              </div>
                           </div>

                           <div className="space-y-4">
                              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Configured Subjects</h3>
                              <div className="flex flex-wrap gap-3">
                                 {selectedClass.subjects.map((sub, i) => (
                                    <div key={i} className="flex items-center gap-3 px-5 py-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100 font-black group">
                                       {sub}
                                       <button
                                          onClick={() => handleRemoveSubject(sub)}
                                          className="p-1 hover:bg-indigo-100 rounded-full transition-all"
                                       >
                                          <X className="w-4 h-4" />
                                       </button>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           {/* Upload Form */}
                           <form onSubmit={handleUploadNote} className="space-y-6">
                              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Upload PDF Notes</h3>

                              <div className="space-y-2">
                                 <label className="text-xs font-black text-slate-900 ml-1">Subject</label>
                                 <select
                                    value={noteForm.subjectName}
                                    onChange={(e) => setNoteForm({ ...noteForm, subjectName: e.target.value })}
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-bold"
                                 >
                                    {selectedClass.subjects.map((s, i) => (
                                       <option key={i} value={s}>{s}</option>
                                    ))}
                                 </select>
                              </div>

                              <div className="space-y-2">
                                 <label className="text-xs font-black text-slate-900 ml-1">Note Title</label>
                                 <input
                                    required
                                    value={noteForm.title}
                                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                    placeholder="e.g. Newton Laws of Motion"
                                    className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-bold"
                                 />
                              </div>

                              <div className="space-y-2">
                                 <label className="text-xs font-black text-slate-900 ml-1">Select PDF Resource</label>
                                 <div className="relative group">
                                    <input
                                       id="file-upload"
                                       required
                                       type="file"
                                       accept=".pdf"
                                       onChange={(e) => setSelectedFile(e.target.files[0])}
                                       className="w-full px-5 py-8 bg-indigo-50/50 border-2 border-dashed border-indigo-200 hover:border-indigo-600 rounded-3xl outline-none font-bold text-slate-400 file:hidden cursor-pointer transition-all text-center"
                                    />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none group-hover:text-indigo-600">
                                       {selectedFile ? (
                                          <span className="text-indigo-600 font-black">{selectedFile.name}</span>
                                       ) : (
                                          <>
                                             <Upload className="w-6 h-6 mb-1 opacity-40 group-hover:opacity-100" />
                                             <span className="text-[10px] font-black uppercase tracking-widest">Click to browse system files</span>
                                          </>
                                       )}
                                    </div>
                                 </div>
                              </div>

                              <button
                                 disabled={uploading}
                                 type="submit"
                                 className={`w-full py-4 bg-indigo-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] shadow-lg shadow-indigo-100'}`}
                              >
                                 {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                 {uploading ? 'Processing File...' : 'Upload Material'}
                              </button>
                           </form>

                           {/* Material List */}
                           <div className="space-y-6 border-l border-slate-50 pl-10">
                              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Class Repository</h3>
                              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
                                 {materials.length === 0 ? (
                                    <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 italic font-bold text-slate-300">
                                       No materials uploaded yet
                                    </div>
                                 ) : materials.map((m, i) => (
                                    <div key={i} className="p-5 bg-white border border-slate-100 rounded-3xl flex items-center justify-between hover:shadow-lg hover:shadow-slate-100 transition-all">
                                       <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                                             <FileText className="w-5 h-5" />
                                          </div>
                                          <div>
                                             <p className="font-black text-slate-900 text-sm leading-tight">{m.title}</p>
                                             <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{m.subjectName}</p>
                                          </div>
                                       </div>
                                       <a href={m.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-300 hover:text-indigo-600 transition-all">
                                          <ExternalLink className="w-5 h-5" />
                                       </a>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}
         {/* ADD CLASS MODAL */}
         {isAddModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
               <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)}></div>
               <div className="relative bg-white rounded-[40px] w-full max-w-xl shadow-2xl animate-in fade-in zoom-in duration-300">
                  <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                     <h2 className="text-2xl font-black text-slate-900">Create New Class</h2>
                     <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900"><X className="w-8 h-8" /></button>
                  </div>
                  <form onSubmit={handleAddClass} className="p-8 space-y-6">
                     <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Class Name</label>
                        <input
                           required
                           type="text"
                           placeholder="e.g. Class 10"
                           value={addClassForm.className}
                           onChange={(e) => setAddClassForm({ ...addClassForm, className: e.target.value })}
                           className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-bold"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Education Board</label>
                        <select
                           value={addClassForm.board}
                           onChange={(e) => setAddClassForm({ ...addClassForm, board: e.target.value })}
                           className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-bold"
                        >
                           <option value="TS Board">TS Board</option>
                           <option value="AP Board">AP Board</option>
                           <option value="CBSE">CBSE</option>
                           <option value="ICSE">ICSE</option>
                        </select>
                     </div>
                     <div className="space-y-3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Tiered Pricing (₹)</label>
                        <div className="grid grid-cols-2 gap-4">
                           <input type="number" placeholder="1 Month" required value={addClassForm.pricing.oneMonth} onChange={e => setAddClassForm({ ...addClassForm, pricing: { ...addClassForm.pricing, oneMonth: e.target.value } })} className="px-5 py-3 border rounded-xl font-bold" />
                           <input type="number" placeholder="3 Months" required value={addClassForm.pricing.threeMonths} onChange={e => setAddClassForm({ ...addClassForm, pricing: { ...addClassForm.pricing, threeMonths: e.target.value } })} className="px-5 py-3 border rounded-xl font-bold" />
                           <input type="number" placeholder="6 Months" required value={addClassForm.pricing.sixMonths} onChange={e => setAddClassForm({ ...addClassForm, pricing: { ...addClassForm.pricing, sixMonths: e.target.value } })} className="px-5 py-3 border rounded-xl font-bold" />
                           <input type="number" placeholder="12 Months" required value={addClassForm.pricing.twelveMonths} onChange={e => setAddClassForm({ ...addClassForm, pricing: { ...addClassForm.pricing, twelveMonths: e.target.value } })} className="px-5 py-3 border rounded-xl font-bold" />
                        </div>
                     </div>
                     <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 mt-4">Create Class Bundle</button>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
};

export default ManageClasses;
