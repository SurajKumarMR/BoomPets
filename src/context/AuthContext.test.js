// Feature: boompets-nutrition-app
// Unit tests for AuthContext provider

const React = require('react');
const { renderHook, act, waitFor } = require('@testing-library/react-native');
const fc = require('fast-check');
const AsyncStorage = require('@react-native-async-storage/async-storage');
const { AuthProvider, useAuth } = require('./AuthContext');
const { userAPI } = require('../services/api');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock the API services
jest.mock('../services/api', () => ({
  userAPI: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

describe('AuthContext Provider Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.getItem.mockResolvedValue(null);
    AsyncStorage.setItem.mockResolvedValue(undefined);
    AsyncStorage.removeItem.mockResolvedValue(undefined);
  });

  const wrapper = ({ children }) => React.createElement(AuthProvider, null, children);

  describe('login flow', () => {
    /**
     * **Validates: Requirements 1.1, 1.2**
     * 
     * Test that login properly authenticates user and updates state
     */
    it('should authenticate user and update state on successful login', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginResponse = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
        },
        token: 'jwt-token-123',
      };

      userAPI.login.mockResolvedValue(loginResponse);

      let response;
      await act(async () => {
        response = await result.current.login('test@example.com', 'password123');
      });

      expect(response.success).toBe(true);
      expect(result.current.user).toEqual(loginResponse.user);
      expect(result.current.token).toBe('jwt-token-123');
      expect(result.current.isAuthenticated).toBe(true);
      expect(userAPI.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return error on failed login', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      userAPI.login.mockRejectedValue({
        response: { data: { error: 'Invalid credentials' } },
      });

      let response;
      await act(async () => {
        response = await result.current.login('test@example.com', 'wrongpassword');
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid credentials');
      expect(result.current.user).toBeNull();
      expect(result.current.token).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle network errors during login', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      userAPI.login.mockRejectedValue(new Error('Network error'));

      let response;
      await act(async () => {
        response = await result.current.login('test@example.com', 'password123');
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Login failed');
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('token storage', () => {
    /**
     * **Validates: Requirements 7.1, 7.3**
     * 
     * Test that tokens are properly stored in AsyncStorage
     */
    it('should store token in AsyncStorage on successful login', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginResponse = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
        },
        token: 'jwt-token-123',
      };

      userAPI.login.mockResolvedValue(loginResponse);

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', 'jwt-token-123');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(loginResponse.user)
      );
    });

    it('should load token from AsyncStorage on initialization', async () => {
      const storedUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
      };

      AsyncStorage.getItem.mockImplementation((key) => {
        if (key === 'authToken') return Promise.resolve('jwt-token-123');
        if (key === 'user') return Promise.resolve(JSON.stringify(storedUser));
        return Promise.resolve(null);
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.token).toBe('jwt-token-123');
      expect(result.current.user).toEqual(storedUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should remove token from AsyncStorage on logout', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const loginResponse = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
        },
        token: 'jwt-token-123',
      };

      userAPI.login.mockResolvedValue(loginResponse);

      // Login first
      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
      expect(result.current.token).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle missing token in AsyncStorage gracefully', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.token).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('register flow', () => {
    /**
     * **Validates: Requirements 1.1**
     * 
     * Test that register creates account and stores token
     */
    it('should create account and store token on successful registration', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const registerResponse = {
        user: {
          id: 'user123',
          email: 'newuser@example.com',
          name: 'New User',
        },
        token: 'jwt-token-456',
      };

      userAPI.register.mockResolvedValue(registerResponse);

      let response;
      await act(async () => {
        response = await result.current.register(
          'newuser@example.com',
          'password123',
          'New User'
        );
      });

      expect(response.success).toBe(true);
      expect(result.current.user).toEqual(registerResponse.user);
      expect(result.current.token).toBe('jwt-token-456');
      expect(result.current.isAuthenticated).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', 'jwt-token-456');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(registerResponse.user)
      );
    });

    it('should return error on failed registration', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      userAPI.register.mockRejectedValue({
        response: { data: { error: 'Email already exists' } },
      });

      let response;
      await act(async () => {
        response = await result.current.register(
          'existing@example.com',
          'password123',
          'Test User'
        );
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Email already exists');
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Property-based tests for AuthContext', () => {
    /**
     * **Validates: Requirements 1.1, 1.2**
     * 
     * Property: For any valid credentials, login should update state correctly
     */
    it('should handle any valid login credentials', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 24 }),
          fc.string({ minLength: 1, maxLength: 100 }),
          async (email, password, userId, name) => {
            const loginResponse = {
              user: {
                id: userId,
                email: email,
                name: name,
              },
              token: `jwt-token-${userId}`,
            };

            userAPI.login.mockResolvedValue(loginResponse);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
              await result.current.login(email, password);
            });

            expect(result.current.user.email).toBe(email);
            expect(result.current.token).toBe(`jwt-token-${userId}`);
            expect(result.current.isAuthenticated).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * **Validates: Requirements 7.1, 7.3**
     * 
     * Property: For any successful login, token should be stored in AsyncStorage
     */
    it('should store token for any successful authentication', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress(),
          fc.string({ minLength: 8, maxLength: 50 }),
          fc.string({ minLength: 20, maxLength: 100 }),
          async (email, password, token) => {
            const loginResponse = {
              user: {
                id: 'user123',
                email: email,
                name: 'Test User',
              },
              token: token,
            };

            userAPI.login.mockResolvedValue(loginResponse);

            const { result } = renderHook(() => useAuth(), { wrapper });

            await act(async () => {
              await result.current.login(email, password);
            });

            expect(AsyncStorage.setItem).toHaveBeenCalledWith('authToken', token);
            expect(result.current.token).toBe(token);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
