import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Loader2, GraduationCap } from 'lucide-react';
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {classLevels.length === 0 ? (
           <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white border border-dashed border-slate-300 rounded-2xl shadow-sm text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                 <BookOpen className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-base font-bold text-slate-700">No Assigned Classes Found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">You haven't been assigned to any classes or subjects yet. Contact the administration.</p>
           </div>
         ) : classLevels.map((lvl) => {
            const items = groupedClasses[lvl];
            const hasBundle = items.some(i => i.assignmentType === 'bundle');
            const currentSub = subjectSelection[lvl] || items[0];

            return (
              <div key={lvl} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full overflow-hidden group">
                {/* HEADER */}
                <div className={`h-28 relative p-6 flex flex-col justify-end shrink-0 transition-colors ${
                   hasBundle ? 'bg-gradient-to-tr from-teal-600 to-teal-500' : 'bg-gradient-to-tr from-slate-800 to-slate-700'
                }`}>
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-125 transition-all duration-700"></div>
                   <div className="relative z-10 flex flex-col items-start gap-1">
                      <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm shadow-sm rounded text-[10px] font-bold uppercase tracking-wider text-white">
                        {hasBundle ? 'Bundle Assigned' : 'Individual Subjects'}
                      </span>
                      <h3 className="text-2xl font-bold text-white tracking-tight">{lvl}</h3>
                   </div>
                </div>

                {/* CONTENT: DROPDOWN + ACTIONS */}
                <div className="p-6 flex flex-col flex-1 bg-slate-50/50">
                   <div className="space-y-3 flex-1">
                      <label className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                         Assigned Subjects <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">{items.length}</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                         {items.map((item, idx) => {
                            const isSelected = JSON.stringify(item) === JSON.stringify(currentSub);
                            return (
                               <button 
                                 key={idx} 
                                 onClick={() => handleLocalSubjectChange(lvl, item)}
                                 className={`relative px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                                    isSelected 
                                    ? 'bg-teal-50 border-teal-300 text-teal-700 shadow-sm' 
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-teal-200 hover:bg-slate-50'
                                 }`}
                               >
                                  {item.subjectName}
                                  {isSelected && (
                                     <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-teal-500 border border-white rounded-full"></div>
                                  )}
                               </button>
                            );
                         })}
                      </div>
                   </div>

                    <div className="pt-8 mt-auto">
                      <Link 
                        to="/teacher/materials" 
                        className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-all shadow-sm flex items-center justify-center gap-2 font-bold text-sm"
                      >
                         <FileText className="w-4 h-4" /> 
                         <span>Go to Study Materials</span>
                      </Link>
                    </div>
                </div>
              </div>
            );
         })}
      </div>
    </div>
  );
};

export default MyClasses;
