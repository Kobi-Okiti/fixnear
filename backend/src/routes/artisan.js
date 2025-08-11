const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Artisan = require('../models/Artisan');
const roleMiddleware = require('../middleware/roleMiddleware');

// GET /artisan/profile — Get logged-in artisan's profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // Ensure only artisans can access
    if (req.user.role !== 'artisan') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const artisan = await Artisan.findById(req.user.id).select('-passwordHash');
    if (!artisan) {
      return res.status(404).json({ message: 'Artisan not found' });
    }

    res.json(artisan);
  } catch (error) {
    console.error('Error fetching artisan profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// PATCH /me — Artisan profile update
router.patch('/me', authMiddleware, roleMiddleware('artisan'), async (req, res) => {
  try {
    const updates = {};
    const { 
      fullName, 
      phone, 
      email, 
      location,
      password, 
      tradeType, 
      profilePhoto, 
      documents,
      isAvailable 
    } = req.body;

    if (fullName) updates.fullName = fullName;
    if (phone) updates.phone = phone;
    if (email) updates.email = email;
    if (tradeType) updates.tradeType = tradeType;
    if (profilePhoto) updates.profilePhoto = profilePhoto;

    if (documents && (documents.idCardUrl || documents.skillPhotoUrl)) {
      updates.documents = {};
      if (documents.idCardUrl) updates.documents.idCardUrl = documents.idCardUrl;
      if (documents.skillPhotoUrl) updates.documents.skillPhotoUrl = documents.skillPhotoUrl;
    }

    if (location && (location.lat !== undefined && location.lng !== undefined)) {
      updates.location = {
        lat: location.lat,
        lng: location.lng
      };
    }

    if (typeof isAvailable === 'boolean') updates.isAvailable = isAvailable;

    if (password) {
      updates.passwordHash = await bcrypt.hash(password, 10);
    }

    updates.updatedAt = Date.now();

    const updatedArtisan = await Artisan.findByIdAndUpdate(
      req.user.id, 
      { $set: updates }, 
      { new: true }
    );

    res.json(updatedArtisan);

  } catch (err) {
    console.error('Update artisan error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
