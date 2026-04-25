const User = require('../models/User');
const LiveSession = require('../models/LiveSession');
const Recording = require('../models/Recording');
const Material = require('../models/Material');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const ClassBundle = require('../models/ClassBundle');

// @desc    Get teacher's assigned classes and subjects
// @route   GET /api/teacher/my-classes
// @access  Teacher
exports.getMyClasses = async (req, res, next) => {
  try {
    // Admin bypass: return all classes and subjects
    if (req.user.role === 'admin') {
      const [classes, subjects, bundles] = await Promise.all([
        Class.find({}).sort({ level: 1 }),
        Subject.find({}).sort({ classLevel: 1 }),
        ClassBundle.find({ isActive: true }).sort({ className: 1 })
      ]);
      const allAssignments = [
        ...classes.map(c => ({ assignmentType: 'bundle', classLevel: c.name, subjectName: c.name })),
        ...bundles.map(b => ({ assignmentType: 'bundle', classLevel: b.className, subjectName: b.className })),
        ...subjects.map(s => ({ assignmentType: 'subject', classLevel: `Class ${s.classLevel}`, subjectName: s.name, subjectId: s._id }))
      ];
      return res.status(200).json(allAssignments);
    }

    const teacher = await User.findById(req.user._id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.status(200).json(teacher.assignedSubjects || []);
  } catch (error) {
    next(error);
  }
};

// @desc    Get teacher's assigned classes and subjects (formatted for dropdowns)
// @route   GET /api/teacher/my-assignments
// @access  Teacher
exports.getMyAssignments = async (req, res, next) => {
  try {
    // Admin bypass: return all classes and subjects formatted for dropdowns
    if (req.user.role === 'admin') {
      const [classes, subjects, bundles] = await Promise.all([
        Class.find({}).sort({ level: 1 }),
        Subject.find({}).sort({ classLevel: 1 }),
        ClassBundle.find({ isActive: true }).sort({ className: 1 })
      ]);
      const allAssignments = [
        ...classes.map(c => ({
          id: c._id,
          name: `${c.name} (All Subjects)`,
          type: 'bundle',
          classLevel: c.name,
          subjectName: c.name
        })),
        ...bundles.map(b => ({
          id: b._id,
          subjectName: b.className,
          name: `${b.className} (All Subjects)`
        })),
        ...subjects.map(s => ({
          id: s._id,
          name: `${s.name} (Class ${s.classLevel})`,
          type: 'subject',
          classLevel: `Class ${s.classLevel}`,
          subjectName: s.name
        }))
      ];
      return res.status(200).json(allAssignments);
    }

    const teacher = await User.findById(req.user._id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const assignments = (teacher.assignedSubjects || []).map(item => {
      let label = '';
      if (item.assignmentType === 'bundle') {
        label = `${item.subjectName} (${item.classLevel} - All Subjects)`;
      } else {
        label = `${item.subjectName} (${item.classLevel})`;
      }

      return {
        id: item.subjectId || null, // Ensure this is only an ObjectId
        name: label,
        type: item.assignmentType,
        classLevel: item.classLevel,
        subjectName: item.subjectName,
        board: item.board || 'TS Board'
      };
    });

    res.status(200).json(assignments);
  } catch (error) {
    next(error);
  }
};


// @desc    Get teacher's live sessions (Grouped by Status)
// @route   GET /api/teacher/live-sessions
// @access  Teacher
exports.getLiveSessions = async (req, res, next) => {
  try {
    // Admin sees ALL sessions; Teacher sees only their own
    const query = req.user.role === 'admin' ? {} : { teacherId: req.user._id };
    const sessions = await LiveSession.find(query).sort({ startTime: -1, createdAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats (Live count, Student count, etc.)
// @route   GET /api/teacher/dashboard-stats
// @access  Teacher
exports.getDashboardStats = async (req, res, next) => {
  try {
    const teacherId = req.user._id;
    const teacher = await User.findById(teacherId);
    if (!teacher && req.user.role !== 'admin') return res.status(404).json({ message: 'Teacher not found' });

    // 1. Get Live and Upcoming counts
    const sessions = await LiveSession.find(req.user.role === 'admin' ? {} : { teacherId });
    const liveCount = sessions.filter(s => s.status === 'live').length;
    const upcomingCount = sessions.filter(s => s.status === 'upcoming').length;
    const endedCount = sessions.filter(s => s.status === 'ended').length;

    // 2. Calculate Real-Time Student Count
    // This counts students who are enrolled in a subject or bundle assigned to this teacher
    let studentCount = 0;
    if (req.user.role === 'admin') {
      studentCount = await User.countDocuments({ role: 'student' });
    } else {
      const assignments = teacher.assignedSubjects || [];
      const assignedNames = assignments.map(a => a.subjectName);
      const assignedLevels = assignments.map(a => a.classLevel);

      // Find students who have an active subscription matching any of these names/levels
      // Note: This is an approximation based on the name-matching logic used in the portal
      const enrolledStudents = await User.find({
        role: 'student',
        'activeSubscriptions.expiryDate': { $gt: new Date() },
        $or: [
          { 'activeSubscriptions.name': { $in: assignedNames } },
          { 'activeSubscriptions.name': { $in: assignedLevels } }
        ]
      });
      studentCount = enrolledStudents.length;
    }

    res.status(200).json({
      liveCount,
      upcomingCount,
      endedCount,
      studentCount,
      totalAssigned: req.user.role === 'admin' ? 0 : (teacher.assignedSubjects?.length || 0)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update live session status (Start/End Class)
// @route   PUT /api/teacher/live-sessions/:id/status
// @access  Teacher
exports.updateSessionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['live', 'ended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update' });
    }

    const session = await LiveSession.findOne({
      _id: req.params.id,
      teacherId: req.user.role === 'admin' ? { $exists: true } : req.user._id
    });

    if (!session) return res.status(404).json({ message: 'Session not found' });

    const previousStatus = session.status;
    session.status = status;
    await session.save();

    // Auto-calculate Payout if marking as ended
    if (previousStatus !== 'ended' && status === 'ended') {
      try {
        const teacher = await User.findById(session.teacherId);
        if (teacher) {
          const { rateA = 0, rateB = 0 } = teacher.payRates || {};
          const activeRateA = rateA > 0 ? rateA : 500; 
          const activeRateB = rateB > 0 ? rateB : 600; 
          
          let rate = activeRateA;
          const level = session.classLevel ? session.classLevel.toLowerCase() : '';
          if (level.includes('11') || level.includes('12') || level.includes('inter')) {
             rate = activeRateB;
          }

          const start = new Date(session.startTime);
          const end = new Date(session.endTime);
          const durationMs = end - start;
          const hours = durationMs > 0 ? (durationMs / (1000 * 60 * 60)) : 1;

          const monthNum = start.getMonth() + 1;
          const yearNum = start.getFullYear();

          const Payout = require('../models/Payout');
          let payout = await Payout.findOne({ teacherId: session.teacherId, month: monthNum, year: yearNum });
          
          if (!payout) {
             await Payout.create({
                teacherId: session.teacherId,
                month: monthNum,
                year: yearNum,
                totalSessions: 1,
                totalHours: hours,
                totalAmount: rate,
                status: 'Pending'
             });
          } else if (payout.status === 'Pending') {
             payout.totalSessions += 1;
             payout.totalHours += hours;
             payout.totalAmount += rate;
             await payout.save();
          }
        }
      } catch (err) {
        console.error('Failed to auto-update payout:', err);
      }
    }

    // Emit socket event for real-time status update
    const io = req.app.get('io');
    if (io) io.emit('live-session-update', { type: 'status', session });

    res.status(200).json({
      message: `Session ${status === 'live' ? 'started' : 'ended'} successfully!`,
      session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload recording / link video
// @route   POST /api/teacher/recordings
// @access  Teacher
exports.uploadRecording = async (req, res, next) => {
  try {
    const { classLevel, subjectName, title, youtubeId } = req.body;

    const recording = await Recording.create({
      teacherId: req.user._id,
      classLevel,
      subjectName,
      title,
      youtubeId
    });

    res.status(201).json(recording);
  } catch (error) {
    next(error);
  }
};

// @desc    Get teacher's recordings
// @route   GET /api/teacher/recordings
// @access  Teacher
exports.getRecordings = async (req, res, next) => {
  try {
    // Admin bypass: see all recordings
    const query = req.user.role === 'admin' ? {} : { teacherId: req.user._id };
    const recordings = await Recording.find(query).sort({ createdAt: -1 });
    res.status(200).json(recordings);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload / Link Material (Notes, PDFs)
// @route   POST /api/teacher/materials
// @access  Teacher
exports.uploadMaterial = async (req, res, next) => {
  try {

    const { classLevel, subjectName, title, fileUrl: externalUrl, type, assignmentId, sessionId, board } = req.body;

    // If a file was uploaded via multer, use that path. Otherwise use the provided URL.
    const finalFileUrl = req.file ? `/uploads/${req.file.filename}` : externalUrl;

    if (!finalFileUrl) {
      console.error('ERROR: Missing fileUrl or uploaded file');
      return res.status(400).json({ message: 'File or link is required' });
    }

    const material = await Material.create({
      teacherId: req.user._id,
      assignmentId,
      sessionId: sessionId || null,
      classLevel,
      subjectName,
      title,
      fileUrl: finalFileUrl,
      type: type || 'notes',
      board: board || 'TS Board'
    });

    res.status(201).json({
      message: 'Material uploaded successfully!',
      material
    });
  } catch (error) {
    console.error('SERVER ERROR (Upload Material):', error);
    next(error);
  }
};

// @desc    Get teacher's materials
// @route   GET /api/teacher/materials
// @access  Teacher
exports.getMaterials = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const materials = await Material.find({}).sort({ createdAt: -1 });
      return res.status(200).json(materials);
    }

    const teacherId = req.user._id;
    const teacher = await User.findById(teacherId);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const assignments = teacher.assignedSubjects || [];
    
    const queryConditions = assignments.map(a => {
      const cond = { classLevel: a.classLevel };
      if (a.assignmentType !== 'bundle') {
        cond.subjectName = a.subjectName;
      }
      if (a.board) {
        cond.board = a.board;
      }
      return cond;
    });

    const query = {
      $or: [
        { teacherId },
        ...(queryConditions.length > 0 ? [{
          teacherId: null, // Admin materials
          $or: queryConditions
        }] : [])
      ]
    };

    const materials = await Material.find(query).sort({ createdAt: -1 }).populate('teacherId', 'name email');
    res.status(200).json(materials);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete teacher's material
// @route   DELETE /api/teacher/materials/:id
// @access  Teacher
exports.deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findOneAndDelete({ _id: req.params.id, teacherId: req.user._id });
    if (!material) return res.status(404).json({ message: 'Material not found or unauthorized' });
    res.status(200).json({ message: 'Material deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle material visibility
// @route   PATCH /api/teacher/materials/:id/visibility
// @access  Teacher
exports.toggleMaterialVisibility = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    
    // Check if authorized
    let authorized = false;
    if (material.teacherId && material.teacherId.toString() === req.user._id.toString()) {
      authorized = true;
    } else if (!material.teacherId) {
      // It's Admin material, check if teacher is assigned to this class and subject
      const teacher = await User.findById(req.user._id);
      const assignments = teacher.assignedSubjects || [];
      authorized = assignments.some(a => 
        (a.assignmentType === 'bundle' && a.classLevel === material.classLevel) ||
        (a.classLevel === material.classLevel && a.subjectName === material.subjectName)
      );
    }
    
    if (!authorized) {
       return res.status(403).json({ message: 'Not authorized to toggle this material' });
    }

    material.isVisible = !material.isVisible;
    await material.save();
    res.status(200).json({ message: `Material ${material.isVisible ? 'shown' : 'hidden'}`, isVisible: material.isVisible });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teacher's earnings/payout history
// @route   GET /api/teacher/earnings
// @access  Teacher
exports.getEarnings = async (req, res, next) => {
  try {
    const teacherId = req.user._id;
    const teacher = await User.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const { rateA = 0, rateB = 0 } = teacher.payRates || {};
    
    // Default rate mapping if rates are totally 0 (fallback)
    const activeRateA = rateA > 0 ? rateA : 500; // Let's use 500 per hr as fallback if admin has not set
    const activeRateB = rateB > 0 ? rateB : 600; // Let's use 600 per hr for Inter as fallback

    const LiveSession = require('../models/LiveSession');
    const sessions = await LiveSession.find({ teacherId, status: 'ended' });

    const earningsMap = {};

    sessions.forEach(session => {
       const start = new Date(session.startTime);
       const end = new Date(session.endTime);
       const month = start.getMonth() + 1; // 1-12
       const year = start.getFullYear();
       
       const key = `${year}-${month}`;
       if (!earningsMap[key]) {
          earningsMap[key] = {
             _id: key, 
             month,
             year,
             totalSessions: 0,
             totalHours: 0,
             totalAmount: 0,
             status: 'Pending', 
             transactionId: null
          };
       }

       // Duration in hours
       const durationMs = end - start;
       let hours = durationMs > 0 ? (durationMs / (1000 * 60 * 60)) : 1;

       // Determine rate based on classLevel
       let rate = activeRateA;
       const level = session.classLevel ? session.classLevel.toLowerCase() : '';
       if (level.includes('11') || level.includes('12') || level.includes('inter')) {
          rate = activeRateB;
       }

       let amount = rate; // Fixed amount per session, regardless of duration
       
       earningsMap[key].totalSessions += 1;
       earningsMap[key].totalHours += hours;
       earningsMap[key].totalAmount += amount;
    });

    let generatedPayouts = Object.values(earningsMap);
    
    // Merge actual payouts from Payout model
    const Payout = require('../models/Payout');
    const actualPayouts = await Payout.find({ teacherId }).lean();
    
    actualPayouts.forEach(actual => {
       const key = `${actual.year}-${actual.month}`;
       const generated = earningsMap[key];
       if (generated) {
           generated.status = actual.status;
           generated.transactionId = actual.transactionId;
           // Override totals with actual payout totals to ensure exact match with Admin DB
           generated.totalAmount = actual.totalAmount;
           generated.totalSessions = actual.totalSessions;
           generated.totalHours = actual.totalHours;
       } else {
           generatedPayouts.push(actual);
       }
    });

    generatedPayouts = generatedPayouts.map(p => ({
        ...p,
        totalHours: parseFloat(Number(p.totalHours).toFixed(2)),
        totalAmount: Math.round(p.totalAmount)
    })).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
    });

    res.status(200).json(generatedPayouts);
  } catch (error) {
    next(error);
  }
};

