const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/User');
const Pet = require('../../models/Pet');
const Meal = require('../../models/Meal');

process.env.JWT_SECRET = 'test-jwt-secret-integration';
process.env.NODE_ENV = 'test';

let app;
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Import routes after DB connection
  const usersRouter = require('../../routes/users');
  const petsRouter = require('../../routes/pets');
  const mealsRouter = require('../../routes/meals');
  const nutritionRouter = require('../../routes/nutrition');

  app = express();
  app.use(express.json());
  app.use('/api/users', usersRouter);
  app.use('/api/pets', petsRouter);
  app.use('/api/meals', mealsRouter);
  app.use('/api/nutrition', nutritionRouter);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  await Pet.deleteMany({});
  await Meal.deleteMany({});
});

describe('End-to-End User Journey Integration Tests', () => {
  it('should complete full user onboarding and pet management flow', async () => {
    // Step 1: Register user
    const registerResponse = await request(app)
      .post('/api/users/register')
      .send({
        email: 'integration@example.com',
        password: 'IntegTest123!',
        name: 'Integration User'
      });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.token).toBeDefined();
    const token = registerResponse.body.token;
    const userId = registerResponse.body.user.id;

    // Step 2: Create first pet
    const petResponse = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Buddy',
        animalType: 'dog',
        age: 3,
        weight: 25,
        activityLevel: 'high',
        allergies: ['chicken'],
        healthConditions: []
      });

    expect(petResponse.status).toBe(201);
    expect(petResponse.body.name).toBe('Buddy');
    const petId = petResponse.body._id;

    // Step 3: Log a meal
    const mealResponse = await request(app)
      .post('/api/meals')
      .set('Authorization', `Bearer ${token}`)
      .send({
        petId: petId,
        name: 'Premium Dog Food',
        type: 'dry',
        portionSize: 2,
        calories: 400,
        timestamp: new Date()
      });

    expect(mealResponse.status).toBe(201);
    expect(mealResponse.body.name).toBe('Premium Dog Food');

    // Step 4: Get pet's meals
    const mealsListResponse = await request(app)
      .get(`/api/meals/pet/${petId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(mealsListResponse.status).toBe(200);
    expect(mealsListResponse.body.length).toBe(1);

    // Step 5: Generate nutrition plan
    const nutritionResponse = await request(app)
      .post('/api/nutrition/generate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        petId: petId,
        preferences: {
          mealType: 'dry',
          budget: 'medium'
        }
      });

    expect(nutritionResponse.status).toBe(200);
    expect(nutritionResponse.body.petId).toBe(petId);
    expect(nutritionResponse.body.meals).toBeDefined();

    // Step 6: Update pet information
    const updateResponse = await request(app)
      .put(`/api/pets/${petId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        weight: 26,
        activityLevel: 'moderate'
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.weight).toBe(26);

    // Step 7: Get all user's pets
    const petsListResponse = await request(app)
      .get(`/api/pets/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(petsListResponse.status).toBe(200);
    expect(petsListResponse.body.length).toBe(1);
  }, 30000);

  it('should handle multi-pet household workflow', async () => {
    // Register user
    const registerResponse = await request(app)
      .post('/api/users/register')
      .send({
        email: 'multipet@example.com',
        password: 'MultiPet123!',
        name: 'Multi Pet Owner'
      });

    const token = registerResponse.body.token;
    const userId = registerResponse.body.user.id;

    // Create multiple pets
    const pets = [];
    const petTypes = [
      { name: 'Max', animalType: 'dog', age: 5, weight: 30 },
      { name: 'Whiskers', animalType: 'cat', age: 3, weight: 10 },
      { name: 'Tweety', animalType: 'bird', age: 2, weight: 0.5 }
    ];

    for (const petData of petTypes) {
      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${token}`)
        .send(petData);

      expect(response.status).toBe(201);
      pets.push(response.body);
    }

    // Verify all pets are created
    const petsListResponse = await request(app)
      .get(`/api/pets/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(petsListResponse.status).toBe(200);
    expect(petsListResponse.body.length).toBe(3);

    // Log meals for each pet
    for (const pet of pets) {
      const mealResponse = await request(app)
        .post('/api/meals')
        .set('Authorization', `Bearer ${token}`)
        .send({
          petId: pet._id,
          name: `Food for ${pet.name}`,
          type: 'dry',
          portionSize: 1,
          calories: 200,
          timestamp: new Date()
        });

      expect(mealResponse.status).toBe(201);
    }

    // Verify each pet has meals
    for (const pet of pets) {
      const mealsResponse = await request(app)
        .get(`/api/meals/pet/${pet._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(mealsResponse.status).toBe(200);
      expect(mealsResponse.body.length).toBeGreaterThan(0);
    }
  }, 30000);

  it('should handle authentication and authorization correctly', async () => {
    // Create two users
    const user1Response = await request(app)
      .post('/api/users/register')
      .send({
        email: 'user1@example.com',
        password: 'User1Pass123!',
        name: 'User One'
      });

    const user2Response = await request(app)
      .post('/api/users/register')
      .send({
        email: 'user2@example.com',
        password: 'User2Pass123!',
        name: 'User Two'
      });

    const token1 = user1Response.body.token;
    const token2 = user2Response.body.token;

    // User 1 creates a pet
    const petResponse = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${token1}`)
      .send({
        name: 'User1Pet',
        animalType: 'dog',
        age: 4,
        weight: 20
      });

    const petId = petResponse.body._id;

    // User 2 should NOT be able to access User 1's pet
    const unauthorizedResponse = await request(app)
      .get(`/api/pets/${petId}`)
      .set('Authorization', `Bearer ${token2}`);

    // Should return 404 or 403 (depending on implementation)
    expect([403, 404]).toContain(unauthorizedResponse.status);

    // User 1 should be able to access their own pet
    const authorizedResponse = await request(app)
      .get(`/api/pets/${petId}`)
      .set('Authorization', `Bearer ${token1}`);

    expect(authorizedResponse.status).toBe(200);
    expect(authorizedResponse.body.name).toBe('User1Pet');
  }, 30000);

  it('should handle data validation and error cases', async () => {
    // Register user
    const registerResponse = await request(app)
      .post('/api/users/register')
      .send({
        email: 'validation@example.com',
        password: 'ValidTest123!',
        name: 'Validation User'
      });

    const token = registerResponse.body.token;

    // Try to create pet with invalid data
    const invalidPetResponse = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Invalid Pet',
        animalType: 'dragon', // Invalid type
        age: -1, // Invalid age
        weight: 0 // Invalid weight
      });

    expect(invalidPetResponse.status).toBe(400);

    // Try to create pet with missing required fields
    const missingFieldsResponse = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Incomplete Pet'
        // Missing required fields
      });

    expect(missingFieldsResponse.status).toBe(400);

    // Create valid pet
    const validPetResponse = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Valid Pet',
        animalType: 'cat',
        age: 2,
        weight: 8
      });

    expect(validPetResponse.status).toBe(201);
  }, 30000);
});
