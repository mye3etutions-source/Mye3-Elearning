require('dotenv').config();
const mongoose = require('mongoose');
const ClassBundle = require('../src/models/ClassBundle');
const Subject = require('../src/models/Subject');

const DB_URI = process.env.MONGODB_URI;

async function syncBoards() {
  if (!DB_URI) {
    console.error('Error: MONGODB_URI not found in .env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DB_URI);
    console.log('Connected Successfully!');

    const boards = ['CBSE', 'ICSE', 'AP Board'];
    
    // 1. Sync ClassBundles (6-10)
    console.log('\n--- SYNCING CLASS BUNDLES (6-10) ---');
    const tsBundles = await ClassBundle.find({ board: 'TS Board' });
    
    for (const tsB of tsBundles) {
      for (const bName of boards) {
        const target = await ClassBundle.findOne({ className: tsB.className, board: bName });
        
        const subjectData = tsB.subjects.map(s => ({ 
          name: s.name, 
          singleSubjectPrice: s.singleSubjectPrice || 0
        }));

        const pricingData = {
          oneMonth: tsB.pricing?.oneMonth || 0,
          threeMonths: tsB.pricing?.threeMonths || 0,
          sixMonths: tsB.pricing?.sixMonths || 0,
          twelveMonths: tsB.pricing?.twelveMonths || 0
        };

        if (target) {
          target.subjects = subjectData;
          target.pricing = pricingData;
          target.price = tsB.price || 0;
          await target.save();
          console.log(`[UPDATED] ${tsB.className} for ${bName}`);
        } else {
          await ClassBundle.create({
            className: tsB.className,
            board: bName,
            price: tsB.price || 0,
            pricing: pricingData,
            subjects: subjectData,
            isActive: true
          });
          console.log(`[CREATED] ${tsB.className} for ${bName}`);
        }
      }
    }

    // 2. Sync Subjects (11-12)
    console.log('\n--- SYNCING SUBJECTS (11-12) ---');
    const tsSubjects = await Subject.find({ board: 'TS Board' });

    for (const tsS of tsSubjects) {
      constPricing = {
        oneMonth: tsS.pricing?.oneMonth || 0,
        threeMonths: tsS.pricing?.threeMonths || 0,
        sixMonths: tsS.pricing?.sixMonths || 0,
        twelveMonths: tsS.pricing?.twelveMonths || 0
      };

      for (const bName of boards) {
        const exists = await Subject.findOne({ 
          name: tsS.name, 
          classLevel: tsS.classLevel, 
          board: bName 
        });

        if (!exists) {
          await Subject.create({
            name: tsS.name,
            classLevel: tsS.classLevel,
            board: bName,
            pricing: constPricing,
            isActive: true
          });
          console.log(`[CREATED Subject] ${tsS.name} (Class ${tsS.classLevel}) for ${bName}`);
        } else {
          exists.pricing = constPricing;
          await exists.save();
          console.log(`[UPDATED Subject] ${tsS.name} (Class ${tsS.classLevel}) in ${bName}`);
        }
      }
    }

    console.log('\nUniversal Board Sync Complete!');
  } catch (error) {
    console.error('Sync Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

syncBoards();
