const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  ingredients: [{ type: String }],
  portionSize: { type: Number, required: true },
  calories: { type: Number, required: true },
}, { _id: false });

const nutritionPlanSchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  name: { type: String, required: true },
  description: { type: String },
  duration: { type: Number },
  startDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  meals: [mealSchema],
  goals: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('NutritionPlan', nutritionPlanSchema);
