import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Award, 
  Target, 
  BookOpen, 
  CheckCircle2, 
  BarChart 
} from 'lucide-react';
import { useSelector } from 'react-redux';

const StudentPerformance = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  // Placeholder data until backend is ready
  const performanceData = {
    overallProgress: 68,
    classesAttended: 24,
    totalClasses: 32,
    testScores: [
      { subject: 'Physics', score: 85 },
      { subject: 'Mathematics', score: 92 },
      { subject: 'Chemistry', score: 78 }
    ],
    recentAchievements: [
      { title: 'Perfect Attendance', desc: 'Attended all classes this week', date: '2 days ago' },
      { title: 'Top Scorer', desc: 'Highest in Math weekly test', date: '1 week ago' }
    ]
  };

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return (
    <div className="p-6 md:p-8 space-y-6 animate-pulse bg-slate-50 min-h-screen">
      <div className="h-32 bg-slate-200 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-slate-200 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 md:space-y-8 pb-20 p-4 md:p-6 lg:px-8 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
             <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">Performance Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Track your academic progress and achievements.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Col */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Progress Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
               <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                  <motion.circle 
                    initial={{ strokeDasharray: "0 1000" }}
                    animate={{ strokeDasharray: `${performanceData.overallProgress * 2.51} 1000` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="50" cy="50" r="40" stroke="#f16126" strokeWidth="8" fill="none" strokeLinecap="round" 
                  />
               </svg>
               <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-800">{performanceData.overallProgress}%</span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Progress</span>
               </div>
            </div>
            
            <div className="flex-1 space-y-4">
               <h3 className="text-lg font-bold text-slate-800">Overall Course Progress</h3>
               <p className="text-sm text-slate-500 leading-relaxed">You are making steady progress! Keep attending live classes and attempting mock tests to improve your score.</p>
               
               <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                     <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Classes</p>
                     <p className="text-lg font-bold text-slate-800">{performanceData.classesAttended} <span className="text-sm font-medium text-slate-400">/ {performanceData.totalClasses}</span></p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                     <p className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Accuracy</p>
                     <p className="text-lg font-bold text-slate-800">82%</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Subject Scores */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
             <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <BarChart className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-slate-800">Subject Performance</h3>
             </div>
             
             <div className="space-y-5">
                {performanceData.testScores.map((score, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-semibold">
                         <span className="text-slate-700">{score.subject}</span>
                         <span className="text-indigo-600">{score.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${score.score}%` }}
                           transition={{ duration: 1, delay: i * 0.2 }}
                           className={`h-full rounded-full ${score.score >= 90 ? 'bg-emerald-500' : score.score >= 80 ? 'bg-indigo-500' : 'bg-orange-500'}`}
                         />
                      </div>
                   </div>
                ))}
             </div>
          </div>

        </div>

        {/* Right Col */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                 <Award className="w-5 h-5 text-amber-500" />
                 <h3 className="text-lg font-bold text-slate-800">Recent Achievements</h3>
              </div>
              <div className="space-y-4 pt-2">
                 {performanceData.recentAchievements.map((ach, i) => (
                    <div key={i} className="flex gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                       <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-5 h-5 text-amber-500" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-800">{ach.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{ach.desc}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">{ach.date}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default StudentPerformance;
