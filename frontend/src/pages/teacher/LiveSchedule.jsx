import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Video, BookOpen, Clock, Loader2, Calendar, List, Radio } from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()    === b.getMonth()    &&
  a.getDate()     === b.getDate();

const fmtDay  = d => d.toLocaleDateString('en-IN', { weekday: 'short' });
const fmtDate = d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const fmtTime = d => {
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch { return '--:--'; }
};

const getWeekDates = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
};

// ── Component ──────────────────────────────────────────────────────────────
const LiveSchedule = () => {
  const [sessions, setSessions]       = useState([]);
  const [assignments, setAssignments] = useState([]); // teacher's assigned subjects
  const [loading, setLoading]         = useState(true);
  const [viewType, setViewType]       = useState('timetable');
  const [selectedBoard, setSelectedBoard] = useState('All');

  const BOARDS = ['All', 'AP Board', 'TS Board', 'CBSE', 'ICSE'];

  const weekDates = useMemo(getWeekDates, []);
  const today     = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  const fetchData = async () => {
    try {
      const [sessRes, assignRes] = await Promise.all([
        axios.get('/teacher/live-sessions'),
        axios.get('/teacher/my-classes'),          // assigned subjects
      ]);
      setSessions(sessRes.data || []);
      setAssignments(assignRes.data || []);
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`/teacher/live-sessions/${id}/status`, { status });
      fetchData();
    } catch (_) {}
  };

  // Build timetable structure from ASSIGNED subjects (not just sessions)
  // So every assigned class/subject appears even if not yet scheduled
  const classBySubject = useMemo(() => {
    const map = {}; // { "Class 10": Set of subjects }

    // 1. Seed from assignments (always show these)
    assignments.forEach(a => {
      const cl = a.classLevel || 'Unknown';
      if (!map[cl]) map[cl] = new Set();
      if (a.subjectName && a.subjectName !== cl) {   // skip bundle rows that are just the class name
        map[cl].add(a.subjectName);
      }
    });

    // 2. Also add any session subjects not already in assignments (safety net)
    sessions.forEach(s => {
      if (!map[s.classLevel]) map[s.classLevel] = new Set();
      map[s.classLevel].add(s.subjectName);
    });

    // 3. Sort by class number, then subject alphabetically
    return Object.keys(map)
      .sort((a, b) => {
        const n = s => parseInt((s.match(/\d+/) || [99])[0]);
        return n(a) - n(b);
      })
      .map(classLevel => ({ classLevel, subjects: [...map[classLevel]].sort() }))
      .filter(item => item.subjects.length > 0);   // hide class rows with no subjects
  }, [assignments, sessions]);

  // Filter sessions by selected board
  const filteredSessions = useMemo(() => {
    if (selectedBoard === 'All') return sessions;
    return sessions.filter(s => s.board === selectedBoard);
  }, [sessions, selectedBoard]);

  // Active sorted sessions (for list view)
  const sortedSessions = useMemo(() =>
    [...filteredSessions]
      .filter(s => s.status !== 'ended')
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
  [filteredSessions]);

  // Grouped by date (for list view)
  const groupedSessions = useMemo(() =>
    sortedSessions.reduce((acc, s) => {
      const key = new Date(s.startTime).toDateString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(s);
      return acc;
    }, {}),
  [sortedSessions]);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
    </div>
  );

  // ── Session Card (reused inside timetable cells) ──────────────────────────
  const SessionCard = ({ s }) => {
    const isLive  = s.status === 'live';
    const isEnded = s.status === 'ended';
    return (
      <div className={`relative p-2 rounded-xl border text-left transition-all ${
        isLive   ? 'bg-red-50 border-red-200 shadow-sm'
        : isEnded ? 'bg-slate-50 border-slate-200 opacity-60'
        : 'bg-white border-teal-100 hover:border-teal-300 hover:shadow-sm'
      }`}>
        {/* Accent bar */}
        <div className={`absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full ${isLive ? 'bg-red-500' : isEnded ? 'bg-slate-300' : 'bg-teal-500'}`} />
        <div className="pl-2">
          {/* Time + Status */}
          <div className="flex items-center justify-between mb-1">
            {isLive ? (
              <span className="flex items-center gap-1 text-[9px] font-black text-red-600 uppercase">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>LIVE
              </span>
            ) : isEnded ? (
              <span className="text-[9px] font-bold text-slate-400 uppercase">Done</span>
            ) : (
              <span className="text-[9px] font-bold text-teal-600 uppercase">Soon</span>
            )}
            <span className="text-[9px] font-black text-slate-500">{fmtTime(s.startTime)}</span>
          </div>

          {/* Title */}
          <p className={`text-[11px] font-bold leading-tight truncate mb-0.5 ${isLive ? 'text-red-900' : isEnded ? 'text-slate-400' : 'text-slate-800'}`}>
            {s.title}
          </p>

          {/* Platform + Board */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[9px] font-medium text-slate-400">{s.platform}</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <span className="text-[9px] font-bold text-slate-500 px-1 py-0.5 bg-slate-100 rounded uppercase">
              {s.board || 'TS'}
            </span>
          </div>

          {/* Actions */}
          {!isEnded && (
            <div className="mt-2">
              {isLive ? (
                <div className="flex gap-1">
                  <a href={s.link} target="_blank" rel="noopener noreferrer"
                    className="flex-1 text-center py-1 bg-red-600 text-white rounded-lg text-[9px] font-bold hover:bg-red-700 transition-colors">
                    Join
                  </a>
                  <button onClick={() => handleUpdateStatus(s._id, 'ended')}
                    className="px-2 py-1 border border-red-200 text-red-600 rounded-lg text-[9px] font-bold hover:bg-red-50">
                    End
                  </button>
                </div>
              ) : (
                <button onClick={() => handleUpdateStatus(s._id, 'live')}
                  className="w-full py-1 bg-slate-800 hover:bg-teal-600 text-white rounded-lg text-[9px] font-bold transition-colors flex items-center justify-center gap-1">
                  <Radio className="w-2.5 h-2.5" />Go Live
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-4 md:p-8 max-w-full font-sans">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 opacity-5 rounded-full blur-3xl -z-10 -mr-20 -mt-20"></div>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-600/30">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Live Classes</h1>
          </div>
          <p className="text-slate-500 font-medium text-sm">Your weekly class timetable and live session manager.</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 shrink-0 mt-4 md:mt-0">
          {/* Board Filter */}
          <select 
            value={selectedBoard}
            onChange={(e) => setSelectedBoard(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm transition-all cursor-pointer"
          >
            {BOARDS.map(b => (
              <option key={b} value={b}>{b === 'All' ? 'All Boards' : b}</option>
            ))}
          </select>

          {/* Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setViewType('timetable')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${viewType === 'timetable' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Calendar className="w-3.5 h-3.5" /> Timetable
            </button>
            <button onClick={() => setViewType('list')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${viewType === 'list' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <List className="w-3.5 h-3.5" /> Schedule
            </button>
          </div>
        </div>
      </div>

      {/* ── TIMETABLE VIEW ────────────────────────────────────────────── */}
      {viewType === 'timetable' && (
        <div className="w-full">
          {classBySubject.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-700">No Classes Scheduled</h3>
              <p className="text-sm text-slate-500 mt-1">Ask your admin to assign sessions in the timetable.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full border-collapse bg-white" style={{ minWidth: '860px' }}>
                {/* Column headers */}
                <thead>
                  <tr>
                    <th className="px-4 py-4 text-left bg-slate-50 border-b border-r border-slate-200 w-[150px]">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Class / Subject</span>
                    </th>
                    {weekDates.map((date, di) => {
                      const isToday = isSameDay(date, today);
                      return (
                        <th key={di} className={`px-3 py-4 text-center border-b border-l border-slate-100 ${isToday ? 'bg-teal-600' : 'bg-slate-50'}`}>
                          <div className="flex flex-col items-center gap-0.5">
                            <span className={`text-sm font-bold ${isToday ? 'text-white' : 'text-slate-800'}`}>{fmtDay(date)}</span>
                            <span className={`text-[11px] ${isToday ? 'text-teal-100' : 'text-slate-400'}`}>{fmtDate(date)}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {classBySubject.map(({ classLevel, subjects }, clsIdx) => (
                    <React.Fragment key={`cls-${clsIdx}`}>

                      {/* Class Level Header Row */}
                      <tr>
                        <td colSpan={8} className="px-4 py-2.5 bg-slate-800 border-b border-slate-700">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 bg-teal-500 rounded-md flex items-center justify-center shrink-0">
                              <BookOpen className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-sm font-black text-white tracking-wide">{classLevel}</span>
                            <div className="h-px flex-1 bg-white/10"></div>
                            <span className="text-[10px] font-bold text-teal-300 uppercase tracking-widest">
                              {subjects.length} {subjects.length === 1 ? 'Subject' : 'Subjects'}
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Subject Rows */}
                      {subjects.map((subjectName, sIdx) => (
                        <tr key={`${clsIdx}-${sIdx}`}
                          className={`${sIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} border-b border-slate-100 last:border-b-0`}>

                          {/* Subject Label Cell */}
                          <td className="px-4 py-3 border-r border-slate-200 align-middle bg-white">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-6 rounded-full bg-teal-400 shrink-0"></div>
                              <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider">{subjectName}</span>
                            </div>
                          </td>

                          {/* Day Cells */}
                          {weekDates.map((date, di) => {
                            const isToday = isSameDay(date, today);
                            const daySessions = filteredSessions
                              .filter(s =>
                                s.classLevel === classLevel &&
                                s.subjectName === subjectName &&
                                isSameDay(new Date(s.startTime), date)
                              )
                              .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

                            return (
                              <td key={di}
                                className={`px-2 py-2.5 border-l border-slate-100 align-top ${isToday ? 'bg-teal-50/20' : ''}`}>
                                <div className="flex flex-col gap-2 min-h-[52px]">
                                  {daySessions.length === 0 ? (
                                    <div className="flex items-center justify-center h-full min-h-[52px]">
                                      <span className="text-slate-200 text-base">—</span>
                                    </div>
                                  ) : (
                                    daySessions.map((s, i) => <SessionCard key={i} s={s} />)
                                  )}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── LIST / SCHEDULE VIEW ──────────────────────────────────────── */}
      {viewType === 'list' && (
        <div className="space-y-10">
          {Object.keys(groupedSessions).length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-700">No Upcoming Classes</h3>
              <p className="text-sm text-slate-500 mt-1">You don't have any live sessions in the schedule.</p>
            </div>
          ) : (
            Object.keys(groupedSessions).map((dateKey, index) => {
              const daySessions = groupedSessions[dateKey];
              const dateObj  = new Date(dateKey);
              const isToday  = new Date().toDateString() === dateObj.toDateString();
              const isTmrw   = new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() === dateObj.toDateString();
              let header = dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
              if (isToday) header = `Today — ${header}`;
              else if (isTmrw) header = `Tomorrow — ${header}`;

              return (
                <div key={index} className="space-y-4">
                  <div className="flex items-center gap-3 sticky top-16 md:top-20 z-20 bg-slate-50/90 backdrop-blur pb-2 pt-4 -mt-4">
                    <h2 className={`text-lg md:text-xl font-black ${isToday ? 'text-teal-600' : 'text-slate-700'}`}>{header}</h2>
                    <div className="h-px flex-1 bg-slate-200"></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {daySessions.length} {daySessions.length === 1 ? 'Slot' : 'Slots'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {daySessions.map((s, i) => {
                      const isLive = s.status === 'live';
                      const timeDisplay = new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={s._id || i}
                          className={`relative flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-5 rounded-2xl border transition-all duration-300 group overflow-hidden ${
                            isLive ? 'bg-red-50/30 border-red-200 shadow-sm hover:shadow-md' : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300'
                          }`}>
                          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10 -mr-10 -mt-10 ${isLive ? 'bg-red-500' : 'bg-teal-400'}`}></div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto min-w-0 relative z-10">
                            <div className={`flex flex-col items-center justify-center min-w-[80px] h-[65px] rounded-xl border shadow-sm ${isLive ? 'bg-white border-red-200 text-red-600' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                              <span className="text-[9px] font-black uppercase tracking-widest mb-0.5 opacity-80">TIME</span>
                              <span className="text-sm font-black tracking-tight">{timeDisplay}</span>
                            </div>

                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                {isLive ? (
                                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 text-[9px] font-bold rounded-md uppercase">
                                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>Live Now
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 text-[9px] font-bold rounded-md uppercase">
                                    Upcoming
                                  </span>
                                )}
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-bold rounded-md uppercase">{s.board || 'TS Board'}</span>
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-bold rounded-md uppercase hidden sm:inline">{s.platform}</span>
                              </div>
                              <h3 className={`text-lg md:text-xl font-bold truncate ${isLive ? 'text-red-950' : 'text-slate-800'}`}>{s.title}</h3>
                              <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                                <div className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-teal-500" />{s.classLevel}</div>
                                <span className="text-teal-600">{s.subjectName}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 md:mt-0 w-full md:w-auto flex items-center gap-2.5 shrink-0 relative z-10">
                            {!isLive ? (
                              <button onClick={() => handleUpdateStatus(s._id, 'live')}
                                className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2">
                                <Video className="w-4 h-4" /> Start Broadcast
                              </button>
                            ) : (
                              <div className="flex w-full sm:w-auto items-center gap-2">
                                <a href={s.link} target="_blank" rel="noopener noreferrer"
                                  className="flex-1 sm:flex-none px-5 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold text-center">
                                  Join Call
                                </a>
                                <button onClick={() => handleUpdateStatus(s._id, 'ended')}
                                  className="flex-1 sm:flex-none px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold">
                                  End Session
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default LiveSchedule;
