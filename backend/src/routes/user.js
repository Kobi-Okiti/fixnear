// routes/user.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const roleMiddleware = require('../middleware/roleMiddleware');
const bcrypt = require('bcryptjs');
const reportController = require('../controllers/reportController');
const asyncHandler = require("../middleware/asyncHandler");

// GET /user/profile — protected route
router.get('/profile', authMiddleware, asyncHandler(async (req, res) => {

    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);

}));

// PATCH /me — User profile update
router.patch('/me', authMiddleware, roleMiddleware('user'), asyncHandler(async (req, res) => {
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
}));

router.post('/report', authMiddleware, roleMiddleware('user'), reportController.createReport);

module.exports = router;
