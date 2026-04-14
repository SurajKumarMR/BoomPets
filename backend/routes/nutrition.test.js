const request = require('supertest');
const express = require('express');
const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const NutritionPlan = require('../models/NutritionPlan');
const Pet = require('../models/Pet');
const User = require('../models/User');
const nutritionRouter = require('./nutrition');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/api/nutrition', nutritionRouter);

// Add error handler middleware
app.use((err, req, res, next) => {
  console.error('Test error:', err);
  res.status(500).json({ error: err.message });
});

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await NutritionPlan.deleteMany({});
  await Pet.deleteMany({});
  await User.deleteMany({});
});

// Helper function to create a test user and get auth token
async function createUserAndToken() {
  const user = new User({
    email: `test${Date.now()}@example.com`,
    password: 'hashedpassword123',
    name: 'Test User'
  });
  await user.save();
  
  const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET || 'secret');
  return { user, token };
}

// Helper function to create a test pet
async function createTestPet(userId, allergies = []) {
  const pet = new Pet({
    userId,
    name: 'TestPet',
    animalType: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 25,
    activityLevel: 'moderate',
    allergies
  });
  await pet.save();
  return pet;
}

describe('Nutrition Plan Property Tests', () => {
  /**
   * Property 18: Meal Recommendations Generated
   * **Validates: Requirements 5.1**
   * 
   * Property: For any pet profile, when generating meal recommendations, 
   * the system should generate at least 2 meal recommendations within 3 seconds.
   */
  it('should generate at least 2 meal recommendations within 3 seconds for any pet profile', async () => {
    const petWeightArb = fc.integer({ min: 5, max: 100 });
    const activityLevelArb = fc.constantFrom('low', 'moderate', 'high');
    const petAgeArb = fc.integer({ min: 1, max: 20 });

    await fc.assert(
      fc.asyncProperty(
        petWeightArb,
        activityLevelArb,
        petAgeArb,
        async (weight, activityLevel, age) => {
          const { user, token } = await createUserAndToken();
          const pet = new Pet({
            userId: user._id,
            name: 'TestPet',
            animalType: 'dog',
            breed: 'Mixed',
            age,
            weight,
            activityLevel,
            allergies: []
          });
          await pet.save();
          
          const startTime = Date.now();
          
          const response = await request(app)
            .post('/api/nutrition/generate')
            .set('Authorization', `Bearer ${token}`)
            .send({ petId: pet._id.toString() });
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Verify response
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('meals');
          expect(Array.isArray(response.body.meals)).toBe(true);
          expect(response.body.meals.length).toBeGreaterThanOrEqual(2);
          
          // Verify performance requirement (< 3 seconds)
          expect(duration).toBeLessThan(3000);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 19: Meal Recommendation Structure
   * **Validates: Requirements 5.2**
   * 
   * Property: For any meal recommendation, the system should include 
   * meal name, type classification, description, and ingredient list.
   */
  it('should include meal name, type, description, and ingredients for each recommendation', async () => {
    const petWeightArb = fc.integer({ min: 5, max: 100 });
    const activityLevelArb = fc.constantFrom('low', 'moderate', 'high');

    await fc.assert(
      fc.asyncProperty(
        petWeightArb,
        activityLevelArb,
        async (weight, activityLevel) => {
          const { user, token } = await createUserAndToken();
          const pet = new Pet({
            userId: user._id,
            name: 'TestPet',
            animalType: 'dog',
            age: 5,
            weight,
            activityLevel,
            allergies: []
          });
          await pet.save();
          
          const response = await request(app)
            .post('/api/nutrition/generate')
            .set('Authorization', `Bearer ${token}`)
            .send({ petId: pet._id.toString() });
          
          expect(response.status).toBe(200);
          expect(response.body.meals).toBeDefined();
          
          // Verify each meal has required structure
          response.body.meals.forEach(meal => {
            expect(meal).toHaveProperty('name');
            expect(typeof meal.name).toBe('string');
            expect(meal.name.length).toBeGreaterThan(0);
            
            expect(meal).toHaveProperty('type');
            expect(typeof meal.type).toBe('string');
            expect(meal.type.length).toBeGreaterThan(0);
            
            expect(meal).toHaveProperty('ingredients');
            expect(Array.isArray(meal.ingredients)).toBe(true);
            expect(meal.ingredients.length).toBeGreaterThan(0);
            
            // Verify portion size and calories are also included
            expect(meal).toHaveProperty('portionSize');
            expect(typeof meal.portionSize).toBe('number');
            expect(meal.portionSize).toBeGreaterThan(0);
            
            expect(meal).toHaveProperty('calories');
            expect(typeof meal.calories).toBe('number');
            expect(meal.calories).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 20: Allergy Filtering in Recommendations
   * **Validates: Requirements 5.3**
   * 
   * Property: For any pet with allergies, when generating meal recommendations, 
   * the system should exclude ingredients matching those allergies from all recommendations.
   */
  it('should exclude allergy ingredients from all meal recommendations', async () => {
    const petWeightArb = fc.integer({ min: 5, max: 100 });
    // Use single allergy to ensure we can still generate recommendations
    const allergyArb = fc.constantFrom('beef', 'pork', 'lamb', 'duck');

    await fc.assert(
      fc.asyncProperty(
        petWeightArb,
        allergyArb,
        async (weight, allergy) => {
          const { user, token } = await createUserAndToken();
          
          const pet = new Pet({
            userId: user._id,
            name: 'TestPet',
            animalType: 'dog',
            age: 5,
            weight,
            activityLevel: 'moderate',
            allergies: [allergy]
          });
          await pet.save();
          
          const response = await request(app)
            .post('/api/nutrition/generate')
            .set('Authorization', `Bearer ${token}`)
            .send({ petId: pet._id.toString() });
          
          expect(response.status).toBe(200);
          expect(response.body.meals).toBeDefined();
          expect(response.body.meals.length).toBeGreaterThanOrEqual(2);
          
          // Verify no meal contains the allergy ingredient
          response.body.meals.forEach(meal => {
            expect(meal.ingredients).toBeDefined();
            
            meal.ingredients.forEach(ingredient => {
              expect(ingredient.toLowerCase()).not.toContain(allergy.toLowerCase());
            });
          });
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 23: Nutrition Plan Creation with Status and Timestamp
   * **Validates: Requirements 6.1, 14.6**
   * 
   * Property: For any nutrition plan creation, the system should store the plan 
   * with active status and current timestamp within 1 second.
   */
  it('should create nutrition plan with active status and current timestamp within 1 second', async () => {
    const petWeightArb = fc.integer({ min: 5, max: 100 });
    const activityLevelArb = fc.constantFrom('low', 'moderate', 'high');

    await fc.assert(
      fc.asyncProperty(
        petWeightArb,
        activityLevelArb,
        async (weight, activityLevel) => {
          const { user, token } = await createUserAndToken();
          const pet = new Pet({
            userId: user._id,
            name: 'TestPet',
            animalType: 'dog',
            age: 5,
            weight,
            activityLevel,
            allergies: []
          });
          await pet.save();
          
          const beforeRequest = new Date();
          const startTime = Date.now();
          
          const response = await request(app)
            .post('/api/nutrition/generate')
            .set('Authorization', `Bearer ${token}`)
            .send({ petId: pet._id.toString() });
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          const afterRequest = new Date();
          
          // Verify response
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('status');
          expect(response.body.status).toBe('active');
          
          expect(response.body).toHaveProperty('createdAt');
          const createdAt = new Date(response.body.createdAt);
          expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
          expect(createdAt.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
          
          // Verify plan was created in database
          const planInDb = await NutritionPlan.findById(response.body._id);
          expect(planInDb).not.toBeNull();
          expect(planInDb.status).toBe('active');
          expect(planInDb.createdAt).toBeDefined();
          
          // Verify performance requirement (< 1 second)
          expect(duration).toBeLessThan(1000);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 24: Nutrition Plan Pet Association
   * **Validates: Requirements 6.2**
   * 
   * Property: For any nutrition plan, the system should associate it 
   * with a specific pet profile via petId.
   */
  it('should associate each nutrition plan with a specific pet profile', async () => {
    const petWeightArb = fc.integer({ min: 5, max: 100 });

    await fc.assert(
      fc.asyncProperty(
        petWeightArb,
        async (weight) => {
          const { user, token } = await createUserAndToken();
          
          // Create two different pets
          const pet1 = new Pet({
            userId: user._id,
            name: 'Pet1',
            animalType: 'dog',
            age: 3,
            weight,
            activityLevel: 'moderate',
            allergies: []
          });
          await pet1.save();
          
          const pet2 = new Pet({
            userId: user._id,
            name: 'Pet2',
            animalType: 'cat',
            age: 2,
            weight: 5,
            activityLevel: 'low',
            allergies: []
          });
          await pet2.save();
          
          // Create nutrition plan for pet1
          const response = await request(app)
            .post('/api/nutrition/generate')
            .set('Authorization', `Bearer ${token}`)
            .send({ petId: pet1._id.toString() });
          
          expect(response.status).toBe(200);
          expect(response.body.petId).toBe(pet1._id.toString());
          
          // Verify plan is associated with pet1 in database
          const planInDb = await NutritionPlan.findById(response.body._id);
          expect(planInDb.petId.toString()).toBe(pet1._id.toString());
          
          // Verify plan appears in pet1's plans
          const pet1Plans = await request(app)
            .get(`/api/nutrition/pet/${pet1._id}`)
            .set('Authorization', `Bearer ${token}`);
          
          expect(pet1Plans.status).toBe(200);
          expect(pet1Plans.body.length).toBe(1);
          expect(pet1Plans.body[0]._id).toBe(response.body._id);
          
          // Verify plan does NOT appear in pet2's plans
          const pet2Plans = await request(app)
            .get(`/api/nutrition/pet/${pet2._id}`)
            .set('Authorization', `Bearer ${token}`);
          
          expect(pet2Plans.status).toBe(200);
          expect(pet2Plans.body.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 25: Meal Data Storage in Plans
   * **Validates: Requirements 6.3**
   * 
   * Property: For any nutrition plan with meals, the system should store 
   * meal name, type, ingredients, portion size, and calorie count.
   */
  it('should store complete meal data including name, type, ingredients, portion size, and calories', async () => {
    const petWeightArb = fc.integer({ min: 5, max: 100 });
    const activityLevelArb = fc.constantFrom('low', 'moderate', 'high');

    await fc.assert(
      fc.asyncProperty(
        petWeightArb,
        activityLevelArb,
        async (weight, activityLevel) => {
          const { user, token } = await createUserAndToken();
          const pet = new Pet({
            userId: user._id,
            name: 'TestPet',
            animalType: 'dog',
            age: 5,
            weight,
            activityLevel,
            allergies: []
          });
          await pet.save();
          
          const response = await request(app)
            .post('/api/nutrition/generate')
            .set('Authorization', `Bearer ${token}`)
            .send({ petId: pet._id.toString() });
          
          expect(response.status).toBe(200);
          expect(response.body.meals).toBeDefined();
          expect(response.body.meals.length).toBeGreaterThan(0);
          
          // Verify each meal has all required fields stored
          response.body.meals.forEach(meal => {
            expect(meal).toHaveProperty('name');
            expect(typeof meal.name).toBe('string');
            expect(meal.name.length).toBeGreaterThan(0);
            
            expect(meal).toHaveProperty('type');
            expect(typeof meal.type).toBe('string');
            expect(meal.type.length).toBeGreaterThan(0);
            
            expect(meal).toHaveProperty('ingredients');
            expect(Array.isArray(meal.ingredients)).toBe(true);
            expect(meal.ingredients.length).toBeGreaterThan(0);
            
            expect(meal).toHaveProperty('portionSize');
            expect(typeof meal.portionSize).toBe('number');
            expect(meal.portionSize).toBeGreaterThan(0);
            
            expect(meal).toHaveProperty('calories');
            expect(typeof meal.calories).toBe('number');
            expect(meal.calories).toBeGreaterThan(0);
          });
          
          // Verify data is persisted in database
          const planInDb = await NutritionPlan.findById(response.body._id);
          expect(planInDb.meals).toBeDefined();
          expect(planInDb.meals.length).toBe(response.body.meals.length);
          
          planInDb.meals.forEach(meal => {
            expect(meal.name).toBeDefined();
            expect(meal.type).toBeDefined();
            expect(meal.ingredients).toBeDefined();
            expect(meal.portionSize).toBeDefined();
            expect(meal.calories).toBeDefined();
          });
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Property 28: Plans Ordered by Creation Date
   * **Validates: Requirements 6.7**
   * 
   * Property: For any set of nutrition plans for a pet, when viewing saved plans, 
   * the system should display them ordered by creation date with most recent first.
   */
  it('should return nutrition plans ordered by creation date with most recent first', async () => {
    const numPlansArb = fc.integer({ min: 2, max: 10 });

    await fc.assert(
      fc.asyncProperty(
        numPlansArb,
        async (numPlans) => {
          const { user, token } = await createUserAndToken();
          const pet = new Pet({
            userId: user._id,
            name: 'TestPet',
            animalType: 'dog',
            age: 5,
            weight: 25,
            activityLevel: 'moderate',
            allergies: []
          });
          await pet.save();
          
          // Create multiple nutrition plans with different timestamps
          const plans = [];
          const baseTime = Date.now();
          
          for (let i = 0; i < numPlans; i++) {
            const plan = new NutritionPlan({
              petId: pet._id,
              name: `Plan ${i}`,
              description: `Test plan ${i}`,
              status: 'active',
              meals: [],
              createdAt: new Date(baseTime + (i * 1000)) // Each plan 1 second apart
            });
            
            // Add meal to avoid casting issues
            plan.meals.push({
              name: 'Test Meal',
              type: 'PROTEIN RICH',
              ingredients: ['Chicken', 'Rice'],
              portionSize: 200,
              calories: 300
            });
            
            await plan.save();
            plans.push(plan);
          }
          
          // Fetch plans for the pet
          const response = await request(app)
            .get(`/api/nutrition/pet/${pet._id}`)
            .set('Authorization', `Bearer ${token}`);
          
          expect(response.status).toBe(200);
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBe(numPlans);
          
          // Verify plans are ordered by createdAt (most recent first)
          for (let i = 0; i < response.body.length - 1; i++) {
            const currentTimestamp = new Date(response.body[i].createdAt).getTime();
            const nextTimestamp = new Date(response.body[i + 1].createdAt).getTime();
            expect(currentTimestamp).toBeGreaterThanOrEqual(nextTimestamp);
          }
          
          // Verify the first plan is the most recent one
          expect(response.body[0].name).toBe(`Plan ${numPlans - 1}`);
          // Verify the last plan is the oldest one
          expect(response.body[numPlans - 1].name).toBe('Plan 0');
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});

describe('Meal Recommendation Unit Tests', () => {
  /**
   * **Validates: Requirements 5.3**
   * Test allergy filtering with specific ingredients
   */
  it('should filter out meals containing chicken when pet is allergic to chicken', async () => {
    const { user, token } = await createUserAndToken();
    const pet = await createTestPet(user._id, ['chicken']);
    
    const response = await request(app)
      .post('/api/nutrition/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ petId: pet._id.toString() });
    
    expect(response.status).toBe(200);
    expect(response.body.meals).toBeDefined();
    
    // Verify no meal contains chicken
    response.body.meals.forEach(meal => {
      meal.ingredients.forEach(ingredient => {
        expect(ingredient.toLowerCase()).not.toContain('chicken');
      });
    });
  });

  /**
   * **Validates: Requirements 5.3**
   * Test allergy filtering with specific ingredients
   */
  it('should filter out meals containing salmon when pet is allergic to salmon', async () => {
    const { user, token } = await createUserAndToken();
    const pet = await createTestPet(user._id, ['salmon']);
    
    const response = await request(app)
      .post('/api/nutrition/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ petId: pet._id.toString() });
    
    expect(response.status).toBe(200);
    expect(response.body.meals).toBeDefined();
    
    // Verify no meal contains salmon
    response.body.meals.forEach(meal => {
      meal.ingredients.forEach(ingredient => {
        expect(ingredient.toLowerCase()).not.toContain('salmon');
      });
    });
  });

  /**
   * **Validates: Requirements 5.3**
   * Test allergy filtering with multiple allergies
   */
  it('should handle multiple allergies and still generate at least 2 meals', async () => {
    const { user, token } = await createUserAndToken();
    const pet = await createTestPet(user._id, ['beef', 'pork']);
    
    const response = await request(app)
      .post('/api/nutrition/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ petId: pet._id.toString() });
    
    expect(response.status).toBe(200);
    expect(response.body.meals).toBeDefined();
    expect(response.body.meals.length).toBeGreaterThanOrEqual(2);
    
    // Verify no meal contains beef or pork
    response.body.meals.forEach(meal => {
      meal.ingredients.forEach(ingredient => {
        expect(ingredient.toLowerCase()).not.toContain('beef');
        expect(ingredient.toLowerCase()).not.toContain('pork');
      });
    });
  });

  /**
   * **Validates: Requirements 5.4**
   * Test health condition prioritization
   */
  it('should prioritize appropriate meal types for pets with health conditions', async () => {
    const { user, token } = await createUserAndToken();
    
    // Create pet with health condition
    const pet = new Pet({
      userId: user._id,
      name: 'TestPet',
      animalType: 'dog',
      breed: 'Golden Retriever',
      age: 8,
      weight: 30,
      activityLevel: 'low',
      allergies: [],
      healthConditions: ['digestive issues']
    });
    await pet.save();
    
    const response = await request(app)
      .post('/api/nutrition/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ petId: pet._id.toString() });
    
    expect(response.status).toBe(200);
    expect(response.body.meals).toBeDefined();
    
    // Verify meal types are appropriate (should include DIGESTION AID)
    const mealTypes = response.body.meals.map(meal => meal.type);
    expect(mealTypes).toContain('DIGESTION AID');
  });

  /**
   * **Validates: Requirements 5.1**
   * Test minimum 2 meals generated
   */
  it('should generate at least 2 meals for a small pet', async () => {
    const { user, token } = await createUserAndToken();
    
    const pet = new Pet({
      userId: user._id,
      name: 'TinyPet',
      animalType: 'cat',
      breed: 'Siamese',
      age: 2,
      weight: 5,
      activityLevel: 'low',
      allergies: []
    });
    await pet.save();
    
    const response = await request(app)
      .post('/api/nutrition/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ petId: pet._id.toString() });
    
    expect(response.status).toBe(200);
    expect(response.body.meals).toBeDefined();
    expect(response.body.meals.length).toBeGreaterThanOrEqual(2);
  });

  /**
   * **Validates: Requirements 5.1**
   * Test minimum 2 meals generated
   */
  it('should generate at least 2 meals for a large pet', async () => {
    const { user, token } = await createUserAndToken();
    
    const pet = new Pet({
      userId: user._id,
      name: 'BigPet',
      animalType: 'dog',
      breed: 'Great Dane',
      age: 4,
      weight: 80,
      activityLevel: 'high',
      allergies: []
    });
    await pet.save();
    
    const response = await request(app)
      .post('/api/nutrition/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ petId: pet._id.toString() });
    
    expect(response.status).toBe(200);
    expect(response.body.meals).toBeDefined();
    expect(response.body.meals.length).toBeGreaterThanOrEqual(2);
  });

  /**
   * **Validates: Requirements 5.2**
   * Test meal structure completeness
   */
  it('should include all required fields in meal structure', async () => {
    const { user, token } = await createUserAndToken();
    const pet = await createTestPet(user._id, []);
    
    const response = await request(app)
      .post('/api/nutrition/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ petId: pet._id.toString() });
    
    expect(response.status).toBe(200);
    expect(response.body.meals).toBeDefined();
    
    // Verify each meal has complete structure
    response.body.meals.forEach(meal => {
      expect(meal).toHaveProperty('name');
      expect(meal.name).toBeTruthy();
      expect(typeof meal.name).toBe('string');
      
      expect(meal).toHaveProperty('type');
      expect(meal.type).toBeTruthy();
      expect(typeof meal.type).toBe('string');
      
      expect(meal).toHaveProperty('ingredients');
      expect(Array.isArray(meal.ingredients)).toBe(true);
      expect(meal.ingredients.length).toBeGreaterThan(0);
      
      expect(meal).toHaveProperty('portionSize');
      expect(typeof meal.portionSize).toBe('number');
      expect(meal.portionSize).toBeGreaterThan(0);
      
      expect(meal).toHaveProperty('calories');
      expect(typeof meal.calories).toBe('number');
      expect(meal.calories).toBeGreaterThan(0);
    });
  });

  /**
   * **Validates: Requirements 5.2**
   * Test meal structure completeness - ingredients are non-empty strings
   */
  it('should ensure all ingredients are non-empty strings', async () => {
    const { user, token } = await createUserAndToken();
    const pet = await createTestPet(user._id, []);
    
    const response = await request(app)
      .post('/api/nutrition/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ petId: pet._id.toString() });
    
    expect(response.status).toBe(200);
    expect(response.body.meals).toBeDefined();
    
    // Verify each ingredient is a non-empty string
    response.body.meals.forEach(meal => {
      meal.ingredients.forEach(ingredient => {
        expect(typeof ingredient).toBe('string');
        expect(ingredient.length).toBeGreaterThan(0);
        expect(ingredient.trim()).toBe(ingredient); // No leading/trailing whitespace
      });
    });
  });

  /**
   * **Validates: Requirements 5.3**
   * Test error handling when too many allergies prevent meal generation
   */
  it('should return error when allergies prevent generating minimum 2 meals', async () => {
    const { user, token } = await createUserAndToken();
    
    // Create pet with allergies to all available meal ingredients
    const pet = await createTestPet(user._id, ['salmon', 'chicken', 'turkey']);
    
    const response = await request(app)
      .post('/api/nutrition/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ petId: pet._id.toString() });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Unable to generate sufficient meal recommendations');
  });

  /**
   * **Validates: Requirements 5.4**
   * Test that meal types are appropriate classifications
   */
  it('should use valid meal type classifications', async () => {
    const { user, token } = await createUserAndToken();
    const pet = await createTestPet(user._id, []);
    
    const response = await request(app)
      .post('/api/nutrition/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({ petId: pet._id.toString() });
    
    expect(response.status).toBe(200);
    expect(response.body.meals).toBeDefined();
    
    const validTypes = ['PROTEIN RICH', 'DIGESTION AID', 'BALANCED', 'WEIGHT MANAGEMENT', 'SENIOR CARE'];
    
    // Verify each meal has a valid type
    response.body.meals.forEach(meal => {
      expect(validTypes).toContain(meal.type);
    });
  });
});
