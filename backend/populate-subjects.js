require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

mongoose.connect(MONGO_URI).then(async () => {
  const db = mongoose.connection.db;
  const boards = ['AP Board', 'TS Board', 'CBSE', 'ICSE'];
  const commonSubjects = ['Maths', 'Physics', 'Chemistry', 'Biology', 'Commerce', 'Accounts', 'Economics'];

  for (const board of boards) {
    const subsCount = await db.collection('subjects').countDocuments({ board });
    console.log(`Checking ${board}: ${subsCount} subjects found.`);

    if (subsCount === 0) {
      console.log(`Initializing ${board} subjects...`);
      const seniorPromises = [];
      [11, 12].forEach(level => {
        commonSubjects.forEach(name => {
          seniorPromises.push(
            db.collection('subjects').insertOne({
              name,
              classLevel: level,
              board,
              pricing: { oneMonth: 0, threeMonths: 0, sixMonths: 0, twelveMonths: 0 },
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            })
          );
        });
      });
      await Promise.all(seniorPromises);
      console.log(`  Initialized ${board} with ${seniorPromises.length} subjects.`);
    }
  }

  process.exit(0);
}).catch(e => {
  console.error('DB Error:', e.message);
  process.exit(1);
});
