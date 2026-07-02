const cron = require('node-cron');
const User = require('../models/User');
const LiveSession = require('../models/LiveSession');
const { sendEmail } = require('../utils/mailer');

// ── Auto-end expired LIVE sessions & mark MISSED sessions ─────────────────────
// Runs every 5 minutes
const autoEndExpiredSessions = async (io) => {
  try {
    const now = new Date();

    // 1. Auto-end: sessions that are 'live' but endTime has passed
    const expiredLive = await LiveSession.updateMany(
      { status: 'live', endTime: { $lt: now } },
      { $set: { status: 'ended' } }
    );
    if (expiredLive.modifiedCount > 0) {
      console.log(`[CRON] Auto-ended ${expiredLive.modifiedCount} expired live session(s)`);
      // Notify connected clients in real-time
      if (io) io.emit('live-session-update', { type: 'auto-ended' });
    }

    // 2. Mark missed: sessions that are still 'upcoming' but endTime has passed
    //    (teacher never started the class)
    const missedSessions = await LiveSession.updateMany(
      { status: 'upcoming', endTime: { $lt: now } },
      { $set: { status: 'missed' } }
    );
    if (missedSessions.modifiedCount > 0) {
      console.log(`[CRON] Marked ${missedSessions.modifiedCount} session(s) as missed`);
      if (io) io.emit('live-session-update', { type: 'missed-marked' });
    }

  } catch (error) {
    console.error('[CRON] Auto-end/missed check failed:', error);
  }
};

// ── Subscription expiry reminder ──────────────────────────────────────────────
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

const initializeExpiryCron = (io) => {
  // Run every 5 minutes: auto-end expired live sessions + mark missed
  cron.schedule('*/5 * * * *', () => {
    autoEndExpiredSessions(io);
  });
  console.log('[CRON] Auto-End/Missed Job Initialized (runs every 5 minutes)');

  // Run every morning at 8:00 AM: subscription expiry reminders
  cron.schedule('0 8 * * *', () => {
    checkExpiringSubscriptions();
  });
  console.log('[CRON] Expiry Reminder Job Initialized (runs at 8:00 AM daily)');
};

module.exports = { initializeExpiryCron, checkExpiringSubscriptions, autoEndExpiredSessions };

