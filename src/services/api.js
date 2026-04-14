import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000/api';

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 401) {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    throw { response: { data, status: response.status } };
  }
  
  return data;
};

export const petAPI = {
  create: async (petData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/pets`, {
      method: 'POST',
      headers,
      body: JSON.stringify(petData),
    });
    return handleResponse(response);
  },
  
  get: async (petId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/pets/${petId}`, { headers });
    return handleResponse(response);
  },
  
  update: async (petId, petData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/pets/${petId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(petData),
    });
    return handleResponse(response);
  },
  
  getByUser: async (userId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/pets/user/${userId}`, { headers });
    return handleResponse(response);
  },
  
  addAllergy: async (petId, allergy) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/pets/${petId}/allergies`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ action: 'add', allergy }),
    });
    return handleResponse(response);
  },
  
  removeAllergy: async (petId, allergy) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/pets/${petId}/allergies`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ action: 'remove', allergy }),
    });
    return handleResponse(response);
  },
  
  addHealthCondition: async (petId, condition) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/pets/${petId}/health-conditions`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ action: 'add', condition }),
    });
    return handleResponse(response);
  },
  
  removeHealthCondition: async (petId, condition) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/pets/${petId}/health-conditions`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ action: 'remove', condition }),
    });
    return handleResponse(response);
  },
};

export const mealAPI = {
  create: async (mealData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/meals`, {
      method: 'POST',
      headers,
      body: JSON.stringify(mealData),
    });
    return handleResponse(response);
  },
  
  getByPet: async (petId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/meals/pet/${petId}`, { headers });
    return handleResponse(response);
  },
  
  update: async (mealId, mealData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/meals/${mealId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(mealData),
    });
    return handleResponse(response);
  },
  
  getStats: async (petId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/meals/pet/${petId}/stats`, { headers });
    return handleResponse(response);
  },
};

export const nutritionAPI = {
  generate: async (petId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/nutrition/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ petId }),
    });
    return handleResponse(response);
  },
  
  getByPet: async (petId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/nutrition/pet/${petId}`, { headers });
    return handleResponse(response);
  },
  
  update: async (planId, updates) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/nutrition/${planId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },
};

export const userAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },
  
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },
};
