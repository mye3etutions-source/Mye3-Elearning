import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { HiBell, HiSearch, HiMenuAlt2, HiX } from 'react-icons/hi';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { LogOut, CreditCard, FileText, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <div className={`
        fixed inset-y-0 left-0 z-[70] w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden overflow-y-auto w-full">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between gap-6 lg:gap-12 px-4 md:px-6 sticky top-0 z-40 shrink-0">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <HiMenuAlt2 className="text-2xl" />
              </button>
              
              <div className="relative group hidden md:block">
                 <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-[#002147] transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Search..." 
                   className="pl-10 pr-4 py-2.5 bg-slate-50 border-slate-200 focus:border-[#002147] focus:bg-white border-2 rounded-xl outline-none w-36 lg:w-48 font-bold transition-all text-sm"
                 />
              </div>
           </div>

           <div className="flex items-center gap-3 md:gap-5">
              <div className="hidden lg:flex items-center gap-3">
                 <NavLink to="/admin/transactions" className={({isActive}) => `flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border shadow-sm whitespace-nowrap ${isActive ? 'bg-[#002147] border-[#002147] text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-[#002147]/5 hover:text-[#002147] hover:border-[#002147]/20 hover:-translate-y-0.5'}`}>
                    <CreditCard className="w-4 h-4" /> Fee Payments
                 </NavLink>
                 <NavLink to="/admin/notes" className={({isActive}) => `flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border shadow-sm whitespace-nowrap ${isActive ? 'bg-[#002147] border-[#002147] text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-[#002147]/5 hover:text-[#002147] hover:border-[#002147]/20 hover:-translate-y-0.5'}`}>
                    <FileText className="w-4 h-4" /> Study Notes
                 </NavLink>
                 <NavLink to="/admin/settings" className={({isActive}) => `flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border shadow-sm whitespace-nowrap ${isActive ? 'bg-[#002147] border-[#002147] text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-[#002147]/5 hover:text-[#002147] hover:border-[#002147]/20 hover:-translate-y-0.5'}`}>
                    <User className="w-4 h-4" /> Profile
                 </NavLink>
              </div>

              <button className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#002147]/5 hover:text-[#002147] transition-all relative">
                 <HiBell className="text-xl md:text-2xl" />
                 <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#f16126] rounded-full border-2 border-white"></span>
              </button>
              
              <div className="h-8 md:h-10 w-px bg-slate-100 hidden sm:block"></div>
              
              <div className="flex items-center gap-2 md:gap-4">
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-slate-900 leading-tight">{userInfo?.name || 'Admin'}</p>
                 </div>
                 <div className="w-10 h-10 md:w-12 md:h-12 bg-[#002147] rounded-xl flex items-center justify-center text-[#f16126] font-black text-lg shadow-lg shadow-[#002147]/20">
                    {userInfo?.name?.charAt(0) || 'A'}
                 </div>
                 <button
                   onClick={handleLogout}
                   className="flex items-center gap-2 px-3 py-2 text-[#f16126] hover:bg-[#f16126]/5 rounded-lg transition-all border border-[#f16126]/20 text-xs md:text-sm"
                 >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Logout</span>
                 </button>
              </div>
           </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 md:p-6 flex-1 w-full max-w-full overflow-x-hidden">
          <div className="max-w-full mx-auto w-full px-2">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
