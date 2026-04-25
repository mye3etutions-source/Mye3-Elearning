const User = require('../models/User');
const LiveSession = require('../models/LiveSession');
const Recording = require('../models/Recording');
const Material = require('../models/Material');
const Transaction = require('../models/Transaction');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const ClassBundle = require('../models/ClassBundle');
const { sendEmail } = require('../utils/mailer');

// @desc    Get all available classes and subjects for the store
// @route   GET /api/student/catalog
// @access  Student
exports.getCatalog = async (req, res, next) => {
  try {
    // Determine the board to filter by
    // 1. Check query param (e.g. /student/catalog?board=AP Board)
    // 2. Check logged in user's profile
    let boardFilter = req.query.board;
    if (!boardFilter && req.user) {
      boardFilter = req.user.board;
    }

    const query = { isActive: true };
    if (boardFilter) {
      query.board = boardFilter;
    }

    const [classes, subjects] = await Promise.all([
      ClassBundle.find(query).sort({ className: 1 }),
      Subject.find(query).sort({ classLevel: 1 })
    ]);

    const catalog = [
      ...classes.map(c => ({
        id: c._id,
        className: c.className,
        classLevel: c.className.toLowerCase().includes('inter first') ? '11' : 
                    c.className.toLowerCase().includes('inter second') ? '12' : 
                    c.className.replace(/\D/g, ''),
        name: `${c.className || 'Unknown Class'} (All Subjects)`,
        type: 'bundle',
        pricing: c.pricing,
        board: c.board,
        subjects: c.subjects || []
      })),
      ...subjects.map(s => ({
        id: s._id,
        className: `Class ${s.classLevel}`, 
        name: s.name || 'Unknown Subject',
        type: 'subject',
        pricing: s.pricing,
        classLevel: s.classLevel ? String(s.classLevel) : '',
        board: s.board || 'TS Board',
      }))
    ];

    res.status(200).json(catalog);
  } catch (error) {
    console.error('CATALOG ERROR FAIL:', error);
    next(error);
  }
};

// @desc    Process mock payment success
// @route   POST /api/student/mock-payment-success
// @access  Student
exports.processMockPayment = async (req, res, next) => {
  try {
    const { amount, packageName, referenceId, type, subscriptionType, items } = req.body;

    const student = await User.findById(req.user._id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (!student.activeSubscriptions) student.activeSubscriptions = [];
    let itemsToProcess = [];

    if (items && Array.isArray(items)) {
      itemsToProcess = items;
    } else {
      itemsToProcess = [{ amount, packageName, referenceId, type, subscriptionType }];
    }

    for (const item of itemsToProcess) {
      const { amount: itemAmount, packageName: itemPackageName, referenceId: itemRefId, type: itemType, subscriptionType: itemSubType } = item;

      // Calculate duration in months
      let monthsToAdd = 1;
      if (itemSubType === 'threeMonths') monthsToAdd = 3;
      else if (itemSubType === 'sixMonths') monthsToAdd = 6;
      else if (itemSubType === 'twelveMonths') monthsToAdd = 12;

      // Create the transaction record
      await Transaction.create({
        studentId: req.user._id,
        amount: itemAmount || 0,
        packageName: itemPackageName,
        referenceId: String(itemRefId),
        type: itemType || 'bundle',
        status: 'success'
      });

      const existingSubIndex = student.activeSubscriptions.findIndex(sub =>
        String(sub.referenceId) === String(itemRefId)
      );

      let baseDate = new Date(); // Default: Start from today
      if (existingSubIndex > -1) {
        const currentExpiry = new Date(student.activeSubscriptions[existingSubIndex].expiryDate);
        if (currentExpiry > new Date()) {
          baseDate = currentExpiry; // Additive: Start from existing expiry
        }
      }

      const expiryDate = new Date(baseDate);
      expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);

      if (existingSubIndex > -1) {
        // Additive / Extension
        student.activeSubscriptions[existingSubIndex].expiryDate = expiryDate;
        student.activeSubscriptions[existingSubIndex].subscriptionType = itemSubType || 'full';
      } else {
        // New Enrollment
        student.activeSubscriptions.push({
          name: item.courseName || itemPackageName.split(' - ')[0], // Exact name including class level
          type: itemType || 'bundle',
          subscriptionType: itemSubType || 'full',
          referenceId: String(itemRefId),
          expiryDate,
          purchaseDate: new Date()
        });
      }
    }

    // Explicitly mark modified for mixed/array types
    student.markModified('activeSubscriptions');
    await student.save();

    // Send Payment Success Email
    if (student.email) {
      const itemsListHtml = itemsToProcess.map(item => `<li><strong>${item.packageName || item.courseName}</strong> (₹${item.amount})</li>`).join('');
      const totalAmount = itemsToProcess.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      
      sendEmail({
        to: student.email,
        subject: 'Payment Successful - Welcome to your new class!',
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #002147;">Payment Successful! 🎉</h2>
            <p>Dear ${student.name},</p>
            <p>Thank you for your purchase. Your payment of <strong>₹${totalAmount}</strong> has been received successfully.</p>
            <h3>You now have access to:</h3>
            <ul>
              ${itemsListHtml}
            </ul>
            <p>You can access your live classes, recordings, and study materials from your student dashboard immediately.</p>
            <br/>
            <p>Happy Learning!</p>
            <p><strong>Mye3 e-Tuitions Team</strong></p>
          </div>
        `
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment simulated successfully!',
      activeSubscriptions: student.activeSubscriptions
    });
  } catch (error) {
    console.error('MOCK PAYMENT CRASHED:', error);
    next(error);
  }
};

// @desc    Get student's active and expired subscriptions
// @route   GET /api/student/subscriptions
// @access  Student
exports.getMySubscriptions = async (req, res, next) => {
  try {
    // Admin bypass: return all active class bundles and subjects for testing
    if (req.user.role === 'admin') {
      const [classes, subjects] = await Promise.all([
        ClassBundle.find({ isActive: true }),
        Subject.find({ isActive: true })
      ]);
      const allSubs = [
        ...classes.map(c => ({ name: c.className, type: 'bundle', subscriptionType: 'full', expiryDate: new Date('2099-12-31') })),
        ...subjects.map(s => ({ name: s.name, type: 'subject', subscriptionType: 'single', expiryDate: new Date('2099-12-31') }))
      ];
      return res.status(200).json(allSubs);
    }

    const student = await User.findById(req.user._id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    res.status(200).json(student.activeSubscriptions || []);
  } catch (error) {
    next(error);
  }
};

// @desc    Get active subscriptions for the learning grid (Filtered by Expiry)
// @route   GET /api/student/my-learning
// @access  Student
exports.getMyLearning = async (req, res, next) => {
  try {
    const now = new Date();

    // Helper function to expand a bundle name into multiple subject entries
    const expandBundle = async (item) => {
      if (item.type !== 'bundle' || item.isExpired) {
        if (item.type === 'subject') {
           const parts = item.name.split(' - ');
           if (parts.length === 2) {
             return [{
               ...item.toObject ? item.toObject() : item,
               name: parts[1].trim(),
               originalBundleName: `${parts[0].trim()} Subjects`
             }];
           }
        }
        return [item];
      }

      const classLevelNum = parseInt(item.name.replace(/\D/g, ''));
      if (!classLevelNum) return [item];

      let subjects = await Subject.find({ classLevel: classLevelNum, isActive: true }).sort({ name: 1 });

      // FALLBACK: If no subjects in DB for this class level, provide defaults for 6-10
      if (subjects.length === 0 && classLevelNum >= 6 && classLevelNum <= 10) {
        const defaults = ['Mathematics', 'Science', 'Social Studies', 'English'];
        subjects = defaults.map(name => ({
          name,
          classLevel: classLevelNum,
          isActive: true,
          _id: `fallback-${classLevelNum}-${name}` // Mock ID
        }));
      }

      if (subjects.length === 0) {
        return [{
          ...item.toObject ? item.toObject() : item,
          originalBundleName: item.type === 'bundle' ? item.name : undefined
        }];
      }

      return subjects.map(s => ({
        ...item.toObject ? item.toObject() : item,
        name: s.name,
        originalBundleName: item.name,
        type: 'subject', // Present it as a subject to the frontend
        subscriptionType: item.subscriptionType || 'full',
        isExpandedFromBundle: true
      }));
    };

    // Admin bypass: expand all active bundles and return individual subjects
    if (req.user.role === 'admin') {
      const [classes, subjects] = await Promise.all([
        ClassBundle.find({ isActive: true }),
        Subject.find({ isActive: true })
      ]);

      const bundleItems = classes.map(c => ({ name: c.className, type: 'bundle', isExpired: false, expiryDate: new Date('2099-12-31') }));
      const subjectItems = subjects.map(s => ({ name: s.name, type: 'subject', isExpired: false, expiryDate: new Date('2099-12-31') }));

      const expandedBundles = await Promise.all(bundleItems.map(expandBundle));
      const flattenedLearning = [...expandedBundles.flat(), ...subjectItems];

      return res.status(200).json(flattenedLearning);
    }

    const student = await User.findById(req.user._id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const activeLearning = (student.activeSubscriptions || []).map(sub => ({
      ...sub.toObject ? sub.toObject() : sub,
      isExpired: now > new Date(sub.expiryDate)
    }));

    res.status(200).json(activeLearning);
  } catch (error) {
    next(error);
  }
};

// @desc    Get active and upcoming live sessions for enrolled courses
// @route   GET /api/student/live-alerts
// @access  Student
exports.getLiveAlerts = async (req, res, next) => {
  try {
    // Admin bypass: return all live and upcoming sessions for testing
    if (req.user.role === 'admin') {
      const liveSessions = await LiveSession.find({
        status: { $in: ['live', 'upcoming', 'ended'] }
      }).populate('teacherId', 'name').sort({ startTime: -1 });
      return res.status(200).json(liveSessions);
    }

    const student = await User.findById(req.user._id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const activeSubs = (student.activeSubscriptions || []).filter(sub => new Date() < new Date(sub.expiryDate));
    
    // Construct strict OR conditions to prevent crossing class boundaries (e.g. Class 11 Physics vs Class 12 Physics)
    const orConditions = activeSubs.map(sub => {
      if (sub.type === 'subject') {
        // e.g. "Class 12 - Physics" -> classLevel: "Class 12", subjectName: "Physics"
        const parts = sub.name.split(' - ');
        if (parts.length === 2) {
          return { classLevel: parts[0].trim(), subjectName: parts[1].trim() };
        } else {
          return { subjectName: sub.name }; // Fallback for bad data
        }
      } else {
        // e.g. "Class 10 (All Subjects)" -> classLevel: "Class 10"
        const cleanBundle = sub.name
          .replace(' (All Subjects)', '')
          .replace(' (Full Course)', '')
          .replace(' (Full Bundle)', '')
          .replace(' - Full Bundle', '')
          .trim();
        return { classLevel: cleanBundle };
      }
    });

    if (orConditions.length === 0) return res.status(200).json([]);

    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    // Board filter: match sessions that have no board OR match student's board
    const boardFilter = student.board
      ? { $or: [{ board: student.board }, { board: { $exists: false } }, { board: null }] }
      : {};

    const liveSessions = await LiveSession.find({
      ...boardFilter,
      $or: [
        { status: { $in: ['live', 'upcoming'] } },
        { status: 'ended', updatedAt: { $gte: yesterday } }
      ],
      $and: [ { $or: orConditions } ]
    }).populate('teacherId', 'name').sort({ status: 1, startTime: 1 });

    // Fetch materials for each session
    const sessionsWithMaterials = await Promise.all(liveSessions.map(async (session) => {
      const materials = await Material.find({ sessionId: session._id });
      return {
        ...session.toObject(),
        materials
      };
    }));

    res.status(200).json(sessionsWithMaterials);
  } catch (error) {
    next(error);
  }
};

// @desc    Get content for a specific course (Recordings & Materials)
// @route   GET /api/student/content/:courseName
// @access  Student
exports.getCourseContent = async (req, res, next) => {
  try {
    const { courseName } = req.params;
    const student = await User.findById(req.user._id);

    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Clean names (e.g., "Class 10 (All Subjects)" -> "Class 10")
    const cleanName = courseName
      .replace(' (Full Course)', '')
      .replace(' (All Subjects)', '')
      .replace(' (Full Bundle)', '');
    const classLevelMatch = courseName.match(/Class \d+/i)?.[0];

    // 0. Lookup subject to find its class level if it's a direct subject name
    let subjectClassLevel = null;
    const subjectEntry = await Subject.findOne({ name: courseName });
    if (subjectEntry) {
      subjectClassLevel = `Class ${subjectEntry.classLevel}`;
    }

    // Access Logic:
    // 1. Check for Active "Full Course", "All Subjects", or any Duration Bundle for this grade
    const fullCourseSub = student.activeSubscriptions.find(sub => {
      const subNameClean = sub.name.replace(' (All Subjects)', '').replace(' (Full Course)', '').replace(' (Full Bundle)', '').trim();
      const isActive = new Date() < new Date(sub.expiryDate);

      // Match if: 
      // - Exact name match
      // - Sub name is "Class X" and course is in that class
      // - Name includes target
      const nameMatch = subNameClean === cleanName || sub.name === courseName || sub.name.includes(cleanName);
      const bundleMatch = (classLevelMatch && subNameClean === classLevelMatch) || (subjectClassLevel && subNameClean === subjectClassLevel);

      return isActive && (nameMatch || bundleMatch) && (sub.type === 'bundle' || sub.subscriptionType === 'full' || sub.name.includes('All Subjects'));
    });

    // 2. Check for Active "Single Subject" for this specific subject
    const singleSubjectSub = student.activeSubscriptions.find(sub => {
      const subNameClean = sub.name.replace(' (All Subjects)', '').replace(' (Full Course)', '').replace(' (Full Bundle)', '').trim();
      const isActive = new Date() < new Date(sub.expiryDate);
      
      // If it's a subject, name might be "Class 12 - Physics"
      const isDirectMatch = subNameClean === cleanName || sub.name === courseName;
      const isPartMatch = sub.type === 'subject' && sub.name.split(' - ')[1]?.trim() === cleanName;
      
      return isActive && (isDirectMatch || isPartMatch) && (sub.subscriptionType === 'single' || sub.type === 'subject');
    });

    // BYPASS FOR ADMIN/TEACHER OR MOCK COURSES
    const isBypass = req.user.role === 'admin' || req.user.role === 'teacher' || courseName.includes('(Mock)');

    if (!fullCourseSub && !singleSubjectSub && !isBypass) {
      return res.status(403).json({
        message: 'No active subscription found. Subscribe to the All Subjects package or this individual subject to unlock.',
        type: 'buy'
      });
    }

    // Fetch recordings and materials using the clean name
    const recordings = await Recording.find({
      $or: [
        { classLevel: cleanName },
        { subjectName: cleanName },
        { classLevel: courseName }, // Backup for legacy
        { subjectName: courseName }  // Backup for legacy
      ]
    }).sort({ createdAt: -1 });

    const boardFilter = student.board
      ? { $or: [{ board: student.board }, { board: { $exists: false } }, { board: null }] }
      : {};

    const materials = await Material.find({
      ...boardFilter,
      isVisible: true,
      $or: [
        { classLevel: cleanName },
        { subjectName: cleanName },
        { classLevel: courseName },
        { subjectName: courseName }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({ recordings, materials });
  } catch (error) {
    next(error);
  }
};
// @desc    Get materials for a specific assignment ID
// @route   GET /api/student/materials/:assignmentId
// @access  Student
exports.getMaterialsByAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const materials = await Material.find({ assignmentId }).sort({ createdAt: -1 });
    res.status(200).json(materials);
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's transaction history
// @route   GET /api/student/transactions
// @access  Student
exports.getMyTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ studentId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    next(error);
  }
};
// @desc    Get all materials across all active subscriptions
// @route   GET /api/student/all-materials
// @access  Student
exports.getAllMaterials = async (req, res, next) => {
  try {
    const student = await User.findById(req.user._id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const activeSubs = (student.activeSubscriptions || []).filter(sub => new Date() < new Date(sub.expiryDate));

    // Normalize names to match Materials
    const enrolledNames = activeSubs.map(sub => {
      const clean = sub.name
        .replace(' (All Subjects)', '')
        .replace(' (Full Course)', '')
        .replace(' (Full Bundle)', '')
        .replace(' - Full Bundle', '');
      return [sub.name, clean];
    }).flat();

    const uniqueEnrolledNames = [...new Set(enrolledNames)];

    const boardFilter = student.board
      ? { $or: [{ board: student.board }, { board: { $exists: false } }, { board: null }] }
      : {};

    const materials = await Material.find({
      ...boardFilter,
      isVisible: true,
      $or: [
        { classLevel: { $in: uniqueEnrolledNames } },
        { subjectName: { $in: uniqueEnrolledNames } }
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json(materials);
  } catch (error) {
    console.error('FETCH_ALL_MATERIALS_FAIL:', error);
    next(error);
  }
};
