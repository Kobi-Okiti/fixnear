// utils/validate.js
exports.validateSuspendBody = (req, res, next) => {
  const { targetType, action } = req.body;

  const validTargets = ['user', 'artisan'];
  const validActions = ['suspend', 'unsuspend'];

  if (!validTargets.includes(targetType)) {
    return res.status(400).json({ message: 'Invalid targetType. Must be user or artisan.' });
  }

  if (!validActions.includes(action)) {
    return res.status(400).json({ message: 'Invalid action. Must be suspend or unsuspend.' });
  }

  next();
};

exports.validateArtisanFilters = (req, res, next) => {
  const { lat, lng, status, tradeType } = req.query;

  // validate lat/lng if provided
  if (lat && isNaN(parseFloat(lat))) {
    return res.status(400).json({ message: 'lat must be a number' });
  }
  if (lng && isNaN(parseFloat(lng))) {
    return res.status(400).json({ message: 'lng must be a number' });
  }

  // validate status if provided
  if (status && !['pending', 'approved', 'suspended'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status filter' });
  }

  // validate tradeType if provided
  if (tradeType && typeof tradeType !== 'string') {
    return res.status(400).json({ message: 'tradeType must be a string' });
  }

  next();
};
