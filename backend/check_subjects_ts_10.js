require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('./src/models/Subject');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const subjects = await Subject.find({ classLevel: 10, board: 'TS Board' });
        console.log('Class 10 TS Board Subjects:', JSON.stringify(subjects, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
check();
