import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  X, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Check, 
  Loader2, 
  Calendar, 
  Clock, 
  Video, 
  User, 
  BookOpen, 
  DollarSign,
  FileText
} from 'lucide-react';

const AssignPersonalSessionModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [teachers, setTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [planType, setPlanType] = useState('oneMonth');
  const [price, setPrice] = useState(0);
  const [adminNote, setAdminNote] = useState('');
  const [slots, setSlots] = useState([
    { startTime: '', endTime: '', meetingLink: '', platform: 'Google Meet' }
  ]);
  
  const [pricingPlans, setPricingPlans] = useState({
    oneMonth: 0,
    threeMonths: 0,
    sixMonths: 0,
    twelveMonths: 0
  });
  const [loading, setLoading] = useState(false);
  const [slotConflicts, setSlotConflicts] = useState({});

  useEffect(() => {
    if (!isOpen || !student) return;

    const loadData = async () => {
      try {
        const [resTeachers, resPricing] = await Promise.all([
          axios.get('/admin/teachers-list'),
          axios.get('/admin/personal-sessions/pricing')
        ]);
        setTeachers(resTeachers.data || []);
        
        const pricing = resPricing.data || { oneMonth: 0, threeMonths: 0, sixMonths: 0, twelveMonths: 0 };
        setPricingPlans(pricing);
        
        // Default price for default planType (oneMonth)
        setPrice(pricing.oneMonth || 0);
      } catch (err) {
        toast.error('Failed to load teachers or pricing information');
      }
    };

    loadData();
    
    // Reset state
    setTeacherId('');
    setSubjectName('');
    setPlanType('oneMonth');
    setAdminNote('');
    setSlots([{ startTime: '', endTime: '', meetingLink: '', platform: 'Google Meet' }]);
    setSlotConflicts({});
  }, [isOpen, student]);

  // Handle plan type change to auto-update price
  const handlePlanTypeChange = (e) => {
    const selectedPlan = e.target.value;
    setPlanType(selectedPlan);
    if (pricingPlans[selectedPlan] !== undefined) {
      setPrice(pricingPlans[selectedPlan]);
    }
  };

  // Add a new slot
  const addSlot = () => {
    setSlots([...slots, { startTime: '', endTime: '', meetingLink: '', platform: 'Google Meet' }]);
  };

  // Remove a slot
  const removeSlot = (index) => {
    const updated = slots.filter((_, i) => i !== index);
    setSlots(updated);
    
    // Clean up conflict state for removed slot
    const updatedConflicts = { ...slotConflicts };
    delete updatedConflicts[index];
    setSlotConflicts(updatedConflicts);
  };

  // Update a specific slot field
  const updateSlotField = (index, field, value) => {
    const updated = [...slots];
    updated[index][field] = value;
    setSlots(updated);

    // If time values or teacher change, check conflict
    if ((field === 'startTime' || field === 'endTime') && teacherId) {
      const startTime = field === 'startTime' ? value : updated[index].startTime;
      const endTime = field === 'endTime' ? value : updated[index].endTime;
      if (startTime && endTime) {
        triggerConflictCheck(index, startTime, endTime, teacherId);
      }
    }
  };

  // When teacherId is updated, check conflicts for all valid slots
  const handleTeacherChange = (e) => {
    const tId = e.target.value;
    setTeacherId(tId);
    setSlotConflicts({});
    
    if (tId) {
      slots.forEach((slot, index) => {
        if (slot.startTime && slot.endTime) {
          triggerConflictCheck(index, slot.startTime, slot.endTime, tId);
        }
      });
    }
  };

  // Check conflicts API helper
  const triggerConflictCheck = async (index, startTime, endTime, tId) => {
    try {
      const { data } = await axios.get('/admin/personal-sessions/conflict-check', {
        params: { teacherId: tId, startTime, endTime }
      });
      setSlotConflicts(prev => ({
        ...prev,
        [index]: {
          hasConflict: data.hasConflict,
          conflicts: data.conflicts || []
        }
      }));
    } catch (err) {
      console.error('Conflict check failed', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherId) {
      return toast.error('Please select a teacher');
    }
    if (!subjectName.trim()) {
      return toast.error('Please enter a subject');
    }

    // Validate slots
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!slot.startTime || !slot.endTime) {
        return toast.error(`Please fill in dates/times for slot #${i + 1}`);
      }
      if (new Date(slot.startTime) >= new Date(slot.endTime)) {
        return toast.error(`End time must be after Start time for slot #${i + 1}`);
      }
      if (!slot.meetingLink || !slot.meetingLink.trim()) {
        return toast.error(`Please provide a meet link for slot #${i + 1}`);
      }
      // Check if this slot has a conflict
      if (slotConflicts[i]?.hasConflict) {
        return toast.error(`Cannot assign: Teacher has conflict in slot #${i + 1}`);
      }
    }

    try {
      setLoading(true);
      const payload = {
        teacherId,
        subjectName,
        slots,
        planType,
        price: Number(price) || 0,
        adminNote
      };

      await axios.put(`/admin/personal-sessions/${student._id}/assign`, payload);
      toast.success('Teacher and schedule assigned successfully!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign session');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div>
            <h3 className="text-lg font-bold">Assign 1-on-1 Personal Class</h3>
            <p className="text-xs text-slate-300 mt-1">
              Assigning for Student: <span className="font-semibold text-orange-400">{student?.name}</span> ({student?.mobileNumber})
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* General Assignment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Subject Name
              </label>
              <input 
                type="text" 
                placeholder="e.g. Mathematics, Physics II"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" /> Select Teacher
              </label>
              <select 
                value={teacherId}
                onChange={handleTeacherChange}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="">-- Choose Teacher --</option>
                {teachers.map(t => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" /> Plan Duration
              </label>
              <select 
                value={planType}
                onChange={handlePlanTypeChange}
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="oneMonth">Monthly</option>
                <option value="threeMonths">Quarterly</option>
                <option value="sixMonths">Half-Yearly</option>
                <option value="twelveMonths">Annually</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-indigo-600" /> Plan Price (₹)
              </label>
              <input 
                type="number" 
                placeholder="Plan Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Schedule Slots (Sessions) */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" /> Scheduled Slots ({slots.length})
              </h4>
              <button 
                type="button" 
                onClick={addSlot}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg flex items-center gap-1 transition-colors border border-indigo-100"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Slot
              </button>
            </div>

            <div className="space-y-4">
              {slots.map((slot, index) => {
                const conflict = slotConflicts[index];
                return (
                  <div key={index} className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3 relative group">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
                      <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Slot #{index + 1}</span>
                      {slots.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeSlot(index)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                          title="Remove Slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-500" /> Start Date &amp; Time
                        </label>
                        <input 
                          type="datetime-local" 
                          value={slot.startTime}
                          onChange={(e) => updateSlotField(index, 'startTime', e.target.value)}
                          required
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-indigo-500 bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-500" /> End Date &amp; Time
                        </label>
                        <input 
                          type="datetime-local" 
                          value={slot.endTime}
                          onChange={(e) => updateSlotField(index, 'endTime', e.target.value)}
                          required
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-indigo-500 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                          <Video className="w-3 h-3 text-indigo-500" /> Platform
                        </label>
                        <select 
                          value={slot.platform}
                          onChange={(e) => updateSlotField(index, 'platform', e.target.value)}
                          required
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-indigo-500 bg-white"
                        >
                          <option value="Google Meet">Google Meet</option>
                          <option value="Zoom">Zoom</option>
                          <option value="Teams">Teams</option>
                        </select>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                          <Video className="w-3 h-3 text-indigo-500" /> Meet Link (Mandatory)
                        </label>
                        <input 
                          type="url" 
                          placeholder="https://meet.google.com/abc-defg-hij"
                          value={slot.meetingLink}
                          onChange={(e) => updateSlotField(index, 'meetingLink', e.target.value)}
                          required
                          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-indigo-500 bg-white font-medium"
                        />
                      </div>
                    </div>

                    {/* Conflict Warnings */}
                    {conflict && (
                      <div className={`mt-2 p-2 rounded-lg border flex items-start gap-2 text-xs font-semibold ${
                        conflict.hasConflict 
                          ? 'bg-red-50 text-red-700 border-red-200' 
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {conflict.hasConflict ? (
                          <>
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p>Teacher Conflict Detected!</p>
                              <div className="text-[10px] text-red-600/90 font-medium">
                                {conflict.conflicts.map((c, i) => (
                                  <div key={i} className="list-item ml-3">
                                    {c.type === '1-on-1' 
                                      ? `1-on-1 Session with ${c.student} (${new Date(c.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(c.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`
                                      : `Group class: ${c.title} (${new Date(c.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(c.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`
                                    }
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>Teacher is free at this slot.</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="space-y-1 border-t border-slate-100 pt-5">
            <label className="text-xs font-bold text-slate-700">Admin Note (Internal/Student Visible)</label>
            <textarea 
              rows="3"
              placeholder="Any comments, schedule remarks, etc."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow disabled:opacity-75"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Assign &amp; Notify Student
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AssignPersonalSessionModal;
