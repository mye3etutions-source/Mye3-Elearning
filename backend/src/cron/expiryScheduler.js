const cron = require('node-cron');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');

const checkExpiringSubscriptions = async () => {
  console.log('[CRON] Running daily expiry check...');
  try {
    const today = new Date();
    
    // Calculate date exactly 3 days from now
    const targetDateStart = new Date(today);
    targetDateStart.setDate(today.getDate() + 3);
    targetDateStart.setHours(0, 0, 0, 0);

    const targetDateEnd = new Date(today);
    targetDateEnd.setDate(today.getDate() + 3);
    targetDateEnd.setHours(23, 59, 59, 999);

    // Find users who have subscriptions expiring in the target window
    const users = await User.find({
      'activeSubscriptions.expiryDate': {
        $gte: targetDateStart,
        $lte: targetDateEnd
      }
    });

    for (const user of users) {
      if (!user.email) continue;

      const expiringSubs = user.activeSubscriptions.filter(sub => {
        const expDate = new Date(sub.expiryDate);
        return expDate >= targetDateStart && expDate <= targetDateEnd;
      });

      if (expiringSubs.length > 0) {
        const itemsListHtml = expiringSubs.map(sub => `<li><strong>${sub.name}</strong></li>`).join('');

        sendEmail({
          to: user.email,
          subject: 'Action Required: Your Class Access is Expiring Soon!',
          html: `
            <div style="font-family: sans-serif; max-w: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
              <h2 style="color: #f97316;">Access Expiring in 3 Days ⚠️</h2>
              <p>Dear ${user.name},</p>
              <p>This is a friendly reminder that your access to the following classes/packages will expire in exactly 3 days:</p>
              <ul>
                ${itemsListHtml}
              </ul>
              <p>To ensure uninterrupted access to your live classes, recordings, and study materials, please renew your subscription via the Student Dashboard.</p>
              <br/>
              <p>Best Regards,</p>
              <p><strong>Mye3 e-Tuitions Team</strong></p>
            </div>
          `
        });
        
        console.log(`[CRON] Sent expiry reminder to ${user.email} for ${expiringSubs.length} items`);
      }
    }
  } catch (error) {
    console.error('[CRON] Error checking expiring subscriptions:', error);
  }
};

const initializeExpiryCron = () => {
  // Run every morning at 8:00 AM
  cron.schedule('0 8 * * *', () => {
    checkExpiringSubscriptions();
  });
  console.log('[CRON] Expiry Reminder Job Initialized (runs at 8:00 AM daily)');
};

module.exports = { initializeExpiryCron, checkExpiringSubscriptions };
