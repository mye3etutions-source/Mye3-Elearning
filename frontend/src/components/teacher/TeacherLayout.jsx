import React, { useState } from 'react';
import TeacherSidebar from './TeacherSidebar';
import { HiBell, HiMenuAlt2 } from 'react-icons/hi';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, NavLink } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { LogOut, UserCircle, History, Banknote, User } from 'lucide-react';

const TeacherLayout = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <div className={`
        fixed inset-y-0 left-0 z-[70] w-72 transform transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <TeacherSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-10 sticky top-0 z-40 shadow-sm">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <HiMenuAlt2 className="text-2xl" />
              </button>
              <div className="bg-teal-50 text-teal-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-teal-100 hidden sm:block">
                 Faculty Portal
              </div>
              
              <div className="hidden lg:flex items-center gap-2 ml-4">
                 <NavLink to="/teacher/past-sessions" className={({isActive}) => `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${isActive ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                    <History className="w-4 h-4" /> Past Sessions
                 </NavLink>
                 <NavLink to="/teacher/earnings" className={({isActive}) => `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${isActive ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                    <Banknote className="w-4 h-4" /> My Earnings
                 </NavLink>
                 <NavLink to="/teacher/profile" className={({isActive}) => `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${isActive ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
                    <User className="w-4 h-4" /> Profile
                 </NavLink>
              </div>
           </div>

           <div className="flex items-center gap-3 md:gap-6">
              <button className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-all relative">
                 <HiBell className="text-xl" />
                 <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>
              
              <div className="flex items-center gap-2 md:gap-4">
                 <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-slate-900 leading-tight">{userInfo?.name || 'Faculty'}</p>
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest">Academic Dept</p>
                 </div>
                 <div className="w-10 h-10 md:w-11 md:h-11 bg-teal-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-teal-100">
                    {userInfo?.name?.charAt(0) || <UserCircle className="w-5 h-5" />}
                 </div>
                 <button
                   onClick={handleLogout}
                   className="flex items-center gap-2 px-3 py-2 text-rose-600 font-bold hover:bg-rose-50 rounded-lg transition-all border border-rose-100 text-xs md:text-sm"
                 >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden md:inline">Logout</span>
                 </button>
              </div>
           </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 md:p-10 flex-1">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
