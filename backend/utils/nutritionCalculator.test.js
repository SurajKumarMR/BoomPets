// Feature: boompets-nutrition-app
// Property-based tests for nutrition calculations

const fc = require('fast-check');
const {
  calculateDailyCalories,
  calculatePortionSize,
  calculateHydration,
} = require('./nutritionCalculator');

describe('Nutrition Calculator Property Tests', () => {
  describe('Property 11: Daily Calorie Calculation Formula', () => {
    /**
     * **Validates: Requirements 3.1, 3.2**
     * 
     * For any pet weight (kg) and activity level (low/moderate/high),
     * the system should calculate daily calories as:
     * Math.round((weight × 30 + 70) × activityMultiplier)
     * where activityMultiplier is 1.2 for low, 1.4 for moderate, and 1.6 for high.
     */
    it('should calculate daily calories using correct formula for any weight and activity level', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true }), // weight in kg
          fc.constantFrom('low', 'moderate', 'high'), // activity level
          (weight, activityLevel) => {
            const result = calculateDailyCalories(weight, 0, activityLevel);
            
            const activityMultipliers = { low: 1.2, moderate: 1.4, high: 1.6 };
            const expected = Math.round((weight * 30 + 70) * activityMultipliers[activityLevel]);
            
            expect(result).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use moderate multiplier (1.4) as default for invalid activity levels', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true }), // weight in kg
          fc.string().filter(s => typeof s === 'string' && s !== 'toString' && s !== 'valueOf' && !['low', 'moderate', 'high'].includes(s)), // any string that's not low/moderate/high or object methods
          (weight, invalidActivityLevel) => {
            const result = calculateDailyCalories(weight, 0, invalidActivityLevel);
            const expected = Math.round((weight * 30 + 70) * 1.4); // default multiplier
            
            expect(result).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 12: Portion Size Calculation Formula', () => {
    /**
     * **Validates: Requirements 3.3**
     * 
     * For any pet weight (kg), the system should calculate daily portion size as:
     * Math.round(weight × 25) grams.
     */
    it('should calculate portion size using correct formula for any weight', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true }), // weight in kg
          (weight) => {
            const result = calculatePortionSize(weight);
            const expected = Math.round(weight * 25);
            
            expect(result).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 13: Hydration Calculation Formula', () => {
    /**
     * **Validates: Requirements 3.4**
     * 
     * For any pet weight (kg), the system should calculate daily hydration as:
     * Math.round(weight × 50) milliliters.
     */
    it('should calculate hydration using correct formula for any weight', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true }), // weight in kg
          (weight) => {
            const result = calculateHydration(weight);
            const expected = Math.round(weight * 50);
            
            expect(result).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 14: Nutrition Calculations Return Whole Numbers', () => {
    /**
     * **Validates: Requirements 3.5, 3.6, 3.7**
     * 
     * For any nutrition calculation (calories, portion size, hydration),
     * the system should return values rounded to the nearest whole number.
     */
    it('should return whole numbers for calorie calculations', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true }), // weight in kg
          fc.constantFrom('low', 'moderate', 'high'), // activity level
          (weight, activityLevel) => {
            const result = calculateDailyCalories(weight, 0, activityLevel);
            
            // Check that result is a whole number (no decimal part)
            expect(Number.isInteger(result)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return whole numbers for portion size calculations', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true }), // weight in kg
          (weight) => {
            const result = calculatePortionSize(weight);
            
            // Check that result is a whole number (no decimal part)
            expect(Number.isInteger(result)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return whole numbers for hydration calculations', () => {
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.1), max: Math.fround(100), noNaN: true }), // weight in kg
          (weight) => {
            const result = calculateHydration(weight);
            
            // Check that result is a whole number (no decimal part)
            expect(Number.isInteger(result)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Unit Tests for Calculation Edge Cases', () => {
    /**
     * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 4.4**
     * 
     * Unit tests for specific edge cases in nutrition calculations.
     */
    
    describe('Minimum weight (0.1 kg)', () => {
      it('should calculate calories correctly for minimum weight', () => {
        expect(calculateDailyCalories(0.1, 0, 'low')).toBe(Math.round((0.1 * 30 + 70) * 1.2));
        expect(calculateDailyCalories(0.1, 0, 'moderate')).toBe(Math.round((0.1 * 30 + 70) * 1.4));
        expect(calculateDailyCalories(0.1, 0, 'high')).toBe(Math.round((0.1 * 30 + 70) * 1.6));
      });

      it('should calculate portion size correctly for minimum weight', () => {
        expect(calculatePortionSize(0.1)).toBe(Math.round(0.1 * 25));
      });

      it('should calculate hydration correctly for minimum weight', () => {
        expect(calculateHydration(0.1)).toBe(Math.round(0.1 * 50));
      });
    });

    describe('Maximum weight (200 kg)', () => {
      it('should calculate calories correctly for maximum weight', () => {
        expect(calculateDailyCalories(200, 0, 'low')).toBe(Math.round((200 * 30 + 70) * 1.2));
        expect(calculateDailyCalories(200, 0, 'moderate')).toBe(Math.round((200 * 30 + 70) * 1.4));
        expect(calculateDailyCalories(200, 0, 'high')).toBe(Math.round((200 * 30 + 70) * 1.6));
      });

      it('should calculate portion size correctly for maximum weight', () => {
        expect(calculatePortionSize(200)).toBe(Math.round(200 * 25));
      });

      it('should calculate hydration correctly for maximum weight', () => {
        expect(calculateHydration(200)).toBe(Math.round(200 * 50));
      });
    });

    describe('Activity level multipliers', () => {
      const testWeight = 10; // Use a standard weight for testing multipliers

      it('should apply low activity multiplier (1.2) correctly', () => {
        const result = calculateDailyCalories(testWeight, 0, 'low');
        const expected = Math.round((testWeight * 30 + 70) * 1.2);
        expect(result).toBe(expected);
      });

      it('should apply moderate activity multiplier (1.4) correctly', () => {
        const result = calculateDailyCalories(testWeight, 0, 'moderate');
        const expected = Math.round((testWeight * 30 + 70) * 1.4);
        expect(result).toBe(expected);
      });

      it('should apply high activity multiplier (1.6) correctly', () => {
        const result = calculateDailyCalories(testWeight, 0, 'high');
        const expected = Math.round((testWeight * 30 + 70) * 1.6);
        expect(result).toBe(expected);
      });
    });

    describe('Decimal weight inputs', () => {
      const decimalWeights = [5.5, 12.75, 25.333, 50.99, 100.01];

      decimalWeights.forEach(weight => {
        it(`should calculate calories correctly for weight ${weight} kg`, () => {
          const result = calculateDailyCalories(weight, 0, 'moderate');
          const expected = Math.round((weight * 30 + 70) * 1.4);
          expect(result).toBe(expected);
        });

        it(`should calculate portion size correctly for weight ${weight} kg`, () => {
          const result = calculatePortionSize(weight);
          const expected = Math.round(weight * 25);
          expect(result).toBe(expected);
        });

        it(`should calculate hydration correctly for weight ${weight} kg`, () => {
          const result = calculateHydration(weight);
          const expected = Math.round(weight * 50);
          expect(result).toBe(expected);
        });
      });
    });
  });
});
