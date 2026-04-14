const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  animalType: { type: String, enum: ['dog', 'cat', 'bird', 'fish'], required: true },
  breed: { type: String },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  photoUrl: { type: String },
  allergies: [{ type: String }],
  healthConditions: [{ type: String }],
  activityLevel: { type: String, enum: ['low', 'moderate', 'high'], default: 'moderate' },
  climate: { type: String, default: 'temperate' },
  feedingSchedule: [{
    mealTime: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
    time: { type: String, required: true },
    portionSize: { type: Number, required: true },
    unit: { type: String, enum: ['cups', 'grams'], default: 'cups' }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Pet', petSchema);
