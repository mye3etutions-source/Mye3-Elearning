/**
 * LiveSessionCard.jsx
 * Individual session card for the Monitor view of LiveMonitor
 * Shows session info: class, subject, teacher, time, board, and controls
 */

import React from 'react';
import { BookOpen, GraduationCap, User } from 'lucide-react';
import LiveSessionControls from './LiveSessionControls';

const BOARD_BADGE_COLORS = {
  'AP Board': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'TS Board': 'bg-rose-50 text-rose-700 border-rose-200',
  'CBSE':     'bg-amber-50 text-amber-700 border-amber-200',
  'ICSE':     'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const fmtTime = (d) => {
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return String(d);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch { return String(d); }
};

const LiveSessionCard = ({ session }) => {
  const now = new Date();
  const endTime = new Date(session.endTime || new Date(session.startTime).getTime() + 60 * 60 * 1000);
  const isMissed = session.status === 'upcoming' && endTime < now;
  const isLive   = session.status === 'live';
  const isEnded  = session.status === 'ended';

  const boardColor = BOARD_BADGE_COLORS[session.board] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <div className={`
      bg-white rounded-2xl border shadow-sm p-4 flex flex-col gap-3 transition-all
      ${isLive   ? 'border-rose-300 ring-2 ring-rose-100 shadow-rose-50'    : ''}
      ${isEnded  ? 'border-emerald-200 opacity-70'                          : ''}
      ${isMissed ? 'border-orange-200 opacity-80'                           : ''}
      ${!isLive && !isEnded && !isMissed ? 'border-slate-200 hover:border-indigo-200 hover:shadow-md' : ''}
    `}>
      {/* Top: Board + Class badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded border ${boardColor}`}>
          {session.board}
        </span>
        <span className="px-2 py-0.5 text-[10px] font-bold text-slate-600 bg-slate-100 rounded border border-slate-200 uppercase">
          {session.classLevel}
        </span>
        {session.recurringScheduleId && (
          <span className="px-2 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 rounded border border-amber-200">
            🔁 Series
          </span>
        )}
      </div>

      {/* Subject */}
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
        <p className="font-bold text-slate-800 text-sm leading-tight">{session.subjectName}</p>
      </div>

      {/* Teacher */}
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-slate-400 shrink-0" />
        <p className="text-sm font-semibold text-slate-600">
          {session.teacherId?.name || 'TBA'}
        </p>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
        <span>
          {fmtTime(session.startTime)}
          {session.endTime && ` – ${fmtTime(session.endTime)}`}
        </span>
        <span className="ml-auto text-[10px] text-slate-400 font-semibold">
          {new Date(session.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      </div>

      {/* Platform */}
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
        {session.platform}
      </p>

      {/* Controls: Status + Join/Link button */}
      <LiveSessionControls session={session} />
    </div>
  );
};

export default LiveSessionCard;
