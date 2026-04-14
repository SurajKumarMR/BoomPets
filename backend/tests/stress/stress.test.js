const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Pet = require('../../models/Pet');
const Meal = require('../../models/Meal');

process.env.JWT_SECRET = 'test-jwt-secret-stress';
process.env.NODE_ENV = 'test';

let app;
let mongoServer;
let authToken;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test user
  const hashedPassword = await bcrypt.hash('StressTest123!', 4);
  const user = await User.create({
    email: 'stress@example.com',
    password: hashedPassword,
    name: 'Stress Test User'
  });

  userId = user._id.toString();
  authToken = jwt.sign({ userId: userId }, process.env.JWT_SECRET);

  // Import routes
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

describe('Stress Tests', () => {
  it('should handle high volume of pet creations', async () => {
    const petCount = 200;
    const batchSize = 20;
    const batches = Math.ceil(petCount / batchSize);
    let successCount = 0;
    let failCount = 0;

    for (let batch = 0; batch < batches; batch++) {
      const promises = [];
      
      for (let i = 0; i < batchSize; i++) {
        const petIndex = batch * batchSize + i;
        promises.push(
          request(app)
            .post('/api/pets')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              name: `Stress Pet ${petIndex}`,
              animalType: ['dog', 'cat', 'bird', 'fish'][petIndex % 4],
              age: (petIndex % 10) + 1,
              weight: (petIndex % 30) + 5
            })
            .then(res => {
              if (res.status === 201) successCount++;
              else failCount++;
              return res;
            })
            .catch(() => {
              failCount++;
            })
        );
      }

      await Promise.all(promises);
    }

    console.log(`Stress test: ${successCount} successful, ${failCount} failed out of ${petCount}`);
    expect(successCount).toBeGreaterThan(petCount * 0.95); // 95% success rate
  }, 60000);

  it('should handle rapid sequential updates', async () => {
    // Create a pet
    const petResponse = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Update Stress Pet',
        animalType: 'dog',
        age: 3,
        weight: 20
      });

    const petId = petResponse.body._id;
    const updateCount = 50;
    let successCount = 0;

    for (let i = 0; i < updateCount; i++) {
      const response = await request(app)
        .put(`/api/pets/${petId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          weight: 20 + i,
          age: 3 + (i % 5)
        });

      if (response.status === 200) successCount++;
    }

    console.log(`Rapid updates: ${successCount}/${updateCount} successful`);
    expect(successCount).toBe(updateCount);
  }, 30000);

  it('should handle memory-intensive operations', async () => {
    // Create pets with large data
    const largeDataPets = 50;
    const promises = [];

    for (let i = 0; i < largeDataPets; i++) {
      promises.push(
        request(app)
          .post('/api/pets')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: `Memory Test Pet ${i}`,
            animalType: 'dog',
            age: 5,
            weight: 25,
            allergies: Array(20).fill(0).map((_, j) => `Allergy ${i}-${j}`),
            healthConditions: Array(10).fill(0).map((_, j) => `Condition ${i}-${j}`)
          })
      );
    }

    const responses = await Promise.all(promises);
    const successCount = responses.filter(r => r.status === 201).length;

    console.log(`Memory test: ${successCount}/${largeDataPets} pets created with large data`);
    expect(successCount).toBeGreaterThan(largeDataPets * 0.9);
  }, 60000);

  it('should handle concurrent mixed operations', async () => {
    // Create some pets first
    const pets = [];
    for (let i = 0; i < 10; i++) {
      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Mixed Op Pet ${i}`,
          animalType: 'dog',
          age: 3,
          weight: 20
        });
      pets.push(response.body._id);
    }

    // Perform mixed operations concurrently
    const operations = 100;
    const promises = [];

    for (let i = 0; i < operations; i++) {
      const opType = i % 4;
      const petId = pets[i % pets.length];

      switch (opType) {
        case 0: // Create
          promises.push(
            request(app)
              .post('/api/pets')
              .set('Authorization', `Bearer ${authToken}`)
              .send({
                name: `Concurrent Pet ${i}`,
                animalType: 'cat',
                age: 2,
                weight: 10
              })
          );
          break;
        case 1: // Read
          promises.push(
            request(app)
              .get(`/api/pets/${petId}`)
              .set('Authorization', `Bearer ${authToken}`)
          );
          break;
        case 2: // Update
          promises.push(
            request(app)
              .put(`/api/pets/${petId}`)
              .set('Authorization', `Bearer ${authToken}`)
              .send({ weight: 20 + i })
          );
          break;
        case 3: // List
          promises.push(
            request(app)
              .get(`/api/pets/user/${userId}`)
              .set('Authorization', `Bearer ${authToken}`)
          );
          break;
      }
    }

    const responses = await Promise.all(promises);
    const successCount = responses.filter(r => r.status >= 200 && r.status < 300).length;

    console.log(`Mixed operations: ${successCount}/${operations} successful`);
    expect(successCount).toBeGreaterThan(operations * 0.9);
  }, 60000);

  it('should recover from error conditions', async () => {
    // Test with invalid data
    const invalidRequests = 20;
    const promises = [];

    for (let i = 0; i < invalidRequests; i++) {
      promises.push(
        request(app)
          .post('/api/pets')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: `Invalid Pet ${i}`,
            animalType: 'invalid',
            age: -1,
            weight: 0
          })
      );
    }

    const invalidResponses = await Promise.all(promises);
    const errorCount = invalidResponses.filter(r => r.status === 400).length;

    // All should fail with 400
    expect(errorCount).toBe(invalidRequests);

    // Now test that valid requests still work
    const validResponse = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Recovery Test Pet',
        animalType: 'dog',
        age: 3,
        weight: 20
      });

    expect(validResponse.status).toBe(201);
    console.log('System recovered successfully after error conditions');
  }, 30000);
});
