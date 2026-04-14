// Feature: boompets-nutrition-app
// Unit tests for OnboardingScreen validation

const React = require('react');
const { render, fireEvent, waitFor } = require('@testing-library/react-native');
const fc = require('fast-check');
const OnboardingScreen = require('./OnboardingScreen').default;
const { PetProvider } = require('../context/PetContext');

// Mock navigation
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  replace: mockReplace,
};

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock PetContext
const mockCreatePet = jest.fn();
jest.mock('../context/PetContext', () => {
  const actual = jest.requireActual('../context/PetContext');
  return {
    ...actual,
    usePet: jest.fn(() => ({
      createPet: mockCreatePet,
      pet: null,
      meals: [],
    })),
  };
});

// Mock AuthContext
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 'test-user-id', email: 'test@example.com', name: 'Test User' },
    isAuthenticated: true,
  })),
}));

describe('OnboardingScreen Validation Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreatePet.mockResolvedValue({ success: true, pet: { _id: 'pet-id' } });
  });

  /**
   * **Validates: Requirements 15.1, 16.4**
   * 
   * Test that validation prevents submission with missing required fields
   */
  describe('Required field validation', () => {
    it('should display error when name is empty', () => {
      const { getByPlaceholderText, getByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      expect(getByText('Pet name is required')).toBeTruthy();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should display error when age is empty', () => {
      const { getByPlaceholderText, getByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const nameInput = getByPlaceholderText('Cooper');
      fireEvent.changeText(nameInput, 'Buddy');

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      expect(getByText('Age is required')).toBeTruthy();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should display error when weight is empty', () => {
      const { getByPlaceholderText, getByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const nameInput = getByPlaceholderText('Cooper');
      const ageInput = getByPlaceholderText('3');
      
      fireEvent.changeText(nameInput, 'Buddy');
      fireEvent.changeText(ageInput, '5');

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      expect(getByText('Weight is required')).toBeTruthy();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  /**
   * **Validates: Requirements 15.2, 16.4**
   * 
   * Test that validation enforces positive values for age and weight
   */
  describe('Positive value validation', () => {
    it('should display error when age is zero', () => {
      const { getByPlaceholderText, getByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const nameInput = getByPlaceholderText('Cooper');
      const ageInput = getByPlaceholderText('3');
      const weightInput = getByPlaceholderText('12.5');
      
      fireEvent.changeText(nameInput, 'Buddy');
      fireEvent.changeText(ageInput, '0');
      fireEvent.changeText(weightInput, '10');

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      expect(getByText('Age must be greater than 0')).toBeTruthy();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should display error when age is negative', () => {
      const { getByPlaceholderText, getByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const nameInput = getByPlaceholderText('Cooper');
      const ageInput = getByPlaceholderText('3');
      const weightInput = getByPlaceholderText('12.5');
      
      fireEvent.changeText(nameInput, 'Buddy');
      fireEvent.changeText(ageInput, '-5');
      fireEvent.changeText(weightInput, '10');

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      expect(getByText('Age must be greater than 0')).toBeTruthy();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should display error when weight is zero', () => {
      const { getByPlaceholderText, getByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const nameInput = getByPlaceholderText('Cooper');
      const ageInput = getByPlaceholderText('3');
      const weightInput = getByPlaceholderText('12.5');
      
      fireEvent.changeText(nameInput, 'Buddy');
      fireEvent.changeText(ageInput, '5');
      fireEvent.changeText(weightInput, '0');

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      expect(getByText('Weight must be greater than 0')).toBeTruthy();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should display error when weight is negative', () => {
      const { getByPlaceholderText, getByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const nameInput = getByPlaceholderText('Cooper');
      const ageInput = getByPlaceholderText('3');
      const weightInput = getByPlaceholderText('12.5');
      
      fireEvent.changeText(nameInput, 'Buddy');
      fireEvent.changeText(ageInput, '5');
      fireEvent.changeText(weightInput, '-10');

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      expect(getByText('Weight must be greater than 0')).toBeTruthy();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  /**
   * **Validates: Requirements 15.3**
   * 
   * Test that validation enforces numeric values
   */
  describe('Numeric value validation', () => {
    it('should display error when age is not a number', () => {
      const { getByPlaceholderText, getByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const nameInput = getByPlaceholderText('Cooper');
      const ageInput = getByPlaceholderText('3');
      const weightInput = getByPlaceholderText('12.5');
      
      fireEvent.changeText(nameInput, 'Buddy');
      fireEvent.changeText(ageInput, 'abc');
      fireEvent.changeText(weightInput, '10');

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      expect(getByText('Age must be greater than 0')).toBeTruthy();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('should display error when weight is not a number', () => {
      const { getByPlaceholderText, getByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const nameInput = getByPlaceholderText('Cooper');
      const ageInput = getByPlaceholderText('3');
      const weightInput = getByPlaceholderText('12.5');
      
      fireEvent.changeText(nameInput, 'Buddy');
      fireEvent.changeText(ageInput, '5');
      fireEvent.changeText(weightInput, 'xyz');

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      expect(getByText('Weight must be greater than 0')).toBeTruthy();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  /**
   * **Validates: Requirements 15.1, 16.4**
   * 
   * Test that error messages clear when user corrects input
   */
  describe('Error message clearing', () => {
    it('should clear name error when user enters valid name', () => {
      const { getByPlaceholderText, getByText, queryByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      expect(getByText('Pet name is required')).toBeTruthy();

      const nameInput = getByPlaceholderText('Cooper');
      fireEvent.changeText(nameInput, 'Buddy');

      expect(queryByText('Pet name is required')).toBeNull();
    });

    it('should clear age error when user enters valid age', () => {
      const { getByPlaceholderText, getByText, queryByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const nameInput = getByPlaceholderText('Cooper');
      fireEvent.changeText(nameInput, 'Buddy');

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      expect(getByText('Age is required')).toBeTruthy();

      const ageInput = getByPlaceholderText('3');
      fireEvent.changeText(ageInput, '5');

      expect(queryByText('Age is required')).toBeNull();
    });

    it('should clear weight error when user enters valid weight', () => {
      const { getByPlaceholderText, getByText, queryByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const nameInput = getByPlaceholderText('Cooper');
      const ageInput = getByPlaceholderText('3');
      
      fireEvent.changeText(nameInput, 'Buddy');
      fireEvent.changeText(ageInput, '5');

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      expect(getByText('Weight is required')).toBeTruthy();

      const weightInput = getByPlaceholderText('12.5');
      fireEvent.changeText(weightInput, '10');

      expect(queryByText('Weight is required')).toBeNull();
    });
  });

  /**
   * **Validates: Requirements 16.4**
   * 
   * Test that valid form submission proceeds
   */
  describe('Valid form submission', () => {
    it('should call createPet and navigate on successful submission', async () => {
      const { getByPlaceholderText, getByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const nameInput = getByPlaceholderText('Cooper');
      const ageInput = getByPlaceholderText('3');
      const weightInput = getByPlaceholderText('12.5');
      
      fireEvent.changeText(nameInput, 'Buddy');
      fireEvent.changeText(ageInput, '5');
      fireEvent.changeText(weightInput, '15.5');

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      await waitFor(() => {
        expect(mockCreatePet).toHaveBeenCalledWith({
          userId: 'test-user-id',
          name: 'Buddy',
          animalType: 'dog',
          breed: '',
          age: 5,
          weight: 15.5,
        });
        expect(mockReplace).toHaveBeenCalledWith('Main');
      });
    });

    it('should include selected animal type in submission', async () => {
      const { getByPlaceholderText, getByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const nameInput = getByPlaceholderText('Cooper');
      const ageInput = getByPlaceholderText('3');
      const weightInput = getByPlaceholderText('12.5');
      
      fireEvent.changeText(nameInput, 'Whiskers');
      fireEvent.changeText(ageInput, '2');
      fireEvent.changeText(weightInput, '4.5');

      // Select cat as animal type
      const catButton = getByText('Cat');
      fireEvent.press(catButton);

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      await waitFor(() => {
        expect(mockCreatePet).toHaveBeenCalledWith({
          userId: 'test-user-id',
          name: 'Whiskers',
          animalType: 'cat',
          breed: '',
          age: 2,
          weight: 4.5,
        });
        expect(mockReplace).toHaveBeenCalledWith('Main');
      });
    });

    it('should include optional breed field in submission', async () => {
      const { getByPlaceholderText, getByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const nameInput = getByPlaceholderText('Cooper');
      const breedInput = getByPlaceholderText('e.g. Golden Retriever');
      const ageInput = getByPlaceholderText('3');
      const weightInput = getByPlaceholderText('12.5');
      
      fireEvent.changeText(nameInput, 'Max');
      fireEvent.changeText(breedInput, 'Labrador');
      fireEvent.changeText(ageInput, '4');
      fireEvent.changeText(weightInput, '30');

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      await waitFor(() => {
        expect(mockCreatePet).toHaveBeenCalledWith({
          userId: 'test-user-id',
          name: 'Max',
          animalType: 'dog',
          breed: 'Labrador',
          age: 4,
          weight: 30,
        });
        expect(mockReplace).toHaveBeenCalledWith('Main');
      });
    });

    it('should show error alert when createPet fails', async () => {
      const Alert = require('react-native/Libraries/Alert/Alert');
      mockCreatePet.mockResolvedValue({ success: false, error: 'Failed to create pet' });

      const { getByPlaceholderText, getByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const nameInput = getByPlaceholderText('Cooper');
      const ageInput = getByPlaceholderText('3');
      const weightInput = getByPlaceholderText('12.5');
      
      fireEvent.changeText(nameInput, 'Buddy');
      fireEvent.changeText(ageInput, '5');
      fireEvent.changeText(weightInput, '15.5');

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to create pet');
        expect(mockReplace).not.toHaveBeenCalled();
      });
    });

    it('should show loading indicator during submission', async () => {
      let resolveCreatePet;
      mockCreatePet.mockReturnValue(new Promise((resolve) => {
        resolveCreatePet = resolve;
      }));

      const { getByPlaceholderText, getByText, UNSAFE_queryByType } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const nameInput = getByPlaceholderText('Cooper');
      const ageInput = getByPlaceholderText('3');
      const weightInput = getByPlaceholderText('12.5');
      
      fireEvent.changeText(nameInput, 'Buddy');
      fireEvent.changeText(ageInput, '5');
      fireEvent.changeText(weightInput, '15.5');

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      // Check that ActivityIndicator is shown
      await waitFor(() => {
        const ActivityIndicator = require('react-native').ActivityIndicator;
        expect(UNSAFE_queryByType(ActivityIndicator)).toBeTruthy();
      });

      // Resolve the promise
      resolveCreatePet({ success: true, pet: { _id: 'pet-id' } });

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('Main');
      });
    });

    it('should disable button during submission', async () => {
      let resolveCreatePet;
      mockCreatePet.mockReturnValue(new Promise((resolve) => {
        resolveCreatePet = resolve;
      }));

      const { getByPlaceholderText, getByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const nameInput = getByPlaceholderText('Cooper');
      const ageInput = getByPlaceholderText('3');
      const weightInput = getByPlaceholderText('12.5');
      
      fireEvent.changeText(nameInput, 'Buddy');
      fireEvent.changeText(ageInput, '5');
      fireEvent.changeText(weightInput, '15.5');

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      // Try to press again - should not call createPet twice
      fireEvent.press(continueButton);

      await waitFor(() => {
        expect(mockCreatePet).toHaveBeenCalledTimes(1);
      });

      // Resolve the promise
      resolveCreatePet({ success: true, pet: { _id: 'pet-id' } });
    });

    it('should show error alert when createPet throws an exception', async () => {
      const Alert = require('react-native/Libraries/Alert/Alert');
      mockCreatePet.mockRejectedValue(new Error('Network error'));

      const { getByPlaceholderText, getByText } = render(
        <OnboardingScreen navigation={mockNavigation} />
      );

      const nameInput = getByPlaceholderText('Cooper');
      const ageInput = getByPlaceholderText('3');
      const weightInput = getByPlaceholderText('12.5');
      
      fireEvent.changeText(nameInput, 'Buddy');
      fireEvent.changeText(ageInput, '5');
      fireEvent.changeText(weightInput, '15.5');

      const continueButton = getByText('Continue');
      fireEvent.press(continueButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'An unexpected error occurred. Please try again.');
        expect(mockReplace).not.toHaveBeenCalled();
      });
    });
  });
});
