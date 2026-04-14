// Nutrition calculation utilities for BoomPets

const calculateDailyCalories = (weight, age, activityLevel = 'moderate') => {
  const baseCalories = weight * 30 + 70;
  const activityMultiplier = {
    low: 1.2,
    moderate: 1.4,
    high: 1.6,
  };
  return Math.round(baseCalories * (activityMultiplier[activityLevel] || 1.4));
};

const calculatePortionSize = (weight) => {
  const gramsPerDay = weight * 25;
  return Math.round(gramsPerDay);
};

const calculateHydration = (weight) => {
  return Math.round(weight * 50);
};

module.exports = {
  calculateDailyCalories,
  calculatePortionSize,
  calculateHydration,
};
