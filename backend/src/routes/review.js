const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const Review = require('../models/Review');
const Artisan = require('../models/Artisan');

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { artisanId, rating, comment } = req.body;
    const userId = req.user.id; 

    if (!artisanId || !rating) {
      return res.status(400).json({ message: 'artisanId and rating are required' });
    }

    // Create new review
    const review = new Review({
      artisan: artisanId,
      user: userId,
      rating,
      comment
    });
    await review.save();

    // Add review ID to artisan
    const artisan = await Artisan.findById(artisanId);
    if (!artisan) {
      return res.status(404).json({ message: 'Artisan not found' });
    }
    artisan.reviews.push(review._id);

    // Recalculate average rating + review count
    const reviews = await Review.find({ artisan: artisanId });
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    artisan.reviewCount = reviews.length;
    artisan.rating = totalRating / artisan.reviewCount;

    await artisan.save();

    res.status(201).json({
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET reviews for a specific artisan
router.get('/artisan/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const reviews = await Review.find({ artisan: id })
      .populate('user', 'fullName')  // get user name only
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching artisan reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
