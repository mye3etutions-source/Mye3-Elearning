import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FiSearch, 
  FiCheckCircle, 
  FiStar, 
  FiAward, 
  FiMessageCircle,
  FiArrowRight,
  FiLinkedin,
  FiTwitter
} from 'react-icons/fi';
import { GraduationCap, Users, BookOpen, Clock } from 'lucide-react';
import teacherMaths from '../assets/teacher-maths.png';
import teacherPhysics from '../assets/teacher-physics.png';
import teacherChemistry from '../assets/teacher-chemistry.png';

const Teachers = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const teachers = [
    {
      name: "Dr. Rajesh Kumar",
      subject: "Mathematics Expert",
      qualification: "M.Sc, PhD (IIT Madras)",
      experience: "15+ Years Experience",
      image: teacherMaths,
      specialization: "Calculus & Algebra",
      bio: "Passionate about making complex mathematical concepts simple and intuitive for competitive exams."
    },
    {
      name: "Mrs. Anjali Sharma",
      subject: "Physics Specialist",
      qualification: "B.Tech, M.Tech (NIT Warangal)",
      experience: "10+ Years Experience",
      image: teacherPhysics,
      specialization: "Mechanics & Optics",
      bio: "Expert in visual learning techniques for Physics, helping students ace JEE and NEET with ease."
    },
    {
      name: "Mr. Vikram Singh",
      subject: "Chemistry Guru",
      qualification: "M.Sc Chemistry, B.Ed",
      experience: "12+ Years Experience",
      image: teacherChemistry,
      specialization: "Organic & Physical Chemistry",
      bio: "Dedicated to simplifying chemical equations and reactions through real-world applications."
    }
  ];

  return (
    <div className="bg-white min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* ── SEARCH STRIP (Uniform with Store) ── */}
      <div className="bg-[#002147] py-3 md:py-4 px-3 md:px-4 border-b border-[#001b3a]">
        <div className="max-w-[800px] mx-auto flex h-11 md:h-14 shadow-2xl relative z-20">
          <div className="flex-1 relative flex items-center bg-white rounded-l-xl md:rounded-l-2xl overflow-hidden border-y border-l border-white/20">
            <FiSearch className="text-slate-400 w-4 h-4 md:w-5 md:h-5 ml-4 md:ml-6 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search faculty..."
              className="w-full py-2 px-3 md:px-5 text-xs md:text-[15px] text-[#002147] font-bold outline-none h-full bg-transparent placeholder-slate-400"
            />
          </div>
          <button className="bg-[#f16126] text-white px-5 md:px-10 h-full text-[10px] md:text-[13px] font-black uppercase tracking-[0.2em] rounded-r-xl md:rounded-r-2xl hover:bg-[#de551e] transition-all flex-shrink-0 shadow-lg active:scale-95">
            Search faculty
          </button>
        </div>
      </div>

      {/* ── HERO SECTION ── */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 md:py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-orange-50 rounded-full blur-[100px] md:blur-[120px] -mr-32 -mt-32 md:-mr-48 md:-mt-48 opacity-60" />
        <div className="absolute bottom-0 left-0 w-64 h-64 md:w-80 md:h-80 bg-blue-50 rounded-full blur-[80px] md:blur-[100px] -ml-32 -mb-32 md:-ml-40 md:-mb-40 opacity-40" />

        <div className="text-center space-y-4 md:space-y-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full border border-orange-100 mb-2"
          >
            <FiStar className="text-[#f16126] w-3 h-3" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#f16126]">Academic Excellence</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-5xl font-black text-[#002147] tracking-tighter leading-tight md:leading-[1.1] uppercase italic"
          >
            Meet Our <span className="text-[#f16126] not-italic">World-Class</span> <br/>Faculty
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto text-[#64748b] font-bold text-[11px] md:text-base leading-relaxed italic px-2"
          >
            Learn from the brightest minds in the education industry. Our teachers are 
            handpicked from top institutions like IITs and NITs.
          </motion.p>
        </div>

          {/* ── STATS STRIP ── */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-5xl mx-auto">
          {[
            { label: "Expert Teachers", val: "50+", icon: GraduationCap, color: "text-[#002147]", bg: "border-navy-50" },
            { label: "Years of Trust", val: "10+", icon: Clock, color: "text-[#f16126]", bg: "border-orange-50" },
            { label: "Happy Students", val: "10k+", icon: Users, color: "text-emerald-500", bg: "border-emerald-50" },
            { label: "Quality Lessons", val: "5000+", icon: BookOpen, color: "text-blue-500", bg: "border-blue-50" }
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`relative bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border ${stat.bg} shadow-sm text-center space-y-1 md:space-y-2 hover:shadow-xl transition-all overflow-hidden group`}
            >
              {/* Theme Accent Bar */}
              <div className={`absolute top-0 left-0 w-0.5 md:w-1 h-full opacity-10 group-hover:opacity-100 transition-opacity bg-current ${stat.color}`} />
              
              <stat.icon className={`w-7 h-7 md:w-10 md:h-10 mx-auto mb-1 md:mb-2 ${stat.color} group-hover:scale-110 transition-transform duration-500`} />
              <p className="text-xl md:text-3xl font-black text-[#002147] leading-none tracking-tight">{stat.val}</p>
              <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── TEACHER GRID ── */}
      <div className="bg-slate-50 py-12 md:py-24 border-t border-slate-100">
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-14">
            {teachers.map((t, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group relative bg-white rounded-[16px] md:rounded-[24px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col p-2 md:p-4"
              >
                {/* Image Section - Compact */}
                <div className="relative h-36 md:h-44 rounded-[12px] md:rounded-[18px] overflow-hidden mb-3 md:mb-6 shadow-inner bg-slate-50">
                  <img 
                    src={t.image} 
                    alt={t.name}
                    className="w-full h-full object-cover object-top md:grayscale group-hover:grayscale-0 transition-all duration-700 md:group-hover:scale-105"
                  />
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#002147]/90 text-white text-[7px] md:text-[8px] font-black uppercase tracking-wider rounded border border-white/10 backdrop-blur-sm">
                     {t.subject}
                  </div>
                </div>

                {/* Content - Super Compact */}
                <div className="px-1 space-y-1.5 flex-1">
                   <div>
                     <p className="text-[7px] md:text-[9px] font-black text-[#f16126] uppercase tracking-wider mb-0">{t.qualification}</p>
                     <h3 className="text-sm md:text-lg font-black text-[#002147] uppercase italic tracking-tight group-hover:text-[#f16126] transition-colors leading-tight">{t.name}</h3>
                   </div>
                   
                   <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-50">
                      <div className="flex items-center gap-1.5 text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                         <FiCheckCircle className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-emerald-500 shrink-0" /> {t.experience}
                      </div>
                      <div className="flex items-center gap-1.5 text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                         <FiAward className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-orange-500 shrink-0" /> {t.specialization}
                      </div>
                   </div>

                   <p className="text-slate-400 font-bold italic text-[9px] md:text-[11px] leading-relaxed pt-0.5 line-clamp-2">
                     "{t.bio}"
                   </p>
                </div>

                <Link 
                  to={userInfo ? (userInfo?.role?.toLowerCase() === 'teacher' ? '/teacher/dashboard' : '/student/dashboard') : '/register'}
                  className="mt-3 md:mt-6 w-full py-2 md:py-3 bg-[#002147] text-white rounded-lg md:rounded-xl font-black text-[8px] md:text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-[#f16126] transition-all shadow active:scale-95 group/btn"
                >
                   Book Free Demo <FiArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TEACHER REGISTRATION & BENEFITS SECTION ── */}
      <div className="bg-[#fff8f1] py-12 md:py-24 px-4 md:px-6 overflow-hidden border-t border-orange-100">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
          
          {/* Left Side: Teacher Registration Form */}
          <div className="relative group">
            {/* Orange Border Accent Like Image 2 */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#f16126] shadow-[0_0_20px_rgba(241,97,38,0.2)] rounded-l-2xl md:rounded-l-3xl" />
            
            <div className="bg-white p-4 md:p-14 rounded-2xl md:rounded-3xl border border-orange-100 shadow-xl relative z-10">
              <div className="mb-3 md:mb-10">
                <p className="text-[7px] md:text-[10px] font-black text-[#f16126] uppercase tracking-[0.3em] mb-1 md:mb-2 font-sans italic">Join Our Faculty</p>
                <h2 className="text-lg md:text-4xl font-black text-[#002147] italic uppercase tracking-tighter">Become an Online <span className="text-[#f16126] not-italic">Tutor</span></h2>
              </div>

              <form className="space-y-2.5 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-6">
                  <div className="space-y-1 md:space-y-2">
                    <label className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                    <input type="text" placeholder="Enter Full Name" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 md:px-5 py-2 md:py-4 text-[10px] md:text-sm text-[#002147] outline-none focus:border-[#f16126] transition-all font-bold placeholder-slate-400" />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <label className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input type="email" placeholder="teacher@example.com" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 md:px-5 py-2 md:py-4 text-[10px] md:text-sm text-[#002147] outline-none focus:border-[#f16126] transition-all font-bold placeholder-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-6">
                  <div className="space-y-1 md:space-y-2">
                    <label className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile No</label>
                    <input type="text" placeholder="+91 XXXXX" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 md:px-5 py-2 md:py-4 text-[10px] md:text-sm text-[#002147] outline-none focus:border-[#f16126] transition-all font-bold placeholder-slate-400" />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <label className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Topic</label>
                    <input type="text" placeholder="Specialization" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 md:px-5 py-2 md:py-4 text-[10px] md:text-sm text-[#002147] outline-none focus:border-[#f16126] transition-all font-bold placeholder-slate-400" />
                  </div>
                </div>

                <button className="w-full md:w-fit mt-1 md:mt-4 px-6 py-3 bg-[#f16126] text-white rounded-xl font-black text-[8px] md:text-xs uppercase tracking-[0.3em] hover:bg-[#de551e] transition-all shadow-lg active:scale-95">
                  Apply Now
                </button>
              </form>
            </div>
          </div>

          {/* Right Side: Why Join Mye3 Benefits Grid */}
          <div className="space-y-8 md:space-y-12">
            <h2 className="text-2xl md:text-5xl font-black text-[#002147] italic uppercase tracking-tighter leading-tight md:leading-[1.1]">
              Why Join <br/> 
              <span className="text-[#f16126] not-italic">Mye3</span> e-Tuitions?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 md:gap-y-10 gap-x-8 md:gap-x-12">
               {[
                 { title: "Global Reach", text: "Connect with students across India and beyond." },
                 { title: "Flexible Timing", text: "Set your own schedule." },
                 { title: "Premium Payouts", text: "Earn competitive rates." },
                 { title: "Personalized", text: "1-to-1 deep interaction." }
               ].map((item, i) => (
                 <div key={i} className="group">
                    <h4 className="text-[11px] md:text-[13px] font-black text-[#002147] uppercase tracking-widest mb-2 md:mb-3 flex items-center gap-2">
                      <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-[#f16126] rounded-full" />
                      {item.title}
                    </h4>
                    <div className="w-8 md:w-12 h-0.5 bg-[#f16126]/30 mb-2 md:mb-4 group-hover:w-full transition-all duration-500" />
                    <p className="text-slate-500 font-bold text-[11px] md:text-sm leading-relaxed italic">{item.text}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teachers;
