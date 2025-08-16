const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminMiddleware = require('../middleware/adminMiddleware');
const reportController = require('../controllers/reportController');
const validate = require('../utils/validate');
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const bcrypt = require('bcryptjs');
const asyncHandler = require("../middleware/asyncHandler");

router.post('/register', asyncHandler(async (req, res) => {
    const { fullName, phone, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Admin already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const admin = new User({ fullName, phone, email, passwordHash, role: 'admin' });
    await admin.save();

    res.json({ message: 'Admin created successfully', admin });

}));

router.post('/login', authController.adminLogin);

// Get all users
router.get('/users', adminMiddleware, asyncHandler(async (req, res) => {
    const users = await User.find().select('-passwordHash');
    res.json(users);
}));

// Get all artisans (optional filter)
router.get('/artisans', adminMiddleware, validate.validateArtisanFilters, asyncHandler(async (req, res) => {
    const { status, tradeType, lat, lng, radius } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (tradeType) filters.tradeType = tradeType;

    // If lat/lng provided, use aggregation with $geoNear
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const radiusInKm = radius ? parseFloat(radius) : 20; // default 20km
      const radiusInMeters = radiusInKm * 1000;

      if ([latitude, longitude].some(isNaN)) {
        return res.status(400).json({ message: 'lat and lng must be valid numbers' });
      }

      const artisans = await Artisan.aggregate([
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [longitude, latitude] },
            distanceField: 'distance',
            maxDistance: radiusInMeters,
            spherical: true,
            query: filters, // status/tradeType filters applied here
          }
        },
        { $project: { passwordHash: 0 } },
        { $sort: { distance: 1 } }
      ]);

      const response = artisans.map(a => ({
        ...a,
        distance: a.distance / 1000 // convert meters to km
      }));

      return res.json(response);
    }

    // If no lat/lng, fallback to normal query
    const artisans = await Artisan.find(filters).select('-passwordHash');
    res.json(artisans);
}));


// Approve or suspend artisan
router.patch('/artisans/:id/status', adminMiddleware, asyncHandler(async (req, res) => {
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
}));

// Reports
router.get('/reports', adminMiddleware, reportController.getReports);
router.patch('/reports/:id/status', adminMiddleware, reportController.updateReportStatus);
router.delete('/reports/:id', adminMiddleware, reportController.deleteReport);
router.patch('/reports/:id/action', adminMiddleware, validate.validateSuspendBody, reportController.takeActionOnReport);
module.exports = router;
 