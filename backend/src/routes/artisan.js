const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Artisan = require('../models/Artisan');
const roleMiddleware = require('../middleware/roleMiddleware');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');


// GET /artisan?trade=&lat=&lng= — search nearby artisans by trade and location
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { trade, lat, lng, radius } = req.query;

    if (!trade || !lat || !lng) {
      return res.status(400).json({ message: 'trade, lat, and lng query parameters are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInKm = radius ? parseFloat(radius) : 10;

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'lat and lng must be valid numbers' });
    }

    if (isNaN(radiusInKm)) {
      return res.status(400).json({ message: 'radius must be a valid number' });
    }

    // Fetch artisans by trade and approved status
    const artisans = await Artisan.find({ 
      tradeType: trade, 
      status: 'approved' 
    });

    console.log(`Found ${artisans.length} artisans for trade="${trade}" with status="approved"`);

    // Helper function to calculate distance between two points (lat, lng)
    const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of the earth in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const d = R * c; // Distance in km
      return d;
    };

    // Map artisans to include distance, filter by radius, then sort by distance ascending
    const nearbyArtisansWithDistance = artisans
      .map(artisan => {
        if (!artisan.location || artisan.location.lat === undefined || artisan.location.lng === undefined) {
          console.log(`Artisan ${artisan.fullName} has missing or invalid location data`);
          return null;
        }
        const distance = getDistanceFromLatLonInKm(latitude, longitude, artisan.location.lat, artisan.location.lng);
        console.log(`Artisan ${artisan.fullName} distance: ${distance.toFixed(2)} km`);
        return { artisan, distance };
      })
      .filter(item => item !== null && item.distance <= radiusInKm)
      .sort((a, b) => a.distance - b.distance);

    console.log(`Found ${nearbyArtisansWithDistance.length} artisans within ${radiusInKm} km radius`);

    // Prepare response: include distance in each artisan object
    const response = nearbyArtisansWithDistance.map(({ artisan, distance }) => ({
      ...artisan.toObject(),
      distance
    }));

    res.json(response);

  } catch (error) {
    console.error('Error fetching nearby artisans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /artisan/emergency to return 3 nearest available artisans
router.get('/emergency', authMiddleware, async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng query parameters are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'lat and lng must be valid numbers' });
    }

    // Fetch artisans who are available and approved
    const artisans = await Artisan.find({
      isAvailable: true,
      status: 'approved',
      location: { $exists: true }
    });

    // Distance calculation 
    const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Map artisans with distance and sort by closest
    const artisansWithDistance = artisans
      .map((artisan) => {
        const distance = getDistanceFromLatLonInKm(
          latitude,
          longitude,
          artisan.location.lat,
          artisan.location.lng
        );
        return { artisan, distance };
      })
      .filter(({ distance }) => distance <= 20) // Within 20km radius
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3); // Take top 3 nearest

    // Prepare response with distance
    const response = artisansWithDistance.map(({ artisan, distance }) => ({
      ...artisan.toObject(),
      distance,
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching emergency artisans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /artisan/profile — Get logged-in artisan profile
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

// GET /artisan/:id — get artisan profile by ID (public for logged-in users)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid artisan ID' });
    }
    const artisan = await Artisan.findById(req.params.id).select('-passwordHash');
    if (!artisan) {
      return res.status(404).json({ message: 'Artisan not found' });
    }
    res.json(artisan);
  } catch (error) {
    console.error('Error fetching artisan by ID:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
