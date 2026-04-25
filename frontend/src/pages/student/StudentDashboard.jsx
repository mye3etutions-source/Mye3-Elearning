import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import {
  Clock,
  ChevronRight,
  Zap,
  Calendar,
  Trophy,
  MonitorPlay,
  Play,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Users,
  FileText,
  LayoutGrid
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SessionRecapModal from '../../components/student/SessionRecapModal';
import logoImg from '../../assets/output-onlinepngtools.png';
import { FiX, FiCreditCard } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { setCredentials } from '../../store/slices/authSlice';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [learning, setLearning] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recapModal, setRecapModal] = useState({ open: false, session: null });

  // Checkout States
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [matchingCourse, setMatchingCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [buyLoading, setBuyLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('oneMonth');
  const [isInter, setIsInter] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [lRes, aRes] = await Promise.all([
        axios.get('/student/my-learning'),
        axios.get('/student/live-alerts')
      ]);
      setLearning(lRes.data || []);
      setLiveAlerts(aRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data');
      setLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const board = userInfo?.board || '';
      const { data } = await axios.get(`/student/catalog${board ? `?board=${board}` : ''}`);
      const catalog = data || [];
      setCourses(catalog);

      // Find matching course for this student
      const userClass = userInfo?.className?.replace(/\D/g, '') || '';
      const userBoard = userInfo?.board?.toUpperCase().trim() || '';

      const match = catalog.find(c => {
        const courseClass = String(c.classLevel || c.className || '').replace(/\D/g, '') || '';
        const studentBoard = userBoard.replace(' BOARD', '');
        const courseBoard = c.board?.toUpperCase().trim().replace(' BOARD', '') || '';
        return userClass === courseClass && (courseBoard === studentBoard || !courseBoard);
      });
      setMatchingCourse(match);

      const classNum = parseInt(userClass || '0');
      setIsInter(classNum >= 11);
      if (classNum >= 11) {
        const studentBoard = userBoard.replace(' BOARD', '');
        // Include both type='subject' AND individual Inter bundles (class 11/12 bundles per subject)
        // Filter out ₹0 subjects — those are not yet priced/available
        const interItems = catalog.filter(c => {
          const cLevel = parseInt(c.classLevel || '0');
          const cBoard = c.board?.toUpperCase().replace(' BOARD', '').trim() || '';
          const boardMatch = !cBoard || !studentBoard || cBoard === studentBoard;
          const hasPrice = (c.pricing?.oneMonth || c.price || 0) > 0;
          return cLevel === classNum && boardMatch && hasPrice && (
            c.type === 'subject' ||
            // Individual subject bundles for Inter
            (c.type === 'bundle')
          );
        });
        setAvailableSubjects(interItems);
      }
    } catch (error) {
      console.error('Error fetching catalog');
    }
  }, [userInfo]);

  useEffect(() => {
    fetchData();
    fetchCourses();
    window.addEventListener('refresh-student-data', fetchData);
    return () => window.removeEventListener('refresh-student-data', fetchData);
  }, [fetchData, fetchCourses]);

  const handlePayment = async () => {
    let itemsToProcess = [];
    if (isInter) {
      if (selectedItems.length === 0) return toast.error('కనీసం ఒక్క subject అయినా select చేయండి');
      itemsToProcess = selectedItems.map(item => {
        const basePrice = item.pricing?.[selectedDuration] || item.pricing?.oneMonth || item.price || 0;
        let price = basePrice;
        if (!item.pricing?.[selectedDuration]) {
          const base = item.pricing?.oneMonth || item.price || 500;
          if (selectedDuration === 'oneMonth') price = base;
          if (selectedDuration === 'threeMonths') price = Math.round(base * 3 * 0.95);
          if (selectedDuration === 'sixMonths') price = Math.round(base * 6 * 0.90);
          if (selectedDuration === 'twelveMonths') price = Math.round(base * 12 * 0.85);
        }
        return {
          amount: price,
          packageName: `${item.name} - ${selectedDuration}`,
          courseName: `${item.className || userInfo?.className} - ${item.name}`,
          referenceId: item._id || item.id,
          type: 'subject',
          subscriptionType: selectedDuration
        };
      });
    } else {
      if (!selectedCourse) return;
      const price = selectedCourse.pricing?.[selectedDuration] || selectedCourse.price || 0;
      itemsToProcess = [{
        amount: price,
        packageName: `${selectedCourse.className || selectedCourse.name} - ${selectedDuration}`,
        courseName: selectedCourse.className || selectedCourse.name,
        referenceId: selectedCourse._id || selectedCourse.id,
        type: selectedCourse.type || 'bundle',
        subscriptionType: selectedDuration
      }];
    }

    setBuyLoading(true);
    try {
      await axios.post('/student/mock-payment-success', { items: itemsToProcess });
      toast.success('Successfully Purchased! 🎉');

      const addedSubs = itemsToProcess.map(payload => ({
        name: payload.courseName || payload.packageName.split(' - ')[0],
        type: payload.type,
        subscriptionType: payload.subscriptionType,
        expiryDate: new Date(Date.now() + (payload.subscriptionType === 'oneMonth' ? 30 : (payload.subscriptionType === 'threeMonths' ? 90 : (payload.subscriptionType === 'sixMonths' ? 180 : 365))) * 86400000).toISOString(),
        referenceId: payload.referenceId,
        purchaseDate: new Date().toISOString()
      }));

      const updatedUser = {
        ...userInfo,
        activeSubscriptions: [...(userInfo.activeSubscriptions || []), ...addedSubs]
      };

      dispatch(setCredentials(updatedUser));

      setTimeout(() => {
        setBuyLoading(false);
        setShowCheckout(false);
        setSelectedItems([]);
        fetchData();
      }, 1500);
    } catch (error) {
      toast.error('Payment Failed. Try again.');
      setBuyLoading(false);
    }
  };

  const openCheckout = () => {
    if (isInter) {
      if (availableSubjects.length === 0) return toast.error('No subjects found for your class');
      setSelectedCourse({ name: userInfo?.className || 'Inter subjects' });
      setShowCheckout(true);
    } else if (matchingCourse) {
      setSelectedCourse(matchingCourse);
      setSelectedDuration('oneMonth');
      setShowCheckout(true);
    } else {
      toast.error('Class pricing not available');
    }
  };

  const hasSubscriptions = (learning.length > 0) || (userInfo?.activeSubscriptions?.length > 0);

  if (loading) {
    return (
      <div className="space-y-8 p-4 md:p-6 lg:p-10 animate-pulse bg-slate-50/10 min-h-screen">
        <div className="h-32 bg-slate-100 rounded-[40px] border border-slate-50" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-100 rounded-[32px]" />)}
        </div>
        <div className="h-[400px] bg-slate-100 rounded-[48px]" />
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in fade-in duration-700 pb-4 p-3 md:p-4 bg-[#f8fbff]/50 min-h-screen">
      <Toaster position="top-right" />

      {/* 0. SUBSCRIPTION EXPIRY WARNING */}
      {(() => {
        const expiringSoon = learning.filter(sub => {
          const days = Math.ceil((new Date(sub.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
          return days <= 7 && days > 0;
        });
        if (expiringSoon.length === 0) return null;
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-orange-50 border-2 border-orange-200 rounded-[40px] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-orange-900/5"
          >
            <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
              <div className="w-16 h-16 bg-[#f16126] rounded-3xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:rotate-6 transition-transform">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl md:text-2xl font-black text-[#002147] uppercase tracking-tight leading-none">
                  Your access for <span className="text-[#f16126]">{expiringSoon[0].name}</span> expires soon!
                </h3>
              </div>
            </div>
            <Link to="/student/courses" className="px-10 py-5 bg-[#002147] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#f16126] transition-all shadow-xl active:scale-95">Renew Immediately</Link>
          </motion.div>
        );
      })()}

      {/* 1. STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: BookOpen, label: 'Enrolled Subjects', val: learning.length || '0', color: 'bg-indigo-50 text-[#002147]', borderColor: 'border-[#002147]/20' },
          { icon: Users, label: 'Attended Classes', val: '12', color: 'bg-emerald-50 text-emerald-600', borderColor: 'border-emerald-200' },
          { icon: FileText, label: 'Notes Available', val: '45', color: 'bg-[#fff7f0] text-[#f16126]', borderColor: 'border-[#f16126]/25' },
          { icon: LayoutGrid, label: 'All Subjects', val: learning[0]?.subjects?.length || '5', color: 'bg-slate-50 text-slate-500', borderColor: 'border-[#002147]/15' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-4 rounded-xl border-2 ${stat.borderColor} flex items-center gap-4 group transition-all shadow-sm hover:shadow-md`}>
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5">{stat.label}</p>
              <p className="text-xl font-black text-[#002147] tracking-tighter leading-none">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2. MAIN HUB */}
      {!hasSubscriptions ? (
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#002147] rounded-[56px] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl border-b-[12px] border-indigo-600/10"
          >
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#f16126] rounded-full blur-[140px] -mr-64 -mt-64 opacity-10 pointer-events-none" />
            <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
              <div className="flex-1 space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 text-[#f16126] rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                  Restricted Mode
                </div>
                <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">Unlock your <br /><span className="text-[#f16126]">Academic Future</span></h2>
                <p className="text-indigo-200/60 font-bold text-xs md:text-sm uppercase tracking-[0.3em] max-w-xl leading-relaxed">Join your specialized class bubble today to access live sessions and strategy notes.</p>
              </div>

              <div className="w-full lg:w-[340px] bg-white rounded-[44px] p-8 text-slate-900 shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
                <div className="flex justify-between items-start mb-8">
                  <img src={logoImg} className="h-10 object-contain" alt="logo" />
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Entry At</p>
                    <p className="text-2xl font-black text-[#002147] tracking-tighter leading-none tabular-nums">
                      ₹{(matchingCourse?.pricing?.oneMonth || matchingCourse?.price || 200).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="space-y-5 mb-10">
                  <h4 className="text-xl font-black uppercase text-[#002147] tracking-tight">{userInfo?.className || 'Class Bundle'}</h4>
                  <div className="space-y-3">
                    {['Live Daily Classes', 'Full Subject Notes', 'Recorded Recaps', 'Weekly Mock Tests'].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group/item">
                        <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        </div>
                        <span className="text-[11px] font-black uppercase text-slate-500 tracking-wide">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={openCheckout}
                  className="w-full py-6 bg-[#002147] text-white rounded-[24px] font-black text-[13px] uppercase tracking-widest hover:bg-[#f16126] transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-95 group/btn"
                >
                  Enroll Now <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Live Mentorship', desc: 'Real-time doubt clearing with top faculty.', icon: MonitorPlay, bg: 'bg-indigo-50/50', iconColor: 'text-[#002147]' },
              { title: 'Full Curriculum', desc: 'Specially targeted for Board Excellence.', icon: Zap, bg: 'bg-orange-50/50', iconColor: 'text-[#f16126]' },
              { title: 'Smart Analytics', desc: 'Track your growth and learning speed.', icon: Trophy, bg: 'bg-emerald-50/50', iconColor: 'text-emerald-500' }
            ].map((box, i) => (
              <div key={i} className="bg-white p-10 rounded-[52px] border border-slate-50 shadow-sm hover:shadow-xl transition-all text-center space-y-6 group">
                <div className={`w-16 h-16 ${box.bg} rounded-[24px] flex items-center justify-center mx-auto ${box.iconColor} group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                  <box.icon className="w-8 h-8" />
                </div>
                <div className="space-y-2 text-center">
                  <h4 className="text-sm font-black uppercase text-[#002147] tracking-[0.2em]">{box.title}</h4>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-2">{box.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* SIDE BY SIDE: DASHBOARD BANNER + SUBSCRIPTION CARD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* LEFT: DASHBOARD BANNER */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#002147] to-[#003a7a] rounded-2xl p-5 text-white relative overflow-hidden shadow-lg"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#f16126] rounded-full blur-[80px] -mr-10 -mt-10 opacity-20 pointer-events-none" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-emerald-400 rounded-lg border border-white/5 text-[9px] font-black uppercase tracking-widest mb-3">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Access Active
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">DASHBOARD</h2>
                  <p className="text-indigo-200/50 font-bold text-[9px] uppercase tracking-widest mt-1">Daily live lessons & repository</p>
                </div>
                <Link to="/student/live-schedule" className="flex items-center justify-center gap-2 px-5 py-3 bg-[#f16126] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-[#002147] transition-all active:scale-95 w-full">
                  Start Live Session <Play className="w-3 h-3 fill-current" />
                </Link>
              </div>
            </motion.div>

            {/* RIGHT: SUBSCRIPTION + TIMETABLE */}
            <div className="bg-white rounded-2xl border-2 border-slate-100 p-5 shadow-md hover:border-[#f16126]/30 transition-all">
              <div className="flex items-start gap-3 mb-3">
                <Zap className="w-4 h-4 text-[#f16126] fill-current mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Institutional Access</p>
                  <h3 className="text-lg font-black text-[#002147] uppercase tracking-tight leading-tight truncate">
                    {learning[0]?.originalBundleName || learning[0]?.name || 'My Subscription'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-slate-50 rounded-md text-[8px] font-black text-slate-500 uppercase tracking-widest border border-slate-100">Validity</span>
                    <span className="text-[10px] font-black text-[#f16126]">
                      {learning[0]?.expiryDate ? new Date(learning[0].expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Permanent'}
                    </span>
                  </div>
                </div>
              </div>

              {/* TIME TABLE inline */}
              <div className="bg-[#f8fbff] rounded-xl p-3 border border-slate-100 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-black text-[#002147] uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#f16126]" /> Time Table
                  </span>
                  <Link to="/student/live-schedule" className="text-[8px] font-black text-[#f16126] uppercase hover:underline">View All</Link>
                </div>
                {liveAlerts.filter(s => s.status === 'upcoming').slice(0, 2).length > 0 ? (
                  liveAlerts.filter(s => s.status === 'upcoming').slice(0, 2).map((s, i) => (
                    <div key={i} className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-center justify-between mb-1.5 last:mb-0">
                      <p className="text-[10px] font-black text-[#002147] uppercase tracking-tight line-clamp-1">{s.title}</p>
                      <p className="text-[9px] font-bold text-[#f16126] shrink-0 ml-2">{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-2 text-center">
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">No classes today</p>
                  </div>
                )}
              </div>

              <Link to="/student/notes" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#002147] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#f16126] transition-all w-full active:scale-95">
                VIEW NOTES ARCHIVE
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* SCHEDULE TODAY */}
            <div className="bg-white rounded-2xl border-2 border-[#002147]/20 shadow-[0_4px_16px_rgba(0,33,71,0.10)] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                <Calendar className="w-4 h-4 text-[#f16126]" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#002147]">Scheduled Today</h3>
              </div>
              <div className="p-3 space-y-2">
                {liveAlerts.filter(s => s.status === 'upcoming').length > 0 ? (
                  liveAlerts.filter(s => s.status === 'upcoming').slice(0, 3).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-[#002147]/20 hover:bg-[#f8fbff] transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white text-[#f16126] rounded-lg flex items-center justify-center font-black text-[9px] border border-slate-100 shrink-0">
                          {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div>
                          <p className="font-black text-[#002147] text-[11px] uppercase tracking-tight line-clamp-1">{s.title}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">{new Date(s.startTime).toLocaleDateString('en-GB')}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#f16126] transition-colors shrink-0" />
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">No classes on agenda.</p>
                  </div>
                )}
              </div>
            </div>

            {/* RECAPS */}
            <div className="bg-white rounded-2xl border-2 border-[#f16126]/25 shadow-[0_4px_16px_rgba(241,97,38,0.10)] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#002147]">Digital Recaps</h3>
              </div>
              <div className="p-3 space-y-2">
                {liveAlerts.filter(s => s.status === 'ended').length > 0 ? (
                  liveAlerts.filter(s => s.status === 'ended').slice(0, 3).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white text-emerald-500 rounded-lg flex items-center justify-center border border-emerald-100 shrink-0">
                          <MonitorPlay className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-[#002147] text-[11px] uppercase tracking-tight line-clamp-1">{s.title}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Library Updated</p>
                        </div>
                      </div>
                      <Link to="/student/notes" className="w-8 h-8 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center hover:bg-emerald-100 hover:text-emerald-600 transition-all shrink-0">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Recordings library empty.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FEATURED SUBJECTS */}
          <div className="bg-white rounded-2xl border-2 border-[#002147]/20 shadow-[0_4px_16px_rgba(0,33,71,0.10)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
              <BookOpen className="w-4 h-4 text-[#f16126]" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#002147]">Featured Subjects</h3>
            </div>
            <div className="p-3 grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {(learning[0]?.subjects || ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English']).map((sub, i) => (
                <div key={i} className="bg-slate-50 p-3 rounded-xl border-2 border-slate-100 hover:border-[#f16126] hover:bg-[#fff7f0] transition-all text-center group cursor-pointer shadow-sm">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mx-auto mb-2 border border-slate-100 group-hover:border-[#f16126]/30 group-hover:scale-110 transition-all">
                    <LayoutGrid className="w-4 h-4 text-[#002147]" />
                  </div>
                  <p className="text-[8px] font-black text-[#002147] uppercase tracking-tight line-clamp-1">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      <SessionRecapModal
        isOpen={recapModal.open}
        onClose={() => setRecapModal({ open: false, session: null })}
        session={recapModal.session}
      />

      {/* CHECKOUT MODAL */}
      <AnimatePresence>
        {showCheckout && selectedCourse && (
          <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4 backdrop-blur-3xl bg-[#002147]/70" onClick={() => setShowCheckout(false)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-[48px] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#002147] p-8 text-white relative border-b-8 border-[#f16126]">
                <button onClick={() => setShowCheckout(false)} className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-[#f16126] transition-all"><FiX className="w-5 h-5" /></button>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-indigo-300">{isInter ? 'Inter Subject-Wise Enrollment' : 'Class Selection'}</p>
                <h3 className="text-2xl font-black uppercase tracking-tighter">{isInter ? (userInfo?.className || 'Intermediate') : (selectedCourse?.className || selectedCourse?.name)}</h3>
                {isInter && selectedItems.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedItems.map(s => (
                      <span key={s._id || s.id} className="px-2 py-0.5 bg-[#f16126]/80 text-white text-[9px] font-black uppercase tracking-wider rounded-md">{s.name}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                {isInter ? (
                  <div className="space-y-5">

                    {/* Step 1 — Subject Selection */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full bg-[#002147] flex items-center justify-center shrink-0">
                          <span className="text-[8px] font-black text-white">1</span>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#002147]">Select Subjects</p>
                      </div>
                      <div className="space-y-2 max-h-[26vh] overflow-y-auto pr-1">
                        {availableSubjects.length === 0 ? (
                          <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subjects not yet available for your class/board.</p>
                            <p className="text-[9px] text-slate-300 mt-1">Contact admin to add subjects.</p>
                          </div>
                        ) : availableSubjects.map(sub => {
                          const price = sub.pricing?.oneMonth || sub.price || 0;
                          const isSelected = selectedItems.some(i => (i._id || i.id) === (sub._id || sub.id));
                          return (
                            <button key={sub._id || sub.id} onClick={() => {
                              const key = sub._id || sub.id;
                              if (isSelected) setSelectedItems(selectedItems.filter(i => (i._id || i.id) !== key));
                              else setSelectedItems([...selectedItems, sub]);
                            }} className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all active:scale-[0.98] ${isSelected
                                ? 'border-[#002147] bg-[#f8fbff] shadow-md'
                                : 'border-slate-100 hover:border-[#002147]/30 bg-slate-50 hover:bg-white'
                              }`}>
                              <div className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#002147] bg-[#002147]' : 'border-slate-300 bg-white'
                                  }`}>
                                  {isSelected && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </div>
                                <p className={`text-[11px] font-black uppercase text-left tracking-wide ${isSelected ? 'text-[#002147]' : 'text-slate-500'
                                  }`}>{sub.name}</p>
                              </div>
                              <div className="text-right">
                                <p className={`text-[13px] font-black ${isSelected ? 'text-[#f16126]' : 'text-slate-400'
                                  }`}>₹{price.toLocaleString()}</p>
                                <p className="text-[8px] text-slate-300 font-bold">/month</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-slate-200" />

                    {/* Step 2 — Duration Selection (always visible, dims until subject selected) */}
                    <div className={`transition-all duration-300 ${selectedItems.length === 0 ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'
                      }`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${selectedItems.length > 0 ? 'bg-[#f16126]' : 'bg-slate-200'
                          }`}>
                          <span className="text-[8px] font-black text-white">2</span>
                        </div>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${selectedItems.length > 0 ? 'text-[#002147]' : 'text-slate-400'
                          }`}>Select Duration</p>
                        {selectedItems.length === 0 && (
                          <span className="text-[8px] text-slate-300 font-bold italic ml-auto">↑ Select a subject first</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['oneMonth', 'threeMonths', 'sixMonths', 'twelveMonths'].map(dur => {
                          const labelMap = { oneMonth: 'Monthly', threeMonths: 'Quarterly', sixMonths: 'Half-Yearly', twelveMonths: 'Annual' };
                          const subLabelMap = { oneMonth: '1 Month', threeMonths: '3 Months · -5%', sixMonths: '6 Months · -10%', twelveMonths: '12 Months · -15%' };
                          const discountMap = { oneMonth: 1, threeMonths: 0.95 * 3, sixMonths: 0.90 * 6, twelveMonths: 0.85 * 12 };
                          const total = selectedItems.reduce((sum, item) => {
                            const base = item.pricing?.oneMonth || item.price || 0;
                            const p = item.pricing?.[dur] || Math.round(base * discountMap[dur]);
                            return sum + p;
                          }, 0);
                          const isSelected = selectedDuration === dur;
                          return (
                            <button key={dur} onClick={() => setSelectedDuration(dur)}
                              className={`flex flex-col items-start p-3 rounded-2xl border-2 transition-all active:scale-95 ${isSelected
                                  ? 'border-[#f16126] bg-orange-50 shadow-md'
                                  : 'border-slate-100 hover:border-orange-200 bg-white'
                                }`}>
                              <div className="flex items-center gap-1.5 mb-1">
                                <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#f16126] bg-[#f16126]' : 'border-slate-300'
                                  }`}>
                                  {isSelected && <div className="w-1 h-1 bg-white rounded-full" />}
                                </div>
                                <span className={`text-[9px] font-black uppercase ${isSelected ? 'text-[#f16126]' : 'text-slate-500'
                                  }`}>{labelMap[dur]}</span>
                                {dur === 'twelveMonths' && (
                                  <span className="text-[7px] bg-emerald-500 text-white px-1 py-0.5 rounded font-black">BEST</span>
                                )}
                              </div>
                              <p className={`text-[8px] font-bold ${isSelected ? 'text-orange-400' : 'text-slate-300'
                                }`}>{subLabelMap[dur]}</p>
                              <p className={`text-base font-black mt-1 tracking-tight ${isSelected ? 'text-[#002147]' : 'text-slate-600'
                                }`}>₹{total > 0 ? total.toLocaleString() : '—'}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="space-y-3">
                    {['oneMonth', 'threeMonths', 'sixMonths', 'twelveMonths'].map(dur => {
                      const price = selectedCourse?.pricing?.[dur];
                      if (!price || (price === 0 && dur !== 'oneMonth')) return null;
                      const isSelected = selectedDuration === dur;
                      return (
                        <button key={dur} onClick={() => setSelectedDuration(dur)} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isSelected ? 'border-[#f16126] bg-orange-50/50 shadow-lg' : 'border-slate-100 hover:border-slate-200'
                          }`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#f16126] bg-[#f16126]' : 'border-slate-200'
                              }`}>
                              {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <p className={`text-xs font-black uppercase ${isSelected ? 'text-[#002147]' : 'text-slate-400'
                              }`}>{dur.replace(/([A-Z])/g, ' $1')}</p>
                          </div>
                          <p className={`text-xl font-black ${isSelected ? 'text-[#f16126]' : 'text-[#002147]'
                            }`}>₹{price?.toLocaleString()}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
                <button
                  disabled={buyLoading || (isInter && selectedItems.length === 0)}
                  onClick={handlePayment}
                  className="w-full bg-[#f16126] text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-[#002147] transition-all shadow-xl active:scale-95 disabled:opacity-40 mt-2"
                >
                  {buyLoading ? 'Authorizing...' : (
                    <>
                      <span>Approve & Pay</span>
                      {isInter && selectedItems.length > 0 && (
                        <span className="bg-white/20 px-2 py-0.5 rounded-lg text-[10px]">
                          ₹{selectedItems.reduce((sum, item) => {
                            const base = item.pricing?.oneMonth || item.price || 0;
                            const dm = { oneMonth: 1, threeMonths: 2.85, sixMonths: 5.4, twelveMonths: 10.2 };
                            return sum + Math.round(base * (dm[selectedDuration] || 1));
                          }, 0).toLocaleString()}
                        </span>
                      )}
                      <FiCreditCard className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;
