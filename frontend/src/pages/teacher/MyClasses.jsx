import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Loader2, GraduationCap, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [groupedClasses, setGroupedClasses] = useState({});
  const [loading, setLoading] = useState(true);
  const [subjectSelection, setSubjectSelection] = useState({}); // { classLevel: selectedSubjectObject }

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data } = await axios.get('/teacher/my-classes');
        
        // Group by classLevel
        const grouped = data.reduce((acc, curr) => {
          if (!acc[curr.classLevel]) acc[curr.classLevel] = [];
          acc[curr.classLevel].push(curr);
          return acc;
        }, {});

        setGroupedClasses(grouped);
        setClasses(data);

        // Default selection for each class card
        const initialSelection = {};
        Object.keys(grouped).forEach(lvl => {
          initialSelection[lvl] = grouped[lvl][0];
        });
        setSubjectSelection(initialSelection);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching classes');
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);



  const handleLocalSubjectChange = (lvl, subjectObj) => {
    setSubjectSelection(prev => ({ ...prev, [lvl]: subjectObj }));
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
    </div>
  );

  const classLevels = Object.keys(groupedClasses).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 p-4 md:p-8 max-w-7xl mx-auto font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
         <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-600/20">
                  <GraduationCap className="w-5 h-5 text-white" />
               </div>
               <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Assigned Classes</h1>
            </div>
            <p className="text-slate-500 font-medium text-sm">Direct access to grades and subjects mapped to your profile.</p>
         </div>
      </div>

      {classes.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center bg-white border border-dashed border-slate-300 rounded-2xl shadow-sm text-center">
           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-slate-300" />
           </div>
           <h3 className="text-base font-bold text-slate-700">No Assigned Classes Found</h3>
           <p className="text-sm text-slate-500 mt-1 max-w-sm">You haven't been assigned to any classes or subjects yet. Contact the administration.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Board</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Class / Grade</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Subject</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Price / Class</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {classes.map((item, idx) => {
                    const boardName = item.board || 'TS Board';
                    
                    return (
                       <tr key={idx} className="hover:bg-teal-50/30 transition-colors group">
                          <td className="px-8 py-6">
                             <span className="px-3 py-1 bg-orange-50 text-[#f16126] text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-100">
                                {boardName}
                             </span>
                          </td>
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-[#002147] rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-900/10 group-hover:scale-110 transition-transform">
                                   <GraduationCap className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-black text-[#002147] tracking-tight uppercase italic">{item.classLevel}</span>
                             </div>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-sm font-bold text-slate-700 uppercase">{item.subjectName}</span>
                          </td>
                          <td className="px-8 py-6">
                             <span className="text-lg font-black text-[#f16126]">₹{item.pricePerClass || 0}</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <Link 
                                to="/teacher/materials" 
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#002147] hover:text-white transition-all border border-slate-200"
                             >
                                <FileText className="w-3.5 h-3.5" />
                                Materials
                             </Link>
                          </td>
                       </tr>
                    );
                 })}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default MyClasses;
