import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Video, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  DollarSign, 
  User, 
  ExternalLink, 
  TrendingUp, 
  BookOpen, 
  Loader2,
  AlertCircle
} from 'lucide-react';

const MyPersonalSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'completed'

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/teacher/personal-sessions');
      setSessions(res.data || []);
    } catch (err) {
      toast.error('Failed to load personal sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCompleteSlot = async (sessionId, slotId) => {
    if (!window.confirm('Are you sure you want to mark this slot as completed?')) return;
    const loadingToast = toast.loading('Updating session status...');
    try {
      await axios.put(`/teacher/personal-sessions/${sessionId}/slots/${slotId}/complete`);
      toast.success('Slot marked as completed!', { id: loadingToast });
      fetchSessions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update slot', { id: loadingToast });
    }
  };

  // Calculations
  const activeSessions = sessions.filter(s => s.status === 'active');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  
  // Total 1-on-1 earnings (completed sessions price sum)
  const totalEarnings = completedSessions.reduce((sum, s) => sum + (s.price || 0), 0);

  // Extract all upcoming slots across all active sessions
  const getUpcomingSlots = () => {
    const list = [];
    activeSessions.forEach(session => {
      (session.scheduledSlots || []).forEach(slot => {
        if (slot.status === 'upcoming') {
          list.push({
            sessionId: session._id,
            subjectName: session.subjectName,
            studentName: session.studentId?.name || 'Student',
            studentMobile: session.studentId?.mobileNumber || 'N/A',
            studentEmail: session.studentId?.email || '',
            slotId: slot._id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            meetingLink: slot.meetingLink,
            platform: slot.platform
          });
        }
      });
    });
    // Sort by soonest start time
    return list.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  };

  const upcomingSlots = getUpcomingSlots();

  const formatPlanType = (plan) => {
    switch (plan) {
      case 'oneMonth': return 'Monthly';
      case 'threeMonths': return 'Quarterly';
      case 'sixMonths': return 'Half-Yearly';
      case 'twelveMonths': return 'Annually';
      default: return plan;
    }
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto font-sans animate-in fade-in duration-300">
      <Toaster position="top-right" />

      {/* Title Header */}
      <div className="mb-8 border-b border-slate-100 pb-4">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
          <Video className="w-7 h-7 text-indigo-600" /> My Personal Sessions
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Manage assigned 1-on-1 classes, access virtual meets, and track completed session earnings</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Upcoming Slots</span>
            <span className="text-xl font-bold text-slate-800">{upcomingSlots.length} Slots</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Programs</span>
            <span className="text-xl font-bold text-slate-800">{completedSessions.length} Sessions</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1-on-1 Earnings</span>
            <span className="text-xl font-black text-slate-900">₹{totalEarnings.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'upcoming'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" /> Upcoming Slots ({upcomingSlots.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Completed Sessions ({completedSessions.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="font-bold text-sm">Loading session schedule...</p>
        </div>
      ) : activeTab === 'upcoming' ? (
        /* UPCOMING SLOTS TAB */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingSlots.length === 0 ? (
            <div className="col-span-full py-16 bg-white border border-dashed border-slate-200 rounded-xl text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <AlertCircle className="w-8 h-8 text-slate-300" />
              <p className="font-bold text-sm">No upcoming 1-on-1 slots assigned to you.</p>
            </div>
          ) : (
            upcomingSlots.map((slot) => {
              const start = new Date(slot.startTime);
              const end = new Date(slot.endTime);
              return (
                <div key={slot.slotId} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase">
                        {slot.subjectName}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {slot.platform}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-slate-400" /> {slot.studentName}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium pl-5">Mobile: {slot.studentMobile}</p>
                    </div>

                    <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-bold">{start.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-semibold">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
                    {slot.meetingLink && (
                      <a
                        href={slot.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider text-center transition-colors flex items-center justify-center gap-1 shadow-sm"
                      >
                        Join Class <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleCompleteSlot(slot.sessionId, slot.slotId)}
                      className="w-full py-2 border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-700 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Mark Completed
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* COMPLETED SESSIONS TAB */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  <th className="p-4">Student</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Duration Plan</th>
                  <th className="p-4">Completed Date</th>
                  <th className="p-4">Payout Status</th>
                  <th className="p-4 text-right">My Earnings</th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-slate-100">
                {completedSessions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">No completed 1-on-1 programs yet.</td>
                  </tr>
                ) : (
                  completedSessions.map((session) => (
                    <tr key={session._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{session.studentId?.name || 'Student'}</div>
                        <div className="text-[11px] text-slate-400">{session.studentId?.email}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-700">
                        {session.subjectName}
                      </td>
                      <td className="p-4 text-slate-600">
                        {formatPlanType(session.planType)} Plan
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(session.updatedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          session.payoutStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {session.payoutStatus === 'paid' ? 'Settled' : 'Unpaid'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-slate-800">
                        ₹{(session.price || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPersonalSessions;
