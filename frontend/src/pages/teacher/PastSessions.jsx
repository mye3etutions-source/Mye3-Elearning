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
  const [allMaterials, setAllMaterials] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const [sessionsRes, materialsRes, personalRes] = await Promise.all([
        axios.get('/teacher/live-sessions'),
        axios.get('/teacher/materials'),
        axios.get('/teacher/personal-sessions')
      ]);
      
      const endedRegular = sessionsRes.data.filter(s => s.status === 'ended');
      
      const endedPersonalSlots = [];
      (personalRes.data || []).forEach(session => {
        (session.scheduledSlots || []).forEach(slot => {
          if (slot.status === 'completed' || slot.status === 'ended') {
            endedPersonalSlots.push({
              _id: slot._id,
              isPersonal: true,
              subjectName: session.subjectName,
              classLevel: '1-on-1',
              title: `${session.studentId?.name || 'Student'} - Personal Class`,
              startTime: slot.startTime,
              endTime: slot.endTime,
              platform: slot.platform,
              status: 'ended'
            });
          }
        });
      });

      const combinedSessions = [...endedRegular, ...endedPersonalSlots].sort(
        (a, b) => new Date(b.startTime) - new Date(a.startTime)
      );

      setSessions(combinedSessions);
      setAllMaterials(materialsRes.data || []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load past sessions data');
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
    <div className="space-y-6 animate-in fade-in duration-500 p-4 md:p-8 pb-20 max-w-7xl mx-auto">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
         <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
               <History className="w-8 h-8 text-[#002147]" /> Past Sessions
            </h1>
            <p className="text-slate-500 font-bold text-sm">Manage resources and notes for your completed classes</p>
         </div>
         <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
               <Calendar className="w-5 h-5" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Archive Size</p>
               <p className="text-lg font-black text-slate-900 leading-none">{sessions.length} Classes</p>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Class Details</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date & Time</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Session Title</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Resources</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <History className="w-12 h-12" />
                      <p className="text-xs font-black uppercase tracking-widest">Your archive is empty</p>
                    </div>
                  </td>
                </tr>
              ) : sessions.map((session) => (
                <tr key={session._id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black uppercase tracking-widest w-fit">
                        {session.subjectName}
                      </span>
                      <span className="text-sm font-bold text-slate-700">Class {session.classLevel}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-[#002147] italic">
                        {new Date(session.startTime).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                        {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">{session.title}</p>
                    <p className="text-[10px] font-medium text-slate-400 truncate max-w-[200px] italic">Session Completed</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end gap-3">
                      <MaterialsList session={session} allMaterials={allMaterials} onDelete={handleDeleteMaterial} />
                      
                      <label className="relative cursor-pointer">
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => handleFileUpload(e, session)}
                          disabled={uploading}
                        />
                        <div className={`flex items-center gap-2 px-4 py-2 ${uploading ? 'bg-slate-100' : 'bg-[#002147]'} text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md hover:bg-[#f16126] transition-all`}>
                           {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} 
                           Add Notes
                        </div>
                      </label>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const MaterialsList = ({ session, allMaterials, onDelete }) => {
  const materials = allMaterials.filter(m => m.sessionId === session._id);

  if (materials.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {materials.map((mat) => (
        <div key={mat._id} className="group/item relative">
          <div className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg group-hover:border-indigo-200 transition-all">
            <FileText className="w-3 h-3 text-indigo-500" />
            <span className="text-[9px] font-bold text-slate-600 uppercase truncate max-w-[80px]">{mat.title}</span>
            <div className="flex items-center gap-0.5 border-l border-slate-200 ml-1 pl-1">
              <a href={mat.fileUrl} target="_blank" rel="noreferrer" className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
                <ExternalLink className="w-3 h-3" />
              </a>
              <button onClick={() => onDelete(mat._id)} className="p-1 text-slate-400 hover:text-rose-600 transition-colors">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PastSessions;
