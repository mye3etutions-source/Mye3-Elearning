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
  const isSelected = selectedItems.find(item => item.id === c.id);
  const navigate = useNavigate();
  
  const baseMonthly = c.pricing?.oneMonth || c.price || 0;
  const hasPrice = baseMonthly > 0;
  
  const isSubscribed = userInfo?.activeSubscriptions?.some(sub => {
    if (!sub) return false;
    
    // Direct ID match
    if (c._id && (sub.referenceId === c._id || sub.courseId === c._id)) return true;
    if (c.id && (sub.referenceId === c.id || sub.courseId === c.id)) return true;
    
    const cNameStr = String(c.name || '').toLowerCase();
    const subNameStr = String(sub.name || '').toLowerCase();
    
    if (cNameStr === subNameStr) return true;
    
    // Sometimes sub.name is just "Class 6" while c.name is "Class 6 (All Subjects)"
    if (cNameStr.includes(subNameStr) && subNameStr.includes('class')) return true;
    
    // If it's a bundle and matches the user's class exactly
    if (c.type === 'bundle' || cNameStr.includes('all subjects')) {
       const userClassNum = String(userInfo?.className || '').replace(/\D/g, '');
       const courseClassNum = String(c.classLevel || c.className || '').replace(/\D/g, '');
       if (userClassNum && userClassNum === courseClassNum && (sub.type === 'bundle' || String(sub.name).toLowerCase().includes('class'))) {
           return true;
       }
    }
    
    return false;
  });

  const handleSelect = () => {
    if (isSubscribed) {
      navigate('/student/classes');
      return;
    }
    if (!hasPrice) return;
    if (isSelected) {
      setSelectedItems(prev => prev.filter(item => item.id !== c.id));
    } else {
      setPendingSubject(c);
    }
  };

  const userClass = userInfo?.className?.replace(/\D/g, '') || '';
  const courseClass = String(c.classLevel || c.className || '').replace(/\D/g, '') || '';
  const userBoard = userInfo?.board?.toUpperCase().trim() || '';
  const courseBoard = c.board?.toUpperCase().trim() || '';

  const isEligible = !userInfo || (userClass === courseClass && (!courseBoard || !userBoard || courseBoard === userBoard));

  const priceToDisplay = c.pricing?.oneMonth || c.price || 0;

  return (
    <motion.div
      whileHover={{ y: hasPrice ? -4 : 0 }}
      className={`group bg-white p-5 rounded-xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between h-full ${!isEligible
          ? 'opacity-70 blur-[0.5px]'
          : isSelected
            ? 'border-orange-500 shadow-md ring-1 ring-orange-500/20'
            : isSubscribed 
              ? 'border-emerald-200 shadow-sm bg-emerald-50/10'
              : hasPrice
                ? 'hover:border-slate-300 hover:shadow-md shadow-sm border-slate-200'
                : 'border-slate-200 shadow-sm opacity-80'
        }`}
    >
      <div className={`absolute top-0 left-0 w-full h-1 ${!hasPrice ? 'bg-slate-200' : isSubscribed ? 'bg-emerald-500' : 'bg-[#002147]'} opacity-80`} />

      <div className="flex items-start justify-between mb-4 mt-1">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center p-1 transition-colors ${hasPrice ? 'bg-slate-50' : 'bg-slate-100'}`}>
          <img src={brandSymbol} alt="logo" className="w-[80%] h-[80%] object-contain" />
        </div>
        <div className="text-right">
          <p className={`text-xs font-semibold mb-0.5 ${hasPrice ? 'text-orange-500' : 'text-slate-400'}`}>Course Fee</p>
          {hasPrice ? (
            <p className="text-xl font-bold text-slate-800 leading-none">
              ₹{priceToDisplay.toLocaleString()}
              <span className="text-xs font-medium text-slate-500 ml-1">/mo</span>
            </p>
          ) : (
            <span className="text-xs font-semibold text-amber-500">Coming Soon</span>
          )}
        </div>
      </div>

      <div className="mb-5 flex-1">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs font-bold text-orange-600">
            {Number(courseClass) === 11 ? 'Inter 1st Year' : Number(courseClass) === 12 ? 'Inter 2nd Year' : `Class ${courseClass}`}
          </p>
          {courseBoard && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded">
              {courseBoard}
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold text-slate-800 leading-snug mb-2">{c.name}</h3>
        
        {hasPrice && (
            <p className="text-xs text-slate-500">
                Full Curriculum Access
            </p>
        )}
      </div>

      <div className="relative z-10 mt-auto">
        {isEligible ? (
          hasPrice ? (
            <button
              onClick={handleSelect}
              className={`w-full py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors active:scale-[0.98] ${isSubscribed
                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                  : isSelected
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                    : 'bg-[#002147] text-white hover:bg-indigo-900'
                }`}
            >
              {isSubscribed ? (
                <>Go to Classes <FiArrowRight className="w-4 h-4" /></>
              ) : isSelected ? (
                <>Remove <FiX className="w-4 h-4" /></>
              ) : (
                <>Buy Now <FiArrowRight className="w-4 h-4" /></>
              )}
            </button>
          ) : (
            <button disabled className="w-full bg-slate-50 text-slate-400 py-2.5 rounded-lg font-medium text-sm cursor-not-allowed border border-dashed border-slate-200">
              Coming Soon
            </button>
          )
        ) : (
          <div className="space-y-1.5 text-center">
            <button disabled className="w-full bg-slate-50 text-slate-400 py-2.5 rounded-lg font-medium text-sm cursor-not-allowed border border-dashed border-slate-200">
              Restricted
            </button>
            <p className="text-[10px] font-medium text-rose-500">Only for {userClass || 'designated'} grade</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const StoreCarousel = () => {
  const [current, setCurrent] = useState(0);
  const images = [courseItem1, courseItem2, courseItem3, courseItem4];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative w-full h-[140px] md:h-[240px] rounded-2xl flex items-center justify-center overflow-hidden bg-slate-50">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={images[current]}
          alt="Course Preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full object-contain"
        />
      </AnimatePresence>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
        {images.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-4 bg-orange-500' : 'w-1.5 bg-slate-300'}`} />
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

  const [selectedMobileClass, setSelectedMobileClass] = useState('6');
  const [selectedMobileBoard, setSelectedMobileBoard] = useState('TS Board');

  const getFormattedBoard = (slug) => {
    if (!slug) return null;
    const clean = slug.replace('-board', '').toUpperCase();
    if (clean === 'CBSE' || clean === 'ICSE') return clean;
    return slug.split('-').map(word => word === 'board' ? 'Board' : word.toUpperCase()).join(' ');
  };
  const activeBoardFilter = getFormattedBoard(boardName);

  const fetchCourses = async () => {
    try {
      const board = userInfo?.board || '';
      const { data } = await axios.get(`/student/catalog${board ? `?board=${board}` : ''}`);

      let baseCourses = data || [];
      if (baseCourses.length === 0) {
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

  useEffect(() => {
    if (userInfo?.role?.toLowerCase() === 'student' && userInfo.className) {
      const userClassNum = userInfo.className.replace(/\D/g, '');
      const level = parseInt(userClassNum);
      if (level === 11 || level === 12) setActiveInterYear(level);
      setSelectedMobileClass(userClassNum || '6');
      if (userInfo.board) setSelectedMobileBoard(userInfo.board);
    }
  }, [userInfo]);

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
      const configRes = await axios.get('/payment/config');
      const { enableRealPayment, keyId } = configRes.data;

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

      if (enableRealPayment && keyId) {
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
          order_id: order.id,
          handler: async function (response) {
            try {
              toast.success('Payment Received! Verifying Access...');
              const verifyRes = await axios.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (verifyRes.data.status === 'ok') {
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
              toast.error('Verification failed.');
              setBuyLoading(false);
            }
          },
          prefill: { name: userInfo?.name || '', email: userInfo?.email || '' },
          theme: { color: '#002147' },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
        rzp.on('payment.failed', (err) => {
          toast.error('Payment failed: ' + err.error.description);
          setBuyLoading(false);
        });
      } else {
        toast.success(`Processing Mock Payment for ${selectedItems.length} items...`);
        try {
            await axios.post('/student/mock-payment-success', { items: itemsPayload });
        } catch (e) {}

        const addedSubs = itemsPayload.map(payload => ({
          name: payload.courseName || payload.packageName.split(' - ')[0],
          type: payload.type,
          subscriptionType: payload.subscriptionType,
          expiryDate: new Date(Date.now() + 30 * 86400000).toISOString(),
          referenceId: payload.referenceId,
          purchaseDate: new Date().toISOString()
        }));

        dispatch(setCredentials({
          ...userInfo,
          activeSubscriptions: [...(userInfo.activeSubscriptions || []), ...addedSubs]
        }));

        setTimeout(() => {
          setBuyLoading(false);
          setShowCheckout(false);
          setSelectedItems([]);
          navigate('/student/dashboard');
        }, 1500);
      }
    } catch (error) {
      toast.error('Payment processing failed');
      setBuyLoading(false);
    }
  };

  const filteredCourses = (courses || []).filter(c =>
    (c.className?.toLowerCase() || c.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const isStudentFiltered = userInfo?.role?.toLowerCase() === 'student' && (userInfo?.className || userInfo?.board);

  const finalFiltered = (isStudentFiltered ? filteredCourses.filter(c => {
    const courseClass = String(c.classLevel || c.className || '').replace(/\D/g, '') || '';
    const userClass = userInfo?.className?.replace(/\D/g, '') || '';
    const courseBoard = c.board?.toUpperCase().trim() || '';
    const userBoard = userInfo?.board?.toUpperCase().trim() || '';
    return userClass === courseClass && (!courseBoard || !userBoard || courseBoard === userBoard);
  }) : filteredCourses).filter(c => {
    if (!activeBoardFilter) return true;
    return (c.board?.toUpperCase().trim() || '') === activeBoardFilter.toUpperCase().trim();
  });

  const juniorCourses = finalFiltered.filter(c => Number(c.classLevel) >= 1 && Number(c.classLevel) <= 10);
  const interFirstYear = finalFiltered.filter(c => Number(c.classLevel) === 11);
  const interSecondYear = finalFiltered.filter(c => Number(c.classLevel) === 12);

  const renderBoardGroups = (courseList) => {
    let boards = ['TS Board', 'AP Board', 'CBSE Board', 'ICSE Board'];
    if (activeBoardFilter) {
      boards = boards.filter(b => b.toUpperCase().includes(activeBoardFilter.toUpperCase().trim()));
    }

    return boards.map(b => {
      const baseBoard = b.replace(' Board', '');
      const boardCourses = courseList.filter(c => {
        const cBoard = (c.board || 'TS Board').toUpperCase().trim();
        return cBoard === b.toUpperCase().trim() || cBoard === baseBoard.toUpperCase().trim();
      });
      if (boardCourses.length === 0) return null;

      return (
        <div key={b} className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">{b}</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {boardCourses.map(c => (
              <CourseCard key={c.id} c={c} selectedItems={selectedItems} setSelectedItems={setSelectedItems} userInfo={userInfo} setPendingSubject={setPendingSubject} />
            ))}
          </div>
        </div>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <Toaster position="top-right" />

      {/* Top Search Strip */}
      <div className="bg-white border-b border-slate-200 py-3 md:py-4 px-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto flex h-10 md:h-12">
          <div className="flex-1 relative flex items-center bg-slate-100 rounded-l-lg overflow-hidden border border-slate-200 border-r-0">
            <FiSearch className="text-slate-400 w-4 h-4 ml-3 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search class or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 px-3 text-sm font-medium text-slate-800 outline-none bg-transparent"
            />
          </div>
          <button className="bg-orange-500 text-white px-6 font-semibold text-sm rounded-r-lg hover:bg-orange-600 transition-colors">
            Search
          </button>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-8 pb-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row overflow-hidden">
          <div className="w-full md:w-3/5 p-6 md:p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              {activeBoardFilter ? `${activeBoardFilter} ` : 'Mye3 Academy '}
              <span className="text-orange-500">Courses</span>
            </h1>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed">
              Explore our comprehensive online courses tailored for your academic success.
            </p>
            <div className="hidden md:flex flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-semibold"><FiCheckCircle /> All Subjects</div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold"><FiCheckCircle /> Live Classes</div>
            </div>
          </div>
          <div className="w-full md:w-2/5 bg-slate-50 p-4 flex items-center justify-center">
            <StoreCarousel />
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-8 space-y-8">
        
        {/* Desktop View */}
        <div className="hidden md:block space-y-10">
          {juniorCourses.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-800">School Tuitions (Class 6 - 10)</h2>
              {renderBoardGroups(juniorCourses)}
            </div>
          )}

          {(interFirstYear.length > 0 || interSecondYear.length > 0) && (
            <div className="space-y-6 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-slate-800">Intermediate</h2>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  <button onClick={() => setActiveInterYear(11)} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeInterYear === 11 ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>1st Year</button>
                  <button onClick={() => setActiveInterYear(12)} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeInterYear === 12 ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>2nd Year</button>
                </div>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={activeInterYear} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                  {activeInterYear === 11 ? renderBoardGroups(interFirstYear) : renderBoardGroups(interSecondYear)}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500">Board</p>
              <div className="flex flex-wrap gap-2">
                {['TS Board', 'AP Board', 'CBSE Board', 'ICSE Board'].map(b => (
                  <button key={b} onClick={() => setSelectedMobileBoard(b)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${selectedMobileBoard === b ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}>{b.replace(' Board', '')}</button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-500">Class</p>
              <div className="flex flex-wrap gap-2">
                {['6', '7', '8', '9', '10', '11', '12'].map(cls => (
                  <button key={cls} onClick={() => setSelectedMobileClass(cls)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${selectedMobileClass === cls ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}>{cls}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {finalFiltered.filter(c => {
              const cClass = String(c.classLevel || c.className || '').replace(/\D/g, '');
              const cBoard = (c.board || 'TS Board').toUpperCase().trim();
              const fBoard = selectedMobileBoard.toUpperCase().trim();
              return cClass === selectedMobileClass && (cBoard === fBoard || cBoard === fBoard.replace(' BOARD', ''));
            }).map(c => (
              <CourseCard key={c.id} c={c} selectedItems={selectedItems} setSelectedItems={setSelectedItems} userInfo={userInfo} setPendingSubject={setPendingSubject} />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Cart */}
      <AnimatePresence>
        {selectedItems.length > 0 && !showCheckout && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-0 left-0 w-full z-40 p-4 pointer-events-none">
            <div className="max-w-4xl mx-auto bg-slate-900 rounded-xl shadow-2xl p-4 flex items-center justify-between pointer-events-auto border border-slate-800">
              <div className="flex items-center gap-4 text-white">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-lg">
                  {selectedItems.length}
                </div>
                <div>
                  <p className="text-xs text-slate-400">Items Selected</p>
                  <p className="font-semibold text-sm">Ready to Checkout</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedItems([])} className="p-2 text-slate-400 hover:text-white transition-colors">
                  <FiX className="w-5 h-5" />
                </button>
                <button onClick={() => setShowCheckout(true)} className="px-5 py-2.5 bg-orange-500 text-white rounded-lg font-semibold text-sm hover:bg-orange-600 transition-colors flex items-center gap-2">
                  Proceed <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[85vh]">
              <div className="w-full md:w-1/2 bg-slate-50 p-6 md:p-8 overflow-y-auto border-r border-slate-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Your Cart</h2>
                  <button onClick={() => setShowCheckout(false)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-md md:hidden"><FiX className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  {selectedItems.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.board || 'Curriculum'}</p>
                        </div>
                        <button onClick={() => setSelectedItems(prev => prev.filter(i => i.id !== item.id))} className="text-slate-400 hover:text-rose-500"><FiX className="w-4 h-4" /></button>
                      </div>
                      <div className="flex gap-2">
                        {['oneMonth', 'threeMonths', 'sixMonths', 'twelveMonths'].map(dur => (
                          <button key={dur} onClick={() => {
                              const updated = [...selectedItems];
                              updated[idx] = { ...item, selectedDuration: dur };
                              setSelectedItems(updated);
                            }} className={`flex-1 py-1.5 rounded-md text-[10px] font-semibold transition-colors border ${item.selectedDuration === dur || (!item.selectedDuration && dur === 'oneMonth') ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-100'}`}>
                            {dur.replace('Months', 'M').replace('oneMonth', '1M')}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
                <button onClick={() => setShowCheckout(false)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:bg-slate-100 rounded-md hidden md:block"><FiX className="w-5 h-5" /></button>
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">Total Payment</p>
                  <h3 className="text-3xl font-bold text-slate-800 mb-6">
                    ₹{selectedItems.reduce((acc, item) => {
                      const basePrice = item.pricing?.oneMonth || item.price || 500;
                      const dur = item.selectedDuration || 'oneMonth';
                      const dm = { oneMonth: 1, threeMonths: 0.95 * 3, sixMonths: 0.90 * 6, twelveMonths: 0.85 * 12 };
                      return acc + (item.pricing?.[dur] || Math.round(basePrice * (dm[dur] || 1)));
                    }, 0).toLocaleString()}
                  </h3>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3 mb-6">
                    <FiShield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-800">Secure payment gateway. Immediate access upon successful transaction.</p>
                  </div>
                </div>
                <button onClick={handlePayment} disabled={buyLoading} className="w-full py-3.5 bg-slate-900 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors disabled:opacity-50">
                  {buyLoading ? 'Processing...' : <>Pay Now <FiArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Duration Prompt for Mobile additions */}
      <AnimatePresence>
        {pendingSubject && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-1">Select Duration</h3>
              <p className="text-sm text-slate-500 mb-4">{pendingSubject.name}</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { id: 'oneMonth', label: '1 Month' },
                  { id: 'threeMonths', label: '3 Months' },
                  { id: 'sixMonths', label: '6 Months' },
                  { id: 'twelveMonths', label: '12 Months' }
                ].map(dur => (
                  <button key={dur.id} onClick={() => setPromptDuration(dur.id)} className={`p-3 rounded-lg border text-sm font-semibold transition-colors ${promptDuration === dur.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-700 hover:border-slate-300'}`}>
                    {dur.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPendingSubject(null)} className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={() => {
                  setSelectedItems(prev => [...prev, { ...pendingSubject, selectedDuration: promptDuration }]);
                  setPendingSubject(null);
                  toast.success('Added to cart');
                }} className="flex-1 py-2.5 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors">Add to Cart</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentStore;
