// Feature: boompets-nutrition-app
// Unit tests for API error handling

const fc = require('fast-check');
const AsyncStorage = require('@react-native-async-storage/async-storage');
const { petAPI, mealAPI, nutritionAPI, userAPI } = require('./api');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('API Error Handling Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue('test-token-123');
    AsyncStorage.setItem.mockResolvedValue(undefined);
    AsyncStorage.removeItem.mockResolvedValue(undefined);
  });

  describe('400 Validation Error Handling', () => {
    /**
     * **Validates: Requirements 1.3, 15.5**
     * 
     * Test that 400 validation errors are properly formatted and returned
     */
    it('should handle 400 validation error when creating pet with invalid data', async () => {
      const errorResponse = {
        error: 'Validation failed: age must be positive',
        code: 'VALIDATION_ERROR',
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      });

      try {
        await petAPI.create({ name: 'Test', age: -1, weight: 10 });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('Validation failed: age must be positive');
        expect(error.response.data.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should handle 400 validation error when creating meal with missing fields', async () => {
      const errorResponse = {
        error: 'Validation failed: portionSize is required',
        code: 'VALIDATION_ERROR',
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      });

      try {
        await mealAPI.create({ name: 'Test Meal' });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('Validation failed: portionSize is required');
      }
    });

    it('should handle 400 validation error when registering with invalid email', async () => {
      const errorResponse = {
        error: 'Invalid email format',
        code: 'VALIDATION_ERROR',
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      });

      try {
        await userAPI.register({ email: 'invalid-email', password: 'password123' });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe('Invalid email format');
      }
    });
  });

  describe('401 Authentication Error Handling', () => {
    /**
     * **Validates: Requirements 1.3, 15.5**
     * 
     * Test that 401 authentication errors trigger appropriate responses
     */
    it('should handle 401 error and remove auth token from storage', async () => {
      const errorResponse = {
        error: 'Invalid or expired token',
        code: 'UNAUTHORIZED',
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => errorResponse,
      });

      try {
        await petAPI.get('pet123');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.error).toBe('Invalid or expired token');
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
      }
    });

    it('should handle 401 error when accessing protected meal endpoint', async () => {
      const errorResponse = {
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => errorResponse,
      });

      try {
        await mealAPI.getByPet('pet123');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
      }
    });

    it('should handle 401 error when generating nutrition plan', async () => {
      const errorResponse = {
        error: 'Session expired',
        code: 'UNAUTHORIZED',
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => errorResponse,
      });

      try {
        await nutritionAPI.generate('pet123');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.error).toBe('Session expired');
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
      }
    });
  });

  describe('404 Not Found Error Handling', () => {
    /**
     * **Validates: Requirements 1.3, 15.6**
     * 
     * Test that 404 not found errors are handled correctly
     */
    it('should handle 404 error when pet is not found', async () => {
      const errorResponse = {
        error: 'Pet not found',
        code: 'NOT_FOUND',
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => errorResponse,
      });

      try {
        await petAPI.get('nonexistent-pet-id');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.error).toBe('Pet not found');
        expect(error.response.data.code).toBe('NOT_FOUND');
      }
    });

    it('should handle 404 error when meal is not found', async () => {
      const errorResponse = {
        error: 'Meal not found',
        code: 'NOT_FOUND',
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => errorResponse,
      });

      try {
        await mealAPI.update('nonexistent-meal-id', { completed: true });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.error).toBe('Meal not found');
      }
    });

    it('should handle 404 error when nutrition plan is not found', async () => {
      const errorResponse = {
        error: 'Nutrition plan not found',
        code: 'NOT_FOUND',
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => errorResponse,
      });

      try {
        await nutritionAPI.update('nonexistent-plan-id', { status: 'completed' });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data.error).toBe('Nutrition plan not found');
      }
    });
  });

  describe('500 Server Error Handling', () => {
    /**
     * **Validates: Requirements 1.3, 15.5**
     * 
     * Test that 500 server errors are caught and handled
     */
    it('should handle 500 error when creating pet', async () => {
      const errorResponse = {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => errorResponse,
      });

      try {
        await petAPI.create({ name: 'Test', age: 3, weight: 10 });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error.response.data.error).toBe('Internal server error');
      }
    });

    it('should handle 500 error when logging meal', async () => {
      const errorResponse = {
        error: 'Database connection failed',
        code: 'INTERNAL_ERROR',
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => errorResponse,
      });

      try {
        await mealAPI.create({ petId: 'pet123', name: 'Test Meal', portionSize: 100 });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error.response.data.error).toBe('Database connection failed');
      }
    });

    it('should handle 500 error when generating nutrition recommendations', async () => {
      const errorResponse = {
        error: 'AI service unavailable',
        code: 'INTERNAL_ERROR',
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => errorResponse,
      });

      try {
        await nutritionAPI.generate('pet123');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(500);
        expect(error.response.data.error).toBe('AI service unavailable');
      }
    });
  });

  describe('Network Error Handling', () => {
    /**
     * **Validates: Requirements 1.3, 15.6**
     * 
     * Test that network errors are handled gracefully
     */
    it('should handle network error when fetch fails completely', async () => {
      global.fetch.mockRejectedValue(new Error('Network request failed'));

      try {
        await petAPI.get('pet123');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Network request failed');
      }
    });

    it('should handle timeout error when request takes too long', async () => {
      global.fetch.mockRejectedValue(new Error('Request timeout'));

      try {
        await mealAPI.getByPet('pet123');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Request timeout');
      }
    });

    it('should handle connection refused error', async () => {
      global.fetch.mockRejectedValue(new Error('Connection refused'));

      try {
        await userAPI.login({ email: 'test@example.com', password: 'password123' });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Connection refused');
      }
    });

    it('should handle DNS resolution error', async () => {
      global.fetch.mockRejectedValue(new Error('getaddrinfo ENOTFOUND'));

      try {
        await nutritionAPI.getByPet('pet123');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('getaddrinfo ENOTFOUND');
      }
    });
  });

  describe('Property-based tests for error handling', () => {
    /**
     * **Validates: Requirements 1.3, 15.5, 15.6**
     * 
     * Property: For any 4xx or 5xx status code, the API should throw an error
     */
    it('should throw error for any 4xx client error status code', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 400, max: 499 }), // Any 4xx status code
          fc.string({ minLength: 5, maxLength: 100 }), // Error message
          async (statusCode, errorMessage) => {
            const errorResponse = {
              error: errorMessage,
              code: 'CLIENT_ERROR',
            };

            global.fetch.mockResolvedValue({
              ok: false,
              status: statusCode,
              json: async () => errorResponse,
            });

            try {
              await petAPI.get('test-pet-id');
              fail('Should have thrown an error');
            } catch (error) {
              expect(error.response.status).toBe(statusCode);
              expect(error.response.data.error).toBe(errorMessage);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Validates: Requirements 1.3, 15.5**
     * 
     * Property: For any 5xx server error status code, the API should throw an error
     */
    it('should throw error for any 5xx server error status code', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 500, max: 599 }), // Any 5xx status code
          fc.string({ minLength: 5, maxLength: 100 }), // Error message
          async (statusCode, errorMessage) => {
            const errorResponse = {
              error: errorMessage,
              code: 'SERVER_ERROR',
            };

            global.fetch.mockResolvedValue({
              ok: false,
              status: statusCode,
              json: async () => errorResponse,
            });

            try {
              await mealAPI.create({ petId: 'pet123', name: 'Test' });
              fail('Should have thrown an error');
            } catch (error) {
              expect(error.response.status).toBe(statusCode);
              expect(error.response.data.error).toBe(errorMessage);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Validates: Requirements 1.3, 15.5**
     * 
     * Property: 401 errors should always clear auth tokens
     */
    it('should always clear auth tokens on 401 error for any endpoint', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('petAPI', 'mealAPI', 'nutritionAPI'),
          fc.string({ minLength: 5, maxLength: 50 }), // Error message
          async (apiType, errorMessage) => {
            const errorResponse = {
              error: errorMessage,
              code: 'UNAUTHORIZED',
            };

            global.fetch.mockResolvedValue({
              ok: false,
              status: 401,
              json: async () => errorResponse,
            });

            // Clear previous mock calls
            AsyncStorage.removeItem.mockClear();

            try {
              if (apiType === 'petAPI') {
                await petAPI.get('test-id');
              } else if (apiType === 'mealAPI') {
                await mealAPI.getByPet('test-id');
              } else {
                await nutritionAPI.getByPet('test-id');
              }
              fail('Should have thrown an error');
            } catch (error) {
              expect(error.response.status).toBe(401);
              expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
              expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Validates: Requirements 1.3, 15.6**
     * 
     * Property: Network errors should preserve error message
     */
    it('should preserve error message for any network error', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 100 }), // Network error message
          async (errorMessage) => {
            global.fetch.mockRejectedValue(new Error(errorMessage));

            try {
              await petAPI.create({ name: 'Test', age: 3, weight: 10 });
              fail('Should have thrown an error');
            } catch (error) {
              expect(error.message).toBe(errorMessage);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Error response structure validation', () => {
    /**
     * **Validates: Requirements 15.5**
     * 
     * Test that error responses maintain consistent structure
     */
    it('should maintain error structure with status and data for 400 errors', async () => {
      const errorResponse = {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: { field: 'age', message: 'must be positive' },
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      });

      try {
        await petAPI.create({ name: 'Test', age: -1 });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(400);
        expect(error.response.data).toBeDefined();
        expect(error.response.data.error).toBe('Validation failed');
        expect(error.response.data.code).toBe('VALIDATION_ERROR');
        expect(error.response.data.details).toBeDefined();
      }
    });

    it('should maintain error structure for 404 errors', async () => {
      const errorResponse = {
        error: 'Resource not found',
        code: 'NOT_FOUND',
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => errorResponse,
      });

      try {
        await petAPI.get('nonexistent-id');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(404);
        expect(error.response.data).toBeDefined();
        expect(error.response.data.error).toBe('Resource not found');
        expect(error.response.data.code).toBe('NOT_FOUND');
      }
    });

    it('should maintain error structure for 500 errors', async () => {
      const errorResponse = {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => errorResponse,
      });

      try {
        await mealAPI.create({ petId: 'pet123', name: 'Test' });
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(500);
        expect(error.response.data).toBeDefined();
        expect(error.response.data.error).toBe('Internal server error');
        expect(error.response.data.code).toBe('INTERNAL_ERROR');
      }
    });
  });

  describe('Auth header handling in error scenarios', () => {
    /**
     * **Validates: Requirements 1.3**
     * 
     * Test that auth headers are properly included even when errors occur
     */
    it('should include auth token in request headers even when 401 error occurs', async () => {
      AsyncStorage.getItem.mockResolvedValue('test-token-123');

      const errorResponse = {
        error: 'Token expired',
        code: 'UNAUTHORIZED',
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => errorResponse,
      });

      try {
        await petAPI.get('pet123');
        fail('Should have thrown an error');
      } catch (error) {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-token-123',
            }),
          })
        );
      }
    });

    it('should not include auth header when token is not available', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const errorResponse = {
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
      };

      global.fetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => errorResponse,
      });

      try {
        await petAPI.get('pet123');
        fail('Should have thrown an error');
      } catch (error) {
        const fetchCall = global.fetch.mock.calls[0];
        const headers = fetchCall[1].headers;
        expect(headers['Authorization']).toBeUndefined();
      }
    });
  });
});
