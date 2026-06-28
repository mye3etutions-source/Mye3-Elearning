/**
 * LiveSessionControls.jsx
 * Start / Stop / End buttons and link display for a single live session card
 * Used in the Monitor view of LiveMonitor
 */

import React from 'react';
import { Video, Activity, Clock, CheckCircle, AlertCircle, Link as LinkIcon } from 'lucide-react';

const STATUS_CONFIG = {
  live:     { label: 'LIVE', bg: 'bg-rose-600',    ring: 'ring-rose-200',    icon: <Activity className="w-3.5 h-3.5 animate-pulse" /> },
  ended:    { label: 'ENDED', bg: 'bg-emerald-600', ring: 'ring-emerald-200', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  upcoming: { label: 'UPCOMING', bg: 'bg-indigo-600', ring: 'ring-indigo-200', icon: <Clock className="w-3.5 h-3.5" /> },
  missed:   { label: 'MISSED', bg: 'bg-orange-500', ring: 'ring-orange-200',  icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

const LiveSessionControls = ({ session }) => {
  const now = new Date();
  const endTime = new Date(session.endTime || new Date(session.startTime).getTime() + 60 * 60 * 1000);
  const isMissed = session.status === 'upcoming' && endTime < now;
  const statusKey = isMissed ? 'missed' : (session.status || 'upcoming');
  const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.upcoming;

  const meetLink = session.link?.startsWith('http') ? session.link : `https://${session.link}`;
  const isLive = session.status === 'live';
  const isEnded = session.status === 'ended';

  return (
    <div className="flex flex-col gap-2 mt-3">
      {/* Status Badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-[10px] font-black uppercase tracking-wider self-start ${cfg.bg} ring-2 ${cfg.ring}`}>
        {cfg.icon}
        {cfg.label}
      </div>

      {/* Action Buttons */}
      {session.link && (
        <div className="flex gap-2">
          {isLive ? (
            <a
              href={meetLink}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm"
            >
              <Video className="w-4 h-4" /> Join Now
            </a>
          ) : !isEnded && !isMissed ? (
            <a
              href={meetLink}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-colors shadow-sm"
            >
              <LinkIcon className="w-3.5 h-3.5" /> Meeting Link
            </a>
          ) : (
            <div className="flex-1 py-2 text-center bg-slate-50 text-slate-400 border border-slate-200 rounded-lg text-xs font-semibold">
              {isEnded ? 'Session Ended' : 'Session Missed'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveSessionControls;
