require('dotenv').config();
const mongoose = require('mongoose');
const ClassBundle = require('./src/models/ClassBundle');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const bundles = await ClassBundle.find({});
        console.log('All Bundles:', JSON.stringify(bundles.map(b => ({ id: b._id, className: b.className, board: b.board, subjectsCount: b.subjects.length, subjects: b.subjects.map(s => s.name) })), null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
check();
