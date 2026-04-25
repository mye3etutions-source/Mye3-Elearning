import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Play, Video, GraduationCap, Link as LinkIcon, Target, Loader2, CheckCircle2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ContentUpload = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    courseString: '',
    title: '',
    youtubeId: ''
  });

  useEffect(() => {
    const fetchAssigned = async () => {
      try {
        const { data } = await axios.get('/teacher/my-classes');
        setClasses(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching classes');
        setLoading(false);
      }
    };
    fetchAssigned();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.courseString) return toast.error('Please select a course');

    try {
      const course = JSON.parse(formData.courseString);
      const payload = {
        ...formData,
        classLevel: course.classLevel,
        subjectName: course.subjectName,
      };
      
      await axios.post('/teacher/recordings', payload);
      toast.success('Lecture Video Linked Successfully!');
      setFormData({
        courseString: '',
        title: '',
        youtubeId: ''
      });
    } catch (error) {
      toast.error('Failed to link video');
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      <Toaster position="top-right" />
      
      <div className="space-y-1">
         <h1 className="text-4xl font-black text-slate-900 tracking-tight">Lecture Repository</h1>
         <p className="text-slate-500 font-bold">Upload recorded lectures and archive them for student access.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
         <div className="md:col-span-2">
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-teal-900/5 p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Directed Course</label>
                    <select 
                      required
                      value={formData.courseString}
                      onChange={(e) => setFormData({...formData, courseString: e.target.value})}
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-3xl outline-none font-black text-slate-900"
                    >
                       <option value="">Choose Course...</option>
                       {classes.map((cls, i) => (
                          <option key={i} value={JSON.stringify(cls)}>{cls.classLevel}: {cls.subjectName}</option>
                       ))}
                    </select>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Video Title</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Introduction to Thermodynamics"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-3xl outline-none font-black text-slate-900"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">YouTube Video ID</label>
                    <div className="relative">
                       <input 
                         required
                         type="text"
                         placeholder="e.g. dQw4w9WgXcQ"
                         value={formData.youtubeId}
                         onChange={(e) => setFormData({...formData, youtubeId: e.target.value})}
                         className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-rose-600 rounded-3xl outline-none font-black text-slate-900 pr-20"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Play className="w-6 h-6 text-rose-600" />
                       </div>
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase italic pl-2">Copy unique ID from the end of the YouTube URL</p>
                 </div>

                 <button type="submit" className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black text-lg shadow-2xl hover:bg-black transition-all">
                    Link Recording
                 </button>
              </form>
            </div>
         </div>

         <div className="space-y-6">
            <div className="p-8 bg-indigo-600 rounded-[40px] text-white space-y-4">
               <Video className="w-10 h-10" />
               <h3 className="text-xl font-black leading-tight">Video Content Guidelines</h3>
               <p className="text-xs font-bold text-indigo-100 leading-relaxed">Ensure videos are set to 'Unlisted' on YouTube to maintain privacy while allowing student access through your portal.</p>
            </div>
            
            <div className="p-8 bg-white border border-slate-100 rounded-[40px] space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                     <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Active Sync</h3>
               </div>
               <p className="text-[11px] font-bold text-slate-500 leading-relaxed">Linked videos appear instantly on the students' 'Course Content' page after successful submission.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ContentUpload;
