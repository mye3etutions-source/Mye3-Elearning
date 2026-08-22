import React, { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect } from 'react';
import axios from 'axios';
import {
    Activity, Loader2, BookOpen, Plus, X, Calendar, Video,
    Check, ChevronLeft, ChevronRight, Edit2, Trash2, Clock,
    ShieldCheck, Link as LinkIcon, AlertCircle, Lock
} from 'lucide-react';
import socket from '../../socket';
import LiveSessionCard    from '../../components/admin/live/LiveSessionCard';
import LiveSessionStats   from '../../components/admin/live/LiveSessionStats';

// ─── Constants ────────────────────────────────────────────────────────────────
const BOARDS = ['AP Board', 'TS Board', 'CBSE', 'ICSE'];
const BOARD_THEMES = {
    'AP Board': { main: 'indigo',   primary: 'bg-indigo-600',   secondary: 'bg-indigo-50',   text: 'text-indigo-600',   border: 'border-indigo-100'   },
    'TS Board': { main: 'rose',     primary: 'bg-rose-600',     secondary: 'bg-rose-50',     text: 'text-rose-600',     border: 'border-rose-100'     },
    'CBSE':     { main: 'amber',    primary: 'bg-amber-600',    secondary: 'bg-amber-50',    text: 'text-amber-600',    border: 'border-amber-100'    },
    'ICSE':     { main: 'emerald',  primary: 'bg-emerald-600',  secondary: 'bg-emerald-50',  text: 'text-emerald-600',  border: 'border-emerald-100'  },
};
const PLATFORMS = ['Google Meet', 'Zoom', 'YouTube Live'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate();

const fmtDay  = d => d.toLocaleDateString('en-IN', { weekday: 'short' });
const fmtDate = d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

const fmt24To12 = (t24) => {
    if (!t24) return '--:--';
    const [h, m] = t24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${period}`;
};

const get24HFromDate = (d) => {
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return '10:00';
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch { return '10:00'; }
};

// ─── Week dates: starts from TODAY, not Sunday ────────────────────────────────
const getWeekDates = (weekOffset = 0) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
    });
};

// ─── MiniCalendar Component ───────────────────────────────────────────────────
const MiniCalendar = ({ selectedDates, onToggleDate, month, year, onPrevMonth, onNextMonth }) => {
    const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDow    = new Date(year, month, 1).getDay(); // 0 = Sunday

    const isSelected = (d) => selectedDates.some(s => isSameDay(s, d));
    const isPast     = (d) => d < today;
    const isToday    = (d) => isSameDay(d, today);

    const cells = [
        ...Array(firstDow).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ];

    const monthName = new Date(year, month, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    const selectMonFri = () => {
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            const dow  = date.getDay();
            if (dow >= 1 && dow <= 5 && !isPast(date) && !isSelected(date)) {
                onToggleDate(date);
            }
        }
    };

    const selectAll = () => {
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(year, month, d);
            if (!isPast(date) && !isSelected(date)) onToggleDate(date);
        }
    };

    const clearAll = () => {
        [...selectedDates].forEach(d => onToggleDate(d));
    };

    return (
        <div className="select-none w-full">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={onPrevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold text-slate-700">{monthName}</span>
                <button type="button" onClick={onNextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
                ))}
            </div>

            {/* Date cells */}
            <div className="grid grid-cols-7 gap-y-1">
                {cells.map((date, i) => {
                    if (!date) return <div key={i} />;
                    const past     = isPast(date);
                    const selected = isSelected(date);
                    const todayDay = isToday(date);
                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={past}
                            onClick={() => onToggleDate(date)}
                            className={`h-8 w-full rounded-lg text-xs font-semibold transition-all ${
                                selected  ? 'bg-indigo-600 text-white shadow-sm' :
                                past      ? 'text-slate-300 cursor-not-allowed' :
                                todayDay  ? 'bg-indigo-50 text-indigo-700 font-black ring-1 ring-indigo-300' :
                                            'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600'
                            }`}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center justify-end mt-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={clearAll} className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors">Clear</button>
            </div>
        </div>
    );
};

// ─── TimePicker Sub-component ─────────────────────────────────────────────────
const TimePicker = ({ label, value, onChange }) => {
    const [h24, m24] = (value || '10:00').split(':').map(Number);
    const h12   = h24 % 12 || 12;
    const period = h24 >= 12 ? 'PM' : 'AM';

    const update = (nh, nm, np) => {
        let h = parseInt(nh);
        if (np === 'PM' && h < 12) h += 12;
        if (np === 'AM' && h === 12) h = 0;
        onChange(`${h.toString().padStart(2, '0')}:${String(nm).padStart(2, '0')}`);
    };

    return (
        <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase w-8 shrink-0">{label}</span>
            <select value={h12} onChange={e => update(e.target.value, m24, period)} className="flex-1 text-sm font-medium bg-white border border-slate-200 p-1.5 rounded-lg outline-none focus:border-indigo-400 transition-colors">
                {[12,1,2,3,4,5,6,7,8,9,10,11].map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <span className="font-bold text-slate-300">:</span>
            <select value={m24.toString().padStart(2,'0')} onChange={e => update(h12, e.target.value, period)} className="flex-1 text-sm font-medium bg-white border border-slate-200 p-1.5 rounded-lg outline-none focus:border-indigo-400 transition-colors">
                {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2,'0')).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={period} onChange={e => update(h12, m24, e.target.value)} className="text-sm font-medium bg-white border border-slate-200 p-1.5 rounded-lg outline-none focus:border-indigo-400 transition-colors">
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const LiveMonitor = () => {

    // ── Data state ───────────────────────────────────────────────────────────
    const [loading,            setLoading]            = useState(true);
    const [allSessions,        setAllSessions]        = useState([]);
    const [recurringSchedules, setRecurringSchedules] = useState([]);
    const [allClasses,         setAllClasses]         = useState([]);
    const [allBundlesDB,       setAllBundlesDB]       = useState([]);
    const [allSubjectsDB,      setAllSubjectsDB]      = useState([]);
    const [allTeachers,        setAllTeachers]        = useState([]);

    // ── UI state ─────────────────────────────────────────────────────────────
    const [viewType,         setViewType]         = useState('roster');
    const [expandedClasses,  setExpandedClasses]  = useState([]);
    const [boardFilter,      setBoardFilter]      = useState('AP Board');
    const [weekOffset,       setWeekOffset]       = useState(0);
    const [monthOffset,      setMonthOffset]      = useState(0);
    const [deleteConfirmId,  setDeleteConfirmId]  = useState(null);

    // ── Sticky header ref (used to offset the table thead) ────────────────────
    const headerRef    = useRef(null);
    const [headerHeight, setHeaderHeight] = useState(0);

    useLayoutEffect(() => {
        const measure = () => {
            if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [viewType]);

    // ── Schedule/Edit Modal (unified) ─────────────────────────────────────────
    const [scheduleModal,          setScheduleModal]          = useState({ open: false, classLevel: '', subjectName: '', subjectId: '', isEdit: false, sessionId: null });
    const [calendarDates,          setCalendarDates]          = useState([]);
    const [calendarView,           setCalendarView]           = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
    const [modalForm,              setModalForm]              = useState({ teacherId: '', time: '10:00', endTime: '11:00', platform: 'Google Meet', link: '' });
    const [modalTeachers,          setModalTeachers]          = useState([]);
    const [modalTeachersLoading,   setModalTeachersLoading]   = useState(false);
    const [modalSaving,            setModalSaving]            = useState(false);
    const [modalError,             setModalError]             = useState('');

    // ── Derived ───────────────────────────────────────────────────────────────
    const today     = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
    const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

    // Use a ref so callbacks don't need boardFilter in their dependency arrays
    const boardFilterRef = useRef(boardFilter);
    useEffect(() => { boardFilterRef.current = boardFilter; }, [boardFilter]);

    // ── Navigation info ───────────────────────────────────────────────────────
    const navInfo = useMemo(() => {
        const now = new Date();
        const start = weekDates[0];
        const end   = weekDates[6];
        return {
            monthLabels: [-1, 0, 1].map(offset => {
                const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
                return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
            }),
            activeMonth: start.getMonth(),
            weekLabel: `${start.getDate()} ${start.toLocaleDateString('en-IN',{month:'short'})} – ${end.getDate()} ${end.toLocaleDateString('en-IN',{month:'short', year:'numeric'})}`,
        };
    }, [weekDates]);

    const handleMonthJump = (offset) => {
        setMonthOffset(offset);
        if (offset === 0) {
            setWeekOffset(0);
        } else {
            const now = new Date(); now.setHours(0,0,0,0);
            const targetStart = new Date(now.getFullYear(), now.getMonth() + offset, 1);
            targetStart.setHours(0,0,0,0);
            const diffDays = Math.round((targetStart - now) / (24*60*60*1000));
            setWeekOffset(Math.ceil(diffDays / 7));
        }
    };

    // ── Fetch all data ────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [sessRes, classRes, subjRes, teachRes, recRes] = await Promise.allSettled([
                axios.get('/admin/live-sessions'),
                axios.get('/admin/classes'),
                axios.get('/admin/subjects'),
                axios.get('/admin/teachers-list'),
                axios.get('/admin/recurring-schedules'),
            ]);

            const sessions = sessRes.status  === 'fulfilled' ? sessRes.value.data  : [];
            const bundles  = classRes.status === 'fulfilled' ? classRes.value.data : [];
            const subjects = subjRes.status  === 'fulfilled' ? subjRes.value.data  : [];
            const teachers = teachRes.status === 'fulfilled' ? teachRes.value.data : [];

            setAllSessions(sessions);
            setAllBundlesDB(bundles);
            setAllSubjectsDB(subjects);
            setAllTeachers(teachers);
            setRecurringSchedules(recRes.status === 'fulfilled' ? recRes.value.data : []);

            const combined = [...new Set([
                ...bundles.map(b => b.className || `Class ${b.classLevel}`),
                ...subjects.map(s => `Class ${s.classLevel}`),
            ])].filter(c => !String(c).toLowerCase().includes('1-on-1'))
               .sort((a, b) => {
                   const n = s => parseInt((String(s).match(/\d+/) || [0])[0]);
                   return n(a) - n(b);
               });

            setAllClasses(combined);
        } catch (err) {
            console.error('LiveMonitor fetchData error:', err);
        } finally {
            setLoading(false);
        }
    }, []); // stable — no external dependencies

    useEffect(() => {
        fetchData();
        socket.on('live-session-update', fetchData);
        return () => socket.off('live-session-update', fetchData);
    }, [fetchData]);

    // ── Subjects for a class level (board-aware) ──────────────────────────────
    const getSubjectsForLevel = useCallback((classLevel) => {
        const levelNum = parseInt(classLevel.replace(/\D/g, ''));
        const fromSubject = allSubjectsDB.filter(s => s.classLevel === levelNum && s.board === boardFilter);
        if (fromSubject.length > 0) {
            return fromSubject.map(s => ({ id: s._id, subjectName: s.name, classLevel, type: 'subject' }));
        }
        const bundle = allBundlesDB.find(b => b.className === classLevel && b.board === boardFilter);
        if (bundle?.subjects?.length > 0) {
            return bundle.subjects.map(s => ({ id: `${classLevel}::${s.name}`, subjectName: s.name, classLevel, type: 'bundle-subject' }));
        }
        return [{ id: classLevel, subjectName: classLevel, classLevel, type: 'bundle' }];
    }, [allSubjectsDB, allBundlesDB, boardFilter]);

    // ── Load teachers for a subject ───────────────────────────────────────────
    const loadTeachersForSubject = useCallback(async (classLevel, subjectName) => {
        try {
            const params = new URLSearchParams({ classLevel, subjectName, board: boardFilterRef.current });
            const res = await axios.get(`/admin/teachers-for-subject?${params}`);
            return res.data || [];
        } catch {
            return [];
        }
    }, []);

    // ── Open Schedule Modal ───────────────────────────────────────────────────
    const openScheduler = useCallback(async (classLevel, subjectName, subjectId) => {
        setModalError('');
        setCalendarDates([new Date(today)]);
        setCalendarView({ month: today.getMonth(), year: today.getFullYear() });
        setModalForm({ teacherId: '', time: '10:00', endTime: '11:00', platform: 'Google Meet', link: '' });
        setModalTeachers([]);
        setScheduleModal({ open: true, classLevel, subjectName, subjectId: subjectId || '', isEdit: false, sessionId: null });
        setModalTeachersLoading(true);
        const teachers = await loadTeachersForSubject(classLevel, subjectName);
        setModalTeachers(teachers);
        setModalTeachersLoading(false);
    }, [today, loadTeachersForSubject]);

    // ── Open Edit Modal (uses unified modal) ──────────────────────────────────
    const openEditSession = useCallback(async (session) => {
        setModalError('');
        
        const sessionDate = new Date(session.startTime);
        sessionDate.setHours(0,0,0,0);
        setCalendarDates([sessionDate]);
        setCalendarView({ month: sessionDate.getMonth(), year: sessionDate.getFullYear() });
        
        setModalForm({
            teacherId: session.teacherId?._id || session.teacherId || '',
            time:      get24HFromDate(session.startTime),
            endTime:   session.endTime
                ? get24HFromDate(session.endTime)
                : get24HFromDate(new Date(session.startTime).getTime() + 60*60*1000),
            platform:  session.platform,
            link:      session.link,
        });
        setModalTeachers([]);
        setScheduleModal({ open: true, classLevel: session.classLevel, subjectName: session.subjectName, subjectId: session.subjectId || '', isEdit: true, sessionId: session._id });
        setModalTeachersLoading(true);
        const teachers = await loadTeachersForSubject(session.classLevel, session.subjectName);
        setModalTeachers(teachers.length > 0 ? teachers : allTeachers);
        setModalTeachersLoading(false);
    }, [loadTeachersForSubject, allTeachers]);

    // ── Delete session ────────────────────────────────────────────────────────
    const handleDeleteSession = async (sessionId) => {
        if (deleteConfirmId !== sessionId) {
            setDeleteConfirmId(sessionId);
            setTimeout(() => setDeleteConfirmId(null), 3000);
            return;
        }
        setDeleteConfirmId(null);
        try {
            await axios.delete(`/admin/live-sessions/${sessionId}`);
            fetchData();
        } catch (err) {
            alert('Delete failed: ' + (err.response?.data?.message || err.message));
        }
    };

    // ── Stop recurring schedule ───────────────────────────────────────────────
    const handleStopRecurring = async (scheduleId) => {
        if (!window.confirm('Stop this recurring schedule? All future sessions will be deleted.')) return;
        try {
            await axios.delete(`/admin/recurring-schedules/${scheduleId}`);
            fetchData();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    // ── Toggle calendar date selection ────────────────────────────────────────
    const toggleCalendarDate = useCallback((date) => {
        setCalendarDates(prev => {
            if (scheduleModal.isEdit) return [date];
            return prev.some(d => isSameDay(d, date))
                ? prev.filter(d => !isSameDay(d, date))
                : [...prev, date];
        });
    }, [scheduleModal.isEdit]);

    // ── Submit: Schedule bulk sessions OR Edit session ────────────────────────
    const handleModalSubmit = async () => {
        setModalError('');
        if (!modalForm.teacherId)                                      return setModalError('Select a teacher!');
        if (!modalForm.link && modalForm.platform !== 'YouTube Live')  return setModalError('Meeting link required!');
        if (calendarDates.length === 0)                                return setModalError('Select at least one date from the calendar!');

        const { classLevel, subjectName, subjectId, isEdit, sessionId } = scheduleModal;
        const [h, m]   = modalForm.time.split(':').map(Number);
        const [eh, em] = (modalForm.endTime || '11:00').split(':').map(Number);
        
        if (isEdit) {
            const date = calendarDates[0];
            const sessionStart = new Date(date);
            sessionStart.setHours(h, m, 0, 0);
            const sessionEnd = new Date(date);
            sessionEnd.setHours(eh, em, 0, 0);
            if (sessionEnd <= sessionStart) sessionEnd.setDate(sessionEnd.getDate() + 1);

            setModalSaving(true);
            try {
                await axios.put(`/admin/live-sessions/${sessionId}`, {
                    teacherId: modalForm.teacherId,
                    startTime: sessionStart.toISOString(),
                    endTime: sessionEnd.toISOString(),
                    platform: modalForm.platform,
                    link: modalForm.link,
                    classLevel,
                    subjectName,
                    board: boardFilter,
                    subjectId: /^[0-9a-fA-F]{24}$/.test(String(subjectId)) ? subjectId : undefined,
                });
                setScheduleModal({ open: false, classLevel: '', subjectName: '', subjectId: '', isEdit: false, sessionId: null });
                setCalendarDates([]);
                await fetchData();
            } catch (err) {
                setModalError(err.response?.data?.message || err.message);
            } finally {
                setModalSaving(false);
            }
            return;
        }

        const sessions = [];
        const skipped  = [];

        for (const date of [...calendarDates].sort((a, b) => a - b)) {
            const sessionStart = new Date(date);
            sessionStart.setHours(h, m, 0, 0);

            // Skip past times (5-min grace period)
            const graceTime = new Date();
            graceTime.setMinutes(graceTime.getMinutes() - 5);
            if (sessionStart < graceTime) {
                skipped.push(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' (past)');
                continue;
            }

            const sessionEnd = new Date(date);
            sessionEnd.setHours(eh, em, 0, 0);
            if (sessionEnd <= sessionStart) sessionEnd.setDate(sessionEnd.getDate() + 1);

            // Skip local duplicates
            const duplicate = allSessions.find(s =>
                s.classLevel   === classLevel &&
                s.subjectName  === subjectName &&
                s.board        === boardFilter &&
                isSameDay(new Date(s.startTime), date) &&
                new Date(s.startTime).getHours()   === h &&
                new Date(s.startTime).getMinutes() === m
            );
            if (duplicate) {
                skipped.push(date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' (exists)');
                continue;
            }

            sessions.push({
                platform:   modalForm.platform,
                link:       modalForm.link,
                teacherId:  modalForm.teacherId,
                classLevel,
                subjectName,
                board:      boardFilter,
                subjectId:  /^[0-9a-fA-F]{24}$/.test(String(subjectId)) ? subjectId : undefined,
                startTime:  sessionStart.toISOString(),
                endTime:    sessionEnd.toISOString(),
            });
        }

        if (sessions.length === 0) {
            return setModalError(`No valid sessions.${skipped.length > 0 ? ` Skipped: ${skipped.join(', ')}` : ''}`);
        }

        setModalSaving(true);
        try {
            await axios.post('/admin/live-sessions', { sessions });
            setScheduleModal({ open: false, classLevel: '', subjectName: '', subjectId: '', isEdit: false, sessionId: null });
            setCalendarDates([]);
            if (skipped.length > 0) {
                alert(`✅ ${sessions.length} session(s) scheduled.\n⚠️ Skipped: ${skipped.join(', ')}`);
            }
            await fetchData();
        } catch (err) {
            setModalError(err.response?.data?.message || err.message);
        } finally {
            setModalSaving(false);
        }
    };


    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="-mt-4 md:-mt-6 space-y-4 relative w-full">

            {/* ══ STICKY PAGE HEADER ════════════════════════════════════════ */}
            <div
                ref={headerRef}
                className="sticky top-20 z-40 bg-white shadow-sm rounded-b-xl border-x border-b border-slate-200 overflow-hidden"
            >
                {/* Single Row — Title + Week Nav + View Toggle */}
                <div className="flex items-center justify-between pt-3 pb-2 px-6">
                    {/* Left: Title + Week Nav */}
                    <div className="flex items-center gap-6">
                        <h1 className="text-lg font-bold text-slate-800">Live &amp; Schedule Class</h1>

                        {/* Week navigation (timetable only) */}
                        {viewType === 'roster' && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setWeekOffset(w => w - 1)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all font-bold text-base"
                                >‹</button>

                                <span className="text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 min-w-[200px] text-center">
                                    {navInfo.weekLabel}
                                </span>

                                <button
                                    onClick={() => setWeekOffset(w => w + 1)}
                                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all font-bold text-base"
                                >›</button>

                                {/* Today button — only show when not on current week */}
                                {weekOffset !== 0 && (
                                    <button
                                        onClick={() => { setWeekOffset(0); setMonthOffset(0); }}
                                        className="ml-1 px-3 py-1 text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                                    >
                                        Today
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right: Toggles & Badges */}
                    <div className="flex items-center gap-3">
                        {/* Active series badge */}
                        {recurringSchedules.filter(s => s.board === boardFilter).length > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-bold">
                                <Activity className="w-3 h-3" />
                                {recurringSchedules.filter(s => s.board === boardFilter).length} Series
                            </div>
                        )}
                        {/* Timetable / Monitors toggle */}
                        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                            <button
                                onClick={() => setViewType('roster')}
                                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                                    viewType === 'roster' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Calendar className="w-3.5 h-3.5" /> Timetable
                            </button>
                            <button
                                onClick={() => setViewType('monitor')}
                                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                                    viewType === 'monitor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Activity className="w-3.5 h-3.5" /> Monitors
                            </button>
                        </div>
                    </div>
                </div>

                {/* Days Header integrated directly into the Sticky Container */}
                {viewType === 'roster' && (
                    <table className="w-full border-collapse table-fixed">
                        <colgroup>
                            <col className="w-[10%] min-w-[100px]" />
                            {weekDates.map((_, i) => <col key={i} className="w-[12.85%] min-w-[120px]" />)}
                        </colgroup>
                        <thead>
                            <tr>
                                {/* Empty subject-label column header */}
                                <th className="bg-white px-3 py-3 border-r border-b border-slate-200" />

                                {/* Day column headers */}
                                {weekDates.map((date, di) => {
                                    const isToday = isSameDay(date, today);
                                    const inMonth = date.getMonth() === navInfo.activeMonth;
                                    return (
                                        <th
                                            key={di}
                                            className={`p-3 text-center transition-all border-r border-b border-slate-200 last:border-r-0 ${
                                                isToday
                                                    ? `${BOARD_THEMES[boardFilter].primary} text-white`
                                                    : `${inMonth ? 'bg-white' : 'bg-slate-50'} text-slate-600`
                                            }`}
                                        >
                                            <span className={`text-xs font-bold whitespace-nowrap ${isToday ? 'text-white' : 'text-slate-800'} ${!inMonth ? 'opacity-40' : ''}`}>
                                                {fmtDay(date)}, {fmtDate(date)}
                                            </span>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                    </table>
                )}
            </div>

            {/* ── Timetable View ────────────────────────────────────────────── */}
            {viewType === 'roster' && (
                <div className="w-full">
                    <div className="pb-10 w-full">
                        <div className="bg-white rounded-b-xl shadow-sm border-x border-b border-slate-200 mb-6">
                        <table className="w-full border-collapse table-fixed">
                            <colgroup>
                                <col className="w-[10%] min-w-[100px]" />
                                {weekDates.map((_, i) => <col key={i} className="w-[12.85%] min-w-[120px]" />)}
                            </colgroup>
                            {/* Thead is now merged into the sticky page header above */}

                            <tbody>
                                {allClasses.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="p-10 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-400">
                                                <AlertCircle className="w-10 h-10" />
                                                <p className="font-semibold">No classes or subjects found.</p>
                                                <p className="text-xs">Add classes in Pricing Management or check backend connection.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : allClasses.map((lvl, ridx) => {
                                    const isExpanded = expandedClasses.includes(lvl);
                                    const subs = getSubjectsForLevel(lvl);

                                    return (
                                        <React.Fragment key={ridx}>
                                            {/* ── Class header row ── */}
                                            <tr
                                                className="transition-colors cursor-pointer group sticky top-0 z-30"
                                                onClick={() => setExpandedClasses(isExpanded ? [] : [lvl])}
                                            >
                                                <td colSpan={8} className={`p-0 transition-colors ${isExpanded ? 'border-b border-indigo-500 bg-indigo-50/10' : 'border-b border-slate-200 bg-white hover:bg-slate-50'}`}>
                                                    <div className="px-4 py-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-1 h-8 rounded-full ${isExpanded ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                                                            <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:text-indigo-600'}`}>
                                                                <BookOpen className="w-4 h-4" />
                                                            </div>
                                                            <div>
                                                                <span className={`font-semibold transition-colors ${isExpanded ? 'text-indigo-900' : 'text-slate-800'}`}>{lvl}</span>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    {(() => {
                                                                        const count = allSessions.filter(s =>
                                                                            (s.classLevel || '').trim().toLowerCase() === (lvl || '').trim().toLowerCase() &&
                                                                            s.board === boardFilter
                                                                        ).length;
                                                                        return (
                                                                            <>
                                                                                <div className={`w-1.5 h-1.5 rounded-full ${count > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                                                <span className="text-xs font-medium text-slate-500">{count} {count === 1 ? 'Slot' : 'Slots'} Scheduled</span>
                                                                            </>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 pr-2">
                                                            {isExpanded && (
                                                                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                                                                    {BOARDS.map(b => (
                                                                        <button
                                                                            key={b}
                                                                            onClick={e => { e.stopPropagation(); setBoardFilter(b); }}
                                                                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${boardFilter === b ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                                                        >
                                                                            {b}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* ── Subject rows ── */}
                                            {isExpanded && subs.map((sub, sIdx) => (
                                                <tr key={sIdx} className={`animate-in fade-in slide-in-from-top-1 duration-300 ${sIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'} border-b border-slate-100 last:border-b-0`}>
                                                    {/* Subject label */}
                                                    <td className="px-2 py-4 border-r border-slate-200 bg-slate-100/50 font-bold text-xs text-slate-700 uppercase leading-tight text-center align-middle">
                                                        {sub.subjectName}
                                                    </td>

                                                    {/* Day cells */}
                                                    {weekDates.map((date, di) => {
                                                        const isToday    = isSameDay(date, today);
                                                        const inMonth    = date.getMonth() === navInfo.activeMonth;
                                                        const isPastDate = date < today;
                                                        const theme      = BOARD_THEMES[boardFilter];

                                                        const daySessions = allSessions
                                                            .filter(s =>
                                                                (s.classLevel   || '').trim().toLowerCase() === (lvl          || '').trim().toLowerCase() &&
                                                                (s.subjectName  || '').trim().toLowerCase() === (sub.subjectName || '').trim().toLowerCase() &&
                                                                s.board === boardFilter &&
                                                                isSameDay(new Date(s.startTime), date)
                                                            )
                                                            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

                                                        // Show ghost preview if this date is selected in the calendar for this subject
                                                        const isPreviewDay =
                                                            scheduleModal.open &&
                                                            scheduleModal.classLevel   === lvl &&
                                                            scheduleModal.subjectName  === sub.subjectName &&
                                                            calendarDates.some(d => isSameDay(d, date)) &&
                                                            !daySessions.some(s =>
                                                                new Date(s.startTime).getHours()   === Number(modalForm.time?.split(':')[0]) &&
                                                                new Date(s.startTime).getMinutes() === Number(modalForm.time?.split(':')[1])
                                                            );

                                                        return (
                                                            <td key={di} className={`p-2 align-top transition-colors border-r border-slate-50 last:border-r-0 ${isToday ? `bg-${theme.main}-50/30 border-x border-${theme.main}-100` : !inMonth ? 'bg-slate-50/30' : ''}`}>
                                                                <div className="flex flex-col h-full min-h-[60px]">

                                                                    {/* ── Session cards ── */}
                                                                    <div className="flex flex-col gap-2 flex-grow">
                                                                        {daySessions.map((s, sidx) => {
                                                                            const now        = new Date();
                                                                            const sessionEnd = new Date(s.endTime || new Date(s.startTime).getTime() + 60*60*1000);
                                                                            const isLive     = s.status === 'live'    && sessionEnd > now;
                                                                            const isEnded    = s.status === 'ended'   || (s.status === 'live'     && sessionEnd <= now);
                                                                            const isMissed   = s.status === 'missed'  || (s.status === 'upcoming' && sessionEnd < now);

                                                                            const startStr = fmt24To12(get24HFromDate(s.startTime));
                                                                            const endStr   = fmt24To12(get24HFromDate(s.endTime || new Date(s.startTime).getTime() + 60*60*1000));
                                                                            const sp = startStr.split(' ')[1];
                                                                            const ep = endStr.split(' ')[1];
                                                                            const timeLabel = sp === ep
                                                                                ? `${startStr.replace(` ${sp}`, '')}–${endStr}`
                                                                                : `${startStr}–${endStr}`;

                                                                            return (
                                                                                <div
                                                                                    key={sidx}
                                                                                    className={`p-2 border rounded-md shadow-sm flex flex-col justify-between transition-colors relative group/card hover:border-indigo-300 hover:shadow-md ${
                                                                                        deleteConfirmId === s._id  ? 'border-rose-400 bg-rose-50 z-20' :
                                                                                        isLive   ? 'bg-rose-50 border-rose-300 animate-pulse' :
                                                                                        isEnded  ? 'bg-emerald-50 border-emerald-200' :
                                                                                        isMissed ? 'bg-orange-50 border-orange-200 opacity-90' :
                                                                                        `bg-white ${theme.border}`
                                                                                    }`}
                                                                                >
                                                                                    {/* Color stripe */}
                                                                                    <div className={`absolute left-0 top-1 bottom-1 w-[3px] rounded-r-sm ${isLive ? 'bg-rose-500' : isEnded ? 'bg-emerald-500' : isMissed ? 'bg-orange-400' : theme.primary}`} />

                                                                                    <div className="flex items-center justify-between pl-1.5">
                                                                                        <div className="flex flex-col">
                                                                                            <span className={`text-[10px] font-bold whitespace-nowrap ${isLive ? 'text-rose-600' : isEnded ? 'text-emerald-700' : isMissed ? 'text-orange-500 line-through' : 'text-slate-600'}`}>
                                                                                                {timeLabel}
                                                                                            </span>
                                                                                        </div>
                                                                                        {/* Action buttons */}
                                                                                        <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                                                            {(isLive || isEnded || isMissed)
                                                                                                ? <span className="p-1 text-slate-300"><Lock className="w-3 h-3" /></span>
                                                                                                : deleteConfirmId === s._id
                                                                                                ? <button onClick={() => handleDeleteSession(s._id)} className="p-1 text-white bg-rose-600 rounded"><Trash2 className="w-3 h-3" /></button>
                                                                                                : <>
                                                                                                    <button onClick={() => openEditSession(s)}        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Edit">  <Edit2  className="w-3 h-3" /></button>
                                                                                                    <button onClick={() => setDeleteConfirmId(s._id)} className="p-1 text-slate-400 hover:text-rose-600  hover:bg-rose-50  rounded" title="Delete"><Trash2 className="w-3 h-3" /></button>
                                                                                                </>
                                                                                            }
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="pl-1.5 mt-1">
                                                                                        <p className={`text-xs font-semibold truncate ${isLive ? 'text-rose-700' : isMissed ? 'text-orange-700' : isEnded ? 'text-emerald-700' : 'text-slate-800'}`}>
                                                                                            {s.teacherId?.name || 'TBA'}
                                                                                        </p>
                                                                                        {isLive && (
                                                                                            <a href={s.link?.startsWith('http') ? s.link : `https://${s.link}`} target="_blank" rel="noreferrer"
                                                                                               className="mt-1 flex items-center justify-center w-full py-1 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700 transition-colors">
                                                                                                Join Now
                                                                                            </a>
                                                                                        )}
                                                                                        <div className="mt-1 flex items-center justify-between">
                                                                                            <span className="text-[10px] font-medium text-slate-500">{s.platform}</span>
                                                                                            {isMissed && <span className="text-[9px] font-bold text-orange-600 bg-orange-100 px-1 rounded uppercase">Missed</span>}
                                                                                            {isEnded  && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1 rounded uppercase">Ended</span>}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>

                                                                    {/* ── Calendar preview ghost card ── */}
                                                                    {isPreviewDay && (
                                                                        <div className="mt-2 p-2.5 border-2 border-dashed border-indigo-300 bg-indigo-50/40 rounded-xl space-y-1 animate-pulse">
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-[10px] font-black text-indigo-500">{fmt24To12(modalForm.time)}</span>
                                                                                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                                                                            </div>
                                                                            <p className="text-[10px] font-black text-indigo-900/50 uppercase leading-tight truncate">
                                                                                {allTeachers.find(t => t._id === modalForm.teacherId)?.name || 'Preview...'}
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    {/* ── Add Slot button (future dates only) ── */}
                                                                    {!isPastDate && (
                                                                        <button
                                                                            onClick={() => openScheduler(lvl, sub.subjectName, sub.id)}
                                                                            className={`w-full py-2.5 mt-2 border border-dashed border-slate-300 text-slate-400 rounded-md flex items-center justify-center gap-1.5 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all opacity-80 hover:opacity-100 ${daySessions.length === 0 ? 'min-h-[44px]' : ''}`}
                                                                        >
                                                                            <Plus className="w-3.5 h-3.5" />
                                                                            <span className="text-[10px] uppercase font-bold tracking-wider">Add Slot</span>
                                                                        </button>
                                                                    )}

                                                                    {/* ── Past date with no session ── */}
                                                                    {isPastDate && daySessions.length === 0 && (
                                                                        <div className="flex-grow flex items-center justify-center py-4 opacity-25 select-none">
                                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">No Session</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Monitor View ───────────────────────────────────────────────── */}
            {viewType === 'monitor' && (
                <div className="space-y-4">
                    <LiveSessionStats sessions={allSessions} />
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {allSessions.length === 0 && (
                            <div className="col-span-full py-16 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
                                <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                <p className="text-sm font-semibold text-slate-800">No Sessions Scheduled</p>
                                <p className="text-xs text-slate-500 mt-1">Use the Timetable view to add classes.</p>
                            </div>
                        )}
                        {[...allSessions]
                            .sort((a, b) => {
                                const w = { live: 0, upcoming: 1, ended: 2 };
                                return (w[a.status] ?? 1) - (w[b.status] ?? 1) || new Date(a.startTime) - new Date(b.startTime);
                            })
                            .map((s, idx) => <LiveSessionCard key={s._id || idx} session={s} />)
                        }
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
                SCHEDULE MODAL — Calendar-based bulk scheduling
            ════════════════════════════════════════════════════════════════ */}
            {scheduleModal.open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={e => { if (e.target === e.currentTarget) setScheduleModal({ open: false, classLevel: '', subjectName: '', subjectId: '' }); }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-[700px] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">{scheduleModal.isEdit ? 'Edit Session' : 'Schedule Sessions'}</h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    <span className="font-bold text-indigo-600">{scheduleModal.subjectName}</span>
                                    <span className="mx-1.5 text-slate-300">·</span>
                                    {scheduleModal.classLevel}
                                    <span className="mx-1.5 text-slate-300">·</span>
                                    {boardFilter}
                                </p>
                            </div>
                            <button
                                onClick={() => setScheduleModal({ open: false, classLevel: '', subjectName: '', subjectId: '', isEdit: false, sessionId: null })}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body: Calendar + Form */}
                        <div className="p-5 grid grid-cols-2 gap-8">

                            {/* Left: Calendar */}
                            <div>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">{scheduleModal.isEdit ? 'Select Date' : 'Select Dates'}</p>
                                <MiniCalendar
                                    selectedDates={calendarDates}
                                    onToggleDate={toggleCalendarDate}
                                    month={calendarView.month}
                                    year={calendarView.year}
                                    onPrevMonth={() => setCalendarView(v => {
                                        const m = v.month - 1;
                                        return m < 0 ? { month: 11, year: v.year - 1 } : { month: m, year: v.year };
                                    })}
                                    onNextMonth={() => setCalendarView(v => {
                                        const m = v.month + 1;
                                        return m > 11 ? { month: 0, year: v.year + 1 } : { month: m, year: v.year };
                                    })}
                                />
                                {calendarDates.length > 0 && (
                                    <div className="mt-3 px-3 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                                        <span className="text-xs font-black text-indigo-600">
                                            {calendarDates.length} date{calendarDates.length !== 1 ? 's' : ''} selected
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Right: Form fields */}
                            <div className="space-y-4">
                                {/* Teacher */}
                                <div>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Teacher</p>
                                    <select
                                        value={modalForm.teacherId}
                                        onChange={e => setModalForm(f => ({ ...f, teacherId: e.target.value }))}
                                        className={`w-full text-sm font-medium bg-white border rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 transition-colors ${!modalForm.teacherId ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'}`}
                                    >
                                        <option value="">{modalTeachersLoading ? 'Loading...' : 'Select Teacher'}</option>
                                        {modalTeachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                        {!modalTeachersLoading && modalTeachers.length === 0 && (
                                            <option disabled>⚠️ No teachers assigned to this subject</option>
                                        )}
                                    </select>
                                </div>

                                {/* Time */}
                                <div className="bg-slate-50 rounded-xl p-3 space-y-2.5 border border-slate-100">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Time</p>
                                    <TimePicker label="Start" value={modalForm.time}    onChange={v => setModalForm(f => ({ ...f, time: v }))} />
                                    <TimePicker label="End"   value={modalForm.endTime} onChange={v => setModalForm(f => ({ ...f, endTime: v }))} />
                                </div>

                                {/* Platform */}
                                <div>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Platform</p>
                                    <select
                                        value={modalForm.platform}
                                        onChange={e => setModalForm(f => ({ ...f, platform: e.target.value }))}
                                        className="w-full text-sm font-medium bg-white border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500"
                                    >
                                        {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                                    </select>
                                </div>

                                {/* Link */}
                                <div>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Meeting Link</p>
                                    <div className="relative">
                                        <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="url"
                                            placeholder="https://meet.google.com/..."
                                            value={modalForm.link}
                                            onChange={e => setModalForm(f => ({ ...f, link: e.target.value }))}
                                            className="w-full text-sm font-medium bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-indigo-500 placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>

                                {modalError && (
                                    <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">{modalError}</div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 px-5 pb-5">
                            <button
                                onClick={() => setScheduleModal({ open: false, classLevel: '', subjectName: '', subjectId: '', isEdit: false, sessionId: null })}
                                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleModalSubmit}
                                disabled={modalSaving || calendarDates.length === 0}
                                className={`flex-1 py-2.5 text-sm font-black rounded-xl text-white flex items-center justify-center gap-2 transition-colors ${
                                    modalSaving || calendarDates.length === 0
                                        ? 'bg-indigo-300 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                            >
                                {modalSaving
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Check className="w-4 h-4" />
                                }
                                {modalSaving
                                    ? (scheduleModal.isEdit ? 'Saving...' : 'Scheduling...')
                                    : (scheduleModal.isEdit ? 'Save Changes' : `Schedule ${calendarDates.length} Session${calendarDates.length !== 1 ? 's' : ''}`)
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default LiveMonitor;
