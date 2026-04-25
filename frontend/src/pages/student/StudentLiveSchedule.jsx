import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { 
  Video, 
  Clock, 
  Calendar, 
  ChevronRight, 
  History, 
  Play, 
  Search,
  MonitorPlay,
  UserCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentLiveSchedule = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    const fetchLiveSessions = async () => {
      try {
        const { data } = await axios.get('/student/live-alerts');
        setLiveSessions(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching live sessions');
        setLoading(false);
      }
    };
    fetchLiveSessions();
  }, []);

  const filteredUpcoming = liveSessions.filter(s => 
    (s.status === 'live' || s.status === 'upcoming') &&
    (s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const liveNow = filteredUpcoming.filter(s => s.status === 'live');
  const upcoming = filteredUpcoming.filter(s => s.status === 'upcoming');

  const filteredPast = liveSessions.filter(s => 
    s.status === 'ended' &&
    (s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <MonitorPlay className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-20 p-3 md:p-6 lg:px-10 bg-[#f8fbff]/50 min-h-screen">
      
      {/* 0. Header Strip */}
      <div className="bg-white p-5 md:px-8 md:py-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-[#002147] tracking-tighter uppercase leading-none">
            Live & <span className="text-[#f16126]">Schedule</span> Class
          </h1>
          <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1">Access your virtual classroom and upcoming sessions.</p>
        </div>

        <div className="relative group w-full lg:w-[400px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#f16126] transition-colors" />
          <input 
            type="text" 
            placeholder="Search classes or subjects..." 
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 rounded-xl border-2 border-transparent focus:border-[#f16126] focus:bg-white focus:outline-none text-[10px] font-black uppercase tracking-widest transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COMPONENT: LIVE & UPCOMING (COL 8) */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* LIVE NOW LISTING */}
          {liveNow.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#002147]">Direct Access: Live Now</h2>
              </div>
              <div className="space-y-6">
                {liveNow.map((session, idx) => (
                  <div key={idx} className="bg-[#002147] rounded-[40px] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl border-b-[12px] border-indigo-600/10 group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#f16126] rounded-full -mr-40 -mt-40 blur-[120px] opacity-20 pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                       <div className="space-y-6 flex-1 text-center md:text-left">
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 text-emerald-400 rounded-full border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] animate-pulse">
                             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Connected & Active
                          </div>
                          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">{session.title}</h2>
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#f16126] rounded-xl flex items-center justify-center border border-white/10 shadow-lg">
                                   <UserCircle className="w-6 h-6" />
                                </div>
                                <div>
                                   <p className="text-[9px] text-indigo-300 font-black uppercase tracking-widest leading-none mb-1">Lead Faculty</p>
                                   <p className="text-base font-extrabold italic uppercase">{session.teacherId?.name || 'Academic Expert'}</p>
                                </div>
                             </div>
                             <div className="h-10 w-[1px] bg-white/10 hidden md:block" />
                             <div>
                                <p className="text-[9px] text-indigo-300 font-black uppercase tracking-widest leading-none mb-1">Session Timing</p>
                                <p className="text-base font-extrabold flex items-center gap-2">
                                   <Clock className="w-4 h-4 text-[#f16126]" /> {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                             </div>
                          </div>
                       </div>
                       
                       <a 
                         href={session.link}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="px-12 py-8 bg-white text-[#002147] rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 hover:bg-[#f16126] hover:text-white transition-all active:scale-95 group/btn shrink-0"
                       >
                         Join Now <Play className="w-6 h-6 fill-current group-hover/btn:translate-x-2 transition-transform" />
                       </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPCOMING SCHEDULE SECTION */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#002147]">Upcoming Class Schedule</h2>
               <div className="flex-1 h-[2px] bg-gradient-to-r from-slate-100 to-transparent ml-6" />
            </div>

            {upcoming.length === 0 ? (
              <div className="py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-100 text-center space-y-4">
                 <Calendar className="w-12 h-12 text-slate-200 mx-auto" />
                 <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest italic">No classes scheduled for today.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {upcoming.map((session, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-[32px] border-2 border-slate-50 hover:border-[#f16126]/20 transition-all flex flex-col md:flex-row items-center gap-8 shadow-sm hover:shadow-xl group">
                    <div className="w-full md:w-32 py-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col items-center justify-center group-hover:bg-orange-50 group-hover:border-orange-100 transition-colors">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{new Date(session.startTime).toLocaleDateString('en-GB', { month: 'short' })}</p>
                       <p className="text-4xl font-black text-[#002147] leading-none mb-1">{new Date(session.startTime).getDate()}</p>
                       <p className="text-[10px] font-black text-[#f16126] uppercase tracking-widest italic">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>

                    <div className="flex-1 min-w-0 space-y-3 text-center md:text-left">
                       <p className="text-[10px] font-black text-[#f16126] uppercase tracking-[0.2em] italic">
                          {(() => {
                             const level = String(session.classLevel || '').replace(/class/gi, '').trim();
                             if (level === '11') return 'Inter 1st Year';
                             if (level === '12') return 'Inter 2nd Year';
                             return `Class ${level}`;
                          })()} <span className="mx-2 opacity-20">|</span> {session.subjectName || 'Expert Subject'}
                       </p>
                       <h3 className="text-2xl md:text-3xl font-black text-[#002147] uppercase tracking-tighter truncate leading-none group-hover:text-indigo-600 transition-colors">{session.title}</h3>
                       <div className="flex items-center justify-center md:justify-start gap-3">
                          <UserCircle className="w-5 h-5 text-slate-300" />
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest italic">{session.teacherId?.name || 'Academic Expert'}</span>
                       </div>
                    </div>

                    <div className="w-full md:w-auto">
                       <div className="px-8 py-4 bg-[#002147]/5 text-[#002147] rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 text-center">
                          Starts in {Math.max(0, Math.ceil((new Date(session.startTime) - new Date()) / (1000 * 60)))} Mins
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: PAST SESSIONS (COL 4) */}
        <div className="lg:col-span-4 space-y-8">
           <div className="flex items-center gap-4 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <History className="w-5 h-5 text-[#f16126]" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#002147]">Past Lessons Archive</h2>
           </div>

           {filteredPast.length === 0 ? (
              <div className="py-20 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200 text-center space-y-4">
                 <MonitorPlay className="w-10 h-10 text-slate-200 mx-auto" />
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Recording Repository Empty</p>
              </div>
           ) : (
              <div className="space-y-4">
                 {filteredPast.slice(0, 12).map((session, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-[28px] border border-slate-50 hover:border-indigo-100 hover:shadow-xl transition-all group relative overflow-hidden">
                       <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center shrink-0 border border-slate-50 group-hover:bg-[#002147] group-hover:text-white transition-all transform group-hover:rotate-6">
                             <Play className="w-6 h-6 fill-current" />
                          </div>
                          <div className="min-w-0 flex-1">
                             <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[8px] font-black text-[#f16126] uppercase tracking-widest tabular-nums italic">{new Date(session.startTime).toLocaleDateString('en-GB')}</span>
                                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[7px] font-black text-slate-400 uppercase">Ended</span>
                             </div>
                             <h4 className="text-sm md:text-base font-black text-[#002147] uppercase tracking-tight truncate group-hover:text-indigo-600 transition-colors uppercase">{session.title}</h4>
                             <p className="text-[9px] font-bold text-slate-400 italic truncate uppercase">{session.teacherId?.name || 'Expert Faculty'}</p>
                          </div>
                       </div>
                    </div>
                 ))}
                 
                 {filteredPast.length > 12 && (
                    <button className="w-full py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-[#f16126] transition-colors bg-white/50 rounded-2xl border border-dashed border-slate-200">View Full History</button>
                 )}
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default StudentLiveSchedule;
