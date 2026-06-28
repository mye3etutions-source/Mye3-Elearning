import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  TrendingUp, 
  Play, 
  Users, 
  FileText, 
  Award,
  ChevronRight,
  Zap,
  LayoutGrid,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  X,
  CheckCircle2,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import toast, { Toaster } from 'react-hot-toast';
import logoImg from '../../assets/output-onlinepngtools.png';

const StudentDashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [learning, setLearning] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [materialsCount, setMaterialsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState('oneMonth');
  const [buyLoading, setBuyLoading] = useState(false);

  const [personalSession, setPersonalSession] = useState(null);
  const [personalLoading, setPersonalLoading] = useState(true);

  // Auto-detect if user is an Intermediate student
  const userClassNum = userInfo?.className?.toLowerCase().includes('1-on-1') ? '' : userInfo?.className?.replace(/\D/g, '') || '';
  const isInter = userClassNum === '11' || userClassNum === '12';

  // State for Intermediate filtering
  const [interYear, setInterYear] = useState(userClassNum || '11');
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [matchingCourse, setMatchingCourse] = useState(null);

  const fetchData = async () => {
    try {
      const [lRes, aRes, mRes, pRes] = await Promise.all([
        axios.get('/student/my-learning'),
        axios.get('/student/live-alerts'),
        axios.get('/student/all-materials'),
        axios.get('/student/personal-sessions')
      ]);
      setLearning(lRes.data || []);
      setLiveAlerts(aRes.data || []);
      setMaterialsCount(mRes.data?.length || 0);

      const personalSessions = pRes.data || [];
      const activeOrAssigned = personalSessions.find(s => ['assigned', 'active', 'pending'].includes(s.status)) || personalSessions[0];
      setPersonalSession(activeOrAssigned || null);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data');
      setLoading(false);
    }
  };

  const handlePayPersonalSession = async (sessionId) => {
    // Redirect to Store for payment — Razorpay handles activation now
    navigate('/student/courses');
  };

  const getNextUpcomingSlot = (session) => {
    if (!session || !session.scheduledSlots) return null;
    const upcoming = session.scheduledSlots
      .filter(s => s.status === 'upcoming' || s.status === 'live')
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    return upcoming[0] || null;
  };

  const isJoinActive = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMinutes = (start - now) / (1000 * 60);
    return diffMinutes <= 15;
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

  useEffect(() => {
    fetchData();
  }, []);

  // Sync with Store's catalog if needed for "Buy Now" flow
  useEffect(() => {
    const fetchCatalog = async () => {
      if (!isInter) {
        try {
          const { data } = await axios.get(`/student/catalog?board=${userInfo?.board || ''}`);
          const match = data.find(c => String(c.classLevel || '').replace(/\D/g, '') === userClassNum);
          setMatchingCourse(match);
        } catch (e) { console.error("Catalog fetch failed"); }
      } else {
        // Fetch specific subjects for Inter
        try {
          const { data } = await axios.get(`/student/catalog?board=${userInfo?.board || ''}`);
          const filtered = data.filter(c => String(c.classLevel || '') === interYear && c.type === 'subject');
          setAvailableSubjects(filtered);
        } catch (e) { console.error("Inter catalog failed"); }
      }
    };
    if (userInfo) fetchCatalog();
  }, [userInfo, isInter, interYear, userClassNum]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!selectedCourse) return;
    setBuyLoading(true);

    try {
      // 1. Get Payment Config from Backend
      const configRes = await axios.get('/payments/config');
      const { enableRealPayment, keyId } = configRes.data;

      // 2. Prepare Payload
      const itemsToProcess = [{
        amount: selectedCourse.pricing?.[selectedDuration] || selectedCourse.price || 500,
        packageName: `${selectedCourse.name} - ${selectedDuration}`,
        courseName: selectedCourse.name,
        referenceId: selectedCourse._id || selectedCourse.id,
        type: selectedCourse.type || 'subject',
        subscriptionType: selectedDuration
      }];

      if (enableRealPayment && keyId) {
        // --- REAL RAZORPAY FLOW ---
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error('Failed to load payment gateway');
          setBuyLoading(false);
          return;
        }

        const totalAmount = itemsToProcess[0].amount;
        const orderRes = await axios.post('/payments/orders', {
          amount: totalAmount,
          type: selectedCourse.type || 'subject',
          referenceIds: [itemsToProcess[0].referenceId],
          selectedDuration: selectedDuration,
          names: [selectedCourse.name]
        });

        const order = orderRes.data;
        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Mye3 Academy',
          description: selectedCourse.name,
          order_id: order.id,
          handler: async function (response) {
            try {
              toast.success('Verifying Access...');
              const verifyRes = await axios.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyRes.data.status === 'ok') {
                dispatch(setCredentials(verifyRes.data.user));
                toast.success('Course Activated!');
                setShowCheckout(false);
                fetchData();
              }
            } catch (err) {
              toast.error('Verification failed');
            } finally {
              setBuyLoading(false);
            }
          },
          prefill: { name: userInfo?.name || '', email: userInfo?.email || '' },
          theme: { color: '#002147' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // --- MOCK PAYMENT FLOW ---
        toast.success(`Processing Mock Payment...`);
        await axios.post('/student/mock-payment-success', { items: itemsToProcess });
        
        // Update local state (Optimistic)
        const newSub = {
          name: selectedCourse.name,
          type: selectedCourse.type || 'subject',
          subscriptionType: selectedDuration,
          expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
          purchaseDate: new Date().toISOString()
        };
        dispatch(setCredentials({
          ...userInfo,
          activeSubscriptions: [...(userInfo.activeSubscriptions || []), newSub]
        }));

        setTimeout(() => {
          setBuyLoading(false);
          setShowCheckout(false);
          toast.success('Access Granted!');
          fetchData();
        }, 1500);
      }
    } catch (error) {
      toast.error('Payment failed');
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

  const hasSubscriptions = learning.length > 0 || (userInfo?.activeSubscriptions && userInfo.activeSubscriptions.length > 0);

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 animate-pulse">
        <div className="h-32 bg-slate-100 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-50 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20 p-4 md:p-6 lg:px-8 bg-slate-50/50 min-h-screen">
      <Toaster position="top-right" />
      
      {/* 1. WELCOME SECTION */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-[#002147] rounded-xl flex items-center justify-center p-2 shadow-sm">
            <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-orange-50 text-[#f16126] text-[10px] font-semibold rounded border border-orange-100">Student Portal</span>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-[#002147]">
              Welcome, <span className="text-[#f16126] font-semibold">{userInfo?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-0.5">Class {userInfo?.className || 'N/A'} • {userInfo?.board || 'N/A'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Link to="/student/profile" className="p-2.5 bg-slate-50 text-[#002147] rounded-lg hover:bg-[#002147] hover:text-white transition-colors border border-slate-200">
             <Users className="w-5 h-5" />
           </Link>
           {!userInfo?.isOneOnOne && (
             <button onClick={() => navigate('/student/classes')} className="px-5 py-2.5 bg-[#f16126] text-white rounded-lg font-semibold text-sm hover:bg-[#002147] transition-colors shadow-sm active:scale-95">
               My Classes
             </button>
           )}
        </div>
      </div>

      {/* 2. STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: ShieldCheck, label: userInfo?.isOneOnOne ? 'Active Trainings' : 'Active Courses', val: userInfo?.isOneOnOne ? (personalSession?.status === 'active' ? '1' : '0') : (learning.length || '0'), color: 'bg-indigo-50 text-[#002147]', borderColor: 'border-indigo-100' },
          { icon: Users, label: 'Attended Classes', val: liveAlerts.filter(s => s.status === 'ended').length || '0', color: 'bg-emerald-50 text-emerald-600', borderColor: 'border-emerald-100' },
          { icon: FileText, label: 'Study Materials', val: materialsCount || '0', color: 'bg-orange-50 text-[#f16126]', borderColor: 'border-orange-100' },
          { icon: BookOpen, label: 'Enrolled Subjects', val: userInfo?.isOneOnOne ? (personalSession?.subjectName ? '1' : '0') : (learning.reduce((sum, item) => sum + (item.subjects?.length || 1), 0) || '0'), color: 'bg-slate-50 text-slate-600', borderColor: 'border-slate-200' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-xl border ${stat.borderColor} bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex items-center gap-4`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 mb-0.5">{stat.label}</p>
              <h4 className="text-xl font-bold text-slate-800">{stat.val}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. MAIN HUB */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SIDE BY SIDE: DASHBOARD BANNER + SUBSCRIPTION CARD */}
          <div className={`grid grid-cols-1 ${userInfo?.isOneOnOne ? '' : 'md:grid-cols-2'} gap-4`}>

            {/* LEFT: DASHBOARD BANNER */}
            {!userInfo?.isOneOnOne && (
              <div className="bg-gradient-to-br from-[#002147] to-[#003a7a] rounded-xl p-6 text-white relative overflow-hidden shadow-sm flex flex-col justify-between h-[180px]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#f16126] rounded-full blur-[60px] opacity-20 pointer-events-none -mr-10 -mt-10" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 text-emerald-400 rounded-md border border-white/5 text-[10px] font-semibold mb-3">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Access Active
                  </div>
                  <h2 className="text-xl font-bold mb-1">Dashboard</h2>
                  <p className="text-indigo-200/80 text-xs">Daily live lessons & notes</p>
                </div>
                <Link to="/student/live-schedule" className="relative z-10 inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#f16126] text-white rounded-lg font-semibold text-sm hover:bg-white hover:text-[#002147] transition-colors w-max">
                  Start Live Session <Play className="w-4 h-4 fill-current" />
                </Link>
              </div>
            )}

            {/* RIGHT: SUBSCRIPTION STATUS */}
            {!userInfo?.isOneOnOne && (
              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-[180px]">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-500" />
                    <span className="text-sm font-semibold text-slate-700">Status</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${hasSubscriptions ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {hasSubscriptions ? 'Subscribed' : 'Not Subscribed'}
                  </span>
                </div>

                {hasSubscriptions ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 leading-relaxed">Your account is active. You have full access to curriculum subjects and live faculty support.</p>
                    <Link to="/student/classes" className="text-sm font-semibold text-[#f16126] hover:underline flex items-center gap-1 w-max">
                      Go to My Classes <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 leading-relaxed">Unlock all subjects, video lessons, and mock tests for your current grade.</p>
                    <button 
                      onClick={openCheckout}
                      className="w-full py-2 bg-[#002147] text-white rounded-lg font-semibold text-sm hover:bg-[#f16126] transition-colors"
                    >
                      Buy Subscription
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 1-on-1 PERSONAL SESSIONS WIDGET */}
          {userInfo?.isOneOnOne && (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                 <div className="flex items-center gap-2">
                   <Zap className="w-4 h-4 text-indigo-600 animate-pulse" />
                   <h3 className="text-sm font-bold text-slate-800">1-on-1 Personal Class Status</h3>
                 </div>
                 {personalSession && personalSession.subjectName && (
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {personalSession.subjectName}
                    </span>
                  )}
               </div>
 
               {!personalSession ? (
                 <div className="p-5 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
                   <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                   <div>
                     <h4 className="text-sm font-bold text-amber-800">Awaiting Teacher &amp; Schedule Assignment</h4>
                     <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                       Our administrator is currently assigning a teacher, subject, and class schedule for you.
                     </p>
                   </div>
                 </div>
               ) : personalSession.status === 'pending' && personalSession.paymentStatus === 'pending' ? (
                 <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 rounded-xl border border-orange-100 space-y-4">
                   <div className="flex justify-between items-start">
                     <div>
                       <h4 className="text-sm font-bold text-slate-800">Choose a Plan to Get Started!</h4>
                       <p className="text-xs text-slate-500 mt-1">Please select and purchase a package to register.</p>
                     </div>
                     <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-extrabold rounded uppercase tracking-wider">Awaiting Payment</span>
                   </div>
 
                   <p className="text-xs text-slate-600 leading-relaxed">
                     You can purchase any of our 1-on-1 packages (Monthly, Quarterly, Half-Yearly, or Annually). 
                     Once paid, our coordinator will immediately assign your teacher and set up your personalized class schedule.
                   </p>
 
                   <button
                     onClick={() => navigate('/student/courses')}
                     className="w-full py-3 bg-[#f16126] hover:bg-[#002147] text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
                   >
                     <CreditCard className="w-4 h-4" /> Choose Plan &amp; Pay
                   </button>
                 </div>
               ) : personalSession.status === 'pending' && personalSession.paymentStatus === 'paid' ? (
                 <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
                   <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                   <div>
                     <h4 className="text-sm font-bold text-emerald-800">Payment Verified!</h4>
                     <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                       We have received your payment for the <strong>{formatPlanType(personalSession.planType)} Plan</strong>. 
                       Our coordinator is currently setting up your timetable and assigning your dedicated teacher. 
                       Your schedule will appear here shortly.
                     </p>
                   </div>
                 </div>
               ) : personalSession.status === 'assigned' ? (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 rounded-xl border border-orange-100 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Class &amp; Schedule Assigned!</h4>
                      <p className="text-xs text-slate-500 mt-1">Please pay to activate your sessions.</p>
                    </div>
                    <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-extrabold rounded uppercase tracking-wider">Awaiting Payment</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-orange-200/40 pt-3">
                    <div>
                      <span className="text-slate-400 font-medium uppercase tracking-wider text-[9px] block">Subject</span>
                      <span className="font-bold text-slate-800">{personalSession.subjectName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium uppercase tracking-wider text-[9px] block">Teacher</span>
                      <span className="font-bold text-slate-800">{personalSession.teacherId?.name || 'Assigned Faculty'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium uppercase tracking-wider text-[9px] block">Duration / Plan</span>
                      <span className="font-bold text-slate-800">
                        {personalSession.planType ? formatPlanType(personalSession.planType) : 'Select in Store'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium uppercase tracking-wider text-[9px] block">Total Fee</span>
                      <span className="font-extrabold text-indigo-700">
                        {personalSession.price > 0 ? `₹${personalSession.price.toLocaleString('en-IN')}` : 'Varies by Plan'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (personalSession.planType) {
                        handlePayPersonalSession(personalSession._id);
                      } else {
                        navigate('/student/courses');
                      }
                    }}
                    className="w-full py-3 bg-[#f16126] hover:bg-[#002147] text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" /> 
                    {personalSession.planType ? 'Pay Now to Activate' : 'Choose Plan & Pay'}
                  </button>
                </div>
              ) : personalSession.status === 'active' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <div>
                        <h4 className="text-xs font-bold text-emerald-800">Subscription Active &amp; Verified</h4>
                        <p className="text-[10px] text-emerald-700 mt-0.5">Payment confirmed successfully</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold rounded uppercase">Paid</span>
                  </div>

                  {/* Next Slot details */}
                  {(() => {
                    const nextSlot = getNextUpcomingSlot(personalSession);
                    if (!nextSlot) {
                      return (
                        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl text-center text-xs text-slate-500 font-medium">
                          No upcoming slots scheduled. All slots completed.
                        </div>
                      );
                    }
                    
                    const slotStart = new Date(nextSlot.startTime);
                    const now = new Date();
                    const diffMins = (slotStart - now) / (1000 * 60);
                    const canJoin = diffMins <= 15;

                    return (
                      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-wider pb-2 border-b border-slate-200/40">
                          <span>Next Upcoming Session</span>
                          <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[9px]">{nextSlot.platform || 'Google Meet'}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                              {slotStart.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-indigo-500" />
                              {slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(nextSlot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium pt-1">
                              Faculty: <span className="font-bold text-slate-700">{personalSession.teacherId?.name}</span>
                            </div>
                          </div>

                          <div className="text-right flex items-center justify-end">
                            {nextSlot.status === 'live' ? (
                              <a
                                href={nextSlot.meetingLink?.startsWith('http') ? nextSlot.meetingLink : `https://${nextSlot.meetingLink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-md inline-flex items-center gap-1"
                              >
                                Join Class <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <div className="text-center">
                                <Link
                                  to="/student/live-schedule"
                                  className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors"
                                >
                                  View Schedule <ChevronRight className="w-3 h-3" />
                                </Link>
                                <span className="text-[9px] text-slate-400 font-medium block mt-1">Waiting for teacher</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-blue-800">Training Completed</h4>
                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                      All scheduled sessions for this personal training bundle have been marked as completed. 
                      Thank you for training with us!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* UPCOMING CLASSES PREVIEW */}
          {!userInfo?.isOneOnOne && (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                 <div className="flex items-center gap-2">
                   <Clock className="w-4 h-4 text-[#f16126]" />
                   <h3 className="text-sm font-bold text-slate-800">Upcoming Classes</h3>
                 </div>
                 <Link to="/student/live-schedule" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">View All</Link>
              </div>
              
              <div className="space-y-3">
                {liveAlerts.filter(s => s.status === 'upcoming').length === 0 ? (
                  <div className="py-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <p className="text-sm text-slate-500">No classes scheduled for today</p>
                  </div>
                ) : (
                  liveAlerts.filter(s => s.status === 'upcoming').slice(0, 3).map((session, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-indigo-100 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center font-bold text-[#002147] border border-slate-200">
                            {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </div>
                         <div>
                            <p className="text-sm font-semibold text-slate-800">{session.title}</p>
                            <p className="text-xs text-slate-500">{session.subjectName || 'General'}</p>
                         </div>
                      </div>
                      <Link to="/student/live-schedule" className="p-2 bg-white rounded-md border border-slate-200 text-slate-400 hover:text-indigo-600 transition-colors">
                         <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (4) */}
        <div className="lg:col-span-4 space-y-6">
           
           {/* QUICK ACTIONS */}
           <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">Quick Navigation</h3>
              <div className="space-y-2">
                 {[
                   ...(!userInfo?.isOneOnOne ? [{ label: 'My Classes', path: '/student/classes', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' }] : []),
                   { label: 'Notes & PDF', path: '/student/notes', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
                   { label: 'Live Schedule', path: '/student/live-schedule', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                   ...(!userInfo?.isOneOnOne ? [{ label: 'Performance', path: '/student/performance', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' }] : []),
                 ].map((action, i) => (
                   <Link key={i} to={action.path} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${action.bg} ${action.color} rounded-md flex items-center justify-center`}>
                          <action.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">{action.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                   </Link>
                 ))}
              </div>
           </div>

           {/* FEATURED SUBJECTS */}
           {!userInfo?.isOneOnOne && (
              <div className="bg-[#002147] rounded-xl p-6 text-white relative overflow-hidden shadow-md">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-[#f16126] rounded-full blur-[40px] opacity-20 -mr-8 -mt-8" />
                 <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2">
                       <Sparkles className="w-4 h-4 text-[#f16126]" />
                       <span className="text-xs font-semibold text-indigo-100">Featured Subjects</span>
                    </div>
                    <div className="space-y-3">
                       {learning.slice(0, 2).map((sub, i) => (
                          <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                             <p className="text-[10px] text-indigo-300 mb-0.5">Active Now</p>
                             <p className="text-sm font-semibold">{sub.name}</p>
                          </div>
                       ))}
                       <Link to="/courses" className="block text-center py-2.5 bg-[#f16126] rounded-lg font-semibold text-sm hover:bg-white hover:text-[#002147] transition-colors mt-2">Explore Catalogue</Link>
                    </div>
                 </div>
              </div>
           )}

        </div>
      </div>

      {/* CHECKOUT MODAL */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl relative"
            >
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">
                      {isInter ? 'Inter Subjects' : 'Class Subscription'}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">{selectedCourse?.name || userInfo?.className}</p>
                  </div>
                  <button 
                    onClick={() => setShowCheckout(false)}
                    className="p-1.5 bg-slate-100 text-slate-400 rounded-md hover:bg-rose-100 hover:text-rose-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {isInter ? (
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-slate-700">Select Your Year & Subject</p>
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                      {['11', '12'].map(y => (
                        <button
                          key={y}
                          onClick={() => setInterYear(y)}
                          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-colors ${interYear === y ? 'bg-white text-[#002147] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          {y === '11' ? 'First Year' : 'Second Year'}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2 scrollbar-hide">
                      {availableSubjects.map((sub, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedCourse(sub)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${selectedCourse?._id === sub._id ? 'border-[#f16126] bg-orange-50' : 'border-slate-200 hover:border-indigo-100 bg-white'}`}
                        >
                          <div className="text-left">
                            <p className="text-sm font-semibold text-slate-800">{sub.name}</p>
                            <p className="text-xs text-slate-500">{sub.board}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-800">₹{sub.pricing?.oneMonth || sub.price}</p>
                            <p className="text-[10px] text-slate-500">Monthly</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {['oneMonth', 'threeMonths', 'sixMonths', 'twelveMonths'].map(dur => (
                      <button
                        key={dur}
                        onClick={() => setSelectedDuration(dur)}
                        className={`p-3 rounded-xl border text-left transition-colors ${selectedDuration === dur ? 'border-[#f16126] bg-orange-50' : 'border-slate-200 hover:border-indigo-100 bg-white'}`}
                      >
                        <p className={`text-xs font-semibold mb-1 ${selectedDuration === dur ? 'text-[#f16126]' : 'text-slate-500'}`}>
                          {dur.replace('Months', ' Months').replace('one', '1')}
                        </p>
                        <p className="text-base font-bold text-slate-800">₹{selectedCourse?.pricing?.[dur] || (selectedCourse?.price * (dur === 'oneMonth' ? 1 : (dur === 'threeMonths' ? 3 : (dur === 'sixMonths' ? 6 : 12))))}</p>
                      </button>
                    ))}
                  </div>
                )}

                <div className="pt-5 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Final Amount</p>
                      <p className="text-2xl font-bold text-slate-800">
                        ₹{selectedCourse?.pricing?.[selectedDuration] || selectedCourse?.price || 0}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={buyLoading || !selectedCourse}
                    className={`w-full py-3.5 bg-[#002147] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${buyLoading ? 'opacity-80' : 'hover:bg-[#f16126]'}`}
                  >
                    {buyLoading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Confirm & Pay <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;
