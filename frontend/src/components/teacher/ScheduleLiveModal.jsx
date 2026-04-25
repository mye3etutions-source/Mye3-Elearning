import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Video, Calendar, Clock, Link as LinkIcon, GraduationCap, Monitor, Target, Loader2, CheckCircle2, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { usePreview } from '../../context/PreviewContext';
import { useSelector } from 'react-redux';
import CustomSelect from '../../components/common/CustomSelect';

const ScheduleLiveModal = ({ isOpen, onClose, selectedClass }) => {
  const { activeView } = usePreview();
  const { userInfo } = useSelector((state) => state.auth);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    courseString: '', 
    title: '',
    platform: 'Zoom',
    link: '',
    startTime: ''
  });
  
  const [groupedClasses, setGroupedClasses] = useState({});
  const [selectedGrade, setSelectedGrade] = useState('');

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const { data } = await axios.get('/teacher/my-assignments');
        
        // Group by classLevel
        const grouped = data.reduce((acc, curr) => {
          if (!acc[curr.classLevel]) acc[curr.classLevel] = [];
          acc[curr.classLevel].push(curr);
          return acc;
        }, {});

        setGroupedClasses(grouped);
        setClasses(data);
        
        // If a class was passed from the card, pre-select it
        if (selectedClass) {
          setSelectedGrade(selectedClass.classLevel);
          const matchingClass = data.find(c => 
            c.classLevel === selectedClass.classLevel && 
            c.subjectName === selectedClass.subjectName
          );
          if (matchingClass) {
            setFormData(prev => ({ ...prev, courseString: JSON.stringify(matchingClass) }));
          }
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    if (isOpen) fetchAssigned();
  }, [isOpen, selectedClass]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseString) return toast.error('Please select a subject');

    try {
      const course = JSON.parse(formData.courseString);
      const payload = {
        ...formData,
        classLevel: course.classLevel,
        subjectName: course.subjectName,
        subjectId: course.type === 'subject' ? course.id : null,
      };
      
      const { data } = await axios.post('/teacher/schedule-live', payload);
      toast.success(data.message || 'Class scheduled and students notified!');
      
      setTimeout(() => {
        onClose();
        setFormData({
          courseString: '',
          title: '',
          platform: 'Zoom',
          link: '',
          startTime: ''
        });
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set up the session');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
        <Toaster position="top-right" />
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
           <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Schedule Your Class</h2>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Plan your next live interaction</p>
           </div>
           <button onClick={onClose} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
              <X className="w-5 h-5" />
           </button>
        </div>

        <div className="p-8 md:p-10 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 text-teal-600 animate-spin" /></div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* STEP 1: SELECT GRADE */}
                   <CustomSelect 
                     label="Select Grade"
                     icon={GraduationCap}
                     placeholder="Choose Class Level..."
                     options={Object.keys(groupedClasses).map(grade => ({ value: grade, label: grade }))}
                     value={selectedGrade}
                     onChange={(val) => {
                       setSelectedGrade(val);
                       setFormData({ ...formData, courseString: '' });
                     }}
                   />

                   {/* STEP 2: SELECT SUBJECT */}
                   <div className={`transition-all duration-500 ${!selectedGrade ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                     <CustomSelect 
                       label="Select Subject"
                       icon={Target}
                       placeholder={selectedGrade ? "Which Subject?" : "Select Grade First"}
                       options={(groupedClasses[selectedGrade] || []).map(item => ({ 
                         value: JSON.stringify(item), 
                         label: item.subjectName 
                       }))}
                       value={formData.courseString}
                       onChange={(val) => setFormData({ ...formData, courseString: val })}
                     />
                   </div>

                   <CustomSelect 
                     label="Class Link Platform"
                     icon={Video}
                     placeholder="Zoom or Google Meet?"
                     options={[
                       { label: 'Zoom Meeting', value: 'Zoom' },
                       { label: 'Google Meet', value: 'Google Meet' },
                       { label: 'YouTube Live', value: 'YouTube Live' },
                       { label: 'Other', value: 'Other' }
                     ]}
                     value={formData.platform}
                     onChange={(val) => setFormData({ ...formData, platform: val })}
                   />

                  <div className="md:col-span-2 space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-500" /> What is this class about?
                     </label>
                     <input 
                       required
                       type="text"
                       placeholder="e.g. Algebra Basics or Exam Revision"
                       value={formData.title}
                       onChange={(e) => setFormData({...formData, title: e.target.value})}
                       className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-teal-600 focus:bg-white rounded-2xl outline-none font-black text-slate-900 shadow-inner transition-all text-sm"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4 text-blue-500" /> Class Link
                     </label>
                     <input 
                       required
                       type="url"
                       placeholder="Paste your meeting link here"
                       value={formData.link}
                       onChange={(e) => setFormData({...formData, link: e.target.value})}
                       className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-teal-600 focus:bg-white rounded-2xl outline-none font-black text-slate-900 shadow-inner transition-all text-sm"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-500" /> When will it start?
                     </label>
                     <input 
                       required
                       type="datetime-local"
                       value={formData.startTime}
                       onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                       className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-teal-600 focus:bg-white rounded-2xl outline-none font-black text-slate-900 shadow-inner transition-all text-sm"
                     />
                  </div>
               </div>

               <div className="p-6 bg-teal-50 rounded-2xl border border-teal-100 flex items-start gap-4">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 mt-1 shrink-0" />
                  <div>
                     <p className="font-black text-teal-900 leading-tight mb-1 text-sm">Student Alerts</p>
                     <p className="text-[9px] font-black text-teal-700/60 leading-relaxed uppercase tracking-widest">Enrollments will be notified automatically once you confirm.</p>
                  </div>
               </div>

               <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-teal-600 active:scale-95 transition-all">
                  Confirm & Notify Students
               </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleLiveModal;
