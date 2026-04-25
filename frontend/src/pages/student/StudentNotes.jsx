import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Download,
  BookOpen,
  ArrowRight,
  Zap,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentNotes = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const { data } = await axios.get('/student/all-materials');
        setNotes(data || []);
        setLoading(false);
      } catch (err) {
        console.error('FETCH_FAIL:', err);
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const filteredNotes = notes.filter(n => {
    const query = searchQuery.toLowerCase();
    return (
      n.title?.toLowerCase().includes(query) ||
      n.subjectName?.toLowerCase().includes(query) ||
      n.classLevel?.toLowerCase().includes(query)
    );
  });

  if (loading) return (
    <div className="min-h-screen bg-white p-12 space-y-16 animate-pulse">
       <div className="h-20 bg-slate-50 rounded-full w-48" />
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-50/50 rounded-[40px]" />)}
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-32 p-8 md:p-16 lg:px-24">
      
      {/* 1. MINIMAL HEADER */}
      <div className="max-w-[1400px] mx-auto space-y-12 mb-24 anim-fade">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div className="space-y-2">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic">Faculty Archive</p>
               <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase text-[#002147] leading-none mb-4">
                  STUDY <span className="text-slate-100 not-italic font-light">HUB</span>
               </h1>
               <div className="flex items-center gap-4">
                  <span className="w-12 h-[1px] bg-slate-200" />
                  <p className="text-slate-400 font-bold italic text-sm uppercase tracking-widest leading-none">Curated digital materials for academic excellence.</p>
               </div>
            </div>

            <div className="relative w-full md:w-[400px] group">
               <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#f16126] transition-colors" />
               <input
                  type="text"
                  placeholder="SEARCH MATERIALS..."
                  className="w-full pl-10 pr-4 py-5 bg-transparent border-b border-slate-100 focus:border-[#f16126] focus:outline-none text-[12px] font-black uppercase tracking-widest transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
         </div>
      </div>

      {/* 2. CONTENT AREA */}
      <div className="max-w-[1400px] mx-auto">
         <AnimatePresence mode="popLayout">
           {filteredNotes.length === 0 ? (
             <div className="py-40 text-center space-y-4">
                <BookOpen className="w-16 h-16 text-slate-100 mx-auto" strokeWidth={1} />
                <h3 className="text-sm font-black text-slate-300 uppercase tracking-[0.4em] italic">Archive entry not found.</h3>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-24">
               {filteredNotes.map((note, idx) => (
                 <motion.div
                   layout
                   initial={{ opacity: 0, y: 15 }}
                   animate={{ opacity: 1, y: 0 }}
                   key={note._id || idx}
                   className="flex flex-col h-full group pb-10 border-b border-transparent hover:border-slate-50 transition-all"
                 >
                    {/* TOP INFO - VERY MINIMAL */}
                    <div className="flex items-center justify-between mb-8 opacity-40 group-hover:opacity-100 transition-opacity">
                       <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${note.type?.toLowerCase() === 'note' ? 'bg-indigo-400' : 'bg-[#f16126]'}`} />
                          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#002147] italic">
                             {note.subjectName?.replace(/class/gi, '').trim() || 'General'}
                          </p>
                       </div>
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter tabular-nums italic">Ref {idx + 101}</p>
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="flex-1 space-y-6">
                       <h3 className="text-3xl md:text-5xl font-black text-[#002147] uppercase italic tracking-tighter leading-none transition-colors duration-500 line-clamp-2">
                         {note.title}
                       </h3>
                       <div className="flex items-center gap-6">
                          <button className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity">
                             <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Verified Archive</span>
                          </button>
                          <div className="w-1 h-1 rounded-full bg-slate-200" />
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">{note.type || 'DIGITAL'}</p>
                       </div>
                    </div>

                    {/* ACTION AREA - CLEAN & FLOATING */}
                    <div className="mt-12 flex items-center gap-6">
                       <a
                         href={note.fileUrl}
                         download
                         className="flex-1 py-6 bg-[#002147] text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-[#f16126] transition-all shadow-xl shadow-indigo-900/10 active:scale-95 group/btn overflow-hidden"
                       >
                          Download <Download className="w-4 h-4 group-hover/btn:translate-y-1 transition-transform" />
                       </a>
                       <a
                         href={note.fileUrl}
                         target="_blank"
                         rel="noreferrer"
                         className="w-16 h-16 bg-slate-50 text-[#002147] rounded-[24px] flex items-center justify-center hover:bg-[#002147] hover:text-white transition-all border border-slate-100"
                       >
                         <ArrowRight className="w-6 h-6" />
                       </a>
                    </div>
                 </motion.div>
               ))}
             </div>
           )}
         </AnimatePresence>
      </div>

      {/* 3. MINIMAL FOOTER FOR ISSUES */}
      <div className="mt-40 border-t border-slate-50 pt-20 max-w-[1400px] mx-auto flex flex-col items-center text-center space-y-6 opacity-30 hover:opacity-100 transition-opacity">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Access Restricted To Enrolled Students</p>
         <h4 className="text-2xl font-black italic text-[#002147] tracking-tighter uppercase leading-none">Need Support?</h4>
         <button className="px-10 py-4 border border-slate-200 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#002147] hover:text-white transition-all active:scale-95">Open Support Ledger</button>
      </div>

    </div>
  );
};

export default StudentNotes;
