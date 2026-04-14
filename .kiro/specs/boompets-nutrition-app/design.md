# Design Document: BoomPets Nutrition App

## Overview

BoomPets is a mobile-first nutrition management application built with React Native for the frontend and Node.js/Express/MongoDB for the backend. The application provides personalized nutrition recommendations for household pets (dogs, cats, birds, fish) through AI-powered meal suggestions, precise portion calculations, and comprehensive diet tracking.

The system architecture follows a client-server model where the React Native mobile application communicates with a RESTful API backend. State management is handled through React Context API, providing a lightweight solution for sharing pet profile data, meal history, and nutrition plans across components. The backend uses MongoDB for flexible document storage, accommodating varying pet profile structures and nutrition data.

Key design principles:
- Mobile-first responsive design with smooth 60fps interactions
- Offline-capable state management with server synchronization
- Modular component architecture for maintainability
- Security-first authentication with JWT tokens
- Performance-optimized calculations (sub-200ms response times)

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Screens    │  │   Context    │  │  Components  │      │
│  │              │  │              │  │              │      │
│  │ - Onboarding │  │ - PetContext │  │ - PetCard    │      │
│  │ - Home       │  │ - AuthContext│  │ - MealCard   │      │
│  │ - Calculator │  │              │  │ - StatCard   │      │
│  │ - Nutrition  │  └──────────────┘  └──────────────┘      │
│  │ - Diet       │                                            │
│  │ - Profile    │  ┌──────────────┐  ┌──────────────┐      │
│  └──────────────┘  │   Services   │  │    Utils     │      │
│                    │              │  │              │      │
│                    │ - api.js     │  │ - nutrition  │      │
│                    │              │  │   Calculator │      │
│                    └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Node.js/Express Backend                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Routes     │  │  Middleware  │  │   Models     │      │
│  │              │  │              │  │              │      │
│  │ - /api/users │  │ - auth       │  │ - User       │      │
│  │ - /api/pets  │  │ - cors       │  │ - Pet        │      │
│  │ - /api/meals │  │ - validation │  │ - Meal       │      │
│  │ - /api/      │  │ - error      │  │ - Nutrition  │      │
│  │   nutrition  │  │   handler    │  │   Plan       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Mongoose ODM
                              │
┌─────────────────────────────────────────────────────────────┐
│                        MongoDB Database                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    users     │  │     pets     │  │    meals     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐                                            │
│  │  nutrition   │                                            │
│  │    plans     │                                            │
│  └──────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React Native (Expo framework)
- React Navigation (Stack + Bottom Tabs)
- React Context API for state management
- Expo Vector Icons (Ionicons)
- Axios for HTTP requests

**Backend:**
- Node.js runtime
- Express.js web framework
- MongoDB database
- Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- CORS middleware

### Navigation Structure

```
Stack Navigator (Root)
├── Onboarding Screen (Initial)
└── Main Tabs (After onboarding)
    ├── Home Tab
    ├── Diet Tab
    ├── Calculator Tab
    └── Profile Tab
    
Modal Screens (Stack)
└── Nutrition Screen (AI Recommendations)
```

## Components and Interfaces

### Frontend Components

#### Screen Components

**OnboardingScreen**
- Purpose: First-time user pet profile creation
- Props: `{ navigation }`
- State: `name, animalType, breed, age, weight`
- Key Functions:
  - `handleContinue()`: Validates input and creates pet profile
  - Updates PetContext with new pet data
  - Navigates to Main tabs on completion

**HomeScreen**
- Purpose: Dashboard showing pet overview and feeding schedule
- Props: `{ navigation }`
- Context: Uses `usePet()` hook
- Displays:
  - Pet profile card with avatar, name, breed, age, weight
  - Health & allergies section
  - Environmental context (climate, activity level)
  - Feeding schedule with meal times

**CalculatorScreen**
- Purpose: Interactive portion size calculator
- Props: None
- State: `weight` (user input)
- Calculations:
  - Portion size: `weight × 25` grams/day
  - Daily calories: `(weight × 30 + 70) × activityMultiplier`
  - Hydration: `weight × 50` ml/day
- Features:
  - Real-time calculation updates
  - Visual slider for weight input
  - Save to pet profile functionality

**NutritionScreen**
- Purpose: AI-generated meal recommendations
- Props: `{ navigation }`
- Context: Uses `usePet()` hook
- Displays:
  - Pet nutrition plan header
  - 2+ meal recommendation cards
  - Meal details (name, type, description, ingredients)
  - Select meal and favorite actions
  - Professional resources section

**DietScreen**
- Purpose: Nutrition plan management and meal history
- Props: None
- Features:
  - Tab navigation (Saved Plans / Diet History)
  - Active nutrition plan display with progress bar
  - Recommended plans section
  - Recent meal history with completion status
  - Calorie tracking

**ProfileScreen**
- Purpose: Detailed pet profile management
- Props: `{ navigation }`
- Context: Uses `usePet()` hook
- Sections:
  - Pet profile card with edit functionality
  - Health & allergies management
  - Environmental context configuration
  - Feeding schedule overview

#### Context Providers

**PetContext**
- State:
  - `pet`: Current active pet profile object
  - `meals`: Array of meal events
- Methods:
  - `updatePet(petData)`: Updates active pet profile
  - `addMeal(meal)`: Adds meal event with timestamp
- Usage: Provides global access to pet data across screens

**AuthContext** (To be implemented)
- State:
  - `user`: Current authenticated user
  - `token`: JWT authentication token
  - `isAuthenticated`: Boolean auth status
- Methods:
  - `login(email, password)`: Authenticates user
  - `register(email, password, name)`: Creates new account
  - `logout()`: Clears auth state
  - `refreshToken()`: Renews JWT token

#### Utility Functions

**nutritionCalculator.js**
- `calculateDailyCalories(weight, age, activityLevel)`: Returns kcal/day
  - Formula: `(weight × 30 + 70) × activityMultiplier`
  - Activity multipliers: low=1.2, moderate=1.4, high=1.6
  - Returns: Rounded integer

- `calculatePortionSize(weight)`: Returns grams/day
  - Formula: `weight × 25`
  - Returns: Rounded integer

- `calculateHydration(weight)`: Returns ml/day
  - Formula: `weight × 50`
  - Returns: Rounded integer

- `getMealRecommendations(pet)`: Returns array of meal objects
  - Filters based on allergies
  - Considers health conditions
  - Accounts for environmental context
  - Returns: Array of meal recommendation objects

#### Service Layer

**api.js**
- Base configuration: Axios instance with base URL
- Interceptors: Adds JWT token to requests
- Error handling: Standardized error responses
- Endpoints:
  - Authentication: `POST /api/users/register`, `POST /api/users/login`
  - Pets: `GET/POST/PUT /api/pets`, `GET /api/pets/user/:userId`
  - Meals: `GET/POST/PUT /api/meals`, `GET /api/meals/pet/:petId`
  - Nutrition: `POST /api/nutrition/generate`, `GET /api/nutrition/pet/:petId`

### Backend Components

#### Route Handlers

**users.js**
- `POST /api/users/register`
  - Input: `{ email, password, name }`
  - Process: Hash password, create user, generate JWT
  - Output: `{ user: { id, email, name }, token }`
  - Performance: < 2 seconds

- `POST /api/users/login`
  - Input: `{ email, password }`
  - Process: Validate credentials, generate JWT
  - Output: `{ user: { id, email, name }, token }`
  - Performance: < 2 seconds

**pets.js**
- `POST /api/pets`
  - Input: Pet profile object
  - Validation: Required fields (name, animalType, age, weight)
  - Output: Created pet document
  - Performance: < 1 second

- `GET /api/pets/:id`
  - Input: Pet ID parameter
  - Output: Pet document or 404 error
  - Performance: < 1 second

- `PUT /api/pets/:id`
  - Input: Pet ID + update fields
  - Process: Update document, set updatedAt timestamp
  - Output: Updated pet document
  - Performance: < 1 second

- `GET /api/pets/user/:userId`
  - Input: User ID parameter
  - Output: Array of pet documents
  - Performance: < 1 second

**meals.js**
- `POST /api/meals`
  - Input: Meal event object
  - Process: Create meal with timestamp
  - Output: Created meal document
  - Performance: < 1 second

- `GET /api/meals/pet/:petId`
  - Input: Pet ID parameter
  - Output: Array of meals sorted by timestamp (descending)
  - Performance: < 1 second

- `PUT /api/meals/:id`
  - Input: Meal ID + update fields
  - Output: Updated meal document
  - Performance: < 500 milliseconds

- `GET /api/meals/pet/:petId/stats`
  - Input: Pet ID parameter
  - Process: Calculate daily totals for completed meals
  - Output: `{ totalCalories, mealsCompleted }`
  - Performance: < 1 second

**nutrition.js**
- `POST /api/nutrition/generate`
  - Input: `{ petId }`
  - Process:
    1. Fetch pet profile
    2. Calculate daily caloric needs
    3. Generate 2+ meal recommendations
    4. Filter based on allergies
    5. Create nutrition plan document
  - Output: Nutrition plan with meals array
  - Performance: < 3 seconds

- `GET /api/nutrition/pet/:petId`
  - Input: Pet ID parameter
  - Output: Array of nutrition plans sorted by creation date
  - Performance: < 1 second

## Data Models

### User Schema

```javascript
{
  _id: ObjectId,
  email: String (required, unique),
  password: String (required, hashed),
  name: String,
  subscriptionType: String (enum: ['free', 'monthly', 'yearly'], default: 'free'),
  subscriptionExpiry: Date,
  createdAt: Date (default: Date.now)
}
```

**Indexes:**
- `email`: Unique index for fast lookup and authentication

**Validation:**
- Email: Must be valid email format
- Password: Minimum 8 characters, at least one letter and one number

### Pet Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  name: String (required),
  animalType: String (enum: ['dog', 'cat', 'bird', 'fish'], required),
  breed: String,
  age: Number (required, positive),
  weight: Number (required, positive),
  photoUrl: String,
  allergies: [String],
  healthConditions: [String],
  activityLevel: String (enum: ['low', 'moderate', 'high'], default: 'moderate'),
  climate: String (default: 'temperate'),
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

**Indexes:**
- `userId`: Index for querying user's pets
- Compound index: `(userId, createdAt)` for sorted pet lists

**Validation:**
- Age: Must be positive number
- Weight: Must be greater than zero
- AnimalType: Must be one of supported types

### Meal Schema

```javascript
{
  _id: ObjectId,
  petId: ObjectId (ref: 'Pet', required),
  name: String (required),
  type: String (required),
  description: String,
  ingredients: [String],
  portionSize: Number (required, grams),
  calories: Number (required, kcal),
  timestamp: Date (default: Date.now),
  mealTime: String (enum: ['breakfast', 'lunch', 'dinner', 'snack']),
  completed: Boolean (default: false)
}
```

**Indexes:**
- `petId`: Index for querying pet's meals
- Compound index: `(petId, timestamp)` for sorted meal history
- Compound index: `(petId, completed, timestamp)` for stats queries

**Validation:**
- PortionSize: Must be positive number
- Calories: Must be positive number

### NutritionPlan Schema

```javascript
{
  _id: ObjectId,
  petId: ObjectId (ref: 'Pet', required),
  name: String (required),
  description: String,
  duration: Number (days),
  startDate: Date (default: Date.now),
  status: String (enum: ['active', 'completed', 'paused'], default: 'active'),
  meals: [{
    name: String,
    type: String,
    ingredients: [String],
    portionSize: Number,
    calories: Number
  }],
  goals: [String],
  createdAt: Date (default: Date.now)
}
```

**Indexes:**
- `petId`: Index for querying pet's nutrition plans
- Compound index: `(petId, status, createdAt)` for filtered plan lists

**Validation:**
- Duration: Must be positive number if provided
- Status: Must be one of allowed values

## API Endpoints and Contracts

### Authentication Endpoints

**POST /api/users/register**
```
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}

Response (201):
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Error (400):
{
  "error": "Email already exists"
}
```

**POST /api/users/login**
```
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Error (401):
{
  "error": "Invalid credentials"
}
```

### Pet Management Endpoints

**POST /api/pets**
```
Request:
{
  "userId": "507f1f77bcf86cd799439011",
  "name": "Cooper",
  "animalType": "dog",
  "breed": "Golden Retriever",
  "age": 3,
  "weight": 25,
  "activityLevel": "moderate",
  "allergies": ["grain"],
  "healthConditions": ["sensitive skin"]
}

Response (201):
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "name": "Cooper",
  "animalType": "dog",
  "breed": "Golden Retriever",
  "age": 3,
  "weight": 25,
  "activityLevel": "moderate",
  "climate": "temperate",
  "allergies": ["grain"],
  "healthConditions": ["sensitive skin"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}

Error (400):
{
  "error": "Validation failed: age must be positive"
}
```

**GET /api/pets/:id**
```
Response (200):
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "name": "Cooper",
  "animalType": "dog",
  "breed": "Golden Retriever",
  "age": 3,
  "weight": 25,
  "activityLevel": "moderate",
  "climate": "temperate",
  "allergies": ["grain"],
  "healthConditions": ["sensitive skin"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}

Error (404):
{
  "error": "Pet not found"
}
```

**PUT /api/pets/:id**
```
Request:
{
  "weight": 26,
  "activityLevel": "high"
}

Response (200):
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",
  "name": "Cooper",
  "animalType": "dog",
  "breed": "Golden Retriever",
  "age": 3,
  "weight": 26,
  "activityLevel": "high",
  "climate": "temperate",
  "allergies": ["grain"],
  "healthConditions": ["sensitive skin"],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T12:45:00.000Z"
}
```

**GET /api/pets/user/:userId**
```
Response (200):
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "name": "Cooper",
    "animalType": "dog",
    "breed": "Golden Retriever",
    "age": 3,
    "weight": 25
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "name": "Whiskers",
    "animalType": "cat",
    "breed": "Siamese",
    "age": 2,
    "weight": 4
  }
]
```

### Meal Tracking Endpoints

**POST /api/meals**
```
Request:
{
  "petId": "507f1f77bcf86cd799439012",
  "name": "Salmon & Sweet Potato Mix",
  "type": "PROTEIN RICH",
  "description": "Optimal for muscle maintenance",
  "ingredients": ["Fresh Salmon", "Sweet Potato", "Green Peas"],
  "portionSize": 312,
  "calories": 450,
  "mealTime": "breakfast"
}

Response (201):
{
  "_id": "507f1f77bcf86cd799439014",
  "petId": "507f1f77bcf86cd799439012",
  "name": "Salmon & Sweet Potato Mix",
  "type": "PROTEIN RICH",
  "description": "Optimal for muscle maintenance",
  "ingredients": ["Fresh Salmon", "Sweet Potato", "Green Peas"],
  "portionSize": 312,
  "calories": 450,
  "mealTime": "breakfast",
  "completed": false,
  "timestamp": "2024-01-15T08:00:00.000Z"
}
```

**GET /api/meals/pet/:petId**
```
Response (200):
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "petId": "507f1f77bcf86cd799439012",
    "name": "Salmon & Sweet Potato Mix",
    "type": "PROTEIN RICH",
    "portionSize": 312,
    "calories": 450,
    "mealTime": "breakfast",
    "completed": true,
    "timestamp": "2024-01-15T08:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439015",
    "petId": "507f1f77bcf86cd799439012",
    "name": "Lean Chicken & Brown Rice",
    "type": "DIGESTION AID",
    "portionSize": 312,
    "calories": 420,
    "mealTime": "dinner",
    "completed": false,
    "timestamp": "2024-01-14T18:00:00.000Z"
  }
]
```

**PUT /api/meals/:id**
```
Request:
{
  "completed": true
}

Response (200):
{
  "_id": "507f1f77bcf86cd799439014",
  "petId": "507f1f77bcf86cd799439012",
  "name": "Salmon & Sweet Potato Mix",
  "completed": true,
  "timestamp": "2024-01-15T08:00:00.000Z"
}
```

**GET /api/meals/pet/:petId/stats**
```
Response (200):
{
  "totalCalories": 870,
  "mealsCompleted": 2
}
```

### Nutrition Plan Endpoints

**POST /api/nutrition/generate**
```
Request:
{
  "petId": "507f1f77bcf86cd799439012"
}

Response (200):
{
  "_id": "507f1f77bcf86cd799439016",
  "petId": "507f1f77bcf86cd799439012",
  "name": "Cooper's Nutrition Plan",
  "description": "Personalized plan for Golden Retriever",
  "duration": 28,
  "startDate": "2024-01-15T10:00:00.000Z",
  "status": "active",
  "meals": [
    {
      "name": "Salmon & Sweet Potato Mix",
      "type": "PROTEIN RICH",
      "ingredients": ["Fresh Salmon", "Sweet Potato", "Green Peas", "Organic Carrots"],
      "portionSize": 312,
      "calories": 450
    },
    {
      "name": "Lean Chicken & Brown Rice",
      "type": "DIGESTION AID",
      "ingredients": ["Chicken Breast", "Brown Rice", "Steamed Broccoli", "Blueberries"],
      "portionSize": 312,
      "calories": 420
    }
  ],
  "goals": ["Maintain healthy weight", "Improve coat shine", "Boost energy"],
  "createdAt": "2024-01-15T10:00:00.000Z"
}

Error (404):
{
  "error": "Pet not found"
}
```

**GET /api/nutrition/pet/:petId**
```
Response (200):
[
  {
    "_id": "507f1f77bcf86cd799439016",
    "petId": "507f1f77bcf86cd799439012",
    "name": "Cooper's Nutrition Plan",
    "description": "Personalized plan for Golden Retriever",
    "duration": 28,
    "status": "active",
    "meals": [...],
    "goals": ["Maintain healthy weight", "Improve coat shine"],
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
]
```

## Algorithm Specifications

### Nutrition Calculation Algorithms

**Daily Caloric Requirement Algorithm**
```
Input: weight (kg), activityLevel (string)
Output: dailyCalories (kcal)

Algorithm:
1. Calculate base calories: baseCalories = (weight × 30) + 70
2. Determine activity multiplier:
   - If activityLevel = 'low': multiplier = 1.2
   - If activityLevel = 'moderate': multiplier = 1.4
   - If activityLevel = 'high': multiplier = 1.6
   - Default: multiplier = 1.4
3. Calculate daily calories: dailyCalories = baseCalories × multiplier
4. Round to nearest whole number
5. Return dailyCalories

Time Complexity: O(1)
Performance Target: < 100 milliseconds
```

**Portion Size Calculation Algorithm**
```
Input: weight (kg)
Output: portionSize (grams/day)

Algorithm:
1. Calculate portion: portionSize = weight × 25
2. Round to nearest whole number
3. Return portionSize

Time Complexity: O(1)
Performance Target: < 100 milliseconds
```

**Hydration Requirement Algorithm**
```
Input: weight (kg)
Output: hydration (ml/day)

Algorithm:
1. Calculate hydration: hydration = weight × 50
2. Round to nearest whole number
3. Return hydration

Time Complexity: O(1)
Performance Target: < 100 milliseconds
```

**Meal Recommendation Filtering Algorithm**
```
Input: pet (object with allergies, healthConditions, activityLevel, climate)
Output: filteredMeals (array of meal objects)

Algorithm:
1. Initialize mealDatabase with all available meals
2. For each meal in mealDatabase:
   a. Check if any meal ingredient matches pet allergies
   b. If match found, skip this meal
   c. Otherwise, add meal to candidateMeals
3. For each meal in candidateMeals:
   a. Calculate meal score based on:
      - Health condition compatibility (+10 points)
      - Activity level match (+5 points)
      - Climate appropriateness (+5 points)
   b. Store meal with score
4. Sort candidateMeals by score (descending)
5. Return top 2-5 meals from sorted list

Time Complexity: O(n × m) where n = meals, m = allergies
Performance Target: < 3 seconds
```

**Nutrition Plan Progress Calculation**
```
Input: startDate (Date), duration (days)
Output: progressPercentage (number)

Algorithm:
1. Get current date: now = Date.now()
2. Calculate elapsed time: elapsed = now - startDate
3. Convert to days: elapsedDays = elapsed / (1000 × 60 × 60 × 24)
4. Calculate progress: progress = (elapsedDays / duration) × 100
5. Clamp progress between 0 and 100
6. Round to nearest whole number
7. Return progress

Time Complexity: O(1)
Performance Target: < 100 milliseconds
```

### State Management Patterns

**PetContext State Updates**
```
Pattern: Optimistic UI Updates with Server Sync

Flow:
1. User triggers action (e.g., update pet weight)
2. Immediately update local context state
3. Render UI with new state (optimistic update)
4. Send API request to backend
5. On success: Keep optimistic state
6. On failure: Revert to previous state, show error
7. Update timestamp fields

Benefits:
- Instant UI feedback
- Perceived performance improvement
- Graceful error handling
```

**Meal Tracking State Pattern**
```
Pattern: Event Sourcing with Local Cache

Flow:
1. User logs meal event
2. Add meal to local meals array with timestamp
3. Persist to backend asynchronously
4. On app restart, fetch latest meals from server
5. Merge local pending meals with server meals
6. Deduplicate based on timestamp and meal ID

Benefits:
- Offline capability
- Data consistency
- No data loss on network failure
```


## Security Considerations

### Authentication Security

**Password Security**
- Passwords hashed using bcryptjs with salt rounds = 10
- Minimum password requirements: 8 characters, 1 letter, 1 number
- Passwords never stored in plaintext
- Password validation on both client and server
- Failed login attempts logged for security monitoring

**JWT Token Management**
- Tokens signed with HS256 algorithm
- Secret key stored in environment variables (never in code)
- Token expiration: 30 days
- Token payload: `{ userId, iat, exp }`
- Tokens transmitted via Authorization header: `Bearer <token>`
- No sensitive data stored in token payload

**Token Refresh Strategy**
```
Flow:
1. Client stores token in secure storage (AsyncStorage)
2. On app launch, check token expiration
3. If expired, redirect to login
4. If valid, attach to all API requests
5. Backend middleware validates token on protected routes
6. On 401 response, clear token and redirect to login
```

### API Security

**CORS Configuration**
- Whitelist specific origins in production
- Allow credentials for cookie-based sessions
- Restrict allowed methods to: GET, POST, PUT, DELETE
- Limit allowed headers to necessary ones

**Input Validation**
- Server-side validation for all inputs
- Mongoose schema validation for data types
- Custom validators for business rules
- Sanitize user inputs to prevent injection attacks
- Validate ObjectId format before database queries

**Rate Limiting** (To be implemented)
- Limit authentication endpoints: 5 requests per 15 minutes per IP
- Limit API endpoints: 100 requests per 15 minutes per user
- Return 429 status code when limit exceeded
- Use sliding window algorithm for fairness

**SQL/NoSQL Injection Prevention**
- Use Mongoose parameterized queries
- Never concatenate user input into queries
- Validate and sanitize all query parameters
- Use strict schema validation

### Data Privacy

**User Data Protection**
- User passwords hashed and salted
- Email addresses stored securely
- Pet photos stored with access control
- No sharing of user data with third parties
- GDPR compliance for data deletion requests

**Data Access Control**
- Users can only access their own pets
- Pet data filtered by userId in all queries
- Middleware validates user ownership before updates
- No cross-user data leakage

**Secure Communication**
- HTTPS required for all API communication
- TLS 1.2+ for transport encryption
- Certificate pinning in production mobile app
- No sensitive data in URL parameters

### Environment Variables

**Required Environment Variables**
```
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/boompets
JWT_SECRET=<random-256-bit-secret>
PORT=3000
NODE_ENV=production

# Frontend (app.json)
API_BASE_URL=https://api.boompets.com
```

**Security Best Practices**
- Never commit .env files to version control
- Use different secrets for dev/staging/production
- Rotate JWT secrets periodically
- Use strong random secrets (256+ bits)

## Error Handling

### Frontend Error Handling

**API Error Handling Pattern**
```javascript
try {
  const response = await api.post('/api/pets', petData);
  // Success handling
  updatePet(response.data);
  navigation.navigate('Home');
} catch (error) {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    if (status === 400) {
      // Validation error
      Alert.alert('Invalid Input', data.error);
    } else if (status === 401) {
      // Authentication error
      Alert.alert('Session Expired', 'Please log in again');
      logout();
    } else if (status === 404) {
      // Resource not found
      Alert.alert('Not Found', data.error);
    } else if (status === 500) {
      // Server error
      Alert.alert('Server Error', 'Please try again later');
    }
  } else if (error.request) {
    // Network error (no response received)
    Alert.alert('Network Error', 'Please check your connection');
  } else {
    // Client-side error
    Alert.alert('Error', 'Something went wrong');
  }
}
```

**Validation Error Display**
- Show inline validation errors below input fields
- Highlight invalid fields with red border
- Display error messages in user-friendly language
- Clear errors when user corrects input
- Prevent form submission until all errors resolved

**Loading States**
- Display loading spinner during API requests
- Disable buttons during submission to prevent double-clicks
- Show skeleton screens for data loading
- Timeout after 10 seconds with error message

**Offline Handling**
- Detect network connectivity status
- Queue actions when offline
- Sync queued actions when connection restored
- Show offline indicator in UI
- Cache critical data for offline viewing

### Backend Error Handling

**Error Response Format**
```javascript
// Standard error response
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {} // Optional additional context
}
```

**Error Handling Middleware**
```javascript
app.use((err, req, res, next) => {
  // Log error for debugging
  console.error(err.stack);
  
  // Determine error type and status code
  let statusCode = 500;
  let message = 'Internal server error';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Invalid or expired token';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }
  
  // Send error response
  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR'
  });
});
```

**Validation Error Handling**
```javascript
// Mongoose validation errors
router.post('/api/pets', async (req, res) => {
  try {
    const pet = new Pet(req.body);
    await pet.save();
    res.status(201).json(pet);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }
    throw error; // Pass to error middleware
  }
});
```

**Database Error Handling**
- Catch MongoDB connection errors
- Retry failed queries with exponential backoff
- Log database errors for monitoring
- Return generic error messages to client (don't expose DB details)
- Handle duplicate key errors gracefully

**Async Error Handling**
- Wrap async route handlers with try-catch
- Use express-async-errors for automatic error catching
- Ensure all promises have error handlers
- Prevent unhandled promise rejections

### Error Logging and Monitoring

**Logging Strategy**
- Log all errors with timestamp, user ID, endpoint, and stack trace
- Use structured logging (JSON format)
- Different log levels: ERROR, WARN, INFO, DEBUG
- Rotate log files daily
- Store logs for 30 days

**Monitoring** (To be implemented)
- Track error rates by endpoint
- Alert on error rate spikes
- Monitor API response times
- Track failed authentication attempts
- Dashboard for real-time error monitoring

## Testing Strategy

### Testing Approach

The BoomPets application requires a dual testing approach combining unit tests for specific scenarios and property-based tests for comprehensive validation of universal properties. This strategy ensures both concrete bug detection and general correctness verification.

**Unit Testing:**
- Specific examples demonstrating correct behavior
- Edge cases and boundary conditions
- Error handling scenarios
- Integration points between components
- UI component rendering

**Property-Based Testing:**
- Universal properties that hold for all inputs
- Comprehensive input coverage through randomization
- Validation of calculation formulas
- State management invariants
- API contract compliance

### Testing Tools and Frameworks

**Frontend Testing:**
- Jest: Test runner and assertion library
- React Native Testing Library: Component testing
- fast-check: Property-based testing library
- Mock Service Worker: API mocking

**Backend Testing:**
- Jest: Test runner and assertion library
- Supertest: HTTP assertion library
- fast-check: Property-based testing library
- mongodb-memory-server: In-memory MongoDB for tests

**Test Configuration:**
- Minimum 100 iterations per property-based test
- Each property test tagged with design document reference
- Tag format: `Feature: boompets-nutrition-app, Property {number}: {property_text}`
- Code coverage target: 80% for critical paths

### Frontend Testing

**Component Unit Tests**
```javascript
// Example: OnboardingScreen validation
describe('OnboardingScreen', () => {
  it('should display validation error for empty name', () => {
    const { getByText, getByPlaceholderText } = render(<OnboardingScreen />);
    const continueButton = getByText('Continue');
    
    fireEvent.press(continueButton);
    
    expect(getByText('Pet name is required')).toBeTruthy();
  });
  
  it('should display validation error for negative age', () => {
    const { getByText, getByPlaceholderText } = render(<OnboardingScreen />);
    const ageInput = getByPlaceholderText('3');
    
    fireEvent.changeText(ageInput, '-1');
    fireEvent.press(getByText('Continue'));
    
    expect(getByText('Age must be positive')).toBeTruthy();
  });
});
```

**Navigation Tests**
```javascript
describe('Navigation', () => {
  it('should navigate to Main tabs after onboarding', () => {
    const { getByText } = render(<App />);
    
    // Fill onboarding form
    fillOnboardingForm();
    fireEvent.press(getByText('Continue'));
    
    // Verify navigation to Home tab
    expect(getByText('MealMaster')).toBeTruthy();
  });
});
```

**Context Tests**
```javascript
describe('PetContext', () => {
  it('should update pet data when updatePet is called', () => {
    const { result } = renderHook(() => usePet(), {
      wrapper: PetProvider
    });
    
    const petData = { name: 'Cooper', age: 3, weight: 25 };
    act(() => {
      result.current.updatePet(petData);
    });
    
    expect(result.current.pet).toEqual(petData);
  });
  
  it('should add meal with timestamp', () => {
    const { result } = renderHook(() => usePet(), {
      wrapper: PetProvider
    });
    
    const meal = { name: 'Breakfast', calories: 450 };
    act(() => {
      result.current.addMeal(meal);
    });
    
    expect(result.current.meals).toHaveLength(1);
    expect(result.current.meals[0].timestamp).toBeInstanceOf(Date);
  });
});
```

### Backend Testing

**API Endpoint Tests**
```javascript
describe('POST /api/pets', () => {
  it('should create pet with valid data', async () => {
    const petData = {
      userId: testUserId,
      name: 'Cooper',
      animalType: 'dog',
      age: 3,
      weight: 25
    };
    
    const response = await request(app)
      .post('/api/pets')
      .send(petData)
      .expect(201);
    
    expect(response.body.name).toBe('Cooper');
    expect(response.body.activityLevel).toBe('moderate'); // default
  });
  
  it('should return 400 for negative age', async () => {
    const petData = {
      userId: testUserId,
      name: 'Cooper',
      animalType: 'dog',
      age: -1,
      weight: 25
    };
    
    const response = await request(app)
      .post('/api/pets')
      .send(petData)
      .expect(400);
    
    expect(response.body.error).toContain('positive');
  });
});
```

**Authentication Tests**
```javascript
describe('Authentication', () => {
  it('should register user and return JWT token', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'SecurePass123',
      name: 'Test User'
    };
    
    const response = await request(app)
      .post('/api/users/register')
      .send(userData)
      .expect(201);
    
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(userData.email);
  });
  
  it('should reject weak passwords', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'weak',
      name: 'Test User'
    };
    
    const response = await request(app)
      .post('/api/users/register')
      .send(userData)
      .expect(400);
    
    expect(response.body.error).toContain('password');
  });
});
```

**Database Model Tests**
```javascript
describe('Pet Model', () => {
  it('should save pet with default values', async () => {
    const pet = new Pet({
      userId: testUserId,
      name: 'Cooper',
      animalType: 'dog',
      age: 3,
      weight: 25
    });
    
    const savedPet = await pet.save();
    
    expect(savedPet.activityLevel).toBe('moderate');
    expect(savedPet.climate).toBe('temperate');
    expect(savedPet.createdAt).toBeInstanceOf(Date);
  });
  
  it('should validate animal type enum', async () => {
    const pet = new Pet({
      userId: testUserId,
      name: 'Cooper',
      animalType: 'dragon', // invalid
      age: 3,
      weight: 25
    });
    
    await expect(pet.save()).rejects.toThrow();
  });
});
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several redundant properties that can be consolidated:

**Redundancies Identified:**
- Properties 3.5, 3.6, 3.7 (rounding for calories, portions, hydration) can be combined into a single property about nutrition calculation rounding
- Property 5.3 and 8.5 are duplicates (allergy filtering in meal recommendations)
- Property 6.5 and 12.2 are duplicates (plan progress calculation)
- Property 7.3 and 14.5 are duplicates (meal timestamp setting)
- Properties about data persistence (14.1, 14.4, 14.6) can be combined into a single property about timestamp management

**Consolidation Strategy:**
- Combine calculation rounding into one comprehensive property
- Remove duplicate allergy filtering property
- Remove duplicate progress calculation property
- Remove duplicate timestamp property
- Combine timestamp management properties into one comprehensive property

### Property 1: User Registration Creates Account with Token

*For any* valid registration credentials (email, password with 8+ characters including letter and number, name), when a user registers, the system should create a user account and return a JWT token.

**Validates: Requirements 1.1**

### Property 2: Valid Login Returns Token

*For any* registered user with valid credentials, when the user logs in, the system should authenticate and return a JWT token.

**Validates: Requirements 1.2**

### Property 3: Invalid Credentials Return Error

*For any* invalid login credentials (wrong email or wrong password), when a user attempts to login, the system should return a descriptive error message.

**Validates: Requirements 1.3**

### Property 4: Password Validation Enforces Requirements

*For any* password that violates the requirements (less than 8 characters, or missing letters, or missing numbers), when a user attempts to register, the system should reject the password with an error message.

**Validates: Requirements 1.4**

### Property 5: Pet Profile Creation Succeeds with Valid Data

*For any* valid pet data (name, animal type from [dog, cat, bird, fish], positive age, positive weight), when a pet owner creates a profile, the system should create the pet profile successfully.

**Validates: Requirements 2.1**

### Property 6: Pet Profile Updates Persist with Timestamp

*For any* pet profile and any valid update data, when a pet owner updates the profile, the system should persist the changes and update the updatedAt timestamp to the current time.

**Validates: Requirements 2.3, 14.4**

### Property 7: Multiple Pets Per User

*For any* user account, the system should allow creating and storing multiple pet profiles, each associated with that user.

**Validates: Requirements 2.4, 10.1**

### Property 8: Default Values Set on Pet Creation

*For any* new pet profile created without specifying activity level or climate, the system should initialize activityLevel to 'moderate' and climate to 'temperate'.

**Validates: Requirements 2.5**

### Property 9: Pet Age and Weight Validation

*For any* pet profile creation or update with age ≤ 0 or weight ≤ 0, the system should reject the operation with a validation error.

**Validates: Requirements 2.6, 15.2**

### Property 10: Health Data Storage

*For any* pet profile, when health conditions or allergies are added, the system should store them as a list associated with that pet profile.

**Validates: Requirements 2.7, 8.1, 8.2, 8.3**

### Property 11: Daily Calorie Calculation Formula

*For any* pet weight (kg) and activity level (low/moderate/high), the system should calculate daily calories as: Math.round((weight × 30 + 70) × activityMultiplier) where activityMultiplier is 1.2 for low, 1.4 for moderate, and 1.6 for high.

**Validates: Requirements 3.1, 3.2, 9.3**

### Property 12: Portion Size Calculation Formula

*For any* pet weight (kg), the system should calculate daily portion size as: Math.round(weight × 25) grams.

**Validates: Requirements 3.3**

### Property 13: Hydration Calculation Formula

*For any* pet weight (kg), the system should calculate daily hydration as: Math.round(weight × 50) milliliters.

**Validates: Requirements 3.4**

### Property 14: Nutrition Calculations Return Whole Numbers

*For any* nutrition calculation (calories, portion size, hydration), the system should return values rounded to the nearest whole number.

**Validates: Requirements 3.5, 3.6, 3.7**

### Property 15: Portion Division for Multiple Meals

*For any* daily portion size, when displaying for twice-daily feeding, the system should show the portion divided by 2.

**Validates: Requirements 4.2**

### Property 16: Decimal Weight Input Accepted

*For any* weight value with decimal precision (e.g., 12.5 kg), the system should accept and process the input correctly.

**Validates: Requirements 4.4**

### Property 17: Calculated Values Persist to Profile

*For any* calculated nutrition values (portion size, calories, hydration), when a pet owner saves them, the system should update the pet profile with these values.

**Validates: Requirements 4.5**

### Property 18: Meal Recommendations Generated

*For any* pet profile, when requesting meal recommendations, the system should generate at least 2 meal recommendations.

**Validates: Requirements 5.1**

### Property 19: Meal Recommendation Structure

*For any* generated meal recommendation, the meal should include name, type classification, description, and ingredient list.

**Validates: Requirements 5.2**

### Property 20: Allergy Filtering in Recommendations

*For any* pet with allergies listed, when generating meal recommendations, the system should exclude any meal containing ingredients that match the allergy list.

**Validates: Requirements 5.3, 8.5**

### Property 21: Health Condition Meal Prioritization

*For any* pet with health conditions listed, when generating meal recommendations, the system should include meal types appropriate for those conditions in the results.

**Validates: Requirements 5.4**

### Property 22: Selected Meal Added to Plan

*For any* meal recommendation, when a pet owner selects it, the system should add the meal to the pet's active nutrition plan.

**Validates: Requirements 5.6**

### Property 23: Nutrition Plan Creation with Status and Timestamp

*For any* nutrition plan with name and meals, when a pet owner creates it, the system should store the plan with status 'active' and createdAt set to the current timestamp.

**Validates: Requirements 6.1, 14.6**

### Property 24: Nutrition Plan Pet Association

*For any* nutrition plan, the system should associate it with a specific pet profile via petId.

**Validates: Requirements 6.2**

### Property 25: Meal Data Storage in Plans

*For any* meal added to a nutrition plan, the system should store meal name, type, ingredients, portionSize, and calories.

**Validates: Requirements 6.3**

### Property 26: Plan Progress Calculation

*For any* nutrition plan with startDate and duration (days), the system should calculate progress as: Math.round((elapsedDays / duration) × 100) clamped between 0 and 100.

**Validates: Requirements 6.5, 12.2**

### Property 27: Goals Stored as List

*For any* nutrition plan, when goals are defined, the system should store them as a list of text descriptions.

**Validates: Requirements 6.6**

### Property 28: Plans Ordered by Creation Date

*For any* set of nutrition plans for a pet, when viewing saved plans, the system should display them ordered by createdAt with most recent first.

**Validates: Requirements 6.7**

### Property 29: Meal Event Creation with Required Fields

*For any* meal log, when a pet owner logs it, the system should create a meal event with timestamp (current time), portionSize, calories, and completed status (default false).

**Validates: Requirements 7.1, 7.3**

### Property 30: Meal Completion Status Update

*For any* meal event, when a pet owner marks it as completed, the system should update the completed field to true.

**Validates: Requirements 7.4**

### Property 31: Meals Ordered by Timestamp

*For any* set of meal events for a pet, when viewing meal history, the system should display them ordered by timestamp with most recent first.

**Validates: Requirements 7.5**

### Property 32: Meal Pet Association

*For any* meal event, the system should associate it with a specific pet profile via petId.

**Validates: Requirements 7.6**

### Property 33: Daily Calorie Sum Calculation

*For any* set of completed meal events for a pet on the current day, the system should calculate total daily caloric intake as the sum of all calories from those meals.

**Validates: Requirements 7.7**

### Property 34: Allergy and Health Condition Removal

*For any* pet profile with allergies or health conditions, when a pet owner removes an item, the system should delete it from the respective list.

**Validates: Requirements 8.4**

### Property 35: Health Data Display in Profile

*For any* pet profile with allergies and health conditions, when viewing the profile, the system should display all allergies and health conditions.

**Validates: Requirements 8.6, 9.4**

### Property 36: Climate Storage

*For any* climate value (text string), when a pet owner sets it, the system should store it in the pet profile.

**Validates: Requirements 9.2**

### Property 37: Environmental Context Updates Affect Recommendations

*For any* pet profile, when environmental context (climate or activity level) is updated, subsequent meal recommendations should reflect the new values.

**Validates: Requirements 9.5**

### Property 38: Pet Profile Switching Loads Correct Data

*For any* user with multiple pets, when switching to a different pet profile, the system should load that pet's data (profile, meals, plans).

**Validates: Requirements 10.2**

### Property 39: Pet Data Isolation

*For any* set of pets belonging to a user, the system should maintain separate meal history, nutrition plans, and calculations for each pet with no cross-contamination.

**Validates: Requirements 10.3**

### Property 40: Pet List Display Fields

*For any* list of pets, when displaying them, the system should show pet name, animalType, breed, and age for each profile.

**Validates: Requirements 10.4**

### Property 41: Pet Deletion Protection

*For any* pet profile with associated meal history or active nutrition plans, when attempting deletion, the system should require user confirmation before proceeding.

**Validates: Requirements 10.5**

### Property 42: Feeding Schedule Storage

*For any* feeding schedule entry with meal time and portion size, when a pet owner creates it, the system should store both values.

**Validates: Requirements 11.1**

### Property 43: Multiple Schedule Entries Per Pet

*For any* pet profile, the system should support storing multiple feeding schedule entries.

**Validates: Requirements 11.2**

### Property 44: Schedule Meal Time Classification

*For any* feeding schedule entry, the system should associate it with a meal time classification from [breakfast, lunch, dinner, snack].

**Validates: Requirements 11.3**

### Property 45: Schedules Ordered by Time

*For any* set of feeding schedule entries for a pet, when displaying them, the system should order them by time of day.

**Validates: Requirements 11.4**

### Property 46: Portion Size Units Support

*For any* feeding schedule entry, the system should allow specifying portion size in either cups or grams.

**Validates: Requirements 11.6**

### Property 47: Diet History Display

*For any* pet, when viewing diet history, the system should display all nutrition plans with status 'completed' or 'active'.

**Validates: Requirements 12.1**

### Property 48: Week Calculation for Plans

*For any* nutrition plan with startDate and duration, the system should calculate and display weeks completed as: Math.floor(elapsedDays / 7) and weeks remaining as: Math.ceil((duration - elapsedDays) / 7).

**Validates: Requirements 12.3**

### Property 49: Meal History Display Fields

*For any* meal completion history, the system should display timestamp and calories for each meal event.

**Validates: Requirements 12.4**

### Property 50: Recent History Limit

*For any* meal history for a pet, when viewing recent history, the system should show the most recent 10 meal events by default.

**Validates: Requirements 12.5**

### Property 51: History Filtering

*For any* meal or plan history, when applying filters (date range, meal type, or plan status), the system should return only items matching the filter criteria.

**Validates: Requirements 12.6**

### Property 52: Premium Feature Activation

*For any* user who subscribes to premium, the system should activate premium features (unlimited pets).

**Validates: Requirements 13.3, 13.4**

### Property 53: Subscription Data Storage

*For any* user subscription, the system should track subscriptionType, subscriptionExpiry, and store them in the user document.

**Validates: Requirements 13.6**

### Property 54: Data Persistence

*For any* pet profile, meal event, or nutrition plan creation or update, the system should persist the changes to MongoDB.

**Validates: Requirements 14.1**

### Property 55: User Data Association

*For any* pet profile, meal event, or nutrition plan, the system should associate it with the correct user via userId or petId references.

**Validates: Requirements 14.2**

### Property 56: Cross-Device Data Access

*For any* user, when logging in from a different device, the system should provide access to all associated pet data (pets, meals, plans).

**Validates: Requirements 14.3**

### Property 57: Missing Required Fields Error

*For any* form submission with missing required fields, the system should return an error message identifying which fields are missing.

**Validates: Requirements 15.1**

### Property 58: Non-Numeric Input Validation

*For any* numeric field (age, weight, portion size, calories), when a non-numeric value is entered, the system should return an error message requesting a valid number.

**Validates: Requirements 15.3**

### Property 59: Invalid Animal Type Error

*For any* animal type not in [dog, cat, bird, fish], when creating or updating a pet, the system should return an error message listing valid animal types.

**Validates: Requirements 15.4**

### Property 60: Database Error Handling

*For any* database operation failure, the system should return a user-friendly error message to the client and log technical details for debugging.

**Validates: Requirements 15.5**

### Property 61: Onboarding Completion Creates Profile

*For any* valid onboarding data (name, animal type, age, weight), when a pet owner completes onboarding, the system should create the pet profile and set it as the active profile.

**Validates: Requirements 16.3, 16.6**

### Property 62: Loading Indicator Display

*For any* data loading operation, the system should display a loading indicator while the operation is in progress.

**Validates: Requirements 17.3**


### Property-Based Testing Implementation

Each correctness property must be implemented as a property-based test using the fast-check library. The tests should be configured to run a minimum of 100 iterations to ensure comprehensive coverage through randomization.

**Example Property Test Implementation:**

```javascript
// Feature: boompets-nutrition-app, Property 11: Daily Calorie Calculation Formula
const fc = require('fast-check');

describe('Nutrition Calculator Properties', () => {
  it('should calculate daily calories using correct formula for any weight and activity level', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0.1, max: 100 }), // weight in kg
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
});
```

**Example Unit Test for Edge Cases:**

```javascript
describe('Pet Profile Validation', () => {
  it('should accept dog as valid animal type', async () => {
    const petData = {
      userId: testUserId,
      name: 'Cooper',
      animalType: 'dog',
      age: 3,
      weight: 25
    };
    
    const response = await request(app)
      .post('/api/pets')
      .send(petData)
      .expect(201);
    
    expect(response.body.animalType).toBe('dog');
  });
  
  it('should accept cat as valid animal type', async () => {
    const petData = {
      userId: testUserId,
      name: 'Whiskers',
      animalType: 'cat',
      age: 2,
      weight: 4
    };
    
    const response = await request(app)
      .post('/api/pets')
      .send(petData)
      .expect(201);
    
    expect(response.body.animalType).toBe('cat');
  });
  
  it('should reject dragon as invalid animal type', async () => {
    const petData = {
      userId: testUserId,
      name: 'Smaug',
      animalType: 'dragon',
      age: 100,
      weight: 5000
    };
    
    const response = await request(app)
      .post('/api/pets')
      .send(petData)
      .expect(400);
    
    expect(response.body.error).toContain('animal type');
  });
});
```

### Test Coverage Requirements

**Critical Path Coverage (80% minimum):**
- Authentication flows (registration, login, token validation)
- Pet profile CRUD operations
- Nutrition calculations (calories, portions, hydration)
- Meal recommendation generation and filtering
- Nutrition plan management
- Meal tracking and history
- Data persistence and retrieval

**Property Test Distribution:**
- Calculation algorithms: Properties 11-17 (7 properties)
- Data validation: Properties 4, 9, 57-59 (5 properties)
- CRUD operations: Properties 5-10, 23-25, 29-32, 42-46, 54-56 (23 properties)
- Business logic: Properties 18-22, 26-28, 33-41, 47-53, 60-62 (27 properties)

**Unit Test Focus Areas:**
- Specific animal type validation (dog, cat, bird, fish)
- Specific activity level multipliers (1.2, 1.4, 1.6)
- Specific meal time classifications (breakfast, lunch, dinner, snack)
- Specific plan status values (active, completed, paused)
- Expired token handling
- Free tier limit (2 pets)
- Onboarding flow
- API timeout handling

### Integration Testing

**API Integration Tests:**
- End-to-end user registration → pet creation → meal recommendation flow
- Pet profile update → nutrition recalculation → plan update flow
- Meal logging → daily calorie tracking → history display flow
- Multi-pet management → profile switching → data isolation verification

**Database Integration Tests:**
- MongoDB connection and reconnection handling
- Transaction rollback on errors
- Index performance for common queries
- Data consistency across collections

### Performance Testing

**Response Time Validation:**
- Authentication endpoints: < 2 seconds
- Pet CRUD operations: < 1 second
- Nutrition calculations: < 100 milliseconds
- Meal recommendations: < 3 seconds
- Meal status updates: < 500 milliseconds

**Load Testing:**
- Concurrent user authentication: 100 users/second
- Concurrent pet profile reads: 500 requests/second
- Concurrent meal logging: 200 requests/second
- Database query optimization for 10,000+ pets per user

### Test Data Generation

**Property Test Generators:**

```javascript
// Pet profile generator
const petProfileArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  animalType: fc.constantFrom('dog', 'cat', 'bird', 'fish'),
  breed: fc.string({ minLength: 1, maxLength: 50 }),
  age: fc.float({ min: 0.1, max: 30 }),
  weight: fc.float({ min: 0.1, max: 200 }),
  activityLevel: fc.constantFrom('low', 'moderate', 'high'),
  allergies: fc.array(fc.string(), { maxLength: 10 }),
  healthConditions: fc.array(fc.string(), { maxLength: 10 })
});

// Meal generator
const mealArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }),
  type: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ maxLength: 500 }),
  ingredients: fc.array(fc.string(), { minLength: 1, maxLength: 20 }),
  portionSize: fc.integer({ min: 1, max: 2000 }),
  calories: fc.integer({ min: 1, max: 5000 }),
  mealTime: fc.constantFrom('breakfast', 'lunch', 'dinner', 'snack')
});

// Nutrition plan generator
const nutritionPlanArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ maxLength: 500 }),
  duration: fc.integer({ min: 1, max: 365 }),
  meals: fc.array(mealArb, { minLength: 1, maxLength: 10 }),
  goals: fc.array(fc.string(), { maxLength: 10 })
});
```

### Continuous Integration

**CI Pipeline:**
1. Run linting and code formatting checks
2. Run unit tests with coverage reporting
3. Run property-based tests (100 iterations each)
4. Run integration tests against test database
5. Run API contract tests
6. Generate coverage report (fail if < 80% for critical paths)
7. Run security vulnerability scanning
8. Build and deploy to staging environment

**Test Execution Time Targets:**
- Unit tests: < 2 minutes
- Property tests: < 5 minutes
- Integration tests: < 3 minutes
- Total CI pipeline: < 15 minutes

## UI Component Hierarchy

### Screen Component Structure

```
App
├── PetProvider (Context)
│   └── AuthProvider (Context)
│       └── NavigationContainer
│           └── Stack Navigator
│               ├── OnboardingScreen
│               │   ├── ProgressBar
│               │   ├── PhotoUpload
│               │   ├── TextInput (name)
│               │   ├── AnimalTypeSelector
│               │   ├── TextInput (breed)
│               │   ├── TextInput (age)
│               │   ├── TextInput (weight)
│               │   └── ContinueButton
│               │
│               └── Main Tabs
│                   ├── HomeScreen
│                   │   ├── Header
│                   │   ├── PetCard
│                   │   │   ├── Avatar
│                   │   │   ├── PetInfo
│                   │   │   └── EditButton
│                   │   ├── HealthSection
│                   │   │   ├── AllergyTags
│                   │   │   └── AddAllergyButton
│                   │   ├── EnvironmentSection
│                   │   │   ├── ClimateDisplay
│                   │   │   └── ActivityDisplay
│                   │   └── FeedingPlanSection
│                   │       └── MealCards
│                   │
│                   ├── DietScreen
│                   │   ├── Header
│                   │   ├── TabSelector
│                   │   ├── ActivePlanCard
│                   │   │   ├── PlanImage
│                   │   │   ├── PlanInfo
│                   │   │   └── ProgressBar
│                   │   ├── RecommendedPlans
│                   │   │   └── PlanCards
│                   │   └── RecentHistory
│                   │       └── HistoryItems
│                   │
│                   ├── CalculatorScreen
│                   │   ├── Header
│                   │   ├── IconDisplay
│                   │   ├── WeightInput
│                   │   ├── WeightSlider
│                   │   ├── ResultCard
│                   │   │   ├── PortionDisplay
│                   │   │   └── MealBreakdown
│                   │   ├── StatsRow
│                   │   │   ├── CalorieCard
│                   │   │   └── HydrationCard
│                   │   └── SaveButton
│                   │
│                   └── ProfileScreen
│                       ├── Header
│                       ├── ProfileCard
│                       │   ├── Avatar
│                       │   ├── PetInfo
│                       │   └── EditButton
│                       ├── HealthSection
│                       ├── EnvironmentSection
│                       └── FeedingPlanSection
│
└── NutritionScreen (Modal)
    ├── Header
    ├── PlanHeader
    │   ├── Avatar
    │   ├── PlanTitle
    │   └── Badge
    ├── MealRecommendations
    │   └── MealCards
    │       ├── MealImage
    │       ├── MealBadge
    │       ├── MealInfo
    │       ├── Ingredients
    │       ├── SelectButton
    │       └── FavoriteButton
    ├── SaveButton
    └── ResourcesSection
        └── ResourceLinks
```

### Reusable Components

**PetCard Component**
- Props: `{ pet, onEdit }`
- Displays: Avatar, name, breed, age, weight
- Actions: Edit button triggers onEdit callback

**MealCard Component**
- Props: `{ meal, onSelect, onFavorite }`
- Displays: Meal image, name, type, description, ingredients
- Actions: Select and favorite buttons

**StatCard Component**
- Props: `{ icon, label, value, unit }`
- Displays: Icon, label, value with unit
- Used for: Calories, hydration, portion size displays

**ProgressBar Component**
- Props: `{ progress, color }`
- Displays: Horizontal bar with fill percentage
- Used for: Plan progress, onboarding steps

**TagList Component**
- Props: `{ tags, onAdd, onRemove }`
- Displays: List of tags with remove buttons
- Actions: Add new tag, remove existing tags
- Used for: Allergies, health conditions, goals

## Deployment and Infrastructure

### Development Environment

**Local Development Setup:**
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Configure MongoDB URI and JWT secret
npm run dev

# Frontend
npm install
npm start
# Expo will start and provide QR code for mobile testing
```

**Environment Variables:**
- Development: Local MongoDB, short-lived tokens, verbose logging
- Staging: Cloud MongoDB, standard tokens, info logging
- Production: Cloud MongoDB with replicas, long-lived tokens, error logging only

### Production Deployment

**Backend Deployment (Node.js):**
- Platform: Heroku, AWS Elastic Beanstalk, or DigitalOcean App Platform
- Configuration:
  - Node.js version: 18.x or higher
  - MongoDB Atlas connection with connection pooling
  - Environment variables via platform secrets
  - Health check endpoint: GET /health
  - Auto-scaling based on CPU/memory usage

**Frontend Deployment (React Native):**
- Build: Expo EAS Build for iOS and Android
- Distribution: App Store and Google Play Store
- Over-the-air updates: Expo Updates for non-native changes
- API endpoint configuration via app.json

**Database (MongoDB):**
- MongoDB Atlas M10 cluster (minimum for production)
- Replica set with 3 nodes for high availability
- Automated backups every 24 hours
- Point-in-time recovery enabled
- Connection string with retry logic

### Monitoring and Logging

**Application Monitoring:**
- Error tracking: Sentry for backend and frontend errors
- Performance monitoring: New Relic or Datadog
- Uptime monitoring: Pingdom or UptimeRobot
- API analytics: Custom dashboard with request counts, response times, error rates

**Logging Strategy:**
- Structured JSON logs for all requests
- Log levels: ERROR, WARN, INFO, DEBUG
- Log aggregation: CloudWatch, Papertrail, or Loggly
- Retention: 30 days for all logs, 90 days for errors

**Alerts:**
- Error rate > 5%: Immediate alert
- Response time > 2 seconds: Warning alert
- Database connection failures: Immediate alert
- Disk space > 80%: Warning alert
- Failed authentication attempts > 100/hour: Security alert

### Backup and Recovery

**Database Backups:**
- Automated daily backups via MongoDB Atlas
- Manual backup before major deployments
- Backup retention: 7 days for daily, 4 weeks for weekly
- Recovery time objective (RTO): 1 hour
- Recovery point objective (RPO): 24 hours

**Disaster Recovery Plan:**
1. Detect outage via monitoring alerts
2. Assess impact and root cause
3. Switch to backup database if needed
4. Restore from latest backup
5. Verify data integrity
6. Resume service
7. Post-mortem analysis

### Security Hardening

**Production Security Checklist:**
- [ ] HTTPS enforced for all API endpoints
- [ ] JWT secrets rotated and stored in secure vault
- [ ] Database credentials rotated quarterly
- [ ] Rate limiting enabled on all endpoints
- [ ] CORS configured with specific origins
- [ ] Input validation on all user inputs
- [ ] SQL/NoSQL injection prevention verified
- [ ] Dependency vulnerability scanning automated
- [ ] Security headers configured (HSTS, CSP, X-Frame-Options)
- [ ] API authentication required for all protected routes
- [ ] User data encrypted at rest
- [ ] Audit logging for sensitive operations
- [ ] Regular security penetration testing

## Future Enhancements

### Phase 2 Features

**Advanced AI Recommendations:**
- Integration with OpenAI GPT-4 for natural language meal descriptions
- Image recognition for food identification via camera
- Personalized meal plans based on historical preferences
- Seasonal ingredient recommendations

**Social Features:**
- Share pet profiles and meal plans with other users
- Community meal ratings and reviews
- Veterinarian consultation integration
- Pet health tracking and vet appointment reminders

**Analytics and Insights:**
- Weight tracking over time with trend analysis
- Nutrition goal progress visualization
- Meal variety analysis
- Cost tracking for pet food expenses

**Integration Capabilities:**
- Smart pet feeder integration (automatic portion dispensing)
- Wearable device integration for activity tracking
- Pet food delivery service integration
- Calendar integration for feeding reminders

### Technical Debt and Improvements

**Performance Optimizations:**
- Implement Redis caching for frequently accessed data
- Add database query result caching
- Optimize image loading with lazy loading and compression
- Implement pagination for large data sets

**Code Quality:**
- Increase test coverage to 90%
- Add end-to-end testing with Detox
- Implement automated accessibility testing
- Add TypeScript for type safety

**Infrastructure:**
- Implement blue-green deployment strategy
- Add automated rollback on deployment failures
- Implement feature flags for gradual rollouts
- Add A/B testing framework

## Conclusion

The BoomPets nutrition app design provides a comprehensive, scalable architecture for personalized pet nutrition management. The system leverages React Native for cross-platform mobile development, Node.js/Express for a robust backend API, and MongoDB for flexible data storage.

Key design strengths:
- Clear separation of concerns with modular component architecture
- Comprehensive error handling and validation at all layers
- Security-first approach with JWT authentication and input validation
- Performance-optimized calculations with sub-second response times
- Dual testing strategy combining unit tests and property-based tests
- Scalable infrastructure supporting multiple pets per user

The correctness properties defined in this document provide a formal specification for system behavior, enabling comprehensive automated testing and verification. Each property maps directly to acceptance criteria from the requirements document, ensuring complete coverage of functional requirements.

This design serves as the foundation for implementation, providing clear specifications for developers, testers, and stakeholders to build a reliable, maintainable, and user-friendly pet nutrition application.
