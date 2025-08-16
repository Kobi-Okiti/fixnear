const Report = require('../models/Report');
const User = require('../models/User');
const Artisan = require('../models/Artisan');
const asyncHandler = require("../middleware/asyncHandler");

//creates a new report
exports.createReport = asyncHandler(async (req, res) => {
    const { reportedArtisan, reason } = req.body;
    if (!reportedArtisan || !reason) {
      return res.status(400).json({ message: 'Artisan ID and reason are required' });
    }

    const report = await Report.create({
      reporter: req.user.id,
      reportedArtisan,
      reason,
      status: 'pending'
    });

    res.status(201).json(report);
});

// admin get all reports
exports.getReports = asyncHandler(async (req, res) => {
    const reports = await Report.find()
      .populate('reporter', 'fullName email')
      .populate('reportedArtisan', 'fullName tradeType');
    res.json(reports);

});

// updates report status with admin
exports.updateReportStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!['pending', 'reviewed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!report) return res.status(404).json({ message: 'Report not found' });

    res.json(report);
});

// delete report with admin
exports.deleteReport = asyncHandler(async (req, res) => {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json({ message: 'Report deleted successfully' });
});

// take action - suspend/unsuspend user or artisan
exports.takeActionOnReport = asyncHandler(async (req, res) => {
    const { targetType, action } = req.body; 
    // targetType: 'user' | 'artisan'
    // action: 'suspend' | 'unsuspend'

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    let targetModel;
    let targetId;

    if (targetType === 'user') {
      targetModel = User;
      targetId = report.reporter; // or reported user if that ever exists
    } else if (targetType === 'artisan') {
      targetModel = Artisan;
      targetId = report.reportedArtisan;
    } else {
      return res.status(400).json({ message: 'Invalid targetType' });
    }

    if (!targetId) {
      return res.status(400).json({ message: 'No target ID in this report' });
    }

    const updated = await targetModel.findByIdAndUpdate(
      targetId,
      { isSuspended: action === 'suspend' },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Target not found' });
    }

    res.json({
      message: `${targetType} ${action === 'suspend' ? 'suspended' : 'unsuspended'} successfully`,
      updated
    });
});


