const mongoose = require("mongoose");

const artisanSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["artisan"], default: "artisan" },
    tradeType: { type: String, required: true },
    profilePhoto: String,
    documents: {
      idCardUrl: String,
      skillPhotoUrl: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    readableAddress: { 
      amenity: String,
      road: String,
      county: String,
      state: String,
      'ISO3166-2-lvl4': String,
      postcode: String,
      country: String,
      country_code: String,
    },
    isAvailable: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    isSuspended: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Create 2dsphere index for geospatial queries
artisanSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Artisan", artisanSchema);
