import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { 
  LayoutDashboard, 
  IndianRupee, 
  Users, 
  UserSquare2, 
  Activity,
  Banknote,
  MessageSquare,
  X
} from 'lucide-react';
import logoImg from '../../assets/output-onlinepngtools.png';

const AdminSidebar = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    if (onClose) onClose();
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Summary', path: '/admin/dashboard' },
    { icon: IndianRupee, label: 'Fees Control', path: '/admin/pricing' },
    { icon: UserSquare2, label: 'Teacher Management', path: '/admin/teachers' },
    { icon: Users, label: 'Students', path: '/admin/students' },
    { icon: Activity, label: 'Live & Schedule Class', path: '/admin/live-monitor' },
    { icon: MessageSquare, label: 'Contact Inquiries', path: '/admin/inquiries' },
  ];

  return (
    <aside className="w-full lg:w-72 bg-white h-screen text-slate-800 flex flex-col shadow-2xl border-r border-slate-100">
      <div className="pt-8 pb-4 border-b border-emerald-900/10 flex flex-col items-center justify-center relative">
        <Link to="/" className="flex flex-col items-center group gap-0">
          <img 
            src={logoImg} 
            alt="Logo" 
            className="h-28 md:h-32 w-auto object-contain transition-transform group-hover:scale-105" 
          />
          <div className="bg-[#002147] px-4 py-1.5 rounded-full shadow-sm -mt-2">
            <p className="text-[10px] font-black text-white uppercase tracking-[0.4em] leading-none">Admin</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden absolute top-6 right-6 p-2 text-slate-500 hover:text-slate-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 mt-1 overflow-hidden">
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            onClick={() => onClose && onClose()}
            className={({ isActive }) => `
              flex items-center gap-4 px-5 py-3.5 rounded-xl font-bold transition-all group text-sm
              ${isActive 
                ? 'bg-[#002147] text-white shadow-lg shadow-[#002147]/20' 
                : 'text-slate-600 hover:text-[#002147] hover:bg-[#002147]/5'}
            `}
          >
            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

    </aside>
  );
};

export default AdminSidebar;
