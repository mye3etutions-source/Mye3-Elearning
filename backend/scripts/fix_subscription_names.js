require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Subject = require('../src/models/Subject');

const fixSubscriptions = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.\n');

    // Fetch all students who have activeSubscriptions
    const students = await User.find({
      'activeSubscriptions.0': { $exists: true }
    });

    console.log(`Found ${students.length} students with subscriptions to check.\n`);
    let totalUpdated = 0;

    for (const student of students) {
      let modified = false;

      for (let i = 0; i < student.activeSubscriptions.length; i++) {
        const sub = student.activeSubscriptions[i];
        const oldName = sub.name;
        let newName = oldName;

        // Only normalize if it is of type 'subject' or contains parentheses like (Inter 1st Year) or (Class X)
        if (sub.type === 'subject' || oldName.includes('Inter') || oldName.includes('(')) {
          // 1. Try finding by referenceId first
          if (mongoose.Types.ObjectId.isValid(sub.referenceId)) {
            const subjectDoc = await Subject.findById(sub.referenceId);
            if (subjectDoc) {
              newName = `Class ${subjectDoc.classLevel} - ${subjectDoc.name}`;
            }
          }

          // 2. If newName is still the old format, parse via Regex
          if (newName === oldName) {
            if (oldName.includes('Inter 1st Year') || oldName.includes('Inter 1st') || oldName.includes('(11)')) {
              const subClean = oldName.replace(/\(.*?\)/g, '').replace(/-.*$/g, '').trim();
              newName = `Class 11 - ${subClean}`;
            } else if (oldName.includes('Inter 2nd Year') || oldName.includes('Inter 2nd') || oldName.includes('(12)')) {
              const subClean = oldName.replace(/\(.*?\)/g, '').replace(/-.*$/g, '').trim();
              newName = `Class 12 - ${subClean}`;
            } else if (oldName.match(/Class (\d+)/i)) {
              const match = oldName.match(/Class (\d+)/i);
              const classNum = match[1];
              const subClean = oldName.replace(/Class \d+/ig, '').replace(/\(|\)/g, '').replace(/-/, '').trim();
              if (subClean) {
                newName = `Class ${classNum} - ${subClean}`;
              }
            }
          }

          if (newName !== oldName) {
            console.log(`[UPDATED] Student: "${student.name}" (${student.email})`);
            console.log(`          Old: "${oldName}"`);
            console.log(`          New: "${newName}"\n`);
            student.activeSubscriptions[i].name = newName;
            modified = true;
          }
        }
      }

      if (modified) {
        student.markModified('activeSubscriptions');
        await student.save({ validateBeforeSave: false });
        totalUpdated++;
      }
    }

    console.log('--------------------------------------------------');
    console.log(`Migration Complete! Total students updated: ${totalUpdated}`);
    console.log('--------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
};

fixSubscriptions();
