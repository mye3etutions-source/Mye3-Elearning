import React from 'react';
import { X, FileText, Download, Clock, GraduationCap, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SessionRecapModal = ({ isOpen, onClose, session }) => {
  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-[#002147]/60 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-100"
      >
        {/* Header Section */}
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                 <Calendar className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                 <h2 className="text-xl font-black text-[#002147] tracking-tight truncate uppercase leading-none">{session.title}</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-[#f16126]" /> Delivered by {session.teacherId?.name || 'Faculty'}
                 </p>
              </div>
           </div>
           <button onClick={onClose} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#002147] transition-all shadow-sm shrink-0">
              <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-8 md:p-10 max-h-[70vh] overflow-y-auto">
           <div className="space-y-6">
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">Class Summary</p>
                 <div className="p-5 bg-[#002147] rounded-2xl text-white shadow-xl shadow-navy-100/20">
                    <div className="flex items-center justify-between gap-4 mb-3 pb-3 border-b border-white/10">
                       <span className="text-[9px] font-black uppercase tracking-widest text-[#f16126]">Broadcast Details</span>
                       <span className="text-[9px] font-bold text-white/50">{new Date(session.startTime).toLocaleDateString()} • {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-white font-bold leading-relaxed opacity-90 text-sm">This live session was delivered to <span className="text-[#f16126] font-black">{session.classLevel}</span> students covering <span className="text-[#f16126] font-black">{session.subjectName}</span>.</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 italic">PDF Resources & Notes</p>
                 
                 {session.materials && session.materials.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                       {session.materials.map((mat, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5 transition-all group">
                             <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 bg-white border border-slate-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all shrink-0">
                                   <FileText className="w-6 h-6" />
                                </div>
                                <div className="min-w-0">
                                   <p className="text-sm font-black text-[#002147] truncate uppercase tracking-tight leading-tight">{mat.title}</p>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Ready for download</p>
                                </div>
                             </div>
                             <a 
                               href={mat.fileUrl} 
                               download 
                               className="p-3 bg-slate-900 text-white rounded-xl hover:bg-[#f16126] transition-all shadow-lg active:scale-95"
                             >
                                <Download className="w-4 h-4" />
                             </a>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="py-12 border-2 border-dashed border-slate-100 rounded-2xl text-center space-y-4">
                       <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto shadow-inner text-slate-200">
                          <FileText className="w-6 h-6" />
                       </div>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No materials linked to this session yet.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100">
           <p className="text-[9px] font-black text-slate-400 text-center uppercase tracking-[0.25em] leading-relaxed">
              Mye3 E-learning <span className="text-[#f16126] mx-2">•</span> Expert Live Guidance <span className="text-[#f16126] mx-2">•</span> Anytime Notes
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SessionRecapModal;
