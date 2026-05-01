import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, 
  ChevronRight, 
  Loader2, 
  FileText, 
  ArrowLeft,
  Download,
  GraduationCap,
  Clock,
  Video,
  UserCircle,
  Play
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
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-md mx-auto py-20 text-center space-y-6">
       <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <BookOpen className="w-8 h-8" />
       </div>
       <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">{error.message}</h2>
          <p className="text-sm text-slate-500">Unlock this course to access live classes and notes.</p>
       </div>
       <Link 
         to="/courses" 
         className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors"
       >
          {error.type === 'renew' ? 'Renew Subscription' : 'Buy Subscription'} <ChevronRight className="w-4 h-4" />
       </Link>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 pb-20 p-4 md:p-6 lg:px-8 bg-slate-50 min-h-screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
         <div className="flex items-center gap-4">
            <Link to="/student/dashboard" className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors shadow-sm shrink-0">
               <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
               <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">{courseName}</h1>
               <div className="flex items-center gap-3 mt-1.5">
                  <p className="text-slate-500 font-medium flex items-center gap-1.5 text-xs">
                     <GraduationCap className="w-3.5 h-3.5 text-indigo-500" /> Study Content
                  </p>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <p className="text-emerald-700 font-semibold text-[10px] uppercase tracking-wide bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Subscribed</p>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
         
         {/* LEFT PRIMARY COLUMN - STUDY NOTES */}
         <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
               <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                     <FileText className="w-5 h-5 text-indigo-600" /> Study Notes
                  </h2>
                  <p className="text-slate-500 text-sm">Access your class notes and PDFs.</p>
               </div>
               <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold text-xs border border-slate-200 shrink-0">
                  {content.materials.length} Notes Available
               </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {content.materials.length === 0 ? (
                  <div className="col-span-full py-12 bg-white rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                     <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                     <p className="text-slate-500 font-medium text-sm">No study notes uploaded yet</p>
                  </div>
               ) : content.materials.map((mat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 hover:border-indigo-200 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-6 group">
                     
                     <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                           <FileText className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                           <h3 className="text-base font-bold text-slate-800 leading-tight mb-1">{mat.title}</h3>
                           <p className="text-xs text-slate-500">{mat.type || 'Study Note'} • PDF</p>
                        </div>
                     </div>

                     <a 
                       href={mat.fileUrl} 
                       download
                       className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 mt-auto"
                     >
                        Download PDF <Download className="w-4 h-4" />
                     </a>
                  </div>
               ))}
            </div>
         </div>

         {/* RIGHT SIDEBAR COLUMN - LIVE SCHEDULE */}
         <div className="lg:col-span-4 space-y-6 order-1 lg:order-2 lg:sticky lg:top-6 h-fit">
            
            {/* LIVE SCHEDULE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
               <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3 pb-4 border-b border-slate-100">
                  <Video className="w-5 h-5 text-indigo-600" /> Live Classes
               </h3>
               
               <div className="space-y-4">
                  {liveSessions.length === 0 ? (
                    <div className="py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
                       <p className="text-xs text-slate-500 font-medium">Stay tuned for upcoming live classes</p>
                    </div>
                  ) : liveSessions.map((session, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border transition-all ${
                      session.status === 'live' ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200'
                    }`}>
                        <div className="flex flex-col gap-3">
                           <div className="flex items-center justify-between">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                 session.status === 'live' ? 'bg-rose-600 text-white' : 'bg-indigo-100 text-indigo-700'
                              }`}>
                                 {session.status === 'live' ? 'LIVE NOW' : 'UPCOMING'}
                              </span>
                              <p className="text-xs font-semibold text-slate-500">
                                 {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </div>
                           
                           <div>
                              <h4 className="text-sm font-bold text-slate-800 leading-tight">{session.title}</h4>
                              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                 <UserCircle className="w-3.5 h-3.5" /> {session.teacherId?.name || 'Teacher'}
                              </p>
                           </div>

                           {session.status === 'live' ? (
                               <a 
                                 href={session.link}
                                 target="_blank"
                                 rel="noopener noreferrer"
                                 className="w-full mt-2 py-2 bg-rose-600 text-white rounded-lg font-semibold text-xs text-center hover:bg-rose-700 transition-colors flex items-center justify-center gap-1.5"
                               >
                                  <Play className="w-3.5 h-3.5 fill-current" /> Join Class
                               </a>
                           ) : (
                               <div className="mt-2 py-2 px-3 bg-slate-100 rounded-lg text-slate-500 font-medium text-xs text-center flex items-center justify-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" /> Scheduled
                               </div>
                           )}
                        </div>
                    </div>
                  ))}
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};

export default StudentCourseContent;
