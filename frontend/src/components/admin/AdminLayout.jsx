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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // For mobile overlay
  const [isCollapsed, setIsCollapsed] = useState(false); // For desktop mini-sidebar

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <div className={`
        fixed inset-y-0 left-0 z-[70] transform transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}>
        <AdminSidebar 
          isCollapsed={isCollapsed} 
          onToggle={() => setIsCollapsed(!isCollapsed)}
          onClose={() => setIsSidebarOpen(false)} 
        />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden overflow-y-auto w-full">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between gap-6 lg:gap-12 px-4 md:px-6 sticky top-0 z-40 shrink-0">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  if (window.innerWidth < 1024) setIsSidebarOpen(true);
                  else setIsCollapsed(!isCollapsed);
                }}
                className="w-12 h-12 flex items-center justify-center bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#002147] hover:border-[#002147] hover:bg-white hover:shadow-xl hover:shadow-[#002147]/10 rounded-2xl transition-all duration-300 group"
                title="Toggle Sidebar"
              >
                <HiMenuAlt2 className={`text-2xl transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
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

            <div className="flex items-center gap-3 md:gap-5 ml-auto">
               <button className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-[#002147]/5 hover:text-[#002147] transition-all relative">
                  <HiBell className="text-xl md:text-2xl" />
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-[#f16126] rounded-full border-2 border-white"></span>
               </button>
               
               <div className="h-8 md:h-10 w-px bg-slate-100 hidden sm:block"></div>
               
               <div className="flex items-center gap-2 md:gap-4">
                  <div className="text-right hidden sm:block">
                     <p className="text-sm font-black text-slate-900 leading-tight">{userInfo?.name || 'Admin'}</p>
                     <p className="text-[10px] font-bold text-[#f16126] uppercase tracking-tighter">Super Admin</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[#002147] rounded-xl flex items-center justify-center text-[#f16126] font-black text-lg shadow-lg shadow-[#002147]/20 border border-slate-100">
                     {userInfo?.name?.charAt(0) || 'A'}
                  </div>
               </div>
            </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 md:p-6 flex-1 w-full max-w-full">
          <div className="max-w-full mx-auto w-full px-2">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
