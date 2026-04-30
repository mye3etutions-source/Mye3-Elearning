require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ name: /Nagesh/i });
        if (user) {
            console.log('Teacher:', user.name);
            console.log('Assigned Subjects:', JSON.stringify(user.assignedSubjects, null, 2));
        } else {
            console.log('Teacher not found');
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}
check();
