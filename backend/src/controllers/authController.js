const User = require("../models/User");
const Artisan = require("../models/Artisan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../middleware/asyncHandler");
const axios = require("axios");

const JWT_SECRET = process.env.JWT_SECRET;

async function reverseGeocode(lat, lon) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=jsonv2`;
    const { data } = await axios.get(url, {
      headers: {
        "Accept-Language": "en",
        "User-Agent": "fixnear-dashboard",
      },
    });
    return data.address || "";
  } catch (err) {
    console.error("Reverse geocoding failed:", err.message);
    return "";
  }
}

// Register (User or Artisan)
exports.register = asyncHandler(async (req, res) => {
  const { fullName, phone, email, password, role, tradeType, location } =
    req.body;

  // Validate required fields
  if (!fullName || !phone || !email || !password || !role) {
    return res.status(400).json({ message: "Please fill all required fields" });
  }

  // Check if user or artisan already exists
  const existingAccount =
    role === "user"
      ? await User.findOne({ email })
      : await Artisan.findOne({ email });

  if (existingAccount) {
    return res.status(400).json({ message: "Email already registered" });
  }

  // Hash password for both roles
  const hashedPassword = await bcrypt.hash(password, 10);

  if (role === "user") {
    const user = new User({
      fullName,
      phone,
      email,
      passwordHash: hashedPassword,
      role: "user",
    });
    await user.save();
    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.status(201).json({ token, user });
  }

  if (role === "artisan") {
    if (!tradeType) {
      return res
        .status(400)
        .json({ message: "tradeType is required for artisan" });
    }

    let geoLocation = undefined;
    let readableAddress = "";

    if (location && location.lat !== undefined && location.lng !== undefined) {
      geoLocation = {
        type: "Point",
        coordinates: [location.lng, location.lat],
      };
      console.time("reverseGeocode");
      readableAddress = await reverseGeocode(location.lat, location.lng);
      console.timeEnd("reverseGeocode");
      console.log("Resolved address:", readableAddress);
    }

    const artisan = new Artisan({
      fullName,
      phone,
      email,
      passwordHash: hashedPassword,
      tradeType,
      role: "artisan",
      status: "pending",
      isAvailable: false,
      ...(geoLocation && { location: geoLocation }),
      ...(readableAddress && { readableAddress }),
    });

    await artisan.save();
    const token = jwt.sign({ id: artisan._id, role }, JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.status(201).json({ token, artisan });
  }

  return res.status(400).json({ message: "Invalid role" });
});

// Login (User or Artisan)
exports.login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Please provide email, password, and role" });
  }

  // Find account based on role
  const account =
    role === "user"
      ? await User.findOne({ email })
      : await Artisan.findOne({ email });

  if (!account) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, account.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Generate JWT
  const token = jwt.sign({ id: account._id, role }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.json({ token, [role]: account });
});

exports.adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  // Only check for admin accounts
  const admin = await User.findOne({ email, role: "admin" });
  if (!admin) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Generate JWT with admin role
  const token = jwt.sign({ id: admin._id, role: "admin" }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.json({ token, admin });
});
