const User = require("../models/User");
const Artisan = require("../models/Artisan");
const Review = require("../models/Review");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../middleware/asyncHandler");

exports.register = asyncHandler(async (req, res) => {
  const { fullName, phone, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ message: "Admin already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = new User({
    fullName,
    phone,
    email,
    passwordHash,
    role: "admin",
  });
  await admin.save();

  res.json({ message: "Admin created successfully", admin });
});

exports.metrics = asyncHandler(async (req, res) => {
  const userCount = await User.countDocuments();
  const artisanCount = await Artisan.countDocuments();
  const reviewCount = await Review.countDocuments();

  const topCountries = await Artisan.aggregate([
    {
      $group: {
        _id: "$readableAddress.country",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const reviewsPerDay = await Review.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    users: { total: userCount },
    artisans: { total: artisanCount },
    reviews: { total: reviewCount },
    artisanCountries: topCountries.map((c) => ({
      country: c._id || "Unknown",
      count: c.count,
    })),
    reviewsPerDay: reviewsPerDay.map((r) => ({
      date: r._id,
      count: r.count,
    })),
    jobsPerDay: [], // Placeholder until jobs model is ready
  });
});

exports.users = asyncHandler(async (req, res) => {
  const users = await User.find().select("-passwordHash");
  res.json(users);
});

exports.artisans = asyncHandler(async (req, res) => {
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
      return res
        .status(400)
        .json({ message: "lat and lng must be valid numbers" });
    }

    const artisans = await Artisan.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distance",
          maxDistance: radiusInMeters,
          spherical: true,
          query: filters, // status/tradeType filters applied here
        },
      },
      { $project: { passwordHash: 0 } },
      { $sort: { distance: 1 } },
    ]);

    const response = artisans.map((a) => ({
      ...a,
      distance: a.distance / 1000, // convert meters to km
    }));

    return res.json(response);
  }

  // If no lat/lng, fallback to normal query
  const artisans = await Artisan.find(filters).select("-passwordHash");
  res.json(artisans);
});
