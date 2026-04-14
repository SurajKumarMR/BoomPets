const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Pet = require('../../models/Pet');

process.env.JWT_SECRET = 'test-jwt-secret-performance';
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
  const hashedPassword = await bcrypt.hash('PerfTest123!', 4);
  const user = await User.create({
    email: 'perf@example.com',
    password: hashedPassword,
    name: 'Performance User'
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

afterEach(async () => {
  await Pet.deleteMany({});
});

describe('Performance Tests', () => {
  it('should create pet within 500ms', async () => {
    const startTime = Date.now();

    const response = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Speed Test Pet',
        animalType: 'dog',
        age: 3,
        weight: 20
      });

    const duration = Date.now() - startTime;

    expect(response.status).toBe(201);
    expect(duration).toBeLessThan(500);
  });

  it('should retrieve pet within 200ms', async () => {
    // Create a pet first
    const createResponse = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Retrieval Test Pet',
        animalType: 'cat',
        age: 2,
        weight: 10
      });

    const petId = createResponse.body._id;

    const startTime = Date.now();

    const response = await request(app)
      .get(`/api/pets/${petId}`)
      .set('Authorization', `Bearer ${authToken}`);

    const duration = Date.now() - startTime;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(200);
  });

  it('should handle bulk pet creation efficiently', async () => {
    const startTime = Date.now();
    const petCount = 50;
    const promises = [];

    for (let i = 0; i < petCount; i++) {
      promises.push(
        request(app)
          .post('/api/pets')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            name: `Bulk Pet ${i}`,
            animalType: ['dog', 'cat', 'bird', 'fish'][i % 4],
            age: (i % 10) + 1,
            weight: (i % 20) + 5
          })
      );
    }

    const responses = await Promise.all(promises);
    const duration = Date.now() - startTime;

    // All should succeed
    responses.forEach(response => {
      expect(response.status).toBe(201);
    });

    // Should complete in reasonable time (average < 100ms per pet)
    expect(duration).toBeLessThan(petCount * 100);
    console.log(`Created ${petCount} pets in ${duration}ms (${(duration / petCount).toFixed(2)}ms avg)`);
  }, 30000);

  it('should handle concurrent read operations efficiently', async () => {
    // Create test pets
    const pets = [];
    for (let i = 0; i < 10; i++) {
      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Concurrent Pet ${i}`,
          animalType: 'dog',
          age: 3,
          weight: 20
        });
      pets.push(response.body._id);
    }

    const startTime = Date.now();
    const promises = [];

    // Perform 100 concurrent reads
    for (let i = 0; i < 100; i++) {
      const petId = pets[i % pets.length];
      promises.push(
        request(app)
          .get(`/api/pets/${petId}`)
          .set('Authorization', `Bearer ${authToken}`)
      );
    }

    const responses = await Promise.all(promises);
    const duration = Date.now() - startTime;

    // All should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });

    // Average response time should be reasonable
    const avgTime = duration / 100;
    expect(avgTime).toBeLessThan(50);
    console.log(`100 concurrent reads in ${duration}ms (${avgTime.toFixed(2)}ms avg)`);
  }, 30000);

  it('should handle nutrition calculation within 1 second', async () => {
    // Create a pet
    const petResponse = await request(app)
      .post('/api/pets')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Nutrition Test Pet',
        animalType: 'dog',
        age: 5,
        weight: 25,
        activityLevel: 'high'
      });

    const petId = petResponse.body._id;

    const startTime = Date.now();

    const response = await request(app)
      .post('/api/nutrition/generate')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        petId: petId,
        preferences: {
          mealType: 'dry',
          budget: 'medium'
        }
      });

    const duration = Date.now() - startTime;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(1000);
    console.log(`Nutrition calculation completed in ${duration}ms`);
  });

  it('should maintain performance under sequential operations', async () => {
    const operations = 20;
    const times = [];

    for (let i = 0; i < operations; i++) {
      const startTime = Date.now();

      await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Sequential Pet ${i}`,
          animalType: 'dog',
          age: 3,
          weight: 20
        });

      times.push(Date.now() - startTime);
    }

    // Calculate average and check for performance degradation
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const lastFive = times.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const firstFive = times.slice(0, 5).reduce((a, b) => a + b, 0) / 5;

    // Last operations shouldn't be significantly slower than first
    expect(lastFive).toBeLessThan(firstFive * 1.5);
    console.log(`Sequential operations - Avg: ${avgTime.toFixed(2)}ms, First 5: ${firstFive.toFixed(2)}ms, Last 5: ${lastFive.toFixed(2)}ms`);
  }, 30000);

  it('should handle database query performance', async () => {
    // Create many pets
    for (let i = 0; i < 100; i++) {
      await Pet.create({
        name: `Query Test Pet ${i}`,
        animalType: ['dog', 'cat', 'bird', 'fish'][i % 4],
        age: (i % 10) + 1,
        weight: (i % 20) + 5,
        userId: userId
      });
    }

    const startTime = Date.now();

    const response = await request(app)
      .get(`/api/pets/user/${userId}`)
      .set('Authorization', `Bearer ${authToken}`);

    const duration = Date.now() - startTime;

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(100);
    expect(duration).toBeLessThan(500);
    console.log(`Retrieved 100 pets in ${duration}ms`);
  }, 30000);
});
