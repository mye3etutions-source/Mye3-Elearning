import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { 
  LayoutDashboard, 
  Video, 
  BookOpen, 
  LogOut,
  Home,
  X,
  FileText
} from 'lucide-react';

import logoImg from '../../assets/output-onlinepngtools.png';

const TeacherSidebar = ({ onClose }) => {
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
  ];

  return (
    <aside className="w-full lg:w-72 bg-[#002147] h-screen text-white flex flex-col shadow-2xl overflow-hidden border-r border-white/5">
      {/* Brand Header */}
      <div className="pt-12 pb-8 flex flex-col items-center justify-center gap-6">
        <Link to="/" className="flex flex-col items-center gap-5 group">
          <img 
            src={logoImg} 
            alt="Logo" 
            className="h-28 w-auto object-contain transition-transform group-hover:scale-105" 
          />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-white/90 uppercase tracking-[0.4em] border-b-2 border-orange-500/50 pb-2 italic">Mye3 Education</span>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden absolute top-8 right-8 p-2 text-white/40 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation - No internal scrollbar */}
      <nav className="px-6 py-4 space-y-2 flex-grow overflow-hidden">
        {menuItems.map((item, idx) => {
          const Content = (
            <>
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="tracking-wide">{item.label}</span>
            </>
          );
          
          return (
            <NavLink
              key={idx}
              to={item.path}
              onClick={() => onClose && onClose()}
              className={({ isActive }) => `
                flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all group text-xs uppercase tracking-widest
                ${isActive 
                  ? 'bg-[#f16126] text-white shadow-xl shadow-orange-950/40' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'}
              `}
            >
              {Content}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-8 space-y-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-6 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.3em] text-white/40 hover:text-orange-400 hover:bg-orange-500/10 transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
