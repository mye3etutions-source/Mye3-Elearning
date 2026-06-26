const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const PersonalSession = require('./src/models/PersonalSession');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const mani = await User.findOne({ name: /mani/i });
    console.log('Mani:', mani);
    if (mani) {
      const session = await PersonalSession.findOne({ studentId: mani._id });
      console.log('Mani session:', session);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

check();
