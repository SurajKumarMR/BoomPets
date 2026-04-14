export const calculateDailyCalories = (weight, age, activityLevel = 'moderate') => {
  const baseCalories = weight * 30 + 70;
  const activityMultiplier = {
    low: 1.2,
    moderate: 1.4,
    high: 1.6,
  };
  return Math.round(baseCalories * (activityMultiplier[activityLevel] || 1.4));
};

export const calculatePortionSize = (weight) => {
  const gramsPerDay = weight * 25;
  return Math.round(gramsPerDay);
};

export const calculateHydration = (weight) => {
  return Math.round(weight * 50);
};

export const getMealRecommendations = (pet) => {
  const meals = [
    {
      id: 1,
      name: 'Salmon & Sweet Potato Mix',
      type: 'PROTEIN RICH',
      description: 'Optimal for muscle maintenance and coat shine',
      ingredients: ['Fresh Salmon', 'Sweet Potato', 'Green Peas', 'Organic Carrots', 'Ground Flaxseed', 'Fish Oil'],
      image: 'salmon',
    },
    {
      id: 2,
      name: 'Lean Chicken & Brown Rice',
      type: 'DIGESTION AID',
      description: 'Complete the stomach with complex carbohydrates',
      ingredients: ['Free-range Chicken Breast', 'Brown Rice', 'Steamed Broccoli', 'Blueberries', 'Coconut Oil', 'Cottage Cheese'],
      image: 'chicken',
    },
  ];
  return meals;
};
