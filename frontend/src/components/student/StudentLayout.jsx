import React, { useState, useEffect } from 'react';
import StudentSidebar from './StudentSidebar';
import { HiMenuAlt2, HiOutlineUserCircle } from 'react-icons/hi';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { logout } from '../../store/slices/authSlice';
import { Search, GraduationCap, LogOut } from 'lucide-react';

const StudentLayout = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // Determine socket URL dynamically
  const getSocketUrl = () => {
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL.replace('/api', '').replace(/\/$/, '');
    }
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  };

  const socketUrl = getSocketUrl();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data } = await axios.get('/student/live-alerts');
        setAlerts(data || []);
      } catch (err) {
        console.error('ALERT_FETCH_FAIL');
      }
    };
    fetchAlerts();

    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socket.on('connect', () => {
      console.log('✅ Student Socket Link Active - ID:', socket.id);
    });
    
    socket.on('live-session-update', (data) => {
      fetchAlerts();
      window.dispatchEvent(new Event('refresh-student-data'));
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Socket Connection Note:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [socketUrl]);

  const hasLive = alerts.some(a => a.status === 'live');
  const alertCount = alerts.filter(a => a.status === 'live' || a.status === 'upcoming').length;

  const expiringSoonItems = (userInfo?.activeSubscriptions || []).filter(sub => {
    const days = Math.ceil((new Date(sub.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days <= 7 && days > 0;
  });

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-[70] w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <StudentSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden overflow-y-auto w-full relative">
        
        {expiringSoonItems.length > 0 && (
          <div className="bg-orange-600 text-white px-6 py-2.5 flex items-center justify-center gap-4 sticky top-0 z-[60] shadow-lg animate-in slide-in-from-top duration-500">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                <p className="text-[10px] md:text-sm font-black uppercase tracking-widest">
                   Urgent: {expiringSoonItems.length} of your subscriptions are expiring soon! 
                </p>
             </div>
             <Link 
               to="/student/courses" 
               className="bg-white text-orange-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 transition-all shadow-sm"
             >
                Renew Now
             </Link>
          </div>
        )}

        <header className="h-14 md:h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 shadow-sm">
           <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 text-[#002147] hover:bg-slate-50 rounded-lg transition-colors"
              >
                <HiMenuAlt2 className="text-2xl" />
              </button>
              
              {/* SEARCH BAR - White Style */}
              <div className="hidden md:flex items-center flex-1 max-w-2xl bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
                <Search className="ml-5 w-5 h-5 text-slate-400 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search..."
                  className="flex-1 px-4 py-4 bg-transparent text-sm font-bold text-[#002147] placeholder-slate-400 focus:outline-none tracking-wide"
                />
                <button className="bg-[#f16126] text-white px-8 py-4 font-black text-[11px] uppercase tracking-widest hover:bg-[#e05520] transition-colors shrink-0">
                  SEARCH
                </button>
              </div>
           </div>

           <div className="flex items-center gap-4 md:gap-8">
              {/* HEADER PROFILE AREA */}
              <div className="flex items-center gap-3 md:gap-5">
                 <div className="text-right flex flex-col justify-center">
                    <p className="text-[13px] md:text-sm font-black text-[#002147] leading-tight uppercase tracking-tight">{userInfo?.name || 'Student'}</p>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                       <GraduationCap className="w-3 h-3 text-[#f16126]" />
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                          {`${userInfo?.board || ''} ${userInfo?.className || ''}`.trim() || 'Portal'}
                       </p>
                    </div>
                 </div>
                 <Link 
                   to="/student/profile" 
                   className="flex items-center gap-3 text-[#002147] hover:text-[#f16126] transition-all group active:scale-95"
                 >
                    <HiOutlineUserCircle className="text-3xl md:text-4xl transition-transform group-hover:scale-110" />
                    <div className="flex flex-col">
                      <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest leading-none">Profile</span>
                    </div>
                 </Link>
              </div>

              <div className="h-10 w-px bg-slate-100 hidden sm:block"></div>

              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-5 py-3 text-rose-600 font-black uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 text-[10px]"
              >
                 <LogOut className="w-4 h-4" />
                 <span>Logout</span>
              </button>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
