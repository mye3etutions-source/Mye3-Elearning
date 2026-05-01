require('dotenv').config();
const mongoose = require('mongoose');
const ClassBundle = require('./src/models/ClassBundle');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const bundles = await ClassBundle.find({ className: 'Class 10', board: 'TS Board' });
        console.log('Count:', bundles.length);
        bundles.forEach(b => {
            console.log('ID:', b._id, 'Subjects:', b.subjects.map(s => s.name));
        });
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
check();
