import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import { 
  Users, 
  Calendar, 
  Clock, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  AlertCircle, 
  BookOpen, 
  Video,
  UserCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import AssignPersonalSessionModal from '../../components/admin/AssignPersonalSessionModal';

const AdminPersonalSessions = () => {
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'all'
  const [newStudents, setNewStudents] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Expanded slots state for "All Sessions" table
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'new') {
        const res = await axios.get('/admin/personal-sessions/students');
        // Filter: students that either don't have a session, or the session status is 'pending'
        const filteredNew = (res.data || []).filter(item => !item.session || item.session.status === 'pending');
        setNewStudents(filteredNew);
      } else {
        const res = await axios.get('/admin/personal-sessions');
        setAllSessions(res.data || []);
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const toggleExpandSession = (id) => {
    setExpandedSessionId(expandedSessionId === id ? null : id);
  };

  // Filter & Search computations
  const getFilteredNewStudents = () => {
    return newStudents.filter(item => {
      const name = item.student?.name || '';
      const email = item.student?.email || '';
      const mobile = item.student?.mobileNumber || '';
      const query = searchQuery.toLowerCase();
      return name.toLowerCase().includes(query) || 
             email.toLowerCase().includes(query) || 
             mobile.toLowerCase().includes(query);
    });
  };

  const getFilteredSessions = () => {
    return allSessions.filter(session => {
      const studentName = session.studentId?.name || '';
      const teacherName = session.teacherId?.name || '';
      const subject = session.subjectName || '';
      const query = searchQuery.toLowerCase();
      
      const matchesSearch = studentName.toLowerCase().includes(query) || 
                            teacherName.toLowerCase().includes(query) || 
                            subject.toLowerCase().includes(query);
      
      const matchesStatus = statusFilter === '' || session.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const formatPlanType = (plan) => {
    switch (plan) {
      case 'oneMonth': return 'Monthly';
      case 'threeMonths': return 'Quarterly';
      case 'sixMonths': return 'Half-Yearly';
      case 'twelveMonths': return 'Annually';
      default: return plan;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
      case 'assigned':
        return <span className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-xs font-bold uppercase tracking-wider">Awaiting Pay</span>;
      case 'active':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>;
      case 'completed':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-bold uppercase tracking-wider">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  const getPaymentBadge = (status) => {
    return status === 'paid' 
      ? <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-[11px] font-extrabold uppercase">Paid</span>
      : <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-[11px] font-extrabold uppercase">Unpaid</span>;
  };

  return (
    <div className="p-4 md:p-8 w-full max-w-7xl mx-auto font-sans animate-in fade-in duration-300">
      <Toaster position="top-right" />
      
      {/* Title Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <Video className="w-7 h-7 text-indigo-600" /> 1-on-1 Personal Training
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Manage private class assignments, scheduling, pricing, and conflict checks</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          onClick={() => { setActiveTab('new'); setSearchQuery(''); }}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'new'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <UserCheck className="w-4 h-4" /> New Students ({newStudents.length})
        </button>
        <button
          onClick={() => { setActiveTab('all'); setSearchQuery(''); }}
          className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 flex items-center gap-2 ${
            activeTab === 'all'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4" /> All Assigned Sessions
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'new' ? "Search by student name or mobile..." : "Search by student, teacher, or subject..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
          />
        </div>

        {activeTab === 'all' && (
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="assigned">Awaiting Payment</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}

        <button 
          onClick={loadData}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-lg transition-colors border border-slate-200 shadow-sm"
        >
          Refresh
        </button>
      </div>

      {/* Loading Skeleton / State */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-sm mt-2">Loading data...</p>
        </div>
      ) : activeTab === 'new' ? (
        /* NEW STUDENTS TAB */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-slate-100">
                {getFilteredNewStudents().length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400 font-medium">No new 1-on-1 student registrations found.</td>
                  </tr>
                ) : (
                  getFilteredNewStudents().map((item) => (
                    <tr key={item.student._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">
                        {item.student.name}
                      </td>
                      <td className="p-4">
                        <div className="text-slate-700 font-medium">{item.student.mobileNumber || 'No Mobile'}</div>
                        <div className="text-[11px] text-slate-400">{item.student.email}</div>
                      </td>
                      <td className="p-4 text-slate-600">
                        {new Date(item.student.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudent(item.student);
                            setIsModalOpen(true);
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all shadow-sm"
                        >
                          Assign Teacher &amp; Schedule
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ALL ASSIGNED SESSIONS TAB */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  <th className="p-4 w-8"></th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Teacher</th>
                  <th className="p-4">Subject &amp; Plan</th>
                  <th className="p-4">Slots</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
                </tr>
              </thead>
              <tbody className="text-[13px] divide-y divide-slate-100">
                {getFilteredSessions().length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-400 font-medium">No assigned sessions match search/filter criteria.</td>
                  </tr>
                ) : (
                  getFilteredSessions().map((session) => {
                    const isExpanded = expandedSessionId === session._id;
                    return (
                      <React.Fragment key={session._id}>
                        <tr className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            <button
                              onClick={() => toggleExpandSession(session._id)}
                              className="p-1 rounded hover:bg-slate-200 transition-colors text-slate-500"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-800">{session.studentId?.name || 'Deleted Student'}</div>
                            <div className="text-[11px] text-slate-400">{session.studentId?.mobileNumber}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-800">{session.teacherId?.name || 'Unassigned'}</div>
                            <div className="text-[11px] text-slate-400">{session.teacherId?.email}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-indigo-700">{session.subjectName}</div>
                            <div className="text-[11px] text-slate-500">{formatPlanType(session.planType)} Plan</div>
                          </td>
                          <td className="p-4 whitespace-nowrap font-medium text-slate-700">
                            {session.scheduledSlots?.length || 0} Slots
                          </td>
                          <td className="p-4 font-bold text-slate-800">
                            ₹{(session.price || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="p-4">
                            {getStatusBadge(session.status)}
                          </td>
                          <td className="p-4">
                            {getPaymentBadge(session.paymentStatus)}
                          </td>
                        </tr>

                        {/* Nested slots view */}
                        {isExpanded && (
                          <tr className="bg-slate-50/60 border-b border-slate-200">
                            <td colSpan="8" className="p-4 pl-12">
                              <div className="space-y-3 max-w-4xl">
                                <div className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                  <Clock className="w-3.5 h-3.5" /> Detailed Schedule Slots
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {(session.scheduledSlots || []).map((slot, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex flex-col gap-2 relative">
                                      <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-1.5">
                                        <span className="font-bold text-slate-700">Slot #{idx + 1}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                          slot.status === 'completed' ? 'bg-green-100 text-green-800' :
                                          slot.status === 'missed' ? 'bg-red-100 text-red-800' :
                                          'bg-blue-100 text-blue-800'
                                        }`}>
                                          {slot.status}
                                        </span>
                                      </div>
                                      
                                      <div className="flex flex-col gap-1 text-[12px] text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-medium text-slate-400">Start:</span>
                                          <span className="font-bold text-slate-800">
                                            {new Date(slot.startTime).toLocaleString('en-US', {
                                              month: 'short', day: '2-digit', year: 'numeric',
                                              hour: '2-digit', minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-medium text-slate-400">End:</span>
                                          <span className="font-bold text-slate-800">
                                            {new Date(slot.endTime).toLocaleString('en-US', {
                                              month: 'short', day: '2-digit', year: 'numeric',
                                              hour: '2-digit', minute: '2-digit'
                                            })}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between mt-1 text-[11px] pt-1.5 border-t border-slate-100">
                                        <div className="flex items-center gap-1 text-slate-500">
                                          <span className="font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px]">{slot.platform || 'Meet'}</span>
                                        </div>
                                        {slot.meetingLink && (
                                          <a 
                                            href={slot.meetingLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5"
                                          >
                                            Join Meeting <ExternalLink className="w-3 h-3" />
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {session.adminNote && (
                                  <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200 text-xs">
                                    <span className="font-extrabold text-slate-500 uppercase block mb-1">Admin Notes</span>
                                    <p className="text-slate-700 font-medium">{session.adminNote}</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
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

      {/* Assignment Modal */}
      <AssignPersonalSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={selectedStudent}
        onSuccess={loadData}
      />
    </div>
  );
};

export default AdminPersonalSessions;
