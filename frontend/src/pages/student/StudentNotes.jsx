import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Download,
  BookOpen,
  ArrowRight
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
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-6 animate-pulse">
       <div className="h-16 bg-slate-200 rounded-lg w-48" />
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-200 rounded-xl" />)}
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 p-4 md:p-6 lg:px-8">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
               <BookOpen className="w-6 h-6" />
            </div>
            <div>
               <h1 className="text-xl md:text-2xl font-bold text-slate-800">Notes & Materials</h1>
               <p className="text-sm text-slate-500 mt-1">Access your class notes and PDFs.</p>
            </div>
         </div>

         <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
               type="text"
               placeholder="Search materials..."
               className="w-full pl-9 pr-4 py-2.5 bg-slate-100 rounded-lg border border-transparent focus:border-indigo-300 focus:bg-white focus:outline-none text-sm transition-colors"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
      </div>

      {/* CONTENT AREA */}
      <div>
         <AnimatePresence mode="popLayout">
           {filteredNotes.length === 0 ? (
             <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm space-y-4">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" strokeWidth={1} />
                <h3 className="text-sm font-semibold text-slate-500">No materials found.</h3>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {filteredNotes.map((note, idx) => (
                 <motion.div
                   layout
                   initial={{ opacity: 0, y: 15 }}
                   animate={{ opacity: 1, y: 0 }}
                   key={note._id || idx}
                   className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group"
                 >
                    {/* TOP INFO */}
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-600">
                             {note.subjectName?.replace(/class/gi, '').trim() || 'General'}
                          </p>
                       </div>
                    </div>

                    {/* MAIN CONTENT */}
                    <div className="flex-1 space-y-3 mb-6">
                       <h3 className="text-lg font-bold text-slate-800 leading-snug line-clamp-2">
                         {note.title}
                       </h3>
                       <div className="flex items-center gap-4">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase">{note.type || 'DIGITAL'}</p>
                       </div>
                    </div>

                    {/* ACTION AREA */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                       <a
                         href={note.fileUrl}
                         download
                         className="flex-1 py-2.5 bg-slate-900 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors"
                       >
                          Download <Download className="w-4 h-4" />
                       </a>
                       <a
                         href={note.fileUrl}
                         target="_blank"
                         rel="noreferrer"
                         className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors"
                       >
                         <ArrowRight className="w-4 h-4" />
                       </a>
                    </div>
                 </motion.div>
               ))}
             </div>
           )}
         </AnimatePresence>
      </div>

    </div>
  );
};

export default StudentNotes;
