import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Video, 
  BookOpen, 
  LogOut,
  X,
  FileText,
  History,
  Banknote,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import logoImg from '../../assets/output-onlinepngtools.png';

const TeacherSidebar = ({ onClose, isCollapsed, onToggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    if (onClose) onClose();
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
    { icon: BookOpen, label: 'My Classes', path: '/teacher/classes' },
    { icon: FileText, label: 'Notes', path: '/teacher/materials' },
    { icon: Video, label: 'Live Classes', path: '/teacher/live-schedule' },
    { icon: Video, label: 'Personal Sessions', path: '/teacher/personal-sessions' },
    { icon: History, label: 'Past Sessions', path: '/teacher/past-sessions' },
    { icon: Banknote, label: 'My Earnings', path: '/teacher/earnings' },
    { icon: User, label: 'Profile', path: '/teacher/profile' },
  ];

  return (
    <aside 
      className={`bg-[#002147] h-screen text-white flex flex-col shadow-2xl border-r border-white/5 transition-all duration-300 ease-in-out relative ${isCollapsed ? 'w-20' : 'w-72'}`}
    >
      {/* Brand Header */}
      <div className={`relative pt-6 pb-4 flex flex-col items-center justify-center gap-4 ${isCollapsed ? 'px-2' : ''}`}>
        <Link to="/" className="flex flex-col items-center gap-3 group">
          <motion.img 
            animate={{ height: isCollapsed ? 32 : 80 }}
            src={logoImg} 
            alt="Logo" 
            className="w-auto object-contain transition-transform group-hover:scale-105" 
          />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col items-center overflow-hidden"
              >
                <span className="text-[10px] font-black text-white/90 uppercase tracking-[0.4em] border-b-2 border-orange-500/50 pb-1.5 italic whitespace-nowrap">Mye3 Education</span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        {/* Toggle Button - Desktop Only */}
        <button 
          onClick={onToggle}
          className="hidden lg:flex absolute -right-3.5 top-10 w-7 h-7 bg-[#f16126] rounded-full items-center justify-center border-2 border-[#002147] text-white hover:bg-orange-600 transition-all z-[100] shadow-[0_0_15px_rgba(241,97,38,0.5)] active:scale-90"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {onClose && (
          <button onClick={onClose} className="lg:hidden absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={`px-4 py-2 space-y-1.5 flex-grow overflow-y-auto custom-sidebar-scroll overflow-x-hidden`}>
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            onClick={() => onClose && onClose()}
            title={isCollapsed ? item.label : ''}
            className={({ isActive }) => `
              flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-6'} py-3.5 rounded-2xl font-black transition-all group text-xs uppercase tracking-widest
              ${isActive 
                ? 'bg-[#f16126] text-white shadow-xl shadow-orange-950/40' 
                : 'text-white/50 hover:text-white hover:bg-white/5'}
            `}
          >
            <item.icon className={`w-5 h-5 group-hover:scale-110 transition-transform shrink-0 ${isCollapsed ? '' : 'mr-4'}`} />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="tracking-wide whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className={`p-4 space-y-2 mb-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : ''}
          className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-6'} py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.3em] text-white/40 hover:text-orange-400 hover:bg-orange-500/10 transition-all group w-full`}
        >
          <LogOut className={`w-5 h-5 group-hover:translate-x-1 transition-transform shrink-0 ${isCollapsed ? '' : 'mr-4'}`} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
