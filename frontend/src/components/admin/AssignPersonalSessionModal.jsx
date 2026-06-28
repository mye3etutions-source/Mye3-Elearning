import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  X, Plus, Trash2, AlertTriangle, Check, Loader2, Calendar, 
  Clock, Video, User, BookOpen, DollarSign, FileText, Link as LinkIcon, UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DAYS_META = [
    { label: 'S', value: 0 }, { label: 'M', value: 1 }, { label: 'T', value: 2 },
    { label: 'W', value: 3 }, { label: 'T', value: 4 }, { label: 'F', value: 5 },
    { label: 'S', value: 6 }
];
const PLATFORMS = ['Google Meet', 'Zoom', 'Teams'];

const dateForDayInWeek = (anchor, dayOfWeek, hour, minute) => {
    const sunday = new Date(anchor);
    sunday.setDate(anchor.getDate() - anchor.getDay());
    sunday.setHours(hour, minute, 0, 0);
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + dayOfWeek);
    return d;
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
        (sub.board && sub.board.includes('1-ON-1')) || 
        (sub.classLevel && sub.classLevel.includes('1-ON-1'))
      )
    : false;

  const [scheduleData, setScheduleData] = useState({
    time: '10:00',
    endTime: '11:00',
    platform: 'Google Meet',
    link: '',
    selectedDays: [new Date().getDay()],
    scheduleType: 'this_month'
  });

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
            link: first.meetingLink || '',
            selectedDays: Array.from(new Set(session.scheduledSlots.map(s => new Date(s.startTime).getDay()))),
            scheduleType: session.scheduledSlots.length > 1 ? 'this_month' : 'once'
        });
      } else {
        setScheduleData({ time: '10:00', endTime: '11:00', platform: 'Google Meet', link: '', selectedDays: [new Date().getDay()], scheduleType: 'this_month' });
      }
    } else {
      setTeacherId('');
      setSubjectName(student?.oneOnOneCategory?.name || '');
      setAdminNote('');
      setScheduleData({ time: '10:00', endTime: '11:00', platform: 'Google Meet', link: '', selectedDays: [new Date().getDay()], scheduleType: 'this_month' });
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
    if (scheduleData.selectedDays.length === 0) return toast.error('Please select at least one day of the week');

    try {
        setLoading(true);

        const [h, m] = scheduleData.time.split(':').map(Number);
        const [eh, em] = scheduleData.endTime.split(':').map(Number);
        
        let startWeekOffset = 0;
        let weekCount = 1;
        let stopAtMonthEnd = false;

        if (scheduleData.scheduleType === 'this_week') {
            startWeekOffset = 0;
            weekCount = 1;
        } else if (scheduleData.scheduleType === 'next_week') {
            startWeekOffset = 1;
            weekCount = 1;
        } else if (scheduleData.scheduleType === 'this_month') {
            startWeekOffset = 0;
            weekCount = 6; 
            stopAtMonthEnd = true;
        } else if (scheduleData.scheduleType === '1month') {
            startWeekOffset = 0;
            weekCount = 4;
        }

        const baseDate = new Date();
        const originalMonth = baseDate.getMonth();
        const slots = [];

        for (let w = startWeekOffset; w < (startWeekOffset + weekCount); w++) {
            scheduleData.selectedDays.forEach(dayNum => {
                const anchor = new Date(baseDate);
                anchor.setDate(baseDate.getDate() + w * 7);
                const dt = dateForDayInWeek(anchor, dayNum, h, m);
                const endDt = dateForDayInWeek(anchor, dayNum, eh, em);

                if (stopAtMonthEnd && dt.getMonth() !== originalMonth) return;

                if (dt > new Date() || scheduleData.scheduleType === 'once') {
                    slots.push({
                        startTime: dt.toISOString(),
                        endTime: endDt.toISOString(),
                        platform: scheduleData.platform,
                        meetingLink: scheduleData.link
                    });
                }
            });
        }

        if (slots.length === 0) {
            setLoading(false);
            return toast.error('All selected times are in the past! Choose a future time.');
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
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Subject Name (e.g. Mathematics)"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:border-indigo-500 bg-white"
              />

              <select 
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:border-indigo-500 bg-white"
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
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-3 animate-in slide-in-from-top-2">
                      <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                              <h4 className="text-sm font-bold text-amber-800">1-on-1 Payment Setup Required</h4>
                              <p className="text-xs text-amber-700 mt-1 font-medium leading-relaxed">
                                  This teacher does not have a 1-ON-1 subject assigned, so their payment price is unknown. Please assign 1-ON-1 to this teacher first.
                              </p>
                          </div>
                      </div>
                      <button 
                          type="button"
                          onClick={() => {
                              onClose();
                              navigate('/admin/teachers', { state: { expandTeacherId: teacherId } });
                          }}
                          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider py-2.5 rounded-lg transition-colors shadow-sm"
                      >
                          <UserPlus className="w-4 h-4" /> Go to Teacher Profile
                      </button>
                  </div>
              )}

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex gap-1.5 items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase w-10 tracking-widest">Start</span>
                      {(() => {
                          const [h24, m24] = (scheduleData.time || '10:00').split(':').map(Number);
                          const h12 = h24 % 12 || 12;
                          const period = h24 >= 12 ? 'PM' : 'AM';
                          const update = (nh, nm, np) => {
                              let h = parseInt(nh);
                              if (np === 'PM' && h < 12) h += 12;
                              if (np === 'AM' && h === 12) h = 0;
                              setScheduleData(f => ({ ...f, time: `${h.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')}` }));
                          };
                          return (
                              <>
                                  <select value={h12} onChange={e => update(e.target.value, m24, period)} className="flex-1 text-sm font-bold bg-white border border-slate-200 p-1.5 rounded outline-none focus:border-indigo-500">
                                      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(h => <option key={h} value={h}>{h}</option>)}
                                  </select>
                                  <span className="font-bold text-slate-400">:</span>
                                  <select value={m24.toString().padStart(2, '0')} onChange={e => update(h12, e.target.value, period)} className="flex-1 text-sm font-bold bg-white border border-slate-200 p-1.5 rounded outline-none focus:border-indigo-500">
                                      {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                                  </select>
                                  <select value={period} onChange={e => update(h12, m24, e.target.value)} className="flex-1 text-sm font-bold bg-white border border-slate-200 p-1.5 rounded outline-none focus:border-indigo-500">
                                      <option value="AM">AM</option>
                                      <option value="PM">PM</option>
                                  </select>
                              </>
                          );
                      })()}
                  </div>
                  <div className="flex gap-1.5 items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase w-10 tracking-widest">End</span>
                      {(() => {
                          const [h24, m24] = (scheduleData.endTime || '11:00').split(':').map(Number);
                          const h12 = h24 % 12 || 12;
                          const period = h24 >= 12 ? 'PM' : 'AM';
                          const update = (nh, nm, np) => {
                              let h = parseInt(nh);
                              if (np === 'PM' && h < 12) h += 12;
                              if (np === 'AM' && h === 12) h = 0;
                              setScheduleData(f => ({ ...f, endTime: `${h.toString().padStart(2, '0')}:${nm.toString().padStart(2, '0')}` }));
                          };
                          return (
                              <>
                                  <select value={h12} onChange={e => update(e.target.value, m24, period)} className="flex-1 text-sm font-bold bg-white border border-slate-200 p-1.5 rounded outline-none focus:border-indigo-500">
                                      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(h => <option key={h} value={h}>{h}</option>)}
                                  </select>
                                  <span className="font-bold text-slate-400">:</span>
                                  <select value={m24.toString().padStart(2, '0')} onChange={e => update(h12, e.target.value, period)} className="flex-1 text-sm font-bold bg-white border border-slate-200 p-1.5 rounded outline-none focus:border-indigo-500">
                                      {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map(m => <option key={m} value={m}>{m}</option>)}
                                  </select>
                                  <select value={period} onChange={e => update(h12, m24, e.target.value)} className="flex-1 text-sm font-bold bg-white border border-slate-200 p-1.5 rounded outline-none focus:border-indigo-500">
                                      <option value="AM">AM</option>
                                      <option value="PM">PM</option>
                                  </select>
                              </>
                          );
                      })()}
                  </div>
              </div>

              <select
                  value={scheduleData.platform}
                  onChange={e => setScheduleData(f => ({ ...f, platform: e.target.value }))}
                  className="w-full text-sm font-bold bg-white border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500"
              >
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>

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

              <div className="pt-2 space-y-3">
                  <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Days</span>
                          <div className="flex gap-2">
                              <button type="button" onClick={() => setScheduleData(f => ({ ...f, selectedDays: [0,1,2,3,4,5,6] }))} className="text-[10px] font-black text-indigo-500 hover:text-indigo-700">All</button>
                              <span className="text-slate-300">|</span>
                              <button type="button" onClick={() => setScheduleData(f => ({ ...f, selectedDays: [1,2,3,4,5] }))} className="text-[10px] font-black text-indigo-500 hover:text-indigo-700">Mon–Fri</button>
                              <span className="text-slate-300">|</span>
                              <button type="button" onClick={() => setScheduleData(f => ({ ...f, selectedDays: [] }))} className="text-[10px] font-black text-slate-400 hover:text-rose-500">Clear</button>
                          </div>
                      </div>
                      <div className="flex justify-between gap-1">
                          {DAYS_META.map((day, idx) => {
                              const isSelected = (scheduleData.selectedDays || []).includes(day.value);
                              return (
                                  <button
                                      type="button" key={idx}
                                      onClick={() => setScheduleData(prev => {
                                          const sel = prev.selectedDays || [];
                                          return { ...prev, selectedDays: sel.includes(day.value) ? sel.filter(d => d !== day.value) : [...sel, day.value] };
                                      })}
                                      className={`w-9 h-9 rounded-xl text-xs font-black flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300'}`}
                                  >
                                      {day.label}
                                  </button>
                              );
                          })}
                      </div>
                  </div>

                  <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Repeat</span>
                      <select
                          value={scheduleData.scheduleType}
                          onChange={e => {
                              const val = e.target.value;
                              setScheduleData(f => {
                                  let newDays = f.selectedDays;
                                  if (val === 'once' && newDays.length === 0) {
                                      newDays = [new Date().getDay()];
                                  } else if (newDays.length === 0) {
                                      newDays = [1,2,3,4,5]; // default mon-fri if empty
                                  }
                                  return { ...f, scheduleType: val, selectedDays: newDays };
                              });
                          }}
                          className="flex-1 text-sm font-bold bg-white border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500"
                      >
                          <option value="once">Once (This Week Only)</option>
                          <option value="next_week">Next Week Only</option>
                          <option value="this_month">Until End of Month</option>
                          <option value="1month">For 4 Weeks (1 Month)</option>
                      </select>
                  </div>
              </div>
              
              <div className="space-y-1 pt-2">
                <input 
                  type="text"
                  placeholder="Optional Admin Remarks"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full text-sm font-medium border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 bg-white placeholder:text-slate-400"
                />
              </div>

          </div>

          <div className="flex gap-3 pt-2">
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
