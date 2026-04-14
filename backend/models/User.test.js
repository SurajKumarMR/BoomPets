// Feature: boompets-nutrition-app, Property 4: Password Validation Enforces Requirements
const fc = require('fast-check');
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('./User');
const usersRouter = require('../routes/users');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  
  app = express();
  app.use(express.json());
  app.use('/api/users', usersRouter);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('User Model Validation - Property Tests', () => {
  /**
   * **Validates: Requirements 1.4**
   * 
   * Property 4: Password Validation Enforces Requirements
   * 
   * For any password that violates the requirements (less than 8 characters, 
   * or missing letters, or missing numbers), when a user attempts to register, 
   * the system should reject the password with an error message.
   */
  it('should reject passwords with less than 8 characters', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 3, maxLength: 7 }).filter(s => /^[a-zA-Z0-9]+$/.test(s) && s.trim().length >= 3), // alphanumeric passwords shorter than 8 chars
        fc.emailAddress(),
        fc.integer({ min: 1, max: 10000 }), // unique suffix to avoid duplicate emails
        async (password, emailBase, suffix) => {
          const email = emailBase.replace('@', `${suffix}@`);
          const response = await request(app)
            .post('/api/users/register')
            .send({
              email,
              password,
              name: 'Test User'
            });
          
          expect(response.status).toBe(400);
          expect(response.body.error).toBeDefined();
          expect(response.body.error.toLowerCase()).toContain('8');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject passwords without letters (8+ chars, only numbers)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringOf(fc.constantFrom(...'0123456789'), { minLength: 8, maxLength: 20 }), // only digits
        fc.emailAddress(),
        fc.integer({ min: 1, max: 10000 }),
        async (password, emailBase, suffix) => {
          const email = emailBase.replace('@', `${suffix}@`);
          const response = await request(app)
            .post('/api/users/register')
            .send({
              email,
              password,
              name: 'Test User'
            });
          
          expect(response.status).toBe(400);
          expect(response.body.error).toBeDefined();
          expect(response.body.error.toLowerCase()).toContain('letter');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject passwords without numbers (8+ chars, only letters)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'), { minLength: 8, maxLength: 20 }), // only letters
        fc.emailAddress(),
        fc.integer({ min: 1, max: 10000 }),
        async (password, emailBase, suffix) => {
          const email = emailBase.replace('@', `${suffix}@`);
          const response = await request(app)
            .post('/api/users/register')
            .send({
              email,
              password,
              name: 'Test User'
            });
          
          expect(response.status).toBe(400);
          expect(response.body.error).toBeDefined();
          expect(response.body.error.toLowerCase()).toContain('number');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept valid passwords with 8+ characters, letters, numbers, and special characters', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'), { minLength: 4, maxLength: 8 }),
          fc.stringOf(fc.constantFrom(...'0123456789'), { minLength: 2, maxLength: 4 }),
          fc.stringOf(fc.constantFrom(...'!@#$%^&*'), { minLength: 1, maxLength: 2 })
        ).map(([letters, numbers, special]) => {
          // Shuffle to create a valid password (guaranteed 8+ chars with all requirements)
          const combined = (letters + numbers + special).split('');
          for (let i = combined.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [combined[i], combined[j]] = [combined[j], combined[i]];
          }
          return combined.join('');
        }),
        fc.emailAddress(),
        fc.integer({ min: 1, max: 10000 }),
        async (password, emailBase, suffix) => {
          const email = emailBase.replace('@', `${suffix}@`);
          const response = await request(app)
            .post('/api/users/register')
            .send({
              email,
              password,
              name: 'Test User'
            });
          
          // Should succeed with 201
          expect(response.status).toBe(201);
          expect(response.body.token).toBeDefined();
          expect(response.body.user).toBeDefined();
          expect(response.body.user.email).toBe(email.toLowerCase());
        }
      ),
      { numRuns: 100 }
    );
  }, 15000); // 15 second timeout for this test
});
