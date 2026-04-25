import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { 
  LayoutDashboard, 
  BookOpen, 
  CreditCard, 
  User, 
  LogOut,
  Video,
  FileText,
  X,
  BarChart3
} from 'lucide-react';

import logoNavyBlue from '../../assets/logo navy-blue.png';

const StudentSidebar = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    if (onClose) onClose();
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
    { icon: BookOpen, label: 'My Classes', path: '/student/classes' },
    { icon: Video, label: 'Live & Schedule Class', path: '/student/live-schedule' },
    { icon: FileText, label: 'Notes', path: '/student/notes' },
    { icon: BarChart3, label: 'Performance', path: '/student/performance' },
    { icon: CreditCard, label: 'Fee Payments', path: '/student/payments' },
  ];

  return (
    <aside className="w-full lg:w-72 bg-[#fff7ed] h-screen text-[#002147] flex flex-col shadow-2xl lg:shadow-none border-r border-[#f16126]/20">
      {/* Logo Section - Centered and Large */}
      <div className="pt-8 pb-2 px-4 flex flex-col items-center border-b border-[#f16126]/15">
        <div className="flex items-center justify-between w-full lg:justify-center mb-0">
          <Link to="/" className="group">
            <img 
              src={logoNavyBlue} 
              alt="Logo" 
              className="h-32 md:h-40 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </Link>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-2 text-[#002147] hover:bg-black/5 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

      </div>

      <nav className="flex-1 p-3 md:p-5 space-y-1 mt-2 overflow-y-auto">
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            onClick={() => onClose && onClose()}
          >
            {({ isActive }) => (
              <div className={`
                flex items-center gap-4 px-4 py-2.5 md:py-3 rounded-xl font-black transition-all group text-[11px] md:text-[12px] uppercase tracking-wider
                ${isActive 
                  ? 'bg-[#f16126] text-white shadow-lg shadow-[#f16126]/30' 
                  : 'text-[#002147]/70 hover:text-[#002147] hover:bg-[#f16126]/10'}
              `}>
                <item.icon className={`w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-[#f16126]'}`} />
                <span>{item.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 md:p-6 border-t border-[#f16126]/15">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3 md:py-4 rounded-xl font-black text-[#002147]/70 hover:text-white hover:bg-[#f16126] transition-all group text-[11px] md:text-[12px] uppercase tracking-widest border border-transparent"
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;
