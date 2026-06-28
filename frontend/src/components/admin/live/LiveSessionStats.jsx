/**
 * LiveSessionStats.jsx
 * Stats widgets for LiveMonitor monitor view:
 * Shows session counts by status (live, upcoming, ended, missed)
 */

import React from 'react';
import { Activity, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';

const LiveSessionStats = ({ sessions }) => {
  const now = new Date();

  const live    = sessions.filter(s => s.status === 'live').length;
  const ended   = sessions.filter(s => s.status === 'ended').length;
  const missed  = sessions.filter(s =>
    s.status === 'upcoming' &&
    new Date(s.endTime || new Date(s.startTime).getTime() + 60 * 60 * 1000) < now
  ).length;
  const upcoming = sessions.filter(s =>
    s.status === 'upcoming' &&
    new Date(s.endTime || new Date(s.startTime).getTime() + 60 * 60 * 1000) >= now
  ).length;

  const stats = [
    {
      label: 'Live Now',
      count: live,
      icon: <Activity className="w-4 h-4" />,
      color: 'bg-rose-50 border-rose-200 text-rose-700',
      dot: 'bg-rose-500 animate-pulse',
    },
    {
      label: 'Upcoming',
      count: upcoming,
      icon: <Clock className="w-4 h-4" />,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      dot: 'bg-indigo-500',
    },
    {
      label: 'Completed',
      count: ended,
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500',
    },
    {
      label: 'Missed',
      count: missed,
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'bg-orange-50 border-orange-200 text-orange-700',
      dot: 'bg-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      {stats.map(stat => (
        <div
          key={stat.label}
          className={`flex items-center gap-3 p-3 rounded-xl border shadow-sm ${stat.color}`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${stat.dot}`} />
            {stat.icon}
          </div>
          <div>
            <p className="text-2xl font-black leading-none">{stat.count}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-0.5">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveSessionStats;
