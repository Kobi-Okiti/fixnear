// routes/user.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const roleMiddleware = require('../middleware/roleMiddleware');

// GET /user/profile — protected route
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /me — User profile update
router.patch('/me', authMiddleware, roleMiddleware('user'), async (req, res) => {
  try {
    const updates = {};
    const { fullName, phone, email, location, password } = req.body;

    if (fullName) updates.fullName = fullName;
    if (phone) updates.phone = phone;
    if (email) updates.email = email;
    if (location) updates.location = location;

    if (password) {
      updates.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, { new: true });

    res.json(updatedUser);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
