const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');
const authMiddleware = require('../middleware/auth');
const { validateRequiredFields, validatePositiveNumber, validateObjectId, sanitizeInput } = require('../middleware/validation');

const validateAnimalType = (req, res, next) => {
  const validTypes = ['dog', 'cat', 'bird', 'fish'];
  if (req.body.animalType && !validTypes.includes(req.body.animalType)) {
    return res.status(400).json({ 
      error: `Invalid animal type. Must be one of: ${validTypes.join(', ')}` 
    });
  }
  next();
};

router.post('/', 
  authMiddleware, 
  sanitizeInput, 
  validateRequiredFields(['name', 'animalType', 'age', 'weight']),
  validatePositiveNumber(['age', 'weight']),
  validateAnimalType,
  async (req, res, next) => {
    try {
      const petData = {
        ...req.body,
        userId: req.userId,
        activityLevel: req.body.activityLevel || 'moderate',
        climate: req.body.climate || 'temperate',
      };
      const pet = new Pet(petData);
      await pet.save();
      res.status(201).json(pet);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id', 
  authMiddleware, 
  validateObjectId('id'), 
  async (req, res, next) => {
    try {
      const pet = await Pet.findById(req.params.id);
      if (!pet) return res.status(404).json({ error: 'Pet not found' });
      if (pet.userId.toString() !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      res.json(pet);
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
      const pet = await Pet.findById(req.params.id);
      if (!pet) return res.status(404).json({ error: 'Pet not found' });
      if (pet.userId.toString() !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      if (req.body.age !== undefined && req.body.age <= 0) {
        return res.status(400).json({ error: 'Age must be positive' });
      }
      if (req.body.weight !== undefined && req.body.weight <= 0) {
        return res.status(400).json({ error: 'Weight must be positive' });
      }
      
      Object.assign(pet, req.body);
      pet.updatedAt = new Date();
      await pet.save();
      res.json(pet);
    } catch (error) {
      next(error);
    }
  }
);

router.get('/user/:userId', 
  authMiddleware, 
  async (req, res, next) => {
    try {
      if (req.params.userId !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      const pets = await Pet.find({ userId: req.params.userId }).sort({ createdAt: -1 });
      res.json(pets);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;


router.patch('/:id/allergies',
  authMiddleware,
  validateObjectId('id'),
  sanitizeInput,
  async (req, res, next) => {
    try {
      const pet = await Pet.findById(req.params.id);
      if (!pet) return res.status(404).json({ error: 'Pet not found' });
      if (pet.userId.toString() !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const { action, allergy } = req.body;
      if (!action || !allergy) {
        return res.status(400).json({ error: 'Action and allergy are required' });
      }
      
      if (action === 'add') {
        if (!pet.allergies.includes(allergy)) {
          pet.allergies.push(allergy);
        }
      } else if (action === 'remove') {
        pet.allergies = pet.allergies.filter(a => a !== allergy);
      } else {
        return res.status(400).json({ error: 'Invalid action. Use "add" or "remove"' });
      }
      
      pet.updatedAt = new Date();
      await pet.save();
      res.json(pet);
    } catch (error) {
      next(error);
    }
  }
);

router.patch('/:id/health-conditions',
  authMiddleware,
  validateObjectId('id'),
  sanitizeInput,
  async (req, res, next) => {
    try {
      const pet = await Pet.findById(req.params.id);
      if (!pet) return res.status(404).json({ error: 'Pet not found' });
      if (pet.userId.toString() !== req.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const { action, condition } = req.body;
      if (!action || !condition) {
        return res.status(400).json({ error: 'Action and condition are required' });
      }
      
      if (action === 'add') {
        if (!pet.healthConditions.includes(condition)) {
          pet.healthConditions.push(condition);
        }
      } else if (action === 'remove') {
        pet.healthConditions = pet.healthConditions.filter(c => c !== condition);
      } else {
        return res.status(400).json({ error: 'Invalid action. Use "add" or "remove"' });
      }
      
      pet.updatedAt = new Date();
      await pet.save();
      res.json(pet);
    } catch (error) {
      next(error);
    }
  }
);
