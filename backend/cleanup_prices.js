require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Remove all assignedSubjects that have pricePerClass <= 0 or missing
        const result = await User.updateMany(
            {},
            { 
                $pull: { 
                    assignedSubjects: { 
                        $or: [
                            { pricePerClass: { $lte: 0 } },
                            { pricePerClass: { $exists: false } }
                        ]
                    } 
                } 
            }
        );

        console.log('Successfully cleaned up assignments with ₹0 price:');
        console.log(result);

    } catch (error) {
        console.error('Cleanup failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

cleanup();
