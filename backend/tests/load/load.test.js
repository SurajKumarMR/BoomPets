const request = require('supertest');
const express = require('express');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Pet = require('../../models/Pet');

// Set environment variables
process.env.JWT_SECRET = 'test-jwt-secret-for-load-testing';
process.env.NODE_ENV = 'test';

let mongoServer;
let app;
let authToken;
let petId;

describe('Load Tests', () => {
  beforeAll(async () => {
    // Start MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    // Create test user
    const hashedPassword = await bcrypt.hash('TestPass123!', 4);
    const user = await User.create({
      email: 'loadtest@example.com',
      password: hashedPassword,
      name: 'Load Test User'
    });

    // Generate auth token
    authToken = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET);

    // Create test pet
    const pet = await Pet.create({
      name: 'Test Pet',
      animalType: 'dog',
      age: 5,
      weight: 20,
      userId: user._id
    });
    petId = pet._id.toString();

    // Setup app
    const usersRouter = require('../../routes/users');
    const petsRouter = require('../../routes/pets');
    const nutritionRouter = require('../../routes/nutrition');

    app = express();
    app.use(express.json());
    app.get('/health', (req, res) => res.json({ status: 'ok' }));
    app.use('/api/users', usersRouter);
    app.use('/api/pets', petsRouter);
    app.use('/api/nutrition', nutritionRouter);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it('should handle 100 concurrent health check requests', async () => {
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(request(app).get('/health'));
    }

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.status === 200).length;

    expect(successCount).toBe(100);
  }, 30000);

  it('should handle concurrent pet retrieval requests', async () => {
    const promises = [];
    for (let i = 0; i < 50; i++) {
      promises.push(
        request(app)
          .get(`/api/pets/${petId}`)
          .set('Authorization', `Bearer ${authToken}`)
      );
    }

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.status === 200).length;

    expect(successCount).toBe(50);
  }, 30000);

  it('should handle concurrent nutrition calculation requests', async () => {
    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(
        request(app)
          .post('/api/nutrition/generate')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            petId: petId,
            preferences: {
              mealType: 'dry',
              budget: 'medium'
            }
          })
      );
    }

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.status === 200).length;

    expect(successCount).toBeGreaterThan(15); // Allow some to fail due to rate limiting
  }, 30000);

  it('should maintain response time under load', async () => {
    const iterations = 100;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await request(app).get('/health');
      times.push(Date.now() - start);
    }

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const p99 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.99)];

    expect(avgTime).toBeLessThan(100);
    expect(p99).toBeLessThan(500);
    console.log(`Load test: Avg ${avgTime.toFixed(2)}ms, P99 ${p99}ms`);
  }, 30000);
});
