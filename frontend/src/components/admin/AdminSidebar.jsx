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
  X,
  CreditCard,
  FileText,
  User,
  LogOut,
  GraduationCap
} from 'lucide-react';
import logoImg from '../../assets/output-onlinepngtools.png';

const AdminSidebar = ({ onClose, isCollapsed, onToggle }) => {
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
    { icon: Banknote, label: 'Teacher Payroll', path: '/admin/payouts' },
    { icon: Users, label: 'Students', path: '/admin/students' },
    { icon: Activity,        label: 'Live & Schedule Class', path: '/admin/live-monitor' },
    { icon: GraduationCap,  label: '1-on-1 Classes',        path: '/admin/personal-sessions' },
    { icon: CreditCard,     label: 'Fee Payments',            path: '/admin/transactions' },
    { icon: FileText, label: 'Study Notes', path: '/admin/notes' },
    { icon: User, label: 'Profile', path: '/admin/settings' },
    { icon: MessageSquare, label: 'Contact Inquiries', path: '/admin/inquiries' },
  ];

  return (
    <aside className={`bg-white h-screen text-slate-800 flex flex-col shadow-2xl border-r border-slate-100 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
      <div className={`border-b border-slate-50 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-0'}`}>
        <Link to="/" className="flex flex-col items-center group gap-0">
          <img 
            src={logoImg} 
            alt="Logo" 
            className={`w-auto object-contain transition-all duration-300 ${isCollapsed ? 'h-8' : 'h-24'}`} 
          />
          {!isCollapsed && (
            <div className="bg-[#002147] px-3 py-1 rounded-full shadow-sm mb-2">
              <p className="text-[9px] font-black text-white uppercase tracking-[0.3em] leading-none">Admin</p>
            </div>
          )}
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-900 transition-colors">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <nav className={`flex-1 p-4 space-y-2 mt-2 overflow-y-auto scrollbar-hide transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {menuItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.path}
            onClick={() => { if (window.innerWidth < 1024 && onClose) onClose(); }}
            title={isCollapsed ? item.label : ""}
            className={({ isActive }) => `
              flex items-center rounded-xl font-bold transition-all group text-sm
              ${isCollapsed ? 'justify-center p-3' : 'gap-4 px-4 py-2.5'}
              ${isActive 
                ? 'bg-[#002147] text-white shadow-lg shadow-[#002147]/20' 
                : 'text-slate-600 hover:text-[#002147] hover:bg-[#002147]/5'}
            `}
          >
            <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110`} />
            {!isCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      
      <div className={`p-3 border-t border-slate-100 shrink-0 mt-auto transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <button 
          onClick={handleLogout}
          title={isCollapsed ? "Sign Out" : ""}
          className={`w-full flex items-center rounded-xl font-bold text-[#f16126] hover:bg-[#f16126]/5 transition-all text-sm group ${isCollapsed ? 'justify-center p-3' : 'gap-4 px-4 py-2.5'}`}
        >
          <LogOut className={`w-5 h-5 transition-transform group-hover:translate-x-1`} />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
