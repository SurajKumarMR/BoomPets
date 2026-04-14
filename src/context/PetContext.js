import React, { createContext, useState, useContext } from 'react';
import { petAPI, mealAPI } from '../services/api';

const PetContext = createContext();

export const usePet = () => useContext(PetContext);

export const PetProvider = ({ children }) => {
  const [pet, setPet] = useState(null);
  const [pets, setPets] = useState([]);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updatePet = async (petData) => {
    const previousPet = pet;
    setPet(petData);
    
    if (petData._id) {
      try {
        await petAPI.update(petData._id, petData);
      } catch (err) {
        setPet(previousPet);
        setError(err.response?.data?.error || 'Failed to update pet');
        throw err;
      }
    }
  };

  const createPet = async (petData) => {
    setLoading(true);
    setError(null);
    try {
      const newPet = await petAPI.create(petData);
      setPet(newPet);
      setPets([...pets, newPet]);
      return { success: true, pet: newPet };
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create pet';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const loadPets = async (userId) => {
    setLoading(true);
    try {
      const userPets = await petAPI.getByUser(userId);
      setPets(userPets);
      if (userPets.length > 0 && !pet) {
        setPet(userPets[0]);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load pets');
    } finally {
      setLoading(false);
    }
  };

  const switchPet = async (petId) => {
    const selectedPet = pets.find(p => p._id === petId);
    if (selectedPet) {
      setPet(selectedPet);
      await loadMeals(petId);
    }
  };

  const addMeal = async (mealData) => {
    const mealWithTimestamp = { ...mealData, timestamp: new Date() };
    const previousMeals = meals;
    setMeals([mealWithTimestamp, ...meals]);
    
    try {
      const savedMeal = await mealAPI.create(mealWithTimestamp);
      setMeals([savedMeal, ...previousMeals]);
      return { success: true, meal: savedMeal };
    } catch (err) {
      setMeals(previousMeals);
      const errorMsg = err.response?.data?.error || 'Failed to add meal';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const loadMeals = async (petId) => {
    try {
      const petMeals = await mealAPI.getByPet(petId);
      setMeals(petMeals);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load meals');
    }
  };

  const updateMeal = async (mealId, updates) => {
    const previousMeals = meals;
    const updatedMeals = meals.map(m => 
      m._id === mealId ? { ...m, ...updates } : m
    );
    setMeals(updatedMeals);
    
    try {
      await mealAPI.update(mealId, updates);
    } catch (err) {
      setMeals(previousMeals);
      setError(err.response?.data?.error || 'Failed to update meal');
      throw err;
    }
  };

  return (
    <PetContext.Provider value={{ 
      pet, 
      pets,
      meals, 
      loading,
      error,
      updatePet, 
      createPet,
      loadPets,
      switchPet,
      addMeal,
      loadMeals,
      updateMeal,
      setError,
    }}>
      {children}
    </PetContext.Provider>
  );
};
