import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  History, 
  FileText, 
  Upload, 
  Trash2, 
  Loader2, 
  Calendar, 
  Clock,
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const PastSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeSession, setActiveSession] = useState(null); // For the upload side panel

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data } = await axios.get('/teacher/live-sessions');
      // Filter for ended sessions only
      setSessions(data.filter(s => s.status === 'ended'));
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load past sessions');
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, session) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', `${session.title} - Notes`);
    formData.append('classLevel', session.classLevel);
    formData.append('subjectName', session.subjectName);
    formData.append('assignmentId', session.subjectId || session.classLevel);
    formData.append('sessionId', session._id);
    formData.append('type', 'notes');

    setUploading(true);
    try {
      await axios.post('/teacher/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Notes uploaded successfully!');
      fetchSessions(); // Refresh to see new materials if we were showing them
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await axios.delete(`/teacher/materials/${id}`);
      toast.success('Deleted');
      fetchSessions();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 p-4 md:p-8 pb-20">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
               <History className="w-8 h-8 md:w-10 md:h-10 text-teal-600" /> Past Sessions
            </h1>
            <p className="text-slate-500 font-bold italic text-sm md:text-base">Manage resources and notes for your completed classes</p>
         </div>
         <div className="px-6 py-3 bg-teal-50 border border-teal-100 rounded-2xl">
            <span className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Total Archive</span>
            <p className="text-xl font-black text-slate-900">{sessions.length} Classes</p>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
         {sessions.length === 0 ? (
           <div className="py-24 bg-white rounded-[32px] border-2 border-dashed border-slate-100 text-center space-y-4 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto">
                 <History className="w-10 h-10 text-slate-200" />
              </div>
              <p className="text-slate-400 font-black text-sm uppercase tracking-widest">No completed sessions in your archive yet</p>
           </div>
         ) : sessions.map((session) => (
           <div key={session._id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 transition-all overflow-hidden group">
              <div className="p-6 md:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                 
                 <div className="flex items-start gap-6 md:gap-8 min-w-0 flex-1">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 text-white rounded-3xl flex flex-col items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                       <span className="text-[8px] font-black uppercase tracking-widest opacity-50">Ended</span>
                       <Calendar className="w-6 h-6 md:w-8 md:h-8 mt-1" />
                    </div>
                    <div className="space-y-2 min-w-0">
                       <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{session.subjectName}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-400 font-bold text-xs">{new Date(session.startTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                       </div>
                       <h3 className="text-xl md:text-2xl font-black text-slate-900 truncate uppercase tracking-tight">{session.title}</h3>
                       <p className="text-slate-400 font-bold flex items-center gap-2 text-xs md:text-sm italic">
                          <Clock className="w-4 h-4" /> Delivered to {session.classLevel}
                       </p>
                    </div>
                 </div>

                 <div className="flex flex-wrap items-center gap-4 shrink-0">
                    {/* Notes Management Section */}
                    <div className="flex flex-col gap-4 w-full sm:w-auto">
                       <label className="relative cursor-pointer group/label">
                          <input 
                            type="file" 
                            className="hidden" 
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => handleFileUpload(e, session)}
                            disabled={uploading}
                          />
                          <div className={`px-8 py-4 ${uploading ? 'bg-slate-100' : 'bg-slate-900'} text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-teal-600 active:scale-95 transition-all flex items-center justify-center gap-3`}>
                             {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} 
                             Upload Class Notes
                          </div>
                       </label>
                    </div>
                 </div>
              </div>
              
              {/* Materials list for this session (Optional: fetch dynamically if needed, but let's assume we can fetch by sessionId) */}
              <MaterialsList session={session} onDelete={handleDeleteMaterial} />
           </div>
         ))}
      </div>
    </div>
  );
};

// Helper component to list materials specifically for a session
const MaterialsList = ({ session, onDelete }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, [session]);

  const fetchMaterials = async () => {
    try {
      // We need a way to filter materials by sessionId
      // I've already updated the teacherController.getMaterials to allow filtering? No, but I can filter here or add an endpoint.
      // For now, I'll use the general list and filter client-side (not ideal for large data but works for now)
      const { data } = await axios.get('/teacher/materials');
      setMaterials(data.filter(m => m.sessionId === session._id));
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (materials.length === 0) return null;

  return (
    <div className="px-6 md:px-10 pb-8 pt-2 bg-slate-50/50 border-t border-slate-50">
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Linked Resources</p>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((mat) => (
            <div key={mat._id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group/item hover:border-teal-200 transition-all shadow-sm">
               <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                     <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                     <p className="text-xs font-black text-slate-900 truncate uppercase">{mat.title}</p>
                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">PDF Artifact</p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <a href={mat.fileUrl} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-teal-600 transition-all">
                     <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => onDelete(mat._id)} className="p-2 text-slate-400 hover:text-rose-600 transition-all">
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};

export default PastSessions;
