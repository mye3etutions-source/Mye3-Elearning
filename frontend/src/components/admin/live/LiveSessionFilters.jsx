/**
 * LiveSessionFilters.jsx
 * Board selection tabs + Month/Week navigation for LiveMonitor
 */

import React from 'react';
import { Activity, Calendar } from 'lucide-react';

const BOARDS = ['AP Board', 'TS Board', 'CBSE', 'ICSE'];

const LiveSessionFilters = ({
  boardFilter,
  setBoardFilter,
  viewType,
  setViewType,
  navInfo,
  monthOffset,
  weekOffset,
  setWeekOffset,
  handleMonthJump,
  recurringSchedules,
}) => {
  return (
    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
      <div>
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-3">
          Live &amp; Schedule Class
        </h1>
        <div className="flex flex-col gap-2 mt-1">
          {viewType === 'roster' && (
            <>
              {/* Month Tabs */}
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

              {/* Week Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setWeekOffset(w => w - 1)}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-black hover:text-indigo-600 hover:border-indigo-300 transition-all text-sm"
                >
                  ‹
                </button>
                <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-lg border border-slate-200">
                  {navInfo.weekLabel}
                </span>
                <button
                  onClick={() => setWeekOffset(w => w + 1)}
                  className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 font-black hover:text-indigo-600 hover:border-indigo-300 transition-all text-sm"
                >
                  ›
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Active Series Badge */}
        {recurringSchedules.filter(s => s.board === boardFilter).length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold shadow-sm animate-in fade-in zoom-in duration-500">
            <Activity className="w-3.5 h-3.5" />
            <span>{recurringSchedules.filter(s => s.board === boardFilter).length} Active Series</span>
          </div>
        )}

        {/* View Toggle */}
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
  );
};

export default LiveSessionFilters;
