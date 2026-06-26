const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const PersonalSession = require('./src/models/PersonalSession');

async function fix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 1. Revert sessions with status: 'active' but NO teacherId back to 'pending'
    const updated = await PersonalSession.updateMany(
      { status: 'active', teacherId: null },
      { $set: { status: 'pending' } }
    );
    console.log(`Reverted ${updated.modifiedCount} prematurely active sessions back to pending.`);

    // 2. Delete sessions where the associated student no longer exists
    const sessions = await PersonalSession.find();
    let deletedCount = 0;
    for (const session of sessions) {
      const studentExists = await User.findById(session.studentId);
      if (!studentExists) {
        await PersonalSession.findByIdAndDelete(session._id);
        deletedCount++;
      }
    }
    console.log(`Deleted ${deletedCount} ghost sessions with deleted students.`);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

fix();
