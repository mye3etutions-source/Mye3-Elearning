const Class = require('../models/Class');
const Subject = require('../models/Subject');
const User = require('../models/User');
const Payment = require('../models/Payment');
const ClassBundle = require('../models/ClassBundle');
const Material = require('../models/Material');
const Transaction = require('../models/Transaction');
const LiveSession = require('../models/LiveSession');
const RecurringSchedule = require('../models/RecurringSchedule');
const { generateSessionsFromTemplate, getEndOfNextMonth } = require('../cron/recurringScheduler');

exports.updatePricing = async (req, res, next) => {
  try {
    const { type, id, newPrice } = req.body;

    if (type === 'bundle') {
      const classItem = await Class.findByIdAndUpdate(id, { bundlePrice: newPrice }, { new: true });
      return res.status(200).json(classItem);
    } else if (type === 'subject') {
      const subjectItem = await Subject.findByIdAndUpdate(id, { individualPrice: newPrice }, { new: true });
      return res.status(200).json(subjectItem);
    } else {
      return res.status(400).json({ message: 'Invalid type' });
    }
  } catch (error) {
    next(error);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'Student' });
    const totalTeachers = await User.countDocuments({ role: 'Teacher' });

    const payments = await Payment.find({ status: 'captured' });
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    res.status(200).json({
      totalStudents,
      totalTeachers,
      totalRevenue,
      transactionsCount: payments.length
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Get all class bundles (6-10)
// @route   GET /api/admin/classes
// @access  Admin
exports.getClassBundles = async (req, res, next) => {
  try {
    const bundles = await ClassBundle.find({}).sort({ className: 1 });
    res.status(200).json(bundles);
  } catch (error) {
    next(error);
  }
};

// @desc    Update class bundle price
// @route   PUT /api/admin/classes/:id
// @access  Admin
exports.updateClassBundlePrice = async (req, res, next) => {
  try {
    const { price } = req.body;
    const bundle = await ClassBundle.findByIdAndUpdate(
      req.params.id,
      { price: Number(price) },
      { new: true, runValidators: true }
    );

    if (!bundle) {
      return res.status(404).json({ message: 'Bundle not found' });
    }

    res.status(200).json(bundle);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subjects (11-12)
// @route   GET /api/admin/subjects
// @access  Admin
exports.getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({}).sort({ classLevel: 1 });
    res.status(200).json(subjects);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new subject
// @route   POST /api/admin/subjects
// @access  Admin
exports.addSubject = async (req, res, next) => {
  try {
    const { name, classLevel, pricing, board } = req.body;
    const subject = await Subject.create({
      name,
      classLevel: Number(classLevel),
      pricing,
      board
    });
    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a subject
// @route   PUT /api/admin/subjects/:id
// @access  Admin
exports.updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.status(200).json(subject);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subject
// @route   DELETE /api/admin/subjects/:id
// @access  Admin
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.status(200).json({ message: 'Subject removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all teachers (for dropdown)
// @route   GET /api/admin/teachers-list
// @access  Admin
exports.getTeachersList = async (req, res, next) => {
  try {
    const teachers = await User.find({
      $or: [{ role: 'teacher' }, { _id: req.user._id }]
    }).select('-password').sort({ createdAt: -1 });
    res.status(200).json(teachers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get teachers filtered by assignment (classLevel + subjectName)
// @route   GET /api/admin/teachers-for-subject?classLevel=Class 10&subjectName=Maths
// @access  Admin
exports.getTeachersForSubject = async (req, res, next) => {
  try {
    const { classLevel, subjectName } = req.query;

    // Build match filter for subject-specific teachers
    const matchFilter = { role: 'teacher' };
    if (classLevel || subjectName || req.query.board) {
      matchFilter.assignedSubjects = {
        $elemMatch: {
          ...(classLevel ? { classLevel } : {}),
          ...(subjectName ? { subjectName } : {}),
          ...(req.query.board ? { board: req.query.board } : {})
        }
      };
    }

    let teachers = await User.find(matchFilter)
      .select('name email assignedSubjects')
      .sort({ name: 1 });

    // Fallback: if no subject-specific teachers found, return ALL teachers
    if (teachers.length === 0) {
      teachers = await User.find({ role: 'teacher' })
        .select('name email assignedSubjects')
        .sort({ name: 1 });
    }

    res.status(200).json(teachers);
  } catch (error) {
    next(error);
  }
};

// @desc    Assign subject to teacher
// @route   PUT /api/admin/teachers/:id/assign
// @access  Admin
exports.assignSubjectToTeacher = async (req, res, next) => {
  try {
    const { assignments } = req.body;
    const teacher = await User.findById(req.params.id);

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Support both single assignment and batch assignments
    const assignmentsToAdd = Array.isArray(assignments) ? assignments : [req.body];

    assignmentsToAdd.forEach(a => {
      // Avoid exact duplicates (now including board)
      const exists = teacher.assignedSubjects.some(
        existing => 
          existing.classLevel === a.classLevel && 
          existing.subjectName === a.subjectName &&
          existing.board === a.board
      );

      if (!exists) {
        teacher.assignedSubjects.push({
          assignmentType: a.assignmentType,
          classLevel: a.classLevel,
          subjectName: a.subjectName,
          subjectId: a.subjectId || null,
          board: a.board || null
        });
      }
    });

    await teacher.save();
    res.status(200).json(teacher);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove assignment from teacher
// @route   DELETE /api/admin/teachers/:id/assign/:assignmentId
// @access  Admin
exports.removeAssignmentFromTeacher = async (req, res, next) => {
  try {
    const teacher = await User.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    teacher.assignedSubjects = teacher.assignedSubjects.filter(
      a => a._id.toString() !== req.params.assignmentId
    );

    await teacher.save();
    res.status(200).json(teacher);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Admin
exports.getStudentsList = async (req, res, next) => {
  try {
    const students = await User.find({
      $or: [{ role: 'student' }, { _id: req.user._id }]
    }).select('-password').sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin manually add student
// @route   POST /api/admin/students
// @access  Admin
exports.addStudent = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const student = await User.create({
      name,
      email,
      password,
      role: 'student'
    });

    res.status(201).json(student);
  } catch (error) {
    next(error);
  }
};

// @desc    Manually assign subscription to student
// @route   PUT /api/admin/students/assign-subscription/:id
// @access  Admin
exports.assignSubscription = async (req, res, next) => {
  try {
    const { type, referenceId, name, durationDays } = req.body;
    const student = await User.findById(req.params.id);

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(durationDays));

    student.activeSubscriptions.push({
      type,
      referenceId,
      name,
      expiryDate
    });

    await student.save();
    res.status(200).json(student);
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const studentCount = await User.countDocuments({ role: 'student' });
    const teacherCount = await User.countDocuments({ role: 'teacher' });

    const liveSessions = await LiveSession.find({
      status: { $in: ['live', 'upcoming'] }
    }).populate('teacherId', 'name').sort({ status: 1, startTime: 1 });
    const liveCount = liveSessions.length;

    // Revenue logic - Sum of all successful payments/transactions
    const [txs, payments] = await Promise.all([
      Transaction.find({ status: 'success' }).populate('studentId', 'name email').sort({ date: -1 }),
      Payment.find({ status: 'captured' }).populate('userId', 'name email').sort({ createdAt: -1 })
    ]);

    const totalRevenue = txs.reduce((acc, curr) => acc + (curr.amount || 0), 0) +
      payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // --- CHART DATA LOGIC: Last 7 Days ---
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

      const dailyTx = txs.filter(t => new Date(t.date || t.createdAt).toDateString() === date.toDateString());
      const dailyPay = payments.filter(p => new Date(p.createdAt).toDateString() === date.toDateString());

      const dailySum = dailyTx.reduce((acc, curr) => acc + (curr.amount || 0), 0) +
        dailyPay.reduce((acc, curr) => acc + (curr.amount || 0), 0);

      chartData.push({ name: dateStr, revenue: dailySum });
    }

    // Normalize and take top 5 for "Recent Transactions"
    const normalizedPayments = payments.map(p => ({
      _id: p._id,
      name: p.userId?.name || 'Manual Grant',
      packageName: p.subscriptionDetails?.type === 'bundle' ? 'Class Bundle' : 'Individual Subject',
      amount: `₹${(p.amount || 0).toLocaleString()}`,
      status: 'SUCCESS',
      date: p.createdAt
    }));

    const normalizedtxs = txs.map(t => ({
      _id: t._id,
      name: t.studentId?.name || 'Manual Grant',
      packageName: t.packageName || 'Unknown Package',
      amount: `₹${(t.amount || 0).toLocaleString()}`,
      status: t.status ? (t.status === 'success' ? 'SUCCESS' : t.status.toUpperCase()) : 'PENDING',
      date: t.date || t.createdAt
    }));

    const recentTransactions = [...normalizedtxs, ...normalizedPayments]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 5);

    // Expiring soon logic
    const now = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(now.getDate() + 30);

    const expiringSoonCount = await User.countDocuments({
      role: 'student',
      'activeSubscriptions.expiryDate': { $gte: now, $lte: thirtyDaysLater }
    });

    res.status(200).json({
      totalStudents: studentCount,
      totalTeachers: teacherCount,
      totalRevenue,
      expiringSoon: expiringSoonCount,
      liveSessionsCount: liveCount,
      activeSessions: liveSessions.slice(0, 5),
      recentTransactions,
      revenueChartData: chartData
    });
  } catch (error) {
    console.error('DASHBOARD ERROR FAIL:', error);
    next(error);
  }
};

// @desc    Extend student subscription
// @route   PUT /api/admin/students/:id/extend
// @access  Admin
exports.extendSubscription = async (req, res, next) => {
  try {
    const { subscriptionId, newExpiryDate } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: 'Student not found' });

    const subscription = user.activeSubscriptions.id(subscriptionId);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    subscription.expiryDate = newExpiryDate;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new teacher
// @route   POST /api/admin/teachers
// @access  Admin
exports.addTeacher = async (req, res, next) => {
  try {
    const { name, email, password, payRates } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const teacher = await User.create({
      name,
      email,
      password,
      payRates: payRates || { rateA: 0, rateB: 0 },
      role: 'teacher'
    });

    res.status(201).json({ _id: teacher._id, name: teacher.name, email: teacher.email });
  } catch (error) {
    next(error);
  }
};

// @desc    Update any user
// @route   PUT /api/admin/users/:id
// @access  Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password;
    if (req.body.payRates) user.payRates = req.body.payRates;

    const updatedUser = await user.save();
    res.status(200).json({ _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete any user
// @route   DELETE /api/admin/users/:id
// @access  Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User removed successfully' });
  } catch (error) {
    next(error);
  }
};
// @desc    Update subjects in a bundle
// @route   PUT /api/admin/classes/:id/subjects
// @access  Admin
exports.updateBundleSubjects = async (req, res, next) => {
  try {
    const { subjects } = req.body;
    const bundle = await ClassBundle.findByIdAndUpdate(
      req.params.id,
      { subjects },
      { new: true }
    );
    if (!bundle) return res.status(404).json({ message: 'Bundle not found' });
    res.status(200).json(bundle);
  } catch (error) {
    next(error);
  }
};

// @desc    Add study material globally (Admin)
// @route   POST /api/admin/materials
// @access  Admin
exports.addMaterial = async (req, res, next) => {
  try {
    const { assignmentId, classLevel, subjectName, title, type, fileUrl, board } = req.body;

    let finalFileUrl = fileUrl;

    // If a physical file was uploaded instead of an external link
    if (req.file) {
      finalFileUrl = `/uploads/${req.file.filename}`;
    }

    if (!finalFileUrl) {
      return res.status(400).json({ message: 'No file or URL provided' });
    }

    const material = await Material.create({
      assignmentId, // the segment ID (class or bundle id)
      classLevel,
      subjectName,
      title,
      type: type || 'notes',
      board: board || 'TS Board',
      fileUrl: finalFileUrl,
      teacherId: null // Admin upload has no specific teacher
    });

    res.status(201).json({ message: 'Material added successfully', material });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ALL materials globally (Admin)
// @route   GET /api/admin/materials/all
// @access  Admin
exports.getAllMaterials = async (req, res, next) => {
  try {
    const materials = await Material.find({})
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(materials);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete study material
// @route   DELETE /api/admin/materials/:id
// @access  Admin
exports.deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // NOTE: Optional feature, could use fs to delete physical file upload here if it's local.

    await material.deleteOne();
    res.status(200).json({ message: 'Material removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle material visibility (show/hide from students)
// @route   PATCH /api/admin/materials/:id/visibility
// @access  Admin
exports.toggleMaterialVisibility = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) return res.status(404).json({ message: 'Material not found' });
    material.isVisible = !material.isVisible;
    await material.save();
    res.status(200).json({ message: `Material ${material.isVisible ? 'shown' : 'hidden'}`, isVisible: material.isVisible });
  } catch (error) {
    next(error);
  }
};
// @desc    Update pricing for a class (All Subjects + Individual Subjects)
// @route   PUT /api/admin/classes/:id
// @access  Admin
exports.updateClassPricing = async (req, res, next) => {
  try {
    const { pricing, subjects, board, syllabus } = req.body;
    const updateData = {};
    if (pricing !== undefined) updateData.pricing = pricing;
    if (board !== undefined) updateData.board = board;
    if (subjects !== undefined) updateData.subjects = subjects;
    
    updateData.updatedAt = Date.now();

    const bundle = await ClassBundle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!bundle) return res.status(404).json({ message: 'All Subjects package not found' });
    res.status(200).json(bundle);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new class bundle
// @route   POST /api/admin/classes
// @access  Admin
exports.addClassBundle = async (req, res, next) => {
  try {
    const { className, board, pricing, subjects } = req.body;
    const bundle = await ClassBundle.create({
      className,
      board,
      pricing,
      subjects: subjects || []
    });
    res.status(201).json(bundle);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Active status for Class (6-10) or Subject (11-12)
// @route   PUT /api/admin/toggle-status
// @access  Admin
exports.toggleStatus = async (req, res, next) => {
  try {
    const { type, id, isActive } = req.body;
    let item;

    if (type === 'class') {
      item = await ClassBundle.findByIdAndUpdate(id, { isActive }, { new: true });
    } else {
      item = await Subject.findByIdAndUpdate(id, { isActive }, { new: true });
    }

    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

// @desc    Manual Grant access to student via email
// @route   POST /api/admin/grant-access
// @access  Admin
exports.grantManualAccess = async (req, res, next) => {
  try {
    const { email, type, referenceId, name, subscriptionType, durationDays } = req.body;
    const student = await User.findOne({ email });

    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student with this email not found' });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(durationDays || 365));

    student.activeSubscriptions.push({
      type, // 'bundle' or 'subject'
      referenceId,
      name,
      subscriptionType: subscriptionType || 'full',
      expiryDate
    });

    student.markModified('activeSubscriptions');
    await student.save();

    // Create Transaction Record for History
    await Transaction.create({
      studentId: student._id,
      amount: 0, // Manual grant is usually free or handled differently
      status: 'success',
      packageName: `Manual Grant: ${name}`,
      referenceId: referenceId,
      type: type,
      date: new Date()
    });

    // Emit global update for Admin Dashboard
    if (req.app.get('io')) {
      req.app.get('io').emit('admin-stats-update');
    }

    res.status(200).json({ message: `Access granted to ${student.name} successfully!` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all platform transactions
// @route   GET /api/admin/transactions
// @access  Admin
exports.getAllTransactions = async (req, res, next) => {
  try {
    const [txs, payments] = await Promise.all([
      Transaction.find({}).populate('studentId', 'name email').sort({ createdAt: -1 }),
      Payment.find({ status: 'captured' }).populate('userId', 'name email').sort({ createdAt: -1 })
    ]);

    // Normalize payments into transaction format
    const normalizedPayments = payments.map(p => ({
      _id: p._id,
      studentId: p.userId,
      amount: p.amount,
      status: 'success', // 'captured' means success
      packageName: p.subscriptionDetails.type === 'bundle' ? 'Class Bundle' : 'Individual Subject',
      type: p.subscriptionDetails.type,
      referenceId: p.subscriptionDetails.referenceIds[0],
      date: p.createdAt,
      isLegacy: true
    }));

    const allTransactions = [...txs, ...normalizedPayments].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json(allTransactions);
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule/Start Live Classes
// @route   POST /api/admin/live-sessions
// @access  Admin
exports.createLiveSession = async (req, res, next) => {
  try {
    const { sessions, isRecurring, recurringTemplate } = req.body;

    if (isRecurring && recurringTemplate) {
      // 1. Calculate duration and standard start time format
      const start = new Date(recurringTemplate.startTime);
      const end = new Date(recurringTemplate.endTime);
      if (end <= start) return res.status(400).json({ message: 'End time must be after start time' });
      
      const startHour = start.getHours();
      const startMinute = start.getMinutes();
      const durationMinutes = (end - start) / 60000;

      // 2. Prepare Template Document
      const templateData = {
        teacherId: recurringTemplate.teacherId,
        subjectId: recurringTemplate.subjectId,
        classLevel: recurringTemplate.classLevel,
        subjectName: recurringTemplate.subjectName,
        board: recurringTemplate.board || 'TS Board',
        title: recurringTemplate.title || `${recurringTemplate.subjectName} Live`,
        platform: recurringTemplate.platform,
        link: recurringTemplate.link,
        recurrenceType: 'daily',
        startHour,
        startMinute,
        durationMinutes,
        isActive: true
      };

      if (templateData.subjectId && !/^[0-9a-fA-F]{24}$/.test(templateData.subjectId)) {
        delete templateData.subjectId;
      }

      // 3. Save Recurring Schedule Config
      const template = await RecurringSchedule.create(templateData);

      // 4. Generate Sessions till End of Next Month Instantly
      const generateStartDate = new Date(start); // starts directly from the selected first day
      await generateSessionsFromTemplate(template, generateStartDate, getEndOfNextMonth());

      // Let connected clients know an update happened (could emit multiple if preferred)
      const io = req.app.get('io');
      if (io) io.emit('live-session-update', { type: 'bulk-recurring' });

      return res.status(201).json({ message: 'Infinite Recurring Schedule created! Sessions populated till next month.' });
    }

    // Validate if it's a bulk creation (sessions array) or single legacy format
    const sessionsToCreate = sessions || [req.body];

    // Use Upsert logic for each session to prevent duplicates
    const createdSessions = [];
    for (const s of sessionsToCreate) {
      if (!s.endTime) {
        return res.status(400).json({ message: 'endTime is required for live sessions.' });
      }

      const newStart = new Date(s.startTime);
      const newEnd = new Date(s.endTime);

      if (newEnd <= newStart) {
        return res.status(400).json({ message: 'End time must be after start time.' });
      }

      const matchUpsertCond = {
        classLevel: s.classLevel,
        subjectName: s.subjectName,
        startTime: newStart
      };

      // 1. Teacher Conflict
      const teacherConflict = await LiveSession.findOne({
        teacherId: s.teacherId,
        $or: [
          { startTime: { $lt: newEnd }, endTime: { $gt: newStart } }
        ],
        // Exclude the session that would be overwritten by upsert
        $nor: [matchUpsertCond]
      });

      if (teacherConflict) {
        return res.status(409).json({ message: `Teacher is already booked for another session during this time.` });
      }

      // 2. Class Level Conflict
      const classLevelConflict = await LiveSession.findOne({
        classLevel: s.classLevel,
        $or: [
          { startTime: { $lt: newEnd }, endTime: { $gt: newStart } }
        ],
        $nor: [matchUpsertCond]
      });

      if (classLevelConflict) {
        return res.status(409).json({ message: `A scheduled session already exists for ${s.classLevel} during this time.` });
      }

      const cleanSession = {
        ...s,
        title: s.title || `${s.subjectName} Live`,
        board: s.board || 'TS Board',
        status: 'upcoming'
      };
      if (s.subjectId && !/^[0-9a-fA-F]{24}$/.test(s.subjectId)) {
        delete cleanSession.subjectId;
      }

      // Upsert: Match by class, subject, and EXACT startTime
      const doc = await LiveSession.findOneAndUpdate(
        matchUpsertCond,
        cleanSession,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).populate('teacherId', 'name email');

      createdSessions.push(doc);
    }

    // Emit socket event for real-time notification
    const io = req.app.get('io');
    if (io) {
      createdSessions.forEach(session => {
        io.emit('live-session-update', { type: 'upsert', session });
      });
    }

    res.status(201).json({
      message: `${createdSessions.length} Live class(es) scheduled successfully!`,
      sessions: createdSessions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a Live Session
// @route   PUT /api/admin/live-sessions/:id
// @access  Admin
exports.updateLiveSession = async (req, res, next) => {
  try {
    const { title, platform, link, teacherId, startTime, endTime, classLevel, subjectName, subjectId, board } = req.body;

    const session = await LiveSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const newStart = new Date(startTime || session.startTime);
    const newEnd = new Date(endTime || session.endTime);

    if (newEnd <= newStart) {
      return res.status(400).json({ message: 'End time must be after start time.' });
    }

    const proposedClassLevel = classLevel || session.classLevel;
    const proposedTeacherId = teacherId || session.teacherId;

    // Conflict Check (excluding current session)
    const teacherConflict = await LiveSession.findOne({
      _id: { $ne: session._id },
      teacherId: proposedTeacherId,
      $or: [
        { startTime: { $lt: newEnd }, endTime: { $gt: newStart } }
      ]
    });

    if (teacherConflict) {
      return res.status(409).json({ message: `Teacher is already booked for another session during this time.` });
    }

    const classLevelConflict = await LiveSession.findOne({
      _id: { $ne: session._id },
      classLevel: proposedClassLevel,
      $or: [
        { startTime: { $lt: newEnd }, endTime: { $gt: newStart } }
      ]
    });

    if (classLevelConflict) {
      return res.status(409).json({ message: `A scheduled session already exists for ${proposedClassLevel} during this time.` });
    }

    session.title = title || `${subjectName || session.subjectName} Live`;
    session.platform = platform || session.platform;
    session.link = link || session.link;
    session.teacherId = teacherId || session.teacherId;
    session.startTime = startTime || session.startTime;
    session.endTime = endTime || session.endTime;
    session.classLevel = classLevel || session.classLevel;
    session.subjectName = subjectName || session.subjectName;
    if (board) session.board = board;

    if (subjectId) {
      session.subjectId = /^[0-9a-fA-F]{24}$/.test(subjectId) ? subjectId : undefined;
    }

    const updatedSession = await session.save();

    // Populate teacher info before emitting
    const populated = await LiveSession.findById(updatedSession._id).populate('teacherId', 'name email');

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.emit('live-session-update', { type: 'update', session: populated });

    res.status(200).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a Live Session
// @route   DELETE /api/admin/live-sessions/:id
// @access  Admin
exports.deleteLiveSession = async (req, res, next) => {
  try {
    const session = await LiveSession.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Emit socket event
    const io = req.app.get('io');
    if (io) io.emit('live-session-update', { type: 'delete', sessionId: req.params.id });

    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Live Sessions (Scheduled/Live for Roster)
// @route   GET /api/admin/live-sessions
// @access  Admin
exports.getAllLiveSessions = async (req, res, next) => {
  try {
    // Fetch from 2 days ago up to 45 days ahead (supports full month scheduling view)
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const fortyFiveDaysAhead = new Date();
    fortyFiveDaysAhead.setDate(fortyFiveDaysAhead.getDate() + 45);

    const sessions = await LiveSession.find({
      startTime: { $gte: twoDaysAgo, $lte: fortyFiveDaysAhead }
    })
      .populate('teacherId', 'name email')
      .sort({ startTime: 1 });
    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active recurring schedules
// @route   GET /api/admin/recurring-schedules
// @access  Admin
exports.getRecurringSchedules = async (req, res, next) => {
  try {
    const schedules = await RecurringSchedule.find({ isActive: true }).populate('teacherId', 'name email');
    res.status(200).json(schedules);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a recurring schedule template
// @route   PUT /api/admin/recurring-schedules/:id
// @access  Admin
exports.updateRecurringSchedule = async (req, res, next) => {
  try {
    const { teacherId, platform, link, title } = req.body;
    const schedule = await RecurringSchedule.findByIdAndUpdate(
      req.params.id,
      { teacherId, platform, link, title },
      { new: true }
    );
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    // Sync future sessions
    await LiveSession.updateMany(
      { recurringScheduleId: schedule._id, startTime: { $gt: new Date() }, status: 'upcoming' },
      { teacherId, platform, link, title }
    );

    res.status(200).json(schedule);
  } catch (error) {
    next(error);
  }
};

// @desc    Stop/Delete a recurring schedule
// @route   DELETE /api/admin/recurring-schedules/:id
// @access  Admin
exports.stopRecurringSchedule = async (req, res, next) => {
  try {
    const schedule = await RecurringSchedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    schedule.isActive = false;
    await schedule.save();

    // Delete future sessions to clean up
    await LiveSession.deleteMany({
      recurringScheduleId: schedule._id,
      startTime: { $gt: new Date() },
      status: 'upcoming'
    });

    res.status(200).json({ message: 'Recurring schedule stopped and future sessions removed.' });
  } catch (error) {
    next(error);
  }
};
