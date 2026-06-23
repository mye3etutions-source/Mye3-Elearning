const PersonalSession = require('../models/PersonalSession');
const LiveSession     = require('../models/LiveSession');
const User            = require('../models/User');
const ClassBundle     = require('../models/ClassBundle');
const Transaction     = require('../models/Transaction');

// ─── Conflict Check Helper ────────────────────────────────────────────────────
// Returns { hasConflict, conflicts[] } for a teacher at a given time range
const checkTeacherConflict = async (teacherId, startTime, endTime, excludeSessionId = null) => {
  const start = new Date(startTime);
  const end   = new Date(endTime);

  // Check 1: Group LiveSessions
  const liveConflicts = await LiveSession.find({
    teacherId,
    status: { $ne: 'ended' },
    startTime: { $lt: end },
    endTime:   { $gt: start }
  }).select('title subjectName classLevel startTime endTime');

  // Check 2: Existing confirmed PersonalSessions slots
  const personalSessions = await PersonalSession.find({
    teacherId,
    status: { $in: ['assigned', 'active'] },
    ...(excludeSessionId ? { _id: { $ne: excludeSessionId } } : {})
  }).populate('studentId', 'name');

  const personalConflicts = [];
  for (const ps of personalSessions) {
    for (const slot of ps.scheduledSlots) {
      if (slot.status === 'upcoming') {
        const slotStart = new Date(slot.startTime);
        const slotEnd   = new Date(slot.endTime);
        if (start < slotEnd && end > slotStart) {
          personalConflicts.push({
            type: '1-on-1',
            student: ps.studentId?.name || 'Unknown',
            startTime: slot.startTime,
            endTime:   slot.endTime
          });
        }
      }
    }
  }

  const conflicts = [
    ...liveConflicts.map(s => ({
      type:      'Group Class',
      title:     s.title || s.subjectName,
      classLevel: s.classLevel,
      startTime: s.startTime,
      endTime:   s.endTime
    })),
    ...personalConflicts
  ];

  return { hasConflict: conflicts.length > 0, conflicts };
};

// ─── ADMIN: Get all 1-on-1 registered students (no session assigned yet) ──────
// GET /admin/personal-sessions/students
exports.getPersonalStudents = async (req, res) => {
  try {
    const students = await User.find({ board: '1-on-1', role: 'student' })
      .select('name email mobileNumber createdAt')
      .sort({ createdAt: -1 });

    // Attach session info per student
    const result = await Promise.all(students.map(async (s) => {
      const session = await PersonalSession.findOne({ studentId: s._id })
        .populate('teacherId', 'name')
        .sort({ createdAt: -1 });
      return {
        student: s,
        session: session || null
      };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── ADMIN: Get all personal sessions ────────────────────────────────────────
// GET /admin/personal-sessions
exports.getAllPersonalSessions = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const sessions = await PersonalSession.find(filter)
      .populate('studentId', 'name email mobileNumber activeSubscriptions')
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── ADMIN: Conflict check ────────────────────────────────────────────────────
// GET /admin/personal-sessions/conflict-check?teacherId=&startTime=&endTime=
exports.conflictCheck = async (req, res) => {
  try {
    const { teacherId, startTime, endTime } = req.query;
    if (!teacherId || !startTime || !endTime) {
      return res.status(400).json({ message: 'teacherId, startTime, endTime required' });
    }
    const result = await checkTeacherConflict(teacherId, startTime, endTime);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /admin/personal-sessions/:studentId/assign
exports.assignSession = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { teacherId, subjectName, slots, adminNote } = req.body;
    // slots: [{ startTime, endTime, meetingLink, platform }]

    if (!teacherId || !slots?.length) {
      return res.status(400).json({ message: 'teacherId, slots required' });
    }

    // Conflict check for all slots
    for (const slot of slots) {
      const { hasConflict, conflicts } = await checkTeacherConflict(teacherId, slot.startTime, slot.endTime);
      if (hasConflict) {
        return res.status(409).json({
          message: 'Teacher has a conflict in one or more slots',
          conflicts
        });
      }
    }

    // Upsert PersonalSession for this student
    let session = await PersonalSession.findOne({ studentId, status: { $nin: ['completed', 'cancelled'] } });
    if (!session) {
      session = new PersonalSession({ studentId });
    }

    // Check if plan has expired
    if (session.expiryDate && new Date() > new Date(session.expiryDate)) {
      return res.status(403).json({ message: 'Cannot assign slots: Student plan has expired.' });
    }

    session.teacherId      = teacherId;
    session.subjectName    = subjectName || '';
    session.scheduledSlots = slots.map(s => ({
      startTime:   s.startTime,
      endTime:     s.endTime,
      meetingLink: s.meetingLink,
      platform:    s.platform || 'Google Meet',
      status:      'upcoming'
    }));
    session.adminNote = adminNote || '';

    // Always set status to active upon assignment by admin
    session.status = 'active';

    await session.save();

    // TODO Phase 9: Send socket notification to student
    res.json({ message: 'Session assigned successfully', session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── ADMIN: Get/Set 1-on-1 pricing plans ─────────────────────────────────────
// These are stored as a special User doc with role = 'config' or in a settings collection.
// For simplicity: stored in a dedicated field in a global config document.
// We'll use a simple in-memory approach and store in DB as a Setting.
// GET /admin/personal-sessions/pricing
exports.getPersonalPricing = async (req, res) => {
  try {
    let pricingDoc = await ClassBundle.findOne({ className: '1-on-1', board: '1-on-1' });
    if (!pricingDoc) {
      pricingDoc = new ClassBundle({
        className: '1-on-1',
        board: '1-on-1',
        pricing: {
          oneMonth: 0,
          threeMonths: 0,
          sixMonths: 0,
          twelveMonths: 0
        }
      });
      await pricingDoc.save();
    }
    res.json(pricingDoc.pricing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /admin/personal-sessions/pricing
exports.updatePersonalPricing = async (req, res) => {
  try {
    const { oneMonth, threeMonths, sixMonths, twelveMonths } = req.body;
    let pricingDoc = await ClassBundle.findOne({ className: '1-on-1', board: '1-on-1' });
    if (!pricingDoc) {
      pricingDoc = new ClassBundle({
        className: '1-on-1',
        board: '1-on-1'
      });
    }
    pricingDoc.pricing = {
      oneMonth: Number(oneMonth) || 0,
      threeMonths: Number(threeMonths) || 0,
      sixMonths: Number(sixMonths) || 0,
      twelveMonths: Number(twelveMonths) || 0
    };
    await pricingDoc.save();
    res.json(pricingDoc.pricing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /student/personal-sessions
exports.getMyPersonalSessions = async (req, res) => {
  try {
    let sessions = await PersonalSession.find({ studentId: req.user._id })
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    // Mark expired sessions as completed
    let hasChanges = false;
    for (let session of sessions) {
      if (session.expiryDate && new Date() > new Date(session.expiryDate) && !['completed', 'cancelled'].includes(session.status)) {
         session.status = 'completed';
         await session.save();
         hasChanges = true;
      }
    }

    // Auto-create a pending session document if they have no active sessions
    const activeSession = sessions.find(s => !['completed', 'cancelled'].includes(s.status));
    if (!activeSession && req.user.board === '1-on-1') {
      const newSession = new PersonalSession({
        studentId: req.user._id,
        status: 'pending',
        paymentStatus: 'pending'
      });
      await newSession.save();
      sessions.unshift(newSession); // Put at top for UI
    }

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── STUDENT: Initiate payment ───────────────────────────────────────────────
// POST /student/personal-sessions/:id/pay
exports.initiatePayment = async (req, res) => {
  try {
    const { planType } = req.body;

    const session = await PersonalSession.findOne({
      _id: req.params.id,
      studentId: req.user._id,
      status: { $in: ['pending', 'assigned'] },
      paymentStatus: 'pending'
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found or already paid' });
    }

    const finalPlanType = planType || session.planType;
    if (!finalPlanType) {
      return res.status(400).json({ message: 'Plan type is required to process payment' });
    }

    // Resolve price dynamically from global pricing config safely
    let pricingDoc = await ClassBundle.findOne({ className: '1-on-1', board: '1-on-1' });
    const resolvedPrice = pricingDoc?.pricing?.[finalPlanType] || session.price || 0;

    session.planType      = finalPlanType;
    session.price         = resolvedPrice;
    session.paymentStatus = 'paid';
    
    // Set status to active if teacher is assigned, else keep as pending
    if (session.teacherId) {
      session.status = 'active';
    } else {
      session.status = 'pending';
    }
    
    await session.save();

    const formatPlanName = (plan) => {
      switch (plan) {
        case 'oneMonth': return 'Monthly';
        case 'threeMonths': return 'Quarterly';
        case 'sixMonths': return 'Half-Yearly';
        case 'twelveMonths': return 'Annually';
        default: return 'Custom';
      }
    };

    // Safely create transaction record
    try {
      const tx = new Transaction({
        studentId: req.user._id,
        amount: resolvedPrice,
        status: 'success',
        packageName: `1-on-1 Personal Class - ${formatPlanName(finalPlanType)}`,
        referenceId: session._id.toString(),
        type: '1-on-1',
        date: new Date()
      });
      await tx.save();
    } catch (txError) {
      console.error('Error saving 1-on-1 transaction:', txError);
      // We do not fail the request if transaction history fails to save, 
      // but we log it. The session is already marked as paid.
    }

    res.json({ message: 'Payment successful. Sessions are now active!', session });
  } catch (err) {
    console.error('initiatePayment Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// ─── TEACHER: Get my personal sessions ───────────────────────────────────────
// GET /teacher/personal-sessions
exports.getTeacherPersonalSessions = async (req, res) => {
  try {
    const sessions = await PersonalSession.find({ teacherId: req.user._id })
      .populate('studentId', 'name email mobileNumber')
      .sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── TEACHER/ADMIN: Mark a slot as completed ─────────────────────────────────
// PUT /teacher/personal-sessions/:sessionId/slots/:slotId/complete
exports.markSlotCompleted = async (req, res) => {
  try {
    const session = await PersonalSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const slot = session.scheduledSlots.id(req.params.slotId);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });

    slot.status = 'completed';

    // If all slots completed → mark overall session completed
    const allDone = session.scheduledSlots.every(s => s.status !== 'upcoming');
    if (allDone) {
      session.status = 'completed';
      session.payoutStatus = 'unpaid'; // Ready for payroll
    }

    await session.save();
    res.json({ message: 'Slot marked as completed', session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
