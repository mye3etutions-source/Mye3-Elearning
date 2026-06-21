const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');

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

exports.createOrder = async (req, res, next) => {
  try {
    const { amount, type, referenceIds, selectedDuration, names } = req.body; 

    if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.includes('YOUR_')) {
        return res.status(400).json({ 
            message: "Razorpay keys are not configured properly. Please add your real Key ID to the .env file." 
        });
    }

    const options = {
      amount: amount * 100, // smallest unit
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${req.user._id.toString().substring(0,5)}`
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      userId: req.user._id,
      amount,
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
        const { type, referenceIds, selectedDuration } = paymentRecord.subscriptionDetails;
        
        const now = new Date();
        const durationMap = { oneMonth: 30, threeMonths: 90, sixMonths: 180, twelveMonths: 365 };
        const days = durationMap[selectedDuration] || 30;
        const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

        referenceIds.forEach((id, index) => {
          user.activeSubscriptions.push({
            type,
            referenceId: id,
            name: paymentRecord.subscriptionDetails.names[index] || 'Class Subscription',
            subscriptionType: selectedDuration,
            expiryDate,
            purchaseDate: now
          });
        });

        await user.save();

        // Create Transaction History Record
        await Transaction.create({
          studentId: req.user._id,
          amount: paymentRecord.amount,
          status: 'success',
          packageName: type === 'bundle' ? 'Class Bundle Subscription' : 'Individual Subject Access',
          referenceId: referenceIds[0],
          type: type,
          date: now
        });

        return res.status(200).json({ status: 'ok', user });
      }

      const user = await User.findById(req.user._id);
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

        paymentRecord.status = 'captured';
        paymentRecord.razorpayPaymentId = paymentData.id;
        await paymentRecord.save();

        const user = await User.findById(paymentRecord.userId);
        const { type, referenceIds } = paymentRecord.subscriptionDetails;
        
        // Expiration Logic: 30 days for subject (11-12) OR standard mapping for bundles
        const now = new Date();
        const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 Days default for all

        referenceIds.forEach(id => {
          // ensure no duplicate active subjects overlapping if they renew early?
          user.activeSubscriptions.push({
            type,
            referenceId: id,
            expiryDate
          });
        });

        await user.save();

        // Create Transaction History Record
        await Transaction.create({
          studentId: paymentRecord.userId,
          amount: paymentRecord.amount,
          status: 'success',
          packageName: type === 'bundle' ? 'Class Bundle Subscription' : 'Individual Subject Access',
          referenceId: referenceIds[0], // First ID as primary reference
          type: type,
          date: now
        });
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
