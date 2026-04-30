const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../src/models/User');

async function cleanup() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Remove payRates from all users
    // 2. Remove activeSubscriptions from all teachers
    // 3. Remove board and className (top-level) from all teachers
    const result = await User.updateMany(
      { role: 'teacher' },
      { 
        $unset: { 
          payRates: "", 
          activeSubscriptions: "",
          board: "",
          className: ""
        } 
      }
    );

    console.log(`Successfully cleaned up ${result.modifiedCount} teacher documents.`);

    // Also remove payRates from any other users if it exists
    const result2 = await User.updateMany(
      { role: { $ne: 'teacher' } },
      { $unset: { payRates: "" } }
    );
    console.log(`Successfully removed payRates from ${result2.modifiedCount} non-teacher documents.`);

    process.exit(0);
  } catch (error) {
    console.error('Cleanup Error:', error);
    process.exit(1);
  }
}

cleanup();
