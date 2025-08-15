const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, 
  location: {
    lat: Number,
    lng: Number
  },
  isSuspended: { type: Boolean, default: false },
  favoriteArtisans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artisan' }],
  emergencyHistory: [{ type: mongoose.Schema.Types.ObjectId }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
