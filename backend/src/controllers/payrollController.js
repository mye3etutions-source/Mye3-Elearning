const User = require('../models/User');
const LiveSession = require('../models/LiveSession');
const Payout = require('../models/Payout');

// Utility to decide which rate applies based on class level
const getRateForClassLevel = (classLevel, payRates) => {
  if (!payRates) return 0;
  const cl = (classLevel || '').toLowerCase();
  if (cl.includes('11') || cl.includes('12') || cl.includes('inter')) {
    return payRates.rateB || 0;
  }
  return payRates.rateA || 0;
};

// @desc    Calculate or Refresh Payouts for a specific month
// @route   POST /api/admin/payroll/calculate
// @access  Admin
exports.calculatePayouts = async (req, res, next) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({ message: 'Month and Year are required' });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    // Start and end dates of the month for querying
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

    // Get all teachers
    const teachers = await User.find({ role: 'teacher' });

    const results = [];

    for (const teacher of teachers) {
      // Find all ENDED sessions for this teacher in this month
      const sessions = await LiveSession.find({
        teacherId: teacher._id,
        status: 'ended',
        startTime: { $gte: startDate, $lte: endDate }
      });

      const totalSessions = sessions.length;
      if (totalSessions === 0) continue;

      let totalAmount = 0;
      let totalHours = 0;

      sessions.forEach(session => {
        const rate = getRateForClassLevel(session.classLevel, teacher.payRates);
        // Per-session fixed rate (not hourly)
        totalAmount += rate;
        // Calculate hours for reference only
        if (session.endTime && session.startTime) {
          const durationMs = new Date(session.endTime) - new Date(session.startTime);
          totalHours += durationMs / (1000 * 60 * 60);
        }
      });

      totalHours = Math.round(totalHours * 10) / 10;

      // Update or Create Payout Document
      let payout = await Payout.findOne({ teacherId: teacher._id, month: monthNum, year: yearNum });

      if (payout) {
        if (payout.status === 'Pending') {
          payout.totalSessions = totalSessions;
          payout.totalHours = totalHours;
          payout.totalAmount = totalAmount;
          await payout.save();
        }
      } else {
        payout = await Payout.create({
          teacherId: teacher._id,
          month: monthNum,
          year: yearNum,
          totalSessions,
          totalHours,
          totalAmount,
          status: 'Pending'
        });
      }

      results.push(payout);
    }

    res.status(200).json({
      message: `Payouts calculated for ${month}/${year}`,
      payouts: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payouts
// @route   GET /api/admin/payroll
// @access  Admin
exports.getPayouts = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const query = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const payouts = await Payout.find(query)
      .populate('teacherId', 'name email')
      .sort({ year: -1, month: -1, createdAt: -1 });

    res.status(200).json(payouts);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark Payout as Paid
// @route   PUT /api/admin/payroll/:id/pay
// @access  Admin
exports.markPaid = async (req, res, next) => {
  try {
    const { paymentMode, transactionId, note, proofImage } = req.body;

    const payout = await Payout.findById(req.params.id);
    if (!payout) return res.status(404).json({ message: 'Payout not found' });

    if (payout.status === 'Paid') {
      return res.status(400).json({ message: 'Payout is already marked as Paid' });
    }

    if (paymentMode === 'Online' && !transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required for Online payments' });
    }

    payout.status = 'Paid';
    payout.paymentMode = paymentMode;
    payout.transactionId = paymentMode === 'Online' ? transactionId : undefined;
    payout.note = paymentMode === 'Cash' ? note : undefined;
    payout.proofImage = proofImage;
    
    await payout.save();

    res.status(200).json({ message: 'Payout marked as paid', payout });
  } catch (error) {
    next(error);
  }
};
