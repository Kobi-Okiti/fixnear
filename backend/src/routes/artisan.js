const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Artisan = require("../models/Artisan");
const roleMiddleware = require("../middleware/roleMiddleware");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const asyncHandler = require("../middleware/asyncHandler");

// GET /artisan?trade=&lat=&lng= — search nearby artisans by trade and location
router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { trade, lat, lng, radius } = req.query;

    if (!trade || !lat || !lng) {
      return res
        .status(400)
        .json({ message: "trade, lat, and lng query parameters are required" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInKm = radius ? parseFloat(radius) : 10;

    if ([latitude, longitude, radiusInKm].some(isNaN)) {
      return res
        .status(400)
        .json({ message: "lat, lng, and radius must be numbers" });
    }

    // MongoDB expects distance in meters
    const radiusInMeters = radiusInKm * 1000;

    // Use aggregate with $geoNear
    const nearbyArtisans = await Artisan.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distance", // will add distance in meters
          maxDistance: radiusInMeters,
          spherical: true,
          query: { tradeType: trade, status: "approved" },
        },
      },
      { $sort: { distance: 1 } }, // closest first
    ]);

    // Convert distance to km for frontend
    const response = nearbyArtisans.map((artisan) => ({
      ...artisan,
      distance: artisan.distance / 1000, // meters → km
    }));

    res.json(response);
  })
);

// GET /artisan/emergency to return 3 nearest available artisans
router.get(
  "/emergency",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ message: "lat and lng query parameters are required" });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res
        .status(400)
        .json({ message: "lat and lng must be valid numbers" });
    }

    const maxDistanceInMeters = 20000; // 20 km

    const nearbyEmergencyArtisans = await Artisan.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distance",
          maxDistance: maxDistanceInMeters,
          spherical: true,
          query: { isAvailable: true, status: "approved" },
        },
      },
      { $sort: { distance: 1 } },
      { $limit: 3 },
    ]);

    // Convert distance to km
    const response = nearbyEmergencyArtisans.map((artisan) => ({
      ...artisan,
      distance: artisan.distance / 1000,
    }));

    res.json(response);
  })
);

// GET /artisan/profile — Get logged-in artisan profile
router.get(
  "/profile",
  authMiddleware,
  asyncHandler(async (req, res) => {
    // Ensure only artisans can access
    if (req.user.role !== "artisan") {
      return res.status(403).json({ message: "Access denied" });
    }

    const artisan = await Artisan.findById(req.user.id).select("-passwordHash");
    if (!artisan) {
      return res.status(404).json({ message: "Artisan not found" });
    }

    res.json(artisan);
  })
);

// PATCH /me — Artisan profile update
router.patch(
  "/me",
  authMiddleware,
  roleMiddleware("artisan"),
  asyncHandler(async (req, res) => {
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
        isAvailable,
      } = req.body;

      if (fullName) updates.fullName = fullName;
      if (phone) updates.phone = phone;
      if (email) updates.email = email;
      if (tradeType) updates.tradeType = tradeType;
      if (profilePhoto) updates.profilePhoto = profilePhoto;

      if (documents && (documents.idCardUrl || documents.skillPhotoUrl)) {
        updates.documents = {};
        if (documents.idCardUrl)
          updates.documents.idCardUrl = documents.idCardUrl;
        if (documents.skillPhotoUrl)
          updates.documents.skillPhotoUrl = documents.skillPhotoUrl;
      }

      if (
        location &&
        location.lat !== undefined &&
        location.lng !== undefined
      ) {
        updates.location = {
          type: "Point",
          coordinates: [location.lng, location.lat],
        };
      }

      if (typeof isAvailable === "boolean") updates.isAvailable = isAvailable;

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
  }
));

// GET /artisan/:id — get artisan profile by ID (public for logged-in users)
router.get("/:id", authMiddleware, roleMiddleware('user', 'admin'), asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid artisan ID" });
    }

    const artisan = await Artisan.findById(req.params.id)
      .select("-passwordHash -__v")
      .populate({
        path: "reviews",
        populate: { path: "user", select: "fullName" },
        options: { sort: { createdAt: -1 } },
      });

    if (!artisan) {
      return res.status(404).json({ message: "Artisan not found" });
    }

    res.json(artisan);
}));

module.exports = router;
