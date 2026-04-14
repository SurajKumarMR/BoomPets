// Feature: boompets-nutrition-app
// Unit tests for PetContext provider

const React = require('react');
const { renderHook, act, waitFor } = require('@testing-library/react-native');
const fc = require('fast-check');
const { PetProvider, usePet } = require('./PetContext');
const { petAPI, mealAPI } = require('../services/api');

// Mock the API services
jest.mock('../services/api', () => ({
  petAPI: {
    create: jest.fn(),
    update: jest.fn(),
    getByUser: jest.fn(),
  },
  mealAPI: {
    create: jest.fn(),
    getByPet: jest.fn(),
    update: jest.fn(),
  },
}));

describe('PetContext Provider Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }) => React.createElement(PetProvider, null, children);

  describe('updatePet function', () => {
    /**
     * **Validates: Requirements 1.1, 1.2**
     * 
     * Test that updatePet properly updates the pet state and calls the API
     */
    it('should update pet state immediately with new data', async () => {
      const { result } = renderHook(() => usePet(), { wrapper });

      const newPetData = {
        _id: 'pet123',
        name: 'Cooper',
        animalType: 'dog',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
      };

      petAPI.update.mockResolvedValue(newPetData);

      await act(async () => {
        await result.current.updatePet(newPetData);
      });

      expect(result.current.pet).toEqual(newPetData);
      expect(petAPI.update).toHaveBeenCalledWith('pet123', newPetData);
    });

    it('should revert pet state on API failure', async () => {
      const { result } = renderHook(() => usePet(), { wrapper });

      const initialPet = {
        _id: 'pet123',
        name: 'Cooper',
        weight: 25,
      };

      const updatedPet = {
        _id: 'pet123',
        name: 'Cooper',
        weight: 30,
      };

      // Set initial pet
      await act(async () => {
        await result.current.updatePet(initialPet);
      });

      petAPI.update.mockResolvedValue(initialPet);
      expect(result.current.pet).toEqual(initialPet);

      // Try to update with failure
      petAPI.update.mockRejectedValue({
        response: { data: { error: 'Update failed' } },
      });

      await act(async () => {
        try {
          await result.current.updatePet(updatedPet);
        } catch (err) {
          // Expected to throw
        }
      });

      // Should revert to initial pet
      expect(result.current.pet).toEqual(initialPet);
      expect(result.current.error).toBe('Update failed');
    });

    it('should handle pet without _id (local update only)', async () => {
      const { result } = renderHook(() => usePet(), { wrapper });

      const newPetData = {
        name: 'Cooper',
        animalType: 'dog',
        age: 3,
        weight: 25,
      };

      await act(async () => {
        await result.current.updatePet(newPetData);
      });

      expect(result.current.pet).toEqual(newPetData);
      expect(petAPI.update).not.toHaveBeenCalled();
    });
  });

  describe('addMeal with timestamp', () => {
    /**
     * **Validates: Requirements 7.1, 7.3**
     * 
     * Test that addMeal adds a timestamp to meal data
     */
    it('should add timestamp to meal when creating', async () => {
      const { result } = renderHook(() => usePet(), { wrapper });

      const mealData = {
        petId: 'pet123',
        name: 'Salmon Mix',
        type: 'PROTEIN RICH',
        portionSize: 312,
        calories: 450,
      };

      const savedMeal = {
        ...mealData,
        _id: 'meal123',
        timestamp: new Date('2024-01-15T08:00:00.000Z'),
      };

      mealAPI.create.mockResolvedValue(savedMeal);

      let response;
      await act(async () => {
        response = await result.current.addMeal(mealData);
      });

      // Check that the meal was created with a timestamp
      expect(mealAPI.create).toHaveBeenCalled();
      const callArg = mealAPI.create.mock.calls[0][0];
      expect(callArg.timestamp).toBeInstanceOf(Date);
      expect(callArg.name).toBe('Salmon Mix');
      expect(callArg.portionSize).toBe(312);

      expect(response.success).toBe(true);
      expect(response.meal).toEqual(savedMeal);
    });

    it('should add meal to state optimistically before API call', async () => {
      const { result } = renderHook(() => usePet(), { wrapper });

      const mealData = {
        petId: 'pet123',
        name: 'Salmon Mix',
        type: 'PROTEIN RICH',
        portionSize: 312,
        calories: 450,
      };

      const savedMeal = {
        ...mealData,
        _id: 'meal123',
        timestamp: new Date('2024-01-15T08:00:00.000Z'),
      };

      // Delay the API response to check optimistic update
      mealAPI.create.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve(savedMeal), 100))
      );

      await act(async () => {
        const promise = result.current.addMeal(mealData);
        
        // Check that meal was added optimistically
        await waitFor(() => {
          expect(result.current.meals.length).toBeGreaterThan(0);
        });

        await promise;
      });

      expect(result.current.meals[0]).toEqual(savedMeal);
    });

    it('should revert meals state on API failure', async () => {
      const { result } = renderHook(() => usePet(), { wrapper });

      const mealData = {
        petId: 'pet123',
        name: 'Salmon Mix',
        type: 'PROTEIN RICH',
        portionSize: 312,
        calories: 450,
      };

      mealAPI.create.mockRejectedValue({
        response: { data: { error: 'Failed to add meal' } },
      });

      let response;
      await act(async () => {
        response = await result.current.addMeal(mealData);
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Failed to add meal');
      expect(result.current.meals).toEqual([]);
      expect(result.current.error).toBe('Failed to add meal');
    });
  });

  describe('Property-based tests for PetContext', () => {
    /**
     * **Validates: Requirements 1.1, 7.1**
     * 
     * Property: For any valid pet data, updatePet should update the state
     */
    it('should handle any valid pet data in updatePet', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            _id: fc.string({ minLength: 1, maxLength: 24 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            animalType: fc.constantFrom('dog', 'cat', 'bird', 'fish'),
            age: fc.integer({ min: 1, max: 30 }),
            weight: fc.float({ min: Math.fround(0.1), max: Math.fround(200), noNaN: true }),
          }),
          async (petData) => {
            jest.clearAllMocks();
            petAPI.update.mockResolvedValue(petData);

            const { result } = renderHook(() => usePet(), { wrapper });

            await act(async () => {
              await result.current.updatePet(petData);
            });

            expect(result.current.pet).toEqual(petData);
            expect(petAPI.update).toHaveBeenCalledWith(petData._id, petData);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Validates: Requirements 7.1, 7.3**
     * 
     * Property: For any meal data, addMeal should add a timestamp
     */
    it('should add timestamp to any meal data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            petId: fc.string({ minLength: 1, maxLength: 24 }),
            name: fc.string({ minLength: 1, maxLength: 100 }),
            type: fc.string({ minLength: 1, maxLength: 50 }),
            portionSize: fc.integer({ min: 1, max: 5000 }),
            calories: fc.integer({ min: 1, max: 10000 }),
          }),
          async (mealData) => {
            jest.clearAllMocks();
            
            const savedMeal = {
              ...mealData,
              _id: 'meal123',
              timestamp: new Date(),
            };

            mealAPI.create.mockResolvedValue(savedMeal);

            const { result } = renderHook(() => usePet(), { wrapper });

            await act(async () => {
              await result.current.addMeal(mealData);
            });

            // Verify that create was called with a timestamp
            expect(mealAPI.create).toHaveBeenCalled();
            const callArg = mealAPI.create.mock.calls[0][0];
            expect(callArg.timestamp).toBeInstanceOf(Date);
            expect(callArg.name).toBe(mealData.name);
            expect(callArg.portionSize).toBe(mealData.portionSize);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
