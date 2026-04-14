const request = require('supertest');
const express = require('express');
const fc = require('fast-check');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const usersRouter = require('./users');

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);

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
  await User.deleteMany({});
});

describe('Authentication Property Tests', () => {
  /**
   * Property 1: User Registration Creates Account with Token
   * **Validates: Requirements 1.1**
   * 
   * Property: For any valid email and password combination, registration should:
   * - Create a user account in the database
   * - Return a JWT token
   * - Complete within 2 seconds
   */
  it('should create account and return token for any valid credentials', async () => {
    // Custom generator for valid passwords (min 8 chars with letters and numbers)
    const validPasswordArb = fc.tuple(
      fc.stringOf(fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'), { minLength: 5, maxLength: 15 }),
      fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 3, maxLength: 5 })
    ).map(([letters, numbers]) => letters + numbers);

    // Custom generator for valid names (alphanumeric and spaces only)
    const validNameArb = fc.stringOf(
      fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' '),
      { minLength: 1, maxLength: 50 }
    ).filter(s => s.trim().length > 0);

    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        validPasswordArb,
        validNameArb,
        async (email, password, name) => {
          const startTime = Date.now();
          
          // Ensure unique email by appending timestamp and random value
          const uniqueEmail = `${Date.now()}.${Math.random()}@test.com`;
          
          const response = await request(app)
            .post('/api/users/register')
            .send({ email: uniqueEmail, password, name });
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Verify response structure
          expect(response.status).toBe(201);
          expect(response.body).toHaveProperty('user');
          expect(response.body).toHaveProperty('token');
          expect(response.body.user).toHaveProperty('id');
          expect(response.body.user.email).toBe(uniqueEmail);
          expect(response.body.user.name).toBe(name.trim()); // Backend trims names
          expect(typeof response.body.token).toBe('string');
          expect(response.body.token.length).toBeGreaterThan(0);
          
          // Verify user was created in database
          const userInDb = await User.findOne({ email: uniqueEmail });
          expect(userInDb).not.toBeNull();
          expect(userInDb.email).toBe(uniqueEmail);
          expect(userInDb.name).toBe(name.trim()); // Backend trims names
          
          // Verify performance requirement (< 2 seconds)
          expect(duration).toBeLessThan(2000);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000); // 30 second timeout for 100 iterations

  /**
   * Property 2: Valid Login Returns Token
   * **Validates: Requirements 1.2**
   * 
   * Property: For any registered user with valid credentials, login should:
   * - Authenticate the user successfully
   * - Return a JWT token
   * - Complete within 2 seconds
   */
  it('should return token for any valid login credentials', async () => {
    // Custom generator for valid passwords (min 8 chars with letters and numbers)
    const validPasswordArb = fc.tuple(
      fc.stringOf(fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'), { minLength: 5, maxLength: 15 }),
      fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 3, maxLength: 5 })
    ).map(([letters, numbers]) => letters + numbers);

    // Custom generator for valid names (alphanumeric and spaces only)
    const validNameArb = fc.stringOf(
      fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' '),
      { minLength: 1, maxLength: 50 }
    ).filter(s => s.trim().length > 0);

    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        validPasswordArb,
        validNameArb,
        async (email, password, name) => {
          // Ensure unique email by appending timestamp and random value
          const uniqueEmail = `${Date.now()}.${Math.random()}@test.com`;
          
          // First register the user
          await request(app)
            .post('/api/users/register')
            .send({ email: uniqueEmail, password, name });
          
          // Now attempt login
          const startTime = Date.now();
          
          const response = await request(app)
            .post('/api/users/login')
            .send({ email: uniqueEmail, password });
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Verify response structure
          expect(response.status).toBe(200);
          expect(response.body).toHaveProperty('user');
          expect(response.body).toHaveProperty('token');
          expect(response.body.user).toHaveProperty('id');
          expect(response.body.user.email).toBe(uniqueEmail);
          expect(response.body.user.name).toBe(name.trim()); // Backend trims names
          expect(typeof response.body.token).toBe('string');
          expect(response.body.token.length).toBeGreaterThan(0);
          
          // Verify performance requirement (< 2 seconds)
          expect(duration).toBeLessThan(2000);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000); // 30 second timeout for 100 iterations

  /**
   * Property 3: Invalid Credentials Return Error
   * **Validates: Requirements 1.3**
   * 
   * Property: For any invalid credentials (wrong password or non-existent user), login should:
   * - Return a 401 status code
   * - Return a descriptive error message
   * - Complete within 1 second
   */
  it('should return error for any invalid credentials', async () => {
    // Custom generator for valid passwords (min 8 chars with letters and numbers)
    const validPasswordArb = fc.tuple(
      fc.stringOf(fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'), { minLength: 5, maxLength: 15 }),
      fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 3, maxLength: 5 })
    ).map(([letters, numbers]) => letters + numbers);

    // Custom generator for valid names (alphanumeric and spaces only)
    const validNameArb = fc.stringOf(
      fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' '),
      { minLength: 1, maxLength: 50 }
    ).filter(s => s.trim().length > 0);

    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        validPasswordArb,
        validPasswordArb,
        validNameArb,
        async (email, correctPassword, wrongPassword, name) => {
          // Ensure passwords are different
          fc.pre(correctPassword !== wrongPassword);
          
          // Ensure unique email by appending timestamp and random value
          const uniqueEmail = `${Date.now()}.${Math.random()}@test.com`;
          
          // Register user with correct password
          await request(app)
            .post('/api/users/register')
            .send({ email: uniqueEmail, password: correctPassword, name });
          
          // Attempt login with wrong password
          const startTime = Date.now();
          
          const response = await request(app)
            .post('/api/users/login')
            .send({ email: uniqueEmail, password: wrongPassword });
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Verify error response
          expect(response.status).toBe(401);
          expect(response.body).toHaveProperty('error');
          expect(typeof response.body.error).toBe('string');
          expect(response.body.error.length).toBeGreaterThan(0);
          expect(response.body.error).toBe('Invalid credentials');
          
          // Verify performance requirement (< 1 second)
          expect(duration).toBeLessThan(1000);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000); // 30 second timeout for 100 iterations

  /**
   * Property 3b: Non-existent User Returns Error
   * **Validates: Requirements 1.3**
   * 
   * Property: For any non-existent user email, login should:
   * - Return a 401 status code
   * - Return a descriptive error message
   * - Complete within 1 second
   */
  it('should return error for non-existent user', async () => {
    // Custom generator for valid passwords (min 8 chars with letters and numbers)
    const validPasswordArb = fc.tuple(
      fc.stringOf(fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'), { minLength: 5, maxLength: 15 }),
      fc.stringOf(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 3, maxLength: 5 })
    ).map(([letters, numbers]) => letters + numbers);

    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        validPasswordArb,
        async (email, password) => {
          // Attempt login without registering
          const startTime = Date.now();
          
          const response = await request(app)
            .post('/api/users/login')
            .send({ email, password });
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          // Verify error response
          expect(response.status).toBe(401);
          expect(response.body).toHaveProperty('error');
          expect(typeof response.body.error).toBe('string');
          expect(response.body.error.length).toBeGreaterThan(0);
          expect(response.body.error).toBe('Invalid credentials');
          
          // Verify performance requirement (< 1 second)
          expect(duration).toBeLessThan(1000);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000); // 30 second timeout for 100 iterations
});

describe('Password Validation Unit Tests', () => {
  /**
   * **Validates: Requirements 1.4**
   * Tests for password validation edge cases
   */
  
  describe('Minimum 8 characters requirement', () => {
    it('should reject password with exactly 7 characters', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'test@example.com', password: 'abc1234' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Password must be at least 8 characters');
    });

    it('should accept password with exactly 8 characters', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'test8@example.com', password: 'abcd1234' });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });

    it('should reject empty password', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'test@example.com', password: '' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Missing required fields: password');
    });
  });

  describe('Letter and number requirements', () => {
    it('should reject password with only letters', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'test@example.com', password: 'abcdefgh' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Password must contain at least one number');
    });

    it('should reject password with only numbers', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'test@example.com', password: '12345678' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Password must contain at least one letter');
    });

    it('should accept password with uppercase letters and numbers', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'testUpper@example.com', password: 'ABCD1234' });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });

    it('should accept password with mixed case letters and numbers', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'testMixed@example.com', password: 'AbCd1234' });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });

    it('should accept password with single letter and multiple numbers', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'testSingleLetter@example.com', password: 'a1234567' });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });

    it('should accept password with multiple letters and single number', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'testSingleNumber@example.com', password: 'abcdefg1' });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });
  });

  describe('Special character handling', () => {
    it('should accept password with special characters', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'testSpecial@example.com', password: 'abc123!@#' });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });

    it('should accept password with only special characters, letters, and numbers', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'testSpecial2@example.com', password: '!@#$abc123' });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });

    it('should reject password with only special characters and letters', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'test@example.com', password: '!@#$abcd' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Password must contain at least one number');
    });

    it('should reject password with only special characters and numbers', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'test@example.com', password: '!@#$1234' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Password must contain at least one letter');
    });

    it('should accept password with spaces, letters, and numbers', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'testSpaces@example.com', password: 'abc 123 xyz' });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });
  });
});
