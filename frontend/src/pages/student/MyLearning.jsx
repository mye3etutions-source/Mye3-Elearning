import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  ChevronRight, 
  Play, 
  FolderOpen,
  Award,
  Calendar,
  Zap,
  ShieldCheck,
  TrendingUp,
  LayoutGrid,
  User,
  Video
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const MyLearning = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [learning, setLearning] = useState([]);
  const [personalSession, setPersonalSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLearning = async () => {
      try {
        if (userInfo?.isOneOnOne) {
          const { data } = await axios.get('/student/personal-sessions');
          const active = (data || []).find(s => ['assigned', 'active', 'pending', 'completed'].includes(s.status)) || (data && data[0]) || null;
          setPersonalSession(active);
        } else {
          const { data } = await axios.get('/student/my-learning');
          setLearning(data || []);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching learning data');
        setLoading(false);
      }
    };
    fetchLearning();
  }, [userInfo]);

  if (loading) return (
    <div className="p-6 md:p-8 space-y-6 animate-pulse bg-slate-50 min-h-screen">
      <div className="h-32 bg-slate-200 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-200 rounded-xl" />)}
      </div>
    </div>
  );

  const isOneOnOne = userInfo?.isOneOnOne;

  return (
    <div className="space-y-6 md:space-y-8 pb-20 p-4 md:p-6 lg:px-8 bg-slate-50 min-h-screen">
      
      {/* 1. Header Section */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
             <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">
              {isOneOnOne ? 'My 1-on-1 Classes' : 'My Learning'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isOneOnOne ? 'Access your personal teacher and schedule.' : 'Access your enrolled courses, subjects, and study materials.'}
            </p>
          </div>
        </div>
        
        <Link 
          to="/courses" 
          className="px-5 py-2.5 bg-[#f16126] text-white rounded-lg font-semibold text-sm shadow-sm hover:bg-[#d9531e] transition-colors"
        >
          {isOneOnOne ? 'View Pricing Plans' : 'Explore More Courses'}
        </Link>
      </div>

      {/* 2. Content Area */}
      {isOneOnOne ? (
        // ─── 1-ON-1 DASHBOARD VIEW ───
        !personalSession ? (
           <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-4">
             <FolderOpen className="w-16 h-16 text-slate-300 mx-auto" />
             <h3 className="text-lg font-bold text-slate-700">No Personal Session Found</h3>
             <p className="text-sm text-slate-500 max-w-md mx-auto">
               You haven't requested a 1-on-1 class yet. Visit the store to select a plan and get started.
             </p>
             <Link to="/courses" className="inline-block mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors">
               View Store
             </Link>
           </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Teacher & Plan Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-900 p-6 flex items-start justify-between">
                  <div>
                    <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                      1-on-1 Personal Class
                    </span>
                    <h2 className="text-2xl font-black text-white">
                      {personalSession.subjectName || 'Awaiting Subject Assignment'}
                    </h2>
                    <p className="text-slate-300 text-sm mt-1">Dedicated curriculum & personalized coaching</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Teacher Info */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Teacher</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {personalSession.teacherId?.name || 'Awaiting Assignment'}
                      </p>
                    </div>
                  </div>

                  {/* Plan Info */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Status</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm font-bold text-slate-800 capitalize">
                          {personalSession.planType 
                            ? personalSession.planType.replace('Months', ' Months').replace('oneMonth', 'Monthly Plan') 
                            : 'No Plan Selected'}
                        </p>
                        {personalSession.paymentStatus === 'paid' && (
                          <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded">PAID</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {personalSession.status === 'active' && (
                  <div className="px-6 pb-6">
                    <Link to="/student/live-schedule" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm">
                      <Video className="w-5 h-5" /> Join Live Classroom
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Schedule */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-lg">Weekly Schedule</h3>
              </div>

              {!personalSession.scheduledSlots || personalSession.scheduledSlots.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-500">No schedule assigned yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Admin will set up your timings soon.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {personalSession.scheduledSlots.map((slot, idx) => (
                    <div key={slot._id || idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">Slot {idx + 1}</span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded">
                          {slot.platform || 'Google Meet'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">
                          {new Date(slot.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {new Date(slot.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )
      ) : (
        // ─── REGULAR STUDENTS VIEW ───
        learning.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm space-y-4">
             <FolderOpen className="w-16 h-16 text-slate-300 mx-auto" />
             <h3 className="text-lg font-bold text-slate-700">No Active Subscriptions</h3>
             <p className="text-sm text-slate-500 max-w-md mx-auto">
               You haven't enrolled in any courses or subjects yet. Head over to the store to find the perfect course for your grade.
             </p>
             <Link to="/courses" className="inline-block mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors">
               Browse Store
             </Link>
          </div>
        ) : (
          <div className="space-y-8">
             
             {/* Summary Stats */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                   <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
                   <div>
                      <p className="text-xs text-slate-500 font-medium">Total Enrollments</p>
                      <p className="text-xl font-bold text-slate-800">{learning.length}</p>
                   </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                   <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center"><ShieldCheck className="w-5 h-5" /></div>
                   <div>
                      <p className="text-xs text-slate-500 font-medium">Active Status</p>
                      <p className="text-sm font-bold text-emerald-600 mt-1">Verified</p>
                   </div>
                </div>
             </div>

             {/* List of Subscriptions */}
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
               {learning.map((sub, idx) => {
                 const isExpiringSoon = sub.expiryDate && new Date(sub.expiryDate) < new Date(Date.now() + 7 * 86400000);
                 const isExpired = sub.expiryDate && new Date(sub.expiryDate) < new Date();
                 
                 return (
                   <div key={idx} className={`bg-white rounded-xl border ${isExpired ? 'border-rose-200 opacity-75' : isExpiringSoon ? 'border-orange-300' : 'border-slate-200'} shadow-sm overflow-hidden flex flex-col`}>
                      
                      {/* Card Header */}
                      <div className={`p-4 ${isExpired ? 'bg-rose-50' : isExpiringSoon ? 'bg-orange-50' : 'bg-slate-50'} border-b ${isExpired ? 'border-rose-100' : isExpiringSoon ? 'border-orange-100' : 'border-slate-100'} flex items-start justify-between`}>
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sub.type === 'bundle' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-700'}`}>
                                 {sub.type === 'bundle' ? 'FULL BUNDLE' : 'SUBJECT'}
                               </span>
                               {isExpiringSoon && !isExpired && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-200 text-orange-800 flex items-center gap-1">
                                     <Clock className="w-3 h-3" /> Expiring Soon
                                  </span>
                               )}
                               {isExpired && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-800">
                                     Expired
                                  </span>
                               )}
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 leading-tight mt-1">{sub.name}</h3>
                         </div>
                         <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
                            <Award className="w-4 h-4 text-amber-500" />
                         </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                         <div className="space-y-4 mb-6">
                            {(() => {
                               let displaySubjects = sub.subjects || [];
                               if (displaySubjects.length === 0 && sub.type === 'bundle') {
                                  displaySubjects = ['Maths', 'Science', 'Social', 'English', 'Telugu'];
                               }
                               if (displaySubjects.length === 0) return null;
                               return (
                                  <div>
                                     <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5"><LayoutGrid className="w-3.5 h-3.5" /> Included Subjects</p>
                                     <div className="flex flex-wrap gap-1.5">
                                        {displaySubjects.map((s, sIdx) => (
                                           <span key={s._id || sIdx} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-medium rounded-md border border-slate-200">
                                              {typeof s === 'string' ? s : s.name}
                                           </span>
                                        ))}
                                     </div>
                                  </div>
                               );
                            })()}
                            
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                               <Calendar className="w-3.5 h-3.5" />
                               <span>Valid till: <strong className="text-slate-700">{sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Permanent'}</strong></span>
                            </div>
                         </div>
                         
                         {/* Actions */}
                         <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
                            {isExpired ? (
                               <Link to="/courses" className="w-full py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold text-center hover:bg-rose-700 transition-colors">
                                  Renew Subscription
                               </Link>
                            ) : (
                               <>
                                  <Link to="/student/live-schedule" className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors">
                                     <Play className="w-3.5 h-3.5" /> Live Classes
                                  </Link>
                                  <Link to="/student/notes" className="flex-1 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-semibold flex items-center justify-center hover:bg-indigo-100 transition-colors">
                                     Notes & PDF
                                  </Link>
                               </>
                            )}
                         </div>
                      </div>

                   </div>
                 );
               })}
             </div>

          </div>
        )
      )}

    </div>
  );
};

export default MyLearning;
