const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const errorHandler = require('./middleware/errorHandler');

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boompets', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const petRoutes = require('./routes/pets');
const mealRoutes = require('./routes/meals');
const userRoutes = require('./routes/users');
const nutritionRoutes = require('./routes/nutrition');

app.use('/api/pets', petRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/users', userRoutes);
app.use('/api/nutrition', nutritionRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`BoomPets API running on port ${PORT}`);
});
