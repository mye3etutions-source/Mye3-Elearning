const cron = require('node-cron');
const RecurringSchedule = require('../models/RecurringSchedule');
const LiveSession = require('../models/LiveSession');

// Helper to calculate end date (End of Next Month)
const getEndOfNextMonth = () => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 2, 0); // 0th day of month+2 is the last day of month+1
};

// Generates sessions from 'startDate' up to 'endDate' for a given recurring template
const generateSessionsFromTemplate = async (template, startDate, endDate) => {
    let current = new Date(startDate);
    current.setHours(template.startHour, template.startMinute, 0, 0);

    const endBoundary = new Date(endDate);
    endBoundary.setHours(23, 59, 59, 999);

    const sessionsToCreate = [];

    while (current <= endBoundary) {
        // Exclude Sundays by default as per typical Indian classroom workflow 
        // (if user wants Sunday, we can make it configurable, but we'll exclude by default to be safe)
        if (current.getDay() !== 0) { 
            const sessionStart = new Date(current);
            const sessionEnd = new Date(current.getTime() + template.durationMinutes * 60000);

            // Verify if a session for this teacher at this exact exact time ALREADY exists
            const existing = await LiveSession.findOne({
                teacherId: template.teacherId,
                startTime: sessionStart
            });

            if (!existing) {
                sessionsToCreate.push({
                    teacherId: template.teacherId,
                    subjectId: template.subjectId,
                    classLevel: template.classLevel,
                    subjectName: template.subjectName,
                    board: template.board,
                    title: template.title,
                    platform: template.platform,
                    link: template.link,
                    startTime: sessionStart,
                    endTime: sessionEnd,
                    status: 'upcoming',
                    recurringScheduleId: template._id
                });
            }
        }
        // Advance to next day
        current.setDate(current.getDate() + 1);
    }

    if (sessionsToCreate.length > 0) {
        await LiveSession.insertMany(sessionsToCreate);
        console.log(`[CRON] Auto-generated ${sessionsToCreate.length} sessions for template ${template._id}`);
    }
};

const runRecurringJob = async () => {
    console.log('[CRON] Running daily recurring schedule check...');
    try {
        const activeTemplates = await RecurringSchedule.find({ isActive: true });
        
        // Target generation window: Tomorrow to End of Next Month
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);
        const endDate = getEndOfNextMonth();

        for (const template of activeTemplates) {
            await generateSessionsFromTemplate(template, startDate, endDate);
        }
        
    } catch (error) {
        console.error('[CRON] Error running recurring schedule check:', error);
    }
};

// Initialize Cron Job
const initializeCronJobs = () => {
    // Run every night at 2:00 AM
    cron.schedule('0 2 * * *', () => {
        runRecurringJob();
    });
    console.log('[CRON] Recurring Schedule Job Initialized (runs at 2:00 AM daily)');
};

// We also export runRecurringJob to trigger it immediately when an Admin creates a new RecurringSchedule
module.exports = { initializeCronJobs, runRecurringJob, generateSessionsFromTemplate, getEndOfNextMonth };
