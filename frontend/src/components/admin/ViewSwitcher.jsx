import React, { useEffect } from 'react';
import { usePreview } from '../../context/PreviewContext';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Settings2, 
  UserSquare2, 
  GraduationCap,
  GripHorizontal
} from 'lucide-react';

const ViewSwitcher = () => {
  const { activeView, setActiveView } = usePreview();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync state with URL if changed manually
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) setActiveView('admin');
    else if (location.pathname.startsWith('/teacher')) setActiveView('teacher');
    else if (location.pathname.startsWith('/student')) setActiveView('student');
  }, [location.pathname, setActiveView]);

  const isEnabled = import.meta.env.VITE_ENABLE_VIEW_SWITCHER === 'true';

  if (userInfo?.role !== 'admin' || !isEnabled) return null;

  const handleSwitch = (id) => {
    setActiveView(id);
    navigate(`/${id}/dashboard`);
  };

  const views = [
    { id: 'admin', label: 'Admin', icon: Settings2, color: 'bg-[#002147]' },
    { id: 'teacher', label: 'Teacher', icon: UserSquare2, color: 'bg-[#f16126]' },
    { id: 'student', label: 'Student', icon: GraduationCap, color: 'bg-[#002147]' },
  ];

  return (
    <motion.div 
      drag
      dragMomentum={false}
      initial={{ x: "-50%", y: 0 }}
      className="fixed bottom-6 left-1/2 z-[100] cursor-grab active:cursor-grabbing"
    >
      <div className="bg-slate-900/95 backdrop-blur-2xl p-1.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10 flex items-center gap-1">
        <div className="pl-4 pr-2 py-2 text-white/20">
           <GripHorizontal className="w-4 h-4 cursor-grab" />
        </div>
        
        {views.map((view) => {
          const isActive = activeView === view.id;
          return (
            <button
              key={view.id}
              onClick={(e) => {
                e.preventDefault();
                handleSwitch(view.id);
              }}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-tighter transition-all duration-300
                ${isActive 
                  ? `${view.color} text-white shadow-lg scale-105` 
                  : 'text-white/50 hover:text-white hover:bg-white/5'}
              `}
            >
              <view.icon className={`w-3.5 h-3.5 ${isActive ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{view.label}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ViewSwitcher;
