import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { setCredentials } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Loader2,
  GraduationCap,
  BookOpen
} from 'lucide-react';

const ProfileSettings = ({ role }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab ] = useState('personal');
  const [subscriptions, setSubscriptions] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);

  useEffect(() => {
    if (role?.toLowerCase() === 'student') {
      const fetchSubs = async () => {
        setSubsLoading(true);
        try {
          const { data } = await axios.get('/student/subscriptions');
          setSubscriptions(data || []);
        } catch (err) {
          console.error('Failed to fetch subscriptions');
        } finally {
          setSubsLoading(false);
        }
      };
      fetchSubs();
    }
  }, [role]);

  const theme = {
    student: 'indigo',
    teacher: 'teal',
    admin: 'indigo'
  }[role?.toLowerCase() || 'student'] || 'indigo';

  const t = {
    indigo: {
      accent: 'indigo',
      bg: 'bg-indigo-600',
      text: 'text-indigo-600',
      border: 'border-indigo-600',
      hover: 'hover:bg-indigo-700',
      light: 'bg-indigo-50',
      lightText: 'text-indigo-700',
      shadow: 'shadow-indigo-200',
      ring: 'bg-indigo-600 focus:ring-indigo-500'
    },
    teal: {
      accent: 'teal',
      bg: 'bg-teal-600',
      text: 'text-teal-600',
      border: 'border-teal-600',
      hover: 'hover:bg-teal-700',
      light: 'bg-teal-50',
      lightText: 'text-teal-700',
      shadow: 'shadow-teal-200',
      ring: 'bg-teal-600 focus:ring-teal-500'
    }
  }[theme];

  const submitHandler = async (e) => {
    e.preventDefault();
    if (activeTab === 'security') {
        if (!password || !confirmPassword) {
            toast.error('Please fill password fields');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
    }
    
    setLoading(true);
    try {
      const res = await axios.put('/auth/profile', {
        name: activeTab === 'personal' ? name : undefined,
        email: activeTab === 'personal' ? email : undefined,
        password: activeTab === 'security' ? password : undefined,
      });
      dispatch(setCredentials({ ...res.data }));
      toast.success('Updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Identity', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 h-full overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-5 h-full"
      >
        {/* Sidebar Tabs */}
        <div className="lg:w-60 shrink-0">
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col h-full">
             <div className="flex flex-col items-center mb-6">
                <div className="relative">
                   <div className={`w-16 h-16 ${t.bg} rounded-[20px] flex items-center justify-center text-white text-2xl font-black shadow-lg`}>
                      {userInfo?.name?.charAt(0)}
                   </div>
                </div>
                <h3 className="mt-3 text-base font-black text-slate-900 tracking-tight text-center uppercase italic line-clamp-1">{userInfo?.name}</h3>
                <p className={`px-4 py-1 mt-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${t.light} ${t.lightText} border border-${t.accent}-100`}>
                   {role}
                </p>
             </div>

            <nav className="flex flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                    activeTab === tab.id 
                      ? `${t.bg} text-white shadow-md` 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left italic">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 h-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[24px] p-6 lg:p-7 shadow-sm border border-slate-100 h-full flex flex-col"
            >
              {activeTab === 'personal' && (
                <div className="flex flex-col h-full space-y-5">
                  {/* IDENTITY SECTION */}
                  <div className="space-y-4">
                    <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                       <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Portal Identity</h2>
                       <button onClick={submitHandler} disabled={loading} className={`px-8 py-2.5 ${t.bg} text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all`}>
                          {loading ? <Loader2 className="w-3 h-3 animate-spin"/> : 'SAVE INFO'}
                       </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-50 focus:border-indigo-500 focus:bg-white bg-slate-50 outline-none transition-all font-black text-slate-800 text-sm shadow-sm" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-slate-50 focus:border-indigo-500 focus:bg-white bg-slate-50 outline-none transition-all font-black text-slate-800 text-sm shadow-sm" />
                       </div>
                    </div>

                    {role?.toLowerCase() === 'student' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Board</label>
                            <div className="px-5 py-3.5 bg-orange-50 border border-orange-100 rounded-xl text-sm font-black text-orange-600 uppercase italic flex items-center gap-3">
                               <BookOpen className="w-4 h-4" /> {userInfo?.board || 'NA'}
                            </div>
                         </div>
                         <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class</label>
                            <div className="px-5 py-3.5 bg-indigo-50 border border-indigo-100 rounded-xl text-sm font-black text-indigo-600 uppercase italic flex items-center gap-3">
                               <GraduationCap className="w-4 h-4" /> {userInfo?.className || 'NA'}
                            </div>
                         </div>
                      </div>
                    )}
                  </div>

                  {/* SUBSCRIPTION SECTION */}
                  {role?.toLowerCase() === 'student' && (
                    <div className="flex-1 min-h-0 flex flex-col space-y-4 pt-4 border-t border-slate-100">
                       <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic ml-1">Subscriptions</h2>

                       <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                          {subsLoading ? (
                            <div className="py-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" /></div>
                          ) : (subscriptions || []).length === 0 ? (
                            <div className="py-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                               <p className="font-black uppercase tracking-widest text-xs text-slate-400">No records</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 gap-3">
                               {subscriptions.map((sub, idx) => {
                                 const daysLeft = Math.ceil((new Date(sub.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                                 const isNearExpiry = daysLeft <= 7 && daysLeft > 0;
                                 const isExpired = daysLeft <= 0;

                                 return (
                                   <div key={idx} className={`p-4 rounded-2xl border-2 transition-all group ${isNearExpiry ? 'border-orange-100 bg-orange-50/50' : isExpired ? 'border-rose-100 bg-rose-50/50' : 'border-slate-50 bg-white shadow-sm hover:shadow-md'}`}>
                                      <div className="flex items-center justify-between gap-4">
                                         <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${isExpired ? 'bg-rose-100 text-rose-600' : isNearExpiry ? 'bg-orange-100 text-orange-600' : 'bg-indigo-600 text-white'}`}>
                                               <GraduationCap className="w-6 h-6" />
                                            </div>
                                            <div>
                                               <h4 className="font-black text-slate-900 uppercase text-base md:text-lg italic leading-tight">{sub.name}</h4>
                                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">{sub.subscriptionType}</p>
                                            </div>
                                         </div>

                                         <div className="text-right">
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isExpired ? 'text-rose-600' : isNearExpiry ? 'text-orange-600' : 'text-slate-400'}`}>
                                               {isExpired ? 'EXPIRED' : 'VALID'}
                                            </p>
                                            <p className="font-black text-slate-900 text-sm md:text-base tabular-nums tracking-tighter">
                                               {new Date(sub.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                            {isNearExpiry && <Link to="/student/courses" className="mt-1 inline-block text-[10px] font-black text-orange-600 uppercase underline">Renew</Link>}
                                         </div>
                                      </div>
                                   </div>
                                 );
                               })}
                            </div>
                          )}
                       </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'security' && (
                <div className="flex flex-col h-full space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                     <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Security</h2>
                  </div>
                  <form onSubmit={submitHandler} className="max-w-md space-y-5">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 bg-slate-50 outline-none font-black text-slate-800 text-sm" placeholder="••••••••" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Verify Password</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 focus:border-indigo-500 bg-slate-50 outline-none font-black text-slate-800 text-sm" placeholder="••••••••" />
                     </div>
                     <button type="submit" disabled={loading} className={`px-10 py-4 ${t.bg} text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95`}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : 'UPDATE PASSWORD'}
                     </button>
                  </form>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ProfileSettings;
