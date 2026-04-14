const express = require('express');
const router = express.Router();
const NutritionPlan = require('../models/NutritionPlan');
const Pet = require('../models/Pet');
const authMiddleware = require('../middleware/auth');
const { validateRequiredFields, validateObjectId, sanitizeInput } = require('../middleware/validation');

const filterMealsByAllergies = (meals, allergies) => {
  if (!allergies || allergies.length === 0) return meals;
  
  return meals.filter(meal => {
    return !meal.ingredients.some(ingredient => 
      allergies.some(allergy => 
        ingredient.toLowerCase().includes(allergy.toLowerCase())
      )
    );
  });
};

router.post('/generate', 
  authMiddleware,
  sanitizeInput,
  validateRequiredFields(['petId']),
  async (req, res, next) => {
    try {
      const { petId } = req.body;
      const pet = await Pet.findById(petId);
      if (!pet) return res.status(404).json({ error: 'Pet not found' });
      if (pet.userId.toString() !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const baseCalories = pet.weight * 30 + 70;
      const activityMultiplier = { low: 1.2, moderate: 1.4, high: 1.6 };
      const dailyCalories = Math.round(baseCalories * (activityMultiplier[pet.activityLevel] || 1.4));
      
      let meals = [
        {
          name: 'Salmon & Sweet Potato Mix',
          type: 'PROTEIN RICH',
          ingredients: ['Fresh Salmon', 'Sweet Potato', 'Green Peas', 'Organic Carrots'],
          portionSize: Math.round(pet.weight * 12.5),
          calories: Math.round(dailyCalories * 0.5),
        },
        {
          name: 'Lean Chicken & Brown Rice',
          type: 'DIGESTION AID',
          ingredients: ['Chicken Breast', 'Brown Rice', 'Steamed Broccoli', 'Blueberries'],
          portionSize: Math.round(pet.weight * 12.5),
          calories: Math.round(dailyCalories * 0.5),
        },
        {
          name: 'Turkey & Quinoa Bowl',
          type: 'BALANCED',
          ingredients: ['Ground Turkey', 'Quinoa', 'Carrots', 'Spinach'],
          portionSize: Math.round(pet.weight * 12.5),
          calories: Math.round(dailyCalories * 0.5),
        },
      ];
      
      meals = filterMealsByAllergies(meals, pet.allergies);
      
      if (meals.length < 2) {
        return res.status(400).json({ 
          error: 'Unable to generate sufficient meal recommendations due to allergy restrictions' 
        });
      }
      
      const plan = new NutritionPlan({
        petId,
        name: `${pet.name}'s Nutrition Plan`,
        description: `Personalized plan for ${pet.breed || pet.animalType}`,
        duration: 28,
        status: 'active',
        meals: [],
        goals: ['Maintain healthy weight', 'Improve coat shine', 'Boost energy'],
        createdAt: new Date(),
      });
      
      // Add meals individually to avoid casting issues
      meals.slice(0, 3).forEach(meal => {
        plan.meals.push({
          name: meal.name,
          type: meal.type,
          ingredients: meal.ingredients,
          portionSize: meal.portionSize,
          calories: meal.calories
        });
      });
      
      await plan.save();
      res.json(plan);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/pet/:petId', 
  authMiddleware,
  validateObjectId('petId'),
  async (req, res, next) => {
    try {
      const pet = await Pet.findById(req.params.petId);
      if (!pet) return res.status(404).json({ error: 'Pet not found' });
      if (pet.userId.toString() !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const plans = await NutritionPlan.find({ petId: req.params.petId }).sort({ createdAt: -1 });
      res.json(plans);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authMiddleware,
  validateObjectId('id'),
  sanitizeInput,
  async (req, res, next) => {
    try {
      const plan = await NutritionPlan.findById(req.params.id);
      if (!plan) return res.status(404).json({ error: 'Nutrition plan not found' });
      
      const pet = await Pet.findById(plan.petId);
      if (!pet || pet.userId.toString() !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      if (req.body.status && !['active', 'completed', 'paused'].includes(req.body.status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      
      Object.assign(plan, req.body);
      await plan.save();
      res.json(plan);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
