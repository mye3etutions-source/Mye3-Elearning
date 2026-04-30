const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const ClassBundle = require('./src/models/ClassBundle');
const Subject = require('./src/models/Subject');

async function checkBoards() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const bundles = await ClassBundle.find({});
    const subjects = await Subject.find({});

    console.log('ClassBundle Boards:', [...new Set(bundles.map(b => b.board))]);
    console.log('Subject Boards:', [...new Set(subjects.map(s => s.board))]);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkBoards();
