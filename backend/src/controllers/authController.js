const User = require('../models/User');
const Artisan = require('../models/Artisan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Register (User or Artisan)
exports.register = async (req, res) => {
  try {
    const { fullName, phone, email, password, role, tradeType } = req.body;

    // Validate required fields
    if (!fullName || !phone || !email || !password || !role) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // Check if user or artisan already exists
    const existingAccount = role === 'user'
      ? await User.findOne({ email })
      : await Artisan.findOne({ email });

    if (existingAccount) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password for both roles
    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === 'user') {
      const user = new User({
        fullName,
        phone,
        email,
        passwordHash: hashedPassword,
        role: 'user'
      });
      await user.save();
      const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ token, user });
    }

    if (role === 'artisan') {
      if (!tradeType) {
        return res.status(400).json({ message: 'tradeType is required for artisan' });
      }
      const artisan = new Artisan({
        fullName,
        phone,
        email,
        passwordHash: hashedPassword,
        tradeType,
        role: 'artisan',
        status: 'pending',
        isAvailable: false
      });
      await artisan.save();
      const token = jwt.sign({ id: artisan._id, role }, JWT_SECRET, { expiresIn: '7d' });
      return res.status(201).json({ token, artisan });
    }

    return res.status(400).json({ message: 'Invalid role' });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Login (User or Artisan)
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please provide email, password, and role' });
    }

    // Find account based on role
    const account = role === 'user'
      ? await User.findOne({ email })
      : await Artisan.findOne({ email });

    if (!account) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, account.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: account._id, role }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({ token, [role]: account });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

