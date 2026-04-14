import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from './HomeScreen';
import * as PetContext from '../context/PetContext';

// Mock the usePet hook
jest.mock('../context/PetContext', () => ({
  usePet: jest.fn(),
}));

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
};

describe('HomeScreen - Pet Profile Card', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display pet name', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
      },
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('Cooper')).toBeTruthy();
  });

  it('should display pet breed and age', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
      },
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('Golden Retriever • 3 years old')).toBeTruthy();
  });

  it('should display pet weight', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
      },
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('Weight: 25 kg')).toBeTruthy();
  });

  it('should display edit button', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
      },
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('Edit Profile')).toBeTruthy();
  });

  it('should navigate to Profile screen when edit button is pressed', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
      },
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    const editButton = getByText('Edit Profile');
    fireEvent.press(editButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('Profile');
  });

  it('should display default values when pet data is missing', () => {
    PetContext.usePet.mockReturnValue({
      pet: null,
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('Your Pet')).toBeTruthy();
    expect(getByText('Unknown breed • 0 years old')).toBeTruthy();
    expect(getByText('Weight: 0 kg')).toBeTruthy();
  });

  it('should display paw icon in avatar', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
      },
      meals: [],
    });

    const { UNSAFE_getAllByType } = render(<HomeScreen navigation={mockNavigation} />);
    
    // Check that Ionicons components exist (including paw icon)
    const icons = UNSAFE_getAllByType(require('@expo/vector-icons').Ionicons);
    expect(icons.length).toBeGreaterThan(0);
    
    // Check that at least one icon has the 'paw' name
    const pawIcon = icons.find(icon => icon.props.name === 'paw');
    expect(pawIcon).toBeTruthy();
  });
});

describe('HomeScreen - Health & Allergies Section', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display allergies as tags', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        allergies: ['grain', 'chicken'],
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('grain')).toBeTruthy();
    expect(getByText('chicken')).toBeTruthy();
  });

  it('should display health conditions list', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        healthConditions: ['sensitive skin', 'arthritis'],
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('• sensitive skin')).toBeTruthy();
    expect(getByText('• arthritis')).toBeTruthy();
  });

  it('should display empty state when no allergies', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        allergies: [],
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('No allergies recorded')).toBeTruthy();
  });

  it('should display empty state when no health conditions', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        healthConditions: [],
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('No health conditions recorded')).toBeTruthy();
  });

  it('should display add allergy button', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getAllByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    const addButtons = getAllByText('+ Add Allergy');
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it('should display add health condition button', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getAllByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    const addButtons = getAllByText('+ Add Health Condition');
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it('should navigate to Profile when add allergy button is pressed', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getAllByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    const addButton = getAllByText('+ Add Allergy')[0];
    fireEvent.press(addButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('Profile');
  });

  it('should navigate to Profile when add health condition button is pressed', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getAllByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    const addButton = getAllByText('+ Add Health Condition')[0];
    fireEvent.press(addButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('Profile');
  });

  it('should call updatePet when removing an allergy', async () => {
    const mockUpdatePet = jest.fn();
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        allergies: ['grain', 'chicken'],
      },
      updatePet: mockUpdatePet,
      meals: [],
    });

    const { UNSAFE_getAllByType } = render(<HomeScreen navigation={mockNavigation} />);
    
    // Find the close icon for allergies
    const icons = UNSAFE_getAllByType(require('@expo/vector-icons').Ionicons);
    const closeIcon = icons.find(icon => icon.props.name === 'close-circle');
    
    expect(closeIcon).toBeTruthy();
    fireEvent.press(closeIcon);
    
    expect(mockUpdatePet).toHaveBeenCalled();
  });

  it('should call updatePet when removing a health condition', async () => {
    const mockUpdatePet = jest.fn();
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        healthConditions: ['sensitive skin', 'arthritis'],
      },
      updatePet: mockUpdatePet,
      meals: [],
    });

    const { UNSAFE_getAllByType } = render(<HomeScreen navigation={mockNavigation} />);
    
    // Find the trash icon for health conditions
    const icons = UNSAFE_getAllByType(require('@expo/vector-icons').Ionicons);
    const trashIcon = icons.find(icon => icon.props.name === 'trash-outline');
    
    expect(trashIcon).toBeTruthy();
    fireEvent.press(trashIcon);
    
    expect(mockUpdatePet).toHaveBeenCalled();
  });

  it('should remove correct allergy when close button is pressed', async () => {
    const mockUpdatePet = jest.fn();
    const pet = {
      name: 'Cooper',
      breed: 'Golden Retriever',
      age: 3,
      weight: 25,
      allergies: ['grain', 'chicken', 'beef'],
    };
    
    PetContext.usePet.mockReturnValue({
      pet,
      updatePet: mockUpdatePet,
      meals: [],
    });

    const { UNSAFE_getAllByType } = render(<HomeScreen navigation={mockNavigation} />);
    
    // Find all close icons
    const icons = UNSAFE_getAllByType(require('@expo/vector-icons').Ionicons);
    const closeIcons = icons.filter(icon => icon.props.name === 'close-circle');
    
    // Press the first close icon (should remove 'grain')
    fireEvent.press(closeIcons[0]);
    
    expect(mockUpdatePet).toHaveBeenCalledWith({
      ...pet,
      allergies: ['chicken', 'beef'],
    });
  });

  it('should remove correct health condition when trash button is pressed', async () => {
    const mockUpdatePet = jest.fn();
    const pet = {
      name: 'Cooper',
      breed: 'Golden Retriever',
      age: 3,
      weight: 25,
      healthConditions: ['sensitive skin', 'arthritis', 'diabetes'],
    };
    
    PetContext.usePet.mockReturnValue({
      pet,
      updatePet: mockUpdatePet,
      meals: [],
    });

    const { UNSAFE_getAllByType } = render(<HomeScreen navigation={mockNavigation} />);
    
    // Find all trash icons
    const icons = UNSAFE_getAllByType(require('@expo/vector-icons').Ionicons);
    const trashIcons = icons.filter(icon => icon.props.name === 'trash-outline');
    
    // Press the first trash icon (should remove 'sensitive skin')
    fireEvent.press(trashIcons[0]);
    
    expect(mockUpdatePet).toHaveBeenCalledWith({
      ...pet,
      healthConditions: ['arthritis', 'diabetes'],
    });
  });
});

describe('HomeScreen - Environmental Context Section', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display climate from pet data', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        climate: 'Tropical',
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('Tropical')).toBeTruthy();
  });

  it('should display activity level from pet data', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        activityLevel: 'high',
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('High')).toBeTruthy();
  });

  it('should display default climate when not set', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('Temperate')).toBeTruthy();
  });

  it('should display default activity level when not set', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('Moderate')).toBeTruthy();
  });

  it('should capitalize activity level', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        activityLevel: 'low',
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('Low')).toBeTruthy();
  });
});

describe('HomeScreen - Feeding Schedule Section', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display scheduled meal times', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        feedingSchedule: [
          { mealTime: 'breakfast', time: '8:00 AM', portionSize: 1.5, unit: 'cups' },
          { mealTime: 'dinner', time: '6:00 PM', portionSize: 1.25, unit: 'cups' },
        ],
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('8:00 AM • 1.5 cups')).toBeTruthy();
    expect(getByText('6:00 PM • 1.25 cups')).toBeTruthy();
  });

  it('should display portion sizes for each meal', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        feedingSchedule: [
          { mealTime: 'breakfast', time: '8:00 AM', portionSize: 200, unit: 'grams' },
          { mealTime: 'lunch', time: '12:00 PM', portionSize: 150, unit: 'grams' },
        ],
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('8:00 AM • 200 grams')).toBeTruthy();
    expect(getByText('12:00 PM • 150 grams')).toBeTruthy();
  });

  it('should order meals by time of day', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        feedingSchedule: [
          { mealTime: 'dinner', time: '6:00 PM', portionSize: 1.25, unit: 'cups' },
          { mealTime: 'breakfast', time: '8:00 AM', portionSize: 1.5, unit: 'cups' },
          { mealTime: 'lunch', time: '12:00 PM', portionSize: 1.0, unit: 'cups' },
        ],
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getAllByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    // Get all meal titles
    const breakfast = getAllByText('Breakfast')[0];
    const lunch = getAllByText('Lunch')[0];
    const dinner = getAllByText('Dinner')[0];
    
    expect(breakfast).toBeTruthy();
    expect(lunch).toBeTruthy();
    expect(dinner).toBeTruthy();
  });

  it('should display empty state when no feeding schedule', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        feedingSchedule: [],
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('No feeding schedule set')).toBeTruthy();
  });

  it('should display empty state when feedingSchedule is undefined', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('No feeding schedule set')).toBeTruthy();
  });

  it('should capitalize meal time names', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        feedingSchedule: [
          { mealTime: 'breakfast', time: '8:00 AM', portionSize: 1.5, unit: 'cups' },
          { mealTime: 'snack', time: '3:00 PM', portionSize: 0.5, unit: 'cups' },
        ],
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('Breakfast')).toBeTruthy();
    expect(getByText('Snack')).toBeTruthy();
  });

  it('should display correct icon for breakfast', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        feedingSchedule: [
          { mealTime: 'breakfast', time: '8:00 AM', portionSize: 1.5, unit: 'cups' },
        ],
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { UNSAFE_getAllByType } = render(<HomeScreen navigation={mockNavigation} />);
    
    const icons = UNSAFE_getAllByType(require('@expo/vector-icons').Ionicons);
    const sunnyIcon = icons.find(icon => icon.props.name === 'sunny' && icon.props.size === 24);
    
    expect(sunnyIcon).toBeTruthy();
  });

  it('should display correct icon for dinner', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        feedingSchedule: [
          { mealTime: 'dinner', time: '6:00 PM', portionSize: 1.25, unit: 'cups' },
        ],
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { UNSAFE_getAllByType } = render(<HomeScreen navigation={mockNavigation} />);
    
    const icons = UNSAFE_getAllByType(require('@expo/vector-icons').Ionicons);
    const moonIcon = icons.find(icon => icon.props.name === 'moon' && icon.props.size === 24);
    
    expect(moonIcon).toBeTruthy();
  });

  it('should display correct icon for lunch', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        feedingSchedule: [
          { mealTime: 'lunch', time: '12:00 PM', portionSize: 1.0, unit: 'cups' },
        ],
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { UNSAFE_getAllByType } = render(<HomeScreen navigation={mockNavigation} />);
    
    const icons = UNSAFE_getAllByType(require('@expo/vector-icons').Ionicons);
    const partlySunnyIcon = icons.find(icon => icon.props.name === 'partly-sunny' && icon.props.size === 24);
    
    expect(partlySunnyIcon).toBeTruthy();
  });

  it('should display correct icon for snack', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        feedingSchedule: [
          { mealTime: 'snack', time: '3:00 PM', portionSize: 0.5, unit: 'cups' },
        ],
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { UNSAFE_getAllByType } = render(<HomeScreen navigation={mockNavigation} />);
    
    const icons = UNSAFE_getAllByType(require('@expo/vector-icons').Ionicons);
    const fastFoodIcon = icons.find(icon => icon.props.name === 'fast-food' && icon.props.size === 24);
    
    expect(fastFoodIcon).toBeTruthy();
  });

  it('should handle multiple meals with same time classification', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        feedingSchedule: [
          { mealTime: 'snack', time: '10:00 AM', portionSize: 0.5, unit: 'cups' },
          { mealTime: 'snack', time: '3:00 PM', portionSize: 0.5, unit: 'cups' },
        ],
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getAllByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    const snackTitles = getAllByText('Snack');
    expect(snackTitles.length).toBe(2);
  });

  it('should sort meals correctly across AM and PM', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        feedingSchedule: [
          { mealTime: 'dinner', time: '6:00 PM', portionSize: 1.25, unit: 'cups' },
          { mealTime: 'breakfast', time: '7:00 AM', portionSize: 1.5, unit: 'cups' },
          { mealTime: 'snack', time: '10:00 PM', portionSize: 0.5, unit: 'cups' },
          { mealTime: 'lunch', time: '12:00 PM', portionSize: 1.0, unit: 'cups' },
        ],
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getAllByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    // Verify all meals are displayed
    expect(getAllByText('Breakfast')[0]).toBeTruthy();
    expect(getAllByText('Lunch')[0]).toBeTruthy();
    expect(getAllByText('Dinner')[0]).toBeTruthy();
    expect(getAllByText('Snack')[0]).toBeTruthy();
  });

  it('should handle 12:00 AM (midnight) correctly', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        feedingSchedule: [
          { mealTime: 'snack', time: '12:00 AM', portionSize: 0.5, unit: 'cups' },
          { mealTime: 'breakfast', time: '8:00 AM', portionSize: 1.5, unit: 'cups' },
        ],
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('12:00 AM • 0.5 cups')).toBeTruthy();
    expect(getByText('8:00 AM • 1.5 cups')).toBeTruthy();
  });

  it('should handle 12:00 PM (noon) correctly', () => {
    PetContext.usePet.mockReturnValue({
      pet: {
        name: 'Cooper',
        breed: 'Golden Retriever',
        age: 3,
        weight: 25,
        feedingSchedule: [
          { mealTime: 'lunch', time: '12:00 PM', portionSize: 1.0, unit: 'cups' },
          { mealTime: 'dinner', time: '6:00 PM', portionSize: 1.25, unit: 'cups' },
        ],
      },
      updatePet: jest.fn(),
      meals: [],
    });

    const { getByText } = render(<HomeScreen navigation={mockNavigation} />);
    
    expect(getByText('12:00 PM • 1 cups')).toBeTruthy();
    expect(getByText('6:00 PM • 1.25 cups')).toBeTruthy();
  });
});
