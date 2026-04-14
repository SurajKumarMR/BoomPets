# Implementation Plan: BoomPets Nutrition App

## Overview

This implementation plan breaks down the BoomPets nutrition app into discrete coding tasks. The app uses React Native (Expo) for the frontend and Node.js/Express/MongoDB for the backend. Tasks are organized to build incrementally, starting with core infrastructure, then backend API, then frontend screens, and finally integration and testing.

## Tasks

- [x] 1. Set up backend infrastructure and database models
  - [x] 1.1 Create authentication middleware for JWT token validation
    - Implement JWT verification middleware
    - Add token extraction from Authorization header
    - Handle token expiration and invalid token errors
    - _Requirements: 1.5_
  
  - [x] 1.2 Create input validation middleware
    - Implement request body validation helpers
    - Add sanitization for user inputs
    - Create reusable validation functions for common fields
    - _Requirements: 15.1, 15.2, 15.3, 15.4_
  
  - [x] 1.3 Create error handling middleware
    - Implement centralized error handler
    - Map error types to HTTP status codes
    - Format error responses consistently
    - Log errors for debugging
    - _Requirements: 15.5, 15.6_
  
  - [x] 1.4 Write property tests for User model validation
    - **Property 4: Password Validation Enforces Requirements**
    - **Validates: Requirements 1.4**
  
  - [x] 1.5 Write property tests for Pet model validation
    - **Property 9: Pet Age and Weight Validation**
    - **Validates: Requirements 2.6, 15.2**

- [x] 2. Implement user authentication endpoints
  - [x] 2.1 Implement POST /api/users/register endpoint
    - Validate email format and password requirements
    - Hash password using bcryptjs (10 salt rounds)
    - Create user document in MongoDB
    - Generate and return JWT token
    - Handle duplicate email errors
    - _Requirements: 1.1, 1.4_
  
  - [x] 2.2 Implement POST /api/users/login endpoint
    - Validate credentials against database
    - Compare hashed passwords
    - Generate and return JWT token
    - Return descriptive errors for invalid credentials
    - _Requirements: 1.2, 1.3_
  
  - [x] 2.3 Write property tests for authentication
    - **Property 1: User Registration Creates Account with Token**
    - **Property 2: Valid Login Returns Token**
    - **Property 3: Invalid Credentials Return Error**
    - **Validates: Requirements 1.1, 1.2, 1.3**
  
  - [x] 2.4 Write unit tests for password validation edge cases
    - Test minimum 8 characters requirement
    - Test letter and number requirements
    - Test special character handling
    - _Requirements: 1.4_

- [x] 3. Implement pet management endpoints
  - [x] 3.1 Implement POST /api/pets endpoint
    - Validate required fields (name, animalType, age, weight)
    - Set default values (activityLevel: moderate, climate: temperate)
    - Validate age > 0 and weight > 0
    - Validate animalType enum (dog, cat, bird, fish)
    - Associate pet with authenticated user
    - Return created pet document
    - _Requirements: 2.1, 2.5, 2.6_
  
  - [x] 3.2 Implement GET /api/pets/:id endpoint
    - Validate ObjectId format
    - Verify user owns the pet
    - Return pet document or 404 error
    - _Requirements: 2.1_
  
  - [x] 3.3 Implement PUT /api/pets/:id endpoint
    - Validate ObjectId format
    - Verify user owns the pet
    - Update pet fields
    - Set updatedAt to current timestamp
    - Return updated pet document
    - _Requirements: 2.3, 14.4_
  
  - [x] 3.4 Implement GET /api/pets/user/:userId endpoint
    - Verify authenticated user matches userId
    - Return all pets for user ordered by createdAt
    - _Requirements: 2.4, 10.1_
  
  - [x] 3.5 Write property tests for pet CRUD operations
    - **Property 5: Pet Profile Creation Succeeds with Valid Data**
    - **Property 6: Pet Profile Updates Persist with Timestamp**
    - **Property 7: Multiple Pets Per User**
    - **Property 8: Default Values Set on Pet Creation**
    - **Validates: Requirements 2.1, 2.3, 2.4, 2.5, 14.4**
  
  - [x] 3.6 Write unit tests for pet validation
    - Test each valid animal type (dog, cat, bird, fish)
    - Test invalid animal type rejection
    - Test negative age rejection
    - Test zero weight rejection
    - _Requirements: 2.2, 2.6, 15.4_

- [x] 4. Implement nutrition calculator utility
  - [x] 4.1 Create calculateDailyCalories function
    - Implement formula: (weight × 30 + 70) × activityMultiplier
    - Apply multipliers: low=1.2, moderate=1.4, high=1.6
    - Round result to nearest whole number
    - _Requirements: 3.1, 3.2, 3.5_
  
  - [x] 4.2 Create calculatePortionSize function
    - Implement formula: weight × 25 grams
    - Round result to nearest whole number
    - _Requirements: 3.3, 3.6_
  
  - [x] 4.3 Create calculateHydration function
    - Implement formula: weight × 50 milliliters
    - Round result to nearest whole number
    - _Requirements: 3.4, 3.7_
  
  - [x] 4.4 Write property tests for nutrition calculations
    - **Property 11: Daily Calorie Calculation Formula**
    - **Property 12: Portion Size Calculation Formula**
    - **Property 13: Hydration Calculation Formula**
    - **Property 14: Nutrition Calculations Return Whole Numbers**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**
  
  - [x] 4.5 Write unit tests for calculation edge cases
    - Test with minimum weight (0.1 kg)
    - Test with maximum weight (200 kg)
    - Test each activity level multiplier
    - Test decimal weight inputs
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.4_

- [x] 5. Checkpoint - Ensure backend core functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement meal tracking endpoints
  - [x] 6.1 Implement POST /api/meals endpoint
    - Validate required fields (petId, name, type, portionSize, calories)
    - Set timestamp to current date/time
    - Set completed to false by default
    - Associate meal with pet
    - Return created meal document
    - _Requirements: 7.1, 7.3_
  
  - [x] 6.2 Implement GET /api/meals/pet/:petId endpoint
    - Verify user owns the pet
    - Return meals ordered by timestamp (descending)
    - _Requirements: 7.5, 7.6_
  
  - [x] 6.3 Implement PUT /api/meals/:id endpoint
    - Validate ObjectId format
    - Verify user owns the pet associated with meal
    - Update meal fields (especially completed status)
    - Return updated meal document
    - _Requirements: 7.4_
  
  - [x] 6.4 Implement GET /api/meals/pet/:petId/stats endpoint
    - Calculate sum of calories from completed meals for current day
    - Count number of completed meals
    - Return totalCalories and mealsCompleted
    - _Requirements: 7.7_
  
  - [x] 6.5 Write property tests for meal tracking
    - **Property 29: Meal Event Creation with Required Fields**
    - **Property 30: Meal Completion Status Update**
    - **Property 31: Meals Ordered by Timestamp**
    - **Property 32: Meal Pet Association**
    - **Property 33: Daily Calorie Sum Calculation**
    - **Validates: Requirements 7.1, 7.3, 7.4, 7.5, 7.6, 7.7**
  
  - [x] 6.6 Write unit tests for meal time classifications
    - Test each meal time (breakfast, lunch, dinner, snack)
    - Test meal completion toggle
    - Test daily calorie sum with multiple meals
    - _Requirements: 7.2, 7.4, 7.7_

- [x] 7. Implement nutrition plan endpoints
  - [x] 7.1 Implement POST /api/nutrition/generate endpoint
    - Fetch pet profile by petId
    - Calculate daily caloric needs using nutrition calculator
    - Generate 2+ meal recommendations
    - Filter meals based on pet allergies
    - Prioritize meals for health conditions
    - Create nutrition plan document with status 'active'
    - Set createdAt to current timestamp
    - Return nutrition plan with meals array
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1_
  
  - [x] 7.2 Implement GET /api/nutrition/pet/:petId endpoint
    - Verify user owns the pet
    - Return nutrition plans ordered by createdAt (descending)
    - _Requirements: 6.7_
  
  - [x] 7.3 Implement PUT /api/nutrition/:id endpoint
    - Update plan status (active, completed, paused)
    - Update plan meals and goals
    - Return updated plan document
    - _Requirements: 6.4_
  
  - [x] 7.4 Write property tests for nutrition plans
    - **Property 18: Meal Recommendations Generated**
    - **Property 19: Meal Recommendation Structure**
    - **Property 20: Allergy Filtering in Recommendations**
    - **Property 23: Nutrition Plan Creation with Status and Timestamp**
    - **Property 24: Nutrition Plan Pet Association**
    - **Property 25: Meal Data Storage in Plans**
    - **Property 28: Plans Ordered by Creation Date**
    - **Validates: Requirements 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.7, 14.6**
  
  - [x] 7.5 Write unit tests for meal recommendation logic
    - Test allergy filtering with specific ingredients
    - Test health condition prioritization
    - Test minimum 2 meals generated
    - Test meal structure completeness
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 8. Implement health and allergy management
  - [x] 8.1 Add endpoints for managing pet allergies and health conditions
    - Implement PATCH /api/pets/:id/allergies to add/remove allergies
    - Implement PATCH /api/pets/:id/health-conditions to add/remove conditions
    - Validate array operations
    - Return updated pet document
    - _Requirements: 2.7, 8.1, 8.2, 8.3, 8.4_
  
  - [x] 8.2 Write property tests for health data management
    - **Property 10: Health Data Storage**
    - **Property 34: Allergy and Health Condition Removal**
    - **Validates: Requirements 2.7, 8.1, 8.2, 8.3, 8.4**

- [x] 9. Set up frontend state management
  - [x] 9.1 Enhance PetContext with full state management
    - Add pet state and updatePet function
    - Add meals array and addMeal function
    - Add meal timestamp on creation
    - Implement optimistic UI updates
    - Add error handling and rollback
    - _Requirements: 7.1, 7.3_
  
  - [x] 9.2 Create AuthContext for authentication state
    - Add user, token, and isAuthenticated state
    - Implement login function with API call
    - Implement register function with API call
    - Implement logout function
    - Store token in AsyncStorage
    - Add token refresh logic
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [x] 9.3 Write unit tests for context providers
    - Test PetContext updatePet function
    - Test PetContext addMeal with timestamp
    - Test AuthContext login flow
    - Test AuthContext token storage
    - _Requirements: 1.1, 1.2, 7.1, 7.3_

- [x] 10. Implement API service layer
  - [x] 10.1 Enhance api.js service with all endpoints
    - Configure Axios base URL from environment
    - Add request interceptor for JWT token
    - Add response interceptor for error handling
    - Implement authentication endpoints (register, login)
    - Implement pet endpoints (create, read, update, list)
    - Implement meal endpoints (create, read, update, stats)
    - Implement nutrition endpoints (generate, list)
    - _Requirements: 1.1, 1.2, 2.1, 2.3, 2.4, 7.1, 7.4, 7.5_
  
  - [x] 10.2 Write unit tests for API error handling
    - Test 400 validation error handling
    - Test 401 authentication error handling
    - Test 404 not found error handling
    - Test 500 server error handling
    - Test network error handling
    - _Requirements: 1.3, 15.5, 15.6_

- [x] 11. Checkpoint - Ensure backend and API layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement OnboardingScreen
  - [x] 12.1 Build onboarding form UI
    - Create form with name, animalType, breed, age, weight inputs
    - Add animal type selector with icons
    - Add progress indicator
    - Style with orange primary color (#F5A623) and cream background (#FAF9F6)
    - _Requirements: 16.1, 16.2, 16.4, 17.4_
  
  - [x] 12.2 Implement onboarding form validation
    - Validate required fields (name, animalType, age, weight)
    - Show inline error messages for invalid inputs
    - Validate age > 0 and weight > 0
    - Prevent submission until valid
    - _Requirements: 15.1, 15.2, 16.4_
  
  - [x] 12.3 Implement onboarding submission
    - Call API to create pet profile
    - Update PetContext with new pet
    - Set as active profile
    - Navigate to Main tabs on success
    - Show loading indicator during submission
    - Handle API errors gracefully
    - _Requirements: 2.1, 16.3, 16.6, 17.3_
  
  - [x] 12.4 Write unit tests for OnboardingScreen
    - Test validation error display
    - Test successful submission flow
    - Test navigation after completion
    - _Requirements: 16.3, 16.4_

- [x] 13. Implement HomeScreen
  - [x] 13.1 Build pet profile card component
    - Display pet avatar, name, breed, age, weight
    - Add edit button for profile updates
    - Style with rounded corners and paw print icons
    - _Requirements: 17.4, 17.5_
  
  - [x] 13.2 Build health and allergies section
    - Display allergies as tags
    - Display health conditions list
    - Add buttons to add/remove allergies and conditions
    - _Requirements: 8.6, 9.4_
  
  - [x] 13.3 Build environmental context section
    - Display climate information
    - Display activity level
    - Add edit functionality
    - _Requirements: 9.2, 9.4_
  
  - [x] 13.4 Build feeding schedule section
    - Display scheduled meal times
    - Show portion sizes for each meal
    - Order meals by time of day
    - _Requirements: 11.4_
  
  - [x] 13.5 Write unit tests for HomeScreen components
    - Test pet profile card rendering
    - Test health data display
    - Test environmental context display
    - _Requirements: 8.6, 9.4_

- [x] 14. Implement CalculatorScreen
  - [x] 14.1 Build calculator UI
    - Create weight input field with decimal support
    - Add weight slider for interactive input
    - Display paw print icon
    - Style with app color scheme
    - _Requirements: 4.4, 17.4_
  
  - [x] 14.2 Implement real-time calculation updates
    - Calculate portion size on weight change
    - Calculate daily calories on weight change
    - Calculate hydration on weight change
    - Update UI within 200ms
    - Display portion divided by 2 for twice-daily feeding
    - _Requirements: 3.1, 3.3, 3.4, 4.1, 4.2, 4.3_
  
  - [x] 14.3 Implement save functionality
    - Save calculated values to pet profile via API
    - Update PetContext with new values
    - Show success feedback
    - Handle errors gracefully
    - _Requirements: 4.5_
  
  - [x] 14.4 Write unit tests for CalculatorScreen
    - Test calculation updates on weight change
    - Test portion division for twice-daily feeding
    - Test save functionality
    - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 15. Implement NutritionScreen
  - [x] 15.1 Build nutrition plan header
    - Display pet name and plan title
    - Show plan generation timestamp
    - Style with app color scheme
    - _Requirements: 17.4_
  
  - [x] 15.2 Build meal recommendation cards
    - Display meal name, type, description
    - Show ingredient list
    - Add select meal button
    - Add favorite button
    - Style with rounded corners
    - _Requirements: 5.2, 17.4, 17.5_
  
  - [x] 15.3 Implement meal recommendation generation
    - Call API to generate nutrition plan
    - Display loading indicator during generation
    - Show at least 2 meal recommendations
    - Handle API errors
    - _Requirements: 5.1, 17.3_
  
  - [x] 15.4 Implement meal selection
    - Add selected meal to active nutrition plan via API
    - Update local state
    - Show success feedback
    - _Requirements: 5.6_
  
  - [x] 15.5 Write unit tests for NutritionScreen
    - Test meal recommendation display
    - Test meal selection flow
    - Test loading state
    - _Requirements: 5.1, 5.2, 5.6_

- [x] 16. Implement DietScreen
  - [x] 16.1 Build tab navigation (Saved Plans / Diet History)
    - Create tab selector component
    - Switch between saved plans and history views
    - Style tabs with active/inactive states
    - _Requirements: 17.4_
  
  - [x] 16.2 Build active nutrition plan display
    - Show plan name, description, duration
    - Calculate and display progress percentage
    - Show progress bar visual
    - Display weeks completed and weeks remaining
    - _Requirements: 6.5, 12.2, 12.3_
  
  - [x] 16.3 Build recommended plans section
    - Display plan cards with images
    - Show plan goals
    - Add select plan button
    - _Requirements: 6.6_
  
  - [x] 16.4 Build diet history section
    - Display recent 10 meal events by default
    - Show timestamp and calories for each meal
    - Show completion status
    - Order by timestamp (most recent first)
    - Display total daily calories
    - _Requirements: 7.5, 7.7, 12.4, 12.5_
  
  - [x] 16.5 Implement plan progress calculation
    - Calculate elapsed days from startDate
    - Calculate progress percentage: (elapsedDays / duration) × 100
    - Clamp between 0 and 100
    - Calculate weeks completed and remaining
    - _Requirements: 6.5, 12.2, 12.3_
  
  - [x] 16.6 Write property tests for plan progress
    - **Property 26: Plan Progress Calculation**
    - **Property 48: Week Calculation for Plans**
    - **Validates: Requirements 6.5, 12.2, 12.3**
  
  - [x] 16.7 Write unit tests for DietScreen
    - Test tab switching
    - Test progress bar display
    - Test history display with 10 items
    - Test daily calorie sum display
    - _Requirements: 7.7, 12.2, 12.4, 12.5_

- [x] 17. Implement ProfileScreen
  - [x] 17.1 Build pet profile card with edit functionality
    - Display all pet information
    - Add edit button
    - Implement inline editing
    - Save changes via API
    - _Requirements: 2.3_
  
  - [x] 17.2 Build health and allergies management section
    - Display current allergies and health conditions
    - Add input to add new items
    - Add remove buttons for each item
    - Update via API
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.6_
  
  - [x] 17.3 Build environmental context configuration
    - Add activity level selector (low, moderate, high)
    - Add climate input field
    - Save changes via API
    - Trigger nutrition recalculation on change
    - _Requirements: 9.1, 9.2, 9.3, 9.5_
  
  - [x] 17.4 Build feeding schedule management
    - Display current feeding schedule
    - Add new schedule entries
    - Support portion size in cups or grams
    - Associate with meal time classification
    - _Requirements: 11.1, 11.2, 11.3, 11.6_
  
  - [x] 17.5 Write unit tests for ProfileScreen
    - Test profile editing
    - Test allergy add/remove
    - Test activity level change
    - Test feeding schedule management
    - _Requirements: 2.3, 8.4, 9.1, 11.1_

- [x] 18. Checkpoint - Ensure all screens functional
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Implement multi-pet support
  - [x] 19.1 Add pet switcher component
    - Display list of user's pets
    - Show pet name, animal type, breed, age
    - Implement pet selection
    - Load selected pet's data
    - _Requirements: 10.1, 10.4_
  
  - [x] 19.2 Implement pet profile switching logic
    - Update PetContext with selected pet
    - Load pet's meals, plans, and calculations
    - Ensure data isolation between pets
    - Complete switch within 1 second
    - _Requirements: 10.2, 10.3_
  
  - [x] 19.3 Write property tests for multi-pet support
    - **Property 38: Pet Profile Switching Loads Correct Data**
    - **Property 39: Pet Data Isolation**
    - **Property 40: Pet List Display Fields**
    - **Validates: Requirements 10.2, 10.3, 10.4**
  
  - [x] 19.4 Write unit tests for pet switching
    - Test switching between 2 pets
    - Test data isolation
    - Test pet list display
    - _Requirements: 10.2, 10.3, 10.4_

- [x] 20. Implement navigation and routing
  - [x] 20.1 Configure navigation structure
    - Set up Stack Navigator for Onboarding and Main
    - Set up Bottom Tab Navigator for Home, Diet, Calculator, Profile
    - Add modal navigation for Nutrition screen
    - Configure tab icons with Ionicons
    - _Requirements: 17.1_
  
  - [x] 20.2 Implement navigation performance optimization
    - Ensure screen transitions complete within 500ms
    - Add visual feedback within 100ms of button taps
    - Maintain 60fps scrolling
    - _Requirements: 17.1, 17.2, 17.6_
  
  - [x] 20.3 Write unit tests for navigation
    - Test onboarding to main navigation
    - Test tab navigation
    - Test modal navigation to Nutrition screen
    - _Requirements: 17.1_

- [x] 21. Implement loading states and error handling
  - [x] 21.1 Add loading indicators to all async operations
    - Show spinner during API requests
    - Display within 200ms of operation start
    - Disable buttons during submission
    - Add timeout after 10 seconds
    - _Requirements: 17.3, 15.6_
  
  - [x] 21.2 Implement comprehensive error handling
    - Display user-friendly error messages
    - Show inline validation errors
    - Highlight invalid fields with red border
    - Clear errors when user corrects input
    - Handle network errors gracefully
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_
  
  - [x] 21.3 Write unit tests for error handling
    - Test validation error display
    - Test network error handling
    - Test timeout handling
    - _Requirements: 15.1, 15.5, 15.6_

- [x] 22. Implement data persistence and synchronization
  - [x] 22.1 Add AsyncStorage for token persistence
    - Store JWT token on login
    - Load token on app launch
    - Clear token on logout
    - Check token expiration
    - _Requirements: 1.5, 14.3_
  
  - [x] 22.2 Implement optimistic UI updates
    - Update local state immediately
    - Send API request asynchronously
    - Revert on failure with error message
    - _Requirements: 14.1_
  
  - [x] 22.3 Write property tests for data persistence
    - **Property 54: Data Persistence**
    - **Property 55: User Data Association**
    - **Property 56: Cross-Device Data Access**
    - **Validates: Requirements 14.1, 14.2, 14.3**

- [x] 23. Implement subscription management (optional premium feature)
  - [x] 23.1 Add subscription status to User model
    - Add subscriptionType field (free, monthly, yearly)
    - Add subscriptionExpiry field
    - _Requirements: 13.6_
  
  - [x] 23.2 Implement pet limit enforcement
    - Check subscription status on pet creation
    - Limit free tier to 2 pets
    - Allow unlimited pets for premium
    - _Requirements: 13.4, 13.5_
  
  - [x] 23.3 Write property tests for subscription features
    - **Property 52: Premium Feature Activation**
    - **Property 53: Subscription Data Storage**
    - **Validates: Requirements 13.3, 13.4, 13.6**

- [x] 24. Implement security enhancements
  - [x] 24.1 Add CORS configuration
    - Configure allowed origins
    - Set allowed methods (GET, POST, PUT, DELETE)
    - Enable credentials
    - _Requirements: Security considerations_
  
  - [x] 24.2 Add input sanitization
    - Sanitize all user inputs to prevent injection
    - Validate ObjectId format before queries
    - Escape special characters
    - _Requirements: Security considerations_
  
  - [x] 24.3 Implement rate limiting (optional)
    - Limit authentication endpoints to 5 requests per 15 minutes
    - Limit API endpoints to 100 requests per 15 minutes
    - Return 429 status when exceeded
    - _Requirements: Security considerations_

- [x] 25. Integration testing and end-to-end flows
  - [x] 25.1 Write integration tests for user registration to pet creation flow
    - Test complete registration flow
    - Test pet creation after registration
    - Test meal recommendation generation
    - _Requirements: 1.1, 2.1, 5.1_
  
  - [x] 25.2 Write integration tests for meal tracking flow
    - Test meal logging
    - Test meal completion
    - Test daily calorie calculation
    - Test history display
    - _Requirements: 7.1, 7.4, 7.7_
  
  - [x] 25.3 Write integration tests for nutrition plan flow
    - Test plan generation
    - Test meal selection
    - Test plan progress tracking
    - _Requirements: 5.1, 5.6, 6.5_

- [x] 26. Performance optimization and testing
  - [x] 26.1 Verify API response time requirements
    - Test authentication endpoints < 2 seconds
    - Test pet CRUD operations < 1 second
    - Test nutrition calculations < 100 milliseconds
    - Test meal recommendations < 3 seconds
    - Test meal updates < 500 milliseconds
    - _Requirements: 1.1, 1.2, 2.1, 2.3, 3.1, 3.3, 3.4, 5.1, 7.4_
  
  - [x] 26.2 Verify UI responsiveness requirements
    - Test screen navigation < 500ms
    - Test button feedback < 100ms
    - Test loading indicator display < 200ms
    - Test calculation updates < 200ms
    - _Requirements: 17.1, 17.2, 17.3, 4.1_

- [x] 27. Final checkpoint and deployment preparation
  - [x] 27.1 Create environment configuration files
    - Create backend .env with MongoDB URI, JWT secret, port
    - Create frontend environment config with API base URL
    - Document required environment variables
    - _Requirements: Security considerations_
  
  - [x] 27.2 Add database indexes for performance
    - Add index on User.email
    - Add index on Pet.userId
    - Add compound index on (Pet.userId, Pet.createdAt)
    - Add compound index on (Meal.petId, Meal.timestamp)
    - Add compound index on (NutritionPlan.petId, NutritionPlan.status, NutritionPlan.createdAt)
    - _Requirements: Performance considerations_
  
  - [x] 27.3 Final integration test
    - Test complete user journey from registration to meal tracking
    - Verify all features work together
    - Test error handling across all screens
    - Verify data persistence and synchronization
    - _Requirements: All requirements_

- [x] 28. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: backend infrastructure → API endpoints → frontend state management → UI screens → integration
- All property tests should run with minimum 100 iterations using fast-check library
- Code coverage target is 80% for critical paths
- Performance requirements are validated through dedicated test tasks
