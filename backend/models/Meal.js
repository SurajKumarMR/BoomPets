const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String },
  ingredients: [{ type: String }],
  portionSize: { type: Number, required: true },
  calories: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  mealTime: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
  completed: { type: Boolean, default: false },
});

module.exports = mongoose.model('Meal', mealSchema);
