const request = require('supertest');
const express = require('express');
const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Meal = require('../models/Meal');
const Pet = require('../models/Pet');
const User = require('../models/User');
const mealsRouter = require('./meals');
const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/api/meals', mealsRouter);

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
  await Meal.deleteMany({});
  await Pet.deleteMany({});
  await User.deleteMany({});
});

// Helper function to create a test user and get auth token
async function createUserAndToken() {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('hashedpass123!', 4);
  const user = new User({
    email: `test${Date.now()}@example.com`,
    password: hashedPassword,
    name: 'Test User'
  });
  await user.save();
  
  const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET || 'secret');
  return { user, token };
}

// Helper function to create a test pet
async function createTestPet(userId) {
  const pet = new Pet({
    userId,
    name: 'TestPet',
    animalType: 'dog',
    age: 3,
    weight: 25
  });
  await pet.save();
  return pet;
}

describe('Meal Tracking Property Tests', () => {
  /**
   * Property 29: Meal Event Creation with Required Fields
   * **Validates: Requirements 7.1, 7.3**
   * 
   * Property: For any meal log, when a pet owner logs it, the system should create 
   * a meal event with timestamp (current time), portionSize, calories, and 
   * completion status (default false) within 1 second.
   */
  it('should create meal event with required fields for any valid meal data', async () => {
    // Custom generators for meal data
    const mealNameArb = fc.stringOf(
      fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' '),
      { minLength: 3, maxLength: 50 }
    ).filter(s => s.trim().length > 0);

    const mealTypeArb = fc.constantFrom('PROTEIN RICH', 'DIGESTION AID', 'WEIGHT MANAGEMENT', 'ENERGY BOOST');
    
    const portionSizeArb = fc.integer({ min: 50, max: 1000 });
    
    const caloriesArb = fc.integer({ min: 100, max: 2000 });

    await fc.assert(
      fc.asyncProperty(
        mealNameArb,
        mealTypeArb,
        portionSizeArb,
        caloriesArb,
        async (name, type, portionSize, calories) => {
          // Create user and pet for this test
          const { user, token } = await createUserAndToken();
          const pet = await createTestPet(user._id);
          
          const startTime = Date.now();
          const beforeRequest = new Date();
          
          const response = await request(app)
            .post('/api/meals')
            .set('Authorization', `Bearer ${token}`)
            .send({
              petId: pet._id.toString(),
              name: name.trim(),
              type,
              portionSize,
              calories
            });
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Verify response structure
          expect(response.status).toBe(201);
          expect(response.body).toHaveProperty('_id');
          expect(response.body.petId).toBe(pet._id.toString());
          expect(response.body.name).toBe(name.trim());
          expect(response.body.type).toBe(type);
          expect(response.body.portionSize).toBe(portionSize);
          expect(response.body.calories).toBe(calories);
          expect(response.body.completed).toBe(false); // Default value
          expect(response.body).toHaveProperty('timestamp');
          
          // Verify timestamp is current time (within reasonable margin)
          const timestamp = new Date(response.body.timestamp);
          const afterRequest = new Date();
          expect(timestamp.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
          expect(timestamp.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
          
          // Verify meal was created in database
          const mealInDb = await Meal.findById(response.body._id);
          expect(mealInDb).not.toBeNull();
          expect(mealInDb.petId.toString()).toBe(pet._id.toString());
          expect(mealInDb.name).toBe(name.trim());
          expect(mealInDb.portionSize).toBe(portionSize);
          expect(mealInDb.calories).toBe(calories);
          expect(mealInDb.completed).toBe(false);
          
          // Verify performance requirement (< 1 second)
          expect(duration).toBeLessThan(1000);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000); // 60 second timeout for 100 iterations

  /**
   * Property 30: Meal Completion Status Update
   * **Validates: Requirements 7.4**
   * 
   * Property: For any meal event, when a pet owner marks it as completed, 
   * the system should update the completed field to true within 500 milliseconds.
   */
  it('should update meal completion status for any meal event', async () => {
    const mealNameArb = fc.stringOf(
      fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' '),
      { minLength: 3, maxLength: 50 }
    ).filter(s => s.trim().length > 0);

    const mealTypeArb = fc.constantFrom('PROTEIN RICH', 'DIGESTION AID', 'WEIGHT MANAGEMENT', 'ENERGY BOOST');
    
    const portionSizeArb = fc.integer({ min: 50, max: 1000 });
    
    const caloriesArb = fc.integer({ min: 100, max: 2000 });

    await fc.assert(
      fc.asyncProperty(
        mealNameArb,
        mealTypeArb,
        portionSizeArb,
        caloriesArb,
        async (name, type, portionSize, calories) => {
          // Create user and pet for this test
          const { user, token } = await createUserAndToken();
          const pet = await createTestPet(user._id);
          
          // First create a meal
          const meal = new Meal({
            petId: pet._id,
            name: name.trim(),
            type,
            portionSize,
            calories,
            completed: false
          });
          await meal.save();
          
          // Now update the completion status
          const startTime = Date.now();
          
          const response = await request(app)
            .put(`/api/meals/${meal._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ completed: true });
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Verify response
          expect(response.status).toBe(200);
          expect(response.body.completed).toBe(true);
          expect(response.body._id).toBe(meal._id.toString());
          
          // Verify meal was updated in database
          const updatedMeal = await Meal.findById(meal._id);
          expect(updatedMeal.completed).toBe(true);
          
          // Verify performance requirement (< 500 milliseconds)
          expect(duration).toBeLessThan(500);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000); // 60 second timeout for 100 iterations

  /**
   * Property 31: Meals Ordered by Timestamp
   * **Validates: Requirements 7.5**
   * 
   * Property: For any set of meal events for a pet, when viewing meal history, 
   * the system should display them ordered by timestamp with most recent first.
   */
  it('should return meals ordered by timestamp with most recent first', async () => {
    // Generator for number of meals to create (2-10)
    const numMealsArb = fc.integer({ min: 2, max: 10 });

    await fc.assert(
      fc.asyncProperty(
        numMealsArb,
        async (numMeals) => {
          // Create user and pet for this test
          const { user, token } = await createUserAndToken();
          const pet = await createTestPet(user._id);
          
          // Create multiple meals with different timestamps
          const meals = [];
          const baseTime = Date.now();
          
          for (let i = 0; i < numMeals; i++) {
            const meal = new Meal({
              petId: pet._id,
              name: `Meal ${i}`,
              type: 'PROTEIN RICH',
              portionSize: 200,
              calories: 300,
              timestamp: new Date(baseTime + (i * 1000)) // Each meal 1 second apart
            });
            await meal.save();
            meals.push(meal);
          }
          
          // Fetch meals for the pet
          const response = await request(app)
            .get(`/api/meals/pet/${pet._id}`)
            .set('Authorization', `Bearer ${token}`);
          
          // Verify response
          expect(response.status).toBe(200);
          expect(Array.isArray(response.body)).toBe(true);
          expect(response.body.length).toBe(numMeals);
          
          // Verify meals are ordered by timestamp (most recent first)
          for (let i = 0; i < response.body.length - 1; i++) {
            const currentTimestamp = new Date(response.body[i].timestamp).getTime();
            const nextTimestamp = new Date(response.body[i + 1].timestamp).getTime();
            expect(currentTimestamp).toBeGreaterThanOrEqual(nextTimestamp);
          }
          
          // Verify the first meal is the most recent one
          expect(response.body[0].name).toBe(`Meal ${numMeals - 1}`);
          // Verify the last meal is the oldest one
          expect(response.body[numMeals - 1].name).toBe('Meal 0');
        }
      ),
      { numRuns: 100 }
    );
  }, 60000); // 60 second timeout for 100 iterations

  /**
   * Property 32: Meal Pet Association
   * **Validates: Requirements 7.6**
   * 
   * Property: For any meal event, the system should associate it with a 
   * specific pet profile via petId.
   */
  it('should associate each meal event with a specific pet profile', async () => {
    const mealNameArb = fc.stringOf(
      fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' '),
      { minLength: 3, maxLength: 50 }
    ).filter(s => s.trim().length > 0);

    const portionSizeArb = fc.integer({ min: 50, max: 1000 });
    const caloriesArb = fc.integer({ min: 100, max: 2000 });

    await fc.assert(
      fc.asyncProperty(
        mealNameArb,
        portionSizeArb,
        caloriesArb,
        async (name, portionSize, calories) => {
          // Create user and two different pets
          const { user, token } = await createUserAndToken();
          const pet1 = await createTestPet(user._id);
          const pet2 = new Pet({
            userId: user._id,
            name: 'TestPet2',
            animalType: 'cat',
            age: 2,
            weight: 5
          });
          await pet2.save();
          
          // Create meal for pet1
          const response = await request(app)
            .post('/api/meals')
            .set('Authorization', `Bearer ${token}`)
            .send({
              petId: pet1._id.toString(),
              name: name.trim(),
              type: 'PROTEIN RICH',
              portionSize,
              calories
            });
          
          expect(response.status).toBe(201);
          expect(response.body.petId).toBe(pet1._id.toString());
          
          // Verify meal is associated with pet1 in database
          const mealInDb = await Meal.findById(response.body._id);
          expect(mealInDb.petId.toString()).toBe(pet1._id.toString());
          
          // Verify meal appears in pet1's meal history
          const pet1Meals = await request(app)
            .get(`/api/meals/pet/${pet1._id}`)
            .set('Authorization', `Bearer ${token}`);
          
          expect(pet1Meals.status).toBe(200);
          expect(pet1Meals.body.length).toBe(1);
          expect(pet1Meals.body[0]._id).toBe(response.body._id);
          
          // Verify meal does NOT appear in pet2's meal history
          const pet2Meals = await request(app)
            .get(`/api/meals/pet/${pet2._id}`)
            .set('Authorization', `Bearer ${token}`);
          
          expect(pet2Meals.status).toBe(200);
          expect(pet2Meals.body.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000); // 60 second timeout for 100 iterations

  /**
   * Property 33: Daily Calorie Sum Calculation
   * **Validates: Requirements 7.7**
   * 
   * Property: For any set of completed meal events for a pet on the current day, 
   * the system should calculate total daily caloric intake as the sum of all 
   * calories from those meals.
   */
  it('should calculate total daily caloric intake from completed meals', async () => {
    // Generator for number of completed meals (1-10)
    const numCompletedMealsArb = fc.integer({ min: 1, max: 10 });
    // Generator for number of incomplete meals (0-5)
    const numIncompleteMealsArb = fc.integer({ min: 0, max: 5 });
    // Generator for calories per meal
    const caloriesArb = fc.integer({ min: 100, max: 800 });

    await fc.assert(
      fc.asyncProperty(
        numCompletedMealsArb,
        numIncompleteMealsArb,
        async (numCompletedMeals, numIncompleteMeals) => {
          // Create user and pet for this test
          const { user, token } = await createUserAndToken();
          const pet = await createTestPet(user._id);
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          let expectedTotalCalories = 0;
          
          // Create completed meals for today
          for (let i = 0; i < numCompletedMeals; i++) {
            const calories = 100 + (i * 50); // Varying calories
            expectedTotalCalories += calories;
            
            const meal = new Meal({
              petId: pet._id,
              name: `Completed Meal ${i}`,
              type: 'PROTEIN RICH',
              portionSize: 200,
              calories,
              timestamp: new Date(today.getTime() + (i * 3600000)), // Each meal 1 hour apart
              completed: true
            });
            await meal.save();
          }
          
          // Create incomplete meals for today (should NOT be counted)
          for (let i = 0; i < numIncompleteMeals; i++) {
            const meal = new Meal({
              petId: pet._id,
              name: `Incomplete Meal ${i}`,
              type: 'PROTEIN RICH',
              portionSize: 200,
              calories: 500,
              timestamp: new Date(today.getTime() + ((numCompletedMeals + i) * 3600000)),
              completed: false
            });
            await meal.save();
          }
          
          // Create a completed meal from yesterday (should NOT be counted)
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayMeal = new Meal({
            petId: pet._id,
            name: 'Yesterday Meal',
            type: 'PROTEIN RICH',
            portionSize: 200,
            calories: 1000,
            timestamp: yesterday,
            completed: true
          });
          await yesterdayMeal.save();
          
          // Fetch daily stats
          const response = await request(app)
            .get(`/api/meals/pet/${pet._id}/stats`)
            .set('Authorization', `Bearer ${token}`);
          
          // Verify response
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('totalCalories');
          expect(response.body).toHaveProperty('mealsCompleted');
          
          // Verify total calories matches sum of completed meals from today
          expect(response.body.totalCalories).toBe(expectedTotalCalories);
          expect(response.body.mealsCompleted).toBe(numCompletedMeals);
        }
      ),
      { numRuns: 100 }
    );
  }, 60000); // 60 second timeout for 100 iterations
});

describe('Meal Time Classification Unit Tests', () => {
  /**
   * Unit tests for meal time classifications
   * **Validates: Requirements 7.2, 7.4, 7.7**
   */

  describe('Meal Time Classifications', () => {
    /**
     * **Validates: Requirements 7.2**
     * Test each meal time (breakfast, lunch, dinner, snack)
     */
    it('should create a meal with breakfast classification', async () => {
      const { user, token } = await createUserAndToken();
      const pet = await createTestPet(user._id);

      const response = await request(app)
        .post('/api/meals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          petId: pet._id.toString(),
          name: 'Morning Kibble',
          type: 'PROTEIN RICH',
          portionSize: 200,
          calories: 300,
          mealTime: 'breakfast'
        });

      expect(response.status).toBe(201);
      expect(response.body.mealTime).toBe('breakfast');

      const mealInDb = await Meal.findById(response.body._id);
      expect(mealInDb.mealTime).toBe('breakfast');
    });

    it('should create a meal with lunch classification', async () => {
      const { user, token } = await createUserAndToken();
      const pet = await createTestPet(user._id);

      const response = await request(app)
        .post('/api/meals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          petId: pet._id.toString(),
          name: 'Midday Meal',
          type: 'DIGESTION AID',
          portionSize: 250,
          calories: 400,
          mealTime: 'lunch'
        });

      expect(response.status).toBe(201);
      expect(response.body.mealTime).toBe('lunch');

      const mealInDb = await Meal.findById(response.body._id);
      expect(mealInDb.mealTime).toBe('lunch');
    });

    it('should create a meal with dinner classification', async () => {
      const { user, token } = await createUserAndToken();
      const pet = await createTestPet(user._id);

      const response = await request(app)
        .post('/api/meals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          petId: pet._id.toString(),
          name: 'Evening Feast',
          type: 'WEIGHT MANAGEMENT',
          portionSize: 300,
          calories: 500,
          mealTime: 'dinner'
        });

      expect(response.status).toBe(201);
      expect(response.body.mealTime).toBe('dinner');

      const mealInDb = await Meal.findById(response.body._id);
      expect(mealInDb.mealTime).toBe('dinner');
    });

    it('should create a meal with snack classification', async () => {
      const { user, token } = await createUserAndToken();
      const pet = await createTestPet(user._id);

      const response = await request(app)
        .post('/api/meals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          petId: pet._id.toString(),
          name: 'Treat Time',
          type: 'ENERGY BOOST',
          portionSize: 50,
          calories: 100,
          mealTime: 'snack'
        });

      expect(response.status).toBe(201);
      expect(response.body.mealTime).toBe('snack');

      const mealInDb = await Meal.findById(response.body._id);
      expect(mealInDb.mealTime).toBe('snack');
    });
  });

  describe('Meal Completion Toggle', () => {
    /**
     * **Validates: Requirements 7.4**
     * Test meal completion toggle
     */
    it('should toggle meal completion from false to true', async () => {
      const { user, token } = await createUserAndToken();
      const pet = await createTestPet(user._id);

      // Create a meal with completed = false
      const meal = new Meal({
        petId: pet._id,
        name: 'Test Meal',
        type: 'PROTEIN RICH',
        portionSize: 200,
        calories: 300,
        completed: false
      });
      await meal.save();

      expect(meal.completed).toBe(false);

      // Toggle completion to true
      const startTime = Date.now();
      const response = await request(app)
        .put(`/api/meals/${meal._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ completed: true });
      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(true);
      expect(duration).toBeLessThan(500); // Within 500ms requirement

      const updatedMeal = await Meal.findById(meal._id);
      expect(updatedMeal.completed).toBe(true);
    });

    it('should toggle meal completion from true to false', async () => {
      const { user, token } = await createUserAndToken();
      const pet = await createTestPet(user._id);

      // Create a meal with completed = true
      const meal = new Meal({
        petId: pet._id,
        name: 'Test Meal',
        type: 'PROTEIN RICH',
        portionSize: 200,
        calories: 300,
        completed: true
      });
      await meal.save();

      expect(meal.completed).toBe(true);

      // Toggle completion to false
      const startTime = Date.now();
      const response = await request(app)
        .put(`/api/meals/${meal._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ completed: false });
      const duration = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(false);
      expect(duration).toBeLessThan(500); // Within 500ms requirement

      const updatedMeal = await Meal.findById(meal._id);
      expect(updatedMeal.completed).toBe(false);
    });
  });

  describe('Daily Calorie Sum with Multiple Meals', () => {
    /**
     * **Validates: Requirements 7.7**
     * Test daily calorie sum with multiple meals
     */
    it('should calculate daily calorie sum with multiple completed meals of different meal times', async () => {
      const { user, token } = await createUserAndToken();
      const pet = await createTestPet(user._id);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Create breakfast
      const breakfast = new Meal({
        petId: pet._id,
        name: 'Breakfast',
        type: 'PROTEIN RICH',
        portionSize: 200,
        calories: 250,
        mealTime: 'breakfast',
        timestamp: new Date(today.getTime() + 8 * 3600000), // 8 AM
        completed: true
      });
      await breakfast.save();

      // Create lunch
      const lunch = new Meal({
        petId: pet._id,
        name: 'Lunch',
        type: 'DIGESTION AID',
        portionSize: 250,
        calories: 350,
        mealTime: 'lunch',
        timestamp: new Date(today.getTime() + 12 * 3600000), // 12 PM
        completed: true
      });
      await lunch.save();

      // Create snack
      const snack = new Meal({
        petId: pet._id,
        name: 'Snack',
        type: 'ENERGY BOOST',
        portionSize: 50,
        calories: 100,
        mealTime: 'snack',
        timestamp: new Date(today.getTime() + 15 * 3600000), // 3 PM
        completed: true
      });
      await snack.save();

      // Create dinner
      const dinner = new Meal({
        petId: pet._id,
        name: 'Dinner',
        type: 'WEIGHT MANAGEMENT',
        portionSize: 300,
        calories: 400,
        mealTime: 'dinner',
        timestamp: new Date(today.getTime() + 18 * 3600000), // 6 PM
        completed: true
      });
      await dinner.save();

      // Fetch daily stats
      const response = await request(app)
        .get(`/api/meals/pet/${pet._id}/stats`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.totalCalories).toBe(1100); // 250 + 350 + 100 + 400
      expect(response.body.mealsCompleted).toBe(4);
    });

    it('should exclude incomplete meals from daily calorie sum', async () => {
      const { user, token } = await createUserAndToken();
      const pet = await createTestPet(user._id);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Create completed breakfast
      const breakfast = new Meal({
        petId: pet._id,
        name: 'Breakfast',
        type: 'PROTEIN RICH',
        portionSize: 200,
        calories: 300,
        mealTime: 'breakfast',
        timestamp: today,
        completed: true
      });
      await breakfast.save();

      // Create incomplete lunch
      const lunch = new Meal({
        petId: pet._id,
        name: 'Lunch',
        type: 'DIGESTION AID',
        portionSize: 250,
        calories: 400,
        mealTime: 'lunch',
        timestamp: today,
        completed: false
      });
      await lunch.save();

      // Create completed dinner
      const dinner = new Meal({
        petId: pet._id,
        name: 'Dinner',
        type: 'WEIGHT MANAGEMENT',
        portionSize: 300,
        calories: 500,
        mealTime: 'dinner',
        timestamp: today,
        completed: true
      });
      await dinner.save();

      // Fetch daily stats
      const response = await request(app)
        .get(`/api/meals/pet/${pet._id}/stats`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.totalCalories).toBe(800); // 300 + 500 (lunch excluded)
      expect(response.body.mealsCompleted).toBe(2);
    });

    it('should return zero calories when no meals are completed', async () => {
      const { user, token } = await createUserAndToken();
      const pet = await createTestPet(user._id);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Create incomplete meals
      const breakfast = new Meal({
        petId: pet._id,
        name: 'Breakfast',
        type: 'PROTEIN RICH',
        portionSize: 200,
        calories: 300,
        mealTime: 'breakfast',
        timestamp: today,
        completed: false
      });
      await breakfast.save();

      const lunch = new Meal({
        petId: pet._id,
        name: 'Lunch',
        type: 'DIGESTION AID',
        portionSize: 250,
        calories: 400,
        mealTime: 'lunch',
        timestamp: today,
        completed: false
      });
      await lunch.save();

      // Fetch daily stats
      const response = await request(app)
        .get(`/api/meals/pet/${pet._id}/stats`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.totalCalories).toBe(0);
      expect(response.body.mealsCompleted).toBe(0);
    });
  });
});
