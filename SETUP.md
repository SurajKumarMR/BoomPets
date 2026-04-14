# BoomPets Nutrition App - Setup Guide

## ✅ Installation Complete!

MongoDB and the backend server are now running successfully.

## 🚀 Quick Start

### Backend Server (Already Running)
The backend is currently running on **http://localhost:3000**

To manage the backend server:
```bash
# Stop the server (if needed)
# Press Ctrl+C in the terminal where it's running

# Start the server
cd backend
npm start
```

### Frontend App (React Native/Expo)

1. **Install dependencies** (if not already done):
```bash
npm install
```

2. **Start the Expo development server**:
```bash
npm start
```

3. **Run on your device**:
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press `a` for Android emulator
   - Or press `i` for iOS simulator

## 📋 Environment Configuration

### Backend (.env)
Located at `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/boompets
JWT_SECRET=your-secret-key-change-this-in-production
PORT=3000
NODE_ENV=development
```

### Frontend
Update `src/services/api.js` if needed to point to your backend:
```javascript
const API_BASE_URL = 'http://localhost:3000';
```

## 🧪 Running Tests

### All Tests
```bash
npm test
```

### Backend Tests Only
```bash
cd backend
npm test
```

### Frontend Tests Only
```bash
npm test -- --testPathPattern=src/
```

## 📊 Current Status

✅ MongoDB 8.0.20 installed and running
✅ Backend server running on port 3000
✅ All 240 tests passing
✅ Database models created
✅ API endpoints implemented
✅ Frontend screens implemented

## 🗄️ MongoDB Management

### Check MongoDB Status
```bash
sudo systemctl status mongod
```

### Start/Stop MongoDB
```bash
sudo systemctl start mongod
sudo systemctl stop mongod
sudo systemctl restart mongod
```

### Connect to MongoDB Shell
```bash
mongosh
```

### View BoomPets Database
```bash
mongosh
use boompets
show collections
db.users.find()
db.pets.find()
```

## 🔧 Troubleshooting

### Backend won't start
1. Check if MongoDB is running: `sudo systemctl status mongod`
2. Check if port 3000 is available: `lsof -i :3000`
3. Check backend logs for errors

### Frontend can't connect to backend
1. Ensure backend is running on port 3000
2. Check API_BASE_URL in `src/services/api.js`
3. For physical device testing, use your computer's IP address instead of localhost

### MongoDB connection issues
1. Restart MongoDB: `sudo systemctl restart mongod`
2. Check MongoDB logs: `sudo journalctl -u mongod -n 50`
3. Verify connection string in `backend/.env`

## 📱 Features Implemented

- ✅ User authentication (register/login)
- ✅ Pet profile management
- ✅ Nutrition calculator
- ✅ Meal recommendations
- ✅ Feeding schedule
- ✅ Health & allergy tracking
- ✅ Multi-pet support
- ✅ Meal tracking and history
- ✅ Nutrition plans

## 🎯 Next Steps

1. **Test the API**: Use Postman or curl to test endpoints
2. **Run the mobile app**: Start Expo and test on your device
3. **Customize**: Update JWT secret and other environment variables
4. **Deploy**: Prepare for production deployment

## 📚 API Documentation

Base URL: `http://localhost:3000/api`

### Authentication
- POST `/users/register` - Register new user
- POST `/users/login` - Login user

### Pets
- POST `/pets` - Create pet profile
- GET `/pets/:id` - Get pet by ID
- PUT `/pets/:id` - Update pet
- GET `/pets/user/:userId` - Get all user's pets

### Meals
- POST `/meals` - Log a meal
- GET `/meals/pet/:petId` - Get pet's meals
- PUT `/meals/:id` - Update meal
- GET `/meals/pet/:petId/stats` - Get daily stats

### Nutrition
- POST `/nutrition/generate` - Generate meal recommendations
- GET `/nutrition/pet/:petId` - Get nutrition plans

## 🎉 You're All Set!

Your BoomPets Nutrition App is ready to use. Happy coding! 🐾
