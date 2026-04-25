import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
   BookOpen,
   ChevronRight,
   Clock,
   Zap,
   Radio,
   FileText,
   Layers,
   Sparkles,
   Video,
   ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePreview } from '../../context/PreviewContext';
import { useSelector } from 'react-redux';

const MyLearning = () => {
   const { activeView } = usePreview();
   const { userInfo } = useSelector((state) => state.auth);
   const [learning, setLearning] = useState([]);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const fetchLearning = async () => {
         setLoading(true);
         try {
            const { data } = await axios.get('/student/my-learning');
            setLearning(data);

            const isStaff = activeView === 'admin' ||
               activeView === 'teacher' ||
               userInfo?.role?.toLowerCase() === 'admin' ||
               userInfo?.role?.toLowerCase() === 'teacher';

            if (isStaff && data.length === 0) {
               setLearning([
                  { name: 'Mathematics', type: 'subject', expiryDate: new Date(Date.now() + 5 * 86400000), originalBundleName: 'Class 12', isExpandedFromBundle: true },
                  { name: 'Physics', type: 'subject', expiryDate: new Date(Date.now() + 5 * 86400000), originalBundleName: 'Class 12', isExpandedFromBundle: true },
                  { name: 'Chemistry', type: 'subject', expiryDate: new Date(Date.now() + 5 * 86400000), originalBundleName: 'Class 12', isExpandedFromBundle: true },
                  { name: 'Biology', type: 'subject', expiryDate: new Date(Date.now() + 15 * 86400000), isExpired: false },
                  { name: 'English', type: 'subject', expiryDate: new Date(Date.now() - 5 * 86400000), isExpired: true }
               ]);
            }
            setLoading(false);
         } catch (error) {
            setLoading(false);
         }
      };
      fetchLearning();
   }, [activeView, userInfo]);

   const groupedLearning = learning.reduce((acc, item) => {
      const key = item.originalBundleName || 'Single Subjects';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
   }, {});

   if (loading) {
      return (
         <div className="p-6 space-y-8 animate-pulse">
            <div className="h-32 bg-slate-100 rounded-[32px]" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-64 bg-slate-50 rounded-[40px] border border-slate-100" />
               ))}
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-6 animate-in fade-in duration-700 pb-20 p-4 md:p-6 lg:px-10 bg-[#f8fbff]/50 min-h-screen">
         
         <div className="bg-[#002147] p-6 md:px-10 md:py-8 rounded-2xl text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#f16126] rounded-full -mr-32 -mt-32 blur-[80px] opacity-10" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="text-center md:text-left space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/5 backdrop-blur-sm">
                     <Sparkles className="w-3 h-3 text-[#f16126]" />
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-orange-100">Portal Dashboard</span>
                  </div>
                  <h1 className="text-2xl md:text-4xl font-black tracking-tight uppercase leading-none">
                     MY <span className="text-[#f16126]">CLASSES</span>
                  </h1>
                  <p className="text-indigo-200/60 font-bold text-[10px] md:text-xs uppercase tracking-widest leading-none">
                     Your specialized learning hub & notes archive
                  </p>
               </div>
               <div className="hidden lg:flex items-center gap-8 border-l border-white/10 pl-8">
                  <div className="text-center">
                     <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1 leading-none">ACTIVE</p>
                     <p className="text-2xl font-black leading-none">{learning.filter(l => !l.isExpired).length}</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1 leading-none">RESOURCES</p>
                     <p className="text-2xl font-black leading-none">FULL</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-12">
            {Object.keys(groupedLearning).length === 0 ? (
               <div className="py-32 text-center space-y-6">
                  <div className="w-20 h-20 bg-white border border-slate-100 text-slate-200 rounded-[30px] flex items-center justify-center mx-auto shadow-sm">
                     <BookOpen className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black text-[#002147] uppercase italic tracking-tighter">No Active Subscriptions</h3>
               </div>
            ) : Object.keys(groupedLearning).map((groupName, gIdx) => (
               <div key={gIdx} className="space-y-6 animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${gIdx * 0.1}s` }}>
                  
                  <div className="flex items-center gap-4 md:gap-6">
                     <div className="px-5 py-2 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center gap-3">
                        <Layers className="w-3.5 h-3.5 text-[#f16126]" />
                        <h2 className="text-xs md:text-sm font-black uppercase text-[#002147] tracking-tight whitespace-nowrap">
                           {groupName} <span className="text-slate-300 ml-1">•</span> <span className="text-[#f16126] ml-1">{groupedLearning[groupName].length} Subjects</span>
                        </h2>
                     </div>
                     <Link to="/student/courses" className="text-[9px] md:text-[10px] font-black text-[#f16126] uppercase tracking-widest hover:underline flex items-center gap-1.5 whitespace-nowrap">
                        Explore All Subjects <ArrowRight className="w-3 h-3" />
                     </Link>
                     <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-100 to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                     {groupedLearning[groupName].map((sub, sIdx) => {
                        const daysRemaining = Math.max(0, Math.ceil((new Date(sub.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)));
                        const isExpired = daysRemaining <= 0;

                        return (
                           <motion.div
                              key={sIdx}
                              whileHover={{ y: -5 }}
                              className={`group bg-white p-5 rounded-2xl border-2 transition-all duration-500 flex flex-col justify-between h-full hover:shadow-xl hover:shadow-indigo-900/10 ${
                                 isExpired ? 'border-rose-50 opacity-90' : 'border-slate-50 hover:border-indigo-100'
                              }`}
                           >
                              <div className="space-y-4 relative z-10">
                                 <div className="flex items-start justify-between">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 ${
                                       isExpired ? 'bg-rose-50 text-rose-400' : 'bg-[#002147] text-white shadow-lg group-hover:bg-[#f16126]'
                                    }`}>
                                       <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="text-right">
                                       <div className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest mb-1 ${
                                          isExpired ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                                       }`}>
                                          {isExpired ? 'EXPIRED' : 'ACTIVE'}
                                       </div>
                                       <p className={`text-[9px] font-black uppercase tracking-tighter tabular-nums ${isExpired ? 'text-rose-500' : 'text-[#002147]'}`}>
                                          {isExpired ? 'Renew Now' : `${daysRemaining} Days Left`}
                                       </p>
                                    </div>
                                 </div>

                                 <div className="space-y-0.5">
                                    <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-[#002147] group-hover:text-indigo-600 leading-tight">
                                       {sub.name}
                                    </h3>
                                    <p className="text-[8px] font-bold uppercase tracking-widest text-slate-300">Curated Academy Content</p>
                                 </div>

                                 <div className="flex items-center gap-3 py-3 border-y border-slate-50">
                                    <div className="flex items-center gap-1.5">
                                       <Zap className={`w-3 h-3 ${isExpired ? 'text-slate-200' : 'text-orange-400'}`} />
                                       <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Resources</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                       <Radio className={`w-3 h-3 ${isExpired ? 'text-slate-200' : 'text-rose-400'}`} />
                                       <span className="text-[7px] font-black uppercase text-slate-400 tracking-widest">Live Help</span>
                                    </div>
                                 </div>
                              </div>

                              <div className="mt-6 space-y-2 relative z-10">
                                 <Link
                                    to={isExpired ? '/student/courses' : `/student/notes?search=${sub.name}`}
                                    className={`w-full py-3.5 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-md ${
                                       isExpired 
                                       ? 'bg-white text-rose-600 border border-rose-100 hover:bg-rose-50' 
                                       : 'bg-[#002147] text-white hover:bg-indigo-600 shadow-indigo-900/10'
                                    }`}
                                 >
                                    STUDY NOTES <FileText className="w-3.5 h-3.5" />
                                 </Link>
                                 
                                 {!isExpired && (
                                    <Link
                                       to={`/student/live-schedule?search=${sub.name}`}
                                       className="w-full py-3.5 bg-[#f16126] text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all active:scale-95 shadow-md shadow-[#f16126]/20 hover:bg-[#002147]"
                                    >
                                       JOIN LIVE CLASS <Video className="w-3.5 h-3.5" />
                                    </Link>
                                 )}
                              </div>
                           </motion.div>
                        );
                     })}
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};

export default MyLearning;
