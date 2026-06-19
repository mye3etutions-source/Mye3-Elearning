import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import logoImg from '../../assets/output-onlinepngtools.png';
import contactSvg from '../../assets/contact-with-us.svg';
import { logout } from '../../store/slices/authSlice';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  HiMenuAlt3,
  HiOutlineUserCircle,
  HiChevronDown,
  HiOutlinePhone,
  HiOutlineMail,
  HiX,
  HiOutlineHome,
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineChat
} from 'react-icons/hi';
import { FaWhatsapp, FaHandshake } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

// Dropdown data placeholder - actual items are generated dynamically inside Navbar
const DEFAULT_NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { 
    label: 'Tuitions', 
    to: '#', 
    dropdown: [
      { label: 'All', to: '/courses' },
      { label: 'AP BOARD', to: '/courses/board/ap-board' },
      { label: 'TS BOARD', to: '/courses/board/ts-board' },
      { label: 'CBSE BOARD', to: '/courses/board/cbse-board' },
      { label: 'ICSE BOARD', to: '/courses/board/icse-board' },
    ]
  },
  { label: 'Teachers', to: '/teachers' },
  { label: 'About Us', to: '/about' },
  { label: 'FAQs', to: '/faqs' },
  { label: 'Contact Us', to: '/contact-us' },
];

// Single dropdown component
const NavDropdown = ({ item }) => {

  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!item.dropdown) {
    return (
      <Link
        to={item.to}
        className="relative font-medium text-[14px] text-[#223654] hover:text-orange-600 transition-colors whitespace-nowrap"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 font-medium text-[14px] text-[#223654] hover:text-orange-600 transition-colors whitespace-nowrap relative"
      >
        {item.label}
        {item.isNew && (
          <span className="absolute -top-[14px] right-1 text-[11px] font-medium text-[#f36b21] leading-none">
            New
          </span>
        )}
        <HiChevronDown
          className={`w-[13px] h-[13px] text-[#223654] transition-transform duration-200 mt-0.5 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute top-full left-0 pt-2 w-52 z-[200]">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-100 py-2 animate-fadeIn">
            {item.dropdown.map((sub, i) => (
              <Link
                key={i}
                to={sub.to}
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-[12px] font-medium text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                {sub.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
// ── Floating Connect With Us Button + Side Panel ──
const ConnectButton = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', role: 'Student' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/inquiries', {
        name: form.name,
        mobile: form.mobile,
        role: form.role,
        source: 'Connect Panel'
      });
      toast.success(`Thanks ${form.name}! We'll connect with you soon.`);
      setOpen(false);
      setForm({ name: '', mobile: '', role: 'Student' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      {/* Floating Tab Button — orange pill, right edge, center */}
      <button
        onClick={() => setOpen(true)}
        title="Connect With Us"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[998] flex items-center group"
        style={{
          background: 'linear-gradient(135deg,#f97316,#ea580c)',
          borderRadius: '12px 0 0 12px',
          boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
          height: '46px',
          overflow: 'hidden',
        }}
      >
        {/* Text — slides in on hover */}
        <span
          className="text-[12px] font-semibold text-white whitespace-nowrap overflow-hidden"
          style={{
            maxWidth: '0',
            paddingLeft: '0',
            transition: 'max-width 0.35s ease, padding 0.35s ease',
          }}
          ref={el => {
            if (!el) return;
            const btn = el.closest('button');
            btn.addEventListener('mouseenter', () => {
              el.style.maxWidth = '130px';
              el.style.paddingLeft = '14px';
            });
            btn.addEventListener('mouseleave', () => {
              el.style.maxWidth = '0';
              el.style.paddingLeft = '0';
            });
          }}
        >
          Connect With Us
        </span>
        {/* Icon */}
        <div className="w-11 h-full flex items-center justify-center shrink-0">
          <FaHandshake className="text-white text-[20px]" />
        </div>
      </button>

      {/* Side Panel Overlay */}
      {open && (
        <div className="fixed inset-0 z-[1100] flex justify-end">
          {/* Dark backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel — full height, scrollable on small screens */}
          <div
            className="relative w-[280px] max-w-[80vw] bg-white h-screen shadow-2xl flex flex-col overflow-y-auto"
            style={{ animation: 'slideInRight 0.3s ease-out' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <h2 className="text-[17px] font-black text-slate-800">Connect With Us</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-500 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Form — compact, no scroll needed */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-4 shrink-0">
              {/* Name */}
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="text"
                  placeholder="Enter your Name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-700 outline-none focus:border-orange-400 transition-colors"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-[12px] font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select className="border border-slate-200 rounded-lg px-2 py-2.5 text-[12px] text-slate-600 outline-none focus:border-orange-400 bg-white">
                    <option>IN +91</option>
                    <option>US +1</option>
                    <option>UK +44</option>
                    <option>AE +971</option>
                  </select>
                  <input
                    required
                    type="tel"
                    placeholder="Enter Mobile Number"
                    value={form.mobile}
                    onChange={e => setForm({ ...form, mobile: e.target.value })}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-700 outline-none focus:border-orange-400 transition-colors"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-6">
                {['Parents', 'Student'].map(r => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={form.role === r}
                      onChange={() => setForm({ ...form, role: r })}
                      className="accent-orange-500 w-4 h-4"
                    />
                    <span className="text-[13px] font-medium text-slate-700">{r}</span>
                  </label>
                ))}
              </div>

              {/* Connect Button */}
              <button
                type="submit"
                className="w-full py-2.5 text-white font-black text-[14px] rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
              >
                Connect
              </button>
            </form>

            {/* Illustration — hidden on very small screens */}
            <div className="hidden sm:flex flex-1 flex-col items-center justify-end px-4 pb-4 overflow-hidden">
              <img
                src={contactSvg}
                alt="Connect With Us"
                className="w-full object-contain"
                style={{ maxHeight: '260px' }}
              />
              <div className="flex items-center gap-2 text-orange-500 text-[12px] font-bold mt-1">
                <span>📞</span> +91 90631 47069, 90631 67069
              </div>
            </div>
            {/* Phone number visible on mobile instead of illustration */}
            <div className="sm:hidden flex items-center justify-center gap-2 text-orange-500 text-[13px] font-bold py-4">
              <span>📞</span> +91 90631 47069, 90631 67069
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
};

// ── Mobile Bottom Navigation Bar ──
const MobileBottomNav = () => {
  const items = [
    { label: 'Home', to: '/', icon: HiOutlineHome },
    { label: 'Tuitions', to: '/courses', icon: HiOutlineAcademicCap },
    { label: 'Teachers', to: '/teachers', icon: HiOutlineUserGroup },
    { label: 'Contact', to: '/contact-us', icon: HiOutlineChat },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-[1000] px-2 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around">
        {items.map((item, i) => (
          <Link
            key={i}
            to={item.to}
            className="flex flex-col items-center gap-1 min-w-[64px] transition-all active:scale-90 group"
          >
            <item.icon className="text-[22px] text-slate-400 group-hover:text-orange-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter group-hover:text-orange-500 transition-colors">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [isMobileDrag, setIsMobileDrag] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showMobileBanner, setShowMobileBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode (already installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Only show banner if user hasn't already dismissed it in this session
      const isDismissed = sessionStorage.getItem('pwa-prompt-dismissed') === 'true';
      if (!isDismissed) {
        setShowMobileBanner(true);
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowMobileBanner(false);
      setIsInstalled(true);
      toast.success('Mye3 App installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowMobileBanner(false);
    }
  };

  const handleCancelClick = () => {
    setShowMobileBanner(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Helper to generate slug for board routes (e.g., 'TS Board' -> 'ts-board')
  const getBoardSlug = (boardName) => {
    if (!boardName) return 'all';
    let clean = boardName.toLowerCase().replace(' board', '').trim();
    return `${clean}-board`;
  };

  const isStudent = userInfo?.role?.toLowerCase() === 'student';

  const NAV_ITEMS = [
    { label: 'Home', to: '/' },
    { 
      label: 'Tuitions', 
      to: '#', 
      dropdown: isStudent && userInfo?.board ? [
        { label: `${userInfo.board} - ${userInfo.className}`, to: '/courses' },
      ] : [
        { label: 'All', to: '/courses' },
        { label: 'AP BOARD', to: '/courses/board/ap-board' },
        { label: 'TS BOARD', to: '/courses/board/ts-board' },
        { label: 'CBSE BOARD', to: '/courses/board/cbse-board' },
        { label: 'ICSE BOARD', to: '/courses/board/icse-board' },
      ]
    },
    { label: 'Teachers', to: '/teachers' },
    { label: 'About Us', to: '/about' },
    { label: 'FAQs', to: '/faqs' },
    { label: 'Contact Us', to: '/contact-us' },
  ];

  useEffect(() => {
    const checkMobile = () => setIsMobileDrag(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {/* ── TOP UTILITY BAR (Mobile & Desktop) ── */}
      <div className="bg-orange-50/40 md:bg-white border-b border-orange-50/50 block">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-1 flex items-center justify-between">
          
          {/* Left: contact info */}
          <div className="flex items-center gap-2 md:gap-6 text-[12px] font-medium text-slate-600">
            <a href="tel:+919063147069" className="flex items-center gap-0 hover:text-orange-600 transition-colors">
              <img src="https://img.icons8.com/color/48/teacher.png" alt="headset" className="w-[30px] h-[30px] md:hidden object-contain mr-1" />
              <span className="hidden md:flex w-7 h-7 rounded-full bg-orange-100 items-center justify-center mr-2">
                <HiOutlinePhone className="text-orange-600 text-[15px] md:text-sm" />
              </span>
              <span className="hidden md:inline">Talk with us{' '}<span className="font-bold text-slate-900">+91 90631 47069, 90631 67069</span></span>
            </a>
            <a href="mailto:admin@mye3etuitions.com" className="flex items-center gap-0 hover:text-orange-600 transition-colors">
              <img src="https://img.icons8.com/color/48/gmail-new.png" alt="email" className="w-[28px] h-[28px] md:hidden object-contain mr-1" />
              <span className="hidden md:flex w-7 h-7 rounded-full bg-red-100 items-center justify-center mr-2">
                <MdEmail className="text-red-500 text-[15px] md:text-sm" />
              </span>
              <span className="hidden md:inline">Mail Us{' '}<span className="font-bold text-slate-900">admin@mye3etuitions.com</span></span>
            </a>
          </div>

          {/* Right: book demo / login */}
          <div className="flex items-center text-[12px] font-medium text-slate-500 md:text-slate-600 text-right">
            {deferredPrompt && (
              <>
                <button
                  onClick={handleInstallClick}
                  className="text-orange-600 hover:text-orange-700 font-bold transition-colors flex items-center gap-1 mr-2 px-1 py-0.5 rounded hover:bg-orange-50"
                >
                  📥 Install App
                </button>
                <span className="text-slate-300 mr-2">|</span>
              </>
            )}
            <Link 
              to={userInfo ? (userInfo?.role?.toLowerCase() === 'teacher' ? '/teacher/dashboard' : '/student/dashboard') : '/register'} 
              className="hover:text-orange-600 transition-colors flex flex-col items-center md:flex-row leading-[1.2] md:leading-normal mr-2"
            >
              <span className="whitespace-nowrap">Book a Free Demo</span>
              <span className="md:ml-1">class</span>
            </Link>
            <span className="text-slate-300 md:font-normal font-light">|</span>
            {userInfo ? (
              <button onClick={handleLogout} className="hover:text-red-500 transition-colors shrink-0 ml-2">
                Logout
              </button>
            ) : (
              <Link to="/login" className="hover:text-orange-600 transition-colors shrink-0 ml-2">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── MAIN NAVBAR ── */}
      <nav className="bg-white/95 md:bg-orange-50/40 backdrop-blur-md border-b border-orange-100 sticky top-0 md:relative z-[1000]" style={{ boxShadow: '0 2px 12px rgba(249,115,22,0.05)' }}>
        <div className="max-w-[1280px] mx-auto px-4 md:px-6 h-[60px] md:h-[65px] flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <img
              src={logoImg}
              alt="e-Tuitions Logo"
              className="h-[85px] md:h-24 w-auto object-contain scale-110 md:scale-[1.2] origin-left group-hover:scale-[1.15] md:group-hover:scale-[1.25] transition-transform"
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden xl:flex items-center gap-8 2xl:gap-10 flex-1 justify-center">
            {NAV_ITEMS.map((item, i) => (
              <NavDropdown key={i} item={item} />
            ))}
          </div>

          {/* Right CTA */}
          <div className="flex items-center gap-3 shrink-0">
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="hidden md:flex items-center px-4 py-2 border-[1.5px] border-[#f36b21] text-[#f36b21] hover:bg-[#f36b21] hover:text-white text-[13px] font-black uppercase tracking-wider rounded-lg active:scale-95 transition-all"
              >
                Install App
              </button>
            )}
            {userInfo ? (
              <Link
                to={
                  userInfo?.role?.toLowerCase() === 'admin'
                    ? '/admin/dashboard'
                    : userInfo?.role?.toLowerCase() === 'teacher'
                    ? '/teacher/dashboard'
                    : '/student/dashboard'
                }
                className="flex items-center gap-2 px-4 py-1.5 bg-[#002147] text-white rounded-full hover:bg-orange-600 transition-all shadow-md group border border-[#002147]/10"
              >
                <div className="flex flex-col items-end mr-1 hidden sm:flex">
                  <span className="text-[9px] font-black uppercase tracking-widest text-orange-400 opacity-80 leading-none mb-0.5">Welcome</span>
                  <span className="text-[11px] font-bold leading-none">{userInfo.name?.split(' ')[0]}</span>
                </div>
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <HiOutlineUserCircle className="text-xl" />
                </div>
              </Link>
            ) : (
              <Link
                to="/register"
                className="hidden md:flex items-center px-5 py-2.5 text-white text-[13px] font-bold rounded-lg shadow-md hover:opacity-90 active:scale-95 transition-all"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 14px rgba(249,115,22,0.4)' }}
              >
                Enrol Now
              </Link>
            )}

            {/* Mobile-only Join Now button */}
            {!userInfo && (
              <Link
                to="/register"
                className="md:hidden flex items-center px-4 py-1.5 text-white text-[12px] font-black uppercase tracking-wider rounded-lg shadow-md active:scale-95 transition-all bg-gradient-to-br from-orange-500 to-orange-600 hover:from-[#002147] hover:to-[#001a35] hover:shadow-lg"
              >
                Join Now
              </Link>
            )}

            {/* Hamburger - Styled to look like e-tuitions.com */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="xl:hidden w-[42px] h-[34px] bg-white text-[#f36b21] rounded-sm border-[1.5px] border-[#f36b21] flex items-center justify-center"
            >
              {mobileOpen ? <HiX className="text-[22px]" /> : <HiMenuAlt3 className="text-[22px]" />}
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        {mobileOpen && (
          <div className="xl:hidden bg-white border-t border-slate-100 max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-3 space-y-1">
              {/* Contact info */}
              <div className="flex flex-col gap-1 py-3 px-2 bg-slate-50 rounded-lg mb-3">
                <a href="tel:+919063147069" className="text-[12px] font-medium text-slate-600 flex items-center gap-2">
                  <HiOutlinePhone className="text-orange-500" /> +91 90631 47069, 90631 67069
                </a>
                <a href="mailto:admin@mye3etuitions.com" className="text-[12px] font-medium text-slate-600 flex items-center gap-2">
                  <HiOutlineMail className="text-orange-500" /> admin@mye3etuitions.com
                </a>
              </div>

              {NAV_ITEMS.map((item, i) =>
                item.dropdown ? (
                  <div key={i}>
                    <button
                      onClick={() =>
                        setMobileExpanded(mobileExpanded === i ? null : i)
                      }
                      className="w-full flex items-center justify-between py-3 px-2 text-[13px] font-semibold text-slate-700 hover:text-orange-600 border-b border-slate-50"
                    >
                      <span className="flex items-center gap-2">
                        {item.label}
                        {item.isNew && (
                          <span className="text-[9px] font-black bg-orange-500 text-white px-1 rounded-sm uppercase">New</span>
                        )}
                      </span>
                      <HiChevronDown className={`transition-transform ${mobileExpanded === i ? 'rotate-180' : ''}`} />
                    </button>
                    {mobileExpanded === i && (
                      <div className="pl-4 py-1 bg-slate-50 rounded-lg mb-1">
                        {item.dropdown.map((sub, j) => (
                          <Link
                            key={j}
                            to={sub.to}
                            onClick={() => setMobileOpen(false)}
                            className="block py-2 px-2 text-[12px] text-slate-600 hover:text-orange-600"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={i}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 px-2 text-[13px] font-semibold text-slate-700 hover:text-orange-600 border-b border-slate-50"
                  >
                    {item.label}
                  </Link>
                )
              )}

              {/* Mobile CTA */}
              <div className="pt-3 space-y-2">
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center py-3 text-white font-bold text-[13px] rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                >
                  Enrol Now
                </Link>
                <Link
                  to={userInfo ? (userInfo?.role?.toLowerCase() === 'teacher' ? '/teacher/dashboard' : '/student/dashboard') : '/register'}
                  onClick={() => setMobileOpen(false)}
                  className="block w-full text-center py-3 text-orange-600 font-bold text-[13px] rounded-lg border-2 border-orange-200 hover:bg-orange-50"
                >
                  Book Free Demo
                </Link>
                {userInfo ? (
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="block w-full text-center py-3 text-red-500 font-bold text-[13px] rounded-lg border border-red-100"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center py-3 text-slate-700 font-bold text-[13px] rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Floating Connect With Us Button */}
      <ConnectButton />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* PWA Mobile Slide-Up Install Drawer */}
      <AnimatePresence>
        {showMobileBanner && deferredPrompt && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="md:hidden fixed bottom-[68px] left-4 right-4 z-[999] bg-white rounded-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.12),0_4px_12px_rgba(0,0,0,0.08)] border border-slate-100 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              {/* App Icon */}
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 border border-orange-100 overflow-hidden shadow-inner">
                <img
                  src={logoImg}
                  alt="App Icon"
                  className="w-10 h-10 object-contain scale-110"
                />
              </div>
              {/* Text Info */}
              <div className="flex-1">
                <h4 className="text-[14px] font-extrabold text-slate-800 leading-tight">Install Mye3 App</h4>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">Get fast, secure 1-on-1 online classes & offline access.</p>
              </div>
              {/* Close Button */}
              <button 
                onClick={handleCancelClick}
                className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelClick}
                className="flex-1 py-2 text-center text-slate-500 font-bold text-[12px] rounded-xl hover:bg-slate-50 border border-slate-100 active:scale-95 transition-all"
              >
                Not Now
              </button>
              <button
                onClick={handleInstallClick}
                className="flex-1 py-2 text-center text-white font-extrabold text-[12px] rounded-xl active:scale-95 transition-all shadow-md"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                Install App
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.15s ease-out; }
      `}</style>
    </>
  );
};

export default Navbar;
