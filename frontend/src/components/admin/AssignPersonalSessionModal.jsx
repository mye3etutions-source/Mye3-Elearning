import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  X, Plus, Trash2, AlertTriangle, Check, Loader2, Calendar, 
  Clock, Video, User, BookOpen, DollarSign, FileText, Link as LinkIcon, UserPlus,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PLATFORMS = ['Google Meet', 'Zoom', 'Teams'];

const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate();

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

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-indigo-600">{selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected</span>
                <button type="button" onClick={clearAll} className="text-xs font-semibold text-slate-400 hover:text-rose-500 transition-colors">Clear</button>
            </div>
        </div>
    );
};

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

const AssignPersonalSessionModal = ({ isOpen, onClose, student, session, onSuccess }) => {
  const [allTeachers, setAllTeachers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const selectedTeacherObj = teachers.find(t => t._id === teacherId);
  const isOneOnOneCapable = selectedTeacherObj 
    ? (selectedTeacherObj.assignedSubjects || []).some(sub => 
        (sub.board && sub.board.toUpperCase().includes('1-ON-1')) || 
        (sub.classLevel && sub.classLevel.toUpperCase().includes('1-ON-1'))
      )
    : false;

  const [calendarDates, setCalendarDates] = useState([]);
  const [calendarView, setCalendarView] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
  const [scheduleData, setScheduleData] = useState({
      time: '10:00', // 24-hr format internally
      endTime: '11:00',
      platform: 'Google Meet',
      link: ''
  });

  // Automatically update endTime to be 1 hour after time, unless manually modified later
  useEffect(() => {
      const [h, m] = scheduleData.time.split(':').map(Number);
      let endH = (h + 1) % 24;
      setScheduleData(prev => ({ ...prev, endTime: `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}` }));
  }, [scheduleData.time]);

  const toggleCalendarDate = (d) => {
      setCalendarDates(prev => {
          const exists = prev.some(existing => isSameDay(existing, d));
          if (exists) return prev.filter(existing => !isSameDay(existing, d));
          return [...prev, d].sort((a, b) => a - b);
      });
  };

  useEffect(() => {
    if (!isOpen || !student) return;

    const loadData = async () => {
      try {
        const resTeachers = await axios.get('/admin/teachers-list');
        setAllTeachers(resTeachers.data || []);
      } catch (err) {
        toast.error('Failed to load teachers list');
      }
    };

    loadData();
    
    if (session && session.status !== 'pending') {
      setTeacherId(typeof session.teacherId === 'object' ? session.teacherId?._id : session.teacherId);
      setSubjectName(session.subjectName || student?.oneOnOneCategory?.name || '');
      setAdminNote(session.adminNote || '');
      
      if (session.scheduledSlots && session.scheduledSlots.length > 0) {
        const first = session.scheduledSlots[0];
        const st = new Date(first.startTime);
        const et = new Date(first.endTime || new Date(st.getTime() + 60*60*1000));
        const pad = (n) => n.toString().padStart(2, '0');
        setScheduleData({
            time: `${pad(st.getHours())}:${pad(st.getMinutes())}`,
            endTime: `${pad(et.getHours())}:${pad(et.getMinutes())}`,
            platform: first.platform || 'Google Meet',
            link: first.meetingLink || ''
        });
        const dates = session.scheduledSlots.map(s => new Date(s.startTime));
        setCalendarDates(dates);
        if (dates.length > 0) {
            setCalendarView({ month: dates[0].getMonth(), year: dates[0].getFullYear() });
        }
      } else {
        setScheduleData({ time: '10:00', endTime: '11:00', platform: 'Google Meet', link: '' });
        setCalendarDates([]);
        setCalendarView({ month: new Date().getMonth(), year: new Date().getFullYear() });
      }
    } else {
      setTeacherId('');
      setSubjectName(student?.oneOnOneCategory?.name || '');
      setAdminNote('');
      setScheduleData({ time: '10:00', endTime: '11:00', platform: 'Google Meet', link: '' });
      setCalendarDates([]);
      setCalendarView({ month: new Date().getMonth(), year: new Date().getFullYear() });
    }
  }, [isOpen, student, session]);

  // Phase 6: Smart Teacher Sort — matching on top, all show, board+class+subject details
  useEffect(() => {
    if (allTeachers.length === 0) return;

    // Step 1: Only actual teachers (no admins, no students)
    const actualTeachers = allTeachers.filter(t => t.role?.toLowerCase() === 'teacher');

    // Step 2: Figure out category keywords to match against
    const catName = (student?.oneOnOneCategory?.name || '').toLowerCase();
    const catWords = catName.split(/[^a-z0-9]+/).filter(w => w.length > 1); // e.g. ['inter', '1st', 'math']

    // Step 3: For each teacher, build display label + score
    const scored = actualTeachers.map(t => {
      const subjects = t.assignedSubjects || [];

      // Build a readable label for this teacher's subjects
      let shortSubjectLabel = 'All Subjects';
      let fullSubjectLabel = 'All Subjects';

      if (subjects.length > 0) {
        const mappedSubjects = subjects.map(sub => {
          const board = sub.board ? sub.board.replace(' Board', '') : '';
          const cls   = sub.classLevel || '';
          const subj  = sub.subjectName || '';
          return [board, cls, subj].filter(Boolean).join(' ');
        });

        fullSubjectLabel = mappedSubjects.join(' | ');

        // Truncate if too many subjects to prevent UI overflow
        if (mappedSubjects.length > 2) {
          shortSubjectLabel = `${mappedSubjects.slice(0, 2).join(' | ')} (+${mappedSubjects.length - 2} more)`;
        } else {
          shortSubjectLabel = mappedSubjects.join(' | ');
        }
      }

      // Score: count how many category words match teacher's subject text
      const subjectText = fullSubjectLabel.toLowerCase();
      const score = catWords.reduce((acc, word) => acc + (subjectText.includes(word) ? 1 : 0), 0);

      return {
        ...t,
        displayName: `${t.name}  —  ${shortSubjectLabel}`,
        _fullTooltip: `${t.name}'s Subjects:\n${fullSubjectLabel.split(' | ').join('\n')}`,
        _score: score
      };
    });

    // Step 4: Sort — matching (score > 0) on top, rest below
    scored.sort((a, b) => b._score - a._score);

    setTeachers(scored);
  }, [allTeachers, student]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherId) return toast.error('Please select a teacher');
    if (!subjectName.trim()) return toast.error('Please enter a subject');
    if (!scheduleData.link.trim()) return toast.error('Meeting Link is mandatory');
    if (calendarDates.length === 0) return toast.error('Please select at least one date from the calendar');

    try {
        setLoading(true);

        const [h, m] = scheduleData.time.split(':').map(Number);
        const [eh, em] = scheduleData.endTime.split(':').map(Number);
        
        const slots = calendarDates.map(date => {
            const dt = new Date(date);
            dt.setHours(h, m, 0, 0);
            
            const endDt = new Date(date);
            endDt.setHours(eh, em, 0, 0);

            if (endDt < dt) {
                endDt.setDate(endDt.getDate() + 1);
            }

            return {
                startTime: dt.toISOString(),
                endTime: endDt.toISOString(),
                platform: scheduleData.platform,
                meetingLink: scheduleData.link
            };
        });

        if (slots.length === 0) {
            setLoading(false);
            return toast.error('No valid dates selected!');
        }

        const payload = {
            teacherId,
            subjectName,
            slots,
            adminNote
        };

        await axios.put(`/admin/personal-sessions/${student._id}/assign`, payload);
        toast.success(`Successfully assigned ${slots.length} sessions!`);
        onSuccess();
        onClose();
    } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to assign session');
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-[700px] rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wide">Schedule Session</h3>
            <p className="text-xs text-slate-300 mt-1">
              For <span className="font-semibold text-orange-400">{student?.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {session?.expiryDate && new Date() > new Date(session.expiryDate) && (
          <div className="bg-red-50 border-b border-red-200 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-red-800">Plan Expired</h4>
              <p className="text-xs text-red-600 mt-0.5">
                This student's plan expired on {new Date(session.expiryDate).toLocaleDateString()}. You cannot assign new slots.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-h-[90vh] overflow-y-auto">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Calendar */}
            <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Select Dates</p>
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
              <div className="mt-6 pt-4 border-t border-slate-100">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Remarks</p>
                <input 
                  type="text"
                  placeholder="Optional Admin Remarks"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full text-sm font-medium border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 bg-slate-50 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Right: Form Fields */}
            <div className="space-y-5">
              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Subject</p>
                <input 
                  type="text" 
                  placeholder="Subject Name (e.g. Mathematics)"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Teacher</p>
                <select 
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500 bg-white"
                >
                  <option value="">Select Teacher</option>
                  {(() => {
                    const matched = teachers.filter(t => t._score > 0);
                    const others  = teachers.filter(t => t._score === 0);
                    return (
                      <>
                        {matched.length > 0 && (
                          <optgroup label={`✅ Best Match for "${student?.oneOnOneCategory?.name || 'Category'}"`}>
                            {matched.map(t => (
                              <option key={t._id} value={t._id} title={t._fullTooltip}>{t.displayName}</option>
                            ))}
                          </optgroup>
                        )}
                        {others.length > 0 && (
                          <optgroup label="── Other Teachers ──">
                            {others.map(t => (
                              <option key={t._id} value={t._id} title={t._fullTooltip}>{t.displayName}</option>
                            ))}
                          </optgroup>
                        )}
                      </>
                    );
                  })()}
                </select>
                
                {teacherId && !isOneOnOneCapable && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col gap-2 animate-in slide-in-from-top-2">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-[11px] font-bold text-amber-800">1-on-1 Payment Setup Required</h4>
                                <p className="text-[10px] text-amber-700 mt-0.5 leading-tight">
                                    Please assign 1-ON-1 to this teacher first.
                                </p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => {
                                onClose();
                                navigate('/admin/teachers', { state: { expandTeacherId: teacherId } });
                            }}
                            className="w-full flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] uppercase tracking-wider py-1.5 rounded transition-colors shadow-sm"
                        >
                            <UserPlus className="w-3 h-3" /> Go to Teacher Profile
                        </button>
                    </div>
                )}
              </div>

              <div className="bg-slate-50 rounded-xl p-3 space-y-2.5 border border-slate-100">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Time</p>
                  <TimePicker label="Start" value={scheduleData.time}    onChange={v => setScheduleData(f => ({ ...f, time: v }))} />
                  <TimePicker label="End"   value={scheduleData.endTime} onChange={v => setScheduleData(f => ({ ...f, endTime: v }))} />
              </div>

              <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Platform</p>
                  <select
                      value={scheduleData.platform}
                      onChange={e => setScheduleData(f => ({ ...f, platform: e.target.value }))}
                      className="w-full text-sm font-bold bg-white border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500"
                  >
                      {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
              </div>

              <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Meeting Link</p>
                  <div className="relative">
                      <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                          type="url"
                          placeholder="Quick Meeting Link..."
                          value={scheduleData.link}
                          onChange={e => setScheduleData(f => ({ ...f, link: e.target.value }))}
                          required
                          className="w-full text-sm font-bold bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-indigo-500 placeholder:text-slate-400 placeholder:font-medium"
                      />
                  </div>
              </div>

            </div>
          </div>

          <div className="flex gap-3 p-5 border-t border-slate-100 bg-slate-50/50">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || !isOneOnOneCapable || (session?.expiryDate && new Date() > new Date(session.expiryDate))}
              className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              {loading ? 'Assigning...' : 'Save & Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignPersonalSessionModal;
