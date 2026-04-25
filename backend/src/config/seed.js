const ClassBundle = require('../models/ClassBundle');
const Subject = require('../models/Subject');
const User = require('../models/User');

const seedData = async () => {
  try {
    // 1. Seed ClassBundles
    const defaultClasses = [
      { 
        className: 'Class 6', 
        price: 999, 
        subjects: [
          { name: 'Maths', singleSubjectPrice: 299 },
          { name: 'Science', singleSubjectPrice: 249 },
          { name: 'English', singleSubjectPrice: 199 },
          { name: 'Social Studies', singleSubjectPrice: 199 }
        ] 
      },
      { 
        className: 'Class 7', 
        price: 999, 
        subjects: [
          { name: 'Maths', singleSubjectPrice: 299 },
          { name: 'Science', singleSubjectPrice: 249 },
          { name: 'English', singleSubjectPrice: 199 },
          { name: 'Social Studies', singleSubjectPrice: 199 }
        ] 
      },
      { 
        className: 'Class 8', 
        price: 1099, 
        subjects: [
          { name: 'Maths', singleSubjectPrice: 349 },
          { name: 'Science', singleSubjectPrice: 299 },
          { name: 'English', singleSubjectPrice: 199 },
          { name: 'Social Studies', singleSubjectPrice: 199 }
        ] 
      },
      { 
        className: 'Class 9', 
        price: 1499, 
        subjects: [
          { name: 'Maths', singleSubjectPrice: 499 },
          { name: 'Physics', singleSubjectPrice: 399 },
          { name: 'Chemistry', singleSubjectPrice: 399 },
          { name: 'Biology', singleSubjectPrice: 399 }
        ] 
      },
      { 
        className: 'Class 10', 
        price: 1499, 
        subjects: [
          { name: 'Maths', singleSubjectPrice: 499 },
          { name: 'Physics', singleSubjectPrice: 399 },
          { name: 'Chemistry', singleSubjectPrice: 399 },
          { name: 'Biology', singleSubjectPrice: 399 }
        ] 
      },
    ];

    for (const classData of defaultClasses) {
      const existing = await ClassBundle.findOne({ className: classData.className });
      if (!existing) {
        await ClassBundle.create(classData);
        console.log(`Seeded Bundle: ${classData.className}`);
      }
    }

    // 2. Seed Admin User
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Master Admin',
        email: 'admin@mye3.com',
        password: 'adminpassword',
        role: 'admin'
      });
      console.log('Seeded Admin: admin@mye3.com');
    }

    // 3. Seed Teachers (Removed dummy teachers to prevent re-seeding)
    // 4. Seed Students (Removed dummy students to prevent re-seeding)

  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

module.exports = seedData;
