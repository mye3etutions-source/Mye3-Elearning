const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const PersonalSession = require('../models/PersonalSession');
const { sendEmail } = require('../utils/mailer');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn("WARN: Razorpay keys are missing from environment variables.");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

exports.getPaymentConfig = async (req, res, next) => {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const isMock = !keyId || keyId === 'testmode' || keyId.includes('YOUR_');
    const envValue = String(process.env.ENABLE_REAL_PAYMENT || '').toLowerCase().trim();
    const enableReal = envValue === 'true' || envValue === 'ture';
    
    console.log('--- Payment Config Debug ---');
    console.log('RAZORPAY_KEY_ID:', keyId ? 'FOUND' : 'MISSING');
    console.log('ENABLE_REAL_PAYMENT (Raw):', process.env.ENABLE_REAL_PAYMENT);
    console.log('enableReal (Parsed):', enableReal);
    
    res.status(200).json({
      mode: isMock ? 'test' : 'live',
      keyId: keyId,
      enableRealPayment: enableReal
    });
  } catch (error) {
    next(error);
  }
};

// Fetch DB price for mock payment confirmation — same logic as createOrder but no Razorpay call
exports.getMockOrderPrice = async (req, res, next) => {
  try {
    const { type, referenceIds, selectedDuration } = req.body;
    let actualAmount = 0;

    if (type === '1-on-1') {
      const session = await PersonalSession.findById(referenceIds[0]);
      if (!session) return res.status(404).json({ message: 'Personal session not found' });
      
      const ClassBundle = require('../models/ClassBundle');
      const pricingDoc = await ClassBundle.findOne({ className: '1-on-1', board: '1-on-1' });
      actualAmount = (session.price && session.price > 0) ? session.price : (pricingDoc?.pricing?.[selectedDuration] || 0);
    } else if (type === 'bundle') {
      const ClassBundle = require('../models/ClassBundle');
      const bundle = await ClassBundle.findById(referenceIds[0]);
      if (!bundle) return res.status(404).json({ message: 'Course not found' });
      actualAmount = bundle.pricing?.[selectedDuration] || bundle.price || 0;
    } else if (type === 'subject') {
      const Subject = require('../models/Subject');
      const subjects = await Subject.find({ _id: { $in: referenceIds } });
      actualAmount = subjects.reduce((sum, s) => sum + (s.pricing?.[selectedDuration] || 0), 0);
    } else {
      return res.status(400).json({ message: 'Invalid payment type.' });
    }

    if (!actualAmount || actualAmount <= 0) {
      return res.status(400).json({ message: 'Price not set by admin yet.' });
    }

    res.status(200).json({ actualAmount });
  } catch (error) {
    next(error);
  }
};


exports.createOrder = async (req, res, next) => {
  try {
    const { amount, type, referenceIds, selectedDuration, names } = req.body;

    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('YOUR_')) {
        return res.status(400).json({
            message: "Razorpay keys are not configured properly. Please add your real Key ID to the .env file."
        });
    }

    // ✅ SECURITY: Fetch actual price from DB and verify it matches what frontend sent
    let actualAmount = 0;

    if (type === '1-on-1') {
      const session = await PersonalSession.findById(referenceIds[0]);
      if (!session) return res.status(404).json({ message: 'Personal session not found' });
      
      const ClassBundle = require('../models/ClassBundle');
      const pricingDoc = await ClassBundle.findOne({ className: '1-on-1', board: '1-on-1' });
      actualAmount = (session.price && session.price > 0) ? session.price : (pricingDoc?.pricing?.[selectedDuration] || 0);

      if (!actualAmount || actualAmount <= 0) {
        return res.status(400).json({ message: 'Session price not set by admin yet.' });
      }
    } else if (type === 'bundle') {
      const ClassBundle = require('../models/ClassBundle');
      const bundle = await ClassBundle.findById(referenceIds[0]);
      if (!bundle) return res.status(404).json({ message: 'Course not found' });
      actualAmount = bundle.pricing?.[selectedDuration] || bundle.price || 0;
      if (!actualAmount || actualAmount <= 0) {
        return res.status(400).json({ message: 'Course pricing not set. Please contact admin.' });
      }
    } else if (type === 'subject') {
      const Subject = require('../models/Subject');
      const subjects = await Subject.find({ _id: { $in: referenceIds } });
      if (subjects.length === 0) return res.status(404).json({ message: 'Subject(s) not found' });
      actualAmount = subjects.reduce((sum, s) => sum + (s.pricing?.[selectedDuration] || 0), 0);
      if (!actualAmount || actualAmount <= 0) {
        return res.status(400).json({ message: 'Subject pricing not set. Please contact admin.' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid payment type.' });
    }

    // ✅ VERIFY: Frontend price must match DB price exactly
    if (Number(amount) !== actualAmount) {
      console.warn(`PRICE MISMATCH: user=${req.user._id}, frontend sent ₹${amount}, DB has ₹${actualAmount}`);
      return res.status(400).json({
        message: `Price mismatch! The price may have been updated by admin. Please refresh the page and try again.`,
        actualAmount
      });
    }

    const options = {
      amount: actualAmount * 100, // Razorpay expects paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${req.user._id.toString().substring(0, 5)}`
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      userId: req.user._id,
      amount: actualAmount,
      razorpayOrderId: order.id,
      subscriptionDetails: {
        type,
        referenceIds,
        selectedDuration: selectedDuration || 'oneMonth',
        names: names || []
      }
    });

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};


exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const paymentRecord = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
      if (!paymentRecord) return res.status(404).json({ message: 'Payment record not found' });

      if (paymentRecord.status !== 'captured') {
        paymentRecord.status = 'captured';
        paymentRecord.razorpayPaymentId = razorpay_payment_id;
        paymentRecord.razorpaySignature = razorpay_signature;
        await paymentRecord.save();

        const user = await User.findById(req.user._id);
        const { type, referenceIds, selectedDuration, names } = paymentRecord.subscriptionDetails;
        const now = new Date();
        
        if (type === '1-on-1') {
          const sessionId = referenceIds[0];
          
          const durationMap = { oneMonth: 30, threeMonths: 90, sixMonths: 180, twelveMonths: 365 };
          const days = durationMap[selectedDuration] || 30;
          const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

          await PersonalSession.findByIdAndUpdate(sessionId, {
            paymentStatus: 'paid',
            planType: selectedDuration,
            expiryDate: expiryDate
          });

          await Transaction.create({
            studentId: req.user._id,
            amount: paymentRecord.amount,
            status: 'success',
            packageName: '1-on-1 Personal Tuition',
            referenceId: sessionId,
            type: '1-on-1',
            date: now
          });
        } else {
          const durationMap = { oneMonth: 30, threeMonths: 90, sixMonths: 180, twelveMonths: 365 };
          const days = durationMap[selectedDuration] || 30;
          const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

          referenceIds.forEach((id, index) => {
            user.activeSubscriptions.push({
              type,
              referenceId: id,
              name: names[index] || 'Class Subscription',
              subscriptionType: selectedDuration,
              expiryDate,
              purchaseDate: now
            });
          });

          await user.save();

          await Transaction.create({
            studentId: req.user._id,
            amount: paymentRecord.amount,
            status: 'success',
            packageName: type === 'bundle' ? 'Class Bundle Subscription' : 'Individual Subject Access',
            referenceId: referenceIds[0],
            type: type,
            date: now
          });
        }
      }

      const user = await User.findById(req.user._id);
      const { type, names } = paymentRecord.subscriptionDetails;
      const courseName = names && names.length > 0 ? names.join(', ') : (type === '1-on-1' ? '1-on-1 Personal Tuition' : 'Course Subscription');

      sendEmail({
        to: user.email,
        subject: 'Payment Successful - Course Activated',
        html: `
          <div style="font-family: sans-serif; max-w: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #002147;">Payment Successful! 🎉</h2>
            <p>Dear ${user.name},</p>
            <p>Your payment of <strong>₹${paymentRecord.amount}</strong> was successful.</p>
            <p><strong>Course/Item:</strong> ${courseName}</p>
            <p>Your course access has been activated immediately. You can now login to your dashboard and start learning!</p>
            <br/>
            <p>Best Regards,</p>
            <p><strong>Mye3 e-Tuitions Team</strong></p>
          </div>
        `
      }).catch(err => console.error("Payment Success Email Error:", err));

      return res.status(200).json({ status: 'ok', user });
    } else {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error) {
    next(error);
  }
};

exports.razorpayWebhook = async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest === req.headers['x-razorpay-signature']) {
      const event = req.body.event;
      if (event === 'payment.captured') {
        const paymentData = req.body.payload.payment.entity;
        const orderId = paymentData.order_id;

        const paymentRecord = await Payment.findOne({ razorpayOrderId: orderId });
        if (!paymentRecord) return res.status(404).send('Payment record not found');

        if (paymentRecord.status === 'captured') {
           return res.status(200).json({ status: 'ok' }); // Already processed by verifyPayment
        }

        paymentRecord.status = 'captured';
        paymentRecord.razorpayPaymentId = paymentData.id;
        await paymentRecord.save();

        const user = await User.findById(paymentRecord.userId);
        const { type, referenceIds, selectedDuration, names } = paymentRecord.subscriptionDetails;
        const now = new Date();

        if (type === '1-on-1') {
          const sessionId = referenceIds[0];
          await PersonalSession.findByIdAndUpdate(sessionId, {
            paymentStatus: 'paid'
          });

          await Transaction.create({
            studentId: paymentRecord.userId,
            amount: paymentRecord.amount,
            status: 'success',
            packageName: '1-on-1 Personal Tuition',
            referenceId: sessionId,
            type: '1-on-1',
            date: now
          });
        } else {
          const durationMap = { oneMonth: 30, threeMonths: 90, sixMonths: 180, twelveMonths: 365 };
          const days = durationMap[selectedDuration] || 30;
          const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

          referenceIds.forEach((id, index) => {
            user.activeSubscriptions.push({
              type,
              referenceId: id,
              name: names[index] || 'Class Subscription',
              subscriptionType: selectedDuration,
              expiryDate,
              purchaseDate: now
            });
          });

          await user.save();

          await Transaction.create({
            studentId: paymentRecord.userId,
            amount: paymentRecord.amount,
            status: 'success',
            packageName: type === 'bundle' ? 'Class Bundle Subscription' : 'Individual Subject Access',
            referenceId: referenceIds[0],
            type: type,
            date: now
          });
        }

        const courseName = names && names.length > 0 ? names.join(', ') : (type === '1-on-1' ? '1-on-1 Personal Tuition' : 'Course Subscription');

        sendEmail({
          to: user.email,
          subject: 'Payment Successful - Course Activated',
          html: `
            <div style="font-family: sans-serif; max-w: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h2 style="color: #002147;">Payment Successful! 🎉</h2>
              <p>Dear ${user.name},</p>
              <p>Your payment of <strong>₹${paymentRecord.amount}</strong> was successful.</p>
              <p><strong>Course/Item:</strong> ${courseName}</p>
              <p>Your course access has been activated immediately. You can now login to your dashboard and start learning!</p>
              <br/>
              <p>Best Regards,</p>
              <p><strong>Mye3 e-Tuitions Team</strong></p>
            </div>
          `
        }).catch(err => console.error("Payment Success Webhook Email Error:", err));
      }

      res.status(200).json({ status: 'ok' });
    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Webhook failed');
  }
};
