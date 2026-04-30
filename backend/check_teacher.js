const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');

async function checkTeacher() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const teacher = await User.findOne({ name: /Nagesh Maths/i });
    if (!teacher) {
      console.log('Teacher not found');
      return;
    }

    console.log('Teacher Name:', teacher.name);
    console.log('Assigned Subjects:');
    teacher.assignedSubjects.forEach(s => {
      console.log(`- Board: ${s.board}, Class: ${s.classLevel}, Subject: ${s.subjectName}, Price: ${s.pricePerClass}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTeacher();
