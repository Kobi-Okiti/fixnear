const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user'], default: 'user' }, 
  location: {
    lat: Number,
    lng: Number
  },
  favoriteArtisans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artisan' }],
  emergencyHistory: [{ type: mongoose.Schema.Types.ObjectId }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
