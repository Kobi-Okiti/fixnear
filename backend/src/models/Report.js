const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reportedArtisan: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan' }, 
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'reviewed'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
