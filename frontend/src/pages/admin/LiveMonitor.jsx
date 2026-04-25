import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
    Activity, Loader2, BookOpen, Plus, X, Calendar, Video,
    Check, ChevronDown, ChevronRight, Edit2, Trash2, Clock,
    ShieldCheck, Link as LinkIcon, AlertCircle, Users
} from 'lucide-react';

import io from 'socket.io-client';

// ─── Socket Initialization ───────────────────────────────────────────────────
const getSocketUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace('/api', '').replace(/\/$/, '');
    }
    return `${window.location.protocol}//${window.location.hostname}:5000`;
};

const socket = io(getSocketUrl(), {
    transports: ['polling', 'websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000
});

// ─── Constants ───────────────────────────────────────────────────────────────
const BOARDS = ['AP Board', 'TS Board', 'CBSE', 'ICSE'];
const BOARD_THEMES = {
    'AP Board': { main: 'indigo', primary: 'bg-indigo-600', secondary: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', hover: 'hover:bg-indigo-700', active: 'ring-indigo-100' },
    'TS Board': { main: 'rose', primary: 'bg-rose-600', secondary: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', hover: 'hover:bg-rose-700', active: 'ring-rose-100' },
    'CBSE': { main: 'amber', primary: 'bg-amber-600', secondary: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', hover: 'hover:bg-amber-700', active: 'ring-amber-100' },
    'ICSE': { main: 'emerald', primary: 'bg-emerald-600', secondary: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', hover: 'hover:bg-emerald-700', active: 'ring-emerald-100' }
};
const PLATFORMS = ['Google Meet'];
const DAYS_META = [
    { label: 'S', value: 0 }, { label: 'M', value: 1 }, { label: 'T', value: 2 },
    { label: 'W', value: 3 }, { label: 'T', value: 4 }, { label: 'F', value: 5 },
    { label: 'S', value: 6 }
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

const fmtDay = d => d.toLocaleDateString('en-IN', { weekday: 'short' });
const fmtDate = d => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
const fmtTime = d => {
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return String(d);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch { return String(d);
                                                                     }
};
const fmt24To12 = (t24) => {
    if (!t24) return '--:--';
    const [h, m] = t24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
};
const get24HFromDate = (d) => {
    try {
        const date = new Date(d);
        if (isNaN(date.getTime())) return '10:00';
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch { return '10:00'; }
};

/** Returns 7 Date objects for Sun-Sat of the week defined by weekOffset */
const getWeekDates = (weekOffset = 0) => {
    const now = new Date();
    now.setDate(now.getDate() + (weekOffset * 7));
    now.setHours(0, 0, 0, 0);
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - now.getDay());
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(sunday);
        d.setDate(sunday.getDate() + i);
        return d;
    });
};

/** Build a concrete Date for a given weekday in the same week as `anchor` */
const dateForDayInWeek = (anchor, dayOfWeek, hour, minute) => {
    const sunday = new Date(anchor);
    sunday.setDate(anchor.getDate() - anchor.getDay());
    sunday.setHours(hour, minute, 0, 0);
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + dayOfWeek);
    return d;
};

// ─── Default form state ───────────────────────────────────────────────────────
const EMPTY_CELL_FORM = {
    sessionId: '',
    subjectId: '',
    subjectName: '',
    teacherId: '',
    time: '10:00',
    endTime: '11:00',
    platform: 'Google Meet',
    link: '',
    board: 'AP Board',
    selectedDays: [],   // day numbers 0-6
    scheduleType: 'once', // 'once' | '1week' | '2weeks' | '1month' | 'everyday'
};

// ─────────────────────────────────────────────────────────────────────────────
const LiveMonitor = () => {
    const handleStopRecurring = async (scheduleId) => {
        if (!window.confirm('Are you sure you want to stop this daily recurring schedule? ALL future sessions in this series will be deleted.')) return;
        try {
            setCellSaving(true);
            await axios.delete(`/admin/recurring-schedules/${scheduleId}`);
            await fetchData();
            setActiveCell(null);
        } catch (err) {
            setCellError(err.response?.data?.message || 'Error stopping recurring schedule');
        } finally {
            setCellSaving(false);
        }
    };

    // ── Data ──────────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [allSessions, setAllSessions] = useState([]);
    const [recurringSchedules, setRecurringSchedules] = useState([]);
    const [allClasses, setAllClasses] = useState([]);
    const [allBundlesDB, setAllBundlesDB] = useState([]);
    const [allSubjectsDB, setAllSubjectsDB] = useState([]);
    const [allTeachers, setAllTeachers] = useState([]);   // ALL teachers (for fallback)

    // ── UI ────────────────────────────────────────────────────────────────────
    const [viewType, setViewType] = useState('roster');
    const [expandedClasses, setExpandedClasses] = useState([]);
    const [boardFilter, setBoardFilter] = useState('AP Board');

    // ── Inline cell scheduler ─────────────────────────────────────────────────
    const [activeCell, setActiveCell] = useState(null); // { classLevel, date, subjectName }
    const [cellForm, setCellForm] = useState(EMPTY_CELL_FORM);
    const [cellTeachers, setCellTeachers] = useState([]);
    const [cellLoadingTeachers, setCellLoadingTeachers] = useState(false);
    const [cellSaving, setCellSaving] = useState(false);
    const [cellError, setCellError] = useState('');
    const [lastForm, setLastForm] = useState(null);  // remembered defaults
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);  // session id awaiting delete confirm

    const [weekOffset, setWeekOffset] = useState(0);
    const [monthOffset, setMonthOffset] = useState(0); // -1, 0, or +1 only
    const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
    const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

    // ── Month & Week Navigation Logic ────────────────────────────────────────
    const navInfo = useMemo(() => {
        const now = new Date();
        const activeMonthIndex = now.getMonth() + monthOffset;
        const activeYear = now.getFullYear() + Math.floor(activeMonthIndex / 12);
        const normalizedMonth = ((activeMonthIndex % 12) + 12) % 12;
        
        const monthStart = new Date(activeYear, normalizedMonth, 1);
        const monthEnd = new Date(activeYear, normalizedMonth + 1, 0);
        
        const curWeekStart = weekDates[0];
        const curWeekEnd = weekDates[6];
        
        const prevWStart = new Date(curWeekStart); prevWStart.setDate(prevWStart.getDate() - 7);
        const nextWStart = new Date(curWeekStart); nextWStart.setDate(nextWStart.getDate() + 7);
        
        return {
            monthLabels: [-1, 0, 1].map(offset => {
                const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
                return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
            }),
            activeMonth: normalizedMonth,
            activeYear: activeYear,
            weekLabel: `${curWeekStart.getDate()} ${curWeekStart.toLocaleDateString('en-IN',{month:'short'})} – ${curWeekEnd.getDate()} ${curWeekEnd.toLocaleDateString('en-IN',{month:'short'})}`,
            canGoPrev: prevWStart >= monthStart || curWeekStart > monthStart,
            canGoNext: nextWStart <= monthEnd
        };
    }, [monthOffset, weekDates]);

    const handleMonthJump = (offset) => {
        const now = new Date();
        setMonthOffset(offset);
        if (offset === 0) {
            setWeekOffset(0);
        } else {
            const thisSun = new Date(now);
            thisSun.setDate(now.getDate() - now.getDay());
            thisSun.setHours(0,0,0,0);
            const targetMonthStart = new Date(now.getFullYear(), now.getMonth() + offset, 1);
            const targetSun = new Date(targetMonthStart);
            targetSun.setDate(targetMonthStart.getDate() - targetMonthStart.getDay());
            setWeekOffset(Math.round((targetSun - thisSun) / (7 * 24 * 60 * 60 * 1000)));
        }
    };


    // ── Fetch all data ────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            console.log('LiveMonitor: Fetching data...');
            const [sessRes, classRes, subjRes, teachRes, recRes] = await Promise.allSettled([
                axios.get('/admin/live-sessions'),
                axios.get('/admin/classes'),
                axios.get('/admin/subjects'),
                axios.get('/admin/teachers-list'),
                axios.get('/admin/recurring-schedules'),
            ]);

            const sessions = sessRes.status === 'fulfilled' ? sessRes.value.data : [];
            const bundles = classRes.status === 'fulfilled' ? classRes.value.data : [];
            const subjects = subjRes.status === 'fulfilled' ? subjRes.value.data : [];
            const teachers = teachRes.status === 'fulfilled' ? teachRes.value.data : [];

            if (classRes.status === 'rejected') console.error('LiveMonitor: Classes API failed:', classRes.reason);
            if (subjRes.status === 'rejected') console.error('LiveMonitor: Subjects API failed:', subjRes.reason);

            setAllSessions(sessions);
            setAllBundlesDB(bundles);
            setAllSubjectsDB(subjects);
            setAllTeachers(teachers);
            setRecurringSchedules(recRes.status === 'fulfilled' ? recRes.value.data : []);

            // Build sorted class list
            const bundleNames = bundles.map(b => b.className || `Class ${b.classLevel}`);
            const subjectLevels = subjects.map(s => `Class ${s.classLevel}`);
            const combined = [...new Set([...bundleNames, ...subjectLevels])];
            
            combined.sort((a, b) => {
                const n = s => parseInt((String(s).match(/\d+/) || [0])[0]);
                return n(a) - n(b);
            });
            if (combined.length === 0) {
                console.warn('LiveMonitor: No classes or subjects returned from backend.');
            }
            
            console.log('LiveMonitor: Final matches:', { sessionsCount: sessions.length, classesCount: combined.length });
            setAllClasses(combined);
        } catch (err) {
            console.error('LiveMonitor: fetchData fatal error:', err);
            alert('Data Fetch Failed! Check Backend Console.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        // Listen for real-time updates from other admins/backend
        socket.on('live-session-update', (data) => {
            console.log('LiveMonitor: External update detected:', data.type);
            fetchData();
        });

        return () => {
            socket.off('live-session-update');
        };
    }, [fetchData]);

    // ── Subjects for a class level ────────────────────────────────────────────
    const getSubjectsForLevel = useCallback((classLevel) => {
        const levelNum = parseInt(classLevel.replace(/\D/g, ''));
        const fromSubjectModel = allSubjectsDB.filter(s => s.classLevel === levelNum);
        if (fromSubjectModel.length > 0) {
            return fromSubjectModel.map(s => ({ id: s._id, subjectName: s.name, classLevel, type: 'subject' }));
        }
        const bundle = allBundlesDB.find(b => b.className === classLevel);
        if (bundle?.subjects?.length > 0) {
            return bundle.subjects.map(s => ({
                id: `${classLevel}::${s.name}`,
                subjectName: s.name,
                classLevel,
                type: 'bundle-subject'
            }));
        }
        return [{ id: classLevel, subjectName: classLevel, classLevel, type: 'bundle' }];
    }, [allSubjectsDB, allBundlesDB]);

    // ── Load teachers for a subject ───────────────────────────────────────────
    const loadTeachersForSubject = useCallback(async (classLevel, subjectName) => {
        setCellLoadingTeachers(true);
        setCellTeachers([]);
        try {
            const params = new URLSearchParams({ classLevel, subjectName });
            const res = await axios.get(`/admin/teachers-for-subject?${params}`);
            const list = res.data || [];
            // Fallback to ALL teachers if none assigned to this subject
            setCellTeachers(list.length > 0 ? list : allTeachers);
        } catch {
            setCellTeachers(allTeachers);
        } finally {
            setCellLoadingTeachers(false);
        }
    }, [allTeachers]);

    // ── Open the inline scheduler ─────────────────────────────────────────────
    const openCellScheduler = useCallback((classLevel, date, existingSession = null, subjectName = null) => {
        setCellError('');
        const subs = getSubjectsForLevel(classLevel);

        if (existingSession) {
            // EDIT mode
            const foundSub = subs.find(s => s.subjectName === existingSession.subjectName) || subs[0];
            setCellForm({
                sessionId: existingSession._id,
                subjectId: foundSub?.id || '',
                subjectName: existingSession.subjectName,
                teacherId: existingSession.teacherId?._id || existingSession.teacherId || '',
                time: get24HFromDate(existingSession.startTime),
                endTime: existingSession.endTime ? get24HFromDate(existingSession.endTime) : get24HFromDate(new Date(existingSession.startTime).getTime() + 60*60*1000),
                platform: existingSession.platform,
                link: existingSession.link,
                board: existingSession.board || boardFilter,
                selectedDays: [],
            });
            loadTeachersForSubject(classLevel, existingSession.subjectName);
        } else {
            // CREATE mode — use last-used values as smart defaults
            const initSub = subs.find(s => s.subjectName === subjectName) || subs[0];
            const sameSubject = lastForm && lastForm.subjectId === initSub?.id;

            // Smart Time Default: If last used time is already taken in this cell, find next hour
            let defaultTime = lastForm?.time || '10:00';
            let defaultEndTime = lastForm?.endTime || '11:00';
            const [h, m] = defaultTime.split(':').map(Number);

            // Check if this specific subject+time exists on this day
            const exists = allSessions.some(s =>
                s.classLevel === classLevel &&
                s.subjectName === (subjectName || initSub?.subjectName) &&
                isSameDay(new Date(s.startTime), date) &&
                new Date(s.startTime).getHours() === h &&
                new Date(s.startTime).getMinutes() === m
            );

            if (exists) {
                // If 10:00 is taken, try 11:00, 12:00 etc.
                let nextHour = (h + 1) % 24;
                defaultTime = `${nextHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                let nextEndHour = (nextHour + 1) % 24;
                defaultEndTime = `${nextEndHour.toString().padStart(2, '0')}:${defaultEndTime.split(':')[1] || '00'}`;
            }

            setCellForm({
                ...EMPTY_CELL_FORM,
                subjectId: initSub?.id || '',
                subjectName: initSub?.subjectName || '',
                teacherId: sameSubject ? (lastForm.teacherId || '') : '',
                time: defaultTime,
                endTime: defaultEndTime,
                platform: lastForm?.platform || 'Zoom',
                link: lastForm?.link || '',
                board: boardFilter,
                selectedDays: [date.getDay()],
            });
            if (initSub) loadTeachersForSubject(classLevel, initSub.subjectName);
        }

        setActiveCell({ classLevel, date, subjectName: subjectName || existingSession?.subjectName });
    }, [getSubjectsForLevel, loadTeachersForSubject, lastForm, boardFilter, allSessions]);

    // ── Delete session ────────────────────────────────────────────────────────
    const handleDeleteSession = async (sessionId) => {
        if (deleteConfirmId !== sessionId) {
            // First click: ask for confirmation
            setDeleteConfirmId(sessionId);
            setTimeout(() => setDeleteConfirmId(null), 3000); // auto-cancel after 3s
            return;
        }
        // Second click: confirmed, delete
        setDeleteConfirmId(null);
        try {
            await axios.delete(`/admin/live-sessions/${sessionId}`);
            fetchData();
        } catch (err) {
            alert('Delete failed: ' + (err.response?.data?.message || err.message));
        }
    };

    // ── Save (create or update) ───────────────────────────────────────────────
    const handleCellSubmit = async () => {
        setCellError('');

        if (!cellForm.teacherId) return setCellError('Select a teacher!');
        if (!cellForm.link && cellForm.platform !== 'YouTube Live') return setCellError('Meeting link required!');
        if (!cellForm.time) return setCellError('Time required!');

        const { classLevel, date } = activeCell;
        const subs = getSubjectsForLevel(classLevel);
        const sub = subs.find(s => String(s.id) === String(cellForm.subjectId)) || subs[0];
        if (!sub) return setCellError('No subject found.');

        const [h, m] = cellForm.time.split(':').map(Number);
        const [eh, em] = (cellForm.endTime || '11:00').split(':').map(Number);
        const board = cellForm.board || boardFilter;

        const sessionStart = new Date(date);
        sessionStart.setHours(h, m, 0, 0);
        if (sessionStart < new Date() && !cellForm.sessionId && cellForm.scheduleType === 'once') {
            return setCellError('Cannot schedule a session for a past time!');
        }

        const payload = {
            platform: cellForm.platform,
            link: cellForm.link,
            teacherId: cellForm.teacherId,
            classLevel,
            subjectName: sub.subjectName,
            board,
            subjectId: sub.type === 'subject' && /^[0-9a-fA-F]{24}$/.test(String(sub.id)) ? sub.id : undefined,
        };

        // Duplicate check — block if same subject already scheduled on same day+time
        if (!cellForm.sessionId) {
            const days = cellForm.selectedDays.length > 0 ? cellForm.selectedDays : [date.getDay()];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const hardConflicts = [];
            const softConflicts = [];

            days.forEach(dayNum => {
                const dt = dateForDayInWeek(date, dayNum, h, m);
                const match = allSessions.find(s =>
                    s.classLevel === classLevel &&
                    isSameDay(new Date(s.startTime), dt) &&
                    new Date(s.startTime).getHours() === h &&
                    new Date(s.startTime).getMinutes() === m
                );

                if (match) {
                    const timeStr = fmt24To12(`${h}:${m}`);
                    const info = `${dayNames[dayNum]} at ${timeStr} (${match.subjectName})`;
                    if (match.subjectName !== sub.subjectName) {
                        hardConflicts.push(info);
                    } else {
                        softConflicts.push(info);
                    }
                }
            });

            if (hardConflicts.length > 0) {
                return setCellError(`Wait! Another class exists: ${hardConflicts.join(', ')}`);
            }
        }

        setCellSaving(true);
        try {
            if (cellForm.sessionId) {
                // UPDATE single session
                const startTime = new Date(date);
                startTime.setHours(h, m, 0, 0);
                const endTime = new Date(date);
                endTime.setHours(eh, em, 0, 0);
                await axios.put(`/admin/live-sessions/${cellForm.sessionId}`, { ...payload, startTime: startTime.toISOString(), endTime: endTime.toISOString() });

            } else if (cellForm.scheduleType === 'everyday') {
                // INFINITE RECURRING — send template to backend cron system
                const startTime = new Date(date);
                startTime.setHours(h, m, 0, 0);
                const endTime = new Date(date);
                endTime.setHours(eh, em, 0, 0);
                await axios.post('/admin/live-sessions', {
                    isRecurring: true,
                    recurringTemplate: { ...payload, startTime: startTime.toISOString(), endTime: endTime.toISOString() }
                });

            } else {
                // CREATE — Bulk sessions for selected days or a date range
                const days = cellForm.selectedDays.length > 0 ? cellForm.selectedDays : [date.getDay()];
                const sessions = [];

                // Determine how many weeks to generate
                let weekCount = 1;
                if (cellForm.scheduleType === '2weeks') weekCount = 2;
                else if (cellForm.scheduleType === '1month') weekCount = 4;

                for (let w = 0; w < weekCount; w++) {
                    days.forEach(dayNum => {
                        const anchor = new Date(date);
                        anchor.setDate(anchor.getDate() + w * 7);
                        const dt = dateForDayInWeek(anchor, dayNum, h, m);
                        const endDt = dateForDayInWeek(anchor, dayNum, eh, em);
                        sessions.push({ ...payload, startTime: dt.toISOString(), endTime: endDt.toISOString() });
                    });
                }
                await axios.post('/admin/live-sessions', { sessions });
            }
            // Remember settings for next time
            setLastForm({ ...cellForm, subjectId: sub.id });
            setActiveCell(null);
            await fetchData();
        } catch (err) {
            setCellError(err.response?.data?.message || err.message);
        } finally {
            setCellSaving(false);
        }
    };

    if (loading) return (
        <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        </div>
    );

    return (
        <div className="space-y-4 relative w-full">

            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                        Live &amp; Schedule Class
                    </h1>
                    <div className="flex flex-col gap-2 mt-1">
                        {viewType === 'roster' && (
                            <>
                                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                    <button
                                        onClick={() => handleMonthJump(-1)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${monthOffset === -1 ? 'bg-white text-[#002147] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        ← {navInfo.monthLabels[0]}
                                    </button>
                                    <button
                                        onClick={() => handleMonthJump(0)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${monthOffset === 0 ? 'bg-[#002147] text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        📅 {navInfo.monthLabels[1]}
                                    </button>
                                    <button
                                        onClick={() => handleMonthJump(1)}
                                        className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${monthOffset === 1 ? 'bg-white text-[#002147] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {navInfo.monthLabels[2]} →
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={!navInfo.canGoPrev}
                                        onClick={() => setWeekOffset(w => w - 1)}
                                        className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-black hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
                                    >
                                        ‹
                                    </button>
                                    <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">{navInfo.weekLabel}</span>
                                    <button
                                        disabled={!navInfo.canGoNext}
                                        onClick={() => setWeekOffset(w => w + 1)}
                                        className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-black hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
                                    >
                                        ›
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {recurringSchedules.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold shadow-sm animate-in fade-in zoom-in duration-500">
                            <Activity className="w-3.5 h-3.5" />
                            <span>{recurringSchedules.length} Active Series</span>
                        </div>
                    )}
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setViewType('roster')}
                            className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-semibold transition-colors ${viewType === 'roster' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Calendar className="w-4 h-4" /> Timetable
                        </button>
                        <button
                            onClick={() => setViewType('monitor')}
                            className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-semibold transition-colors ${viewType === 'monitor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <Activity className="w-4 h-4" /> Monitors
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Timetable grid ───────────────────────────────────────────── */}
            {viewType === 'roster' && (
                <div className="w-full">
                    <div className="overflow-x-auto thin-scrollbar pb-10">
                        <table className="w-full border-separate border-spacing-y-4 px-4 overflow-visible">
                            <thead>
                                <tr className="bg-white border-b shadow-sm sticky top-0 z-40">
                                    <th className="px-3 py-3 text-center bg-white w-[5%] border-r border-slate-100 whitespace-nowrap">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Timetable</span>
                                            <span className="text-[10px] font-medium text-indigo-600 uppercase">Schedule</span>
                                        </div>
                                    </th>
                                    {weekDates.map((date, di) => {
                                        const isToday = isSameDay(date, today);
                                        const isInActiveMonth = date.getMonth() === navInfo.activeMonth;

                                        return (
                                            <th key={di} className={`p-3 text-center transition-all relative border-r border-slate-50 last:border-r-0 ${isToday ? `${BOARD_THEMES[boardFilter].primary} text-white shadow-sm z-30` : `${isInActiveMonth ? 'bg-white' : 'bg-slate-50/50'} text-slate-600`} w-[13.5%] min-w-[120px]`}>
                                                <div className={`flex flex-col items-center gap-0.5 ${!isInActiveMonth ? 'opacity-50' : ''}`}>
                                                    <span className={`text-sm font-bold ${isToday ? 'text-white' : 'text-slate-800'}`}>{fmtDay(date)}</span>
                                                    <span className={`text-xs font-medium ${isToday ? 'text-white/80' : 'text-slate-500'}`}>{fmtDate(date)}</span>
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>

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
                                ) : (
                                    allClasses.map((lvl, ridx) => {
                                    const isExpanded = expandedClasses.includes(lvl);
                                    const subs = getSubjectsForLevel(lvl);

                                    return (
                                        <React.Fragment key={ridx}>
                                            <tr
                                                className={`transition-colors cursor-pointer group sticky top-0 z-30`}
                                                onClick={() => setExpandedClasses(isExpanded ? [] : [lvl])}
                                            >
                                                <td colSpan={8} className={`p-0 rounded-lg border shadow-sm overflow-hidden transition-colors ${isExpanded ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                                                    <div className="px-4 py-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-1 h-8 rounded-full ${isExpanded ? 'bg-indigo-600' : 'bg-slate-300'}`} />

                                                            <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:text-indigo-600'}`}>
                                                                <BookOpen className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex flex-col gap-0.5">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`font-semibold transition-colors ${isExpanded ? 'text-indigo-900' : 'text-slate-800'}`}>{lvl}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {(() => {
                                                                        const count = allSessions.filter(s => s.classLevel === lvl && s.board === boardFilter).length;
                                                                        return (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <div className={`w-1.5 h-1.5 rounded-full ${count > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                                                <span className="text-xs font-medium text-slate-500">{count} {count === 1 ? 'Slot' : 'Slots'} Scheduled</span>
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-6 pr-2">
                                                            {isExpanded && (
                                                                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                                                                    {BOARDS.map(b => {
                                                                        const isActive = boardFilter === b;
                                                                        return (
                                                                            <button
                                                                                key={b}
                                                                                onClick={e => { e.stopPropagation(); setBoardFilter(b);
                                                                     }}
                                                                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${isActive ? `bg-white text-indigo-600 shadow-sm` : 'text-slate-500 hover:text-slate-700'}`}
                                                                            >
                                                                                {b}
                                                                            </button>
                                                                        );
                                                                     })}
                                                                </div>
                                                            )}
                                                            <div className={`px-4 py-2 rounded-md border flex items-center gap-2 text-xs font-semibold transition-colors ${isExpanded ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 group-hover:border-indigo-300 group-hover:text-indigo-600'}`}>
                                                                <span>{isExpanded ? 'Close Schedule' : 'View Schedule'}</span>
                                                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>

                                            {isExpanded && (
                                                <React.Fragment>

                                                    {subs.map((sub, sIdx) => (
                                                        <tr key={sIdx} className={`animate-in fade-in slide-in-from-top-1 duration-300 border-b ${sIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'} border-slate-100 last:border-b-0 group/row`}>
                                                            <td className={`px-2 py-4 border-r border-slate-200 bg-slate-100/50 w-[5%] font-bold text-xs text-slate-700 uppercase leading-tight text-center align-middle whitespace-nowrap`}>
                                                                {sub.subjectName}
                                                            </td>

                                                            {weekDates.map((date, di) => {
                                                                const isToday = isSameDay(date, today);
                                                                const isInActiveMonth = date.getMonth() === navInfo.activeMonth;
                                                                const isPastDate = date < today;

                                                                const activeRecurring = recurringSchedules.find(rs => 
                                                                    rs.classLevel === lvl && 
                                                                    (rs.subjectName || '').trim().toLowerCase() === (sub.subjectName || '').trim().toLowerCase() && 
                                                                    rs.board === boardFilter
                                                                );

                                                                const daySessions = allSessions
                                                                    .filter(s => {
                                                                        if (s.classLevel !== lvl) return false;
                                                                        if (s.subjectName !== sub.subjectName) return false;
                                                                        if (s.board !== boardFilter) return false;
                                                                        if (!isSameDay(new Date(s.startTime), date)) return false;
                                                                        return true;
                                                                    })
                                                                    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

                                                                const isFormOpen =
                                                                    activeCell?.classLevel === lvl &&
                                                                    activeCell?.subjectName === sub.subjectName &&
                                                                    activeCell?.date &&
                                                                    isSameDay(activeCell.date, date);

                                                                const isPreviewDay =
                                                                    !isFormOpen &&
                                                                    activeCell?.classLevel === lvl &&
                                                                    activeCell?.subjectName === sub.subjectName &&
                                                                    (cellForm.selectedDays || []).includes(date.getDay()) &&
                                                                    cellForm.board === boardFilter &&
                                                                    !daySessions.some(s =>
                                                                        new Date(s.startTime).getHours() === Number(cellForm.time?.split(':')[0]) &&
                                                                        new Date(s.startTime).getMinutes() === Number(cellForm.time?.split(':')[1])
                                                                    );

                                                                return (
                                                                    <td key={di} className={`p-2 align-top transition-colors border-r border-slate-50 last:border-r-0 ${isToday ? `bg-${BOARD_THEMES[boardFilter].main}-50/30 border-x border-${BOARD_THEMES[boardFilter].main}-100` : !isInActiveMonth ? 'bg-slate-50/30' : ''}`}>
                                                                        <div className="flex flex-col h-full min-h-[60px]">
                                                                            <div className="flex flex-col gap-2 flex-grow">
                                                                                {daySessions.map((s, sidx) => {
                                                                                    const isLive = s.status === 'live';
                                                                                    const isEnded = s.status === 'ended';
                                                                                    const isMissed = s.status === 'upcoming' && new Date(s.endTime || new Date(s.startTime).getTime() + 60*60*1000) < new Date();
                                                                                    const isPastSessionTime = new Date(s.startTime) < new Date();
                                                                                    const theme = BOARD_THEMES[boardFilter];
                                                                                    return (
                                                                                        <div
                                                                                            key={sidx}
                                                                                            className={`p-2 border rounded-md shadow-sm flex flex-col justify-between transition-colors relative group/card hover:border-indigo-300 hover:shadow-md ${deleteConfirmId === s._id ? 'border-rose-400 bg-rose-50 z-20' : isLive ? 'bg-rose-50 border-rose-200' : isEnded ? 'bg-slate-50 border-slate-200 text-slate-500' : isMissed ? 'bg-orange-50 border-orange-200 text-orange-600 opacity-80' : `bg-white ${theme.border}`}`}
                                                                                        >
                                                                                            <div className={`absolute left-0 top-1 bottom-1 w-[3px] rounded-r-sm ${isLive ? 'bg-rose-500' : isEnded ? 'bg-emerald-500' : isMissed ? 'bg-orange-500' : theme.primary}`} />

                                                                                            <div className="flex items-center justify-between pl-1.5">
                                                                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isLive ? 'text-rose-600' : isEnded ? 'text-emerald-600' : isMissed ? 'text-orange-600 line-through' : 'text-slate-600'}`}>
                                                                                                    {fmt24To12(get24HFromDate(s.startTime))}
                                                                                                </span>
                                                                                                <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                                                                    {!isEnded && !isLive && !isPastSessionTime && (
                                                                                                        <>
                                                                                                            {deleteConfirmId === s._id ? (
                                                                                                                <button onClick={() => handleDeleteSession(s._id)} className="p-1 text-white bg-rose-600 rounded flex gap-1 items-center">
                                                                                                                    <Trash2 className="w-3 h-3" />
                                                                                                                </button>
                                                                                                            ) : (
                                                                                                                <>
                                                                                                                    <button onClick={() => openCellScheduler(lvl, date, s)} className={`p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded`}>
                                                                                                                        <Edit2 className="w-3 h-3" />
                                                                                                                    </button>
                                                                                                                    <button onClick={() => setDeleteConfirmId(s._id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                                                                                                                        <Trash2 className="w-3 h-3" />
                                                                                                                    </button>
                                                                                                                </>
                                                                                                            )}
                                                                                                        </>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>

                                                                                            <div className="pl-1.5 mt-1">
                                                                                                {s.recurringScheduleId && (
                                                                                                    <div className="absolute top-1 right-1 p-0.5 bg-amber-100 rounded group-hover/card:bg-amber-200 transition-colors" title="Daily Recurring Series">
                                                                                                        <Activity className="w-2.5 h-2.5 text-amber-600" />
                                                                                                    </div>
                                                                                                )}
                                                                                                {isLive ? (
                                                                                                    <a href={s.link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1 w-full py-1 bg-rose-600 text-white rounded text-[10px] font-semibold hover:bg-rose-700 transition-colors">
                                                                                                        <Video className="w-3 h-3" /> Join Now
                                                                                                    </a>
                                                                                                ) : (
                                                                                                    <p className={`text-xs font-semibold truncate ${isMissed ? 'text-orange-700' : 'text-slate-800'}`}>{s.teacherId?.name || 'TBA'}</p>
                                                                                                )}
                                                                                                <div className="mt-1 flex items-center justify-between">
                                                                                                    <span className={`text-[10px] font-medium ${isMissed ? 'text-orange-500' : 'text-slate-500'}`}>{s.platform}</span>
                                                                                                    {isMissed && <span className="text-[9px] font-bold text-orange-600 uppercase bg-orange-100 px-1 rounded">Missed</span>}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                     })}
                                                                            </div>

                                                                            {isPreviewDay && (
                                                                                <div className="mt-2 p-2.5 border-2 border-dashed border-indigo-300 bg-indigo-50/40 rounded-2xl space-y-1 animate-pulse overflow-hidden">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <span className="text-[10px] font-black text-indigo-500">{fmt24To12(cellForm.time)}</span>
                                                                                        <ShieldCheck className="w-3 h-3 text-indigo-400" />
                                                                                    </div>
                                                                                    <p className="text-[10px] font-black text-indigo-900/50 uppercase leading-tight truncate">
                                                                                        {allTeachers.find(t => t._id === cellForm.teacherId)?.name || 'Preview...'}
                                                                                    </p>
                                                                                </div>
                                                                            )}

                                                                            {isFormOpen ? (
                                                                                <div className={`mt-2 border rounded-lg bg-white p-3 space-y-3 shadow-lg z-50 relative`}>
                                                                                    <div className="flex items-center justify-between">
                                                                                        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Schedule Session</span>
                                                                                    </div>

                                                                                    <select
                                                                                        value={cellForm.teacherId}
                                                                                        onChange={e => setCellForm(f => ({ ...f, teacherId: e.target.value }))}
                                                                                        className="w-full text-sm font-medium bg-white border border-slate-200 rounded-md px-2 py-1.5 outline-none focus:border-indigo-500"
                                                                                    >
                                                                                        <option value="">Select Teacher</option>
                                                                                        {cellTeachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                                                                    </select>

                                                                                    <div className="bg-slate-50 p-2 rounded-md border border-slate-200">
                                                                                        <div className="flex gap-1.5 items-center mb-2">
                                                                                            <span className="text-[10px] font-bold text-slate-500 uppercase w-8">Start</span>
                                                                                            {(() => {
                                                                                                const [h24, m24] = (cellForm.time || '10:00').split(':').map(Number);
                                                                                                const h12 = h24 % 12 || 12;
                                                                                                const period = h24 >= 12 ? 'PM' : 'AM';
                                                                                                const update = (nh, nm, np) => {
                                                                                                    let h = parseInt(nh);
                                                                                                    if (np === 'PM' && h < 12) h += 12;
                                                                                                    if (np === 'AM' && h === 12) h = 0;
                                                                                                    setCellForm(f => ({ ...f, time: `${h.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')}` }));
                                                                                                };
                                                                                                return (
                                                                                                    <>
                                                                                                        <select value={h12} onChange={e => update(e.target.value, m24, period)} className="flex-1 text-sm font-medium bg-white border border-slate-200 p-1 rounded">
                                                                                                            {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(h => <option key={h} value={h}>{h}</option>)}
                                                                                                        </select>
                                                                                                        <span className="font-bold text-slate-400">:</span>
                                                                                                        <select value={m24} onChange={e => update(h12, e.target.value, period)} className="flex-1 text-sm font-medium bg-white border border-slate-200 p-1 rounded">
                                                                                                            {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => <option key={m} value={m}>{m}</option>)}
                                                                                                        </select>
                                                                                                        <select value={period} onChange={e => update(h12, m24, e.target.value)} className={`flex-1 text-sm font-medium bg-white border border-slate-200 p-1 rounded`}>
                                                                                                            <option value="AM">AM</option>
                                                                                                            <option value="PM">PM</option>
                                                                                                        </select>
                                                                                                    </>
                                                                                                );
                                                                                            })()}
                                                                                        </div>
                                                                                        <div className="flex gap-1.5 items-center">
                                                                                            <span className="text-[10px] font-bold text-slate-500 uppercase w-8">End</span>
                                                                                            {(() => {
                                                                                                const [h24, m24] = (cellForm.endTime || '11:00').split(':').map(Number);
                                                                                                const h12 = h24 % 12 || 12;
                                                                                                const period = h24 >= 12 ? 'PM' : 'AM';
                                                                                                const update = (nh, nm, np) => {
                                                                                                    let h = parseInt(nh);
                                                                                                    if (np === 'PM' && h < 12) h += 12;
                                                                                                    if (np === 'AM' && h === 12) h = 0;
                                                                                                    setCellForm(f => ({ ...f, endTime: `${h.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')}` }));
                                                                                                };
                                                                                                return (
                                                                                                    <>
                                                                                                        <select value={h12} onChange={e => update(e.target.value, m24, period)} className="flex-1 text-sm font-medium bg-white border border-slate-200 p-1 rounded">
                                                                                                            {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(h => <option key={h} value={h}>{h}</option>)}
                                                                                                        </select>
                                                                                                        <span className="font-bold text-slate-400">:</span>
                                                                                                        <select value={m24} onChange={e => update(h12, e.target.value, period)} className="flex-1 text-sm font-medium bg-white border border-slate-200 p-1 rounded">
                                                                                                            {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map(m => <option key={m} value={m}>{m}</option>)}
                                                                                                        </select>
                                                                                                        <select value={period} onChange={e => update(h12, m24, e.target.value)} className={`flex-1 text-sm font-medium bg-white border border-slate-200 p-1 rounded`}>
                                                                                                            <option value="AM">AM</option>
                                                                                                            <option value="PM">PM</option>
                                                                                                        </select>
                                                                                                    </>
                                                                                                );
                                                                                            })()}
                                                                                        </div>
                                                                                    </div>

                                                                                    <select
                                                                                        value={cellForm.platform}
                                                                                        onChange={e => setCellForm(f => ({ ...f, platform: e.target.value }))}
                                                                                        className="w-full text-sm font-medium bg-white border border-slate-200 rounded-md px-2 py-1.5 outline-none focus:border-indigo-500"
                                                                                    >
                                                                                        {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                                                                                    </select>
                                                                                    <div className="relative">
                                                                                        <LinkIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                                                        <input
                                                                                            type="url"
                                                                                            placeholder="Quick Meeting Link..."
                                                                                            value={cellForm.link}
                                                                                            onChange={e => setCellForm(f => ({ ...f, link: e.target.value }))}
                                                                                            className="w-full text-sm font-medium bg-white border border-slate-200 rounded-md pl-8 pr-2 py-1.5 outline-none focus:border-indigo-500 placeholder:text-slate-400"
                                                                                        />
                                                                                    </div>

                                                                                    {!cellForm.sessionId && (
                                                                                        <div className="pt-2 space-y-2">
                                                                                            {/* Day picker — hidden for everyday repeat */}
                                                                                            {cellForm.scheduleType !== 'everyday' && (
                                                                                                <div className="flex justify-between gap-1">
                                                                                                    {DAYS_META.map((day, idx) => {
                                                                                                        const isSelected = (cellForm.selectedDays || []).includes(day.value);
                                                                                                        return (
                                                                                                            <button
                                                                                                                type="button" key={idx}
                                                                                                                onClick={() => setCellForm(prev => {
                                                                                                                    const sel = prev.selectedDays || [];
                                                                                                                    return { ...prev, selectedDays: sel.includes(day.value) ? sel.filter(d => d !== day.value) : [...sel, day.value] };                                                                     })}
                                                                                                                className={`w-6 h-6 rounded text-[10px] font-semibold flex items-center justify-center transition-colors ${isSelected ? `bg-indigo-600 text-white` : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
                                                                                                            >
                                                                                                                {day.label}
                                                                                                            </button>
                                                                                                        );
                                                                     })}
                                                                                                </div>
                                                                                            )}
                                                                                            {/* Repeat / Schedule Type */}
                                                                                            <div className="flex items-center gap-2">
                                                                                                <span className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">Repeat</span>
                                                                                                <select
                                                                                                    value={cellForm.scheduleType}
                                                                                                    onChange={e => setCellForm(f => ({ ...f, scheduleType: e.target.value }))}
                                                                                                    className="flex-1 text-xs font-semibold bg-white border border-slate-200 rounded-md px-2 py-1 outline-none focus:border-indigo-500"
                                                                                                >
                                                                                                    <option value="once">No Repeat (Once)</option>
                                                                                                    <option value="1week">Repeat for 1 Week</option>
                                                                                                    <option value="2weeks">Repeat for 2 Weeks</option>
                                                                                                    <option value="1month">Repeat for 1 Month</option>
                                                                                                    <option value="everyday">Every Day (Infinite 🔁)</option>
                                                                                                </select>
                                                                                            </div>
                                                                                            {cellForm.scheduleType === 'everyday' && (
                                                                                                <p className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 p-1.5 rounded-md">⚡ Sessions will auto-generate daily until end of next month. Cron job renews them automatically!</p>
                                                                                            )}
                                                                                        </div>
                                                                                    )}

                                                                                    {cellError && <div className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-md">{cellError}</div>}

                                                                                    <div className="flex gap-2 pt-2">
                                                                                        <button onClick={() => setActiveCell(null)} className="flex-1 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50">Cancel</button>
                                                                                        <button
                                                                                            onClick={handleCellSubmit}
                                                                                            disabled={cellSaving}
                                                                                            className={`flex-1 py-1.5 text-xs font-semibold rounded-md text-white flex items-center justify-center gap-1 transition-colors ${cellSaving ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                                                                        >
                                                                                            {cellSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                                                            Save
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                !isPastDate && (
                                                                                    <button
                                                                                        onClick={() => openCellScheduler(lvl, date, null, sub.subjectName)}
                                                                                        className={`w-full py-2.5 mt-2 border border-dashed border-slate-300 text-slate-400 rounded-md flex items-center justify-center gap-1.5 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all opacity-80 hover:opacity-100 ${daySessions.length === 0 ? 'min-h-[44px]' : ''}`}
                                                                                    >
                                                                                        <Plus className="w-3.5 h-3.5" />
                                                                                        <span className="text-[10px] uppercase font-bold tracking-wider">Add Slot</span>
                                                                                    </button>
                                                                                )
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── Monitor view ─────────────────────────────────────────────── */}
            {viewType === 'monitor' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {allSessions.length === 0 && (
                        <div className="col-span-full py-16 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
                            <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                            <p className="text-sm font-semibold text-slate-800">No Sessions Scheduled</p>
                            <p className="text-xs text-slate-500 mt-1">Use the Timetable view to add classes.</p>
                        </div>
                    )}
                    {allSessions
                        .sort((a, b) => {
                            const w = { live: 0, upcoming: 1, ended: 2 };
                            return (w[a.status] ?? 1) - (w[b.status] ?? 1) || new Date(a.startTime) - new Date(b.startTime);
                        })
                        .map((s, idx) => {
                            const isLive = s.status === 'live';
                            const isEnded = s.status === 'ended';
                            const isMissed = s.status === 'upcoming' && new Date(s.endTime || new Date(s.startTime).getTime() + 60*60*1000) < new Date();
                            return (
                                <div key={idx} className={`bg-white border rounded-lg overflow-hidden shadow-sm transition-shadow ${isLive ? 'border-rose-300 shadow-rose-50' : isEnded ? 'border-slate-200 opacity-80' : isMissed ? 'border-orange-200 opacity-80' : 'border-slate-200 hover:shadow-md'}`}>
                                    <div className={`px-4 py-2 flex items-center justify-between border-b ${isLive ? 'bg-rose-50 border-rose-100' : isEnded ? 'bg-slate-50 border-slate-100' : isMissed ? 'bg-orange-50 border-orange-100' : 'bg-white border-slate-100'}`}>
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${isLive ? 'bg-rose-600 text-white animate-pulse' : isEnded ? 'bg-slate-200 text-slate-600' : isMissed ? 'bg-orange-200 text-orange-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                            {isLive ? 'LIVE' : isEnded ? 'DONE' : isMissed ? 'MISSED' : 'NEXT'}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-600">{s.classLevel}</span>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div>
                                            <h3 className={`text-base font-semibold leading-tight ${isMissed ? 'text-orange-800' : 'text-slate-800'}`}>{s.subjectName}</h3>
                                            <p className={`text-xs font-medium mt-1 ${isMissed ? 'text-orange-600/70' : 'text-slate-500'}`}>{s.platform} &middot; {new Date(s.startTime).toLocaleDateString()}</p>
                                        </div>
                                        <div className={`flex items-center gap-3 rounded-lg p-3 border ${isMissed ? 'bg-orange-50/50 border-orange-100' : 'bg-slate-50 border-slate-100'}`}>
                                            <div className={`w-8 h-8 rounded-md flex items-center justify-center font-semibold text-sm ${isMissed ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                {(s.teacherId?.name || 'T').charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase leading-none mb-1">Teacher</p>
                                                <p className="text-sm font-semibold text-slate-800 leading-none">{s.teacherId?.name || 'TBA'}</p>
                                            </div>
                                            <span className={`ml-auto text-xs font-semibold ${isMissed ? 'text-orange-600' : 'text-indigo-600'}`}>{fmtTime(s.startTime)}</span>
                                        </div>
                                        {!isEnded && !isMissed ? (
                                            <a href={s.link} target="_blank" rel="noreferrer"
                                                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-xs font-semibold transition-colors ${isLive ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}>
                                                <Video className="w-4 h-4" /> Join Classroom
                                            </a>
                                        ) : (
                                            <div className={`w-full py-2.5 text-center rounded-md text-xs font-semibold border ${isMissed ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                {isMissed ? 'Session Missed ✕' : 'Session Concluded ✓'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
};

export default LiveMonitor;
