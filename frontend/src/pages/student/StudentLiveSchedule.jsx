import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  const { userInfo } = useSelector((state) => state.auth);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [liveSessions, setLiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    const fetchLiveSessions = async () => {
      try {
        let allSessions = [];

        // 1. Fetch regular live alerts
        const { data: regularData } = await axios.get('/student/live-alerts');
        if (regularData) {
          allSessions = [...regularData];
        }

        // 2. If student is 1-on-1, fetch personal session slots and merge them
        if (userInfo?.board === '1-on-1') {
          const { data: personalData } = await axios.get('/student/personal-sessions');
          const active = (personalData || []).find(s => ['assigned', 'active'].includes(s.status)) || (personalData && personalData[0]) || null;
          
          if (active && active.scheduledSlots && active.scheduledSlots.length > 0) {
            const nowTime = new Date();
            const personalSlotsMapped = active.scheduledSlots.map((slot, idx) => {
              const sTime = new Date(slot.startTime);
              const eTime = new Date(slot.endTime);
              
              // 10 minutes before start time is considered LIVE
              const tenMinsBefore = new Date(sTime.getTime() - 10 * 60000);
              
              let slotStatus = 'upcoming';
              if (nowTime >= tenMinsBefore && nowTime <= eTime) {
                slotStatus = 'live';
              } else if (nowTime > eTime) {
                slotStatus = 'ended';
              }

              return {
                _id: slot._id || `personal-${idx}`,
                title: `${active.subjectName || '1-on-1'} (Personal Class)`,
                subjectName: active.subjectName || '1-on-1',
                startTime: slot.startTime,
                endTime: slot.endTime,
                link: slot.meetingLink,
                status: slotStatus,
                teacherId: active.teacherId,
                isPersonal: true
              };
            });
            allSessions = [...allSessions, ...personalSlotsMapped];
          }
        }

        setLiveSessions(allSessions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching live sessions');
        setLoading(false);
      }
    };
    fetchLiveSessions();
  }, [userInfo]);

  const now = new Date();

  const getTimeUntil = (startTime) => {
    const diffMs = new Date(startTime) - now;
    const diffMins = Math.max(0, Math.ceil(diffMs / (1000 * 60)));
    
    if (diffMins < 60) return `Starts in ${diffMins} mins`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `Starts in ${diffHrs} hrs`;
    const diffDays = Math.floor(diffHrs / 24);
    return `Starts in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  // Robust Filtering based on Date + Status
  const liveNow = liveSessions.filter(s => 
    s.status === 'live' &&
    (s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const upcoming = liveSessions.filter(s => 
    s.status === 'upcoming' && 
    new Date(s.startTime) > now &&
    (s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const filteredPast = liveSessions.filter(s => 
    (s.status === 'ended' || (s.status === 'upcoming' && new Date(s.startTime) < now)) &&
    new Date(s.startTime) >= yesterday &&
    (s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 pb-20 p-4 md:p-6 lg:px-8 bg-slate-50 min-h-screen">
      
      {/* Header Strip */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
             <Video className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
              Live Classes
            </h1>
            <p className="text-sm text-slate-500 mt-1">Join your virtual classroom or watch previous recordings.</p>
          </div>
        </div>

        <div className="relative w-full md:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search classes..." 
            className="w-full pl-9 pr-4 py-2.5 bg-slate-100 rounded-lg border border-transparent focus:border-indigo-300 focus:bg-white focus:outline-none text-sm transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT: LIVE & UPCOMING (COL 8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* LIVE NOW LISTING */}
          {liveNow.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                <h2 className="text-sm font-bold text-slate-700">Live Now</h2>
              </div>
              <div className="space-y-4">
                {liveNow.map((session, idx) => (
                  <div key={idx} className="bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden shadow-lg border border-slate-800">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500 rounded-full -mr-24 -mt-24 blur-[80px] opacity-20 pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                       <div className="space-y-3 flex-1 text-center sm:text-left">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/20 text-rose-300 rounded-md border border-rose-500/30 text-[10px] font-semibold">
                             <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" /> Live Now
                          </div>
                          <h2 className="text-xl md:text-2xl font-bold leading-tight">{session.title}</h2>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-300">
                             <div className="flex items-center gap-2">
                                <UserCircle className="w-4 h-4 text-slate-400" /> {session.teacherId?.name || 'Teacher'}
                             </div>
                             <div className="w-1 h-1 bg-slate-600 rounded-full" />
                             <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" /> {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </div>
                          </div>
                       </div>
                       
                       <a 
                         href={session.link}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="px-6 py-2.5 bg-rose-600 text-white rounded-lg font-semibold text-sm shadow-md flex items-center justify-center gap-2 hover:bg-rose-700 transition-colors shrink-0"
                       >
                         Join Class <Play className="w-4 h-4 fill-current" />
                       </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPCOMING SCHEDULE SECTION */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-700">Upcoming Schedule</h2>

            {upcoming.length === 0 ? (
              <div className="py-16 bg-white rounded-xl border border-dashed border-slate-200 text-center space-y-3">
                 <Calendar className="w-10 h-10 text-slate-300 mx-auto" strokeWidth={1.5} />
                 <p className="text-sm text-slate-500 font-medium">No upcoming classes scheduled.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {upcoming.map((session, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
                    
                    <div className="w-full sm:w-24 py-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center shrink-0">
                       <p className="text-[10px] font-semibold text-slate-500 uppercase">{new Date(session.startTime).toLocaleDateString('en-GB', { month: 'short' })}</p>
                       <p className="text-2xl font-bold text-indigo-600 leading-none my-1">{new Date(session.startTime).getDate()}</p>
                       <p className="text-[10px] font-semibold text-slate-500">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
                       <p className="text-xs font-semibold text-indigo-600">
                          {session.isPersonal 
                            ? '1-on-1 Personal Class'
                            : (() => {
                                 const level = String(session.classLevel || '').replace(/class/gi, '').trim();
                                 if (level === '11') return 'Inter 1st Year';
                                 if (level === '12') return 'Inter 2nd Year';
                                 return level ? `Class ${level}` : 'General';
                              })() + ` • ${session.subjectName || 'Subject'}`}
                       </p>
                       <h3 className="text-lg font-bold text-slate-800 truncate">
                          {session.isPersonal ? session.subjectName : session.title}
                       </h3>
                       <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-500">
                          <UserCircle className="w-3.5 h-3.5" />
                          <span>{session.teacherId?.name || 'Teacher'}</span>
                       </div>
                    </div>

                    <div className="w-full sm:w-auto shrink-0">
                       <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-semibold text-xs border border-indigo-100 text-center">
                          {getTimeUntil(session.startTime)}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: PREVIOUS CLASSES (COL 4) */}
        <div className="lg:col-span-4 space-y-4">
           <h2 className="text-sm font-bold text-slate-700">Previous Classes</h2>

           {filteredPast.length === 0 ? (
              <div className="py-12 bg-white rounded-xl border border-dashed border-slate-200 text-center space-y-3">
                 <History className="w-8 h-8 text-slate-300 mx-auto" />
                 <p className="text-xs text-slate-500 font-medium">No class recordings yet.</p>
              </div>
           ) : (
              <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                 {filteredPast.slice(0, 10).map((session, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group">
                       <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                          <MonitorPlay className="w-4 h-4" />
                       </div>
                       <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{session.title}</h4>
                          <div className="flex items-center justify-between mt-1">
                             <p className="text-xs text-slate-500 truncate">{session.teacherId?.name || 'Teacher'}</p>
                             <span className="text-[10px] text-slate-400 font-medium">{new Date(session.startTime).toLocaleDateString('en-GB')}</span>
                          </div>
                       </div>
                    </div>
                 ))}
                 
                 {filteredPast.length > 10 && (
                    <Link to="/student/notes" className="block w-full py-2.5 text-xs font-semibold text-indigo-600 text-center bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors mt-2">
                       Explore Full Library
                    </Link>
                 )}
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default StudentLiveSchedule;
