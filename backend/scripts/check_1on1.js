const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const ClassBundle = require('../src/models/ClassBundle');

async function check1on1() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const bundles = await ClassBundle.find({ className: '1-on-1' });
    console.log('Found 1-on-1 bundles:', JSON.stringify(bundles, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

check1on1();
