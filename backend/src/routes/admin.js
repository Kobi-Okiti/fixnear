const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminMiddleware = require('../middleware/adminMiddleware');
const reportController = require('../controllers/reportController');
const validate = require('../utils/validate');
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const bcrypt = require('bcryptjs');

router.post('/register', async (req, res) => {
  try {
    const { fullName, phone, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Admin already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = new User({ fullName, phone, email, passwordHash, role: 'admin' });
    await admin.save();

    res.json({ message: 'Admin created successfully', admin });
  } catch (err) {
    console.error('Admin register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', authController.adminLogin);

// Get all users
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all artisans (optional filter)
router.get('/artisans', adminMiddleware, validate.validateArtisanFilters, async (req, res) => {
  try {
    const query = {};

    // Optional filters
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.tradeType) {
      query.tradeType = req.query.tradeType;
    }
    if (req.query.lat && req.query.lng) {
      query['location.lat'] = parseFloat(req.query.lat);
      query['location.lng'] = parseFloat(req.query.lng);
    }

    const artisans = await Artisan.find(query).select('-passwordHash');
    res.json(artisans);
  } catch (error) {
    console.error('Error fetching artisans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve or suspend artisan
router.patch('/artisans/:id/status', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const artisan = await Artisan.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-passwordHash');

    if (!artisan) {
      return res.status(404).json({ message: 'Artisan not found' });
    }

    res.json(artisan);
  } catch (error) {
    console.error('Error updating artisan status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reports
router.get('/reports', adminMiddleware, reportController.getReports);
router.patch('/reports/:id/status', adminMiddleware, reportController.updateReportStatus);
router.delete('/reports/:id', adminMiddleware, reportController.deleteReport);
router.patch('/reports/:id/action', adminMiddleware, validate.validateSuspendBody, reportController.takeActionOnReport);
module.exports = router;
 