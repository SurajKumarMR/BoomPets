// Feature: boompets-nutrition-app, Property 9: Pet Age and Weight Validation
const fc = require('fast-check');
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const Pet = require('./Pet');
const User = require('./User');
const petsRouter = require('../routes/pets');

let mongoServer;
let app;
let testUserId;
let authToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
  
  app = express();
  app.use(express.json());
  app.use('/api/pets', petsRouter);
  
  // Create a test user for pet associations
  const testUser = await User.create({
    email: 'test@example.com',
    password: 'hashedpassword123',
    name: 'Test User'
  });
  testUserId = testUser._id;
  
  // Generate auth token for testing
  authToken = jwt.sign({ userId: testUserId.toString() }, process.env.JWT_SECRET || 'secret');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Pet.deleteMany({});
});

describe('Pet Model Validation - Property Tests', () => {
  /**
   * **Validates: Requirements 2.6, 15.2**
   * 
   * Property 9: Pet Age and Weight Validation
   * 
   * For any pet profile creation or update with age ≤ 0 or weight ≤ 0, 
   * the system should reject the operation with a validation error.
   */
  it('should reject pet creation with age ≤ 0', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(0),
          fc.float({ min: Math.fround(-100), max: Math.fround(0), noNaN: true })
        ), // age ≤ 0
        fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true }), // valid weight
        fc.constantFrom('dog', 'cat', 'bird', 'fish'),
        fc.string({ minLength: 3, maxLength: 50 }).filter(s => /^[a-zA-Z0-9\s]+$/.test(s) && s.trim().length >= 3),
        async (age, weight, animalType, name) => {
          const response = await request(app)
            .post('/api/pets')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              userId: testUserId,
              name,
              animalType,
              age,
              weight
            });
          
          expect(response.status).toBe(400);
          expect(response.body.error).toBeDefined();
          expect(response.body.error.toLowerCase()).toMatch(/age|positive|validation/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject pet creation with weight ≤ 0', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.float({ min: Math.fround(0.1), max: Math.fround(50), noNaN: true }), // valid age
        fc.oneof(
          fc.constant(0),
          fc.float({ min: Math.fround(-100), max: Math.fround(0), noNaN: true })
        ), // weight ≤ 0
        fc.constantFrom('dog', 'cat', 'bird', 'fish'),
        fc.string({ minLength: 3, maxLength: 50 }).filter(s => /^[a-zA-Z0-9\s]+$/.test(s) && s.trim().length >= 3),
        async (age, weight, animalType, name) => {
          const response = await request(app)
            .post('/api/pets')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              userId: testUserId,
              name,
              animalType,
              age,
              weight
            });
          
          expect(response.status).toBe(400);
          expect(response.body.error).toBeDefined();
          expect(response.body.error.toLowerCase()).toMatch(/weight|positive|validation/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject pet creation with both age ≤ 0 and weight ≤ 0', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(0),
          fc.float({ min: Math.fround(-100), max: Math.fround(0), noNaN: true })
        ), // age ≤ 0
        fc.oneof(
          fc.constant(0),
          fc.float({ min: Math.fround(-100), max: Math.fround(0), noNaN: true })
        ), // weight ≤ 0
        fc.constantFrom('dog', 'cat', 'bird', 'fish'),
        fc.string({ minLength: 1, maxLength: 50 }),
        async (age, weight, animalType, name) => {
          const response = await request(app)
            .post('/api/pets')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              userId: testUserId,
              name,
              animalType,
              age,
              weight
            });
          
          expect(response.status).toBe(400);
          expect(response.body.error).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept pet creation with valid age > 0 and weight > 0', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.float({ min: Math.fround(0.1), max: Math.fround(50), noNaN: true }), // valid age > 0
        fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true }), // valid weight > 0
        fc.constantFrom('dog', 'cat', 'bird', 'fish'),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.integer({ min: 1, max: 10000 }), // unique suffix
        async (age, weight, animalType, nameBase, suffix) => {
          const name = `${nameBase}${suffix}`;
          const response = await request(app)
            .post('/api/pets')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              userId: testUserId,
              name,
              animalType,
              age,
              weight
            });
          
          expect(response.status).toBe(201);
          expect(response.body._id).toBeDefined();
          expect(response.body.age).toBe(age);
          expect(response.body.weight).toBe(weight);
          expect(response.body.animalType).toBe(animalType);
        }
      ),
      { numRuns: 100 }
    );
  }, 15000); // 15 second timeout for this test

  it('should reject pet update with age ≤ 0', async () => {
    // First create a valid pet
    const validPet = await Pet.create({
      userId: testUserId,
      name: 'TestPet',
      animalType: 'dog',
      age: 5,
      weight: 20
    });

    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(0),
          fc.float({ min: Math.fround(-100), max: Math.fround(0), noNaN: true })
        ), // age ≤ 0
        async (age) => {
          const response = await request(app)
            .put(`/api/pets/${validPet._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ age });
          
          expect(response.status).toBe(400);
          expect(response.body.error).toBeDefined();
          expect(response.body.error.toLowerCase()).toMatch(/age|positive|validation/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject pet update with weight ≤ 0', async () => {
    // First create a valid pet
    const validPet = await Pet.create({
      userId: testUserId,
      name: 'TestPet',
      animalType: 'cat',
      age: 3,
      weight: 5
    });

    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(0),
          fc.float({ min: Math.fround(-100), max: Math.fround(0), noNaN: true })
        ), // weight ≤ 0
        async (weight) => {
          const response = await request(app)
            .put(`/api/pets/${validPet._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ weight });
          
          expect(response.status).toBe(400);
          expect(response.body.error).toBeDefined();
          expect(response.body.error.toLowerCase()).toMatch(/weight|positive|validation/);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Pet Validation - Unit Tests', () => {
  /**
   * **Validates: Requirements 2.2, 2.6, 15.4**
   * 
   * Unit tests for specific pet validation edge cases
   */
  
  describe('Valid animal types', () => {
    it('should accept dog as valid animal type', async () => {
      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Buddy',
          animalType: 'dog',
          age: 5,
          weight: 20
        });
      
      expect(response.status).toBe(201);
      expect(response.body.animalType).toBe('dog');
    });

    it('should accept cat as valid animal type', async () => {
      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Whiskers',
          animalType: 'cat',
          age: 3,
          weight: 8
        });
      
      expect(response.status).toBe(201);
      expect(response.body.animalType).toBe('cat');
    });

    it('should accept bird as valid animal type', async () => {
      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Tweety',
          animalType: 'bird',
          age: 2,
          weight: 0.5
        });
      
      expect(response.status).toBe(201);
      expect(response.body.animalType).toBe('bird');
    });

    it('should accept fish as valid animal type', async () => {
      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Nemo',
          animalType: 'fish',
          age: 1,
          weight: 0.2
        });
      
      expect(response.status).toBe(201);
      expect(response.body.animalType).toBe('fish');
    });
  });

  describe('Invalid animal type rejection', () => {
    it('should reject invalid animal type with error message listing valid types', async () => {
      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Invalid Pet',
          animalType: 'hamster',
          age: 2,
          weight: 1
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error).toContain('dog');
      expect(response.body.error).toContain('cat');
      expect(response.body.error).toContain('bird');
      expect(response.body.error).toContain('fish');
    });
  });

  describe('Negative age rejection', () => {
    it('should reject negative age', async () => {
      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Invalid Age Pet',
          animalType: 'dog',
          age: -5,
          weight: 20
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toMatch(/age|positive|validation/);
    });
  });

  describe('Zero weight rejection', () => {
    it('should reject zero weight', async () => {
      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Zero Weight Pet',
          animalType: 'cat',
          age: 3,
          weight: 0
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
      expect(response.body.error.toLowerCase()).toMatch(/weight|positive|validation/);
    });
  });
});

describe('Pet CRUD Operations - Property Tests', () => {
  /**
   * **Validates: Requirements 2.1**
   * 
   * Property 5: Pet Profile Creation Succeeds with Valid Data
   * 
   * For any valid pet data (name, animalType, age > 0, weight > 0),
   * the system should create a pet profile successfully within 1 second.
   */
  it('should create pet profile with valid data within 1 second', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 })
          .filter(s => s.trim().length > 0)
          .map(s => s.replace(/[<>]/g, '')), // Remove characters that sanitization removes
        fc.constantFrom('dog', 'cat', 'bird', 'fish'),
        fc.float({ min: Math.fround(0.1), max: Math.fround(50), noNaN: true }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(200), noNaN: true }),
        fc.integer({ min: 1, max: 100000 }), // unique suffix
        async (nameBase, animalType, age, weight, suffix) => {
          const name = `${nameBase.trim()}${suffix}`;
          const startTime = Date.now();
          
          const response = await request(app)
            .post('/api/pets')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              name,
              animalType,
              age,
              weight
            });
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          expect(response.status).toBe(201);
          expect(response.body._id).toBeDefined();
          expect(response.body.name).toBe(name);
          expect(response.body.animalType).toBe(animalType);
          expect(response.body.age).toBe(age);
          expect(response.body.weight).toBe(weight);
          expect(response.body.userId).toBe(testUserId.toString());
          expect(duration).toBeLessThan(1000); // Within 1 second
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * **Validates: Requirements 2.3, 14.4**
   * 
   * Property 6: Pet Profile Updates Persist with Timestamp
   * 
   * For any pet profile update, the changes should persist and the updatedAt
   * timestamp should be updated within 1 second.
   */
  it('should persist pet updates and update timestamp within 1 second', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 })
          .filter(s => s.trim().length > 0)
          .map(s => s.replace(/[<>]/g, '')), // Remove characters that sanitization removes
        fc.float({ min: Math.fround(0.1), max: Math.fround(50), noNaN: true }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(200), noNaN: true }),
        async (newName, newAge, newWeight) => {
          // Create initial pet
          const initialPet = await Pet.create({
            userId: testUserId,
            name: 'InitialName',
            animalType: 'dog',
            age: 5,
            weight: 20
          });
          
          const originalUpdatedAt = initialPet.updatedAt;
          
          // Wait a small amount to ensure timestamp difference
          await new Promise(resolve => setTimeout(resolve, 10));
          
          const startTime = Date.now();
          
          const trimmedName = newName.trim();
          const response = await request(app)
            .put(`/api/pets/${initialPet._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              name: trimmedName,
              age: newAge,
              weight: newWeight
            });
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          expect(response.status).toBe(200);
          expect(response.body.name).toBe(trimmedName);
          expect(response.body.age).toBe(newAge);
          expect(response.body.weight).toBe(newWeight);
          expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(
            new Date(originalUpdatedAt).getTime()
          );
          expect(duration).toBeLessThan(1000); // Within 1 second
          
          // Verify persistence by fetching the pet again
          const fetchResponse = await request(app)
            .get(`/api/pets/${initialPet._id}`)
            .set('Authorization', `Bearer ${authToken}`);
          
          expect(fetchResponse.status).toBe(200);
          expect(fetchResponse.body.name).toBe(trimmedName);
          expect(fetchResponse.body.age).toBe(newAge);
          expect(fetchResponse.body.weight).toBe(newWeight);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * **Validates: Requirements 2.4**
   * 
   * Property 7: Multiple Pets Per User
   * 
   * A user should be able to create and manage multiple pet profiles
   * under a single user account.
   */
  it('should allow multiple pets per user', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 5 }), // Number of pets to create
        async (numPets) => {
          const createdPetIds = [];
          
          // Create multiple pets for the same user
          for (let i = 0; i < numPets; i++) {
            const response = await request(app)
              .post('/api/pets')
              .set('Authorization', `Bearer ${authToken}`)
              .send({
                name: `Pet${i}_${Date.now()}`,
                animalType: ['dog', 'cat', 'bird', 'fish'][i % 4],
                age: i + 1,
                weight: (i + 1) * 5
              });
            
            expect(response.status).toBe(201);
            expect(response.body._id).toBeDefined();
            createdPetIds.push(response.body._id);
          }
          
          // Verify all pets belong to the same user
          const fetchResponse = await request(app)
            .get(`/api/pets/user/${testUserId}`)
            .set('Authorization', `Bearer ${authToken}`);
          
          expect(fetchResponse.status).toBe(200);
          expect(fetchResponse.body.length).toBeGreaterThanOrEqual(numPets);
          
          // Verify each created pet is in the list
          const fetchedPetIds = fetchResponse.body.map(pet => pet._id);
          createdPetIds.forEach(petId => {
            expect(fetchedPetIds).toContain(petId);
          });
          
          // Verify all pets have the same userId
          fetchResponse.body.forEach(pet => {
            expect(pet.userId).toBe(testUserId.toString());
          });
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * **Validates: Requirements 2.5**
   * 
   * Property 8: Default Values Set on Pet Creation
   * 
   * When a pet profile is created without specifying activityLevel or climate,
   * the system should initialize activityLevel to 'moderate' and climate to 'temperate'.
   */
  it('should set default values on pet creation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 })
          .filter(s => s.trim().length > 0)
          .map(s => s.replace(/[<>]/g, '')), // Remove characters that sanitization removes
        fc.constantFrom('dog', 'cat', 'bird', 'fish'),
        fc.float({ min: Math.fround(0.1), max: Math.fround(50), noNaN: true }),
        fc.float({ min: Math.fround(0.1), max: Math.fround(200), noNaN: true }),
        fc.integer({ min: 1, max: 100000 }), // unique suffix
        async (nameBase, animalType, age, weight, suffix) => {
          const name = `${nameBase.trim()}${suffix}`;
          
          const response = await request(app)
            .post('/api/pets')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              name,
              animalType,
              age,
              weight
              // Intentionally NOT providing activityLevel or climate
            });
          
          expect(response.status).toBe(201);
          expect(response.body.activityLevel).toBe('moderate');
          expect(response.body.climate).toBe('temperate');
          expect(response.body.createdAt).toBeDefined();
          expect(response.body.updatedAt).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);
});

describe('Health Data Management - Property Tests', () => {
  /**
   * **Validates: Requirements 2.7, 8.1, 8.2, 8.3**
   * 
   * Property 10: Health Data Storage
   * 
   * For any pet profile, when health conditions or allergies are added,
   * the system should store them as a list associated with that pet profile.
   */
  it('should store allergies as a list when added to pet profile', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => {
              const sanitized = s.trim().replace(/[<>]/g, '');
              // Ensure sanitization produces a non-empty string with no leading/trailing spaces
              return sanitized.length > 0 && sanitized.trim() === sanitized;
            }),
          { minLength: 1, maxLength: 10 }
        )
          .map(arr => [...new Set(arr.map(s => s.trim().replace(/[<>]/g, '')))]) // Deduplicate after sanitization
          .filter(arr => arr.length > 0), // Ensure array is not empty
        async (sanitizedAllergies) => {
          // Create a pet profile
          const pet = await Pet.create({
            userId: testUserId,
            name: `TestPet${Date.now()}`,
            animalType: 'dog',
            age: 5,
            weight: 20
          });
          
          // Add each allergy (using pre-sanitized values)
          for (const allergy of sanitizedAllergies) {
            const startTime = Date.now();
            
            const response = await request(app)
              .patch(`/api/pets/${pet._id}/allergies`)
              .set('Authorization', `Bearer ${authToken}`)
              .send({
                action: 'add',
                allergy
              });
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            expect(response.status).toBe(200);
            expect(duration).toBeLessThan(500); // Within 500ms per requirement 8.1
          }
          
          // Verify all allergies are stored as a list
          const fetchResponse = await request(app)
            .get(`/api/pets/${pet._id}`)
            .set('Authorization', `Bearer ${authToken}`);
          
          expect(fetchResponse.status).toBe(200);
          expect(Array.isArray(fetchResponse.body.allergies)).toBe(true);
          expect(fetchResponse.body.allergies.length).toBe(sanitizedAllergies.length);
          
          // Verify each sanitized allergy is in the list
          sanitizedAllergies.forEach(allergy => {
            expect(fetchResponse.body.allergies).toContain(allergy);
          });
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  it('should store health conditions as a list when added to pet profile', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => {
              const sanitized = s.trim().replace(/[<>]/g, '');
              // Ensure sanitization produces a non-empty string with no leading/trailing spaces
              return sanitized.length > 0 && sanitized.trim() === sanitized;
            }),
          { minLength: 1, maxLength: 10 }
        )
          .map(arr => [...new Set(arr.map(s => s.trim().replace(/[<>]/g, '')))]) // Deduplicate after sanitization
          .filter(arr => arr.length > 0), // Ensure array is not empty
        async (sanitizedConditions) => {
          // Create a pet profile
          const pet = await Pet.create({
            userId: testUserId,
            name: `TestPet${Date.now()}`,
            animalType: 'cat',
            age: 3,
            weight: 8
          });
          
          // Add each health condition (using pre-sanitized values)
          for (const condition of sanitizedConditions) {
            const startTime = Date.now();
            
            const response = await request(app)
              .patch(`/api/pets/${pet._id}/health-conditions`)
              .set('Authorization', `Bearer ${authToken}`)
              .send({
                action: 'add',
                condition
              });
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            expect(response.status).toBe(200);
            expect(duration).toBeLessThan(500); // Within 500ms per requirement 8.2
          }
          
          // Verify all health conditions are stored as a list
          const fetchResponse = await request(app)
            .get(`/api/pets/${pet._id}`)
            .set('Authorization', `Bearer ${authToken}`);
          
          expect(fetchResponse.status).toBe(200);
          expect(Array.isArray(fetchResponse.body.healthConditions)).toBe(true);
          expect(fetchResponse.body.healthConditions.length).toBe(sanitizedConditions.length);
          
          // Verify each sanitized condition is in the list
          sanitizedConditions.forEach(condition => {
            expect(fetchResponse.body.healthConditions).toContain(condition);
          });
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  it('should store allergies and health conditions as text strings without format restrictions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 })
          .filter(s => {
            const sanitized = s.trim().replace(/[<>]/g, '');
            return sanitized.length > 0 && sanitized.trim() === sanitized;
          }),
        fc.string({ minLength: 1, maxLength: 100 })
          .filter(s => {
            const sanitized = s.trim().replace(/[<>]/g, '');
            return sanitized.length > 0 && sanitized.trim() === sanitized;
          }),
        async (allergy, condition) => {
          // Create a pet profile
          const pet = await Pet.create({
            userId: testUserId,
            name: `TestPet${Date.now()}`,
            animalType: 'bird',
            age: 2,
            weight: 0.5
          });
          
          // Sanitize to match what the API will store
          const sanitizedAllergy = allergy.trim().replace(/[<>]/g, '');
          const sanitizedCondition = condition.trim().replace(/[<>]/g, '');
          
          // Add allergy
          const allergyResponse = await request(app)
            .patch(`/api/pets/${pet._id}/allergies`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              action: 'add',
              allergy
            });
          
          expect(allergyResponse.status).toBe(200);
          
          // Add health condition
          const conditionResponse = await request(app)
            .patch(`/api/pets/${pet._id}/health-conditions`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              action: 'add',
              condition
            });
          
          expect(conditionResponse.status).toBe(200);
          
          // Verify both are stored as text strings
          const fetchResponse = await request(app)
            .get(`/api/pets/${pet._id}`)
            .set('Authorization', `Bearer ${authToken}`);
          
          expect(fetchResponse.status).toBe(200);
          expect(fetchResponse.body.allergies).toContain(sanitizedAllergy);
          expect(fetchResponse.body.healthConditions).toContain(sanitizedCondition);
          expect(typeof fetchResponse.body.allergies[0]).toBe('string');
          expect(typeof fetchResponse.body.healthConditions[0]).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * **Validates: Requirements 8.4**
   * 
   * Property 34: Allergy and Health Condition Removal
   * 
   * For any pet profile with allergies or health conditions, when a pet owner
   * removes an item, the system should delete it from the respective list.
   */
  it('should remove allergy from list within 500ms', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => {
              const sanitized = s.trim().replace(/[<>]/g, '');
              return sanitized.length > 0 && sanitized.trim() === sanitized;
            }),
          { minLength: 2, maxLength: 10 }
        )
          .map(arr => [...new Set(arr.map(s => s.trim().replace(/[<>]/g, '')))]) // Deduplicate after sanitization
          .filter(arr => arr.length >= 2), // Ensure at least 2 items
        fc.integer({ min: 0, max: 100 }), // Index to remove (will be modded)
        async (sanitizedAllergies, indexSeed) => {
          // Create a pet profile with allergies (using pre-sanitized values)
          const pet = await Pet.create({
            userId: testUserId,
            name: `TestPet${Date.now()}`,
            animalType: 'dog',
            age: 5,
            weight: 20,
            allergies: [...sanitizedAllergies]
          });
          
          // Select an allergy to remove (use the sanitized version directly)
          const indexToRemove = indexSeed % sanitizedAllergies.length;
          const allergyToRemove = sanitizedAllergies[indexToRemove];
          
          const startTime = Date.now();
          
          const response = await request(app)
            .patch(`/api/pets/${pet._id}/allergies`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              action: 'remove',
              allergy: allergyToRemove // Use sanitized version directly
            });
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          expect(response.status).toBe(200);
          expect(duration).toBeLessThan(500); // Within 500ms per requirement 8.4
          
          // Verify the allergy was removed
          expect(response.body.allergies).not.toContain(allergyToRemove);
          expect(response.body.allergies.length).toBe(sanitizedAllergies.length - 1);
          
          // Verify other allergies remain
          const remainingAllergies = sanitizedAllergies.filter((_, idx) => idx !== indexToRemove);
          remainingAllergies.forEach(allergy => {
            expect(response.body.allergies).toContain(allergy);
          });
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  it('should remove health condition from list within 500ms', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => {
              const sanitized = s.trim().replace(/[<>]/g, '');
              return sanitized.length > 0 && sanitized.trim() === sanitized;
            }),
          { minLength: 2, maxLength: 10 }
        )
          .map(arr => [...new Set(arr.map(s => s.trim().replace(/[<>]/g, '')))]) // Deduplicate after sanitization
          .filter(arr => arr.length >= 2), // Ensure at least 2 items
        fc.integer({ min: 0, max: 100 }), // Index to remove (will be modded)
        async (sanitizedConditions, indexSeed) => {
          // Create a pet profile with health conditions (using pre-sanitized values)
          const pet = await Pet.create({
            userId: testUserId,
            name: `TestPet${Date.now()}`,
            animalType: 'cat',
            age: 3,
            weight: 8,
            healthConditions: [...sanitizedConditions]
          });
          
          // Select a condition to remove (use the sanitized version directly)
          const indexToRemove = indexSeed % sanitizedConditions.length;
          const conditionToRemove = sanitizedConditions[indexToRemove];
          
          const startTime = Date.now();
          
          const response = await request(app)
            .patch(`/api/pets/${pet._id}/health-conditions`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              action: 'remove',
              condition: conditionToRemove // Use sanitized version directly
            });
          
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          expect(response.status).toBe(200);
          expect(duration).toBeLessThan(500); // Within 500ms per requirement 8.4
          
          // Verify the condition was removed
          expect(response.body.healthConditions).not.toContain(conditionToRemove);
          expect(response.body.healthConditions.length).toBe(sanitizedConditions.length - 1);
          
          // Verify other conditions remain
          const remainingConditions = sanitizedConditions.filter((_, idx) => idx !== indexToRemove);
          remainingConditions.forEach(condition => {
            expect(response.body.healthConditions).toContain(condition);
          });
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  it('should handle removal of non-existent allergy gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => {
              const sanitized = s.trim().replace(/[<>]/g, '');
              return sanitized.length > 0 && sanitized.trim() === sanitized;
            }),
          { minLength: 1, maxLength: 5 }
        )
          .map(arr => [...new Set(arr.map(s => s.trim().replace(/[<>]/g, '')))]) // Deduplicate after sanitization
          .filter(arr => arr.length > 0), // Ensure array is not empty
        fc.string({ minLength: 1, maxLength: 50 })
          .filter(s => {
            const sanitized = s.trim().replace(/[<>]/g, '');
            return sanitized.length > 0 && sanitized.trim() === sanitized;
          }),
        async (sanitizedExisting, nonExistentAllergy) => {
          // Skip if it matches an existing allergy
          if (sanitizedExisting.includes(nonExistentAllergy)) {
            return;
          }
          
          // Create a pet profile with allergies
          const pet = await Pet.create({
            userId: testUserId,
            name: `TestPet${Date.now()}`,
            animalType: 'dog',
            age: 5,
            weight: 20,
            allergies: [...sanitizedExisting]
          });
          
          const response = await request(app)
            .patch(`/api/pets/${pet._id}/allergies`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              action: 'remove',
              allergy: nonExistentAllergy
            });
          
          expect(response.status).toBe(200);
          
          // Verify the list remains unchanged
          expect(response.body.allergies.length).toBe(sanitizedExisting.length);
          sanitizedExisting.forEach(allergy => {
            expect(response.body.allergies).toContain(allergy);
          });
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  it('should handle removal of non-existent health condition gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.string({ minLength: 1, maxLength: 50 })
            .filter(s => {
              const sanitized = s.trim().replace(/[<>]/g, '');
              return sanitized.length > 0 && sanitized.trim() === sanitized;
            }),
          { minLength: 1, maxLength: 5 }
        )
          .map(arr => [...new Set(arr.map(s => s.trim().replace(/[<>]/g, '')))]) // Deduplicate after sanitization
          .filter(arr => arr.length > 0), // Ensure array is not empty
        fc.string({ minLength: 1, maxLength: 50 })
          .filter(s => {
            const sanitized = s.trim().replace(/[<>]/g, '');
            return sanitized.length > 0 && sanitized.trim() === sanitized;
          }),
        async (sanitizedExisting, nonExistentCondition) => {
          // Skip if it matches an existing condition
          if (sanitizedExisting.includes(nonExistentCondition)) {
            return;
          }
          
          // Create a pet profile with health conditions
          const pet = await Pet.create({
            userId: testUserId,
            name: `TestPet${Date.now()}`,
            animalType: 'cat',
            age: 3,
            weight: 8,
            healthConditions: [...sanitizedExisting]
          });
          
          const response = await request(app)
            .patch(`/api/pets/${pet._id}/health-conditions`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              action: 'remove',
              condition: nonExistentCondition
            });
          
          expect(response.status).toBe(200);
          
          // Verify the list remains unchanged
          expect(response.body.healthConditions.length).toBe(sanitizedExisting.length);
          sanitizedExisting.forEach(condition => {
            expect(response.body.healthConditions).toContain(condition);
          });
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});
