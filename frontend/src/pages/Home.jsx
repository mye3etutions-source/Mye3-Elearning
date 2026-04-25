import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiArrowRight,
  HiCheck,
  HiStar,
  HiUserGroup,
  HiAcademicCap,
  HiGlobeAlt,
  HiLightBulb,
  HiDeviceMobile,
  HiVideoCamera,
  HiLightningBolt,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Import local assets
import slider1 from '../assets/slider1.jpeg';
import slider2 from '../assets/slider2.jpeg';
import slider3 from '../assets/slider3.jpeg';
import mobileSlider1 from '../assets/mobile slider1.jpeg';
import mobileSlider2 from '../assets/mobile slider2.jpeg';
import mobileSlider3 from '../assets/mobile slider3.jpeg';
import aboutImg from '../assets/about-img-1.jpg';
import playBtn from '../assets/play-btn.gif';
import course1 from '../assets/course-item-1.webp';
import course2 from '../assets/course-item-2.webp';
import course3 from '../assets/course-item-3.webp';
import course4 from '../assets/course-item-4.webp';
import discCourse1 from '../assets/disc-content-1.webp';
import discCourse2 from '../assets/disc-content-2.webp';
import discCourse3 from '../assets/disc-content-3.webp';
import discCourse4 from '../assets/ChatGPT Image Apr 8, 2026, 08_58_35 PM.png';
import teacherJoinImg from '../assets/ChatGPT Image Mar 30, 2026, 04_09_31 AM.png';
import successImg from '../assets/register img.png';

// Slide content data
const SLIDES = [
  {
    image: slider1,
    mobileImage: mobileSlider1,
    headline1: 'Personalized Learning,',
    headline2: 'Real Results',
    highlight: 'Only at e-Tuitions',
    bullets: [
      'School Tuitions (1-12)',
      'Best Indian Teachers',
      'Flexible Scheduling',
      'Global Language Classes',
      '1-to-1 Live Online Classes',
    ],
  },
  {
    image: slider2,
    mobileImage: mobileSlider2,
    headline1: 'Expert Teachers,',
    headline2: 'Affordable Classes',
    highlight: 'Starting ₹200/- Only',
    bullets: [
      'CBSE / ICSE / State Board',
      'IIT JEE & NEET Coaching',
      'Coding & Tech Courses',
      'Language Classes',
      'Free Demo Available',
    ],
  },
  {
    image: slider3,
    mobileImage: mobileSlider3,
    headline1: 'Learn From',
    headline2: 'Anywhere, Anytime',
    highlight: 'With e-Tuitions',
    bullets: [
      'Live & Recorded Sessions',
      'Certified Teachers',
      'Personal Mentor Assigned',
      'Flexible Scheduling',
      '100% Student Satisfaction',
    ],
  },
];

const POPULAR_COURSES = [
  { title: 'TS\nBOARD', href: '/courses/board/ts-board', color: '#fbe08e', border: '#fbbf24', shadow: '#f59e0b', img: course1 },
  { title: 'AP\nBOARD', href: '/courses/board/ap-board', color: '#fca876', border: '#fb923c', shadow: '#f97316', img: course2 },
  { title: 'CBSE\nBOARD', href: '/courses/board/cbse-board', color: '#b0f1cc', border: '#4ade80', shadow: '#22c55e', img: course3 },
  { title: 'ICSE\nBOARD', href: '/courses/board/icse-board', color: '#bae0fe', border: '#93c5fd', shadow: '#3b82f6', img: course4 },
];

const DISCOVER_COURSES = [
  {
    topTitle: 'Basic to advance',
    title: 'AP BOARD',
    desc: 'Learn from expert native teachers to master your AP board curriculum.',
    bgColor: '#fdf3c7',     
    btnColor: '#fab500',    
    img: discCourse1,
    href: '/courses/board/ap-board',
  },
  {
    topTitle: 'Mains to Advance',
    title: 'TS BOARD',
    desc: 'Comprehensive learning for TS board students from home at affordable prices.',
    bgColor: '#ffebd9',     
    btnColor: '#f97316',    
    img: discCourse2,
    href: '/courses/board/ts-board',
  },
  {
    topTitle: 'Basic to advance',
    title: 'CBSE',
    desc: 'Find the best tutors for comprehensive CBSE curriculum at affordable prices.',
    bgColor: '#d4fae4',     
    btnColor: '#22c55e',    
    img: discCourse3,
    href: '/courses/board/cbse-board',
  },
  {
    topTitle: 'Basic to advance',
    title: 'ICSE',
    desc: 'Get online Interactive classes for ICSE specific subjects with the best trainers.',
    bgColor: '#e8eeff',     
    btnColor: '#3b82f6',    
    img: discCourse4,
    href: '/courses/board/icse-board',
  }
];

const Home = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((p) => (p === SLIDES.length - 1 ? 0 : p + 1));
  const prevSlide = () => setCurrentSlide((p) => (p === 0 ? SLIDES.length - 1 : p - 1));

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white" style={{ overflowX: 'hidden' }}>

      {/* ════════════════════════════════════════════
          HERO SECTION — Clean Slider (images have text built-in)
      ════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden bg-[#00158a]">

        {/* Slide Image — dynamically serves mobile/desktop optimized images */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full flex"
          >
            <picture className="w-full">
              <source media="(max-width: 767px)" srcSet={SLIDES[currentSlide].mobileImage} />
              <img
                src={SLIDES[currentSlide].image}
                alt={`Slide ${currentSlide + 1}`}
                className="w-full h-auto block"
              />
            </picture>
          </motion.div>
        </AnimatePresence>

        {/* Prev Arrow */}
        <button
          onClick={prevSlide}
          className="absolute left-1 md:left-6 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 md:rounded-full md:border-2 md:border-white/40 flex items-center justify-center text-white/70 md:text-white md:bg-black/30 hover:text-white md:hover:border-white transition-colors"
        >
          <HiChevronLeft className="text-[32px] md:text-2xl" />
        </button>

        {/* Next Arrow */}
        <button
          onClick={nextSlide}
          className="absolute right-1 md:right-6 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 md:rounded-full md:border-2 md:border-white/40 flex items-center justify-center text-white/70 md:text-white md:bg-black/30 hover:text-white md:hover:border-white transition-colors"
        >
          <HiChevronRight className="text-[32px] md:text-2xl" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden md:flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className="rounded-full transition-all"
              style={{
                width: i === currentSlide ? 24 : 8,
                height: 8,
                background: i === currentSlide ? '#f97316' : 'rgba(255,255,255,0.5)',
              }}
            />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          POPULAR COURSES
      ════════════════════════════════════════════ */}
      <section className="relative z-20 pb-12 bg-slate-50 md:bg-transparent pt-8 md:pt-0 md:-mt-16">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8">
          <div
            className="bg-white rounded-2xl md:rounded-3xl pt-5 pb-6 px-4 md:px-10 md:py-8 border border-slate-200/60 md:border-none shadow-sm md:shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
          >
            {/* Pill heading */}
            <div className="mb-6 text-center md:text-left">
              <span
                className="inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-[14px] text-white bg-[#fab500]"
              >
                Offered Tuitions
              </span>
            </div>

            {/* Course cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {POPULAR_COURSES.map((course, i) => (
                <Link
                  key={i}
                  to={course.href || "/courses"}
                  className="group relative rounded-2xl overflow-hidden flex flex-col"
                  style={{
                    background: course.color,
                    border: '3px solid transparent',
                    minHeight: 150,
                    transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.borderColor = course.border;
                    e.currentTarget.style.boxShadow = `0 10px 30px rgba(0,0,0,0.1)`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Title top-left or centered vertically on mobile */}
                  <div className="px-5 py-0 h-full flex items-center md:items-start md:p-3 z-10 relative">
                    <h3 className="font-bold text-[14px] md:text-[13px] text-slate-700 leading-snug whitespace-pre-line" style={{ maxWidth: '40%' }}>
                      {course.title}
                    </h3>
                  </div>

                  {/* Student image — bottom right */}
                  <div className="absolute bottom-0 right-3 w-[45%] h-full flex items-end justify-end">
                    <img
                      src={course.img}
                      alt={course.title}
                      className="max-h-[115%] w-auto object-contain object-bottom group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          ABOUT / INTRO SECTION
      ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white relative" style={{ overflow: 'visible' }}>

        {/* ── Large green RING — right edge only arc visible, behind text column ── */}
        <div className="absolute pointer-events-none hidden md:block" style={{
          top: '12%', right: '-140px',
          width: '280px', height: '280px',
          borderRadius: '50%',
          border: '32px solid #22c55e',
          background: 'transparent',
          zIndex: 0,
        }} />

        {/* ── Small green RING — bottom right, fully visible ── */}
        <div className="absolute pointer-events-none hidden md:block" style={{
          bottom: '5%', right: '15%',
          width: '75px', height: '75px',
          borderRadius: '50%',
          border: '5px solid #22c55e',
          background: 'transparent',
          zIndex: 0,
        }} />

        {/* ── Small green RING — bottom left, partially visible ── */}
        <div className="absolute pointer-events-none hidden md:block" style={{
          bottom: '0%', left: '-50px',
          width: '100px', height: '100px',
          borderRadius: '50%',
          border: '5px solid #22c55e',
          background: 'transparent',
          zIndex: 0,
        }} />

        {/* Content above rings */}
        <div className="relative max-w-[1100px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center" style={{ zIndex: 2 }}>

          {/* ── Left: Image Column ── */}
          <div className="relative ml-0 md:ml-10 hidden lg:block">

            {/* Teal dots — perfectly masked, behind image (Desktop) */}
            <div className="absolute pointer-events-none -z-10 hidden md:block" style={{
              top: '-30px',
              left: '-80px',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              backgroundImage: 'radial-gradient(circle, #2dd4bf 2.5px, transparent 3px)',
              backgroundSize: '16px 16px',
              backgroundPosition: 'center',
              opacity: 0.7
            }}></div>
            
            {/* Mobile Teal dots (Top Left circle) */}
            <div className="absolute pointer-events-none -z-10 md:hidden" style={{
              top: '-120px',
              left: '-40px',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              backgroundImage: 'radial-gradient(circle, #2dd4bf 2.5px, transparent 3px)',
              backgroundSize: '20px 20px',
              backgroundPosition: 'center',
              opacity: 0.9
            }}></div>

            {/* Main Image — Explicitly brought forward so dots definitely hide behind */}
            <div className="relative rounded-[16px] md:rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:shadow-2xl border-none md:border-solid md:border-8 md:border-white bg-white z-10 mx-auto w-full md:w-auto">
              <img src={aboutImg} alt="About e-Tuitions" className="w-full h-auto object-cover border-none" />
            </div>


            {/* Orange dots — perfectly masked, behind image (Desktop) */}
            <div className="absolute pointer-events-none -z-10 hidden md:block" style={{
              bottom: '-60px',
              right: '-60px',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              backgroundImage: 'radial-gradient(circle, #f97316 2.5px, transparent 3px)',
              backgroundSize: '16px 16px',
              backgroundPosition: 'center',
              opacity: 0.85
            }}></div>

            {/* Orange dots (Mobile) - Centered behind the 20K block */}
            <div className="absolute pointer-events-none -z-10 md:hidden bottom-[-40px] left-1/2 -translate-x-[45%]" style={{
              width: '260px',
              height: '160px',
              backgroundImage: 'radial-gradient(circle, #f97316 2px, transparent 3px)',
              backgroundSize: '24px 24px',
              backgroundPosition: 'center',
              opacity: 0.7
            }}></div>

            {/* Video Card */}
            <div className="relative md:absolute mt-8 md:mt-0 md:-top-8 md:-right-4 z-20 w-[95%] sm:w-[85%] mx-auto md:w-64 bg-white rounded-[20px] p-2 md:p-3 shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:shadow-2xl border border-slate-100">
              <div className="relative rounded-[16px] overflow-hidden aspect-[16/9] cursor-pointer">
                <img src="https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg" alt="Play" className="w-full h-full object-cover brightness-[0.4]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  
                  {/* Play Button - exact matching CSS double ring play button for mobile */}
                  <div className="w-[68px] h-[68px] md:hidden rounded-full flex items-center justify-center border-[1px] border-white/60 border-dashed p-[8px] shadow-2xl mb-1 mt-4">
                    <div className="w-full h-full bg-[#fa3d11] rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                  <img src={playBtn} alt="Play" className="w-12 h-12 hidden md:block" />

                  <span className="text-[19px] md:text-[10px] font-black text-white uppercase tracking-wide relative z-10 leading-none mt-1" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>1-on-1 Live Tuition</span>
                  <span className="text-[7.5px] font-bold text-white/80 uppercase tracking-widest md:hidden mt-[3px]" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>Anytime, Anywhere</span>
                </div>
              </div>
              
              {/* Skeleton lines under video specifically requested in mobile layout */}
              <div className="flex flex-col gap-[7px] mt-4 px-2 mb-2 md:hidden">
                <div className="w-full h-[6px] bg-slate-200/80 rounded-full"></div>
                <div className="w-[85%] h-[6px] bg-slate-200/80 rounded-full"></div>
                <div className="w-[50%] h-[6px] bg-slate-200/80 rounded-full"></div>
              </div>
            </div>

            {/* Learner count card */}
            <div className="relative md:absolute mt-6 md:mt-0 md:-bottom-6 md:-left-8 z-20 bg-white rounded-2xl w-[90%] md:w-auto mx-auto px-5 py-3 shadow-xl flex items-center gap-3 border border-slate-50">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-xl border border-emerald-100/50">
                <HiUserGroup />
              </div>
              <div>
                <p className="text-[20px] md:text-[22px] font-black text-slate-900 leading-none mb-0.5">20K+</p>
                <p className="text-[11px] md:text-[10px] font-semibold text-slate-400 capitalize md:uppercase tracking-[0.02em] md:tracking-wider leading-tight">Enrolled Learners</p>
              </div>
              
               {/* Small orange up-trend arrow present on mobile reference */}
              <div className="ml-auto mr-2 md:hidden w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-orange-500"></div>
            </div>
          </div>

          {/* ── Right: Text ── */}
          <div className="space-y-7">
            <div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">About Us</span>
              <h2 className="mt-2 text-3xl md:text-[36px] font-black text-slate-900 leading-[1.15] tracking-tight">
                India's best{' '}
                <span className="text-emerald-500 relative inline-block">
                  online tuition
                  <svg className="absolute -bottom-1 left-0 w-full h-[14px] text-emerald-500" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M5,15 Q50,0 95,15" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>{' '}
                <br />website for quality <br />education
              </h2>
            </div>
            <p className="text-slate-500 font-medium leading-relaxed max-w-lg mt-8">
              We are committed to providing personalised online classes that cater to the unique learning needs of each student. Learn from the best Indian teachers from the comfort of your home.
            </p>
            <div className="space-y-4">
              {['Expert Trainers', '1-on-1 Live Tuition', 'Flexible Timings'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <HiCheck className="text-emerald-500 text-2xl font-black shrink-0" />
                  <span className="font-bold text-slate-800 text-lg">{item}</span>
                </div>
              ))}
            </div>
            <Link
              to={userInfo ? (userInfo?.role?.toLowerCase() === 'teacher' ? '/teacher/dashboard' : '/student/dashboard') : '/register'}
              className="inline-flex items-center gap-2 px-7 py-3 text-white font-black text-[14px] rounded-xl hover:opacity-90 transition-all shadow-lg"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 4px 16px rgba(249,115,22,0.35)' }}
            >
              Book Free Demo <HiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════════ */}
      <section className="bg-slate-50 py-12 relative overflow-hidden">
        {/* Mobile green left ring */}
        <div className="absolute left-[-30px] top-[40px] w-[90px] h-[90px] rounded-full border-[4px] border-[#22c55e] md:hidden pointer-events-none z-0"></div>
        <div className="max-w-[1100px] mx-auto px-4 md:px-12 lg:px-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
            {[
              { value: '5496+', label: 'HAPPY PARENTS/STUDENTS', color: '#f97316' },
              { value: '500+',  label: 'CLASSES COMPLETED',       color: '#002147' },
              { value: '100%',   label: 'SATISFACTION RATE',      color: '#10b981' },
              { value: '200+',   label: 'CERTIFIED TUTORS',       color: '#3b82f6' },
            ].map((stat, i) => (
              <div key={i} 
                className="flex flex-col items-center justify-center py-2 md:py-7 gap-0.5 border-2 text-center bg-white rounded-xl md:rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] px-0.5 transition-transform hover:scale-105"
                style={{ borderColor: i % 2 === 0 ? '#f97316' : '#002147' }}
              >
                <span className="text-lg md:text-[34px] font-black leading-none" style={{ color: stat.color }}>
                  {stat.value}
                </span>
                <span className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5 scale-[0.85] md:scale-100">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          COURSE CATEGORIES
      ════════════════════════════════════════════ */}
      <section className="py-8 md:py-14 bg-white">
        <div className="max-w-[1024px] mx-auto px-4 md:px-6">
          <div className="mb-8 md:mb-10 text-center">
            <h2 className="text-[28px] md:text-[34px] font-bold text-slate-700 tracking-tight">
              Discover Available <span style={{ color: '#f97316' }}>Courses</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            {DISCOVER_COURSES.map((course, i) => (
              <div
                key={i}
                className="rounded-[20px] overflow-hidden flex flex-row items-center justify-between p-4 md:px-7 md:py-6 relative h-[140px] md:h-auto"
                style={{ background: course.bgColor }}
              >
                {/* Decorative absolute elements on the CARD level */}
                {/* Top middle floating outline circle */}
                <div className="absolute top-2 left-[45%] w-8 h-8 md:w-12 md:h-12 rounded-full border-2 md:border-[3px]" style={{ borderColor: course.btnColor, opacity: 0.3 }}></div>
                
                {/* Bottom right thick quarter circle */}
                <div className="absolute -bottom-2 -right-2 w-16 h-16 md:w-24 md:h-24 rounded-tl-[80px] border-t-[12px] border-l-[12px]" style={{ borderColor: course.btnColor, opacity: 0.3 }}></div>

                {/* Left side text container */}
                <div className="relative z-10 w-[60%] sm:w-[55%] space-y-1 md:space-y-2.5">
                  <p className="font-bold text-[10px] md:text-[13px] tracking-wide" style={{ color: course.btnColor }}>{course.topTitle}</p>
                  <h3 className="text-[17px] md:text-[28px] font-black text-slate-800 leading-[1.1] truncate md:whitespace-pre-line">{course.title}</h3>
                  <p className="text-slate-600 text-[10px] md:text-[13px] leading-snug line-clamp-2 md:line-clamp-none opacity-90">{course.desc}</p>
                  <Link 
                    to={userInfo ? (course.href || "/courses") : "/register"}
                    className="inline-block w-fit px-4 py-1.5 md:px-7 md:py-2.5 rounded-xl text-white font-black text-[10px] md:text-[14px] shadow-lg shadow-orange-200 transition-all hover:-translate-y-1 hover:shadow-xl active:scale-95 mt-2 uppercase tracking-wider" 
                    style={{ background: course.btnColor }}
                  >
                    Enroll Now
                  </Link>
                </div>
                
                {/* Right side image & decor */}
                <div className="relative z-10 w-[40%] sm:w-[45%] flex justify-end items-center h-full">
                  {/* White background circle with thick colored border */}
                  <div 
                    className={`relative w-[80px] h-[80px] md:w-[135px] md:h-[135px] bg-white rounded-full flex justify-center border-[4px] md:border-[6px] shadow-inner ${course.fitInside ? 'items-center p-3' : 'items-end'}`} 
                    style={{ borderColor: course.btnColor }}
                  >
                    <img 
                      src={course.img} 
                      alt={course.title} 
                      className={`${course.fitInside ? 'max-h-[90%] w-auto' : 'max-h-[135%] -mb-[1px]'} object-contain relative z-20 pointer-events-none drop-shadow-md`} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          WHY CHOOSE US
      ════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Online Learning With <br /><span style={{ color: '#22c55e' }}>e-Tuitions</span>
              </h2>
              <p className="text-slate-500 font-medium mt-3 max-w-md">Our ecosystem is built for high-performance learning and academic excellence.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-5">
              {[
                { title: 'Personal Mentor', icon: HiUserGroup, color: '#4f46e5', bg: '#eef2ff' },
                { title: 'Effective Study Hub', icon: HiAcademicCap, color: '#059669', bg: '#ecfdf5' },
                { title: 'Live Classes', icon: HiVideoCamera, color: '#f97316', bg: '#fff7ed' },
                { title: 'Interactive Quizzes', icon: HiLightningBolt, color: '#e11d48', bg: '#fff1f2' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 p-3 md:p-5 bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all group text-center sm:text-left">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-xl md:text-2xl group-hover:rotate-6 transition-transform shrink-0" style={{ background: item.bg, color: item.color }}>
                    <item.icon />
                  </div>
                  <h4 className="text-[9px] md:text-sm font-black text-slate-900 uppercase tracking-tight leading-tight">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="w-full aspect-square md:aspect-auto md:h-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-[32px] md:rounded-[48px] overflow-hidden shadow-xl flex items-center justify-center p-4">
              <div className="grid grid-cols-2 gap-2 md:gap-4 md:p-8 w-full">
                {[
                  { num: '5496+', label: 'Parents/Students' },
                  { num: '500+', label: 'Classes Completed' },
                  { num: '100%', label: 'Satisfaction Rate' },
                  { num: '200+', label: 'Certified Tutors' },
                ].map((stat, i) => (
                  <div key={i} 
                    className="bg-white md:bg-white rounded-lg md:rounded-2xl px-1 py-1.5 md:px-6 md:py-4 shadow-md border-2 flex flex-col items-center justify-center text-center group transition-all hover:scale-105 active:scale-95"
                    style={{ borderColor: (i === 0 || i === 3) ? '#f97316' : '#002147' }}
                  >
                    <p className="text-base md:text-3xl font-black text-[#002147] md:text-slate-900 leading-tight group-hover:text-orange-500 transition-colors">{stat.num}</p>
                    <p className="text-[6.5px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 md:mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 text-white p-4 md:p-8 rounded-2xl md:rounded-[32px] shadow-2xl space-y-0.5 md:space-y-1"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              <p className="text-xl md:text-3xl font-black leading-none">Global</p>
              <p className="text-[8px] md:text-xs font-bold uppercase tracking-widest opacity-80">Reach & Impact</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TEACHERS CTA
      ════════════════════════════════════════════ */}
      {/* ════════════════════════════════════════════
          TEACHERS REGISTRATION SECTION (RE-DESIGNED)
      ════════════════════════════════════════════ */}
      <section className="bg-[#002147] py-7 md:py-16 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          
          {/* Top Block: Form & Image side-by-side */}
          <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-16 mb-6 lg:mb-16">
            
            {/* Left: Registration Form (Reflecting Image 3) */}
            <div className="lg:w-[50%] flex flex-col justify-center px-1 md:px-0">
              <div className="bg-[#091a33] rounded-[20px] p-3 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden">
                {/* Theme Highlights */}
                <div className="absolute top-0 left-0 w-2 h-full bg-orange-500"></div>
                
                <div className="space-y-0.5 md:space-y-1 mb-3 md:mb-8">
                  <span className="text-[9px] md:text-[10px] font-bold text-orange-500 uppercase tracking-[0.3em]">Join Our Faculty</span>
                  <h2 className="text-base md:text-[32px] font-black text-white leading-tight">
                    Become an Online <span className="text-orange-500">Tutor</span>
                  </h2>
                </div>

                <form className="space-y-3 md:space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter Full Name"
                        className="w-full px-3 py-1.5 md:py-2.5 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-orange-500 focus:bg-white/10 transition-all text-white placeholder-slate-500 text-[12px] md:text-sm" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Email</label>
                      <input 
                        type="email" 
                        placeholder="teacher@example.com"
                        className="w-full px-3 py-1.5 md:py-2.5 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-orange-500 focus:bg-white/10 transition-all text-white placeholder-slate-500 text-[12px] md:text-sm" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Mobile No</label>
                      <input 
                        type="tel" 
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full px-3 py-1.5 md:py-2.5 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-orange-500 focus:bg-white/10 transition-all text-white placeholder-slate-500 text-[12px] md:text-sm" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Subject Expertise</label>
                      <input 
                        type="text" 
                        placeholder="Maths, Physics etc."
                        className="w-full px-3 py-1.5 md:py-2.5 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-orange-500 focus:bg-white/10 transition-all text-white placeholder-slate-500 text-[12px] md:text-sm" 
                      />
                    </div>
                  </div>

                  <div className="pt-2 md:pt-4 flex justify-center sm:justify-start">
                    <button 
                      className="px-10 py-3 bg-orange-600 hover:bg-orange-500 text-white font-black text-[13px] uppercase tracking-widest rounded-lg transition-all shadow-[0_8px_25px_rgba(234,88,12,0.3)] hover:-translate-y-0.5 active:scale-95"
                    >
                      Apply Now
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Portrait Image — hidden on mobile */}
            <div className="hidden lg:flex lg:w-[50%] max-h-[500px]">
              <div className="w-full rounded-[24px] overflow-hidden border border-white/10 shadow-2xl relative">
                <img 
                  src={teacherJoinImg} 
                  alt="Join as a teacher" 
                  className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>
          </div>

          {/* Bottom Block: Why Join Section (Reflecting Image 4) */}
          <div className="pt-10 border-t border-white/5">
            <h3 className="text-2xl md:text-3xl font-black text-white mb-10 tracking-tight">
              Why Join <span className="text-orange-500 italic">Mye3</span> <span className="text-white">e-Tuitions?</span>
            </h3>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-12">
              {[
                { title: 'GLOBAL REACH', desc: 'Connect with students across India and beyond.', icon: HiGlobeAlt },
                { title: 'FLEXIBLE TIMING', desc: 'Set your own schedule and teach at your convenience.', icon: HiUserGroup },
                { title: 'PREMIUM PAYOUTS', desc: 'Earn competitive rates for each session you conduct.', icon: HiLightningBolt },
                { title: '1-TO-1 INTERACTION', desc: 'Engage deeply with students in personalized sessions.', icon: HiAcademicCap },
              ].map((item, i) => (
                <div key={i} className="space-y-2 lg:space-y-4 group">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-orange-500 font-black text-[10px] md:text-[13px] tracking-widest uppercase">{item.title}</h4>
                    <div className="w-6 lg:w-8 h-1 bg-white/20 group-hover:w-full group-hover:bg-orange-500/50 transition-all duration-500"></div>
                  </div>
                  <p className="text-slate-400 text-[11px] md:text-[13px] leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════
          SUCCESS JOURNEY CTA — RE-DESIGNED
      ════════════════════════════════════════════ */}
      <section className="py-8 md:py-28 bg-white overflow-hidden">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8">
          <div className="bg-[#002147] rounded-[20px] overflow-hidden shadow-2xl relative">
            
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl -mr-40 -mt-40" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -ml-40 -mb-40" />

            <div className="flex flex-col lg:flex-row items-stretch relative z-10">
              
              {/* Left Column: Information */}
              <div className="w-full lg:w-[55%] p-6 md:p-12 lg:p-14 text-left relative z-20">
                <div className="space-y-3 md:space-y-6">
                  <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em]">Ready to start?</span>
                  <h2 className="text-[22px] md:text-[38px] font-black text-white leading-[1.15] tracking-tight">
                    Start Your <span className="text-orange-500 italic">Success</span> Journey Today
                  </h2>
                  <p className="text-blue-100/70 text-[13px] md:text-base leading-relaxed max-w-lg">
                    Experience the precision of 1-on-1 personalized mentorship. Join e-Tuitions and unlock your full academic potential with a free demo session.
                  </p>
                  
                  <div className="flex flex-wrap gap-3 pt-1 md:pt-2">
                    <Link
                      to={userInfo ? (userInfo?.role?.toLowerCase() === 'teacher' ? '/teacher/dashboard' : '/student/dashboard') : '/register'}
                      className="px-6 py-2.5 md:px-8 md:py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-[12px] md:text-[14px] uppercase tracking-widest rounded-xl transition-all shadow-[0_10px_25px_rgba(234,88,12,0.3)]"
                    >
                      Book Free Demo
                    </Link>
                    <Link
                      to="/login"
                      className="px-6 py-2.5 md:px-8 md:py-3.5 bg-white/10 hover:bg-white/20 border-2 border-white/40 text-white font-black text-[12px] md:text-[14px] uppercase tracking-widest rounded-xl transition-all"
                    >
                      Login
                    </Link>
                  </div>
                </div>
              </div>

              {/* VERTICAL DIVIDER LINE (No Gap requested) */}
              <div className="hidden lg:block absolute left-[55%] top-0 bottom-0 w-[2px] bg-blue-500/40 z-30 shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div>

              {/* Right Column: Image — hidden on mobile */}
              <div className="hidden lg:block lg:w-[45%] relative">
                <img 
                   src={successImg} 
                   alt="Student Success" 
                   className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700" 
                 />
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
