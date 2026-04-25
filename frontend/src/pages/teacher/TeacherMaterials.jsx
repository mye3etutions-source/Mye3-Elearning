import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Upload,
  GraduationCap,
  FileBox,
  Loader2,
  CheckCircle2,
  X,
  FileSearch,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import { usePreview } from '../../context/PreviewContext';

const BOARDS = ['AP Board', 'TS Board', 'CBSE', 'ICSE'];

const TeacherMaterials = () => {
  const { activeView } = usePreview();
  const location = useLocation();
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadMode, setUploadMode] = useState('upload'); // 'upload' or 'link'
  const [selectedFile, setSelectedFile] = useState(null);

  const [activeBoard, setActiveBoard] = useState('AP Board');
  const [expandedClasses, setExpandedClasses] = useState([]);
  const [activeSubjects, setActiveSubjects] = useState({});
  const [modalClassFilter, setModalClassFilter] = useState(null);

  const [formData, setFormData] = useState({
    courseString: '',
    title: '',
    fileUrl: '',
    type: 'notes',
    board: 'AP Board'
  });

  useEffect(() => {
    // When board changes, ensure form data board is also synchronized
    setFormData(prev => ({ ...prev, board: activeBoard }));
  }, [activeBoard]);

  // Handle passed state from MyAssignments
  useEffect(() => {
    if (location.state?.autoOpen && assignments.length > 0) {
      const { assignment } = location.state;
      const matched = assignments.find(a =>
        (a.id === assignment.id) ||
        (a.classLevel === assignment.classLevel && a.subjectName === assignment.subjectName)
      );

      if (matched) {
        setFormData(prev => ({ ...prev, courseString: JSON.stringify(matched) }));
        setShowModal(true);
      }
    }
  }, [location.state, assignments]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, aRes] = await Promise.all([
          axios.get('/teacher/materials'),
          axios.get('/teacher/my-assignments')
        ]);

        setMaterials(mRes.data);

        // Normalize assignments so we treat all assignments as valid subjects
        const normalizedAssignments = aRes.data.map(a => ({
          ...a,
          // Since teacher assignment doesn't dictate board, we allow it for any board
          // The label might be "Maths (Class 10 - All Subjects)" but we just use subjectName
          name: `${a.subjectName} (${a.classLevel})`
        }));

        if (activeView === 'admin' && normalizedAssignments.length === 0) {
          setAssignments([
            { id: 'mock1', name: 'Maths (Class 10)', classLevel: 'Class 10', subjectName: 'Maths', type: 'subject' },
            { id: 'mock2', name: 'Physics (Class 12)', classLevel: 'Class 12', subjectName: 'Physics', type: 'subject' },
          ]);
        } else {
          setAssignments(normalizedAssignments);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [activeView]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseString) return toast.error('Please select a segment');

    try {
      const course = JSON.parse(formData.courseString);

      const submitData = new FormData();
      submitData.append('assignmentId', course.id);
      submitData.append('classLevel', course.classLevel);
      submitData.append('subjectName', course.subjectName);
      submitData.append('title', formData.title);
      submitData.append('type', formData.type);
      submitData.append('board', formData.board);

      if (uploadMode === 'upload' && selectedFile) {
        submitData.append('file', selectedFile);
      } else {
        submitData.append('fileUrl', formData.fileUrl);
      }

      const { data } = await axios.post('/teacher/materials', submitData);

      setMaterials([data.material, ...materials]);

      setIsSuccess(true);
      toast.success('Note added successfully!');

      setTimeout(() => {
        setIsSuccess(false);
        setShowModal(false);
        setModalClassFilter(null);
        setFormData({ courseString: '', title: '', fileUrl: '', type: 'notes', board: activeBoard });
        setSelectedFile(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to add note');
    }
  };

  const handleToggleVisibility = async (id, currentState) => {
    try {
      const { data } = await axios.patch(`/teacher/materials/${id}/visibility`);
      setMaterials(materials.map(m => m._id === id ? { ...m, isVisible: data.isVisible } : m));
      toast.success(data.isVisible ? 'Note is now visible to students' : 'Note hidden from students');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update visibility');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you certain you want to delete this note?')) return;
    try {
      await axios.delete(`/teacher/materials/${id}`);
      setMaterials(materials.filter(m => m._id !== id));
      toast.success('Deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const toggleClass = (lvl) => {
    setExpandedClasses(prev =>
      prev.includes(lvl) ? prev.filter(c => c !== lvl) : [...prev, lvl]
    );
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
    </div>
  );

  // ── PREPARE DATA ──
  // Filter notes by the active board
  const activeBoardMaterials = materials.filter(m => (m.board || 'TS Board') === activeBoard);

  // Show class levels based on teacher's assignments
  const allClassLevels = [...new Set(assignments.map(a => a.classLevel))];

  // Sort descending 
  const sortedClasses = allClassLevels.sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  // Get current user info to distinguish between "My Notes" and "Admin Notes"
  // Assuming we don't have direct req.user ID here, but if material has no teacherId or it's populated but not matching, we know it's not ours.

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20 p-4 font-sans max-w-7xl mx-auto">
      <Toaster position="top-right" />

      {/* ── Header Area ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Study Notes</h1>
          <p className="text-sm font-medium text-slate-500 mt-0.5">Manage professional notes for your assigned segments across different boards.</p>
        </div>
      </div>

      {/* ── Board Tabs ── */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-fit">
        {BOARDS.map(b => (
          <button
            key={b}
            onClick={() => setActiveBoard(b)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${activeBoard === b ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* ── Grouped Content ── */}
      <div className="space-y-4 pt-2 w-full">
        {sortedClasses.length === 0 ? (
          <div className="py-16 bg-white border border-slate-200 rounded-xl text-center space-y-3">
            <FileBox className="w-12 h-12 text-slate-300 mx-auto" />
            <div>
              <p className="text-slate-600 font-bold text-base">No Assignments Found</p>
              <p className="text-slate-400 text-xs mt-1">You are not assigned to any classes yet.</p>
            </div>
          </div>
        ) : sortedClasses.map((classLvl) => {
          const isExpanded = expandedClasses.includes(classLvl);
          const classMats = activeBoardMaterials.filter(m => m.classLevel === classLvl);

          // Get assigned subjects for this class level
          const classSubjects = assignments
                .filter(a => a.classLevel === classLvl)
                .map(a => a.subjectName);

          const availableSubjects = [...new Set([...classSubjects, ...classMats.map(m=>m.subjectName)])];
          const currentSub = activeSubjects[classLvl] || availableSubjects[0];
          const subMats = classMats.filter(m => m.subjectName === currentSub || !currentSub);

          return (
            <div key={classLvl} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
              {/* Accordion Head */}
              <div
                className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors ${isExpanded ? 'border-b border-slate-100 bg-slate-50/50' : ''}`}
              >
                <div
                  onClick={() => toggleClass(classLvl)}
                  className="flex items-center gap-3 flex-1"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isExpanded ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-600'}`}>
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{classLvl}</h3>
                    <p className="text-xs font-semibold text-slate-500">{classMats.length} Items Available</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Quick Add Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const targetAssignment = assignments.find(a => a.classLevel === classLvl && a.type === 'bundle') ||
                        assignments.find(a => a.classLevel === classLvl);
                      setFormData({
                        courseString: targetAssignment ? JSON.stringify(targetAssignment) : '',
                        title: '', fileUrl: '', type: 'notes', board: activeBoard
                      });
                      setModalClassFilter(classLvl);
                      if (!expandedClasses.includes(classLvl)) toggleClass(classLvl);
                      setShowModal(true);
                    }}
                    className="hidden sm:flex px-3 py-1.5 rounded-lg border border-teal-100 bg-teal-50/50 hover:bg-teal-100 text-teal-600 text-[11px] font-bold uppercase tracking-wide transition-all items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Note
                  </button>

                  <div onClick={() => toggleClass(classLvl)} className={`px-3 py-1.5 rounded-md border flex items-center gap-1.5 text-xs font-bold transition-colors ${isExpanded ? 'bg-white border-slate-200 text-slate-700 shadow-sm' : 'bg-transparent border-transparent text-slate-500'}`}>
                    {isExpanded ? 'Hide Notes' : 'View Notes'}
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>
              </div>

              {/* Accordion Body */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-0 border-t border-slate-100">
                      {/* SUBJECT TABS */}
                      {availableSubjects.length > 0 && (
                         <div className="border-b border-slate-100 bg-slate-50/30 overflow-x-auto custom-scrollbar">
                           <div className="flex p-2 gap-1 w-max">
                              {availableSubjects.map(sub => (
                                <button
                                  key={sub}
                                  onClick={() => setActiveSubjects(prev => ({...prev, [classLvl]: sub}))}
                                  className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded-md transition-colors ${currentSub === sub ? 'bg-white text-teal-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-slate-100 border border-transparent'}`}
                                >
                                  {sub}
                                </button>
                              ))}
                           </div>
                         </div>
                      )}

                      {subMats.length === 0 ? (
                        <div className="py-8 bg-slate-50/50 text-center flex flex-col items-center justify-center">
                          <FileBox className="w-8 h-8 text-slate-300 mb-2" />
                          <p className="text-sm font-bold text-slate-600">No notes yet for {currentSub || classLvl}</p>
                          <button
                            onClick={() => {
                              const targetAssignment = assignments.find(a => a.classLevel === classLvl && a.type === 'bundle') ||
                                assignments.find(a => a.classLevel === classLvl);
                              setFormData({
                                courseString: targetAssignment ? JSON.stringify(targetAssignment) : '',
                                title: '', fileUrl: '', type: 'notes', board: activeBoard
                              });
                              setModalClassFilter(classLvl);
                              setShowModal(true);
                            }}
                            className="mt-3 text-xs font-bold text-teal-600 underline hover:text-teal-800"
                          >
                            Upload First Note
                          </button>
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100/80">
                              <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase w-1/4">Subject / Segment</th>
                              <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase">Title</th>
                              <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase hidden md:table-cell">Type</th>
                              <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase hidden sm:table-cell">Date</th>
                              <th className="px-5 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {subMats.map((m, idx) => {
                              const isAdminMaterial = !m.teacherId;
                              return (
                                <tr key={m._id} className={`border-b border-slate-50 last:border-b-0 group transition-colors ${m.isVisible === false ? 'bg-slate-50/60 opacity-60' : 'hover:bg-slate-50/50'}`}>
                                  <td className="px-5 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold rounded-md whitespace-nowrap">
                                      <BookOpen className="w-3 h-3 opacity-70" />
                                      {m.subjectName}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4">
                                    <div className="text-sm font-bold text-slate-800 line-clamp-1 flex items-center gap-2">
                                      {m.title}
                                    </div>
                                    <div className="text-[10px] font-semibold text-slate-400 mt-0.5 flex flex-wrap gap-2 items-center">
                                      {isAdminMaterial ? (
                                        <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Global Admin</span>
                                      ) : (
                                        <span className="text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">My Note ({m.teacherId?.name || 'Me'})</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-5 py-4 hidden md:table-cell">
                                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wide">
                                      {m.type}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 hidden sm:table-cell">
                                    <span className="text-xs font-semibold text-slate-500">
                                      {new Date(m.createdAt).toLocaleDateString('en-GB')}
                                    </span>
                                  </td>
                                  <td className="px-5 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {/* VISIBILITY TOGGLE */}
                                      <button
                                        onClick={() => handleToggleVisibility(m._id, m.isVisible)}
                                        className={`p-2 rounded-lg transition-colors flex items-center justify-center shadow-sm ${m.isVisible === false
                                          ? 'text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white opacity-100'
                                          : 'text-slate-500 bg-slate-50 hover:bg-slate-200 opacity-0 group-hover:opacity-100'
                                          }`}
                                        title={m.isVisible === false ? 'Show to students' : 'Hide from students'}
                                      >
                                        {m.isVisible === false ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                      </button>
                                      <a
                                        href={m.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-600 hover:text-white transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm"
                                        title="Download / View"
                                      >
                                        <Download className="w-4 h-4" />
                                      </a>
                                      {/* DELETE ONLY OWN NOTES */}
                                      {!isAdminMaterial && (
                                        <button
                                          onClick={() => handleDelete(m._id)}
                                          className="p-2 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-600 hover:text-white transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm"
                                          title="Delete Material"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── UPLOAD MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowModal(false); setModalClassFilter(null); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border border-slate-100"
            >
              <div className="p-5 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-base font-bold text-slate-800">Upload Note</h2>
                      <span className="px-2 py-0.5 bg-teal-50 border border-teal-100 text-teal-700 text-[10px] font-black rounded-full uppercase tracking-wide">
                        {formData.board}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Material will be shared to your students in {formData.board}.</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-10 flex flex-col items-center justify-center space-y-3"
                    >
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">Uploaded Successfully!</h3>
                      <p className="text-xs text-slate-400 font-medium">Saved to {formData.board}</p>
                    </motion.div>
                  ) : (
                    <>
                      {/* TARGET CLASS / SUBJECT */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                          <GraduationCap className="w-3 h-3 text-teal-500" /> Class / Subject
                        </label>
                        <select
                          required
                          value={formData.courseString}
                          onChange={(e) => setFormData({ ...formData, courseString: e.target.value })}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-50 rounded-xl outline-none font-semibold text-slate-800 text-sm appearance-none cursor-pointer transition-all"
                        >
                          <option value="" disabled>Select a subject...</option>
                          {assignments
                            .filter(a => !modalClassFilter || a.classLevel === modalClassFilter)
                            .map((a, idx) => (
                              <option key={idx} value={JSON.stringify(a)}>
                                {a.name}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* TITLE */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                          <FileSearch className="w-3 h-3 text-teal-500" /> Note Title
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Chapter 3: Motion in a Straight Line"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-3 py-2.5 bg-white border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-50 rounded-xl outline-none font-semibold text-slate-800 text-sm transition-all"
                        />
                      </div>

                      {/* FILE SOURCE */}
                      <div className="space-y-2.5 bg-slate-50 border border-slate-100 rounded-xl p-3">
                        <div className="flex p-0.5 bg-white border border-slate-200 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setUploadMode('upload')}
                            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${uploadMode === 'upload' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            Upload PDF
                          </button>
                          <button
                            type="button"
                            onClick={() => setUploadMode('link')}
                            className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${uploadMode === 'link' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                          >
                            Paste Link
                          </button>
                        </div>

                        {uploadMode === 'upload' ? (
                          <div className="relative group">
                            <input
                              required={uploadMode === 'upload' && !selectedFile}
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => setSelectedFile(e.target.files[0])}
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <div className={`w-full px-4 py-5 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center gap-2 ${selectedFile ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 bg-white group-hover:border-teal-400'}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedFile ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {selectedFile ? <CheckCircle2 className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                              </div>
                              <p className="text-sm font-bold text-slate-700 text-center">
                                {selectedFile ? selectedFile.name : 'Click to select PDF'}
                              </p>
                              {!selectedFile && <p className="text-xs text-slate-400 font-medium">PDF files only</p>}
                            </div>
                          </div>
                        ) : (
                          <input
                            required={uploadMode === 'link'}
                            type="url"
                            placeholder="https://drive.google.com/file/..."
                            value={formData.fileUrl}
                            onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 focus:border-teal-500 focus:ring-4 focus:ring-teal-50 rounded-xl outline-none font-semibold text-slate-800 text-sm transition-all"
                          />
                        )}
                      </div>

                      {/* SUBMIT */}
                      <button type="submit" className="w-full py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm shadow-teal-200">
                        <Upload className="w-4 h-4" /> Save Note
                      </button>
                    </>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherMaterials;
