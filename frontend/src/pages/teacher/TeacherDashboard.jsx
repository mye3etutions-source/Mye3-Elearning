import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Video, 
  FileText, 
  Calendar, 
  GraduationCap, 
  Clock, 
  ChevronRight, 
  Play, 
  CheckCircle2, 
  Activity,
  Zap,
  ArrowUpRight,
  MonitorPlay,
  X,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import socket from '../../socket';

const TeacherDashboard = () => {
  const [stats, setStats] = useState({
    liveCount: 0,
    upcomingCount: 0,
    endedCount: 0,
    studentCount: 0,
    totalAssigned: 0
  });
  const [sessions, setSessions] = useState([]);
  const [personalSessions, setPersonalSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, sessionRes, personalRes] = await Promise.all([
        axios.get('/teacher/dashboard-stats'),
        axios.get('/teacher/live-sessions'),
        axios.get('/teacher/personal-sessions')
      ]);
      setStats(statsRes.data);
      setSessions(sessionRes.data);
      setPersonalSessions(personalRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    socket.on('live-session-update', (data) => {
        console.log('TeacherDashboard: Live session update:', data);
        fetchData();
    });

    return () => {
        socket.off('live-session-update');
    };
  }, [fetchData]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/teacher/live-sessions/${id}/status`, { status });
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Failed to update status');
    }
  };

  const now = new Date();
  const todayStr = now.toDateString();

  // 1. Filter sessions for TODAY only
  const todaySessions = sessions.filter(s => {
    const sessionStartTime = new Date(s.startTime);
    return sessionStartTime.toDateString() === todayStr;
  });

  // 2. Further filter for display based on status and time
  const filteredSessions = todaySessions.filter(s => {
    const sessionEndTime = new Date(s.endTime);
    
    // Hide upcoming sessions that have already passed their scheduled end time
    if (s.status === 'upcoming' && sessionEndTime < now) return false;

    if (activeTab === 'live') return s.status === 'live';
    if (activeTab === 'upcoming') return s.status === 'upcoming';
    if (activeTab === 'ended') return s.status === 'ended';
    return true;
  });

  // 3. Recalculate Stats for "Today" view consistency
  const activeTodayCount = todaySessions.filter(s => 
    s.status === 'live' || (s.status === 'upcoming' && new Date(s.endTime) > now)
  ).length;

  const getTodayPersonalSlots = () => {
    const list = [];
    const todayStr = new Date().toDateString();
    personalSessions.forEach(session => {
      if (session.status === 'active') {
        (session.scheduledSlots || []).forEach(slot => {
          if (slot.status === 'upcoming' && new Date(slot.startTime).toDateString() === todayStr) {
            list.push({
              sessionId: session._id,
              subjectName: session.subjectName,
              studentName: session.studentId?.name || 'Student',
              slotId: slot._id,
              startTime: slot.startTime,
              endTime: slot.endTime,
              meetingLink: slot.meetingLink,
              platform: slot.platform
            });
          }
        });
      }
    });
    return list.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  };

  const todayPersonalSlots = getTodayPersonalSlots();

  const statCards = [
    { label: 'Assigned Classes', value: stats.totalAssigned, icon: BookOpen, color: 'text-[#002147]', bg: 'bg-indigo-50', path: '/teacher/classes', sub: 'All Grades' },
    { label: 'Today\'s Classes', value: activeTodayCount, icon: Video, color: 'text-[#f16126]', bg: 'bg-orange-50', path: '/teacher/classes', sub: 'Active' },
    { label: 'Total Sessions', value: stats.endedCount, icon: CheckCircle2, color: 'text-[#002147]', bg: 'bg-indigo-50', path: '/teacher/past-sessions', sub: 'Completed' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-4 md:p-6 lg:p-8 pb-24 bg-slate-50/30 min-h-screen font-sans">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
         <div className="space-y-3">
            <div className="flex items-center gap-3 px-4 py-1.5 bg-[#002147]/5 rounded-full w-fit border border-[#002147]/10">
               <Activity className="w-3.5 h-3.5 text-[#002147]" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#002147]">Teacher Dashboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none uppercase italic">
               WELCOME <span className="text-[#f16126] not-italic">BACK</span>
            </h1>
            <p className="text-slate-500 font-bold italic text-sm md:text-lg max-w-xl">
               Manage your daily classes and live sessions for today.
            </p>
         </div>

         <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 self-start">
            <div className="w-12 h-12 bg-[#002147] rounded-xl flex items-center justify-center text-white shadow-lg shadow-navy-100">
               <Calendar className="w-6 h-6" />
            </div>
            <div className="pr-6">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Today's Date</p>
               <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">
                  {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
               </p>
            </div>
         </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {statCards.map((stat, idx) => (
          <motion.div 
            whileHover={{ y: -5 }}
            key={idx} 
            className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4 relative overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-200 border-t-4 border-t-[#002147]"
          >
             <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:rotate-6 shrink-0 shadow-md shadow-current/5`}>
                <stat.icon className="w-6 h-6" />
             </div>
             <div className="space-y-1">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.15em] leading-none mb-1.5">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                   <p className="text-2xl md:text-3xl font-black text-slate-900 leading-none tracking-tighter italic">{stat.value}</p>
                   {stat.path && <ArrowUpRight className="w-4 h-4 text-[#f16126] opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5" />}
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase italic mt-1.5 opacity-60">{stat.sub}</p>
             </div>
             {stat.path && <Link to={stat.path} className="absolute inset-0 z-10" />}
          </motion.div>
        ))}
      </div>

      {/* Live Hub Restructure */}
      <div className="space-y-8">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-[#f16126] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-900/20">
                  <MonitorPlay className="w-6 h-6" />
               </div>
               <h2 className="text-2xl font-black text-[#002147] tracking-tighter uppercase italic">Today's <span className="text-[#f16126]">Classes</span></h2>
            </div>
            
            <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm overflow-hidden">
               {['all', 'live', 'upcoming', 'ended'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${
                     activeTab === tab ? 'bg-[#002147] text-white' : 'text-slate-400 hover:bg-slate-50'
                   }`}
                 >
                   {tab}
                 </button>
               ))}
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.length === 0 ? (
              <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-3xl border border-dashed border-slate-200">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                    <Zap className="w-8 h-8" />
                 </div>
                 <p className="text-slate-400 font-bold uppercase text-xs tracking-widest italic leading-relaxed">
                    No sessions match your filter.
                 </p>
              </div>
            ) : (
              filteredSessions.map((s, i) => {
                const startTime = new Date(s.startTime);
                const isLive = s.status === 'live';
                const isEnded = s.status === 'ended';

                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    key={i} 
                    onClick={() => { setSelectedSession(s); setShowModal(true); }}
                    className={`cursor-pointer group bg-white rounded-3xl border transition-all relative overflow-hidden flex flex-col min-h-[220px] ${
                      isLive ? 'border-[#f16126] shadow-xl ring-4 ring-orange-50' : 
                      isEnded ? 'opacity-70 border-slate-100' : 'border-slate-100 hover:border-[#002147] hover:shadow-2xl'
                    }`}
                  >
                     {/* Themed Side Bar */}
                     <div className={`absolute top-0 left-0 w-1.5 h-full ${isLive ? 'bg-[#f16126]' : isEnded ? 'bg-slate-200' : 'bg-[#002147]'}`} />
                     
                     {/* Card Header Content */}
                     <div className="p-5 flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className={`px-3 py-1 text-[8px] font-black rounded-lg uppercase tracking-widest ${
                                isLive ? 'bg-[#f16126] text-white animate-pulse' :
                                isEnded ? 'bg-slate-100 text-slate-400' : 'bg-[#002147] text-white'
                            }`}>
                                {isLive ? 'LIVE' : isEnded ? 'ENDED' : 'UPCOMING'}
                            </span>
                            <span className="px-2 py-1 bg-orange-100 text-[#f16126] text-[8px] font-black rounded uppercase tracking-widest border border-orange-200">
                                {s.board || 'TS Board'}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <h3 className="font-black text-slate-900 text-lg md:text-xl tracking-tighter leading-none uppercase italic group-hover:text-[#002147] transition-colors">{s.title}</h3>
                            <div className="flex items-center gap-3 pt-2">
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    <GraduationCap className="w-3.5 h-3.5" /> {s.classLevel}
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    <BookOpen className="w-3.5 h-3.5" /> {s.subjectName}
                                </div>
                            </div>
                        </div>
                     </div>

                     {/* Footer Info */}
                     <div className={`mt-auto p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/50`}>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Scheduled For</span>
                            <span className="text-[10px] font-black text-[#002147] uppercase italic">{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {startTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#002147] border border-slate-100 italic font-black text-[10px] group-hover:bg-[#002147] group-hover:text-white transition-all shadow-sm">
                            i
                        </div>
                     </div>
                  </motion.div>
                );
              })
            )}
         </div>
      </div>

      {/* Session Details Modal */}
      <AnimatePresence>
        {showModal && selectedSession && (
          <div 
            onClick={() => setShowModal(false)}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4 backdrop-blur-md bg-[#002147]/40"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 10 }} 
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.15)] border border-slate-100"
            >
               {/* Close Button */}
               <button 
                  onClick={() => setShowModal(false)} 
                  className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-100"
               >
                  <X className="w-4 h-4 text-slate-400" />
               </button>

              {/* Modal Body */}
              <div className="p-10 space-y-8">
                 {/* Header Section */}
                 <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-lg ${
                       selectedSession.status === 'live' ? 'bg-orange-50 text-[#f16126] shadow-orange-200/50' : 'bg-slate-50 text-[#002147] shadow-slate-200/50'
                    }`}>
                       <GraduationCap className="w-10 h-10" />
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Class Information</p>
                       <h3 className="text-3xl font-black text-[#002147] tracking-tighter uppercase italic">{selectedSession.title}</h3>
                    </div>
                 </div>

                 {/* Information Grid */}
                 <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100">
                             <Activity className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Board & Grade</span>
                       </div>
                       <span className="text-xs font-black text-[#002147] uppercase italic">{selectedSession.board || 'TS Board'} • {selectedSession.classLevel}</span>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100">
                             <BookOpen className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subject</span>
                       </div>
                       <span className="text-xs font-black text-[#002147] uppercase italic">{selectedSession.subjectName}</span>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-orange-50/30 rounded-2xl border border-orange-100/50">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm border border-orange-100">
                             <Clock className="w-4 h-4 text-[#f16126]" />
                          </div>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Timing</span>
                       </div>
                       <span className="text-xs font-black text-[#f16126] uppercase italic">
                          {new Date(selectedSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                       </span>
                    </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="pt-4">
                    {selectedSession.status === 'upcoming' && (
                        <button 
                            onClick={() => { handleUpdateStatus(selectedSession._id, 'live'); setShowModal(false); }}
                            className="w-full bg-[#002147] text-white py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#f16126] transition-all shadow-xl shadow-blue-900/10 active:scale-95 group"
                        >
                            START CLASS <Play className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                    {selectedSession.status === 'live' && (
                        <div className="flex flex-col gap-4">
                            <a 
                                href={selectedSession.link?.startsWith('http') ? selectedSession.link : `https://${selectedSession.link}`} target="_blank" rel="noopener noreferrer"
                                className="w-full bg-[#f16126] text-white py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-orange-600/20 hover:scale-[1.02] transition-all"
                            >
                                <Play className="w-4 h-4 fill-white" /> JOIN CLASS
                            </a>
                            <button 
                                onClick={() => { handleUpdateStatus(selectedSession._id, 'ended'); setShowModal(false); }}
                                className="w-full bg-white text-rose-600 border border-rose-100 py-5 rounded-3xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-50 transition-all"
                            >
                                END CLASS
                            </button>
                        </div>
                    )}
                    {selectedSession.status === 'ended' && (
                        <div className="w-full py-5 text-center bg-slate-50 rounded-3xl border border-slate-100">
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] italic flex items-center justify-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> SESSION ENDED
                           </span>
                        </div>
                    )}
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* 1-on-1 Personal Sessions Section */}
      <div className="space-y-8 pt-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-8">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-900/20">
                  <Video className="w-6 h-6" />
               </div>
               <h2 className="text-2xl font-black text-[#002147] tracking-tighter uppercase italic">Today's <span className="text-[#f16126]">1-on-1 Sessions</span></h2>
            </div>
            <Link to="/teacher/personal-sessions" className="text-xs font-black text-indigo-600 hover:underline px-4 py-2 bg-indigo-50 rounded-xl transition-all">View All</Link>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayPersonalSlots.length === 0 ? (
               <div className="col-span-full py-12 text-center space-y-4 bg-white rounded-3xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                     <Clock className="w-8 h-8" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-xs tracking-widest italic leading-relaxed">
                     No 1-on-1 sessions scheduled for today.
                  </p>
               </div>
            ) : (
               todayPersonalSlots.map((slot, i) => {
                  const startTime = new Date(slot.startTime);
                  return (
                     <div 
                       key={i} 
                       className="bg-white rounded-3xl border border-slate-100 hover:border-indigo-600 hover:shadow-2xl transition-all relative overflow-hidden flex flex-col min-h-[200px]"
                     >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
                        <div className="p-5 flex-grow space-y-4">
                           <div className="flex items-center justify-between">
                              <span className="px-3 py-1 text-[8px] font-black rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-widest">
                                 1-ON-1
                              </span>
                              <span className="px-2 py-1 bg-orange-100 text-[#f16126] text-[8px] font-black rounded uppercase tracking-widest border border-orange-200">
                                 {slot.platform}
                              </span>
                           </div>

                           <div className="space-y-1">
                              <h3 className="font-black text-slate-900 text-lg md:text-xl tracking-tighter leading-none uppercase italic">{slot.subjectName}</h3>
                              <p className="text-xs font-bold text-slate-500 pt-1">Student: {slot.studentName}</p>
                           </div>
                        </div>

                        <div className="mt-auto p-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
                           <div className="flex flex-col">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Scheduled For</span>
                              <span className="text-[10px] font-black text-[#002147] uppercase italic">
                                 {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                           </div>
                           <a 
                             href={slot.meetingLink?.startsWith('http') ? slot.meetingLink : `https://${slot.meetingLink}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-all shadow-md shadow-indigo-100"
                           >
                              Join <ExternalLink className="w-3 h-3" />
                           </a>
                        </div>
                     </div>
                  );
               })
            )}
         </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
