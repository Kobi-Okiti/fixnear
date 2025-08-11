const mongoose = require('mongoose');

const artisanSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['artisan'], default: 'artisan' }, 
  tradeType: { type: String, required: true },
  profilePhoto: String,
  documents: {
    idCardUrl: String,
    skillPhotoUrl: String
  },
  location: {
    lat: Number,
    lng: Number
  },
  isAvailable: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  reviews: [{ type: mongoose.Schema.Types.ObjectId }],
  status: { type: String, enum: ['pending', 'approved', 'suspended'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Artisan', artisanSchema);
