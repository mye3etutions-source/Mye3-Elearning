const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'Class 6', 'Class 10'
  level: { type: Number, required: true }, // 6, 7, 8, 9, 10
  bundlePrice: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
