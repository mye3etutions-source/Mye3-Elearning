import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, 
  ChevronRight, 
  Loader2, 
  FileText, 
  MonitorPlay,
  ArrowLeft,
  Download,
  GraduationCap,
  Zap,
  Radio,
  Clock,
  Video,
  Calendar,
  UserCircle
} from 'lucide-react';
import { useParams, Link } from 'react-router-dom';

const StudentCourseContent = () => {
  const { courseName } = useParams();
  const [content, setContent] = useState({ materials: [] });
  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentRes, liveRes] = await Promise.all([
          axios.get(`/student/content/${courseName}`),
          axios.get('/student/live-alerts')
        ]);
        
        setContent(contentRes.data);
        
        // Filter ALL sessions (live AND upcoming) for this specific course
        const cleanName = courseName
          .replace(' (Full Course)', '')
          .replace(' (All Subjects)', '')
          .replace(' (Full Bundle)', '');

        const relevantSessions = liveRes.data.filter(s => 
          (s.classLevel === cleanName || s.subjectName === cleanName || 
          s.classLevel === courseName || s.subjectName === courseName) &&
          (s.status === 'live' || s.status === 'upcoming')
        );
        setLiveSessions(relevantSessions);
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data || { message: 'Failed to fetch classroom data' });
        setLoading(false);
      }
    };
    fetchData();
  }, [courseName]);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto py-20 text-center space-y-8 animate-in fade-in zoom-in duration-500">
       <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
          <BookOpen className="w-12 h-12" />
       </div>
       <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900">{error.message}</h2>
          <p className="text-slate-500 font-bold italic">Unlock this course to access premium LIVE sessions and expert notes.</p>
       </div>
       <Link 
         to="/courses" 
         className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white rounded-[28px] font-black text-lg uppercase tracking-widest shadow-2xl shadow-indigo-900/20 hover:scale-105 active:scale-95 transition-all"
       >
          {error.type === 'renew' ? 'Renew Subscription' : 'Upgrade to Premium'} <ChevronRight />
       </Link>
    </div>
  );

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-20 p-4 md:p-10 lg:px-12 bg-slate-50/30 font-sans">
      {/* HEADER SECTION - FULL WIDTH */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-100 max-w-[1600px] mx-auto">
         <div className="flex items-center gap-4 md:gap-8">
            <Link to="/student/dashboard" className="w-12 h-12 md:w-16 md:h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm shrink-0">
               <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" />
            </Link>
            <div>
               <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">{courseName}</h1>
               <div className="flex items-center gap-3 md:gap-6 mt-3">
                  <p className="text-slate-400 font-bold flex items-center gap-2 text-[10px] md:text-sm uppercase tracking-widest">
                     <GraduationCap className="w-4 h-4 text-indigo-500" /> Strategic Study Content
                  </p>
                  <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                  <p className="text-indigo-600 font-black text-[10px] md:text-[11px] uppercase tracking-widest bg-indigo-50 px-4 py-1.5 rounded-full">Premium Status</p>
               </div>
            </div>
         </div>
      </div>

      {/* TWO COLUMN GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-[1600px] mx-auto font-sans">
         
         {/* LEFT PRIMARY COLUMN - STUDY NOTES */}
         <div className="lg:col-span-8 space-y-8 md:space-y-10 order-2 lg:order-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-8 md:p-10 rounded-[40px] border border-transparent shadow-xl shadow-indigo-900/5 gap-4 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />
               <div className="space-y-2 relative z-10">
                  <h2 className="text-xl md:text-3xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-4">
                     <FileText className="w-8 h-8 md:w-10 md:h-10 text-indigo-600" /> Study Notes
                  </h2>
                  <p className="text-slate-400 font-bold italic text-xs md:text-base">Your premium library for strategic notes.</p>
               </div>
               <span className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] text-center shadow-lg relative z-10">
                  {content.materials.length} Notes Available
               </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
               {content.materials.length === 0 ? (
                  <div className="col-span-full py-16 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200 text-center space-y-4">
                     <FileText className="w-12 h-12 text-slate-200 mx-auto" />
                     <p className="text-slate-400 font-black text-xs uppercase tracking-widest italic">No study notes uploaded yet</p>
                  </div>
               ) : content.materials.map((mat, idx) => (
                  <div key={idx} className="bg-white p-8 md:p-12 rounded-[40px] border border-slate-100 flex flex-col gap-10 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all group relative overflow-hidden h-full">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-20" />
                     
                     <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-900/30 group-hover:rotate-6 transition-transform shrink-0">
                           <FileText className="w-8 h-8 md:w-10 md:h-10 text-white" />
                        </div>
                        <div className="min-w-0">
                           <h3 className="text-lg md:text-2xl font-black text-slate-900 truncate uppercase tracking-tighter leading-none mb-2">{mat.title}</h3>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{mat.type || 'Study Note'} • PDF</p>
                        </div>
                     </div>

                     <a 
                       href={mat.fileUrl} 
                       download
                       className="w-full py-6 bg-slate-900 text-white rounded-[24px] font-black text-[11px] md:text-[12px] uppercase tracking-[0.3em] hover:bg-indigo-600 shadow-2xl shadow-navy-100 transition-all flex items-center justify-center gap-4 relative z-10 active:scale-95 group/down mt-auto"
                     >
                        Open Note <Download className="w-5 h-5 group-hover/down:translate-y-1 transition-transform" />
                     </a>
                  </div>
               ))}
            </div>
         </div>

         {/* RIGHT SIDEBAR COLUMN - LIVE SCHEDULE & TIPS */}
         <div className="lg:col-span-4 space-y-10 order-1 lg:order-2 lg:sticky lg:top-10 h-fit font-sans">
            
            {/* LIVE SCHEDULE */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-indigo-900/5 p-8 md:p-10 space-y-8">
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-4">
                  <Video className="w-6 h-6 text-indigo-600" /> Live Classroom
               </h3>
               
               <div className="space-y-6">
                  {liveSessions.length === 0 ? (
                    <div className="py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-6 italic">Stay tuned for upcoming live notes sessions</p>
                    </div>
                  ) : liveSessions.map((session, idx) => (
                    <div key={idx} className={`p-6 rounded-[28px] border-2 transition-all group relative overflow-hidden ${
                      session.status === 'live' ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-900/20' : 'bg-white border-slate-100'
                    }`}>
                        <div className="flex flex-col gap-4 relative z-10">
                           <div className="flex items-center justify-between gap-4">
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                 session.status === 'live' ? 'bg-white text-indigo-600' : 'bg-indigo-50 text-indigo-600'
                              }`}>
                                 {session.status === 'live' ? 'LIVE NOW' : 'NEXT CLASS'}
                              </span>
                              <p className={`text-[10px] font-black uppercase tracking-widest ${session.status === 'live' ? 'text-white/60' : 'text-slate-400'}`}>
                                 {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                           <h4 className="text-lg font-black leading-tight uppercase tracking-tight">{session.title}</h4>
                           <p className={`text-[10px] font-bold italic truncate ${session.status === 'live' ? 'text-white/70' : 'text-slate-500'}`}>
                              Faculty: {session.teacherId?.name || 'Expert Mentor'}
                           </p>

                           {session.status === 'live' ? (
                               <a 
                                 href={session.link}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="w-full mt-2 py-4 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl text-center active:scale-95 transition-all"
                               >
                                  JOIN CLASS NOW
                               </a>
                           ) : (
                               <div className="mt-2 py-3 px-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 font-bold text-[9px] uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                  <Clock className="w-3.5 h-3.5" /> Scheduled
                               </div>
                           )}
                        </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* TIPS */}
            <div className="bg-slate-900 rounded-[40px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-10 rounded-full blur-3xl -mr-16 -mt-16" />
               <div className="space-y-8 relative z-10">
                  <h4 className="text-lg font-black uppercase tracking-[0.2em] flex items-center gap-4">
                     <Zap className="w-6 h-6 text-amber-400" /> Mastery Tips
                  </h4>
                  <div className="space-y-4">
                     {[
                       "Review these Notes before every LIVE session.",
                       "Ask questions directly during class rooms.",
                       "Download notes for offline preparation."
                     ].map((tip, i) => (
                       <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
                          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0 animate-pulse shadow-[0_0_8px_#fbbf24]" />
                          <p className="text-[10px] font-bold text-white/50 leading-relaxed uppercase tracking-wide">{tip}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default StudentCourseContent;
