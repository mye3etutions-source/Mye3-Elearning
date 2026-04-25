import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
  FiCreditCard,
  FiX,
  FiBook,
  FiMonitor,
  FiLayers,
  FiCalendar
} from 'react-icons/fi';
import { GraduationCap } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import courseItem1 from '../../assets/course-item-1.webp';
import courseItem2 from '../../assets/course-item-2.webp';
import courseItem3 from '../../assets/course-item-3.webp';
import courseItem4 from '../../assets/course-item-4.webp';
import brandSymbol from '../../assets/logo copy.png';
import logoImg from '../../assets/output-onlinepngtools.png';


const CourseCard = ({ c, selectedItems, setSelectedItems, userInfo, setPendingSubject }) => {
  const isBundle = c.type === 'bundle';
  const isSelected = selectedItems.find(item => item.id === c.id);
  
  const baseMonthly = c.pricing?.oneMonth || c.price || 0;
  const hasPrice = baseMonthly > 0;
  
  const handleSelect = () => {
    if (!hasPrice) return;
    if (isSelected) {
      setSelectedItems(prev => prev.filter(item => item.id !== c.id));
    } else {
      setPendingSubject(c);
    }
  };

  // Normalize for comparison
  const userClass = userInfo?.className?.replace(/\D/g, '') || '';
  const courseClass = String(c.classLevel || c.className || '').replace(/\D/g, '') || '';
  const userBoard = userInfo?.board?.toUpperCase().trim() || '';
  const courseBoard = c.board?.toUpperCase().trim() || '';

  const isEligible = !userInfo || (userClass === courseClass && (!courseBoard || !userBoard || courseBoard === userBoard));

  const priceToDisplay = c.pricing?.oneMonth || c.price || 0;

  return (
    <motion.div
      whileHover={{ y: hasPrice ? -5 : 0, scale: hasPrice ? 1.01 : 1 }}
      className={`group bg-white p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-full ${!isEligible
          ? 'opacity-70 blur-[0.5px]'
          : isSelected
            ? 'border-orange-500 shadow-xl ring-2 ring-orange-500/20'
            : hasPrice
              ? 'hover:border-orange-500/30 hover:shadow-xl shadow-sm border-slate-100'
              : 'border-slate-100 shadow-sm opacity-80'
        }`}
    >
      <div className={`absolute top-0 left-0 w-full h-1.5 ${!hasPrice ? 'bg-slate-200' : isBundle ? 'bg-orange-500' : 'bg-[#002147]'
        } opacity-80`} />

      <div className="flex items-start justify-between mb-4 mt-2">
        <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center p-0.5 shadow-sm transition-all ${hasPrice ? 'bg-[#002147]' : 'bg-slate-200'
          }`}>
          <img src={brandSymbol} alt="logo" className="w-[85%] h-[85%] object-contain drop-shadow" />
        </div>
        <div className="text-right">
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 ${hasPrice ? 'text-orange-500' : 'text-slate-400'}`}>Course Fee</p>
          {hasPrice ? (
            <p className="text-2xl font-black text-[#002147] tracking-tight leading-none">
              ₹{priceToDisplay.toLocaleString()}
              <span className="text-[10px] font-bold text-slate-400 ml-1">/mo</span>
            </p>
          ) : (
            <div className="flex items-center gap-1.5 justify-end">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <p className="text-[11px] font-black text-amber-500 uppercase tracking-wider">Coming Soon</p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 flex-1">
        <div className="flex items-center gap-2.5 mb-2.5">
          <p className="text-[12px] font-black text-orange-600 uppercase tracking-widest leading-none">
            {Number(courseClass) === 11 ? 'Inter 1st Year' : Number(courseClass) === 12 ? 'Inter 2nd Year' : `Class ${courseClass}`}
          </p>
          {courseBoard && (
            <span className="px-2.5 py-1 bg-[#00142e] text-orange-400 text-[9px] border border-[#002147] shadow-[0_2px_10px_rgba(0,33,71,0.2)] font-black rounded uppercase tracking-widest">
              {courseBoard}
            </span>
          )}
        </div>
        <h3 className="text-base font-black text-[#002147] leading-snug tracking-tight mb-2 uppercase">{c.name}</h3>
        
        {hasPrice && (
            <p className="text-[10px] font-semibold text-slate-400 leading-relaxed uppercase tracking-widest">
                Full Curriculum Access
            </p>
        )}
      </div>

      <div className="relative z-10 mt-auto">
        {isEligible ? (
          hasPrice ? (
            <button
              onClick={handleSelect}
              className={`w-full py-3.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${isSelected
                  ? 'bg-[#002147] text-white hover:bg-rose-500'
                  : 'bg-orange-500 text-white hover:bg-[#f16126] hover:shadow-orange-500/20'
                }`}
            >
              {isSelected ? (
                <>REMOVE FROM CART <FiX className="w-4 h-4" /></>
              ) : (
                <>{isBundle ? 'ADD BUNDLE' : 'BUY NOW'} <FiArrowRight className="w-4 h-4" /></>
              )}
            </button>
          ) : (
            <button disabled className="w-full bg-slate-50 text-slate-400 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest cursor-not-allowed border border-dashed border-slate-200">
              COMING SOON
            </button>
          )
        ) : (
          <div className="space-y-2">
            <button disabled className="w-full bg-slate-50 text-slate-400 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest cursor-not-allowed border border-dashed border-slate-200">
              RESTRICTED
            </button>
            <p className="text-[8px] text-center font-bold text-rose-400 uppercase tracking-widest">Only for {userClass || 'designated'} grade</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const StoreCarousel = () => {
  const [current, setCurrent] = useState(0);
  const images = [courseItem1, courseItem2, courseItem3, courseItem4];

  const decorativeIcons = [
    { Icon: FiBook, bg: 'bg-orange-100', color: 'text-orange-600', pos: 'top-4 left-4', delay: 0 },
    { Icon: FiMonitor, bg: 'bg-blue-100', color: 'text-blue-600', pos: 'bottom-4 left-4', delay: 0.2 },
    { Icon: FiCheckCircle, bg: 'bg-emerald-100', color: 'text-emerald-600', pos: 'top-4 right-4', delay: 0.4 },
    { Icon: FiLayers, bg: 'bg-purple-100', color: 'text-purple-600', pos: 'bottom-4 right-4', delay: 0.6 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-[140px] md:h-[240px] rounded-3xl bg-transparent flex items-center justify-center overflow-visible">
      {decorativeIcons.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 0.8, y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: item.delay }}
          className={`absolute ${item.pos} z-20 flex w-7 h-7 md:w-10 md:h-10 rounded-full ${item.bg} items-center justify-center shadow-sm border border-white md:scale-100`}
        >
          <item.Icon className={`w-5 h-5 ${item.color}`} />
        </motion.div>
      ))}

      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={images[current]}
          alt="Course Preview"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-contain object-top z-10"
        />
      </AnimatePresence>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
        {images.map((_, i) => (
          <div key={i} className={`h-0.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-orange-500' : 'w-1.5 bg-slate-200'}`} />
        ))}
      </div>
    </div>
  );
};

const StudentStore = () => {
  const { boardName } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [pendingSubject, setPendingSubject] = useState(null);
  const [promptDuration, setPromptDuration] = useState('oneMonth');
  const [activeInterYear, setActiveInterYear] = useState(11);

  // Mobile Specific Filter State
  const [selectedMobileClass, setSelectedMobileClass] = useState('6');
  const [selectedMobileBoard, setSelectedMobileBoard] = useState('TS Board');

  // Helper to format board name from URL (e.g., 'ts-board' -> 'TS Board')
  const getFormattedBoard = (slug) => {
    if (!slug) return null;
    const clean = slug.replace('-board', '').toUpperCase();
    if (clean === 'CBSE' || clean === 'ICSE') return clean;
    return slug.split('-').map(word => word === 'board' ? 'Board' : word.toUpperCase()).join(' ');
  };
  const activeBoardFilter = getFormattedBoard(boardName);

  const juniorRef = useRef(null);
  const seniorRef = useRef(null);

  const fetchCourses = async () => {
    try {
      // Pass the student's board if logged in to get specific pricing
      const board = userInfo?.board || '';
      const { data } = await axios.get(`/student/catalog${board ? `?board=${board}` : ''}`);

      let baseCourses = data || [];
      if (baseCourses.length === 0) {
        // Simple fallback defaults if DB is empty
        baseCourses = [
          { id: 'c6', name: 'Class 6 - All Subjects', classLevel: '6', type: 'bundle', price: 999, subjects: [{ name: 'Maths' }] },
          { id: 'c10', name: 'Class 10 - All Subjects', classLevel: '10', type: 'bundle', price: 1499, subjects: [{ name: 'Maths' }] },
        ];
      }

      const sorted = baseCourses.sort((a, b) => parseInt(a.classLevel?.toString().replace(/\D/g, '') || '0') - parseInt(b.classLevel?.toString().replace(/\D/g, '') || '0'));
      setCourses(sorted);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, [userInfo]);

  // Hash scrolling support
  useEffect(() => {
    if (location.hash && !loading) {
      setTimeout(() => {
        const id = decodeURIComponent(location.hash.substring(1));
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }, 50); // fast scroll after render
    }
  }, [location.hash, loading]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    if (section === 'junior' && juniorRef.current) {
      juniorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (section === 'senior' && seniorRef.current) {
      seniorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location, courses]);

  useEffect(() => {
    if (userInfo?.role?.toLowerCase() === 'student' && userInfo.className) {
      const userClassNum = userInfo.className.replace(/\D/g, '');
      const level = parseInt(userClassNum);
      
      // Auto-set the active year for Intermediate students
      if (level === 11 || level === 12) {
        setActiveInterYear(level);
      }
      
      // Auto-set for mobile view
      setSelectedMobileClass(userClassNum || '6');
      
      if (userInfo.board) {
        setSelectedMobileBoard(userInfo.board);
      }
    }
  }, [userInfo]);

  // Handle direct buy from dashboard
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    if (action === 'buy' && !loading && courses.length > 0) {
      // Find matching course for user's class and board
      const userClass = userInfo?.className?.replace(/\D/g, '') || '';
      const userBoard = userInfo?.board?.toUpperCase().trim() || '';

      const match = courses.find(c => {
        const courseClass = String(c.classLevel || c.className || '').replace(/\D/g, '') || '';
        const courseBoard = c.board?.toUpperCase().trim().replace(' BOARD', '') || '';
        const studentBoard = userBoard.replace(' BOARD', '');

        return userClass === courseClass && (courseBoard === studentBoard || !courseBoard);
      });

      if (match) {
        setSelectedItems([match]);
        setShowCheckout(true);
        // Clean up URL to prevent repeat triggers on reload
        window.history.replaceState({}, '', '/student/courses');
      }
    }
  }, [location, loading, courses, userInfo]);



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
    if (selectedItems.length === 0) return;
    setBuyLoading(true);

    try {
      // 1. Get Payment Config from Backend
      const configRes = await axios.get('/payment/config');
      const { enableRealPayment, keyId } = configRes.data;

      // 2. Prepare Payload (consistent for both flows)
      const itemsPayload = selectedItems.map(item => {
        const basePrice = item.pricing?.oneMonth || item.price || 500;
        const discountMap = { oneMonth: 1, threeMonths: 0.95 * 3, sixMonths: 0.90 * 6, twelveMonths: 0.85 * 12 };
        const price = item.finalPrice || item.pricing?.[item.selectedDuration || 'oneMonth'] || Math.round(basePrice * (discountMap[item.selectedDuration || 'oneMonth'] || 1));
        
        return {
          amount: price,
          packageName: `${item.name} - ${item.selectedDuration || 'oneMonth'}`,
          courseName: item.type === 'subject' ? `${item.className} - ${item.name}` : item.name,
          referenceId: item._id || item.id,
          type: item.type || 'subject',
          subscriptionType: item.selectedDuration || 'oneMonth'
        };
      });

      // 3. Decide Flow
      if (enableRealPayment && keyId) {
        // --- REAL RAZORPAY FLOW ---
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error('Failed to load payment gateway. Check your connection.');
          setBuyLoading(false);
          return;
        }
        const totalAmount = itemsPayload.reduce((acc, i) => acc + i.amount, 0);
        const orderRes = await axios.post('/payments/orders', {
          amount: totalAmount,
          type: selectedItems.length > 1 ? 'bundle' : 'subject',
          referenceIds: itemsPayload.map(i => i.referenceId),
          selectedDuration: itemsPayload[0]?.subscriptionType || 'oneMonth',
          names: itemsPayload.map(i => i.courseName)
        });

        const order = orderRes.data;

        const options = {
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Mye3 Academy',
          description: itemsPayload.map(i => i.courseName).join(', '),
          // image: brandSymbol, // Local images cause CORS errors in dev; disabling for now
          order_id: order.id,
          handler: async function (response) {
            try {
              toast.success('Payment Received! Verifying Access...');
              
              // Call the new verification endpoint
              const verifyRes = await axios.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyRes.data.status === 'ok') {
                // Update local Redux state immediately so "My Classes" shows the sub
                dispatch(setCredentials(verifyRes.data.user));
                
                toast.success('Tuition Activated Successfully!');
                
                setTimeout(() => {
                  setBuyLoading(false);
                  setShowCheckout(false);
                  setSelectedItems([]);
                  navigate('/student/dashboard');
                }, 1500);
              }
            } catch (err) {
              console.error('Verification Error:', err);
              toast.error('Verification failed. Please contact support if amount was deducted.');
              setBuyLoading(false);
            }
          },
          prefill: {
            name: userInfo?.name || '',
            email: userInfo?.email || '',
          },
          theme: { color: '#002147' },
        };


        const rzp = new window.Razorpay(options);
        rzp.open();
        rzp.on('payment.failed', (err) => {
          toast.error('Payment failed: ' + err.error.description);
          setBuyLoading(false);
        });

      } else {
        // --- MOCK PAYMENT FLOW ---
        toast.success(`Processing Mock Payment for ${selectedItems.length} items...`);
        
        // Match the backend logic for mock success if possible, 
        // or just proceed with local update as before.
        try {
            await axios.post('/student/mock-payment-success', { items: itemsPayload });
        } catch (e) { console.warn("Mock endpoint failed, proceeding anyway"); }

        const addedSubs = itemsPayload.map(payload => ({
          name: payload.courseName || payload.packageName.split(' - ')[0],
          type: payload.type,
          subscriptionType: payload.subscriptionType,
          expiryDate: new Date(Date.now() + (payload.subscriptionType === 'oneMonth' ? 30 : (payload.subscriptionType === 'threeMonths' ? 90 : (payload.subscriptionType === 'sixMonths' ? 180 : 365))) * 86400000).toISOString(),
          referenceId: payload.referenceId,
          purchaseDate: new Date().toISOString()
        }));

        const updatedUser = {
          ...userInfo,
          activeSubscriptions: [
            ...(userInfo.activeSubscriptions || []),
            ...addedSubs
          ]
        };
        dispatch(setCredentials(updatedUser));

        setTimeout(() => {
          setBuyLoading(false);
          setShowCheckout(false);
          setSelectedItems([]);
          navigate('/student/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Payment Error:', error);
      toast.error(error.response?.data?.message || 'Payment processing failed');
      setBuyLoading(false);
    }
  };

  const filteredCourses = (courses || []).filter(c =>
    (c.className?.toLowerCase() || c.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  // Only filter if user is a student and has specific class/board settings
  const isStudentFiltered = userInfo?.role?.toLowerCase() === 'student' &&
    (userInfo?.className || userInfo?.board);

  const finalFiltered = (isStudentFiltered ? filteredCourses.filter(c => {
    const courseClass = String(c.classLevel || c.className || '').replace(/\D/g, '') || '';
    const userClass = userInfo?.className?.replace(/\D/g, '') || '';
    const courseBoard = c.board?.toUpperCase().trim() || '';
    const userBoard = userInfo?.board?.toUpperCase().trim() || '';

    // Only show if class matches (and board if specified)
    return userClass === courseClass && (!courseBoard || !userBoard || courseBoard === userBoard);
  }) : filteredCourses).filter(c => {
    if (!activeBoardFilter) return true;
    const cBoard = c.board?.toUpperCase().trim() || '';
    const fBoard = activeBoardFilter.toUpperCase().trim();
    return cBoard === fBoard;
  });

  const juniorCourses = finalFiltered.filter(c => {
    const lvl = Number(c.classLevel);
    return lvl >= 1 && lvl <= 10;
  });
  const interFirstYear = finalFiltered.filter(c => Number(c.classLevel) === 11);
  const interSecondYear = finalFiltered.filter(c => Number(c.classLevel) === 12);

  const renderBoardGroups = (courseList) => {
    // If a specific board is being filtered via URL, only show that board
    let boards = ['TS Board', 'AP Board', 'CBSE Board', 'ICSE Board'];

    if (activeBoardFilter) {
      const formattedFilter = activeBoardFilter.toUpperCase().trim();
      boards = boards.filter(b => b.toUpperCase().includes(formattedFilter));
    }

    const grouped = {};
    boards.forEach(b => {
      const baseBoard = b.replace(' Board', '');
      const filtered = courseList.filter(c => {
        const cBoard = (c.board || 'TS Board').toUpperCase().trim();
        return cBoard === b.toUpperCase().trim() ||
          cBoard === baseBoard.toUpperCase().trim();
      });
      grouped[b] = filtered;
    });

    return Object.entries(grouped).map(([boardName, boardCourses]) => {
      // Hide empty boards if we are filtering or if specifically requested
      if (boardCourses.length === 0) return null;
      return (
        <div key={boardName} id={boardName} className="space-y-5 scroll-mt-24">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{boardName}</span>
            <div className="flex-1 h-[1px] bg-slate-50" />
          </div>
          {boardCourses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boardCourses.map(c => (
                <CourseCard key={c.id} c={c} selectedItems={selectedItems} setSelectedItems={setSelectedItems} userInfo={userInfo} setPendingSubject={setPendingSubject} />
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate- pulse">Loading Courses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfd] min-h-screen font-sans">
      <Toaster position="top-right" />



      {/* Top Search Strip */}
      <div className="bg-[#002147] py-4 md:py-5 px-3 md:px-4 w-full shadow-lg z-20">
        <div className="max-w-[750px] mx-auto flex h-[48px] md:h-[52px] relative">
          <div className="flex-1 relative flex items-center bg-white rounded-l-2xl overflow-hidden">
            <FiSearch className="text-slate-400 w-4 h-4 md:w-5 md:h-5 ml-4 md:ml-6 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search class or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 px-3 md:px-5 text-xs md:text-[15px] font-bold text-[#002147] outline-none h-full bg-transparent placeholder-slate-400"
            />
          </div>
          <button className="bg-orange-500 text-white px-5 md:px-10 h-full text-[11px] md:text-[13px] font-black uppercase tracking-widest rounded-r-2xl hover:bg-orange-600 transition-all">
            Search
          </button>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-6 pb-10">
        <div className="bg-white rounded-3xl border border-orange-100 overflow-hidden shadow-sm flex flex-col md:flex-row h-auto min-h-[200px]">
          <div className="w-full md:w-[65%] p-8 flex flex-col justify-center border-r-0 md:border-r-2 border-orange-500 relative overflow-hidden bg-white">
            <div className="relative z-10">
              <div className="hidden md:flex items-center gap-2 mb-4 px-4 py-1 bg-orange-50 rounded-full w-fit border border-orange-100 shadow-sm">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Select Your Class</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-[#002147] mb-3 md:mb-4 italic md:not-italic tracking-tighter leading-none uppercase">
                <span className="md:hidden">MYE3 <span className="text-orange-500 not-italic">ACADEMY</span></span>
                <span className="hidden md:inline">
                  {activeBoardFilter ? `${activeBoardFilter} ` : 'MYE3-E-TUITION '}
                  <span className="text-orange-500 not-italic">{activeBoardFilter ? 'TUITIONS' : 'ACADEMY'}</span>
                </span>
              </h1>
              <p className="text-slate-500 font-bold italic text-xs md:text-sm max-w-xl mb-6 leading-relaxed">
                <span className="md:hidden">Explore our comprehensive online courses and start learning with expert tutors.</span>
                <span className="hidden md:inline">
                  {activeBoardFilter
                    ? `Specially curated courses for ${activeBoardFilter} students to achieve academic excellence.`
                    : "Explore our comprehensive online courses and start learning with expert tutors."}
                </span>
              </p>
              <div className="hidden md:flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100"><FiCheckCircle /> All Subjects</div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100"><FiCheckCircle /> Live Classes</div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-[35%] bg-slate-50 relative p-6 flex items-center justify-center"><StoreCarousel /></div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 pb-32 space-y-8">
        {/* Mobile Filter Navigation */}
        <div className="md:hidden space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          {/* Board Selector */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Board</p>
            <div className="flex flex-wrap gap-2">
              {['TS Board', 'AP Board', 'CBSE Board', 'ICSE Board'].map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedMobileBoard(b)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all border ${selectedMobileBoard === b
                      ? 'bg-[#002147] text-white border-[#002147] shadow-md scale-105'
                      : 'bg-white text-slate-600 border-slate-100 hover:border-orange-500/50'
                    }`}
                >
                  {b.replace(' Board', '')}
                </button>
              ))}
            </div>
          </div>

          {/* School Tuitions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#002147]">School Tuitions</span>
              <div className="flex-1 h-[1px] bg-slate-100" />
            </div>
            <div className="flex flex-wrap gap-2">
              {['6', '7', '8', '9', '10'].map(cls => (
                <button
                  key={cls}
                  onClick={() => setSelectedMobileClass(cls)}
                  className={`w-10 h-10 rounded-full text-xs font-black transition-all border flex items-center justify-center ${selectedMobileClass === cls
                      ? 'bg-orange-500 text-white border-orange-500 shadow-lg scale-110'
                      : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-orange-500/20'
                    }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Intermediate */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#002147]">Intermediate</span>
              <div className="flex-1 h-[1px] bg-slate-100" />
            </div>
            <div className="flex gap-3">
              {(!isStudentFiltered || userInfo?.className?.includes('11') || !userInfo?.className?.includes('12')) && (
                <button
                  onClick={() => setSelectedMobileClass('11')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedMobileClass === '11'
                      ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                      : 'bg-[#002147] text-white border-[#002147]'
                    }`}
                >
                  First Year
                </button>
              )}
              {(!isStudentFiltered || userInfo?.className?.includes('12') || !userInfo?.className?.includes('11')) && (
                <button
                  onClick={() => setSelectedMobileClass('12')}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedMobileClass === '12'
                      ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                      : 'bg-[#002147] text-white border-[#002147]'
                    }`}
                >
                  Second Year
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Existing Listings (Conditional for Desktop/Mobile) */}
        <div className="hidden md:block space-y-12">

          {juniorCourses.length > 0 && (
            <section ref={juniorRef} className="scroll-mt-32 space-y-8">
              <div className="flex items-center gap-6">
                <div className="px-5 py-2 bg-[#002147] text-white rounded-2xl transform -skew-x-12"><h2 className="text-xl font-black italic tracking-tight uppercase leading-none skew-x-12">School Tuitions</h2></div>
                <div className="flex-1 h-[2px] bg-slate-100" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">CLASS 6TH - 10TH</span>
              </div>
              {renderBoardGroups(juniorCourses)}
            </section>
          )}

          {(interFirstYear.length > 0 || interSecondYear.length > 0) && (
            <div className="scroll-mt-32 space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="flex items-center gap-3">
                  {(!isStudentFiltered || userInfo?.className?.includes('11') || !userInfo?.className?.includes('12')) && (
                    <button
                      onClick={() => setActiveInterYear(11)}
                      className={`px-8 py-3 rounded-2xl font-black italic tracking-tight uppercase transition-all shadow-md transform -skew-x-12 ${activeInterYear === 11 ? 'bg-orange-500 text-white' : 'bg-[#002147] text-white hover:bg-orange-500'
                        }`}
                    >
                      <span className="inline-block skew-x-12">First Year</span>
                    </button>
                  )}
                  {(!isStudentFiltered || userInfo?.className?.includes('12') || !userInfo?.className?.includes('11')) && (
                    <button
                      onClick={() => setActiveInterYear(12)}
                      className={`px-8 py-3 rounded-2xl font-black italic tracking-tight uppercase transition-all shadow-md transform -skew-x-12 ${activeInterYear === 12 ? 'bg-orange-500 text-white' : 'bg-[#002147] text-white hover:bg-orange-500'
                        }`}
                    >
                      <span className="inline-block skew-x-12">Second Year</span>
                    </button>
                  )}
                </div>
                <div className="hidden md:flex flex-1 h-[2px] bg-slate-100" />
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">
                  {activeInterYear === 11 ? 'CLASS 11TH' : 'CLASS 12TH'}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeInterYear}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                >
                  {activeInterYear === 11 ? renderBoardGroups(interFirstYear) : renderBoardGroups(interSecondYear)}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile Filtered Listing */}
        <div className="md:hidden space-y-8">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">
              Showing {selectedMobileBoard} - Class {selectedMobileClass}
            </span>
            <div className="flex-1 h-[1px] bg-slate-100" />
          </div>

          {finalFiltered.filter(c => {
            const cClass = String(c.classLevel || c.className || '').replace(/\D/g, '');
            const cBoard = (c.board || 'TS Board').toUpperCase().trim();
            const fBoard = selectedMobileBoard.toUpperCase().trim();
            return (cClass === selectedMobileClass || (selectedMobileClass === '11' && c.classLevel === '11') || (selectedMobileClass === '12' && c.classLevel === '12')) &&
              (cBoard === fBoard || cBoard === fBoard.replace(' BOARD', ''));
          }).length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {finalFiltered.filter(c => {
                const cClass = String(c.classLevel || c.className || '').replace(/\D/g, '');
                const cBoard = (c.board || 'TS Board').toUpperCase().trim();
                const fBoard = selectedMobileBoard.toUpperCase().trim();
                return cClass === selectedMobileClass && (cBoard === fBoard || cBoard === fBoard.replace(' BOARD', ''));
              }).map(c => (
                <CourseCard key={c.id} c={c} selectedItems={selectedItems} setSelectedItems={setSelectedItems} userInfo={userInfo} setPendingSubject={setPendingSubject} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 p-12 rounded-3xl border border-dashed border-slate-200 text-center">
              <FiBook className="w-8 h-8 text-slate-300 mx-auto mb-4" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No courses found for this selection</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart Bar */}
      <AnimatePresence>
        {selectedItems.length > 0 && !showCheckout && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 w-full z-50 p-4 pointer-events-none"
          >
            <div className="max-w-4xl mx-auto bg-[#002147] rounded-3xl shadow-[0_-10px_60px_rgba(0,33,71,0.3)] p-4 md:p-6 flex items-center justify-between pointer-events-auto border-2 border-orange-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-[60px] opacity-10 -mr-16 -mt-16 pointer-events-none" />
              <div className="flex items-center gap-4 md:gap-8 text-white relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl border border-white/10 shadow-inner">
                  {selectedItems.length}
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-black text-orange-400 uppercase tracking-[0.2em] mb-1">Tuition Cart</p>
                  <p className="text-lg md:text-2xl font-black tracking-tighter">
                    {selectedItems.length === 1 ? '1 Subject' : `${selectedItems.length} Subjects Selected`}
                  </p>
                </div>
                <div className="hidden md:block w-[1px] h-10 bg-white/10 mx-2" />
                <div className="hidden md:block">
                  <p className="text-xl font-black text-orange-500">
                    ₹{selectedItems.reduce((acc, item) => acc + item.finalPrice, 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowCheckout(true);
                }}
                className="bg-orange-500 text-white px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.15em] flex items-center gap-3 hover:bg-white hover:text-[#002147] transition-all active:scale-95 shadow-2xl group"
              >
                PROCEED TO CHECKOUT <FiArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCheckout && selectedItems.length > 0 && (
          <div
            key="checkout-overlay"
            onClick={() => setShowCheckout(false)}
            className="fixed inset-0 z-[2100] flex items-center justify-center p-4 backdrop-blur-2xl bg-[#002147]/80 cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-white rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] cursor-default flex flex-col"
            >
              {/* Header - Unified with Dashboard Style */}
              <div className="bg-orange-600 p-8 text-white relative border-b-8 border-[#002147]">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center hover:bg-[#002147] transition-all z-30 cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-white/70">Finalize Enrollment</p>
                <h3 className="text-3xl font-black uppercase tracking-tighter">
                  Checkout Summary
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedItems.map((item, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/10 backdrop-blur-sm">
                      {item.name} ({item.selectedDuration === 'oneMonth' ? '1M' : item.selectedDuration === 'threeMonths' ? '3M' : item.selectedDuration === 'sixMonths' ? '6M' : '1Y'})
                    </span>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                {/* Subjects List with chosen durations */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#002147]">Cart Breakdown</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {selectedItems.map((item, idx) => {
                      const durLabel = item.selectedDuration === 'oneMonth' ? 'Monthly' : item.selectedDuration === 'threeMonths' ? 'Quarterly' : item.selectedDuration === 'sixMonths' ? 'Half-Yearly' : 'Annual';
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 bg-slate-50 shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-[#002147]">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="text-[12px] font-black uppercase tracking-wider text-[#002147]">
                                {item.name}
                              </p>
                              <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest">{durLabel} Access</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-black tracking-tight text-[#002147]">
                              ₹{item.finalPrice.toLocaleString()}
                            </p>
                            <button 
                              onClick={() => setSelectedItems(prev => prev.filter(i => i.id !== item.id))}
                              className="text-[8px] font-black text-rose-400 uppercase tracking-widest hover:text-rose-600 transition-colors"
                            >
                              Remove Item
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-dashed border-slate-200">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Payable</p>
                    <p className="text-3xl font-black tracking-tighter text-[#002147]">
                      ₹{selectedItems.reduce((acc, i) => acc + i.finalPrice, 0).toLocaleString()}
                    </p>
                  </div>

                  {/* Confirm & Pay */}
                  <button 
                    disabled={buyLoading} 
                    onClick={handlePayment} 
                    className="w-full bg-[#002147] text-white py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:shadow-[0_10px_30px_rgba(0,33,71,0.4)] transition-all shadow-xl active:scale-95 disabled:opacity-50"
                  >
                    {buyLoading ? 'Authorizing Payment...' : (
                      <>CONFIRM & PAY <FiCreditCard className="w-5 h-5" /></>
                    )}
                  </button>
                </div>

                <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Secure encrypted checkout handled by Mye3 Academy
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* PROMPT DURATION MODAL */}
        {pendingSubject && (
            <div className="fixed inset-0 z-[2200] flex items-center justify-center p-4 backdrop-blur-2xl bg-[#002147]/80 cursor-pointer" onClick={() => setPendingSubject(null)}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-md bg-white rounded-[48px] overflow-hidden shadow-2xl cursor-default"
                >
                    <div className="bg-orange-600 p-8 text-white relative border-b-8 border-[#002147]">
                        <button onClick={() => setPendingSubject(null)} className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-[#002147] transition-all"><FiX className="w-5 h-5" /></button>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-white/70">Finalize Enrollment</p>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">{pendingSubject.name}</h3>
                    </div>

                    <div className="p-8 space-y-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#002147] mb-4">Select Tuition Duration</p>
                            <div className="space-y-3">
                                {['oneMonth', 'threeMonths', 'sixMonths', 'twelveMonths'].map(dur => {
                                    const labels = { oneMonth: 'Monthly Access', threeMonths: 'Quarterly (3 Months)', sixMonths: 'Half-Yearly (6 Months)', twelveMonths: 'Annual (12 Months)' };
                                    const active = promptDuration === dur;
                                    
                                    const baseMonthly = pendingSubject.pricing?.oneMonth || pendingSubject.price || 500;
                                    const discountMap = { oneMonth: 1, threeMonths: 0.95 * 3, sixMonths: 0.90 * 6, twelveMonths: 0.85 * 12 };
                                    const price = pendingSubject.pricing?.[dur] || Math.round(baseMonthly * (discountMap[dur] || 1));

                                    return (
                                        <button
                                            key={dur}
                                            onClick={() => setPromptDuration(dur)}
                                            className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${active 
                                                ? 'border-orange-500 bg-orange-50 shadow-md ring-2 ring-orange-100' 
                                                : 'border-slate-100 hover:border-orange-200'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${active ? 'border-orange-500 bg-orange-500' : 'border-slate-200'}`}>
                                                    {active && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                                <p className={`text-[11px] font-black uppercase ${active ? 'text-[#002147]' : 'text-slate-400'}`}>{labels[dur]}</p>
                                            </div>
                                            <p className={`text-xl font-black ${active ? 'text-orange-500' : 'text-slate-500'}`}>₹{price.toLocaleString()}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                const baseMonthly = pendingSubject.pricing?.oneMonth || pendingSubject.price || 500;
                                const discountMap = { oneMonth: 1, threeMonths: 0.95 * 3, sixMonths: 0.90 * 6, twelveMonths: 0.85 * 12 };
                                const price = pendingSubject.pricing?.[promptDuration] || Math.round(baseMonthly * (discountMap[promptDuration] || 1));
                                
                                setSelectedItems(prev => [...prev, { 
                                    ...pendingSubject, 
                                    selectedDuration: promptDuration, 
                                    finalPrice: price 
                                }]);
                                setPendingSubject(null);
                                toast.success(`${pendingSubject.name} added to cart!`);
                            }}
                            className="w-full bg-[#002147] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4"
                        >
                            ADD TO CART <FiArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentStore;
