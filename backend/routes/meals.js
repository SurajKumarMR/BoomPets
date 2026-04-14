const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const Pet = require('../models/Pet');
const authMiddleware = require('../middleware/auth');
const { validateRequiredFields, validatePositiveNumber, validateObjectId, sanitizeInput } = require('../middleware/validation');

router.post('/', 
  authMiddleware,
  sanitizeInput,
  validateRequiredFields(['petId', 'name', 'type', 'portionSize', 'calories']),
  validatePositiveNumber(['portionSize', 'calories']),
  async (req, res, next) => {
    try {
      const pet = await Pet.findById(req.body.petId);
      if (!pet) return res.status(404).json({ error: 'Pet not found' });
      if (pet.userId.toString() !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const mealData = {
        ...req.body,
        timestamp: new Date(),
        completed: false,
      };
      const meal = new Meal(mealData);
      await meal.save();
      res.status(201).json(meal);
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
      
      const meals = await Meal.find({ petId: req.params.petId }).sort({ timestamp: -1 });
      res.json(meals);
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
      const meal = await Meal.findById(req.params.id);
      if (!meal) return res.status(404).json({ error: 'Meal not found' });
      
      const pet = await Pet.findById(meal.petId);
      if (!pet || pet.userId.toString() !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      Object.assign(meal, req.body);
      await meal.save();
      res.json(meal);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/pet/:petId/stats', 
  authMiddleware,
  validateObjectId('petId'),
  async (req, res, next) => {
    try {
      const pet = await Pet.findById(req.params.petId);
      if (!pet) return res.status(404).json({ error: 'Pet not found' });
      if (pet.userId.toString() !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const meals = await Meal.find({
        petId: req.params.petId,
        timestamp: { $gte: today },
        completed: true,
      });
      
      const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
      res.json({ totalCalories, mealsCompleted: meals.length });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
