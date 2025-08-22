const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const adminMiddleware = require("../middleware/adminMiddleware");
const reportController = require("../controllers/reportController");
const adminController = require("../controllers/adminController");
const validate = require("../utils/validate");
const User = require("../models/User");
const Artisan = require("../models/Artisan");
const asyncHandler = require("../middleware/asyncHandler");

//  Admin registration
router.post("/register", adminController.register);

//  Admin login
router.post("/login", authController.adminLogin);

// Get platform metrics
router.get("/metrics", adminMiddleware, adminController.metrics);

// Get all users
router.get("/users", adminMiddleware, adminController.users);

// Suspend or unsuspend user directly
router.patch(
  "/users/:id/status",
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const { isSuspended } = req.body;

    if (typeof isSuspended !== "boolean") {
      return res
        .status(400)
        .json({ message: "isSuspended must be true or false" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended },
      { new: true }
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: `User has been ${
        isSuspended ? "suspended" : "unsuspended"
      } successfully`,
      user,
    });
  })
);

// Get all artisans (optional filter)
router.get(
  "/artisans",
  adminMiddleware,
  validate.validateArtisanFilters,
  adminController.artisans
);

// Approve or suspend artisan
router.patch(
  "/artisans/:id/status",
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!["approved", "suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const artisan = await Artisan.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-passwordHash");

    if (!artisan) {
      return res.status(404).json({ message: "Artisan not found" });
    }

    res.json(artisan);
  })
);

// Reports
router.get("/reports", adminMiddleware, reportController.getReports);

// Update report status (e.g., mark as reviewed)
router.patch(
  "/reports/:id/status",
  adminMiddleware,
  reportController.updateReportStatus
);

// Delete a report
router.delete("/reports/:id", adminMiddleware, reportController.deleteReport);

// Take action based on report - suspend/unsuspend user or artisan
router.patch(
  "/reports/:id/action",
  adminMiddleware,
  validate.validateSuspendBody,
  reportController.takeActionOnReport
);
module.exports = router;
