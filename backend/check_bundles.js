require('dotenv').config();
const mongoose = require('mongoose');
const ClassBundle = require('./src/models/ClassBundle');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const bundles = await ClassBundle.find({ className: 'Class 10' });
        console.log('Class 10 Bundles:', JSON.stringify(bundles, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
check();
