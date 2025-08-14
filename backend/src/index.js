const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const userRoute = require('./routes/user');
const artisanRoute = require('./routes/artisan');
const reviewRoute = require('./routes/review')
const authMiddleware = require('./middleware/authMiddleware');
const roleMiddleware = require('./middleware/roleMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to DB
connectDB();

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoute);
app.use('/artisan', artisanRoute);
app.use('/review', reviewRoute);


// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FixNear API is running ✅' });
});

app.get('/api/test-protected', authMiddleware, roleMiddleware('user', 'artisan'), (req, res) => {
  res.json({ message: `Hello ${req.user.role} with ID ${req.user.id}, you are authorized!` });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
